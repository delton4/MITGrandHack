"""NeoTherm Model Pipeline — Core visual processing module.

Takes a thermal image frame, runs YOLOv8-Pose for keypoint detection,
computes body-zone ROIs (chest, hands, feet), draws annotations, and
optionally extracts mean temperatures from a raw temperature matrix.
"""

from __future__ import annotations

import base64
import logging
from typing import Any

import cv2
import numpy as np
from ultralytics import YOLO

from . import config

logger = logging.getLogger(__name__)

# Reverse lookup: index -> name for the keypoints we care about
_INDEX_TO_NAME: dict[int, str] = {v: k for k, v in config.KEYPOINTS.items()}

# Side length (pixels) for hand and foot ROI squares
_EXTREMITY_ROI_SIDE = 30


def load_homography_matrix(path: str | None = None) -> np.ndarray | None:
    """Load the homography matrix for RGB→thermal coordinate mapping."""
    if path is None:
        hom_path = (
            config.GREEK_BASE
            / "Cropping mechanisms"
            / "Data2Check"
            / "homography_matrix.txt"
        )
    else:
        hom_path = path
    try:
        return np.loadtxt(str(hom_path), delimiter=",")
    except Exception:
        logger.warning("Could not load homography matrix from %s", hom_path)
        return None


class PoseDetector:
    """Detects neonatal pose via YOLOv8-Pose and derives thermal ROIs.

    YOLO does not work on pseudocolor thermal images. Two strategies:
    1. **RGB mode**: Run YOLO on an RGB image and map keypoints to thermal
       coordinates via a homography matrix.
    2. **Direct mode**: Run YOLO on the frame directly (works for live camera
       with adults or grayscale thermal images).
    """

    def __init__(self) -> None:
        """Load YOLOv8-Pose model (auto-downloads from Ultralytics on first run)."""
        logger.info("Loading YOLO model: %s", config.YOLO_MODEL)
        self.model = YOLO(config.YOLO_MODEL)
        self.confidence = config.YOLO_CONFIDENCE
        self.homography = load_homography_matrix()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def detect_on_rgb(
        self, rgb_frame: np.ndarray, thermal_frame: np.ndarray
    ) -> dict[str, Any]:
        """Run YOLO on an RGB frame and project keypoints onto the thermal frame.

        This is the preferred approach for the Greek dataset where YOLO fails
        on pseudocolor thermal images but works perfectly on RGB.

        Parameters
        ----------
        rgb_frame : np.ndarray
            Visible/RGB image for YOLO detection.
        thermal_frame : np.ndarray
            Thermal image for annotation drawing and display.

        Returns
        -------
        Same structure as :meth:`detect`.
        """
        result = self.detect(rgb_frame)

        if not result["keypoints"] or self.homography is None:
            # No keypoints or no homography — annotate thermal frame as-is
            result["annotated_frame_base64"] = self._encode_frame(thermal_frame)
            return result

        # Transform keypoint coordinates from RGB space to thermal space
        h, w = thermal_frame.shape[:2]
        transformed_kps = []
        for kp in result["keypoints"]:
            pt = np.array([[[kp["x"], kp["y"]]]], dtype=np.float64)
            mapped = cv2.perspectiveTransform(pt, self.homography)
            tx, ty = int(round(mapped[0][0][0])), int(round(mapped[0][0][1]))
            # Clip to thermal image bounds
            tx = max(0, min(w - 1, tx))
            ty = max(0, min(h - 1, ty))
            transformed_kps.append({
                "name": kp["name"],
                "x": tx,
                "y": ty,
                "conf": kp["conf"],
            })

        # Recompute ROIs in thermal space
        kp_lookup = {kp["name"]: kp for kp in transformed_kps}
        chest_roi = self._chest_roi(kp_lookup, w, h)
        hand_rois = {
            "left": self._extremity_roi(kp_lookup, "left_wrist", w, h),
            "right": self._extremity_roi(kp_lookup, "right_wrist", w, h),
        }
        foot_rois = {
            "left": self._extremity_roi(kp_lookup, "left_ankle", w, h),
            "right": self._extremity_roi(kp_lookup, "right_ankle", w, h),
        }
        rois = {
            "chest_roi": chest_roi,
            "hand_rois": hand_rois,
            "foot_rois": foot_rois,
        }

        # Draw on thermal frame
        thermal_bgr = thermal_frame if thermal_frame.ndim == 3 else cv2.cvtColor(thermal_frame, cv2.COLOR_GRAY2BGR)
        annotated = self._draw_annotations(thermal_bgr, transformed_kps, rois)

        return {
            "keypoints": transformed_kps,
            "rois": rois,
            "annotated_frame_base64": self._encode_frame(annotated),
        }

    def detect(self, frame: np.ndarray) -> dict[str, Any]:
        """Run YOLO pose inference on a single frame.

        Parameters
        ----------
        frame : np.ndarray
            Input image (BGR or grayscale). For thermal images this is
            typically a pseudocolor or grayscale representation.

        Returns
        -------
        dict with keys:
            keypoints  – list[dict] each {name, x, y, conf}
            rois       – dict with chest_roi, hand_rois, foot_rois
            annotated_frame_base64 – data-URI base64 JPEG string
        """
        # Ensure 3-channel for YOLO (thermal images may be single-channel)
        if frame.ndim == 2:
            frame_bgr = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)
        elif frame.shape[2] == 1:
            frame_bgr = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)
        else:
            frame_bgr = frame.copy()

        h, w = frame_bgr.shape[:2]

        # Run inference
        results = self.model(frame_bgr, conf=self.confidence, verbose=False)

        # Parse first detected person (single-neonate assumption)
        keypoints_list = self._parse_keypoints(results)

        if not keypoints_list:
            # No person detected
            annotated = self._encode_frame(frame_bgr)
            return {
                "keypoints": [],
                "rois": {
                    "chest_roi": None,
                    "hand_rois": {"left": None, "right": None},
                    "foot_rois": {"left": None, "right": None},
                },
                "annotated_frame_base64": annotated,
            }

        # Build lookup for fast access: name -> {x, y, conf}
        kp_lookup: dict[str, dict] = {kp["name"]: kp for kp in keypoints_list}

        # Compute ROIs
        chest_roi = self._chest_roi(kp_lookup, w, h)
        hand_rois = {
            "left": self._extremity_roi(kp_lookup, "left_wrist", w, h),
            "right": self._extremity_roi(kp_lookup, "right_wrist", w, h),
        }
        foot_rois = {
            "left": self._extremity_roi(kp_lookup, "left_ankle", w, h),
            "right": self._extremity_roi(kp_lookup, "right_ankle", w, h),
        }

        rois = {
            "chest_roi": chest_roi,
            "hand_rois": hand_rois,
            "foot_rois": foot_rois,
        }

        # Draw annotations
        annotated_frame = self._draw_annotations(frame_bgr, keypoints_list, rois)
        annotated_b64 = self._encode_frame(annotated_frame)

        return {
            "keypoints": keypoints_list,
            "rois": rois,
            "annotated_frame_base64": annotated_b64,
        }

    def extract_roi_temps(
        self, temp_matrix: np.ndarray, rois: dict[str, Any]
    ) -> dict[str, float | None]:
        """Extract mean temperature within each ROI from a raw temperature matrix.

        Parameters
        ----------
        temp_matrix : np.ndarray
            2-D array of per-pixel temperatures in degrees Celsius,
            same spatial dimensions as the image frame.
        rois : dict
            The ``rois`` dict returned by :meth:`detect`.

        Returns
        -------
        dict with keys: core, left_hand, right_hand, left_foot, right_foot.
        Values are mean temperature (float) or None if the ROI is unavailable.
        """
        return {
            "core": self._mean_temp_rect(temp_matrix, rois["chest_roi"]),
            "left_hand": self._mean_temp_rect(temp_matrix, rois["hand_rois"]["left"]),
            "right_hand": self._mean_temp_rect(temp_matrix, rois["hand_rois"]["right"]),
            "left_foot": self._mean_temp_rect(temp_matrix, rois["foot_rois"]["left"]),
            "right_foot": self._mean_temp_rect(temp_matrix, rois["foot_rois"]["right"]),
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _parse_keypoints(self, results) -> list[dict]:
        """Extract relevant keypoints from YOLO results for the first person."""
        if not results or len(results) == 0:
            return []

        result = results[0]

        # results[0].keypoints is a Keypoints object; .data is (N, 17, 3)
        if result.keypoints is None or result.keypoints.data is None:
            return []

        kp_data = result.keypoints.data  # shape (num_persons, 17, 3)
        if kp_data.shape[0] == 0:
            return []

        # Use the first (highest-confidence) detected person
        person_kps = kp_data[0].cpu().numpy()  # (17, 3) — x, y, conf

        keypoints_list: list[dict] = []
        for idx, name in _INDEX_TO_NAME.items():
            x, y, conf = person_kps[idx]
            if conf >= self.confidence:
                keypoints_list.append({
                    "name": name,
                    "x": int(round(x)),
                    "y": int(round(y)),
                    "conf": float(round(conf, 4)),
                })

        return keypoints_list

    def _chest_roi(
        self, kp_lookup: dict[str, dict], img_w: int, img_h: int
    ) -> dict[str, int] | None:
        """Compute chest-abdomen ROI rectangle from shoulders and hips.

        Requires at least one shoulder AND at least one hip.
        Returns {x1, y1, x2, y2} clipped to image bounds, or None.
        """
        shoulders = [
            kp_lookup[n] for n in ("left_shoulder", "right_shoulder") if n in kp_lookup
        ]
        hips = [
            kp_lookup[n] for n in ("left_hip", "right_hip") if n in kp_lookup
        ]

        if not shoulders or not hips:
            return None

        # Top-left from min shoulder coords, bottom-right from max hip coords
        x1 = min(kp["x"] for kp in shoulders + hips)
        y1 = min(kp["y"] for kp in shoulders)
        x2 = max(kp["x"] for kp in shoulders + hips)
        y2 = max(kp["y"] for kp in hips)

        # Clip to image bounds
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(img_w - 1, x2)
        y2 = min(img_h - 1, y2)

        # Sanity: ROI must have positive area
        if x2 <= x1 or y2 <= y1:
            return None

        return {"x1": x1, "y1": y1, "x2": x2, "y2": y2}

    def _extremity_roi(
        self,
        kp_lookup: dict[str, dict],
        keypoint_name: str,
        img_w: int,
        img_h: int,
    ) -> dict[str, int] | None:
        """Compute a square ROI centered on a keypoint (wrist or ankle).

        Returns {x1, y1, x2, y2} clipped to image bounds, or None.
        """
        if keypoint_name not in kp_lookup:
            return None

        kp = kp_lookup[keypoint_name]
        cx, cy = kp["x"], kp["y"]
        half = _EXTREMITY_ROI_SIDE // 2

        x1 = max(0, cx - half)
        y1 = max(0, cy - half)
        x2 = min(img_w - 1, cx + half)
        y2 = min(img_h - 1, cy + half)

        if x2 <= x1 or y2 <= y1:
            return None

        return {"x1": x1, "y1": y1, "x2": x2, "y2": y2}

    @staticmethod
    def _mean_temp_rect(
        temp_matrix: np.ndarray, roi: dict[str, int] | None
    ) -> float | None:
        """Return mean temperature inside an ROI rectangle, or None."""
        if roi is None:
            return None

        region = temp_matrix[roi["y1"] : roi["y2"] + 1, roi["x1"] : roi["x2"] + 1]
        if region.size == 0:
            return None

        return float(np.nanmean(region))

    # ------------------------------------------------------------------
    # Drawing / encoding
    # ------------------------------------------------------------------

    @staticmethod
    def _draw_annotations(
        frame: np.ndarray,
        keypoints: list[dict],
        rois: dict,
    ) -> np.ndarray:
        """Draw keypoints and ROI rectangles on a copy of the frame.

        Core ROI (chest) is drawn in red; peripheral ROIs (hands, feet) in blue.
        Keypoints are drawn as small green circles with labels.
        """
        canvas = frame.copy()

        RED = (0, 0, 255)      # BGR
        BLUE = (255, 100, 0)   # BGR
        GREEN = (0, 220, 0)    # BGR

        # Draw chest ROI (red)
        chest = rois.get("chest_roi")
        if chest is not None:
            cv2.rectangle(
                canvas,
                (chest["x1"], chest["y1"]),
                (chest["x2"], chest["y2"]),
                RED,
                2,
            )
            cv2.putText(
                canvas, "chest", (chest["x1"], chest["y1"] - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, RED, 1,
            )

        # Draw hand and foot ROIs (blue)
        for group_key in ("hand_rois", "foot_rois"):
            group = rois.get(group_key, {})
            for side, roi in group.items():
                if roi is None:
                    continue
                label = f"{side} {'hand' if 'hand' in group_key else 'foot'}"
                cv2.rectangle(
                    canvas,
                    (roi["x1"], roi["y1"]),
                    (roi["x2"], roi["y2"]),
                    BLUE,
                    2,
                )
                cv2.putText(
                    canvas, label, (roi["x1"], roi["y1"] - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.35, BLUE, 1,
                )

        # Draw keypoints
        for kp in keypoints:
            cv2.circle(canvas, (kp["x"], kp["y"]), 4, GREEN, -1)
            cv2.putText(
                canvas,
                f"{kp['name']} ({kp['conf']:.2f})",
                (kp["x"] + 6, kp["y"] - 4),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.3,
                GREEN,
                1,
            )

        return canvas

    @staticmethod
    def _encode_frame(frame: np.ndarray) -> str:
        """Encode a BGR frame as a base64 data-URI JPEG string."""
        ok, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if not ok:
            logger.warning("Failed to encode frame as JPEG, returning empty string")
            return ""
        b64 = base64.b64encode(buf.tobytes()).decode("ascii")
        return f"data:image/jpeg;base64,{b64}"
