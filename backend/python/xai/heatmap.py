
import sys
import cv2
import numpy as np
import os

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

EIGENCAM_PATH = (
    BASE_DIR.parent.parent
    / "resources"
    / "example-scripts"
    / "explainable-ai"
    / "eigencam-yolov8"
)

sys.path.insert(0, str(EIGENCAM_PATH))

from ultralytics import YOLO
sys.path.insert(0, EIGENCAM_PATH)

from yolov8_cam.eigen_cam import EigenCAM
from yolov8_cam.utils.image import show_cam_on_image


MODEL_PATH = os.path.join(
    BASE_DIR,
    "..",
    "models",
    "best.pt"
)
model = YOLO(MODEL_PATH,verbose=False)

# Target layer used by the notebook
target_layers = [model.model.model[-4]]

cam = EigenCAM(
    model,
    target_layers,
    task="od"
)


def generate_heatmap(image_path, output_path):

    img = cv2.imread(image_path)

    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    rgb_img = cv2.resize(rgb_img, (640, 640))

    normalized = np.float32(rgb_img) / 255

    grayscale_cam = cam(
        rgb_img,
        eigen_smooth=True,
        principal_comp=[7]
    )

    cam_image = show_cam_on_image(
        normalized,
        grayscale_cam[0, :, :, 0],
        use_rgb=True
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save Heatmap
    heatmap = cv2.cvtColor(cam_image, cv2.COLOR_RGB2BGR)
    cv2.imwrite(output_path, heatmap)

      # ----------------------------
      # Create Overlay
      # ----------------------------

    original = cv2.imread(image_path)

    original = cv2.resize(
          original,
          (heatmap.shape[1], heatmap.shape[0])
      )

    overlay = cv2.addWeighted(
          original,
          0.55,
          heatmap,
          0.45,
          0
      )

    overlay_path = output_path.replace(
          "heatmaps",
          "overlays"
      )

    os.makedirs(
          os.path.dirname(overlay_path),
          exist_ok=True
      )

    cv2.imwrite(
          overlay_path,
          overlay
      )
    

    return {
        "heatmap": output_path,
        "overlay": overlay_path
    }
    
