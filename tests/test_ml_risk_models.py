"""
Tests for Phase 6: Machine Learning Disease Risk Models, Biological Health Age & Personalized Prevention Roadmap
Validates:
1. ADA Type 2 Diabetes multi-factor scoring (elevated risk with BMI, sleep debt, family history).
2. AHA/ACC Pooled Cohort ASCVD Cardiovascular risk with smoking and blood pressure drivers.
3. Biological Health Age calculation (allostatic penalties vs longevity bonuses).
4. Personalized Prevention Plan generation (hydration formula, dietary restrictions, exercise targets).
5. FastAPI AI microservice endpoints (/api/risk/evaluate and /api/risk/health-age).
6. Express backend API endpoints (/api/risk/evaluate and /api/risk/health-age).
"""

import pytest
import httpx

@pytest.mark.asyncio
async def test_high_risk_metabolic_profile(express_client: httpx.AsyncClient):
    """
    Validates that a patient with high BMI, chronic sleep debt, and positive family history
    receives elevated diabetes risk (>60%) and accelerated biological health age.
    """
    high_risk_payload = {
        "age": 28,
        "gender": "male",
        "heightCm": 172,
        "weightKg": 93,       # BMI ~ 31.4 (Obese Class I)
        "sleepHoursPerNight": 5.0,
        "exerciseMinutesPerWeek": 30,
        "familyHistoryDiabetes": True,
        "familyHistoryHeartDisease": False,
        "familyHistoryHypertension": True,
        "systolicBp": 138,
        "diastolicBp": 88,
        "dietQuality": "poor",
        "stressLevel": "high",
        "isSmoker": False
    }

    response = await express_client.post("/api/risk/evaluate", json=high_risk_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    metrics = data["patientMetrics"]
    assert metrics["calculatedBmi"] >= 30.0

    # Diabetes risk validation
    dm_risk = data["diseaseRisks"]["diabetes"]
    assert dm_risk["riskPercentage"] >= 60.0
    assert dm_risk["riskCategory"] in ["HIGH", "CRITICAL"]
    assert any("Family history" in driver for driver in dm_risk["primaryDrivers"])

    # Health Age validation (should be older than 28)
    health_age = data["healthAge"]
    assert health_age["chronologicalAge"] == 28
    assert health_age["biologicalHealthAge"] > 28.0
    assert health_age["longevityDeltaYears"] > 3.0
    assert health_age["status"] in ["ACCELERATED_AGING", "HIGH_STRAIN"]
    assert len(health_age["priorityLongevityActions"]) > 0


@pytest.mark.asyncio
async def test_longevity_runner_optimal_profile(express_client: httpx.AsyncClient):
    """
    Validates that a healthy athletic individual with optimal sleep and whole-food diet
    receives LOW risk across all diseases and a biological age younger than calendar age.
    """
    runner_payload = {
        "age": 45,
        "gender": "female",
        "heightCm": 168,
        "weightKg": 58,       # BMI ~ 20.5 (Optimal)
        "sleepHoursPerNight": 8.0,
        "exerciseMinutesPerWeek": 320,  # High athletic conditioning
        "familyHistoryDiabetes": False,
        "familyHistoryHeartDisease": False,
        "familyHistoryHypertension": False,
        "systolicBp": 112,
        "diastolicBp": 74,
        "totalCholesterol": 175,
        "hdlCholesterol": 65,
        "dietQuality": "anti_inflammatory",
        "stressLevel": "low",
        "isSmoker": False,
        "alcoholDrinksPerWeek": 0
    }

    response = await express_client.post("/api/risk/evaluate", json=runner_payload)
    assert response.status_code == 200
    data = response.json()

    # Disease risks should all be low
    assert data["diseaseRisks"]["diabetes"]["riskCategory"] == "LOW"
    assert data["diseaseRisks"]["cardiovascular"]["riskCategory"] == "LOW"
    assert data["diseaseRisks"]["hypertension"]["riskCategory"] == "LOW"

    # Health Age should reflect a longevity bonus (-5 to -10 years younger)
    health_age = data["healthAge"]
    assert health_age["chronologicalAge"] == 45
    assert health_age["biologicalHealthAge"] < 42.0
    assert health_age["longevityDeltaYears"] <= -3.0
    assert health_age["status"] == "REJUVENATED"

    # Check that athletic bonus and smoke-free bonus are in breakdown
    bonuses = [f for f in health_age["factorBreakdown"] if f["type"] == "bonus"]
    bonus_factors = [b["factor"] for b in bonuses]
    assert any("Athletic" in factor or "Exercise" in factor for factor in bonus_factors)
    assert any("Smoke-Free" in factor for factor in bonus_factors)


@pytest.mark.asyncio
async def test_ascvd_cardiovascular_risk_drivers(express_client: httpx.AsyncClient):
    """
    Validates ASCVD risk escalation in an older smoker with Stage 2 Hypertension & dyslipidemia.
    """
    cardiac_risk_payload = {
        "age": 62,
        "gender": "male",
        "heightCm": 175,
        "weightKg": 82,
        "isSmoker": True,
        "systolicBp": 165,
        "diastolicBp": 98,
        "totalCholesterol": 255,
        "hdlCholesterol": 34,
        "familyHistoryHeartDisease": True,
        "exerciseMinutesPerWeek": 40
    }

    response = await express_client.post("/api/risk/evaluate", json=cardiac_risk_payload)
    assert response.status_code == 200
    data = response.json()

    cvd_risk = data["diseaseRisks"]["cardiovascular"]
    assert cvd_risk["riskPercentage"] >= 20.0
    assert cvd_risk["riskCategory"] in ["HIGH", "CRITICAL"]

    # Ensure smoking and high BP are listed as primary drivers
    drivers_str = " ".join(cvd_risk["primaryDrivers"])
    assert "smoking" in drivers_str.lower()
    assert "hypertension" in drivers_str.lower() or "systolic" in drivers_str.lower()

    # Modifiable targets must recommend smoking cessation and BP optimization
    modifiable_str = " ".join(cvd_risk["modifiableTargets"])
    assert "smoking cessation" in modifiable_str.lower()


@pytest.mark.asyncio
async def test_personalized_prevention_plan_formula(express_client: httpx.AsyncClient):
    """
    Validates the personalized lifestyle roadmap, hydration calculation formula,
    and sodium restrictions for hypertensive risk.
    """
    patient_payload = {
        "age": 52,
        "gender": "male",
        "weightKg": 80.0,
        "heightCm": 175.0,
        "exerciseMinutesPerWeek": 210,   # 30 mins / day average
        "systolicBp": 145,               # Hypertensive -> sodium ceiling 1500mg
        "diastolicBp": 92
    }

    response = await express_client.post("/api/risk/prevention-plan", json=patient_payload)
    assert response.status_code == 200
    data = response.json()

    plan = data["preventionPlan"]

    # Hydration target formula: 80 * 0.033 + (30/30 * 0.35) = 2.64 + 0.35 = 2.99 Liters
    hydration = plan["dailyHydration"]
    assert hydration["targetLiters"] >= 2.6
    assert "80 kg bodyweight" in hydration["formulaBasis"]

    # Hypertensive patient gets strict sodium ceiling of 1500mg
    diet = plan["dietaryProtocol"]
    assert diet["sodiumCeilingMg"] == 1500
    assert any("DASH" in g or "sodium" in g.lower() for g in diet["guidelines"])

    # Exercise prescription
    exercise = plan["exercisePrescription"]
    assert exercise["weeklyMetMinutesTarget"] >= 750
    assert exercise["dailyStepGoal"] >= 8000


@pytest.mark.asyncio
async def test_fastapi_risk_microservice_evaluate(ai_client: httpx.AsyncClient):
    """
    Directly tests the Python FastAPI ML microservice endpoint /api/risk/evaluate.
    """
    fastapi_payload = {
        "age": 35,
        "gender": "male",
        "height_cm": 178.0,
        "weight_kg": 75.0,
        "sleep_hours_per_night": 7.5,
        "exercise_minutes_per_week": 160,
        "is_smoker": False
    }

    response = await ai_client.post("/api/risk/evaluate", json=fastapi_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert "disease_risks" in data
    assert "diabetes" in data["disease_risks"]
    assert "cardiovascular" in data["disease_risks"]
    assert "hypertension" in data["disease_risks"]
    assert "health_age" in data
    assert "prevention_plan" in data


@pytest.mark.asyncio
async def test_fastapi_risk_microservice_health_age(ai_client: httpx.AsyncClient):
    """
    Directly tests the Python FastAPI ML microservice endpoint /api/risk/health-age.
    """
    fastapi_payload = {
        "age": 30,
        "gender": "female",
        "height_cm": 165.0,
        "weight_kg": 60.0,
        "sleep_hours_per_night": 4.5,   # Severe sleep deprivation penalty
        "exercise_minutes_per_week": 20, # Sedentary penalty
        "is_smoker": True               # Smoking penalty
    }

    response = await ai_client.post("/api/risk/health-age", json=fastapi_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["chronological_age"] == 30
    assert data["biological_health_age"] >= 38.0
    assert data["longevity_delta_years"] >= 8.0
    assert data["status"] == "HIGH_STRAIN"
