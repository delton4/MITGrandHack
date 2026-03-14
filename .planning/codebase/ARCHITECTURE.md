# Architecture

**Analysis Date:** 2026-03-14

## Pattern Overview

**Overall:** Multi-stage image processing pipeline with data preparation layer, annotation UI, modality alignment, pose-based temperature analysis, and temporal pattern recognition.

**Key Characteristics:**
- Modular data processing pipeline where each stage has independent responsibility
- Decoupled annotation UI from analysis logic
- Thermal-RGB modality alignment to enable pose detection and temperature mapping
- Template-based approach with pre-built models (HRNet) adapted for neonatal domain
- Time-series tracking for clinical decision support

## Layers

**Data Preparation & Annotation Layer:**
- Purpose: Collect labeled training data through user-guided annotation interface
- Location: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/anotation_script_v2.py`
- Contains: GUI for annotating keypoints on thermal images, dataset balancing logic, tracking of processed images
- Depends on: PIL (image loading), tkinter (UI), threading (performance), JSON (persistence)
- Used by: Human operators preparing training datasets

**Modality Conversion Layer:**
- Purpose: Convert thermal images from camera format to temperature-normalized grayscale
- Location: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/termic2grayscale.py`
- Contains: Color-to-temperature lookup table creation, OCR-based min/max extraction from thermal scale, global temperature normalization
- Depends on: OpenCV, EasyOCR, scipy.spatial.KDTree, NumPy
- Used by: Temperature extraction and analysis stages

**Temperature Extraction Layer:**
- Purpose: Map annotated anatomical keypoints to temperature values
- Location: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/extract_temperatures_zone.py`
- Contains: Coordinate-to-temperature conversion using lookup tables, Gaussian-weighted region sampling (15×15 kernel, σ=5)
- Depends on: Grayscale thermal images, keypoint annotations (JSON), pre-computed min/max lookup tables
- Used by: Temporal analysis and clinical decision modules

**Quality Control & Rejection Layer:**
- Purpose: Validate measurement reliability before clinical use
- Location: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Rejection Mechanism/rejection.py`
- Contains: Anatomical completeness verification, temperature range bounds checking, occlusion detection heuristics
- Depends on: Extracted temperature values, keypoint presence flags
- Used by: Temporal pattern recognition to filter valid measurements

**Visualization & Analysis Layer:**
- Purpose: Display annotated images with temperature overlays and enable temporal browsing
- Location: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/visualization_of_images_time_range_v2.py`
- Contains: Side-by-side thermal/RGB visualization with keypoint overlays, time-range filtering, batch annotation export
- Depends on: JSON annotations with temperature values, opencv for drawing, matplotlib for display
- Used by: Clinical review and model validation

## Data Flow

**Annotation & Labeling Flow:**

1. User launches `anotation_script_v2.py` and selects source/destination directories
2. Script loads all thermal-RGB image pairs from source, organizing by baby ID
3. User visualizes paired images side-by-side and manually clicks keypoints on thermal image
4. Annotations saved to JSON (relative paths, x/y coordinates, anatomical class)
5. Processed images copied to destination dataset directory with balanced distribution per baby

**Temperature Extraction Flow:**

1. `termic2grayscale.py` scans source thermal images and extracts min/max temperature from camera scale via OCR
2. Builds lookup table mapping pixel colors → temperatures using gradient bar analysis
3. Converts RGB thermal image to temperature matrix via KDTree nearest-neighbor color matching
4. Normalizes all images to global temperature bounds (e.g., 10-40°C), outputs grayscale images
5. `extract_temperatures_zone.py` loads grayscale images and previously annotated keypoints
6. For each keypoint coordinate, extracts Gaussian-weighted average from surrounding region
7. Outputs enriched JSON with temperature values attached to each keypoint

**Quality Control & Clinical Decision Flow:**

1. `rejection.py` receives extracted temperature measurements with keypoint metadata
2. Validates anatomical completeness (minimum Zone 1 + Zone 3 points present)
3. Checks physiological bounds (28-42°C valid range)
4. Flags measurements with occlusions (bandages, tubes, sensors) for human review
5. Passes validated measurements to temporal tracking system

**Temporal Pattern Recognition Flow:**

1. Receives time-series of validated measurements from single neonate
2. Establishes baseline Zone 1 and Zone 3 temperatures using median of first N readings
3. Computes core-peripheral gradient (Zone 1 temp - Zone 3 temp) per measurement
4. Tracks gradient over consecutive readings
5. Triggers clinical alert when abnormal patterns persist (gradient >3.5°C for 5+ consecutive readings)

**State Management:**

- Transient: Image processing state lives in memory during single script execution
- Persistent: All results written to JSON files with relative paths for reproducibility
- Tracking: CSV files maintain processing history (which images annotated, skipped, why)
- Annotations: Cumulative JSON files append new entries, enabling resumable workflows

## Key Abstractions

**Thermal Image Pair:**
- Purpose: Represents the dual-modality input - thermal for temperature, RGB for anatomy
- Examples: Raw camera files in `source_dir` organized as `baby_id/date/HM[timestamp].jpeg` (thermal) + `.VIS` (RGB)
- Pattern: Paired file naming convention `filename.jpeg` (thermal) and `filename_VIS.jpeg` or `filename.vis.jpeg` (RGB)

**Anatomical Keypoints:**
- Purpose: Maps body regions to temperature zones for sepsis detection
- Examples: Zone1 (head/chest/shoulders), Zone2 (arms/legs), Zone3 (hands/feet extremities)
- Pattern: 9-point annotation structure (1 Zone1 point + 4 Zone2 points + 4 Zone3 points per image)

**Temperature Lookup Table (LUT):**
- Purpose: Bridges color values in thermal images to absolute temperature degrees
- Examples: Mapping gradient bar colors (from camera thermal display) to 28-42°C range
- Pattern: Dictionary mapping RGB tuples to floats, created per image from its embedded gradient scale

**Annotation Record:**
- Purpose: Persistent representation of labeled data with all metadata
- Examples: JSON entries with thermal_image path, rgb_image path, array of 9 keypoints with x/y/class/temperature
- Pattern: Structured JSON with hierarchical organization (image → annotations array → individual points)

## Entry Points

**Data Collection Entry Point:**
- Location: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/anotation_script_v2.py`
- Triggers: Manual invocation `python anotation_script_v2.py`
- Responsibilities: GUI initialization, image enumeration, annotation persistence, dataset balancing

**Temperature Conversion Entry Point:**
- Location: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/termic2grayscale.py`
- Triggers: Executed when min_max_dict.json doesn't exist or full dataset needs regeneration
- Responsibilities: Scan source folders, OCR min/max values, build per-image LUTs, normalize to grayscale

**Temperature Extraction Entry Point:**
- Location: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/extract_temperatures_zone.py`
- Triggers: Manual execution after annotation and grayscale conversion complete
- Responsibilities: Load annotations, apply LUT mapping, compute region averages, output enriched JSON

**Visualization Entry Point:**
- Location: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/visualization_of_images_time_range_v2.py`
- Triggers: Executed manually with command-line time-range input
- Responsibilities: Load annotation JSON, filter by timestamp and baby ID, render interactive visualization

## Error Handling

**Strategy:** Permissive logging with human recovery points

**Patterns:**
- Missing image pairs: Skip with warning, document in tracking CSV under "Reason" column
- OCR failures: Log exception and skip image, continue batch processing (termic2grayscale.py)
- Coordinate out of bounds: Return None for temperature, allow downstream to handle missing values
- File I/O errors: Catch JSON decode errors, fallback to empty dataset and continue
- EXIF orientation failures: Default to original orientation, log warning but don't crash

**Recovery Mechanisms:**
- Resumable workflows: Tracking CSV prevents re-processing of annotated images
- Partial results: JSON appends new entries without overwriting, enabling re-runs
- Manual override: Manual image selection button allows operator to force inclusion of specific images

## Cross-Cutting Concerns

**Logging:**
- Print statements to console with context (e.g., "Annotations file opened\n")
- Error messages include path and problematic values for debugging
- No centralized logging framework; ad-hoc print-based diagnostics

**Validation:**
- Physiological bounds enforcement: 28-42°C range for neonates
- Image dimension checks: Thermal 640×480, RGB 3264×2448, handle rotations
- Anatomical completeness: Minimum 1 Zone1 + 1 Zone3 point required

**Data Format Standardization:**
- JSON as primary interchange format (no databases)
- Consistent relative path storage for portability
- CSV tracking for audit trails and resumability
- Coordinate system: (x, y) pixel positions in image frame, no normalization

**Threading:**
- Annotation UI runs background thread for image loading (anotation_script_v2.py)
- Prevents UI freeze during large image library initialization
- Loading dialog with timeout protection (60s default)

---

*Architecture analysis: 2026-03-14*
