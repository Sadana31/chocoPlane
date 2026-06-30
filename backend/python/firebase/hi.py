from firebase_service import db

docs = (
    db.collection("inspections")
    .where("inspectionDate", ">", "2026-06-15")
    .stream()
)

count = 0

for doc in docs:
    print(f"Deleting: {doc.id}")
    doc.reference.delete()
    count += 1

print(f"Done. Deleted {count} inspections.")