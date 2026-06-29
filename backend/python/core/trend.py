from datetime import datetime


def get_trend(
    history,
    location
):

    records = []

    for record in history:

        if record.get("location") == location:

            records.append(record)

    if len(records) < 3:

        return (
            "Insufficient Data",
            0
        )

    records.sort(
        key=lambda x:
        x["inspectionDate"]
    )

    first_area = records[0]["bboxArea"]

    last_area = records[-1]["bboxArea"]

    growth_rate = (
        last_area
        -
        first_area
    ) / max(
        len(records)-1,
        1
    )

    if growth_rate > 0:

        trend = "Worsening"

    elif growth_rate < 0:

        trend = "Improving"

    else:

        trend = "Stable"

    return (
        trend,
        round(growth_rate, 2)
    )

def forecast_area(
    history,
    location,
    current_area,
    growth_rate
):

    if growth_rate <= 0:
        return current_area

    predicted = current_area + (growth_rate * 30)

    return round(predicted, 1)