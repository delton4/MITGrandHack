# Codebase Structure

**Analysis Date:** 2026-03-14

## Directory Layout

```
/Users/diego/personal/MIT Grand Hack/
├── app/                                    # Placeholder structure for future implementation
│   ├── frontend/                          # (empty - reserved for UI)
│   ├── hardware/                          # (empty - reserved for hardware drivers)
│   └── model/                             # (empty - reserved for ML models)
├── greek github project/                  # Reference implementation from university collaboration
│   └── Early-detection-of-neonatal-sepsis-using-thermal-images/
│       ├── Cropping mechanisms/           # (unused in current workflow)
│       ├── Pose Detection/                # (empty - uses pre-trained HRNet externally)
│       ├── Rejection Mechanism/           # Quality control and filtering
│       │   └── rejection.py               # Anatomical validation, bounds checking
│       ├── Temperature Extraction/        # Thermal-to-temperature conversion
│       │   ├── extract_temperatures_zone.py        # Maps keypoints to temps
│       │   ├── termic2grayscale.py                 # RGB→grayscale normalization
│       ├── Time-Series And Alarm Raising/ # (reserved for temporal analysis)
│       ├── Human Error/                   # Statistics and analysis artifacts
│       │   ├── Annotations.json           # Aggregated keypoint data
│       │   └── computed_stats.json        # Statistical summaries
│       ├── docs/                          # Documentation
│       │   ├── Report.pdf                 # Detailed technical report
│       │   └── images/                    # Visualization outputs
│       ├── anotation_script_v2.py         # Data collection UI
│       └── visualization_of_images_time_range_v2.py  # Review and browsing
├── research/                              # Literature and domain research
│   ├── NICU_thermal_camera_adoption_landscape.md
│   ├── existing_NICU_temperature_monitoring_systems.txt
│   ├── postop_monitoring_full_competitive_landscape.md
│   ├── postop_sepsis_thermal_imaging_pivot_analysis.txt
│   ├── thermal_imaging_NICU_literature_review.md
│   └── thermal_wound_monitoring_competitors.md
├── regulatory/                            # Compliance and regulatory documents
│   ├── fda_510k_thermal_cameras.txt
│   ├── off_label_use_and_software_regulatory_framework.txt
│   └── [other regulatory analysis]
├── notes/                                 # Project notes and session records
├── papers/                                # Academic papers and references
├── .planning/                             # GSD planning documents
│   └── codebase/                         # Architecture and structure analysis
│       ├── ARCHITECTURE.md               # (this file - generated)
│       └── STRUCTURE.md                  # (this file - generated)
└── .git/                                 # Version control
```

## Directory Purposes

**app/:**
- Purpose: Placeholder structure for production NeoTherm application (not yet implemented)
- Contains: Empty subdirectories for frontend, hardware, and model components
- Status: Reserved for future development; currently no active code

**greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/:**
- Purpose: Reference implementation of the neonatal sepsis detection system from collaborating university
- Contains: Complete pipeline from raw thermal images to clinical alerts
- Status: Active, foundational implementation

**greek github project/.../Rejection Mechanism/:**
- Purpose: Quality control gates for measurement validity
- Contains: Validation rules (completeness, bounds, occlusion detection)
- Key files: `rejection.py` - implements filtering logic

**greek github project/.../Temperature Extraction/:**
- Purpose: Convert thermal images to temperature values and map to anatomical points
- Contains: Thermal-to-grayscale conversion, OCR-based calibration, coordinate-to-temperature mapping
- Key files:
  - `termic2grayscale.py` - builds lookup tables and normalizes thermal images
  - `extract_temperatures_zone.py` - applies LUT and extracts region temperatures

**greek github project/.../Human Error/:**
- Purpose: Analysis artifacts from validation studies
- Contains: Aggregated annotation datasets and statistical computations
- Status: Reference data from initial clinical validation (71 neonates, 3 detailed cases)

**research/:**
- Purpose: Domain knowledge collection for clinical context
- Contains: Market analysis, competitive landscape, regulatory environment, adoption barriers
- Status: Reference material for product positioning and feasibility assessment

**regulatory/:**
- Purpose: Compliance pathway documentation
- Contains: FDA device classification, EU MDR frameworks, privacy considerations
- Status: Reference for go-to-market strategy

**notes/:**
- Purpose: Working notes and session summaries
- Status: Internal knowledge base

## Key File Locations

**Entry Points (Executable):**
- `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/anotation_script_v2.py`: Run to launch annotation UI
- `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/termic2grayscale.py`: Run to convert thermal images to normalized grayscale
- `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/extract_temperatures_zone.py`: Run to map keypoints to temperature values
- `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/visualization_of_images_time_range_v2.py`: Run to browse and visualize annotated data

**Configuration & Data Files:**
- `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/min_max_dict.json`: Cached min/max temperature values per thermal image (generated)
- `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Human Error/Annotations.json`: Aggregated annotation records
- `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Human Error/computed_stats.json`: Statistical analysis outputs

**Core Logic:**
- `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Rejection Mechanism/rejection.py`: Measurement validation rules
- `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/termic2grayscale.py`: Color-to-temperature mapping logic
- `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/extract_temperatures_zone.py`: Keypoint temperature extraction

**Testing/Validation:**
- `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/visualization_of_images_time_range_v2.py`: Interactive validation tool

**Documentation:**
- `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/README.md`: Complete system description with pipeline overview, results, and clinical impact

## Naming Conventions

**Files:**
- Python scripts: lowercase with underscores, descriptive name + version suffix
  - Examples: `anotation_script_v2.py`, `extract_temperatures_zone.py`, `termic2grayscale.py`
- JSON data files: descriptive name with `_annotated` or `_dataset` suffix
  - Examples: `final.json`, `final_annotations_validation.json`, `min_max_dict.json`
- CSV tracking files: purpose + extension
  - Example: `tracking.csv` (contains columns: Baby ID, paths, reasons)

**Directories:**
- Functional areas: PascalCase or plain English describing responsibility
  - Examples: `Temperature Extraction`, `Rejection Mechanism`, `Human Error`, `Pose Detection`
- Baby/patient folders: numeric ID (e.g., `01`, `35`, `48`)
- Date folders: YYYYMMDD format or ISO date

**Variables & Functions:**
- Snake_case for functions and variables
  - Examples: `extract_min_max()`, `create_lut()`, `normalize_to_global()`, `coordinates2temperature()`
- Class names: PascalCase
  - Examples: `LoadingDialog`, `AnnotationWindow`, `BalancedImageAnnotator`

**Image Files:**
- Thermal images: timestamp format `HM[YYYYMMDDHHMMSS].jpeg` or similar
- RGB pairs: `[thermal_name]_VIS.[ext]` or `[thermal_name].VIS.[ext]` (case variations supported)
- Processed outputs: `[base_name]_[type].png` (e.g., `case48_thermal_annot.png`)

## Where to Add New Code

**New Feature (e.g., automated alignment, enhanced rejection):**
- Primary code: Create new Python script in `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/[Feature Name]/[script_name].py`
- Entry point: Add execution call to main pipeline or standalone runner
- Data inputs: Load from existing JSON structures (annotations, measurements)
- Data outputs: Append to or create new JSON with consistent structure

**New Component/Module (e.g., pose detection fine-tuning):**
- Implementation: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Pose Detection/[model_name].py`
- Dependencies: Document in docstring and README
- Integration: Add as import and step in main pipeline execution

**Utilities (shared helpers):**
- Shared helpers: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/utils.py` (doesn't exist yet; create if adding reusable functions)
- Temperature conversion: Add function to `Temperature Extraction/extract_temperatures_zone.py` or create dedicated module
- Image processing: Add to `Temperature Extraction/termic2grayscale.py` or new `image_processing.py`

**Test/Validation Data:**
- Sample datasets: Organize in `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/test_data/[baby_id]/` structure
- Expected outputs: Save to `test_data/[baby_id]/expected_[type].json`

## Special Directories

**greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Cropping mechanisms/:**
- Purpose: Boundary box detection and ROI extraction (unused in current pipeline)
- Generated: No
- Committed: Yes (reference implementation)
- Status: Experimental; not integrated into main workflow

**greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Pose Detection/:**
- Purpose: Reserved for HRNet model and pose estimation code
- Generated: Model weights downloaded at runtime from PyTorch/torchvision
- Committed: No (models not stored; loaded via external dependency)
- Status: Currently uses pre-trained HRNet-W48 from torchvision library

**greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Time-Series And Alarm Raising/:**
- Purpose: Temporal pattern tracking and clinical alert generation
- Generated: No
- Committed: Yes (directory exists but empty - planned feature)
- Status: Logic currently in main pipeline or visualization script

**greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/docs/:**
- Purpose: Documentation and visual outputs
- Generated: Yes (annotated images saved from visualization script)
- Committed: No (output images not tracked)
- Status: Contains Report.pdf and images folder for visualization

**greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/.git/:**
- Purpose: Version control metadata
- Generated: Yes
- Committed: Yes (git internal)
- Status: Separate git repo embedded in main project (git submodule or clone)

---

*Structure analysis: 2026-03-14*
