import sys
from pathlib import Path

sys.path.append(
    str(
        Path(__file__).resolve().parents[1]
    )
)

from core.detector import detect_defects
from core.risk_engine import calculate_risk
from xai.heatmap import generate_heatmap
from xai.xai_report import generate_xai_report
from xai.xai_graph import generate_xai_graph

import json
import os

BASE_DIR = os.path.dirname(__file__)

image_folder = os.path.join(
    BASE_DIR,
    "images"
)

outputs_dir = os.path.join(
    BASE_DIR,
    "outputs"
)

heatmaps_dir = os.path.join(
    outputs_dir,
    "heatmaps"
)

reports_dir = os.path.join(
    outputs_dir,
    "reports"
)

graphs_dir = os.path.join(
    outputs_dir,
    "graphs"
)

os.makedirs(heatmaps_dir, exist_ok=True)
os.makedirs(reports_dir, exist_ok=True)
os.makedirs(graphs_dir, exist_ok=True)

all_results = []

for image_name in os.listdir(image_folder):

    image_path = os.path.join(
        image_folder,
        image_name
    )

    if not os.path.isfile(image_path):
        continue

    heatmap_path = os.path.join(
        heatmaps_dir,
        image_name
    )

    generate_heatmap(
        image_path,
        heatmap_path
    )

    defects = detect_defects(
        image_path
    )

    for defect in defects:

        risk = calculate_risk(
            defect["class"]
        )

        result = {

            "image": image_name,

            "location": defect["location"],

            "class": defect["class"],

            "confidence": defect["confidence"],

            "x": defect["x"],

            "y": defect["y"],

            "width": defect["width"],

            "height": defect["height"],

            "severity": risk["severity"],

            "urgency": risk["urgency"],

            "priority": risk["priority"],

            "recommendation": risk["recommendation"]

        }

        all_results.append(result)

        generate_xai_report(
            result,
            reports_dir
        )

        generate_xai_graph(
            result,
            graphs_dir
        )


with open(
    os.path.join(
        outputs_dir,
        "final_detection.json"
    ),
    "w"
) as f:

    json.dump(
        all_results,
        f,
        indent=4
    )
