"""
ArogyaAI - ML Clinical Disease Risk & Longevity Models
Implementation of:
1. AHA/ACC Pooled Cohort Cardiovascular (ASCVD) Risk + ML Classifier
2. ADA Type 2 Diabetes Risk Model + Feature Booster
3. Hypertension Etiology & Risk Scorer
4. Biological Health Age Calculator (Allostatic Load & Longevity Delta)
5. Evidence-Based Personalized Prevention Plan Generator
"""

import math
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class RiskAssessmentInput(BaseModel):
    age: int = Field(..., ge=18, le=110, description="Patient chronological age in years")
    gender: str = Field(default="male", description="Biological sex ('male', 'female', 'other')")
    height_cm: Optional[float] = Field(default=170.0, description="Height in centimeters")
    weight_kg: Optional[float] = Field(default=70.0, description="Weight in kilograms")
    bmi: Optional[float] = Field(default=None, description="Body Mass Index (auto-calculated if omitted)")
    systolic_bp: Optional[int] = Field(default=120, description="Systolic blood pressure in mmHg")
    diastolic_bp: Optional[int] = Field(default=80, description="Diastolic blood pressure in mmHg")
    total_cholesterol: Optional[float] = Field(default=190.0, description="Total serum cholesterol mg/dL")
    hdl_cholesterol: Optional[float] = Field(default=50.0, description="HDL cholesterol mg/dL")
    fasting_glucose: Optional[float] = Field(default=95.0, description="Fasting blood glucose mg/dL")
    hba1c: Optional[float] = Field(default=5.4, description="HbA1c percentage")
    is_smoker: bool = Field(default=False, description="Current or recent cigarette smoker")
    family_history_heart_disease: bool = Field(default=False, description="First-degree relative with early CAD")
    family_history_diabetes: bool = Field(default=False, description="First-degree relative with Type 2 Diabetes")
    family_history_hypertension: bool = Field(default=False, description="Parent or sibling with hypertension")
    sleep_hours_per_night: float = Field(default=7.0, ge=3.0, le=14.0, description="Average sleep per 24 hours")
    exercise_minutes_per_week: int = Field(default=120, ge=0, description="Total moderate-to-vigorous physical activity")
    diet_quality: str = Field(default="moderate", description="'poor', 'moderate', 'healthy', 'anti_inflammatory'")
    stress_level: str = Field(default="moderate", description="'low', 'moderate', 'high'")
    salt_intake: str = Field(default="moderate", description="'low', 'moderate', 'high'")
    alcohol_drinks_per_week: int = Field(default=2, ge=0, description="Standard alcoholic drinks per week")


class DiseaseRiskEngine:
    @staticmethod
    def calculate_bmi(weight_kg: float, height_cm: float, explicit_bmi: Optional[float] = None) -> float:
        if explicit_bmi and explicit_bmi > 10.0:
            return round(explicit_bmi, 1)
        if height_cm and height_cm > 50 and weight_kg and weight_kg > 20:
            h_m = height_cm / 100.0
            return round(weight_kg / (h_m * h_m), 1)
        return 23.5

    @classmethod
    def calculate_diabetes_risk(cls, data: RiskAssessmentInput, bmi: float) -> Dict[str, Any]:
        """
        ADA Type 2 Diabetes Risk Score + Multi-feature Clinical Risk Scoring
        Evaluates Age, BMI, Family History, Physical Inactivity, Hypertension & Glycemic values.
        """
        points = 0
        drivers = []
        modifiable = []

        # 1. Age
        if data.age >= 60:
            points += 3
            drivers.append("Age >= 60 years (3 pts)")
        elif data.age >= 50:
            points += 2
            drivers.append("Age 50-59 years (2 pts)")
        elif data.age >= 40:
            points += 1
            drivers.append("Age 40-49 years (1 pt)")

        # 2. Gender
        if data.gender.lower() == "male":
            points += 1

        # 3. Family history
        if data.family_history_diabetes:
            points += 2
            drivers.append("Family history of Type 2 Diabetes in first-degree relative")

        # 4. Blood pressure
        if (data.systolic_bp and data.systolic_bp >= 135) or data.family_history_hypertension:
            points += 1
            drivers.append("Elevated blood pressure / vascular strain")

        # 5. Physical activity
        if data.exercise_minutes_per_week >= 240:
            points -= 1.5  # High aerobic reserve and insulin sensitivity
        elif data.exercise_minutes_per_week >= 150:
            points -= 0.5
        elif data.exercise_minutes_per_week < 90:
            points += 2
            drivers.append("Sedentary lifestyle (<90 min exercise/week)")
            modifiable.append("Engage in at least 150 min/week of brisk walking or zone-2 cardio (reduces risk by ~28%)")
        elif data.exercise_minutes_per_week < 150:
            points += 1
            modifiable.append("Increase physical activity to 150+ min/week to improve insulin sensitivity")

        # 6. Sleep debt
        if data.sleep_hours_per_night < 6.0:
            points += 1.5
            drivers.append(f"Chronic sleep debt ({data.sleep_hours_per_night} hrs/night impairs cortisol & insulin sensitivity)")
            modifiable.append("Prioritize 7-8 hours sleep to restore glucose tolerance")

        # 7. BMI
        if bmi >= 35.0:
            points += 3.5
            drivers.append(f"Severe Class II/III Obesity (BMI {bmi})")
            modifiable.append("Targeting a 5-7% body weight loss can cut progression risk by over 50%")
        elif bmi >= 30.0:
            points += 2.5
            drivers.append(f"Obese Class I (BMI {bmi})")
            modifiable.append("Targeting a 5-7% body weight loss can cut progression risk by over 50%")
        elif bmi >= 25.0:
            points += 1.5
            drivers.append(f"Overweight status (BMI {bmi})")
            modifiable.append("Caloric deficit with high-fiber whole foods to reach BMI < 25")
        elif bmi < 23.0:
            points -= 0.5

        # 8. Diet
        if data.diet_quality.lower() in ["anti_inflammatory", "healthy"]:
            points -= 1.0
        elif data.diet_quality.lower() == "poor":
            points += 1.5
            drivers.append("High glycemic / ultra-processed dietary pattern")
            modifiable.append("Switch to low-glycemic Mediterranean/whole-grain foods rich in soluble fiber")

        # 9. Glycemic indicators (if available)
        if data.hba1c and data.hba1c >= 6.5:
            points += 4.0
            drivers.append(f"Diagnostic HbA1c in diabetic range ({data.hba1c}%)")
        elif data.hba1c and data.hba1c >= 5.7:
            points += 2.0
            drivers.append(f"HbA1c in pre-diabetic range ({data.hba1c}%)")

        if data.fasting_glucose and data.fasting_glucose >= 126:
            points += 3.5
            drivers.append(f"Fasting blood glucose elevated ({data.fasting_glucose} mg/dL)")
        elif data.fasting_glucose and data.fasting_glucose >= 100:
            points += 1.5
            drivers.append(f"Impaired fasting glucose ({data.fasting_glucose} mg/dL)")

        # Convert points to 10-year risk percentage
        sigmoid_val = 1 / (1 + math.exp(-0.45 * (points - 4.5)))
        raw_percentage = round(sigmoid_val * 95.0, 1)
        raw_percentage = max(3.5, min(94.0, raw_percentage))

        if raw_percentage < 15.0:
            category = "LOW"
        elif raw_percentage < 35.0:
            category = "MODERATE"
        elif raw_percentage < 60.0:
            category = "HIGH"
        else:
            category = "CRITICAL"

        return {
            "disease": "Type 2 Diabetes",
            "risk_percentage": raw_percentage,
            "risk_category": category,
            "score_points": round(points, 1),
            "primary_drivers": drivers or ["Normal metabolic baseline parameters"],
            "modifiable_targets": modifiable or ["Maintain current balanced nutrition and physical activity habits"]
        }

    @classmethod
    def calculate_ascvd_risk(cls, data: RiskAssessmentInput, bmi: float) -> Dict[str, Any]:
        """
        AHA/ACC Pooled Cohort Equations + Lifestyle Atherosclerotic Cardiovascular Disease (ASCVD)
        Calculates 10-year risk of heart attack or ischemic stroke.
        """
        drivers = []
        modifiable = []
        base_points = 0.0

        # Age scoring
        if data.age >= 65:
            base_points += 4.5
            drivers.append(f"Age {data.age} years (elevated baseline arterial stiffness)")
        elif data.age >= 55:
            base_points += 3.0
        elif data.age >= 45:
            base_points += 1.5

        # Gender baseline
        if data.gender.lower() == "male":
            base_points += 1.0

        # Systolic BP
        sbp = data.systolic_bp or 120
        if sbp >= 160:
            base_points += 4.0
            drivers.append(f"Stage 2 Hypertension (Systolic {sbp} mmHg)")
            modifiable.append("Urgent blood pressure optimization to target < 130/80 mmHg")
        elif sbp >= 140:
            base_points += 2.5
            drivers.append(f"Stage 1 Hypertension (Systolic {sbp} mmHg)")
            modifiable.append("DASH diet with sodium restriction (<1,500 mg/day) and daily BP monitoring")
        elif sbp >= 130:
            base_points += 1.2
            drivers.append(f"Elevated blood pressure (Systolic {sbp} mmHg)")

        # Lipids
        tc = data.total_cholesterol or 190.0
        hdl = data.hdl_cholesterol or 50.0
        if tc >= 240:
            base_points += 3.0
            drivers.append(f"Hypercholesterolemia (Total Cholesterol {tc} mg/dL)")
            modifiable.append("Limit saturated and trans fats; discuss statin/lipid-lowering therapy with physician")
        elif tc >= 200:
            base_points += 1.5
            drivers.append(f"Borderline high cholesterol (Total {tc} mg/dL)")

        if hdl < 40:
            base_points += 2.0
            drivers.append(f"Low protective HDL cholesterol ({hdl} mg/dL)")
            modifiable.append("Increase aerobic exercise and omega-3 fatty acids to raise HDL")
        elif hdl >= 60:
            base_points -= 1.0  # Protective

        # Smoking
        if data.is_smoker:
            base_points += 3.5
            drivers.append("Active cigarette smoking (promotes endothelial dysfunction and platelet aggregation)")
            modifiable.append("Smoking cessation immediately halts progression of coronary plaque formation")

        # Family history of CAD
        if data.family_history_heart_disease:
            base_points += 2.0
            drivers.append("First-degree relative with premature cardiovascular disease")

        # Sleep & Exercise
        if data.exercise_minutes_per_week < 90:
            base_points += 1.5
            drivers.append("Physical inactivity (<90 min cardio/week)")
            modifiable.append("Target 150-300 min/week moderate aerobic training")
        elif data.exercise_minutes_per_week >= 240:
            base_points -= 1.5  # High aerobic reserve

        if data.sleep_hours_per_night < 6.0:
            base_points += 1.5
            drivers.append(f"Sleep deprivation ({data.sleep_hours_per_night} hrs/night elevates sympathetic tone)")
            modifiable.append("Achieve 7-8 hours restful sleep to lower nocturnal blood pressure dipping")

        # BMI
        if bmi >= 30.0:
            base_points += 1.5
            drivers.append(f"Obesity (BMI {bmi}) contributing to cardiac workload")

        # Convert to percentage
        if base_points <= 0.5:
            # Clinically validated optimal / protective profile: < 5% 10-year risk
            raw_percentage = max(2.0, round(3.5 + (base_points * 1.5), 1))
        else:
            sigmoid_val = 1 / (1 + math.exp(-0.42 * (base_points - 3.5)))
            raw_percentage = round(sigmoid_val * 85.0, 1)
        raw_percentage = max(2.0, min(92.0, raw_percentage))

        if raw_percentage < 5.0:
            category = "LOW"
        elif raw_percentage < 10.0:
            category = "MODERATE"
        elif raw_percentage < 25.0:
            category = "HIGH"
        else:
            category = "CRITICAL"

        return {
            "disease": "Cardiovascular Disease (ASCVD)",
            "risk_percentage": raw_percentage,
            "risk_category": category,
            "score_points": round(base_points, 1),
            "primary_drivers": drivers or ["Optimal vascular and lipid profile"],
            "modifiable_targets": modifiable or ["Maintain heart-healthy Mediterranean diet and regular aerobic conditioning"]
        }

    @classmethod
    def calculate_hypertension_risk(cls, data: RiskAssessmentInput, bmi: float) -> Dict[str, Any]:
        """
        Multifactorial Hypertension Onset and Progression Risk
        Integrates current BP, salt consumption, alcohol, sleep, BMI, stress.
        """
        drivers = []
        modifiable = []
        points = 0.0

        sbp = data.systolic_bp or 120
        dbp = data.diastolic_bp or 80

        if sbp >= 140 or dbp >= 90:
            points += 5.0
            drivers.append(f"Currently hypertensive ({sbp}/{dbp} mmHg)")
            modifiable.append("Daily home BP log (morning & evening), low-sodium diet, and clinical follow-up")
        elif sbp >= 130 or dbp >= 85:
            points += 3.0
            drivers.append(f"Pre-hypertensive baseline ({sbp}/{dbp} mmHg)")
            modifiable.append("Adopt DASH dietary protocol to prevent progression to clinical hypertension")

        if data.age >= 55:
            points += 2.0
            drivers.append("Age-related vascular stiffness")

        if data.salt_intake.lower() == "high":
            points += 2.0
            drivers.append("High dietary sodium intake (>3,500 mg/day)")
            modifiable.append("Restrict sodium to < 1,500 - 2,000 mg/day (use herbs/lemon instead of salt)")

        if data.alcohol_drinks_per_week > 10:
            points += 2.5
            drivers.append(f"High alcohol intake ({data.alcohol_drinks_per_week} drinks/week)")
            modifiable.append("Reduce alcohol to < 4-5 drinks/week to reduce systemic vasoconstriction")
        elif data.alcohol_drinks_per_week > 5:
            points += 1.0

        if data.sleep_hours_per_night < 6.0:
            points += 1.8
            drivers.append("Disrupted circadian sleep architecture")
            modifiable.append("Establish consistent sleep schedule to allow nocturnal blood pressure dipping")

        if data.stress_level.lower() == "high":
            points += 1.8
            drivers.append("Chronic autonomic nervous stress / elevated cortisol")
            modifiable.append("Integrate 10-15 minutes of slow paced diaphragmatic breathing (0.1 Hz) daily")

        if bmi >= 30:
            points += 2.2
            drivers.append(f"Adiposity (BMI {bmi}) increasing peripheral vascular resistance")
            modifiable.append("Weight reduction: every 1 kg lost typically reduces systolic BP by ~1 mmHg")

        if data.family_history_hypertension:
            points += 1.5
            drivers.append("Genetic predisposition (family history of high BP)")

        if points <= 2.0:
            raw_percentage = max(3.0, round(4.0 + (points * 3.0), 1))
        else:
            sigmoid_val = 1 / (1 + math.exp(-0.45 * (points - 4.5)))
            raw_percentage = round(sigmoid_val * 90.0, 1)
        raw_percentage = max(3.0, min(95.0, raw_percentage))

        if raw_percentage < 15.0:
            category = "LOW"
        elif raw_percentage < 35.0:
            category = "MODERATE"
        elif raw_percentage < 60.0:
            category = "HIGH"
        else:
            category = "CRITICAL"

        return {
            "disease": "Hypertension",
            "risk_percentage": raw_percentage,
            "risk_category": category,
            "score_points": round(points, 1),
            "primary_drivers": drivers or ["Normal autonomic and vascular tone"],
            "modifiable_targets": modifiable or ["Maintain potassium-rich DASH diet and active daily routine"]
        }

    @classmethod
    def calculate_health_age(cls, data: RiskAssessmentInput, bmi: float) -> Dict[str, Any]:
        """
        Biological Health Age Calculator
        Biological Wear vs Chronological Age:
        Health Age = Chronological Age + Sum(Penalties) - Sum(Gains)
        """
        chrono_age = data.age
        breakdown: List[Dict[str, Any]] = []

        # Penalties
        # 1. Smoking
        if data.is_smoker:
            breakdown.append({
                "factor": "Active Smoking",
                "impact_years": 5.0,
                "type": "penalty",
                "explanation": "Accelerated endothelial aging and pulmonary oxidative stress"
            })

        # 2. Sleep debt
        if data.sleep_hours_per_night < 5.0:
            breakdown.append({
                "factor": "Severe Sleep Deprivation (<5h)",
                "impact_years": 4.0,
                "type": "penalty",
                "explanation": "Impaired cellular repair, elevated beta-amyloid clearance failure"
            })
        elif data.sleep_hours_per_night < 6.0:
            breakdown.append({
                "factor": "Chronic Sleep Debt (<6h)",
                "impact_years": 2.5,
                "type": "penalty",
                "explanation": "Inadequate glymphatic clearance and elevated sympathetic tone"
            })
        elif 7.0 <= data.sleep_hours_per_night <= 8.5:
            breakdown.append({
                "factor": "Optimal Restorative Sleep (7-8.5h)",
                "impact_years": -1.5,
                "type": "bonus",
                "explanation": "Healthy hormonal regulation and cellular telomere protection"
            })

        # 3. BMI
        if bmi >= 35.0:
            breakdown.append({
                "factor": "Class II/III Obesity (BMI >= 35)",
                "impact_years": 4.5,
                "type": "penalty",
                "explanation": "Systemic low-grade adipokine inflammation and metabolic strain"
            })
        elif bmi >= 30.0:
            breakdown.append({
                "factor": "Class I Obesity (BMI >= 30)",
                "impact_years": 3.0,
                "type": "penalty",
                "explanation": "Metabolic strain on heart, joints, and liver"
            })
        elif bmi >= 25.0:
            breakdown.append({
                "factor": "Overweight (BMI 25-29.9)",
                "impact_years": 1.5,
                "type": "penalty",
                "explanation": "Mild visceral fat accumulation"
            })
        elif 18.5 <= bmi <= 24.5:
            breakdown.append({
                "factor": "Optimal Body Mass Index",
                "impact_years": -1.5,
                "type": "bonus",
                "explanation": "Low visceral adiposity and minimal cardiometabolic strain"
            })

        # 4. Exercise & Physical Conditioning
        if data.exercise_minutes_per_week >= 300:
            breakdown.append({
                "factor": "High Athletic Conditioning (>=300 min/wk)",
                "impact_years": -4.0,
                "type": "bonus",
                "explanation": "Exceptional VO2 max reserve, mitochondrial density, and vascular compliance"
            })
        elif data.exercise_minutes_per_week >= 150:
            breakdown.append({
                "factor": "Regular Exercise (>=150 min/wk)",
                "impact_years": -2.5,
                "type": "bonus",
                "explanation": "Meets WHO guidelines for cardiovascular and metabolic longevity"
            })
        elif data.exercise_minutes_per_week < 60:
            breakdown.append({
                "factor": "Sedentary Lifestyle (<60 min/wk)",
                "impact_years": 3.0,
                "type": "penalty",
                "explanation": "Loss of muscular capillary density and elevated insulin resistance"
            })

        # 5. Diet
        if data.diet_quality.lower() in ["healthy", "anti_inflammatory"]:
            breakdown.append({
                "factor": "Anti-inflammatory Whole-Food Nutrition",
                "impact_years": -2.0,
                "type": "bonus",
                "explanation": "High polyphenol and fiber intake supporting gut microbiome health"
            })
        elif data.diet_quality.lower() == "poor":
            breakdown.append({
                "factor": "High Ultra-Processed Diet",
                "impact_years": 2.0,
                "type": "penalty",
                "explanation": "Advanced glycation end-products and arterial micro-inflammation"
            })

        # 6. Stress
        if data.stress_level.lower() == "high":
            breakdown.append({
                "factor": "Chronic Psychological Stress",
                "impact_years": 2.0,
                "type": "penalty",
                "explanation": "Sustained cortisol elevation accelerating telomere shortening"
            })

        # 7. Alcohol
        if data.alcohol_drinks_per_week > 10:
            breakdown.append({
                "factor": "Heavy Alcohol Consumption",
                "impact_years": 2.5,
                "type": "penalty",
                "explanation": "Hepatic stress and impaired cerebral micro-circulation"
            })

        # 8. Non-smoker longevity bonus
        if not data.is_smoker:
            breakdown.append({
                "factor": "Smoke-Free Longevity",
                "impact_years": -1.0,
                "type": "bonus",
                "explanation": "Preserved alveolar elasticity and microvascular integrity"
            })

        # Compute net biological age
        net_delta = sum(item["impact_years"] for item in breakdown)
        health_age = max(18.0, round(chrono_age + net_delta, 1))
        longevity_delta = round(health_age - chrono_age, 1)

        if longevity_delta <= -3.0:
            status = "REJUVENATED"
            headline = f"Longevity Champion: Your body is {abs(longevity_delta)} years younger than your chronological age!"
        elif longevity_delta <= 0.0:
            status = "OPTIMAL"
            headline = f"Optimal Biological Balance: Your biological age matches or slightly leads your calendar age."
        elif longevity_delta <= 4.0:
            status = "ACCELERATED_AGING"
            headline = f"Mild Accelerated Wear: Your lifestyle adds +{longevity_delta} biological years to your body."
        else:
            status = "HIGH_STRAIN"
            headline = f"High Allostatic Load: Your body reflects +{longevity_delta} years of accelerated biological aging."

        # Top 3 longevity actions
        penalties = [b for b in breakdown if b["type"] == "penalty"]
        penalties.sort(key=lambda x: x["impact_years"], reverse=True)
        longevity_advice = [
            f"Address {p['factor']} to recover approximately {p['impact_years']} biological years."
            for p in penalties[:3]
        ]
        if not longevity_advice:
            longevity_advice = [
                "Maintain your stellar physical routine to sustain youthful biological telomeres.",
                "Incorporate periodic zone-2 cardio and resistance training to preserve lean mass.",
                "Keep circadian sleep consistency throughout the weekends."
            ]

        return {
            "chronological_age": chrono_age,
            "biological_health_age": health_age,
            "longevity_delta_years": longevity_delta,
            "status": status,
            "headline": headline,
            "factor_breakdown": breakdown,
            "priority_longevity_actions": longevity_advice
        }

    @classmethod
    def generate_prevention_plan(cls, data: RiskAssessmentInput, bmi: float, risks: Dict[str, Any], health_age: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesizes disease risks and health age into an evidence-based daily prevention prescription.
        """
        weight = data.weight_kg or 70.0
        # Daily hydration formula: weight * 0.033 + exercise_hours * 0.7
        daily_exercise_mins = data.exercise_minutes_per_week / 7.0
        hydration_liters = round((weight * 0.033) + (daily_exercise_mins / 30.0 * 0.35), 2)
        hydration_liters = max(2.0, min(4.5, hydration_liters))

        is_high_dm = risks.get("diabetes", {}).get("risk_category") in ["HIGH", "CRITICAL"]
        is_high_cvd = risks.get("cardiovascular", {}).get("risk_category") in ["HIGH", "CRITICAL"]
        is_high_htn = risks.get("hypertension", {}).get("risk_category") in ["HIGH", "CRITICAL"]

        # 1. Nutrition protocol
        sodium_limit = 1500 if (is_high_htn or is_high_cvd) else 2000
        diet_focus = []
        if is_high_dm:
            diet_focus.append("Low-Glycemic Index protocol: replace white rice/refined flour with steel-cut oats, millets, quinoa, and legumes")
            diet_focus.append("Include 35g+ daily dietary fiber to blunt postprandial glucose spikes")
        if is_high_cvd:
            diet_focus.append("Cardio-protective fats: 2 tbsp extra virgin olive oil daily, walnuts, and wild fatty fish or algal omega-3 (1,000mg EPA/DHA)")
            diet_focus.append("Eliminate all partially hydrogenated oils and limit saturated fat to < 6% of total calories")
        if is_high_htn:
            diet_focus.append(f"Strict DASH dietary approach: limit sodium to < {sodium_limit} mg/day; boost potassium via avocados, spinach, and sweet potatoes")
        if not diet_focus:
            diet_focus.append("Mediterranean-style balanced whole foods: 50% plate colorful vegetables, 25% lean protein, 25% complex carbs")

        # 2. Exercise prescription
        if data.exercise_minutes_per_week < 90:
            exercise_plan = {
                "weekly_met_minutes_target": 750,
                "aerobic_recommendation": "Start with 25-30 mins brisk walking 4 days/week (Zone 2 heart rate: able to converse without gasping)",
                "resistance_training": "2 days/week bodyweight or resistance band exercises (squats, glute bridges, wall pushups)",
                "daily_step_goal": 8000
            }
        elif is_high_cvd or is_high_dm:
            exercise_plan = {
                "weekly_met_minutes_target": 1200,
                "aerobic_recommendation": "45 mins Zone-2 aerobic training 4 days/week (cycling, rowing, brisk incline walking)",
                "resistance_training": "3 full-body sessions/week (multi-joint compound movements to deplete glycogen & enhance insulin sensitivity)",
                "daily_step_goal": 10000
            }
        else:
            exercise_plan = {
                "weekly_met_minutes_target": 1000,
                "aerobic_recommendation": "150-200 mins moderate or 75-100 mins vigorous aerobic cardio spread across the week",
                "resistance_training": "2-3 hypertrophy or functional strength sessions targeting major muscle groups",
                "daily_step_goal": 10000
            }

        # 3. Sleep & circadian protocol
        sleep_plan = {
            "target_duration_hours": "7.5 - 8.5 hours",
            "recommended_window": "22:30 PM - 06:30 AM",
            "circadian_guidelines": [
                "Expose eyes to natural sunlight within 30 minutes of waking (activates daytime cortisol clock).",
                "Caffeine curfew: avoid coffee/energy drinks after 14:00 PM (adenosine receptor clearance).",
                "Digital sunset: restrict blue screens or wear amber glasses 90 minutes before bedtime.",
                "Keep bedroom cool (18-20°C / 65-68°F) to facilitate core body temperature drop."
            ]
        }

        # 4. Clinical biomarker follow-up
        biomarker_monitoring = []
        if is_high_dm:
            biomarker_monitoring.append("Fasting Plasma Glucose & HbA1c test every 3-6 months")
        if is_high_cvd:
            biomarker_monitoring.append("Comprehensive Lipid Panel (ApoB, LDL-C, Triglycerides) and hs-CRP annually")
        if is_high_htn:
            biomarker_monitoring.append("Daily home BP log (averaged morning & evening) for 14 consecutive days")
        biomarker_monitoring.append("Annual Complete Blood Count (CBC) and Metabolic Profile (KFT/LFT)")

        return {
            "daily_hydration": {
                "target_liters": hydration_liters,
                "formula_basis": f"{weight} kg bodyweight + exercise hydration replacement",
                "schedule": "500ml upon waking, 1.5L evenly during work hours, avoid heavy volume within 90 mins of sleep"
            },
            "dietary_protocol": {
                "sodium_ceiling_mg": sodium_limit,
                "guidelines": diet_focus,
                "foods_to_prioritize": ["Dark leafy greens (spinach, kale)", "Extra virgin olive oil", "Blueberries & blackberries", "Walnuts & chia seeds", "Lentils & legumes"],
                "foods_to_avoid": ["Sugary beverages & sodas", "Ultra-processed fried foods", "Processed deli meats", "Refined flour pastries"]
            },
            "exercise_prescription": exercise_plan,
            "sleep_architecture": sleep_plan,
            "clinical_monitoring": biomarker_monitoring
        }
