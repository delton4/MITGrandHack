"""NeoTherm Model Pipeline — Configuration & Constants.

All thresholds, paths, keypoint mappings, server config, outlier detection
parameters, and replay settings live here. No external dependencies.
"""

from pathlib import Path

# ---------------------------------------------------------------------------
# Project root (resolved relative to this file: app/model/config.py)
# Handles both main repo and git worktree locations.
# ---------------------------------------------------------------------------
_FILE_ROOT = Path(__file__).resolve().parent.parent.parent  # repo or worktree root

_GREEK_SUBPATH = (
    Path("greek github project")
    / "Early-detection-of-neonatal-sepsis-using-thermal-images"
)

# Try worktree root first, then main repo (worktrees are under .worktrees/)
if (_FILE_ROOT / _GREEK_SUBPATH).exists():
    PROJECT_ROOT = _FILE_ROOT
else:
    # Walk up to find the main repo containing the greek project
    _main_repo = _FILE_ROOT.parent
    while _main_repo != _main_repo.parent:
        if (_main_repo / _GREEK_SUBPATH).exists():
            break
        _main_repo = _main_repo.parent
    PROJECT_ROOT = _main_repo if (_main_repo / _GREEK_SUBPATH).exists() else _FILE_ROOT

# ---------------------------------------------------------------------------
# Greek research data paths
# ---------------------------------------------------------------------------
GREEK_BASE = PROJECT_ROOT / _GREEK_SUBPATH
GREEK_CSV_DIR = GREEK_BASE / "Time-Series And Alarm Raising" / "csv_by_baby_smooth"
GREEK_IMAGE_DIR = GREEK_BASE / "Cropping mechanisms" / "Data2Check" / "Thermal"
GREEK_ANNOTATIONS = GREEK_BASE / "Human Error" / "Annotations.json"

# ---------------------------------------------------------------------------
# YOLO
# ---------------------------------------------------------------------------
YOLO_MODEL = "yolov8m-pose.pt"  # medium model, good accuracy/speed balance
YOLO_CONFIDENCE = 0.5

# ---------------------------------------------------------------------------
# COCO keypoint indices for zone mapping
# ---------------------------------------------------------------------------
KEYPOINTS = {
    "left_shoulder": 5,
    "right_shoulder": 6,
    "left_hip": 11,
    "right_hip": 12,        # shoulders + hips -> chest-abdomen ROI
    "left_wrist": 9,
    "right_wrist": 10,      # wrists -> hand ROI center
    "left_ankle": 15,
    "right_ankle": 16,      # ankles -> foot ROI center
}

# ---------------------------------------------------------------------------
# Alert thresholds (from literature) — four levels
# ---------------------------------------------------------------------------
CPTD_WARNING = 2.0          # >= 2 C = warning   (Leante-Castellanos 2017)
CPTD_HIGH = 3.5             # >= 3.5 C = high    (Greek team threshold)
CPTD_CRITICAL = 5.0         # >= 5 C = critical  (Zhang et al.)

# ---------------------------------------------------------------------------
# Outlier detection (three-tier filter, per Zhang et al.)
# ---------------------------------------------------------------------------
TEMP_MIN = 28.0             # physiological lower bound (C)
TEMP_MAX = 42.0             # physiological upper bound (C)
MAX_FRAME_JUMP = 2.0        # max C change between consecutive frames
ROLLING_WINDOW = 30         # frames for rolling mean / SD
ROLLING_SD_THRESHOLD = 3    # standard deviations for outlier rejection

# ---------------------------------------------------------------------------
# Replay
# ---------------------------------------------------------------------------
REPLAY_SPEED = 1.0          # 1.0 = real-time, 2.0 = 2x speed
REPLAY_INTERVAL_MS = 1000   # ms between updates when no timestamp gap

# ---------------------------------------------------------------------------
# Server
# ---------------------------------------------------------------------------
WS_HOST = "0.0.0.0"        # bind all interfaces (frontend on same machine)
WS_PORT = 8765
CORS_ORIGINS = ["*"]        # allow all origins (hackathon setting)
