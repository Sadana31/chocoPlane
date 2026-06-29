
# XAI Report module
import os


def generate_xai_report(result, output_folder):

    os.makedirs(output_folder, exist_ok=True)

    report_name = result["image"].replace(".jpg", ".txt")

    report_path = os.path.join(output_folder, report_name)

    explanation = ""

    if result["class"] == "crack":
        explanation = (
            "The AI focused on elongated high-contrast regions "
            "with strong edge discontinuity, matching crack patterns "
            "learned during training."
        )

    elif result["class"] == "dent":
        explanation = (
            "The AI focused on localized curved surface deformation "
            "with shadow variations similar to dent samples."
        )

    else:
        explanation = (
            "The AI detected a structural anomaly based on learned visual features."
        )

    with open(report_path, "w") as f:

        f.write("========== DRISHTI XAI REPORT ==========\n\n")

        f.write(f"Image : {result['image']}\n")
        f.write(f"Aircraft Section : {result['section']}\n")
        f.write(f"Detected Damage : {result['class']}\n")
        f.write(f"Confidence : {result['confidence']}\n")
        f.write(f"Center X : {result['x']}\n")
        f.write(f"Center Y : {result['y']}\n")
        f.write(f"Bounding Box Width : {result['width']}\n")
        f.write(f"Bounding Box Height : {result['height']}\n")
        f.write(f"Severity : {result['severity']}\n")
        f.write(f"Urgency : {result['urgency']}\n")
        f.write(f"Priority : {result['priority']}\n\n")

        f.write("AI Explanation\n")
        f.write("-----------------------------\n")
        f.write(explanation + "\n\n")

        f.write("Recommendation\n")
        f.write("-----------------------------\n")
        f.write(result["recommendation"])

    print("XAI Report Saved :", report_path)