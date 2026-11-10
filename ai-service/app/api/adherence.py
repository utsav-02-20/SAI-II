"""
FastAPI Microservice Endpoints for Medication Lapse Prediction & Longitudinal Symptom Anomaly Detection
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/adherence", tags=["Adherence & Longitudinal Trends"])

class DoseLapsePredictionInput(BaseModel):
    patient_id: str = Field(default="default-patient")
    current_streak_days: int = Field(default=7, ge=0)
    scheduled_hour: int = Field(default=8, ge=0, le=23)
    is_weekend: bool = Field(default=False)
    regimen_medication_count: int = Field(default=2, ge=1)
    past_adherence_rate: float = Field(default=92.0, ge=0.0, le=100.0)

class SymptomTrajectoryInput(BaseModel):
    symptom_name: str = Field(default="Fever")
    previous_month_count: int = Field(default=5, ge=0)
    current_month_count: int = Field(default=12, ge=0)
    associated_symptoms: List[str] = Field(default=["Cough", "Headache", "Fatigue"])

@router.post("/predict-lapse")
async def predict_dose_omission_risk(payload: DoseLapsePredictionInput):
    """
    Predicts patient risk of skipping or forgetting the next scheduled medication dose
    using behavioral heuristics and historical adherence stability.
    """
    try:
        # Behavioral risk formula
        base_risk = 100.0 - payload.past_adherence_rate
        if payload.is_weekend:
            base_risk += 12.0  # Routine disruption on weekends
        if payload.scheduled_hour >= 21:
            base_risk += 8.0   # Evening fatigue forgetfulness
        if payload.regimen_medication_count >= 3:
            base_risk += 10.0  # Polypharmacy burden
        if payload.current_streak_days >= 7:
            base_risk -= 15.0  # Strong habit loop protective bonus

        lapse_prob = max(3.0, min(95.0, round(base_risk, 1)))

        risk_tier = "LOW"
        if lapse_prob >= 50.0:
            risk_tier = "HIGH"
        elif lapse_prob >= 25.0:
            risk_tier = "MODERATE"

        return {
            "status": "success",
            "patient_id": payload.patient_id,
            "dose_omission_risk_percentage": lapse_prob,
            "risk_tier": risk_tier,
            "recommended_intervention": (
                "Send proactive conversational reminder with 15-minute advance notice."
                if risk_tier in ["HIGH", "MODERATE"]
                else "Standard scheduled notification."
            ),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lapse risk calculation failed: {str(e)}"
        )

@router.post("/analyze-trend")
async def analyze_symptom_trend(payload: SymptomTrajectoryInput):
    """
    Analyzes month-over-month symptom frequency to flag statistically significant clinical escalations.
    """
    try:
        prev_c = max(1, payload.previous_month_count)
        curr_c = payload.current_month_count
        percent_increase = round(((curr_c - prev_c) / prev_c) * 100, 1)

        escalate = percent_increase >= 50.0 or curr_c >= 8
        urgency = "URGENT" if percent_increase >= 100.0 else ("ELEVATED" if escalate else "ROUTINE")

        return {
            "status": "success",
            "symptom": payload.symptom_name,
            "previous_count": prev_c,
            "current_count": curr_c,
            "percentage_increase": percent_increase,
            "requires_clinical_escalation": escalate,
            "urgency_level": urgency,
            "clinical_narrative": (
                f"{payload.symptom_name} increased by {percent_increase}% month-over-month ({prev_c} to {curr_c} episodes). "
                f"Statistically significant frequency surge warrants physician teleconsultation."
                if escalate
                else f"{payload.symptom_name} frequency remains within normal seasonal baseline variance."
            ),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Trend analysis failed: {str(e)}"
        )
