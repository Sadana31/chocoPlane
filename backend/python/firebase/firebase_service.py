import os
import firebase_admin

from firebase_admin import (
    credentials,
    firestore
)

BASE_DIR = os.path.dirname(__file__)

SERVICE_ACCOUNT = os.path.join(
    BASE_DIR,
    "serviceAccountKey.json"
)

cred = credentials.Certificate(
    SERVICE_ACCOUNT
)

firebase_admin.initialize_app(
    cred
)

db = firestore.client()