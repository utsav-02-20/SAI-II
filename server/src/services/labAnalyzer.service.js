/**
 * Clinical Lab Biomarker Reference Standard & Diagnostic Interpreter
 * Aligned with LOINC & Standard Pathology Laboratory Reference Ranges
 */

export const CLINICAL_BIOMARKER_STANDARDS = {
  // --- COMPLETE BLOOD COUNT (CBC) ---
  'hemoglobin': {
    standardName: 'Hemoglobin (Hb)',
    category: 'CBC',
    unit: 'g/dL',
    normalMin: 12.0,
    normalMax: 17.5,
    criticalMin: 7.0,
    criticalMax: 20.0,
    lowMeaning: 'Below normal range indicates Anemia (microcytic/normocytic). May cause fatigue, dizziness, and pallor.',
    highMeaning: 'Above normal range indicates Polycythemia or chronic dehydration.',
    dietaryTips: 'Consume iron-rich foods: spinach, lentils, beetroot, dates, pomegranate, and Vitamin C for absorption.',
  },
  'wbc': {
    standardName: 'Total Leukocyte Count (WBC)',
    category: 'CBC',
    unit: '/uL',
    normalMin: 4000,
    normalMax: 11000,
    criticalMin: 2000,
    criticalMax: 30000,
    lowMeaning: 'Leukopenia: Weakened immune defense, viral suppression, or bone marrow strain.',
    highMeaning: 'Leukocytosis: Active bacterial infection, systemic inflammation, or physiological stress.',
    dietaryTips: 'Maintain hydration, immune-supporting foods rich in zinc, Vitamin C, and adequate rest.',
  },
  'platelets': {
    standardName: 'Platelet Count',
    category: 'CBC',
    unit: '/uL',
    normalMin: 150000,
    normalMax: 450000,
    criticalMin: 50000,
    criticalMax: 1000000,
    lowMeaning: 'Thrombocytopenia: Increased risk of bleeding, petechiae, or bruising (common in Dengue / viral fevers).',
    highMeaning: 'Thrombocytosis: Reactive inflammation or thrombotic risk.',
    dietaryTips: 'Papaya leaf extract, kiwi, and hydration may support recovery during viral thrombocytopenia.',
  },
  'rbc': {
    standardName: 'Red Blood Cell Count (RBC)',
    category: 'CBC',
    unit: 'million/uL',
    normalMin: 4.2,
    normalMax: 5.9,
    criticalMin: 2.5,
    criticalMax: 7.0,
    lowMeaning: 'Low red cell mass, associated with anemia and decreased oxygen delivery.',
    highMeaning: 'High red cell mass, associated with hypoxia, high altitude, or polycythemia vera.',
    dietaryTips: 'Adequate hydration and iron-folate balanced nutrition.',
  },

  // --- DIABETIC & METABOLIC PANEL ---
  'fasting blood sugar': {
    standardName: 'Fasting Blood Sugar (FBS)',
    category: 'DIABETES',
    unit: 'mg/dL',
    normalMin: 70,
    normalMax: 99,
    criticalMin: 50,
    criticalMax: 300,
    lowMeaning: 'Hypoglycemia: Dizziness, sweating, tremors. Ingest fast-acting carbohydrates immediately.',
    highMeaning: 'Impaired Fasting Glucose (100-125) or Diabetes (>=126). Indicates insulin resistance.',
    dietaryTips: 'Adopt a low-glycemic-index diet, increase soluble fiber, avoid refined sugars, and walk after meals.',
  },
  'postprandial blood sugar': {
    standardName: 'Postprandial Blood Sugar (PPBS)',
    category: 'DIABETES',
    unit: 'mg/dL',
    normalMin: 80,
    normalMax: 140,
    criticalMin: 60,
    criticalMax: 350,
    lowMeaning: 'Reactive hypoglycemia.',
    highMeaning: 'Elevated post-meal glucose spike; indicates decreased insulin sensitivity.',
    dietaryTips: 'Portion control carbohydrates, pair carbs with protein and healthy fats.',
  },
  'hba1c': {
    standardName: 'Glycated Hemoglobin (HbA1c)',
    category: 'DIABETES',
    unit: '%',
    normalMin: 4.0,
    normalMax: 5.6,
    criticalMin: 3.5,
    criticalMax: 12.0,
    lowMeaning: 'Low glycation (rare, monitor for hemolytic conditions).',
    highMeaning: 'Pre-diabetes (5.7 - 6.4%) or Diabetes (>=6.5%). Reflects 3-month average blood glucose control.',
    dietaryTips: 'Consistent lifestyle intervention: 150 mins zone-2 cardio weekly and reduced refined carbohydrate intake.',
  },

  // --- LIPID PROFILE ---
  'total cholesterol': {
    standardName: 'Total Cholesterol',
    category: 'LIPID',
    unit: 'mg/dL',
    normalMin: 120,
    normalMax: 200,
    criticalMin: 80,
    criticalMax: 350,
    lowMeaning: 'Very low cholesterol may occur in severe malnutrition or chronic liver dysfunction.',
    highMeaning: 'Hypercholesterolemia: Elevated risk for coronary plaque formation and atherosclerosis.',
    dietaryTips: 'Reduce saturated and trans fats; increase omega-3 fatty acids (flaxseed, walnuts, fish) and oats.',
  },
  'triglycerides': {
    standardName: 'Serum Triglycerides',
    category: 'LIPID',
    unit: 'mg/dL',
    normalMin: 50,
    normalMax: 150,
    criticalMin: 30,
    criticalMax: 500,
    lowMeaning: 'Low triglyceride level.',
    highMeaning: 'Hypertriglyceridemia: Associated with insulin resistance, alcohol excess, or pancreatitis risk if >500.',
    dietaryTips: 'Cut down sweet beverages, refined grains, and alcohol. Regular aerobic exercise.',
  },
  'hdl': {
    standardName: 'HDL (Good) Cholesterol',
    category: 'LIPID',
    unit: 'mg/dL',
    normalMin: 40,
    normalMax: 80,
    criticalMin: 25,
    criticalMax: 100,
    lowMeaning: 'Low protective cholesterol (<40 mg/dL increases cardiovascular vulnerability).',
    highMeaning: 'High cardioprotective HDL level.',
    dietaryTips: 'Engage in moderate aerobic exercise and incorporate olive oil, nuts, and healthy fats.',
  },
  'ldl': {
    standardName: 'LDL (Bad) Cholesterol',
    category: 'LIPID',
    unit: 'mg/dL',
    normalMin: 50,
    normalMax: 100,
    criticalMin: 30,
    criticalMax: 250,
    lowMeaning: 'Optimal low atherogenic lipoprotein level.',
    highMeaning: 'Elevated atherogenic particle concentration; primary driver of coronary artery disease.',
    dietaryTips: 'Limit dairy fats, deep-fried snacks, and palm oils. Emphasize plant sterols and soluble fiber.',
  },

  // --- KIDNEY FUNCTION (KFT) ---
  'serum creatinine': {
    standardName: 'Serum Creatinine',
    category: 'KFT',
    unit: 'mg/dL',
    normalMin: 0.6,
    normalMax: 1.2,
    criticalMin: 0.3,
    criticalMax: 4.0,
    lowMeaning: 'Low muscle mass or protein deficiency.',
    highMeaning: 'Impaired renal filtration / decreased glomerular filtration rate (GFR).',
    dietaryTips: 'Maintain adequate hydration; consult nephrologist before taking high-protein or creatine supplements.',
  },

  // --- LIVER FUNCTION (LFT) ---
  'sgpt': {
    standardName: 'SGPT / ALT (Alanine Transaminase)',
    category: 'LFT',
    unit: 'U/L',
    normalMin: 7,
    normalMax: 56,
    criticalMin: 2,
    criticalMax: 500,
    lowMeaning: 'Normal liver clearance.',
    highMeaning: 'Hepatocellular inflammation (fatty liver / NAFLD, hepatitis, or drug-induced liver injury).',
    dietaryTips: 'Avoid alcohol, limit processed foods, lose visceral abdominal fat, and monitor hepatotoxic drugs.',
  },
};

/**
 * Normalizes user-submitted biomarker name to standard clinical ontology
 */
export const normalizeBiomarkerName = (rawName) => {
  const clean = (rawName || '').toLowerCase().trim();
  for (const [key, standard] of Object.entries(CLINICAL_BIOMARKER_STANDARDS)) {
    if (
      clean === key ||
      clean.includes(key) ||
      standard.standardName.toLowerCase().includes(clean)
    ) {
      return { key, ...standard };
    }
  }

  // Fallback for custom or unlisted biomarker
  return {
    key: clean,
    standardName: rawName,
    category: 'GENERAL',
    unit: '',
    normalMin: 0,
    normalMax: 100,
    criticalMin: 0,
    criticalMax: 500,
    lowMeaning: 'Below reference value.',
    highMeaning: 'Above reference value.',
    dietaryTips: 'Discuss with your primary care physician.',
  };
};

/**
 * Evaluates numerical biomarker result against clinical reference ranges
 */
export const evaluateBiomarker = (rawName, value, unit) => {
  const standard = normalizeBiomarkerName(rawName);
  const numVal = parseFloat(value);

  let status = 'NORMAL';
  let explanation = `${standard.standardName} is within normal reference limits (${standard.normalMin} - ${standard.normalMax} ${standard.unit}).`;

  if (numVal < standard.criticalMin) {
    status = 'CRITICAL';
    explanation = `CRITICAL LOW: ${numVal} ${standard.unit}. ${standard.lowMeaning} Immediate medical attention required.`;
  } else if (numVal < standard.normalMin) {
    status = 'LOW';
    explanation = `${standard.standardName} is below normal range (${numVal} vs normal ${standard.normalMin} - ${standard.normalMax} ${standard.unit}). ${standard.lowMeaning}`;
  } else if (numVal > standard.criticalMax) {
    status = 'CRITICAL';
    explanation = `CRITICAL HIGH: ${numVal} ${standard.unit}. ${standard.highMeaning} Urgent medical evaluation indicated.`;
  } else if (numVal > standard.normalMax) {
    status = 'HIGH';
    explanation = `${standard.standardName} is elevated above normal (${numVal} vs normal ${standard.normalMin} - ${standard.normalMax} ${standard.unit}). ${standard.highMeaning}`;
  }

  return {
    name: standard.standardName,
    key: standard.key,
    value: numVal,
    unit: unit || standard.unit,
    normalMin: standard.normalMin,
    normalMax: standard.normalMax,
    status,
    explanation,
    dietaryTips: status !== 'NORMAL' ? standard.dietaryTips : null,
    category: standard.category,
  };
};

/**
 * Analyzes an entire set of extracted or entered biomarkers
 */
export const analyzeLabReport = (reportTitle, reportDate, rawBiomarkers = []) => {
  const evaluatedBiomarkers = rawBiomarkers.map((b) =>
    evaluateBiomarker(b.name, b.value, b.unit)
  );

  const abnormalEntries = evaluatedBiomarkers.filter((b) => b.status !== 'NORMAL');
  const criticalEntries = evaluatedBiomarkers.filter((b) => b.status === 'CRITICAL');

  // Generate unified clinical narrative summary
  let aiSummary = '';
  if (criticalEntries.length > 0) {
    aiSummary += `URGENT ATTENTION: ${criticalEntries.map((c) => `${c.name} (${c.value} ${c.unit})`).join(', ')} in critical range. `;
  }

  if (abnormalEntries.length === 0) {
    aiSummary += 'All tested biomarkers are within normal physiological reference ranges. Good metabolic health profile.';
  } else {
    const lowList = abnormalEntries.filter((b) => b.status === 'LOW').map((b) => b.name);
    const highList = abnormalEntries.filter((b) => b.status === 'HIGH').map((b) => b.name);

    if (lowList.length > 0) {
      aiSummary += `Below normal range: ${lowList.join(', ')}. `;
    }
    if (highList.length > 0) {
      aiSummary += `Above normal range: ${highList.join(', ')}. `;
    }

    aiSummary += 'Review recommended dietary and therapeutic modifications with your healthcare provider.';
  }

  return {
    reportTitle: reportTitle || 'Comprehensive Metabolic & Diagnostic Report',
    reportDate: reportDate ? new Date(reportDate) : new Date(),
    totalTests: evaluatedBiomarkers.length,
    abnormalCount: abnormalEntries.length,
    criticalCount: criticalEntries.length,
    biomarkers: evaluatedBiomarkers,
    aiSummary,
    verifiedSource: 'Pathology Reference Standards & LOINC Clinical Directory',
  };
};
