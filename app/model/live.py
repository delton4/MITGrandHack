"""NeoTherm Model Pipeline — Live Camera Capture (stretch goal).

Captures frames from a USB thermal camera via OpenCV, runs YOLOv8-Pose
detection through the PoseDetector pipeline, and yields WebSocket-format
messages as an async generator.

Falls back gracefully when no camera is detected.

Usage::

    from app.model.alerting import AlertEngine
    from app.model.pipeline import PoseDetector
    from app.model.live import LiveCapture

    engine = AlertEngine()
    pipeline = PoseDetector()
    capture = LiveCapture(alert_engine=engine, pipeline=pipeline)

    async for msg in capture.capture():
        await websocket.send_json(msg)
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

import cv2
import numpy as np

from . import config

if TYPE_CHECKING:
    from .alerting import AlertEngine
    from .pipeline import PoseDetector

logger = logging.getLogger(__name__)

# Target processing rate (~2 FPS).  We sleep this long between processed
# frames to avoid saturating the CPU / WebSocket.
_TARGET_INTERVAL = 0.5  # seconds (= 2 FPS)


class LiveCapture:
    """Async generator that captures from a camera and yields WebSocket messages.

    Parameters
    ----------
    alert_engine : AlertEngine
        Stateful alert engine for outlier filtering, CPTD, and alert levels.
    pipeline : PoseDetector
        Pose detection pipeline for keypoint extraction and frame annotation.
    camera_index : int
        OpenCV VideoCapture device index (default 0).
    """

    def __init__(
        self,
        alert_engine: AlertEngine,
        pipeline: PoseDetector,
        camera_index: int = 0,
    ) -> None:
        self.alert_engine = alert_engine
        self.pipeline = pipeline
        self.camera_index = camera_index

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def capture(self, patient_id: str = "live"):
        """Async generator yielding dicts in the WebSocket message format.

        Parameters
        ----------
        patient_id : str
            Identifier for the live session (used for alert state tracking).

        Yields
        ------
        dict
            Message matching the WebSocket JSON schema defined in the spec.
        """
        cap = self._open_camera()
        if cap is None:
            logger.error(
                "No camera detected at index %d. Use replay mode instead.",
                self.camera_index,
            )
            yield self._error_message(patient_id, "No camera detected")
            return

        self.alert_engine.reset(patient_id)

        try:
            logger.info(
                "Live capture started on camera %d — processing at ~%.0f FPS",
                self.camera_index,
                1.0 / _TARGET_INTERVAL,
            )

            while True:
                ok, frame = cap.read()
                if not ok or frame is None:
                    logger.warning("Failed to read frame from camera, stopping")
                    break

                # --- Run pose detection ---
                detection = self.pipeline.detect(frame)

                # --- Extract temperatures ---
                # If a raw temperature matrix is available (radiometric camera),
                # we would use pipeline.extract_roi_temps().  For standard USB
                # cameras that output pseudocolor or visible video, we fall
                # back to placeholder values.
                temps = self._extract_temps(frame, detection)

                # --- Alert engine ---
                alert_result = self.alert_engine.process(
                    patient_id=patient_id,
                    core=temps["core"],
                    left_hand=temps["left_hand"],
                    right_hand=temps["right_hand"],
                    left_foot=temps["left_foot"],
                    right_foot=temps["right_foot"],
                )

                # --- Peripheral summary ---
                peripheral_temp = self._peripheral_summary(temps)

                # --- Build message ---
                now = datetime.now(timezone.utc)

                # Keypoints from detection
                keypoints = detection.get("keypoints", [])

                message = {
                    "timestamp": now.isoformat(),
                    "patient_id": patient_id,
                    "mode": "live",
                    "core_temp": temps["core"],
                    "peripheral_temp": peripheral_temp,
                    "cptd": alert_result["cptd"],
                    "zones": {
                        "core": temps["core"],
                        "left_hand": temps["left_hand"],
                        "right_hand": temps["right_hand"],
                        "left_foot": temps["left_foot"],
                        "right_foot": temps["right_foot"],
                    },
                    "alert": {
                        "level": alert_result["alert_level"],
                        "message": alert_result["alert_message"],
                        "cptd_threshold": config.CPTD_WARNING,
                        "consecutive_abnormal": alert_result["consecutive_abnormal"],
                    },
                    "frame_base64": detection.get("annotated_frame_base64"),
                    "keypoints": keypoints,
                }

                yield message

                # Throttle to target FPS
                await asyncio.sleep(_TARGET_INTERVAL)

        finally:
            cap.release()
            logger.info("Camera %d released", self.camera_index)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _open_camera(self) -> Optional[cv2.VideoCapture]:
        """Try to open the camera.  Returns VideoCapture or None on failure."""
        try:
            cap = cv2.VideoCapture(self.camera_index)
            if not cap.isOpened():
                cap.release()
                return None
            return cap
        except Exception:
            logger.debug(
                "Exception opening camera %d", self.camera_index, exc_info=True
            )
            return None

    def _extract_temps(
        self, frame: np.ndarray, detection: dict
    ) -> dict[str, Optional[float]]:
        """Extract zone temperatures from the frame.

        If the frame appears to be a raw radiometric temperature matrix
        (single-channel float), we extract real temperatures from ROIs.
        Otherwise, we return None placeholders — the pipeline still
        provides annotated visuals and keypoints for demo purposes.
        """
        # Check if frame looks like a raw temperature matrix:
        # - single channel (2D)
        # - float dtype
        # - values in a plausible temperature range
        if (
            frame.ndim == 2
            and frame.dtype in (np.float32, np.float64)
            and np.nanmin(frame) > 15.0
            and np.nanmax(frame) < 50.0
        ):
            rois = detection.get("rois")
            if rois is not None:
                return self.pipeline.extract_roi_temps(frame, rois)

        # No raw thermal data available — return None placeholders
        return {
            "core": None,
            "left_hand": None,
            "right_hand": None,
            "left_foot": None,
            "right_foot": None,
        }

    @staticmethod
    def _peripheral_summary(
        temps: dict[str, Optional[float]]
    ) -> Optional[float]:
        """Compute peripheral_temp: mean of hands, fallback to feet."""
        hands = [v for v in (temps["left_hand"], temps["right_hand"]) if v is not None]
        if hands:
            return round(sum(hands) / len(hands), 2)

        feet = [v for v in (temps["left_foot"], temps["right_foot"]) if v is not None]
        if feet:
            return round(sum(feet) / len(feet), 2)

        return None

    @staticmethod
    def _error_message(patient_id: str, error_text: str) -> dict:
        """Build an error/status message in the WebSocket format."""
        now = datetime.now(timezone.utc)
        return {
            "timestamp": now.isoformat(),
            "patient_id": patient_id,
            "mode": "live",
            "core_temp": None,
            "peripheral_temp": None,
            "cptd": None,
            "zones": {
                "core": None,
                "left_hand": None,
                "right_hand": None,
                "left_foot": None,
                "right_foot": None,
            },
            "alert": {
                "level": "normal",
                "message": error_text,
                "cptd_threshold": config.CPTD_WARNING,
                "consecutive_abnormal": 0,
            },
            "frame_base64": None,
            "keypoints": [],
        }
