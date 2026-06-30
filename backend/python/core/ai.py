# aircraft_intelligence.py
from core.ai_models import (
    risk_model,
    ruh_model,
    failure_model,
    health_model,
    cost_model,
    urgency_model,
    urgency_encoder,
    defect_encoder,
    location_encoder,
    explainer,
)

import pandas as pd

DEFECT_SCORE = {
    "rupture": 60,
    "crack": 50,
    "fastener_damage": 40,
    "corrosion": 35,
    "dent": 30
}

URGENCY_SCORE = {

    "Routine":30,

    "Scheduled":60,

    "High":80,

    "Immediate":100

}

FEATURE_NAMES = {

    "defect_encoded": "Defect Type",

    "location_encoded": "Aircraft Location",

    "confidence": "Detection Confidence",

    "bbox_area": "Defect Area",

    "occurrences": "Previous Occurrences",

    "growth_rate": "Growth Rate"

}

LOCATION_SCORE = {
    "Left Wing": 30,
    "Right Wing": 30,
    "Fuselage": 25,
    "Tail": 20,
    "Nose": 20
}

LOCATION_MAPPING = {
    "Nose": "Fuselage",
    "Tail": "Tail Section",
    "Landing Gear": "Engine Area",
    "Left Wing": "Left Wing",
    "Right Wing": "Right Wing",
    "Fuselage": "Fuselage",
}


ACTIONS = {
    "rupture": "Immediate Structural Inspection",
    "crack": "Detailed Crack Assessment",
    "fastener_damage": "Replace Fastener Assembly",
    "corrosion": "Corrosion Treatment Required",
    "dent": "Monitor During Scheduled Maintenance"
}

COST_TABLE = {
    "rupture": 12000,
    "crack": 6000,
    "fastener_damage": 4000,
    "corrosion": 2500,
    "dent": 1000
}

import sys
from pathlib import Path

sys.path.append(
    str(
        Path(__file__).resolve().parents[1]
    )
)

from core.trend import get_trend
from core.trend import forecast_area

def calculate_bbox_area(width, height):

    return width * height


def size_score(area):

    if area <= 500:
        return 15

    elif area <= 1200:
        return 25

    return 35


def calculate_severity(
    defect_type,
    bbox_area,
    location,
    confidence
):

    base_score = (
        DEFECT_SCORE.get(
            defect_type.lower(),
            20
        )
        +
        size_score(bbox_area)
        +
        LOCATION_SCORE.get(
            location,
            15
        )
    )

    confidence_factor = (
        0.7
        +
        confidence * 0.3
    )

    severity = (
        base_score
        *
        confidence_factor
    )

    return round(
        min(severity, 100),
        1
    )

def calculate_urgency(
    severity,
    confidence,
    location
):

    urgency = severity

    confidence_pct = confidence * 100

    if confidence_pct > 90:
        urgency += 10

    elif confidence_pct > 75:
        urgency += 5

    if location in [
        "Left Wing",
        "Right Wing"
    ]:
        urgency += 10

    return min(urgency, 100)


def future_risk(
    severity,
    urgency
):

    risk = (
        0.6 * severity
        +
        0.4 * urgency
    )

    return round(
        min(risk, 100),
        1
    )


def aircraft_health(
    severity,
    urgency
):

    health = (
        100
        -
        (
            0.5 * severity
            +
            0.3 * urgency
        )
    )

    return max(
        round(health, 1),
        0
    )


def maintenance_burden(
    severity,
    urgency
):

    burden = (
        0.4 * severity
        +
        0.6 * urgency
    )

    return round(
        min(burden, 100),
        1
    )


def health_status(score):

    if score <= 30:
        return "Critical"

    elif score <= 50:
        return "Poor"

    elif score <= 70:
        return "Fair"

    elif score <= 90:
        return "Good"

    return "Excellent"


def inspection_window(urgency):

    if urgency >= 80:
        return "Within 24 Hours"

    elif urgency >= 60:
        return "Within 7 Days"

    elif urgency >= 30:
        return "Within 30 Days"

    return "Routine Inspection"


def mission_readiness(health):

    if health >= 80:
        return "Mission Ready"

    elif health >= 60:
        return "Operational With Monitoring"

    elif health >= 40:
        return "Restricted Operations"

    return "Not Mission Ready"


def recommendation(defect_type):

    return ACTIONS.get(
        defect_type.lower(),
        "Manual Review Required"
    )


def reliability(confidence):

    confidence *= 100

    if confidence >= 95:
        return "Very High"

    elif confidence >= 85:
        return "High"

    elif confidence >= 75:
        return "Moderate"

    return "Low"


def maintenance_cost(defect_type):

    return COST_TABLE.get(
        defect_type.lower(),
        1000
    )


def zone_risk(location):

    critical_zones = [
        "Left Wing",
        "Right Wing"
    ]

    if location in critical_zones:
        return "Critical Zone"

    return "Standard Zone"


def aircraft_status(health):

    if health <= 25:
        return "Ground Aircraft Recommended"

    elif health <= 40:
        return "Immediate Inspection Required"

    elif health <= 60:
        return "Maintenance Recommended"

    return "Operational"


def criticality_index(
    severity,
    urgency,
    future_risk
):

    return round(
        (
            severity
            +
            urgency
            +
            future_risk
        ) / 3,
        1
    )


def risk_category(risk):

    if risk >= 85:
        return "Critical"

    elif risk >= 65:
        return "High"

    elif risk >= 40:
        return "Medium"

    return "Low"


def executive_summary(
    defect,
    location,
    urgency,
    recommendation_text
):

    return (
        f"{defect} detected in {location}. "
        f"Urgency level is {urgency}%. "
        f"Recommended action: {recommendation_text}."
    )

def previous_occurrences(
    history,
    location
):

    count = 0

    for record in history:


        if record.get("location") == location:
            count += 1

    return count


def future_risk(
    severity,
    occurrences,
    growth_rate
):

    risk = (
        0.5 * severity
        +
        5 * occurrences
        +
        0.1 * max(
            growth_rate,
            0
        )
    )

    return min(
        round(risk, 1),
        100
    )

def failure_probability(
    severity,
    occurrences,
    growth_rate
):

    probability = 0

    probability += severity * 0.4

    probability += occurrences * 5

    if growth_rate > 0:
        probability += min(
            growth_rate * 0.1,
            20
        )

    return min(
        round(probability, 1),
        100
    )

def remaining_useful_health(
    health_score,
    occurrences
):

    ruh = (
        health_score
        -
        occurrences * 2
    )

    return max(
        round(ruh, 1),
        0
    )

def fleet_priority_rank(
    severity,
    future_risk,
    occurrences
):

    score = (
        severity
        +
        future_risk
        +
        occurrences * 5
    )

    if score >= 180:
        return "Priority 1"

    elif score >= 130:
        return "Priority 2"

    elif score >= 80:
        return "Priority 3"

    return "Priority 4"


def generate_aircraft_intelligence(
    defect,
    history=[]
):
    defect_name = defect["class"].replace("_", " ").title()

    location_name = LOCATION_MAPPING.get(
        defect["location"],
        "Fuselage"
    )

    bbox_area = calculate_bbox_area(
        defect["width"],
        defect["height"]
    )

    occurrences = previous_occurrences(
        history,
        defect["location"]
    )

    trend, growth_rate = get_trend(
        history,
        defect["location"]
    )

    predicted_area = forecast_area(
        history,
        defect["location"],
        bbox_area,
        growth_rate
    )

    severity = calculate_severity(
        defect["class"],
        bbox_area,
        defect["location"],
        defect["confidence"]
    )

    features = pd.DataFrame([{

        "defect_encoded":
        defect_encoder.transform([defect_name])[0],

        "location_encoded":
        location_encoder.transform([location_name])[0],

        "confidence":
        defect["confidence"],

        "bbox_area":
        bbox_area,

        "occurrences":
        occurrences,

        "growth_rate":
        growth_rate

    }])

    urgency_label = urgency_encoder.inverse_transform(

        urgency_model.predict(features)

    )[0]

    urgency = URGENCY_SCORE[
        urgency_label
    ]

    projected_risk = round(
        risk_model.predict(features)[0],
        1
    )

    shap_values = explainer(features)

    feature_impacts = []

    EXPLANATIONS = {

        "Defect Type":
        {
            "positive":
            "The detected defect type significantly increases structural risk.",

            "negative":
            "The detected defect type has a relatively lower structural impact."
        },

        "Aircraft Location":
        {
            "positive":
            "The affected aircraft section is considered a critical maintenance zone.",

            "negative":
            "The affected aircraft section has comparatively lower operational risk."
        },

        "Detection Confidence":
        {
            "positive":
            "The model has high confidence in the detected defect, increasing prediction certainty.",

            "negative":
            "Lower detection confidence slightly reduces the overall predicted risk."
        },

        "Defect Area":
        {
            "positive":
            "A larger damaged area strongly increases the predicted maintenance risk.",

            "negative":
            "A smaller damaged area reduces the predicted maintenance impact."
        },

        "Previous Occurrences":
        {
            "positive":
            "Repeated defects at this location indicate recurring structural degradation.",

            "negative":
            "Very few previous occurrences reduce long-term maintenance concern."
        },

        "Growth Rate":
        {
            "positive":
            "Rapid defect growth increases the probability of future failure.",

            "negative":
            "Stable or decreasing defect growth lowers future maintenance risk."
        }

    }

    for feature_name, impact in zip(
        features.columns,
        shap_values.values[0]
    ):

        pretty = FEATURE_NAMES.get(
            feature_name,
            feature_name
        )

        direction = (
            "positive"
            if impact > 0
            else "negative"
        )

        feature_impacts.append({

            "feature": pretty,

            "impact": round(
                abs(float(impact)),
                2
            ),

            "direction":
            "Increased Risk"
            if impact > 0
            else "Reduced Risk",

            "reason":
            EXPLANATIONS[pretty][direction]

        })

    feature_impacts.sort(
        key=lambda x: x["impact"],
        reverse=True
    )

    health_score = round(
        health_model.predict(features)[0],
        1
    )
    burden = maintenance_burden(
        severity,
        urgency
    )

    recommendation_text = recommendation(
        defect["class"]
    )

    failure_prob = round(
        failure_model.predict(features)[0],
        1
    )

    ruh = round(
        ruh_model.predict(features)[0],
        1
    )

    future_cost = round(

        cost_model.predict(
            features
        )[0],

        0

    )

    priority_rank = fleet_priority_rank(
        severity,
        projected_risk,
        occurrences
    )

    criticality = criticality_index(
        severity,
        urgency,
        projected_risk
    )

    maintenance_cost_value = round(
        cost_model.predict(features)[0],
        0
    )

    return {

        "bboxArea": bbox_area,

        "trend": trend,

        "growthRate": growth_rate,

        "predictedArea30Days": predicted_area,

        "occurrences": occurrences,

        "severity": severity,

        "urgency": urgency,

        "futureRisk": projected_risk,

        "riskCategory": risk_category(
            projected_risk
        ),

        "criticalityIndex": criticality,

        "healthScore": health_score,

        "healthStatus": health_status(
            health_score
        ),

        "aircraftStatus": aircraft_status(
            health_score
        ),

        "maintenanceBurden": burden,

        "maintenanceCost": maintenance_cost_value,

        "zoneRisk": zone_risk(
            defect["location"]
        ),

        "inspectionWindow": inspection_window(
            urgency
        ),

        "missionReadiness": mission_readiness(
            health_score
        ),

        "reliability": reliability(
            defect["confidence"]
        ),

        "failureProbability": failure_prob,

        "remainingUsefulHealth": ruh,

        "predictedMaintenanceCost": future_cost,

        "fleetPriorityRank": priority_rank,

        "recommendation": recommendation_text,

        "executiveSummary": executive_summary(
            defect["class"],
            defect["location"],
            urgency,
            recommendation_text
        ),
        "aiFactors": feature_impacts[:3],

    }