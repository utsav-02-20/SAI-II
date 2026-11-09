from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "arogya-ai-python-service",
        "runtime": "Python 3.14 (FastAPI)",
        "timestamp": datetime.utcnow().isoformat(),
        "capabilities": [
            "xgboost_risk_prediction",
            "health_age_regression",
            "clinical_rag_grounding",
            "adaptive_differential_triage",
            "gemini_multimodal_vision"
        ]
    }
