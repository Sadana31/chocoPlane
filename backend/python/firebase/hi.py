from firebase_service import db

doc_ids = [
    "1RWwpQkUUGI7MdpOuWrR",
    "   ",
    "xegBXW61XvIkRAFCW8cG",
    "zoqsg8izjf0a02xefSAH"
]

for doc_id in doc_ids:

    db.collection(
        "inspections"
    ).document(
        doc_id
    ).delete()

    print(
        "Deleted:",
        doc_id
    )

print("Done")