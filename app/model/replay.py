"""NeoTherm Model Pipeline — CSV Replay Engine.

Replays Greek research CSV data as a timed async stream, matching the
WebSocket message format consumed by the frontend.  Optionally pairs
with the PoseDetector pipeline to produce annotated thermal frames.

Usage::

    from app.model.alerting import AlertEngine
    from app.model.replay import ReplayEngine

    engine = AlertEngine()
    replay = ReplayEngine(alert_engine=engine)

    async for msg in replay.replay("baby_40", speed=2.0):
        await websocket.send_json(msg)
"""

from __future__ import annotations

import asyncio
import base64
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import TYPE_CHECKING, Optional

import pandas as pd

from . import config

if TYPE_CHECKING:
    from .alerting import AlertEngine
    from .pipeline import PoseDetector

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# CSV column -> zone mapping
# ---------------------------------------------------------------------------
# Greek CSV columns:
#   timestamp, Zona1, codo_izq, codo_drc, rodilla_izq, rodilla_drc,
#   mano_izq, mano_drc, pie_izq, pie_drc
#
# Zone mapping:
#   Zona1        -> core (chest/shoulder region)
#   mano_izq     -> left_hand
#   mano_drc     -> right_hand
#   pie_izq      -> left_foot
#   pie_drc      -> right_foot

_CSV_ZONE_MAP = {
    "core": "Zona1",
    "left_hand": "mano_izq",
    "right_hand": "mano_drc",
    "left_foot": "pie_izq",
    "right_foot": "pie_drc",
}


def list_patients() -> list[str]:
    """Return a sorted list of available patient IDs by scanning the CSV directory.

    Each CSV is named like ``baby_40.csv``; the returned IDs are the
    stem names (``"baby_40"``).
    """
    csv_dir = config.GREEK_CSV_DIR
    if not csv_dir.is_dir():
        logger.warning("CSV directory not found: %s", csv_dir)
        return []
    return sorted(p.stem for p in csv_dir.glob("*.csv"))


class ReplayEngine:
    """Async generator that replays a Greek CSV file as a timed stream.

    Parameters
    ----------
    alert_engine : AlertEngine
        Stateful alert engine used for outlier filtering and CPTD computation.
    pipeline : PoseDetector | None
        Optional pose detection pipeline.  When provided *and* thermal images
        exist for the patient, annotated frames are included in the output.
    """

    def __init__(
        self,
        alert_engine: AlertEngine,
        pipeline: Optional[PoseDetector] = None,
    ) -> None:
        self.alert_engine = alert_engine
        self.pipeline = pipeline

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def replay(
        self, patient_id: str, speed: float = 1.0
    ):
        """Async generator yielding dicts in the WebSocket message format.

        Parameters
        ----------
        patient_id : str
            Stem name of the CSV file (e.g. ``"baby_40"``).
        speed : float
            Playback speed multiplier.  ``1.0`` = real-time, ``2.0`` = 2x, etc.

        Yields
        ------
        dict
            Message matching the WebSocket JSON schema defined in the spec.
        """
        csv_path = config.GREEK_CSV_DIR / f"{patient_id}.csv"
        if not csv_path.is_file():
            logger.error("CSV not found for patient %s: %s", patient_id, csv_path)
            return

        # Reset any prior alert state for this patient
        self.alert_engine.reset(patient_id)

        df = self._load_csv(csv_path)
        if df.empty:
            logger.warning("Empty CSV for patient %s", patient_id)
            return

        # Pre-load a static thermal image as a base64 data URI so every
        # yielded message includes a visible frame for the UI.
        static_frame_b64 = self._load_static_thermal_image()

        # Try to find thermal images for this patient (optional)
        thermal_images = self._find_thermal_images(patient_id)

        prev_ts = None

        for _idx, row in df.iterrows():
            ts = row["timestamp"]

            # --- Timing: sleep proportional to timestamp delta / speed ---
            if prev_ts is not None and pd.notna(ts) and pd.notna(prev_ts):
                delta_seconds = (ts - prev_ts).total_seconds()
                if delta_seconds > 0:
                    await asyncio.sleep(delta_seconds / max(speed, 0.01))
            elif prev_ts is None:
                # First row — use a small default interval
                await asyncio.sleep(config.REPLAY_INTERVAL_MS / 1000 / max(speed, 0.01))

            prev_ts = ts

            # --- Extract zone temperatures ---
            zones = self._extract_zones(row)

            # Skip rows where core AND all peripherals are null
            peripherals = [zones["left_hand"], zones["right_hand"],
                           zones["left_foot"], zones["right_foot"]]
            if zones["core"] is None and all(p is None for p in peripherals):
                continue

            # --- Alert engine (outlier filter + CPTD + alert level) ---
            alert_result = self.alert_engine.process(
                patient_id=patient_id,
                core=zones["core"],
                left_hand=zones["left_hand"],
                right_hand=zones["right_hand"],
                left_foot=zones["left_foot"],
                right_foot=zones["right_foot"],
            )

            # --- Peripheral temp summary (for top-level field) ---
            peripheral_temp = self._peripheral_summary(zones)

            # --- Annotated frame (pipeline) or static fallback ---
            frame_b64 = self._try_annotate_frame(thermal_images, patient_id)
            if frame_b64 is None:
                frame_b64 = static_frame_b64

            # --- Compute top-level CPTD from raw values (pre-filter) ---
            # The alert_result["cptd"] is post-filter; we also provide the
            # raw zone values in "zones" so the frontend can display them.
            cptd = alert_result["cptd"]

            # --- Build WebSocket message ---
            timestamp_str = ts.isoformat() if pd.notna(ts) else None

            message = {
                "timestamp": timestamp_str,
                "patient_id": patient_id,
                "mode": "replay",
                "core_temp": zones["core"],
                "peripheral_temp": peripheral_temp,
                "cptd": cptd,
                "zones": {
                    "core": zones["core"],
                    "left_hand": zones["left_hand"],
                    "right_hand": zones["right_hand"],
                    "left_foot": zones["left_foot"],
                    "right_foot": zones["right_foot"],
                },
                "alert": {
                    "level": alert_result["alert_level"],
                    "message": alert_result["alert_message"],
                    "cptd_threshold": config.CPTD_WARNING,
                    "consecutive_abnormal": alert_result["consecutive_abnormal"],
                },
                "frame_base64": frame_b64,
                "keypoints": [],
            }

            yield message

    async def demo_escalation(self, speed: float = 1.0):
        """Async generator yielding a simulated sepsis escalation sequence.

        Produces 40 data points over ~30 seconds (adjusted by *speed*) that
        ramp CPTD through all four alert levels:

        - Points  1-10: normal   (CPTD 0.8 -> 1.5)
        - Points 11-20: warning  (CPTD 2.0 -> 3.4)
        - Points 21-30: high     (CPTD 3.5 -> 4.9)
        - Points 31-40: critical (CPTD 5.0 -> 6.5)

        Core temperature stays near 36.5 C; peripheral temperature decreases
        to create the gradient.

        Yields dicts in the same WebSocket format as :meth:`replay`.
        """
        patient_id = "demo"
        self.alert_engine.reset(patient_id)

        static_frame_b64 = self._load_static_thermal_image()

        # Define the four phases: (start_cptd, end_cptd, count)
        phases = [
            (0.8, 1.5, 10),   # normal
            (2.0, 3.4, 10),   # warning
            (3.5, 4.9, 10),   # high
            (5.0, 6.5, 10),   # critical
        ]

        base_core = 36.5
        interval = 0.75 / max(speed, 0.01)
        now = datetime.now(tz=timezone.utc)
        point_index = 0

        for start_cptd, end_cptd, count in phases:
            for i in range(count):
                # Linear interpolation within the phase
                t = i / max(count - 1, 1)
                cptd_target = start_cptd + t * (end_cptd - start_cptd)

                core = base_core
                peripheral = round(core - cptd_target, 2)

                # Distribute peripheral across hands and feet
                hand_temp = round(peripheral + 0.1, 2)
                foot_temp = round(peripheral - 0.1, 2)

                alert_result = self.alert_engine.process(
                    patient_id=patient_id,
                    core=core,
                    left_hand=hand_temp,
                    right_hand=hand_temp,
                    left_foot=foot_temp,
                    right_foot=foot_temp,
                )

                peripheral_temp = round((hand_temp + hand_temp) / 2, 2)
                ts = now + timedelta(seconds=point_index * 0.75)

                message = {
                    "timestamp": ts.isoformat(),
                    "patient_id": patient_id,
                    "mode": "demo",
                    "core_temp": core,
                    "peripheral_temp": peripheral_temp,
                    "cptd": alert_result["cptd"],
                    "zones": {
                        "core": core,
                        "left_hand": hand_temp,
                        "right_hand": hand_temp,
                        "left_foot": foot_temp,
                        "right_foot": foot_temp,
                    },
                    "alert": {
                        "level": alert_result["alert_level"],
                        "message": alert_result["alert_message"],
                        "cptd_threshold": config.CPTD_WARNING,
                        "consecutive_abnormal": alert_result["consecutive_abnormal"],
                    },
                    "frame_base64": static_frame_b64,
                    "keypoints": [],
                }

                yield message
                point_index += 1
                await asyncio.sleep(interval)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _load_static_thermal_image() -> Optional[str]:
        """Load the first .jpeg from the Greek thermal image directory.

        Returns a base64 JPEG data URI string, or None if unavailable.
        """
        image_dir = config.GREEK_IMAGE_DIR
        if not image_dir.is_dir():
            return None

        jpegs = sorted(image_dir.glob("*.jpeg"))
        if not jpegs:
            # Also try .jpg extension
            jpegs = sorted(image_dir.glob("*.jpg"))
        if not jpegs:
            return None

        try:
            import cv2

            frame = cv2.imread(str(jpegs[0]))
            if frame is None:
                return None
            _, buf = cv2.imencode(".jpg", frame)
            b64 = base64.b64encode(buf).decode("ascii")
            return f"data:image/jpeg;base64,{b64}"
        except Exception:
            logger.debug("Failed to load static thermal image", exc_info=True)
            return None

    @staticmethod
    def _load_csv(csv_path: Path) -> pd.DataFrame:
        """Load and prepare a Greek CSV file."""
        try:
            df = pd.read_csv(csv_path)
        except Exception:
            logger.exception("Failed to read CSV: %s", csv_path)
            return pd.DataFrame()

        # Parse timestamps
        if "timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

        # Sort by timestamp
        if "timestamp" in df.columns:
            df = df.sort_values("timestamp").reset_index(drop=True)

        return df

    @staticmethod
    def _extract_zones(row: pd.Series) -> dict[str, Optional[float]]:
        """Pull zone temperatures from a CSV row.

        Returns a dict with keys: core, left_hand, right_hand, left_foot,
        right_foot.  Values are float or None.
        """
        zones: dict[str, Optional[float]] = {}
        for zone_name, col_name in _CSV_ZONE_MAP.items():
            val = row.get(col_name)
            if pd.isna(val):
                zones[zone_name] = None
            else:
                try:
                    zones[zone_name] = float(val)
                except (ValueError, TypeError):
                    zones[zone_name] = None
        return zones

    @staticmethod
    def _peripheral_summary(zones: dict[str, Optional[float]]) -> Optional[float]:
        """Compute the top-level peripheral_temp field.

        Priority: mean of non-null hands; if both null, mean of non-null feet;
        if all null, None.
        """
        hands = [v for v in (zones["left_hand"], zones["right_hand"]) if v is not None]
        if hands:
            return round(sum(hands) / len(hands), 2)

        feet = [v for v in (zones["left_foot"], zones["right_foot"]) if v is not None]
        if feet:
            return round(sum(feet) / len(feet), 2)

        return None

    def _find_thermal_images(self, patient_id: str) -> list[Path]:
        """Look for thermal image files associated with a patient.

        Returns a list of image paths (may be empty).
        """
        image_dir = config.GREEK_IMAGE_DIR
        if not image_dir.is_dir():
            return []

        # Greek images may be named with patient ID prefix or in subfolders
        patterns = [
            f"{patient_id}*",
            f"*{patient_id}*",
        ]
        images: list[Path] = []
        for pattern in patterns:
            images.extend(image_dir.glob(pattern))

        # Filter to image file extensions
        image_exts = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"}
        images = [p for p in images if p.suffix.lower() in image_exts]

        return sorted(set(images))

    def _try_annotate_frame(
        self,
        thermal_images: list[Path],
        patient_id: str,
    ) -> Optional[str]:
        """Attempt to produce an annotated frame if pipeline + images available.

        Returns a base64 data-URI string or None.
        """
        if self.pipeline is None or not thermal_images:
            return None

        try:
            import cv2

            # Use the first available thermal image as a representative frame
            # (in a full implementation this would match by timestamp)
            img_path = thermal_images[0]
            frame = cv2.imread(str(img_path))
            if frame is None:
                return None

            # Check for a paired RGB image (same name in an RGB directory)
            rgb_path = self._find_rgb_pair(img_path)
            if rgb_path is not None:
                rgb_frame = cv2.imread(str(rgb_path))
                if rgb_frame is not None:
                    result = self.pipeline.detect_on_rgb(rgb_frame, frame)
                    return result.get("annotated_frame_base64")

            # Fall back to direct detection on thermal frame
            result = self.pipeline.detect(frame)
            return result.get("annotated_frame_base64")

        except Exception:
            logger.debug(
                "Frame annotation failed for %s, continuing without frame",
                patient_id,
                exc_info=True,
            )
            return None

    @staticmethod
    def _find_rgb_pair(thermal_path: Path) -> Optional[Path]:
        """Attempt to find a matching RGB image for a thermal image.

        The Greek dataset stores RGB pairs in a sibling ``RGB`` directory
        with the same filename.
        """
        rgb_dir = thermal_path.parent.parent / "RGB"
        if not rgb_dir.is_dir():
            return None

        rgb_path = rgb_dir / thermal_path.name
        if rgb_path.is_file():
            return rgb_path

        return None
