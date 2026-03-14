# NeoTherm Model Pipeline — Design Spec

## Overview

Real-time neonatal thermal imaging pipeline for computing Core-Peripheral Temperature Difference (CPTD) as an early sepsis indicator. Two demo modes: **Replay** (primary, uses Greek research CSV data) and **Live** (stretch goal, thermal camera input).

**Context:** MIT Grand Hack hackathon. 12-hour build window. M5 MacBook Pro, 32GB RAM. Frontend handled by separate team member. This spec covers the model/backend only.

## Clinical Foundation

CPTD = T_core − T_peripheral. In sepsis, sympathetic vasoconstriction cools extremities while core temperature stays stable. A sustained CPTD >2°C for ≥4 hours is a validated early marker for late-onset neonatal sepsis (Leante-Castellanos 2017). Zhang et al. (2025) demonstrated automated CPTD measurement via thermal camera with MAE <0.3°C vs spot thermometer in 40 preterm infants.

Key insight: measuring **relative** temperature difference (not absolute) avoids camera calibration issues entirely.

## Architecture

### Two Pipelines, Shared Output

```
REPLAY MODE (primary):
  Greek CSV files ──→ Parse zone temps ──→ Compute CPTD ──→ Outlier filter ──→ Alert logic ──┐
  Greek thermal images ──→ YOLOv8-Pose ──→ Draw ROIs ──→ Annotated frame ──────────────────────┤
                                                                                                ├──→ WebSocket ──→ Frontend
LIVE MODE (stretch):                                                                            │
  Thermal camera ──→ Frame capture ──→ YOLOv8-Pose ──→ ROIs ──→ Extract temps ──→ CPTD ──→ Alert ─┘
```

### File Structure

```
app/model/
├── server.py          # FastAPI + WebSocket endpoint, mode switching
├── pipeline.py        # Core: frame → YOLO → keypoints → ROIs → annotated frame
├── replay.py          # CSV replay engine with timed playback
├── live.py            # Live camera capture (stretch goal)
├── alerting.py        # 3-tier outlier filter + alert threshold logic
├── config.py          # Thresholds, paths, constants
└── requirements.txt   # Dependencies
```

## Components

### config.py

Constants and configuration. No external dependencies.

```python
from pathlib import Path

# Project root (resolved relative to this file)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent  # → MIT Grand Hack repo root

# Greek research data paths
GREEK_BASE = PROJECT_ROOT / "greek github project" / "Early-detection-of-neonatal-sepsis-using-thermal-images"
GREEK_CSV_DIR = GREEK_BASE / "Time-Series And Alarm Raising" / "csv_by_baby_smooth"
GREEK_IMAGE_DIR = GREEK_BASE / "Cropping mechanisms" / "Data2Check" / "Thermal"
GREEK_ANNOTATIONS = GREEK_BASE / "Human Error" / "Annotations.json"

# YOLO
YOLO_MODEL = "yolov8m-pose.pt"  # medium model, good accuracy/speed balance
YOLO_CONFIDENCE = 0.5

# COCO keypoint indices for zone mapping
KEYPOINTS = {
    "left_shoulder": 5, "right_shoulder": 6,
    "left_hip": 11, "right_hip": 12,       # → chest-abdomen ROI
    "left_wrist": 9, "right_wrist": 10,     # → hand ROI center
    "left_ankle": 15, "right_ankle": 16,    # → foot ROI center
}

# Alert thresholds (from literature) — four levels
CPTD_WARNING = 2.0        # ≥ 2°C = warning (Leante-Castellanos 2017)
CPTD_HIGH = 3.5           # ≥ 3.5°C = high (Greek team threshold)
CPTD_CRITICAL = 5.0       # ≥ 5°C = critical (Zhang et al.)

# Outlier detection
TEMP_MIN = 28.0           # physiological lower bound
TEMP_MAX = 42.0           # physiological upper bound
MAX_FRAME_JUMP = 2.0      # max °C change between consecutive frames
ROLLING_WINDOW = 30       # frames for rolling mean/SD
ROLLING_SD_THRESHOLD = 3  # standard deviations for outlier

# Replay
REPLAY_SPEED = 1.0        # 1.0 = real-time, 2.0 = 2x speed
REPLAY_INTERVAL_MS = 1000 # ms between updates when no timestamp gap

# Server
WS_HOST = "0.0.0.0"      # bind all interfaces (frontend on same machine)
WS_PORT = 8765
CORS_ORIGINS = ["*"]      # allow all origins (hackathon setting)
```

### pipeline.py

Core visual processing. Takes a thermal image frame, runs YOLOv8-Pose, returns keypoints and annotated frame.

**Inputs:** Thermal image (numpy array or file path)
**Outputs:** Keypoints dict, ROI coordinates, annotated frame (base64)

Key logic:
- Load YOLOv8-Pose model (once at startup, cached)
- Run inference on thermal frame
- Extract keypoints with confidence > threshold
- Define ROIs:
  - Chest-abdomen: rectangle from shoulders[5,6] to hips[11,12]
  - Hand: square centered on wrist[9,10], side = 30px
  - Foot: square centered on ankle[15,16], side = 30px
- Draw ROIs and keypoints on frame with color coding (core=red, peripheral=blue)
- Encode annotated frame as base64 JPEG
- If raw thermal data available: extract mean temperature within each ROI

### alerting.py

Stateful alert engine. Maintains per-patient history for outlier filtering and consecutive alert tracking.

**Inputs:** Raw zone temperatures (core, hands, feet)
**Outputs:** Filtered CPTD value, alert level, alert message

Three-tier outlier filter (from Zhang et al.):
1. Physiological bounds: reject temps outside 28-42°C
2. Frame-to-frame jump: reject >2°C change from previous reading
3. Rolling window: reject values >3 SD from 30-frame rolling mean

Alert levels (using config constants):
- `normal`: CPTD < CPTD_WARNING (2°C)
- `warning`: CPTD_WARNING ≤ CPTD < CPTD_HIGH (2–3.5°C)
- `high`: CPTD_HIGH ≤ CPTD < CPTD_CRITICAL (3.5–5°C)
- `critical`: CPTD ≥ CPTD_CRITICAL (5°C)

Consecutive tracking: count consecutive abnormal readings. Alert escalates after 5+ consecutive warnings.

### replay.py

Replays Greek CSV data as if it were live. Optionally pairs with thermal images for visual display.

**Dependencies:** `config.py`, `alerting.py`. Does NOT require `pipeline.py` for core CSV replay — image annotation is an optional enhancement added after the data path works end-to-end.

**Inputs:** Patient CSV file path, optional pipeline instance for image annotation
**Outputs:** Yields (timestamp, zone_temps, alert_result, frame_or_null) tuples at timed intervals

Key logic:
- Load CSV with pandas, parse timestamps
- For each row: extract Zona1 (core), hand temps, foot temps
- Handle missing values (many cells are null in the CSVs — skip rows where both core AND all peripherals are null; interpolate when only some values are missing)
- Calculate time deltas between rows, sleep proportionally (adjustable speed)
- Optionally pair with thermal images from annotations JSON (match by patient ID + timestamp range)
- If no matching image: set `frame_base64` to `null` — frontend must handle this gracefully (e.g., show last known frame or a "no image" placeholder)

**CSV sample (baby_40.csv):**
```
timestamp,Zona1,codo_izq,codo_drc,rodilla_izq,rodilla_drc,mano_izq,mano_drc,pie_izq,pie_drc
2024-10-23 14:44:14,,36.89,,,,,,34.97,
2024-10-23 14:51:23,,,,,,,33.34,,
```

**Zone mapping:** `Zona1` = core temperature (chest/shoulders area, measured by the Greek team at the torso region). This corresponds to the same body area as the YOLO-derived chest-abdomen ROI (shoulders to hips). Note: the Greek team's Zone 1 includes head/shoulders which is slightly different from the Zhang et al. chest-abdomen rectangle, but both measure the warm core region and produce clinically equivalent CPTD values.

### live.py (stretch goal)

Captures frames from a USB thermal camera. Camera-agnostic — tries common interfaces.

**Inputs:** Camera device index or SDK config
**Outputs:** Yields (timestamp, thermal_frame, temp_matrix) tuples

Key logic:
- Try OpenCV VideoCapture first (works with many USB cameras)
- If camera outputs pseudocolor: convert to grayscale, apply temperature LUT
- If camera outputs raw radiometric: use directly as temp matrix
- Frame rate: capture at camera native rate, process every Nth frame for YOLO
- Fallback: if no camera detected, print error and suggest replay mode

### server.py

FastAPI application with WebSocket endpoint. Orchestrates replay or live mode.

**Server config:** Binds to `0.0.0.0:8765`. CORS enabled for all origins (hackathon setting). Frontend connects to `ws://localhost:8765/ws`.

**Endpoints:**
- `GET /` — health check
- `GET /patients` — list available CSV files for replay (enumerates `baby_*.csv` in GREEK_CSV_DIR)
- `WS /ws` — main WebSocket stream

**WebSocket message format (server → client):**
```json
{
  "timestamp": "2024-10-23T14:44:14",
  "patient_id": "baby_40",
  "mode": "replay",
  "core_temp": 36.89,           // Zona1 from CSV, or chest-abdomen ROI mean in live mode
  "peripheral_temp": 34.97,     // mean of non-null hands; if both null, mean of non-null feet; if all null, null
  "cptd": 1.92,                 // core_temp - peripheral_temp; null if either is null
  "zones": {
    "core": 36.89,
    "left_hand": 34.97,
    "right_hand": null,
    "left_foot": 33.21,
    "right_foot": 33.58
  },
  "alert": {
    "level": "warning",
    "message": "CPTD approaching threshold",
    "cptd_threshold": 2.0,
    "consecutive_abnormal": 3
  },
  "frame_base64": "data:image/jpeg;base64,...",
  "keypoints": [
    {"name": "left_shoulder", "x": 245, "y": 180, "conf": 0.91}
  ]
}
```

**WebSocket message format (client → server):**
```json
{
  "action": "start_replay",
  "patient_id": "baby_40",
  "speed": 2.0
}
```
```json
{
  "action": "start_live",
  "camera_index": 0
}
```
```json
{
  "action": "stop"
}
```

### requirements.txt

```
ultralytics>=8.0.0
fastapi>=0.100.0
uvicorn[standard]>=0.20.0
websockets>=11.0
pandas>=2.0.0
numpy>=1.24.0
opencv-python>=4.8.0
Pillow>=10.0.0
```

## Data Sources

### Greek CSV Files (27 patients: baby_29 through baby_55)
- Location: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Time-Series And Alarm Raising/csv_by_baby_smooth/`
- Columns: `timestamp, Zona1, codo_izq, codo_drc, rodilla_izq, rodilla_drc, mano_izq, mano_drc, pie_izq, pie_drc`
- Sparse data — many null values per row (empty strings in CSV)
- CPTD formula: `Zona1 − mean(non-null hands)`; if both hands null, use `mean(non-null feet)`; if all peripheral null, skip row

### Greek Thermal Images
- 7 image pairs in `Cropping mechanisms/Data2Check/Thermal/` (640×480)
- Full dataset in `final_dataset_annotated_zone_v2.zip` (213MB uncompressed)
- Annotations in `Human Error/Annotations.json` with keypoint coords + temperatures

### YOLO Model
- Downloaded from Ultralytics hub on first run
- `yolov8m-pose.pt` — ~52MB, 17 COCO keypoints
- Pre-trained on COCO, no fine-tuning needed for demo

**YOLO fallback plan:** If YOLOv8-Pose fails keypoint detection on thermal images:
1. Adjust confidence threshold (try 0.3–0.7 range)
2. Use the RGB image pair for detection, map coordinates to thermal via homography matrix in `Data2Check/homography_matrix.txt`
3. Fall back to static overlays using pre-computed keypoint coordinates from `Annotations.json`
4. Last resort: use MediaPipe Pose or temperature clustering (Approach C from design)

## Alert Thresholds

| CPTD Range | Level | Source |
|-----------|-------|--------|
| < 2°C | Normal | Leante-Castellanos 2017 |
| 2–3.5°C | Warning | Greek team threshold |
| 3.5–5°C | High | Greek team + Zhang et al. |
| > 5°C | Critical | Zhang et al. clinical threshold |

## Implementation Order

1. `requirements.txt` — standalone, install first
2. `config.py` — standalone, no deps
3. `alerting.py` — depends on config only
4. `pipeline.py` — depends on config, ultralytics
5. `replay.py` — depends on config, alerting (NOT pipeline — image annotation is optional)
6. `live.py` — depends on config, alerting, pipeline
7. `server.py` — depends on all above

**Parallelization strategy:**
- **Wave 1** (parallel): `config.py` + `alerting.py` + `pipeline.py` + YOLO validation on thermal images
- **Wave 2** (parallel, once Wave 1 done): `replay.py` + `live.py`
- **Wave 3**: `server.py` (integrates everything)

Critical path for earliest end-to-end test: config → alerting → replay → server (CSV-only, no YOLO needed). This lets you test WebSocket output before YOLO is validated.

## Success Criteria

- [ ] Replay mode plays back a Greek CSV file and sends CPTD over WebSocket
- [ ] YOLOv8-Pose detects keypoints on at least one Greek thermal image
- [ ] Annotated frame shows chest ROI (red) and hand/foot ROI (blue) overlaid
- [ ] Alert levels correctly escalate based on CPTD thresholds
- [ ] Frontend can connect to WebSocket and receive structured JSON messages
- [ ] Replay speed is adjustable (1x, 2x, 5x)
