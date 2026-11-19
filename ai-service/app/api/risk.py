"""
FastAPI Endpoints for Disease Risk Scoring, Biological Health Age & Personalized Prevention Roadmap
using Gemini LLM API reasoning
"""

import os
import json
import requests
from fastapi import APIRouter, HTTPException, status
from app.models.risk_models import RiskAssessmentInput, DiseaseRiskEngine
from app.core.config import settings

router = APIRouter(prefix="/risk", tags=["Disease Risk & Longevity"])

def evaluate_with_gemini(payload: RiskAssessmentInput):
    """
    Directly leverages Gemini LLM API for clinical risk & biological age calculation
    """
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    if not api_key or "your_gemini" in api_key:
        return None

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        prompt = f"""You are an elite Clinical Decision Support AI.
Evaluate this patient's biometrics and calculate 10-year risk percentages and biological health age.
Return strictly a JSON object:
{{
  "biological_age": {payload.age + 2},
  "health_age_delta": 2.0,
  "cvd_risk_percent": 6.5,
  "cvd_score": 45,
  "metabolic_score": 35,
  "htn_score": 50,
  "primary_drivers": ["Elevated systolic BP", "Fasting glucose variance"],
  "rejuvenation_potential_years": 2.5,
  "clinical_summary": "Multivariate analysis indicates low-to-moderate cardiovascular and metabolic exposure.",
  "prevention_roadmap": ["Restrict sodium < 2000mg/day", "150 min aerobic exercise weekly"]
}}

Patient Metrics:
Age: {payload.age}, Gender: {payload.gender}, Systolic BP: {payload.systolic_bp}, Diastolic BP: {payload.diastolic_bp},
Total Cholesterol: {payload.total_cholesterol}, HDL: {payload.hdl_cholesterol}, Fasting Glucose: {payload.fasting_glucose},
HbA1c: {payload.hba1c}, Sleep: {payload.sleep_hours_per_night}h, Exercise: {payload.exercise_minutes_per_week}m/wk
"""
        req_data = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2}
        }
        res = requests.post(url, json=req_data, timeout=8)
        if res.status_code == 200:
            data = res.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)
    except Exception as e:
        print(f"[Gemini LLM Call Warning] {e}")
    return None

@router.post("/evaluate")
async def evaluate_full_risk_profile(payload: RiskAssessmentInput):
    """
    Evaluates comprehensive 10-year risk for Type 2 Diabetes, Cardiovascular Disease (ASCVD),
    and Hypertension, alongside Biological Health Age and Personalized Prevention Roadmap via LLM.
    """
    try:
        bmi = DiseaseRiskEngine.calculate_bmi(payload.weight_kg, payload.height_cm, payload.bmi)
        
        # 1. Try Gemini LLM API
        llm_result = evaluate_with_gemini(payload)
        if llm_result:
            return {
                "status": "success",
                "engine": "Google Gemini 1.5 Flash LLM",
                "is_llm": True,
                "patient_metrics": {
                    "age": payload.age,
                    "gender": payload.gender,
                    "calculated_bmi": bmi,
                    "sleep_hours": payload.sleep_hours_per_night,
                    "exercise_minutes_per_week": payload.exercise_minutes_per_week
                },
                "disease_risks": {
                    "cardiovascular": {"riskPercentage": llm_result.get("cvd_risk_percent", 6.4), "score": llm_result.get("cvd_score", 45)},
                    "diabetes": {"score": llm_result.get("metabolic_score", 35)},
                    "hypertension": {"score": llm_result.get("htn_score", 50)}
                },
                "health_age": {
                    "chronologicalAge": payload.age,
                    "biologicalHealthAge": llm_result.get("biological_age", payload.age),
                    "healthAgeDelta": llm_result.get("health_age_delta", 0),
                    "primaryDrivers": llm_result.get("primary_drivers", []),
                    "rejuvenationPotentialYears": llm_result.get("rejuvenation_potential_years", 2.0)
                },
                "prevention_plan": {
                    "lifestyleRoadmap": llm_result.get("prevention_roadmap", []),
                    "clinicalSummary": llm_result.get("clinical_summary", "")
                }
            }

        # 2. Fallback heuristic
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
            "engine": "ArogyaAI Clinical Engine",
            "is_llm": False,
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
