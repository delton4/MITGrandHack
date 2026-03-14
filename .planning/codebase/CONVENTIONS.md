# Coding Conventions

**Analysis Date:** 2026-03-14

## Naming Patterns

**Files:**
- Snake case with version numbers: `anotation_script_v2.py`, `visualization_of_images_time_range_v2.py`
- Descriptive names indicating purpose: `extract_temperatures_zone.py`, `termic2grayscale.py`, `rejection.py`
- Spanish language used in comments and docstrings across the codebase

**Functions:**
- Snake case: `create_lut()`, `extract_min_max()`, `coordinates2temperature()`, `apply_exif_orientation()`
- Descriptive names indicating operation: `get_rgb_path()`, `get_click_position()`, `load_images()`
- Private/internal functions use underscore prefix: `_safely_close_loading_dialog()`, `_timeout_loading_dialog()`, `_safely_enable_and_continue()`

**Variables:**
- Snake case: `baby_images`, `thermal_path`, `rgb_path`, `remaining_images`, `selected_counts`
- Short variable names used in mathematical contexts: `x`, `y`, `h`, `w` for coordinates and dimensions
- Abbreviations: `rgb_path`, `thermal_path`, `csv`, `json`, `lut` (lookup table)
- Constants use UPPERCASE: `SIDE=1` in `extract_temperatures_zone.py`

**Classes:**
- PascalCase: `AnnotationWindow`, `LoadingDialog`, `BalancedImageAnnotator`
- Descriptive names: Class names match their primary responsibility

## Code Style

**Formatting:**
- No explicit formatter configuration found (no `.prettierrc`, `biome.json`, etc.)
- Indentation: 4 spaces (Python standard)
- Line length: No strict limit enforced, but scripts vary (shortest ~18 chars, longest ~90+ chars)
- Imports organized but not strictly grouped

**Linting:**
- No linting configuration files present (no `.eslintrc`, `.pylintrc`, `pyproject.toml`)
- No type hints used in the codebase
- No docstring standardization across files

## Import Organization

**Order:**
1. Standard library: `os`, `json`, `csv`, `tkinter`, `threading`, `datetime`, `shutil`, `random`, `numpy`, etc.
2. Third-party libraries: `PIL`, `cv2`, `matplotlib`, `easyocr`, `scipy`
3. Internal modules: Not present (single-file scripts mostly)

**Path Aliases:**
- Absolute paths used throughout for file operations
- Hardcoded base paths: `/data/uabcvmsc/cvmsct01/DATASETS/` in `extract_temperatures_zone.py`
- Relative path construction: `os.path.relpath()` used in annotation tool

## Error Handling

**Patterns:**
- Bare `except:` blocks used without exception type specification (not recommended but present):
  - `extraction.py` line 78: `except: print("\nError with image: ", img_path)`
- Try-except blocks with specific error handling:
  - `FileNotFoundError` explicitly caught: `visualization_of_images_time_range_v2.py` lines 46-48
  - `json.JSONDecodeError` caught: `anotation_script_v2.py` line 444
  - Generic exception handling with logging: `extract_temperatures_zone.py` lines 63-65

**Error Recovery:**
- Dialog-based error notifications using `messagebox.showerror()` in GUI code
- Graceful fallbacks: Missing files trigger skip/next operation
- Thread-safe error handling with `self.root.after()` for GUI updates from threads

## Logging

**Framework:** Native Python `print()` statements

**Patterns:**
- String concatenation with f-strings: `print(f"Error al procesar orientación EXIF: {e}")`
- Status messages for user feedback: `print("Iniciando carga de imágenes...")`
- Debugging output: `print(f"Error cargando imagen: {e}")`
- No structured logging framework (no `logging` module usage)

**When to Log:**
- Initialization steps (image loading, file tracking)
- Error conditions with context
- User-facing status in GUI applications
- Long-running operation progress

## Comments

**When to Comment:**
- Complex algorithms: `create_lut()` function has brief comments explaining steps
- Non-obvious coordinate transformations: Comments explain EXIF orientation handling
- Spanish comments used extensively for implementation clarity
- Inline comments explain array slicing and image region extraction

**JSDoc/TSDoc:**
- Docstrings used for functions describing purpose, args, returns
- Format: Triple-quoted strings at function start
- Example from `termic2grayscale.py`:
  ```python
  def aplicar_lut(imagen_rgb, lut):
      """
      Convierte una imagen RGB a temperaturas usando una Lookup Table (LUT).

      Args:
          imagen_rgb (numpy.ndarray): Imagen en formato RGB (shape: HxWx3).
          lut (dict): Diccionario que mapea colores (tuplas RGB) a temperaturas.

      Returns:
          numpy.ndarray: Matriz de temperaturas (shape: HxW).
      """
  ```

## Function Design

**Size:**
- Short utility functions: 5-15 lines (e.g., `get_rgb_path()`)
- Medium functions: 20-50 lines (e.g., `on_annotation_complete()`)
- Larger methods: Up to 200+ lines for complex GUI logic (e.g., `BalancedImageAnnotator.initialize_system_thread()`)

**Parameters:**
- Positional parameters for required values
- Optional parameters with defaults: `save_annotated=False` in visualization functions
- Method parameters often include `self` and event objects for GUI callbacks
- No keyword-only parameters pattern observed

**Return Values:**
- Early returns for error conditions or special cases
- None for void operations (file writes, GUI updates)
- Tuples for multiple related values: `(img_min, img_max)` from `extract_min_max()`
- Collections returned from processing: Lists in `create_min_max_dict()` returning dict

## Module Design

**Exports:**
- Scripts designed as standalone executables with `if __name__ == "__main__":` blocks
- No explicit public/private module API distinction
- Classes instantiated and used directly without factory patterns

**Barrel Files:**
- Not applicable (no barrel/index files found)
- Each script is self-contained or imports directly from other scripts

## Special Conventions Observed

**GUI Framework Pattern:**
- `tkinter` used for GUI applications
- Main application class inherits from no base, manages root window
- Separate window classes for dialogs: `LoadingDialog`, `AnnotationWindow`
- Event binding with lambda for keyboard shortcuts: `self.root.bind('a', lambda e: self.start_annotation())`

**Data Structure Patterns:**
- JSON for persistent data: annotations, tracking metadata
- CSV for tabular data tracking: image processing state and statistics
- Dictionaries with multiple nesting levels for configuration: `baby_images`, `remaining_images`, `selected_counts`

**Threading Conventions:**
- Daemon threads for long-running operations: `threading.Thread(target=..., daemon=True).start()`
- Main thread updates via `self.root.after()` for thread-safe GUI updates
- Loading dialog with timeout to prevent hanging: 60-second timeout with fallback

---

*Convention analysis: 2026-03-14*
