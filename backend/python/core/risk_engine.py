def calculate_risk(defect):

    defect = defect.lower()

    if defect == "crack":

        return {

            "severity": 95,

            "urgency": "High",

            "priority": "#1",

            "recommendation": "Immediate Inspection"

        }

    elif defect == "corrosion":

        return {

            "severity": 80,

            "urgency": "High",

            "priority": "#1",

            "recommendation": "Inspect Surface Integrity"

        }

    elif defect == "dent":

        return {

            "severity": 70,

            "urgency": "Medium",

            "priority": "#2",

            "recommendation": "Schedule Repair"

        }

    else:

        return {

            "severity": 0,

            "urgency": "Low",

            "priority": "N/A",

            "recommendation": "No Recommendation"

        }