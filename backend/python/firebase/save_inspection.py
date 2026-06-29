
import sys
from pathlib import Path

sys.path.append(
    str(
        Path(__file__).resolve().parents[1]
    )
)

from firebase.firebase_service import db
from datetime import datetime


def save_inspection(
    aircraft_id,
    result
):

    db.collection(
        "inspections"
    ).add({

        "aircraftId": aircraft_id,

        "inspectionDate":
        datetime.now().strftime(
            "%Y-%m-%d"
        ),

        "location":
        result["location"],

        "defectType":
        result["class"],

        "confidence":
        result["confidence"],

        "bboxArea":
        result["width"]
        *
        result["height"],

        "severity":
        result["severity"],

        "urgency":
        result["urgency"],

        "futureRisk":
        result["futureRisk"],

        "riskCategory":
        result["riskCategory"],

        "criticalityIndex":
        result["criticalityIndex"],

        "healthScore":
        result["healthScore"],

        "healthStatus":
        result["healthStatus"],

        "aircraftStatus":
        result["aircraftStatus"],

        "maintenanceBurden":
        result["maintenanceBurden"],

        "maintenanceCost":
        result["maintenanceCost"],

        "zoneRisk":
        result["zoneRisk"],

        "inspectionWindow":
        result["inspectionWindow"],

        "missionReadiness":
        result["missionReadiness"],

        "reliability":
        result["reliability"],

        "failureProbability":
        result["failureProbability"],

        "remainingUsefulHealth":
        result["remainingUsefulHealth"],

        "predictedMaintenanceCost":
        result["predictedMaintenanceCost"],

        "fleetPriorityRank":
        result["fleetPriorityRank"],

        "trend":
        result["trend"],

        "growthRate":
        result["growthRate"],

        "predictedArea30Days":
        result["predictedArea30Days"],

        "recommendation":
        result["recommendation"],

        "executiveSummary":
        result["executiveSummary"],

        "x":
        result["x"],

        "y":
        result["y"],

        "width":
        result["width"],

        "height":
        result["height"]

    })