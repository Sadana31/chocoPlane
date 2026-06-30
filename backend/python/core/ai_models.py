
from pathlib import Path
import joblib
import shap

BASE_DIR = Path(__file__).resolve().parent.parent

risk_model = joblib.load(
    BASE_DIR / "models" / "risk_model.pkl"
)


ruh_model = joblib.load(
    BASE_DIR / "models" / "ruh_model.pkl"
)

defect_encoder = joblib.load(
    BASE_DIR / "models" / "defect_encoder.pkl"
)

location_encoder = joblib.load(
    BASE_DIR / "models" / "location_encoder.pkl"
)

explainer = shap.TreeExplainer(risk_model)

failure_model = joblib.load(
    BASE_DIR / "models" / "failure_model.pkl"
)

health_model = joblib.load(
    BASE_DIR / "models" / "health_model.pkl"
)

cost_model = joblib.load(
    BASE_DIR / "models" / "cost_model.pkl"
)

urgency_model = joblib.load(
    BASE_DIR / "models" / "urgency_model.pkl"
)

urgency_encoder = joblib.load(
    BASE_DIR / "models" / "urgency_encoder.pkl"
)