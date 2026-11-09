"""
FastAPI Endpoints for Disease Risk Scoring, Biological Health Age & Personalized Prevention Roadmap
"""

from fastapi import APIRouter, HTTPException, status
from app.models.risk_models import RiskAssessmentInput, DiseaseRiskEngine

router = APIRouter(prefix="/risk", tags=["Disease Risk & Longevity"])

@router.post("/evaluate")
async def evaluate_full_risk_profile(payload: RiskAssessmentInput):
    """
    Evaluates comprehensive 10-year risk for Type 2 Diabetes, Cardiovascular Disease (ASCVD),
    and Hypertension, alongside Biological Health Age and Personalized Prevention Roadmap.
    """
    try:
        bmi = DiseaseRiskEngine.calculate_bmi(payload.weight_kg, payload.height_cm, payload.bmi)
        
        diabetes_result = DiseaseRiskEngine.calculate_diabetes_risk(payload, bmi)
        ascvd_result = DiseaseRiskEngine.calculate_ascvd_risk(payload, bmi)
        htn_result = DiseaseRiskEngine.calculate_hypertension_risk(payload, bmi)
        health_age_result = DiseaseRiskEngine.calculate_health_age(payload, bmi)
        
        risks_dict = {
            "diabetes": diabetes_result,
            "cardiovascular": ascvd_result,
            "hypertension": htn_result
        }
        
        prevention_plan = DiseaseRiskEngine.generate_prevention_plan(payload, bmi, risks_dict, health_age_result)

        return {
            "status": "success",
            "patient_metrics": {
                "age": payload.age,
                "gender": payload.gender,
                "calculated_bmi": bmi,
                "sleep_hours": payload.sleep_hours_per_night,
                "exercise_minutes_per_week": payload.exercise_minutes_per_week
            },
            "disease_risks": risks_dict,
            "health_age": health_age_result,
            "prevention_plan": prevention_plan
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Clinical risk assessment failed: {str(e)}"
        )

@router.post("/health-age")
async def calculate_health_age_only(payload: RiskAssessmentInput):
    """
    Dedicated endpoint for Biological Health Age calculation and factor breakdown.
    """
    try:
        bmi = DiseaseRiskEngine.calculate_bmi(payload.weight_kg, payload.height_cm, payload.bmi)
        return DiseaseRiskEngine.calculate_health_age(payload, bmi)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health age calculation failed: {str(e)}"
        )
