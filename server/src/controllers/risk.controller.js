import { RiskService } from '../services/risk.service.js';

/**
 * Normalizes input keys from snake_case or camelCase to standard internal format
 */
function normalizePayload(body) {
  return {
    age: Number(body.age || body.chronological_age || 30),
    gender: body.gender || 'male',
    heightCm: Number(body.heightCm || body.height_cm || 170),
    weightKg: Number(body.weightKg || body.weight_kg || 70),
    bmi: body.bmi !== undefined ? Number(body.bmi) : undefined,
    systolicBp: body.systolicBp !== undefined ? Number(body.systolicBp) : (body.systolic_bp !== undefined ? Number(body.systolic_bp) : 120),
    diastolicBp: body.diastolicBp !== undefined ? Number(body.diastolicBp) : (body.diastolic_bp !== undefined ? Number(body.diastolic_bp) : 80),
    totalCholesterol: body.totalCholesterol !== undefined ? Number(body.totalCholesterol) : (body.total_cholesterol !== undefined ? Number(body.total_cholesterol) : 190),
    hdlCholesterol: body.hdlCholesterol !== undefined ? Number(body.hdlCholesterol) : (body.hdl_cholesterol !== undefined ? Number(body.hdl_cholesterol) : 50),
    fastingGlucose: body.fastingGlucose !== undefined ? Number(body.fastingGlucose) : (body.fasting_glucose !== undefined ? Number(body.fasting_glucose) : undefined),
    hba1c: body.hba1c !== undefined ? Number(body.hba1c) : undefined,
    isSmoker: Boolean(body.isSmoker || body.is_smoker),
    familyHistoryHeartDisease: Boolean(body.familyHistoryHeartDisease || body.family_history_heart_disease),
    familyHistoryDiabetes: Boolean(body.familyHistoryDiabetes || body.family_history_diabetes),
    familyHistoryHypertension: Boolean(body.familyHistoryHypertension || body.family_history_hypertension),
    sleepHoursPerNight: Number(body.sleepHoursPerNight || body.sleep_hours_per_night || 7.0),
    exerciseMinutesPerWeek: Number(body.exerciseMinutesPerWeek !== undefined ? body.exerciseMinutesPerWeek : (body.exercise_minutes_per_week !== undefined ? body.exercise_minutes_per_week : 120)),
    dietQuality: body.dietQuality || body.diet_quality || 'moderate',
    stressLevel: body.stressLevel || body.stress_level || 'moderate',
    saltIntake: body.saltIntake || body.salt_intake || 'moderate',
    alcoholDrinksPerWeek: Number(body.alcoholDrinksPerWeek !== undefined ? body.alcoholDrinksPerWeek : (body.alcohol_drinks_per_week !== undefined ? body.alcohol_drinks_per_week : 2)),
  };
}

export const evaluateFullRisk = async (req, res, next) => {
  try {
    const input = normalizePayload(req.body);
    const result = RiskService.evaluateFullProfile(input);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const calculateHealthAgeOnly = async (req, res, next) => {
  try {
    const input = normalizePayload(req.body);
    const bmi = RiskService.calculateBmi(input.weightKg, input.heightCm, input.bmi);
    const result = RiskService.calculateHealthAge(input, bmi);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const generatePreventionPlanOnly = async (req, res, next) => {
  try {
    const input = normalizePayload(req.body);
    const full = RiskService.evaluateFullProfile(input);
    return res.status(200).json({
      preventionPlan: full.preventionPlan,
      patientMetrics: full.patientMetrics,
    });
  } catch (error) {
    next(error);
  }
};
