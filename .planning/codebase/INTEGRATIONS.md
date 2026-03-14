# External Integrations

**Analysis Date:** 2026-03-14

## APIs & External Services

**Pre-trained Models:**
- HRNet-W48 Pose Estimation - Used for anatomical keypoint detection
  - Source: Official HRNet GitHub repository (https://github.com/HRNet/HRNet-Human-Pose-Estimation)
  - Model file: `pose_hrnet_w48_384x288.pth` (downloaded separately)
  - Configuration: `experiments/coco/hrnet/w48_384x288_adam_lr1e-3.yaml`
  - Not actively called via API; weights loaded locally for inference

**No Remote API Integrations:**
- The system operates entirely offline
- No external cloud APIs are called
- No real-time data feeds from external services
- No webhook integrations with hospital systems

## Data Storage

**Databases:**
- None (No database system currently used)

**File Storage:**
- Local filesystem only (on research cluster)
  - Thermal/RGB image repository: `/data/uabcvmsc/cvmsct01/`
  - Annotation outputs: JSON files in `full_output/` directories
  - Model checkpoints: Local .pth files

**Data Format:**
- Images: PNG (thermal), JPEG/PNG (RGB)
- Annotations: JSON (custom schema with keypoints and confidence)
- Tracking: CSV files for annotation workflow state

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Not applicable - No user authentication system
- System runs on shared research cluster with filesystem-based access control
- No login credentials or API tokens required

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Console output only (print statements in Python scripts/notebooks)
- TensorboardX imported but used for potential visualization, not active logging

**Data Persistence:**
- No structured logging framework
- Progress saved via JSON checkpoint files (updated periodically)

## CI/CD & Deployment

**Hosting:**
- Research compute cluster at Universitat Autònoma de Barcelona
- GPU resources available for model inference
- SLURM job submission system for cluster jobs (referenced: `hrnet.slm`)

**CI Pipeline:**
- None detected

**Deployment Model:**
- Academic research project (not production deployment)
- Manual execution of Jupyter notebooks and Python scripts
- Batch processing of image datasets

## Environment Configuration

**Required env vars:**
- None - All paths hardcoded in notebooks/scripts

**Secrets location:**
- Not applicable - No credentials or secrets management

**Example Hardcoded Paths:**
```python
aligned_path = "/data/uabcvmsc/cvmsct01/CroppingMechanisms/newbornAligned"
validation_path = "/data/uabcvmsc/cvmsct01/DATASETS/NewbornDataset"
output_json_path = "/data/uabcvmsc/cvmsct01/PostureDetection/HRNet-Human-Pose-Estimation/full_output/pose_annotations_07.json"
```

Location: `/Users/diego/personal/MIT Grand Hack/greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/Pose Detection/posture_detection_pipeline.ipynb`

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Data Sources

**Clinical/Research:**
- General University Hospital of Patras, Greece
  - 71 neonates in validation cohort
  - 3 sepsis/fever case studies (Cases 36, 47, 48)
- University of Patras Department of Pediatrics
- No continuous feed; one-time dataset collection

**Image Datasets:**
- Thermal imaging camera (640×480 PNG format)
- RGB camera (3264×2448 JPEG format)
- Both captured simultaneously for same neonate

## Machine Learning Model Pipeline

**External Models Loaded:**
- HRNet-W48 (ImageNet pre-training)
  - Framework: PyTorch
  - Purpose: Human pose estimation adapted for neonatal anatomy
  - Input shape: (batch, 3, 384, 288)
  - Output: 17 keypoint heatmaps

**No Model Serving:**
- Models loaded directly into Python process
- Inference runs locally (CPU or GPU)
- No model versioning system

## Future Integration Opportunities

**Planned but Not Implemented:**
- Hospital Electronic Health Record (EHR) integration for clinical validation
- Real-time alert system for NICU staff
- Regulatory pathway components (EU MDR compliance documentation)
- Multi-center validation data from other hospitals

---

*Integration audit: 2026-03-14*
