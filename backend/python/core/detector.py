from ultralytics import YOLO
from PIL import Image
import os
from pathlib import Path
# =========================
# Load Models
# =========================

BASE_DIR = Path(__file__).resolve().parent.parent

DEFECT_MODEL_PATH = (
    BASE_DIR
    / "models"
    / "best.pt"
)

PART_MODEL_PATH = (
    BASE_DIR
    / "models"
    / "parts_best.pt"
)

DEFECT_MODEL = YOLO(
    str(DEFECT_MODEL_PATH)
)

PART_MODEL = YOLO(
    str(PART_MODEL_PATH)
)

# =========================
# Aircraft Part Detection
# =========================

def detect_parts(image_path):

    results = PART_MODEL(
        image_path
    )

    parts = []

    for result in results:

        for box in result.boxes:

            cls = int(box.cls[0])

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0]
            )

            parts.append({

                "part":
                PART_MODEL.names[cls],

                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2

            })

    return parts


# =========================
# Section Mapping
# =========================

def get_aircraft_section(
    defect_x,
    defect_y,
    parts
):

    for part in parts:

        if (
            part["x1"]
            <= defect_x
            <= part["x2"]
            and
            part["y1"]
            <= defect_y
            <= part["y2"]
        ):

            return part["part"]

    return "Unknown"


# =========================
# Defect Detection
# =========================

def detect_defects(image_path):

    Image.open(image_path)

    parts = detect_parts(
        image_path
    )

    results = DEFECT_MODEL(
        image_path
    )

    defects = []

    for result in results:

        for box in result.boxes:

            cls = int(box.cls[0])

            conf = float(
                box.conf[0]
            )

            x = int(
                box.xywh[0][0]
            )

            y = int(
                box.xywh[0][1]
            )

            width = int(
                box.xywh[0][2]
            )

            height = int(
                box.xywh[0][3]
            )

            section = get_aircraft_section(
                x,
                y,
                parts
            )

            defects.append({

                "class":
                DEFECT_MODEL.names[cls],

                "confidence":
                round(conf, 2),

                "location":
                section,

                "x": x,

                "y": y,

                "width": width,

                "height": height

            })

    return defects


if __name__ == "__main__":

    image_path = "images/test_aircraft.jpg"

    results = detect_defects(
        image_path
    )
