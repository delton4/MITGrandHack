# Technology Stack

**Analysis Date:** 2026-03-14

## Languages

**Primary:**
- Python 3.6+ - Core ML/vision pipeline and utilities
- Python 3.8+ - Pose detection and image processing scripts
- Jupyter Notebooks - Interactive analysis and exploration notebooks

## Runtime

**Environment:**
- Python interpreter (3.6-3.8+ depending on module)
- CPU or GPU (CUDA recommended for HRNet inference)

**Package Manager:**
- pip - Python package management
- Lockfile: Not present (uses requirements.txt)

## Frameworks

**Core ML/Vision:**
- PyTorch 2.0+ - Deep learning framework for inference
- HRNet-W48 - Pre-trained pose estimation model for neonatal keypoint detection
  - Input: 384x288 resolution
  - Output: 17 anatomical keypoints with confidence scores
  - Weights: `pose_hrnet_w48_384x288.pth` (downloaded separately)

**Image Processing:**
- OpenCV 4.5.5.64+ - Image I/O, transformation, color space conversion
- PIL/Pillow 9.0.0+ - Image manipulation and EXIF data handling
- scikit-image - Advanced image processing algorithms

**Data Processing:**
- NumPy 1.21.0+ - Array operations and numerical computing
- pandas - Data structure and CSV handling
- SciPy - Scientific computing utilities

**Utilities:**
- Jupyter/IPython - Interactive notebook environment
- Tkinter - GUI for image annotation tool
- PyYAML - Configuration file parsing (for HRNet)
- Cython - Performance optimization

**Testing/Monitoring:**
- tensorboardX 1.6+ - Visualization and logging support

## Key Dependencies

**Critical:**
- torch>=2.0.0 - Model inference engine
- opencv-python==4.5.5.64 - Image processing backbone
- numpy>=1.21.0 - Numerical operations
- pillow>=9.0.0 - Image I/O and manipulation

**Image Analysis:**
- scikit-image - Morphological operations and segmentation
- scipy - Mathematical functions and statistics
- shapely==1.8.5 - Geometric operations (for cropping/alignment)

**Data Handling:**
- pandas - CSV/tabular data processing
- pyyaml - Configuration serialization
- json_tricks - Enhanced JSON serialization (for complex types)
- EasyDict==1.7 - Attribute-based dict access for configs

**Development:**
- Cython - C-extensions compilation
- yacs>=0.1.5 - Configuration management (HRNet)

## Configuration

**Environment:**
- No .env files used (data paths are hardcoded in notebooks/scripts)
- Model configuration: YAML files specify HRNet architecture and hyperparameters
  - Referenced: `experiments/coco/hrnet/w48_384x288_adam_lr1e-3.yaml`

**Build:**
- No build configuration files present
- Manual setup required: Download HRNet weights from official Google Drive

## Platform Requirements

**Development:**
- Python 3.6-3.8 for HRNet compatibility
- CUDA 11+ (recommended for GPU acceleration)
- ~252GB storage for full neonatal thermal imaging dataset

**Data Paths:**
- Aligned images: `/data/uabcvmsc/cvmsct01/CroppingMechanisms/newbornAligned/`
- Validation dataset: `/data/uabcvmsc/cvmsct01/DATASETS/NewbornDataset/`
- Output JSON annotations: `/data/uabcvmsc/cvmsct01/PostureDetection/HRNet-Human-Pose-Estimation/full_output/`
- HRNet model weights: `models/pose_hrnet_w48_384x288.pth`

**Production (Clinical):**
- Not yet deployed to production
- Designed for NICU environments with thermal and RGB camera hardware

## Input/Output Specifications

**Camera Input:**
- Thermal images: 640×480 PNG
- RGB images: 3264×2448 JPEG/PNG
- Both streams require homography alignment for modality correspondence

**Output:**
- JSON annotations containing:
  - Image file paths
  - Keypoint coordinates (x, y)
  - Body zone labels (Zona1 core, extremities, etc.)
  - Confidence scores (0.0-1.0)
- CSV tracking files for annotation workflow
- Temperature values extracted from thermal pixels

---

*Stack analysis: 2026-03-14*
