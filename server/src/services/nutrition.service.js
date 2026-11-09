/**
 * Clinical Nutrition Deficiency & Micronutrient Engine
 * Maps non-specific physical symptoms to candidate micronutrient deficiencies,
 * dietary prescriptions, and diagnostic lab test recommendations.
 */

export const NUTRITION_DEFICIENCY_KNOWLEDGE = {
  iron: {
    deficiencyName: 'Iron Deficiency Anemia',
    typicalSymptoms: [
      'hair fall',
      'hair loss',
      'fatigue',
      'pale skin',
      'brittle nails',
      'cold hands',
      'shortness of breath on mild exertion',
      'dizziness',
    ],
    explanation: 'Iron is essential for hemoglobin synthesis, which carries oxygen to your hair follicles, skin cells, and tissues. Insufficient iron restricts oxygen delivery, triggering diffuse hair shedding, extreme fatigue, and pale skin.',
    recommendedFoods: {
      vegetarian: [
        'Spinach, fenugreek (methi) & green leafy vegetables',
        'Lentils, chickpeas (chana) & rajma',
        'Beetroot, pomegranate & dried dates (khajoor)',
        'Jaggery (gur) & black sesame seeds',
        'Note: Pair with Vitamin C (lemon, amla) to enhance non-heme iron absorption; avoid tea/coffee around meals.',
      ],
      nonVegetarian: [
        'Lean chicken breast & mutton liver',
        'Eggs (especially egg yolk)',
        'Fatty fish (salmon, sardines)',
      ],
    },
    suggestedDiagnosticTests: [
      'Complete Blood Count (CBC) - checks Hemoglobin & MCV',
      'Serum Ferritin - gold standard for stored iron reserves',
      'Total Iron Binding Capacity (TIBC)',
    ],
  },

  vitamin_d: {
    deficiencyName: 'Vitamin D3 (Cholecalciferol) Deficiency',
    typicalSymptoms: [
      'bone pain',
      'back ache',
      'muscle cramps',
      'muscle weakness',
      'fatigue',
      'low mood',
      'frequent infections',
      'slow wound healing',
    ],
    explanation: 'Vitamin D regulates calcium-phosphate homeostasis and immune cell function. Deficiency leads to reduced bone mineral density, chronic generalized osteo-muscular aches, and recurrent upper respiratory infections.',
    recommendedFoods: {
      vegetarian: [
        'Fortified milk, yogurt & plant milks',
        'Mushrooms exposed to UV sunlight',
        'Paneer & fortified breakfast cereals',
        'Midday sunlight exposure (15-20 minutes between 11 AM - 1 PM on bare arms/face)',
      ],
      nonVegetarian: [
        'Egg yolks',
        'Fatty fish (salmon, mackerel, tuna)',
        'Cod liver oil',
      ],
    },
    suggestedDiagnosticTests: [
      'Serum 25-Hydroxy Vitamin D [25(OH)D] test',
      'Serum Calcium & Alkaline Phosphatase (ALP)',
    ],
  },

  vitamin_b12: {
    deficiencyName: 'Vitamin B12 (Cobalamin) Deficiency',
    typicalSymptoms: [
      'tingling in fingers',
      'numbness in hands and feet',
      'pins and needles',
      'mouth ulcers',
      'smooth red tongue',
      'memory fog',
      'fatigue',
      'balance problems',
    ],
    explanation: 'Vitamin B12 is vital for myelin nerve sheath maintenance and red blood cell maturation. Severe or prolonged deficiency causes peripheral neuropathy (tingling sensation in extremities) and macrocytic megaloblastic anemia.',
    recommendedFoods: {
      vegetarian: [
        'Curd (dahi), milk & paneer',
        'Fortified nutritional yeast',
        'Fortified cereals & plant milks',
        'Note: Since plants do not synthesize B12, strict vegetarians frequently require oral methylcobalamin supplements.',
      ],
      nonVegetarian: [
        'Eggs',
        'Fish, chicken & poultry',
        'Dairy & cheese',
      ],
    },
    suggestedDiagnosticTests: [
      'Serum Vitamin B12 test',
      'Complete Blood Count (CBC) with Peripheral Blood Smear (checking for Macrocytosis / High MCV)',
    ],
  },

  zinc: {
    deficiencyName: 'Zinc Deficiency',
    typicalSymptoms: [
      'loss of taste',
      'loss of smell',
      'delayed wound healing',
      'hair thinning',
      'white spots on nails',
      'recurrent skin rashes',
      'acne',
    ],
    explanation: 'Zinc is a critical cofactor for over 300 enzymes responsible for cell division, protein synthesis, epidermal integrity, and taste bud receptor maintenance.',
    recommendedFoods: {
      vegetarian: [
        'Pumpkin seeds (pepitas) & sunflower seeds',
        'Chickpeas, lentils & kidney beans',
        'Cashews, almonds & walnuts',
        'Whole grain oats & dark chocolate',
      ],
      nonVegetarian: [
        'Eggs & dairy',
        'Poultry & seafood (especially shellfish)',
      ],
    },
    suggestedDiagnosticTests: [
      'Serum Zinc Level',
      'Serum Alkaline Phosphatase',
    ],
  },
};

/**
 * Evaluates reported physical symptoms and identifies likely micronutrient deficiencies
 */
export const detectNutritionalDeficiency = (symptoms = []) => {
  const cleanSymptoms = symptoms.map((s) => s.toLowerCase().trim());
  const results = [];

  for (const [key, data] of Object.entries(NUTRITION_DEFICIENCY_KNOWLEDGE)) {
    let matchCount = 0;
    const matchedSymptoms = [];

    for (const symptom of cleanSymptoms) {
      for (const typical of data.typicalSymptoms) {
        if (symptom.includes(typical) || typical.includes(symptom)) {
          matchCount++;
          matchedSymptoms.push(typical);
          break;
        }
      }
    }

    if (matchCount > 0) {
      const matchScore = Math.min(Math.round((matchCount / Math.min(cleanSymptoms.length, 4)) * 100), 95);
      results.push({
        id: key,
        deficiencyName: data.deficiencyName,
        matchScore,
        confidenceLevel: matchScore >= 70 ? 'High Probability' : 'Moderate Probability',
        matchedSymptoms: Array.from(new Set(matchedSymptoms)),
        clinicalExplanation: data.explanation,
        foodRecommendations: data.recommendedFoods,
        suggestedDiagnosticTests: data.suggestedDiagnosticTests,
      });
    }
  }

  // Sort by highest match score
  results.sort((a, b) => b.matchScore - a.matchScore);

  if (results.length === 0) {
    return {
      success: true,
      totalSymptomsEvaluated: symptoms.length,
      identifiedDeficiencies: [],
      message: 'No classic single micronutrient deficiency pattern strongly matched the provided symptoms. Ensure a balanced whole-food diet.',
    };
  }

  return {
    success: true,
    totalSymptomsEvaluated: symptoms.length,
    topCandidate: results[0].deficiencyName,
    identifiedDeficiencies: results,
    clinicalAdvice: 'These inferences provide educational screening based on classic clinical symptom clusters. Confirm with recommended laboratory blood tests before initiating high-dose pharmacological supplementation.',
  };
};
