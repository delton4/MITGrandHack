# Codebase Concerns

**Analysis Date:** 2026-03-14

## Hardcoded Absolute Paths

**Critical Issue - Breaks on Different Environments:**

Absolute paths are hardcoded throughout the codebase, making scripts non-portable:

- Files:
  - `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/visualization_of_images_time_range_v2.py` (lines 26-27): `D:\newbornValMatrixAligned`, `D:\newborn`
  - `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/extract_temperatures_zone.py` (line 58): `\\data\\uabcvmsc\\cvmsct01\\DATASETS\\NewbornDatasetGrayscale\\`
  - `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/termic2grayscale.py` (line 56): `/data/uabcvmsc/shared/newborn`

**Impact:** Scripts cannot run on any system where paths differ. Data processing fails immediately on different machines or environments.

**Fix approach:** Replace hardcoded paths with:
- Configuration files (.env or config.yaml)
- Command-line arguments
- Runtime path discovery using `pathlib` and relative paths
- Environment variables for data directories

---

## Bare Exception Handling

**Issue - Silent Failures & Difficult Debugging:**

Several locations use bare `except` clauses that swallow all exceptions:

- `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/termic2grayscale.py` (line 78): `except:` catches all exceptions without logging
  - Only prints image path, no error details
  - Silent failure means processing continues with incomplete data

**Impact:** Errors go undetected. Invalid data can propagate through pipeline. Debugging becomes extremely difficult.

**Fix approach:** Replace bare `except:` with specific exception types:
```python
except (FileNotFoundError, ValueError, OCRException) as e:
    logger.error(f"OCR extraction failed for {img_path}: {str(e)}")
```

---

## Missing Input Validation

**Issue - Invalid Temperature Data Accepted:**

- File: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/termic2grayscale.py` (lines 70-76)
  - Manual temperature validation exists but only checks ranges (10-40°C for min, 30-50°C for max)
  - No validation on OCR text quality confidence
  - Comma-stripping (lines 40-44 in `termic2grayscale.py`) is fragile - what if other characters are extracted?

**Impact:** Garbage temperature values from OCR extraction can flow into clinical decision-making system. A misread "38°C" as "88°C" or "3.8°C" has severe consequences for sepsis detection.

**Fix approach:**
- Add OCR confidence score checking
- Validate extracted text matches expected format before conversion
- Add outlier detection in temperature sequences
- Log all temperature readings with confidence scores

---

## Hardcoded Skip Window Size

**Issue - Magic Number Without Rationale:**

- File: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/extract_temperatures_zone.py` (lines 5, 20-23)
  - `SIDE=1` controls the neighborhood size for temperature extraction
  - No explanation for why 1 pixel is used
  - No bounds checking - if x or y is at image edge, this could cause index errors

**Impact:** Temperature sampling window is unclear. Edge case pixels at image boundaries may have incorrect sampling.

**Fix approach:**
- Make `SIDE` configurable
- Document the rationale (e.g., "1 pixel neighborhood = 15×15mm at 640×480 resolution")
- Add bounds checking or padding for edge cases
- Add validation that sampled region contains valid data

---

## Known Documented Bug - Not Fixed

**Issue - UI Boundary Error:**

- File: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/anotation_script_v2.py` (lines 70-71)
  - **Documented bug in code comments:** "If during the annotation you skip using the right click of the mouse but you are outside the image it leads to an error cause you're outside the boundaries."
  - Right-click handler `on_thermal_right_click()` (line 248) doesn't validate click position
  - Bug causes program to crash during normal user interaction

**Impact:** Annotation workflow breaks when users right-click outside image boundaries. Data loss possible if annotations not saved.

**Fix approach:** Add boundary check in `on_thermal_right_click()`:
```python
def on_thermal_right_click(self, event):
    pos = self.get_click_position(event)
    if pos is None:  # Skip was outside image
        return
```

---

## Inconsistent File Path Handling

**Issue - Platform-Specific Path Logic:**

- File: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/extract_temperatures_zone.py` (line 59)
  - Hardcoded Windows path with backslashes: `"\\data\\...\\"`
  - Script also uses Unix path format elsewhere: `/data/uabcvmsc/shared/newborn` (line 56)
  - No `pathlib` usage - mixes string concatenation with `os.path.join()`

**Impact:** Code cannot run on Unix/Mac systems due to Windows path format. Path handling is fragile and error-prone.

**Fix approach:** Use `pathlib.Path` consistently:
```python
from pathlib import Path
data_path = Path("/data") / "uabcvmsc" / "cvmsct01" / "DATASETS"
```

---

## Uninitialized Global Variables

**Issue - Race Conditions in Threading Code:**

- File: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/anotation_script_v2.py`
  - `self.loading_dialog` initialized as None (line 276), but accessed in multiple threads
  - `self._safely_close_loading_dialog()` (lines 419-425) has race condition check: `if hasattr(self, 'loading_dialog')`
  - Threading doesn't use locks for shared state modifications (lines 398-410)

**Impact:** Race condition if main thread and loading thread access/modify dialog state simultaneously. Potential crash or corrupted UI state.

**Fix approach:** Use threading locks for shared state:
```python
from threading import Lock
self.loading_lock = Lock()
with self.loading_lock:
    if self.loading_dialog is not None:
        self.loading_dialog.destroy()
```

---

## Silent Timeout in Loading

**Issue - User Experience Without Feedback:**

- File: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/anotation_script_v2.py` (line 383)
  - 180-second timeout hardcoded (`60000*3` milliseconds = 180 seconds)
  - No clear feedback to user that timeout occurred
  - "Timed out" warning message is vague

**Impact:** If large image directories take >3 minutes to load, process silently fails. User doesn't know if system is still working or has problems.

**Fix approach:**
- Make timeout configurable
- Show elapsed time counter in loading dialog
- Provide granular progress feedback (e.g., "Loaded 250/1000 images...")

---

## Missing Error Recovery - Critical System Failure

**Issue - Graceful Degradation Missing:**

- File: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/anotation_script_v2.py` (line 414)
  - `initialize_system_thread()` catches generic `Exception` but doesn't differentiate failure types
  - If image loading fails, annotation tool becomes unusable
  - No fallback to partial functionality

**Impact:** Single corrupted image in dataset can prevent entire annotation system from starting. User must manually debug and remove problematic files.

**Fix approach:** Add granular exception handling:
```python
except FileNotFoundError as e:
    self.root.after(0, lambda: messagebox.showwarning("Missing files", f"Could not find: {e}"))
    self.skip_problematic_file()
except MemoryError:
    self.root.after(0, lambda: messagebox.showwarning("Memory", "Dataset too large. Process subset?"))
```

---

## Missing Type Hints & Documentation

**Issue - Code Intent Unclear:**

- Files: All Python scripts lack type hints and docstrings for function parameters/returns
  - `anotation_script_v2.py`: ~680 lines with minimal inline documentation
  - `extract_temperatures_zone.py`: ~73 lines, unclear what function returns
  - `termic2grayscale.py`: Some functions have docstrings but return types undefined

**Impact:** Difficult to use APIs correctly. IDE cannot provide autocompletion. Future modifications introduce bugs.

**Fix approach:** Add type hints and docstrings:
```python
def get_rgb_path(self, thermal_path: str) -> Optional[str]:
    """Find RGB image corresponding to thermal image.

    Args:
        thermal_path: Absolute path to thermal image file

    Returns:
        Path to corresponding RGB file, or None if not found

    Raises:
        FileNotFoundError: If thermal image doesn't exist
    """
```

---

## Dependency Conflict Risk

**Issue - Pinned Old Dependency Versions:**

- File: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Pose Detection/requirements.txt`
  - OpenCV pinned to 4.5.5.64 (May 2021) - current is 4.9.x
  - Shapely pinned to 1.8.5 (2022) - current is 2.0.x (breaking API change)
  - No PyTorch/TensorFlow specified despite README mentioning "PyTorch 2.0+"
  - `Cython` and other packages unpinned - may cause incompatibilities

**Impact:**
- Security vulnerabilities from old OpenCV
- Incompatible dependency versions when running on modern Python (3.11+)
- "Works on my machine" syndrome across different environments

**Fix approach:**
- Update to latest compatible versions with `poetry` or `pip-tools`
- Add Python version constraint (e.g., `python >= 3.8, < 3.12`)
- Document tested environment (Python 3.9, Ubuntu 20.04, CUDA 11.8)

---

## Scalability Concern - File I/O Bottleneck

**Issue - Inefficient Batch Processing:**

- File: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Temperature Extraction/extract_temperatures_zone.py` (lines 52-67)
  - Processes annotations sequentially, one image at a time
  - Loads entire gray image into memory even if only 1 pixel is needed
  - No caching of repeated image reads

**Impact:** Dataset with 1000+ images processes slowly. Threading/multiprocessing could speed up 4-8x.

**Fix approach:** Use `multiprocessing.Pool` for image processing:
```python
from multiprocessing import Pool
with Pool(processes=4) as pool:
    results = pool.map(process_image, image_paths)
```

---

## Test Coverage Gaps

**Untested Areas:**

- **EXIF Orientation Logic**: `anotation_script_v2.py` (lines 87-115) - critical image manipulation, untested
  - What if EXIF tag is malformed?
  - Rotation logic assumes specific EXIF values

- **CSV Tracking File**: `anotation_script_v2.py` (lines 590-596, 628-634) - multiple writes to same file
  - No validation that CSV file is valid after program crash
  - No locking mechanism prevents concurrent writes

- **Temperature Conversion**: `extract_temperatures_zone.py` (lines 12-32) - LUT lookup could have off-by-one errors
  - No tests for boundary pixels
  - What happens if gray_img has NaN or invalid values?

**Priority:** High - These are core functionality areas with potential for silent data corruption.

---

## Missing Logging Infrastructure

**Issue - No Structured Logging:**

- All Python scripts use `print()` for diagnostics
- No log levels (INFO, WARNING, ERROR)
- No timestamps
- Logs go to stdout, not persistent file

**Impact:** Production errors disappear. Difficult to debug clinical failures. Audit trail missing for regulatory compliance.

**Fix approach:** Implement logging:
```python
import logging
logger = logging.getLogger(__name__)
logger.error(f"Temperature extraction failed: {img_path}", exc_info=True)
```

---

## Data Validation Missing in JSON Pipeline

**Issue - No Schema Validation:**

- Files:
  - `anotation_script_v2.py` (line 572): Loads JSON without schema validation
  - `rejection.py` (line 4): Loads JSON, trusts structure
  - `extract_temperatures_zone.py` (line 41): No validation that JSON has expected keys

**Impact:** Corrupted or modified JSON silently causes downstream errors. No early detection of data integrity issues.

**Fix approach:** Use `pydantic` or `jsonschema`:
```python
from pydantic import BaseModel, validator
class AnnotationSchema(BaseModel):
    thermal_image: str
    anotaciones: List[Dict]

    @validator('anotaciones')
    def validate_annotations(cls, v):
        if not isinstance(v, list):
            raise ValueError("anotaciones must be list")
        return v
```

---

## Single Hardcoded Baby ID in Visualization

**Issue - Script Not Reusable:**

- File: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/visualization_of_images_time_range_v2.py` (line 227)
  - Baby ID hardcoded as `35`: `and baby_id == 35`
  - Script cannot be used for other patients
  - Would require code modification for different baby

**Impact:** Script is not generalizable. Every time you need to visualize a different patient's data, code must be edited.

**Fix approach:** Make baby ID a command-line argument:
```python
import argparse
parser = argparse.ArgumentParser()
parser.add_argument('--baby-id', type=int, required=True)
args = parser.parse_args()
```

---

## Incomplete Error Handling in UI

**Issue - No Fallback for Missing RGB Images:**

- File: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/anotation_script_v2.py` (lines 509-533)
  - If RGB image loading fails, `show_image()` catches exception and calls `next_image()`
  - User sees thermal image disappear without explanation
  - No log of which images failed

**Impact:** Silent data loss. User doesn't know annotation was skipped. Incomplete dataset without clear tracking.

**Fix approach:** Add specific error reporting:
```python
except FileNotFoundError:
    self.root.after(0, lambda: messagebox.showerror(
        "Missing RGB",
        f"RGB image not found for {thermal_path}"
    ))
    self.log_skipped_image(thermal_path, "missing_rgb")
```

---

## Memory Leak Risk in Threading

**Issue - Dialog References Not Cleaned Up:**

- File: `greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/anotation_script_v2.py` (lines 117-127, 379-381)
  - `LoadingDialog` created but may not be properly destroyed if exception occurs
  - `self.loading_dialog` reference retained in memory

**Impact:** Long-running sessions with multiple large datasets may accumulate memory. Eventually crashes with out-of-memory error.

**Fix approach:** Use context manager pattern:
```python
class LoadingDialog:
    def __enter__(self):
        return self
    def __exit__(self, *args):
        self.destroy()
```

---

*Concerns audit: 2026-03-14*
