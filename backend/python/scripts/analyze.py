import sys
from pathlib import Path

sys.path.append(
    str(
        Path(__file__).resolve().parents[1]
    )
)

from core.detector import detect_defects
from core.ai import generate_aircraft_intelligence
from core.history import get_aircraft_history
from firebase.save_inspection import save_inspection

import json
import sys

image_path = sys.argv[1]

section = (
    sys.argv[2]
    if len(sys.argv) > 2
    else "Unknown"
)

aircraft_id = (
    sys.argv[3]
    if len(sys.argv) > 3
    else None
)

history = get_aircraft_history(
    aircraft_id
)

defects = detect_defects(image_path)

results = []

for defect in defects:

    defect["location"] = section

    intel = generate_aircraft_intelligence(
        defect,
        history
    )

    result = {

        "location": section,

        "class": defect["class"],

        "confidence": defect["confidence"],

        "occurrences": intel["occurrences"],

        "x": defect["x"],
        "y": defect["y"],
        "width": defect["width"],
        "height": defect["height"],

        "severity": intel["severity"],
        "urgency": intel["urgency"],

        "futureRisk": intel["futureRisk"],
        "riskCategory": intel["riskCategory"],

        "criticalityIndex": intel["criticalityIndex"],

        "healthScore": intel["healthScore"],
        "healthStatus": intel["healthStatus"],

        "aircraftStatus": intel["aircraftStatus"],

        "maintenanceBurden": intel["maintenanceBurden"],
        "maintenanceCost": intel["maintenanceCost"],

        "zoneRisk": intel["zoneRisk"],

        "inspectionWindow": intel["inspectionWindow"],

        "missionReadiness": intel["missionReadiness"],

        "reliability": intel["reliability"],

        "failureProbability":
        intel["failureProbability"],

        "remainingUsefulHealth":
        intel["remainingUsefulHealth"],

        "predictedMaintenanceCost":
        intel["predictedMaintenanceCost"],

        "fleetPriorityRank":
        intel["fleetPriorityRank"],

        "trend":
        intel["trend"],

        "growthRate":
        intel["growthRate"],

        "predictedArea30Days":
        intel["predictedArea30Days"],

        "recommendation":
        intel["recommendation"],

        "executiveSummary":
        intel["executiveSummary"]

    }

    save_inspection(
        aircraft_id,
        result
    )


    results.append(result)

    print(
        json.dumps(results)
    )