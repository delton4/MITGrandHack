# Testing Patterns

**Analysis Date:** 2026-03-14

## Test Framework

**Status:** No formal testing framework detected

**Framework:** Not applicable - no test framework configured
- No `pytest.ini`, `unittest.cfg`, `tox.ini` found
- No test files with `.test.py` or `.spec.py` pattern identified
- No test runner configuration in package managers

**Assertion Library:** Not applicable

**Run Commands:**
- No test execution commands configured
- Scripts are run directly: `python anotation_script_v2.py`

## Test File Organization

**Location:** Not applicable - no test files present

**Naming:** N/A

**Structure:** N/A

## Test Structure

**Suite Organization:** Not used

**Patterns:** Not applicable - no test suite exists

## Mocking

**Framework:** Not used

**Patterns:** Not applicable

**What to Mock:** Not established

**What NOT to Mock:** Not established

## Fixtures and Factories

**Test Data:** Not applicable

**Location:** Data is production/research data, not test fixtures
- JSON annotation files: `annotations/time_series_48.json`
- CSV tracking files created at runtime
- Real thermal and RGB image files used for annotation

## Coverage

**Requirements:** No coverage requirements enforced

**View Coverage:** No coverage tooling configured

## Test Types

### Unit Tests
- **Status:** Not used
- **Approach:** N/A
- **Why:** Research scripts focused on data processing and GUI, not unit-testable components

### Integration Tests
- **Status:** Not used
- **Approach:** N/A
- **Why:** Manual testing through GUI interaction and verification of output files

### E2E Tests
- **Status:** Not used
- **Approach:** Manual
- **What's tested manually:**
  - Image annotation workflow end-to-end in `anotation_script_v2.py`
  - Temperature extraction pipeline in `extract_temperatures_zone.py`
  - Thermal image visualization in `visualization_of_images_time_range_v2.py`

## Current Testing Approach

**Manual Verification:**
- GUI-based testing through `BalancedImageAnnotator` interface
- Verification of output files:
  - JSON annotation files: `annotations/48_annotated.json`
  - CSV tracking: Verified by checking file existence and row counts
  - Output images: Manual inspection of saved images

**Quality Assurance Mechanisms:**

**File-based validation:**
- JSON file existence checks: `os.path.exists(self.annotations_file)`
- CSV header validation: `headers = next(reader)` with error handling
- Image file format validation: Extension checking (`.jpg`, `.jpeg`, `.png`)

**Data validation:**
- EXIF data parsing with error recovery: `apply_exif_orientation()` function in `anotation_script_v2.py` lines 88-115
- Temperature range validation: `if 10<img_min<40 and 30<img_max<50:` in `termic2grayscale.py` line 76
- Annotation count validation: `if len(self.annotations) != 9:` in `anotation_script_v2.py` line 258

**UI-based validation:**
- Message boxes for user confirmation: `messagebox.showwarning()`, `messagebox.showerror()`
- Loading dialog timeout detection: 60-second timeout with fallback message in `anotation_script_v2.py` line 383

## Error Handling Test Patterns

**File operation errors:**
```python
# From anotation_script_v2.py lines 436-445
def load_existing_annotations(self):
    if os.path.exists(self.annotations_file):
        try:
            with open(self.annotations_file, 'r') as f:
                existing_annotations = json.load(f)
                # Process annotations
        except (json.JSONDecodeError, FileNotFoundError):
            pass  # Gracefully continue if file invalid
```

**EXIF processing with fallback:**
```python
# From anotation_script_v2.py lines 88-115
def apply_exif_orientation(image):
    """Aplica manualmente la rotación según la orientación EXIF."""
    try:
        exif = image._getexif()
        if exif is not None:
            # Process EXIF orientation
    except Exception as e:
        print(f"Error al procesar orientación EXIF: {e}")
    return image  # Return even if EXIF processing failed
```

**Robust image loading with recovery:**
```python
# From visualization_of_images_time_range_v2.py lines 41-49
thermal_img = cv2.imread(thermal_path)
aligned_img = cv2.imread(aligned_path)

if thermal_img is None:
    raise FileNotFoundError(f"Could not load thermal image: {thermal_path}")
if aligned_img is None:
    raise FileNotFoundError(f"Could not load aligned image: {aligned_path}")
```

## Data Pipeline Validation

**Temperature extraction pipeline:**
- Validates temperature ranges before saving: `if 10<img_min<40 and 30<img_max<50:`
- Graceful error handling for invalid images: `except: print(...)` in `termic2grayscale.py`

**Annotation tracking:**
- CSV header written on first write: `if os.stat(self.tracking_file).st_size == 0:`
- Duplicate processing prevention: Tracked paths stored in `self.processed` set
- Baby image balance validation: Weighted random selection ensures distribution

**Image correspondence validation:**
- RGB-thermal pairing verification: `get_rgb_path()` checks multiple naming conventions
- Case-insensitive matching: `_vis`, `.vis`, `_VIS`, `.VIS` all supported
- Missing partner file handling: Returns `None`, allows skip or manual selection

## Testing Recommendations for Future Phases

**Unit Testing Opportunities:**
- `extract_min_max()` function: OCR value extraction testable with mock images
- `coordinates2temperature()` function: Temperature lookup mapping testable with fixed data
- `create_lut()` function: LUT creation testable with known inputs
- `get_rgb_path()` function: Path resolution testable with mock file systems

**Integration Testing:**
- Full annotation workflow: Create temporary datasets, verify JSON output structure
- Temperature extraction pipeline: Test end-to-end from thermal image to temperature values
- Visualization loading: Test filtering, browsing, and image pair loading

**Test Infrastructure Needed:**
- `pytest` for test framework
- `pytest-mock` for mocking file operations
- Temporary directory fixtures for file I/O testing
- Sample thermal/RGB image pairs for integration tests

---

*Testing analysis: 2026-03-14*
