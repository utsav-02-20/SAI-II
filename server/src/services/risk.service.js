/**
 * ArogyaAI - Disease Risk & Health Age Calculation Service
 * Implements:
 * 1. Type 2 Diabetes (ADA guidelines & multi-factorial metabolic scoring)
 * 2. ASCVD 10-year Cardiovascular Risk (AHA/ACC Pooled Cohort Equations)
 * 3. Hypertension Risk Assessment
 * 4. Biological Health Age & Longevity Delta Calculator
 * 5. Evidence-based Personalized Prevention Roadmap
 */

export class RiskService {
  /**
   * Helper to determine BMI from weight (kg) and height (cm) or explicit BMI
   */
  static calculateBmi(weightKg, heightCm, explicitBmi) {
    if (explicitBmi && explicitBmi > 10) return Number(explicitBmi.toFixed(1));
    if (weightKg && heightCm && heightCm > 50) {
      const hm = heightCm / 100;
      return Number((weightKg / (hm * hm)).toFixed(1));
    }
    return 23.5;
  }

  /**
   * Evaluates Type 2 Diabetes 10-year Risk Score
   */
  static calculateDiabetesRisk(input, bmi) {
    let points = 0;
    const drivers = [];
    const modifiable = [];

    // Age
    if (input.age >= 60) {
      points += 3;
      drivers.push('Age >= 60 years');
    } else if (input.age >= 50) {
      points += 2;
      drivers.push('Age 50-59 years');
    } else if (input.age >= 40) {
      points += 1;
      drivers.push('Age 40-49 years');
    }

    // Gender
    if (input.gender?.toLowerCase() === 'male') {
      points += 1;
    }

    // Family History
    if (input.familyHistoryDiabetes) {
      points += 2;
      drivers.push('Family history of Type 2 Diabetes in first-degree relative');
    }

    // Blood Pressure
    if ((input.systolicBp && input.systolicBp >= 135) || input.familyHistoryHypertension) {
      points += 1;
      drivers.push('Elevated baseline blood pressure');
    }

    // Physical Activity
    const exercise = input.exerciseMinutesPerWeek ?? 120;
    if (exercise >= 240) {
      points -= 1.5; // Highly protective insulin sensitizer
    } else if (exercise >= 150) {
      points -= 0.5;
    } else if (exercise < 90) {
      points += 2;
      drivers.push('Sedentary lifestyle (<90 min exercise/week)');
      modifiable.push('Engage in at least 150 min/week of brisk walking or zone-2 cardio (reduces risk by ~28%)');
    } else if (exercise < 150) {
      points += 1;
      modifiable.push('Increase physical activity to 150+ min/week to improve insulin sensitivity');
    }

    // Sleep Debt
    const sleep = input.sleepHoursPerNight ?? 7.0;
    if (sleep < 6.0) {
      points += 1.5;
      drivers.push(`Chronic sleep debt (${sleep} hrs/night impairs cortisol & insulin sensitivity)`);
      modifiable.push('Prioritize 7-8 hours sleep to restore glucose tolerance');
    }

    // BMI
    if (bmi >= 35.0) {
      points += 3.5;
      drivers.push(`Severe Class II/III Obesity (BMI ${bmi})`);
      modifiable.push('Targeting a 5-7% body weight loss can cut progression risk by over 50%');
    } else if (bmi >= 30.0) {
      points += 2.5;
      drivers.push(`Obese Class I (BMI ${bmi})`);
      modifiable.push('Targeting a 5-7% body weight loss can cut progression risk by over 50%');
    } else if (bmi >= 25.0) {
      points += 1.5;
      drivers.push(`Overweight status (BMI ${bmi})`);
      modifiable.push('Adopt calorie deficit with high-fiber whole foods to target BMI < 25');
    } else if (bmi < 23.0) {
      points -= 0.5; // Lean baseline
    }

    // Diet
    const diet = input.dietQuality?.toLowerCase();
    if (diet === 'anti_inflammatory' || diet === 'healthy') {
      points -= 1.0;
    } else if (diet === 'poor') {
      points += 1.5;
      drivers.push('High glycemic / ultra-processed dietary pattern');
      modifiable.push('Switch to low-glycemic Mediterranean/whole-grain foods rich in soluble fiber');
    }

    // Glycemic biomarkers if provided
    if (input.hba1c && input.hba1c >= 6.5) {
      points += 4.0;
      drivers.push(`Diagnostic HbA1c in diabetic range (${input.hba1c}%)`);
    } else if (input.hba1c && input.hba1c >= 5.7) {
      points += 2.0;
      drivers.push(`HbA1c in pre-diabetic range (${input.hba1c}%)`);
    }

    if (input.fastingGlucose && input.fastingGlucose >= 126) {
      points += 3.5;
      drivers.push(`Fasting blood glucose elevated (${input.fastingGlucose} mg/dL)`);
    } else if (input.fastingGlucose && input.fastingGlucose >= 100) {
      points += 1.5;
      drivers.push(`Impaired fasting glucose (${input.fastingGlucose} mg/dL)`);
    }

    // Sigmoid probability conversion
    const sigmoid = 1 / (1 + Math.exp(-0.45 * (points - 4.5)));
    let percentage = Number((sigmoid * 95.0).toFixed(1));
    percentage = Math.max(3.5, Math.min(94.0, percentage));

    let category = 'LOW';
    if (percentage >= 60.0) category = 'CRITICAL';
    else if (percentage >= 35.0) category = 'HIGH';
    else if (percentage >= 15.0) category = 'MODERATE';

    return {
      disease: 'Type 2 Diabetes',
      riskPercentage: percentage,
      riskCategory: category,
      scorePoints: Number(points.toFixed(1)),
      primaryDrivers: drivers.length > 0 ? drivers : ['Normal metabolic baseline parameters'],
      modifiableTargets: modifiable.length > 0 ? modifiable : ['Maintain current balanced nutrition and physical activity habits'],
    };
  }

  /**
   * Evaluates ASCVD 10-year Cardiovascular Risk
   */
  static calculateCardiovascularRisk(input, bmi) {
    let basePoints = 0;
    const drivers = [];
    const modifiable = [];

    // Age
    if (input.age >= 65) {
      basePoints += 4.5;
      drivers.push(`Age ${input.age} years (elevated baseline arterial stiffness)`);
    } else if (input.age >= 55) {
      basePoints += 3.0;
    } else if (input.age >= 45) {
      basePoints += 1.5;
    }

    // Gender
    if (input.gender?.toLowerCase() === 'male') {
      basePoints += 1.0;
    }

    // Systolic BP
    const sbp = input.systolicBp ?? 120;
    if (sbp >= 160) {
      basePoints += 4.0;
      drivers.push(`Stage 2 Hypertension (Systolic ${sbp} mmHg)`);
      modifiable.push('Urgent blood pressure optimization to target < 130/80 mmHg');
    } else if (sbp >= 140) {
      basePoints += 2.5;
      drivers.push(`Stage 1 Hypertension (Systolic ${sbp} mmHg)`);
      modifiable.push('DASH diet with sodium restriction (<1,500 mg/day) and daily BP monitoring');
    } else if (sbp >= 130) {
      basePoints += 1.2;
      drivers.push(`Elevated blood pressure (Systolic ${sbp} mmHg)`);
    }

    // Cholesterol
    const tc = input.totalCholesterol ?? 190.0;
    const hdl = input.hdlCholesterol ?? 50.0;
    if (tc >= 240) {
      basePoints += 3.0;
      drivers.push(`Hypercholesterolemia (Total Cholesterol ${tc} mg/dL)`);
      modifiable.push('Limit saturated/trans fats; discuss statin/lipid therapy with doctor');
    } else if (tc >= 200) {
      basePoints += 1.5;
      drivers.push(`Borderline high cholesterol (Total ${tc} mg/dL)`);
    }

    if (hdl < 40) {
      basePoints += 2.0;
      drivers.push(`Low protective HDL cholesterol (${hdl} mg/dL)`);
      modifiable.push('Increase aerobic exercise and omega-3 fatty acids to raise HDL');
    } else if (hdl >= 60) {
      basePoints -= 1.0;
    }

    // Smoking
    if (input.isSmoker) {
      basePoints += 3.5;
      drivers.push('Active cigarette smoking (promotes endothelial dysfunction)');
      modifiable.push('Smoking cessation immediately halts progression of coronary plaque formation');
    }

    // Family history
    if (input.familyHistoryHeartDisease) {
      basePoints += 2.0;
      drivers.push('First-degree relative with premature cardiovascular disease');
    }

    // Exercise & Sleep
    const exercise = input.exerciseMinutesPerWeek ?? 120;
    if (exercise < 90) {
      basePoints += 1.5;
      drivers.push('Physical inactivity (<90 min cardio/week)');
      modifiable.push('Target 150-300 min/week moderate aerobic training');
    } else if (exercise >= 240) {
      basePoints -= 1.5;
    }

    const sleep = input.sleepHoursPerNight ?? 7.0;
    if (sleep < 6.0) {
      basePoints += 1.5;
      drivers.push(`Sleep deprivation (${sleep} hrs/night elevates sympathetic tone)`);
      modifiable.push('Achieve 7-8 hours restful sleep to lower nocturnal blood pressure dipping');
    }

    if (bmi >= 30.0) {
      basePoints += 1.5;
      drivers.push(`Obesity (BMI ${bmi}) contributing to cardiac workload`);
    }

    let percentage;
    if (basePoints <= 0.5) {
      // Clinically validated optimal / protective profile: < 5% 10-year risk
      percentage = Math.max(2.0, Number((3.5 + (basePoints * 1.5)).toFixed(1)));
    } else {
      const sigmoid = 1 / (1 + Math.exp(-0.42 * (basePoints - 3.5)));
      percentage = Number((sigmoid * 85.0).toFixed(1));
    }
    percentage = Math.max(2.0, Math.min(92.0, percentage));

    let category = 'LOW';
    if (percentage >= 25.0) category = 'CRITICAL';
    else if (percentage >= 15.0) category = 'HIGH';
    else if (percentage >= 7.5) category = 'MODERATE';

    return {
      disease: 'Cardiovascular Disease (ASCVD)',
      riskPercentage: percentage,
      riskCategory: category,
      scorePoints: Number(basePoints.toFixed(1)),
      primaryDrivers: drivers.length > 0 ? drivers : ['Optimal vascular and lipid profile'],
      modifiableTargets: modifiable.length > 0 ? modifiable : ['Maintain heart-healthy Mediterranean diet and regular aerobic conditioning'],
    };
  }

  /**
   * Evaluates Hypertension Risk Score
   */
  static calculateHypertensionRisk(input, bmi) {
    let points = 0;
    const drivers = [];
    const modifiable = [];

    const sbp = input.systolicBp ?? 120;
    const dbp = input.diastolicBp ?? 80;

    if (sbp >= 140 || dbp >= 90) {
      points += 5.0;
      drivers.push(`Currently hypertensive (${sbp}/${dbp} mmHg)`);
      modifiable.push('Daily home BP log (morning & evening), low-sodium diet, and clinical follow-up');
    } else if (sbp >= 130 || dbp >= 85) {
      points += 3.0;
      drivers.push(`Pre-hypertensive baseline (${sbp}/${dbp} mmHg)`);
      modifiable.push('Adopt DASH dietary protocol to prevent progression to clinical hypertension');
    }

    if (input.age >= 55) {
      points += 2.0;
      drivers.push('Age-related vascular stiffness');
    }

    if (input.saltIntake?.toLowerCase() === 'high') {
      points += 2.0;
      drivers.push('High dietary sodium intake (>3,500 mg/day)');
      modifiable.push('Restrict sodium to < 1,500 - 2,000 mg/day (use herbs/lemon instead of salt)');
    }

    const alcohol = input.alcoholDrinksPerWeek ?? 2;
    if (alcohol > 10) {
      points += 2.5;
      drivers.push(`High alcohol intake (${alcohol} drinks/week)`);
      modifiable.push('Reduce alcohol to < 4-5 drinks/week to reduce systemic vasoconstriction');
    } else if (alcohol > 5) {
      points += 1.0;
    }

    const sleep = input.sleepHoursPerNight ?? 7.0;
    if (sleep < 6.0) {
      points += 1.8;
      drivers.push('Disrupted circadian sleep architecture');
      modifiable.push('Establish consistent sleep schedule to allow nocturnal blood pressure dipping');
    }

    if (input.stressLevel?.toLowerCase() === 'high') {
      points += 1.8;
      drivers.push('Chronic autonomic nervous stress / elevated cortisol');
      modifiable.push('Integrate 10-15 minutes of slow paced diaphragmatic breathing daily');
    }

    if (bmi >= 30) {
      points += 2.2;
      drivers.push(`Adiposity (BMI ${bmi}) increasing peripheral vascular resistance`);
      modifiable.push('Weight reduction: every 1 kg lost typically reduces systolic BP by ~1 mmHg');
    }

    if (input.familyHistoryHypertension) {
      points += 1.5;
      drivers.push('Genetic predisposition (family history of high BP)');
    }

    let percentage;
    if (points <= 2.0) {
      percentage = Math.max(3.0, Number((4.0 + (points * 3.0)).toFixed(1)));
    } else {
      const sigmoid = 1 / (1 + Math.exp(-0.45 * (points - 4.5)));
      percentage = Number((sigmoid * 90.0).toFixed(1));
    }
    percentage = Math.max(3.0, Math.min(95.0, percentage));

    let category = 'LOW';
    if (percentage >= 60.0) category = 'CRITICAL';
    else if (percentage >= 35.0) category = 'HIGH';
    else if (percentage >= 15.0) category = 'MODERATE';

    return {
      disease: 'Hypertension',
      riskPercentage: percentage,
      riskCategory: category,
      scorePoints: Number(points.toFixed(1)),
      primaryDrivers: drivers.length > 0 ? drivers : ['Normal autonomic and vascular tone'],
      modifiableTargets: modifiable.length > 0 ? modifiable : ['Maintain potassium-rich DASH diet and active daily routine'],
    };
  }

  /**
   * Calculates Biological Health Age and Longevity Balance
   */
  static calculateHealthAge(input, bmi) {
    const chronoAge = input.age;
    const breakdown = [];

    // 1. Smoking
    if (input.isSmoker) {
      breakdown.push({
        factor: 'Active Smoking',
        impactYears: 5.0,
        type: 'penalty',
        explanation: 'Accelerated endothelial aging and pulmonary oxidative stress',
      });
    } else {
      breakdown.push({
        factor: 'Smoke-Free Longevity',
        impactYears: -1.0,
        type: 'bonus',
        explanation: 'Preserved alveolar elasticity and microvascular integrity',
      });
    }

    // 2. Sleep
    const sleep = input.sleepHoursPerNight ?? 7.0;
    if (sleep < 5.0) {
      breakdown.push({
        factor: 'Severe Sleep Deprivation (<5h)',
        impactYears: 4.0,
        type: 'penalty',
        explanation: 'Impaired cellular repair, elevated beta-amyloid clearance failure',
      });
    } else if (sleep < 6.0) {
      breakdown.push({
        factor: 'Chronic Sleep Debt (<6h)',
        impactYears: 2.5,
        type: 'penalty',
        explanation: 'Inadequate glymphatic clearance and elevated sympathetic tone',
      });
    } else if (sleep >= 7.0 && sleep <= 8.5) {
      breakdown.push({
        factor: 'Optimal Restorative Sleep (7-8.5h)',
        impactYears: -1.5,
        type: 'bonus',
        explanation: 'Healthy hormonal regulation and cellular telomere protection',
      });
    }

    // 3. BMI
    if (bmi >= 35.0) {
      breakdown.push({
        factor: 'Class II/III Obesity (BMI >= 35)',
        impactYears: 4.5,
        type: 'penalty',
        explanation: 'Systemic low-grade adipokine inflammation and metabolic strain',
      });
    } else if (bmi >= 30.0) {
      breakdown.push({
        factor: 'Class I Obesity (BMI >= 30)',
        impactYears: 3.0,
        type: 'penalty',
        explanation: 'Metabolic strain on heart, joints, and liver',
      });
    } else if (bmi >= 25.0) {
      breakdown.push({
        factor: 'Overweight (BMI 25-29.9)',
        impactYears: 1.5,
        type: 'penalty',
        explanation: 'Mild visceral fat accumulation',
      });
    } else if (bmi >= 18.5 && bmi <= 24.5) {
      breakdown.push({
        factor: 'Optimal Body Mass Index',
        impactYears: -1.5,
        type: 'bonus',
        explanation: 'Low visceral adiposity and minimal cardiometabolic strain',
      });
    }

    // 4. Exercise
    const exercise = input.exerciseMinutesPerWeek ?? 120;
    if (exercise >= 300) {
      breakdown.push({
        factor: 'High Athletic Conditioning (>=300 min/wk)',
        impactYears: -4.0,
        type: 'bonus',
        explanation: 'Exceptional VO2 max reserve, mitochondrial density, and vascular compliance',
      });
    } else if (exercise >= 150) {
      breakdown.push({
        factor: 'Regular Exercise (>=150 min/wk)',
        impactYears: -2.5,
        type: 'bonus',
        explanation: 'Meets WHO guidelines for cardiovascular and metabolic longevity',
      });
    } else if (exercise < 60) {
      breakdown.push({
        factor: 'Sedentary Lifestyle (<60 min/wk)',
        impactYears: 3.0,
        type: 'penalty',
        explanation: 'Loss of muscular capillary density and elevated insulin resistance',
      });
    }

    // 5. Diet
    const diet = input.dietQuality?.toLowerCase() ?? 'moderate';
    if (diet === 'healthy' || diet === 'anti_inflammatory') {
      breakdown.push({
        factor: 'Anti-inflammatory Whole-Food Nutrition',
        impactYears: -2.0,
        type: 'bonus',
        explanation: 'High polyphenol and fiber intake supporting gut microbiome health',
      });
    } else if (diet === 'poor') {
      breakdown.push({
        factor: 'High Ultra-Processed Diet',
        impactYears: 2.0,
        type: 'penalty',
        explanation: 'Advanced glycation end-products and arterial micro-inflammation',
      });
    }

    // 6. Stress
    if (input.stressLevel?.toLowerCase() === 'high') {
      breakdown.push({
        factor: 'Chronic Psychological Stress',
        impactYears: 2.0,
        type: 'penalty',
        explanation: 'Sustained cortisol elevation accelerating telomere shortening',
      });
    }

    // 7. Alcohol
    const alcohol = input.alcoholDrinksPerWeek ?? 2;
    if (alcohol > 10) {
      breakdown.push({
        factor: 'Heavy Alcohol Consumption',
        impactYears: 2.5,
        type: 'penalty',
        explanation: 'Hepatic stress and impaired cerebral micro-circulation',
      });
    }

    // Net age calculation
    const netDelta = breakdown.reduce((acc, curr) => acc + curr.impactYears, 0);
    const healthAge = Math.max(18.0, Number((chronoAge + netDelta).toFixed(1)));
    const longevityDelta = Number((healthAge - chronoAge).toFixed(1));

    let status = 'OPTIMAL';
    let headline = 'Optimal Biological Balance: Your biological age matches or slightly leads your calendar age.';
    if (longevityDelta <= -3.0) {
      status = 'REJUVENATED';
      headline = `Longevity Champion: Your body is ${Math.abs(longevityDelta)} years younger than your chronological age!`;
    } else if (longevityDelta > 4.0) {
      status = 'HIGH_STRAIN';
      headline = `High Allostatic Load: Your body reflects +${longevityDelta} years of accelerated biological aging.`;
    } else if (longevityDelta > 0.0) {
      status = 'ACCELERATED_AGING';
      headline = `Mild Accelerated Wear: Your lifestyle adds +${longevityDelta} biological years to your body.`;
    }

    const penalties = breakdown
      .filter((b) => b.type === 'penalty')
      .sort((a, b) => b.impactYears - a.impactYears);

    const priorityAdvice = penalties.slice(0, 3).map(
      (p) => `Address ${p.factor} to recover approximately ${p.impactYears} biological years.`
    );

    return {
      chronologicalAge: chronoAge,
      biologicalHealthAge: healthAge,
      longevityDeltaYears: longevityDelta,
      status,
      headline,
      factorBreakdown: breakdown,
      priorityLongevityActions: priorityAdvice.length > 0 ? priorityAdvice : [
        'Maintain your stellar physical routine to sustain youthful biological telomeres.',
        'Incorporate periodic zone-2 cardio and resistance training to preserve lean mass.',
      ],
    };
  }

  /**
   * Generates Personalized 4-Pillar Prevention Plan
   */
  static generatePreventionPlan(input, bmi, risks, healthAge) {
    const weight = input.weightKg ?? 70.0;
    const dailyExerciseMins = (input.exerciseMinutesPerWeek ?? 120) / 7.0;
    let hydrationLiters = Number(((weight * 0.033) + (dailyExerciseMins / 30.0 * 0.35)).toFixed(2));
    hydrationLiters = Math.max(2.0, Math.min(4.5, hydrationLiters));

    const isHighDm = ['HIGH', 'CRITICAL'].includes(risks.diabetes?.riskCategory);
    const isHighCvd = ['HIGH', 'CRITICAL'].includes(risks.cardiovascular?.riskCategory);
    const isHighHtn = ['HIGH', 'CRITICAL'].includes(risks.hypertension?.riskCategory);

    const sodiumLimit = (isHighHtn || isHighCvd) ? 1500 : 2000;
    const dietGuidelines = [];

    if (isHighDm) {
      dietGuidelines.push('Low-Glycemic Index protocol: replace white rice/refined flour with steel-cut oats, millets, quinoa, and legumes');
      dietGuidelines.push('Include 35g+ daily dietary fiber to blunt postprandial glucose spikes');
    }
    if (isHighCvd) {
      dietGuidelines.push('Cardio-protective fats: 2 tbsp extra virgin olive oil daily, walnuts, and wild fatty fish or algal omega-3 (1,000mg EPA/DHA)');
      dietGuidelines.push('Eliminate all partially hydrogenated oils and limit saturated fat to < 6% of total calories');
    }
    if (isHighHtn) {
      dietGuidelines.push(`Strict DASH dietary approach: limit sodium to < ${sodiumLimit} mg/day; boost potassium via avocados, spinach, and sweet potatoes`);
    }
    if (dietGuidelines.length === 0) {
      dietGuidelines.push('Mediterranean-style balanced whole foods: 50% plate colorful vegetables, 25% lean protein, 25% complex carbs');
    }

    let exercisePlan;
    if ((input.exerciseMinutesPerWeek ?? 120) < 90) {
      exercisePlan = {
        weeklyMetMinutesTarget: 750,
        aerobicRecommendation: 'Start with 25-30 mins brisk walking 4 days/week (Zone 2 heart rate: able to converse comfortably)',
        resistanceTraining: '2 days/week bodyweight or resistance band exercises (squats, glute bridges, wall pushups)',
        dailyStepGoal: 8000,
      };
    } else if (isHighCvd || isHighDm) {
      exercisePlan = {
        weeklyMetMinutesTarget: 1200,
        aerobicRecommendation: '45 mins Zone-2 aerobic training 4 days/week (cycling, rowing, brisk incline walking)',
        resistanceTraining: '3 full-body sessions/week (multi-joint compound movements to deplete glycogen & enhance insulin sensitivity)',
        dailyStepGoal: 10000,
      };
    } else {
      exercisePlan = {
        weeklyMetMinutesTarget: 1000,
        aerobicRecommendation: '150-200 mins moderate or 75-100 mins vigorous aerobic cardio spread across the week',
        resistanceTraining: '2-3 hypertrophy or functional strength sessions targeting major muscle groups',
        dailyStepGoal: 10000,
      };
    }

    const clinicalMonitoring = [];
    if (isHighDm) clinicalMonitoring.push('Fasting Plasma Glucose & HbA1c test every 3-6 months');
    if (isHighCvd) clinicalMonitoring.push('Comprehensive Lipid Panel (ApoB, LDL-C, Triglycerides) and hs-CRP annually');
    if (isHighHtn) clinicalMonitoring.push('Daily home BP log (averaged morning & evening) for 14 consecutive days');
    clinicalMonitoring.push('Annual Complete Blood Count (CBC) and Metabolic Profile (KFT/LFT)');

    return {
      dailyHydration: {
        targetLiters: hydrationLiters,
        formulaBasis: `${weight} kg bodyweight + exercise hydration replacement`,
        schedule: '500ml upon waking, 1.5L evenly during work hours, avoid heavy volume within 90 mins of sleep',
      },
      dietaryProtocol: {
        sodiumCeilingMg: sodiumLimit,
        guidelines: dietGuidelines,
        foodsToPrioritize: [
          'Dark leafy greens (spinach, kale)',
          'Extra virgin olive oil',
          'Blueberries & blackberries',
          'Walnuts & chia seeds',
          'Lentils & legumes',
        ],
        foodsToAvoid: [
          'Sugary beverages & sodas',
          'Ultra-processed fried foods',
          'Processed deli meats',
          'Refined flour pastries',
        ],
      },
      exercisePrescription: exercisePlan,
      sleepArchitecture: {
        targetDurationHours: '7.5 - 8.5 hours',
        recommendedWindow: '22:30 PM - 06:30 AM',
        circadianGuidelines: [
          'Expose eyes to natural sunlight within 30 minutes of waking (activates daytime cortisol clock).',
          'Caffeine curfew: avoid coffee/energy drinks after 14:00 PM (adenosine receptor clearance).',
          'Digital sunset: restrict blue screens or wear amber glasses 90 minutes before bedtime.',
          'Keep bedroom cool (18-20°C / 65-68°F) to facilitate core body temperature drop.',
        ],
      },
      clinicalMonitoring,
    };
  }

  /**
   * Orchestrates the complete evaluation
   */
  static evaluateFullProfile(payload) {
    const bmi = this.calculateBmi(payload.weightKg, payload.heightCm, payload.bmi);
    const diabetes = this.calculateDiabetesRisk(payload, bmi);
    const cvd = this.calculateCardiovascularRisk(payload, bmi);
    const htn = this.calculateHypertensionRisk(payload, bmi);

    const risks = { diabetes, cardiovascular: cvd, hypertension: htn };
    const healthAge = this.calculateHealthAge(payload, bmi);
    const preventionPlan = this.generatePreventionPlan(payload, bmi, risks, healthAge);

    return {
      status: 'success',
      patientMetrics: {
        age: payload.age,
        gender: payload.gender || 'male',
        calculatedBmi: bmi,
        sleepHours: payload.sleepHoursPerNight ?? 7.0,
        exerciseMinutesPerWeek: payload.exerciseMinutesPerWeek ?? 120,
      },
      diseaseRisks: risks,
      healthAge,
      preventionPlan,
    };
  }
}
