import sys
from pathlib import Path

sys.path.append(
    str(
        Path(__file__).resolve().parents[1]
    )
)
from firebase.firebase_service import db


def get_aircraft_history(
    aircraft_id
):

    docs = (
        db.collection("inspections")
        .where(
            "aircraftId",
            "==",
            aircraft_id
        )
        .stream()
    )

    history = []

    for doc in docs:

        data = doc.to_dict()

        history.append(data)

    return history