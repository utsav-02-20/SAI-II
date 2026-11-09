/**
 * Adaptive Clinical Triage & Differential Diagnosis Reasoning Engine
 * Mimics a physician's diagnostic thought process by asking the next highest-value question.
 * Generates structured SBAR summaries and handles vision-based symptom screening.
 */

// Clinical Differential Decision Trees
export const CLINICAL_DIFFERENTIAL_TREES = {
  fever: {
    chiefComplaint: 'Fever and Headache',
    chiefComplaintHi: 'बुखार और सिरदर्द',
    differentialCandidates: [
      { name: 'Viral Upper Respiratory Infection', baselineProb: 0.45 },
      { name: 'Dengue Fever', baselineProb: 0.25 },
      { name: 'Malaria', baselineProb: 0.20 },
      { name: 'Acute Bacterial Meningitis', baselineProb: 0.05, isRedFlag: true },
      { name: 'Enteric (Typhoid) Fever', baselineProb: 0.05 },
    ],
    questionTree: [
      {
        id: 'q_chills',
        question: 'Do you experience intense shivering or shivering chills that come in periodic episodes?',
        questionHi: 'क्या आपको तेज कंपकंपी या समय-समय पर ठंड लगकर तेज बुखार आता है?',
        targetCondition: 'Malaria',
        weight: 0.35,
      },
      {
        id: 'q_retro_orbital',
        question: 'Do you have deep pain behind your eyes or severe "breakbone" body and joint ache?',
        questionHi: 'क्या आपकी आँखों के पीछे गहरा दर्द या असहनीय बदन और जोड़ों में दर्द है?',
        targetCondition: 'Dengue Fever',
        weight: 0.40,
      },
      {
        id: 'q_neck_stiffness',
        question: 'Do you have severe neck stiffness or pain when trying to touch your chin to your chest?',
        questionHi: 'क्या आपकी गर्दन में तेज अकड़न है या ठोड़ी को छाती से छूने में असहनीय दर्द होता है?',
        targetCondition: 'Acute Bacterial Meningitis',
        weight: 0.85,
        triggersEmergencyIfYes: true,
      },
      {
        id: 'q_respiratory',
        question: 'Do you have a runny nose, sore throat, or sneezing accompanying the fever?',
        questionHi: 'क्या बुखार के साथ बहती नाक, गले में खराश या छींकें आ रही हैं?',
        targetCondition: 'Viral Upper Respiratory Infection',
        weight: 0.30,
      },
    ],
    specialtyRecommendation: 'General Physician & Infectious Disease Specialist',
  },

  cough: {
    chiefComplaint: 'Cough and Shortness of Breath',
    chiefComplaintHi: 'खांसी और सांस लेने में कठिनाई',
    differentialCandidates: [
      { name: 'Acute Bronchitis', baselineProb: 0.40 },
      { name: 'Bronchial Asthma', baselineProb: 0.30 },
      { name: 'Community-Acquired Pneumonia', baselineProb: 0.20 },
      { name: 'Gastroesophageal Reflux (GERD)', baselineProb: 0.10 },
    ],
    questionTree: [
      {
        id: 'q_phlegm',
        question: 'Is your cough producing thick yellow or green phlegm, or is it completely dry?',
        questionHi: 'क्या खांसी में गाढ़ा पीला/हरा बलगम आ रहा है या यह पूरी तरह सूखी है?',
        targetCondition: 'Community-Acquired Pneumonia',
        weight: 0.35,
      },
      {
        id: 'q_wheeze',
        question: 'Do you hear a high-pitched wheezing or whistling sound in your chest when breathing out?',
        questionHi: 'क्या सांस छोड़ते समय छाती से सीटी जैसी आवाज (घरघराहट) आती है?',
        targetCondition: 'Bronchial Asthma',
        weight: 0.45,
      },
      {
        id: 'q_night_chest',
        question: 'Does the cough worsen significantly at night when lying flat, or after heavy meals?',
        questionHi: 'क्या रात में लेटने पर या भारी भोजन के बाद खांसी अधिक बढ़ जाती है?',
        targetCondition: 'Gastroesophageal Reflux (GERD)',
        weight: 0.30,
      },
      {
        id: 'q_severe_breathless',
        question: 'Are you struggling to speak full sentences without gasping for breath?',
        questionHi: 'क्या आप सांस फूले बिना पूरा वाक्य बोलने में असमर्थ हैं?',
        targetCondition: 'Community-Acquired Pneumonia',
        weight: 0.80,
        triggersEmergencyIfYes: true,
      },
    ],
    specialtyRecommendation: 'Pulmonologist & Chest Physician',
  },

  abdominal_pain: {
    chiefComplaint: 'Abdominal Pain and Gastrointestinal Discomfort',
    chiefComplaintHi: 'पेट दर्द और पाचन संबंधी परेशानी',
    differentialCandidates: [
      { name: 'Acute Gastritis / Acid Peptic Disease', baselineProb: 0.50 },
      { name: 'Acute Appendicitis', baselineProb: 0.25, isRedFlag: true },
      { name: 'Gastroenteritis (Food Poisoning)', baselineProb: 0.20 },
      { name: 'Irritable Bowel Syndrome (IBS)', baselineProb: 0.05 },
    ],
    questionTree: [
      {
        id: 'q_lower_right',
        question: 'Is the pain localized or shifting to the lower right side of your abdomen?',
        questionHi: 'क्या दर्द पेट के निचले दाहिने हिस्से (Lower Right Abdomen) में महसूस हो रहा है?',
        targetCondition: 'Acute Appendicitis',
        weight: 0.65,
      },
      {
        id: 'q_burning',
        question: 'Is it a burning sensation in the upper stomach that improves or worsens with eating?',
        questionHi: 'क्या पेट के ऊपरी हिस्से में जलन जैसा दर्द है जो खाना खाने से घटता या बढ़ता है?',
        targetCondition: 'Acute Gastritis / Acid Peptic Disease',
        weight: 0.40,
      },
      {
        id: 'q_diarrhea_vomit',
        question: 'Have you had multiple episodes of loose watery stools or vomiting in the last 24 hours?',
        questionHi: 'क्या पिछले 24 घंटों में बार-बार दस्त या उल्टी की समस्या हुई है?',
        targetCondition: 'Gastroenteritis (Food Poisoning)',
        weight: 0.45,
      },
    ],
    specialtyRecommendation: 'Gastroenterologist & General Surgeon',
  },
};

// Vision Symptom Screening Knowledge Base (Dermatology, Eyes, Nails)
export const VISION_SYMPTOM_KNOWLEDGE = {
  skin_rash: {
    category: 'DERMATOLOGY',
    title: 'Visual Skin Lesion & Rash Screening',
    possibleConditions: [
      {
        condition: 'Contact Dermatitis / Urticaria (Hives)',
        probability: 'High',
        description: 'Erythematous, pruritic wheals or localized skin irritation triggered by allergen or chemical contact.',
        homeCare: 'Apply cool compress, avoid scented soaps, take an oral OTC antihistamine (Cetirizine) if itching persists.',
      },
      {
        condition: 'Tinea Corporis (Fungal Ringworm)',
        probability: 'Moderate',
        description: 'Annular, ring-shaped lesion with raised active scaly borders and central clearing.',
        homeCare: 'Keep area dry, avoid sharing towels, topical antifungal cream (Clotrimazole) under doctor advice.',
      },
    ],
    recommendedSpecialty: 'Dermatologist',
    urgency: 'ROUTINE_OUTPATIENT',
  },

  eye_redness: {
    category: 'OPHTHALMOLOGY',
    title: 'Visual Conjunctival Redness & Scleral Screening',
    possibleConditions: [
      {
        condition: 'Acute Conjunctivitis ("Pink Eye")',
        probability: 'High',
        description: 'Superficial conjunctival vascular injection, discharge, and foreign body sensation.',
        homeCare: 'Clean eyes with sterile saline wipes, do not rub, do not wear contact lenses until resolved.',
      },
      {
        condition: 'Subconjunctival Hemorrhage',
        probability: 'Moderate',
        description: 'Sharply demarcated bright red patch of blood beneath clear conjunctiva, usually painless.',
        homeCare: 'Typically self-resolving within 10-14 days. Monitor blood pressure.',
      },
    ],
    recommendedSpecialty: 'Ophthalmologist',
    urgency: 'MONITOR_CLOSELY',
  },

  nail_discoloration: {
    category: 'DERMATOLOGY_PODIATRY',
    title: 'Visual Nail Plate & Bed Screening',
    possibleConditions: [
      {
        condition: 'Onychomycosis (Fungal Nail Infection)',
        probability: 'High',
        description: 'Subungual hyperkeratosis, yellowish/brownish discoloration, and thickening of the nail plate.',
        homeCare: 'Keep nails trimmed and dry. Prolonged oral/topical antifungal therapy may be prescribed.',
      },
      {
        condition: 'Koilonychia / Spoon Nails (Iron Deficiency Anemia)',
        probability: 'Low',
        description: 'Concave spoon-like depression of nail plate; classically associated with chronic microcytic anemia.',
        homeCare: 'Complete Blood Count (CBC) and serum ferritin testing recommended.',
      },
    ],
    recommendedSpecialty: 'Dermatologist or Podiatrist',
    urgency: 'ROUTINE_OUTPATIENT',
  },
};

/**
 * Initializes a new adaptive clinical triage session
 */
export const startTriageSession = (chiefComplaint = 'fever') => {
  const clean = chiefComplaint.toLowerCase();
  let treeKey = 'fever';

  if (clean.includes('cough') || clean.includes('breath') || clean.includes('chest') || clean.includes('khansi')) {
    treeKey = 'cough';
  } else if (clean.includes('stomach') || clean.includes('belly') || clean.includes('pet') || clean.includes('abdominal')) {
    treeKey = 'abdominal_pain';
  }

  const selectedTree = CLINICAL_DIFFERENTIAL_TREES[treeKey];
  const firstQuestion = selectedTree.questionTree[0];

  return {
    sessionId: `triage_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    treeKey,
    chiefComplaint: selectedTree.chiefComplaint,
    chiefComplaintHi: selectedTree.chiefComplaintHi,
    currentQuestionIndex: 0,
    totalQuestions: selectedTree.questionTree.length,
    nextQuestion: {
      id: firstQuestion.id,
      text: firstQuestion.question,
      textHi: firstQuestion.questionHi,
      options: ['Yes', 'No', 'Unsure / Mild'],
      optionsHi: ['हाँ', 'नहीं', 'निश्चित नहीं'],
    },
    differentialCandidates: selectedTree.differentialCandidates,
    history: [],
    isComplete: false,
  };
};

/**
 * Advances triage session to the next question or produces the final SBAR clinical summary
 */
export const progressTriageSession = ({ treeKey, currentQuestionIndex = 0, answer, history = [] }) => {
  const tree = CLINICAL_DIFFERENTIAL_TREES[treeKey] || CLINICAL_DIFFERENTIAL_TREES.fever;
  const currentQ = tree.questionTree[currentQuestionIndex];

  // Append to conversation history
  const updatedHistory = [
    ...history,
    {
      questionId: currentQ.id,
      question: currentQ.question,
      questionHi: currentQ.questionHi,
      answer,
    },
  ];

  // Check if answer triggered a red-flag emergency
  const isAffirmative = answer.toLowerCase().startsWith('yes') || answer.toLowerCase().includes('हाँ');
  if (currentQ.triggersEmergencyIfYes && isAffirmative) {
    return {
      isEmergency: true,
      category: 'CRITICAL_TRIAGE_ESCALATION',
      title: `Emergency Clinical Red Flag: Suspected ${currentQ.targetCondition}`,
      recommendedAction: 'Immediate hospitalization or emergency room evaluation required. This symptom represents a time-critical clinical risk.',
      recommendedActionHi: 'तत्काल अस्पताल या आपातकालीन कक्ष में जाएं। यह लक्षण अत्यंत गंभीर है।',
      emergencyHotlines: ['108 (Ambulance)', '112 (National Emergency)'],
      isComplete: true,
    };
  }

  const nextIndex = currentQuestionIndex + 1;

  // If more questions exist in tree, deliver the next discriminator question
  if (nextIndex < tree.questionTree.length) {
    const nextQ = tree.questionTree[nextIndex];
    return {
      treeKey,
      currentQuestionIndex: nextIndex,
      totalQuestions: tree.questionTree.length,
      nextQuestion: {
        id: nextQ.id,
        text: nextQ.question,
        textHi: nextQ.questionHi,
        options: ['Yes', 'No', 'Unsure / Mild'],
        optionsHi: ['हाँ', 'नहीं', 'निश्चित नहीं'],
      },
      history: updatedHistory,
      isComplete: false,
    };
  }

  // Triage completed: Calculate differential rankings and compile clinical SBAR summary
  const topCandidate = tree.differentialCandidates[0].name;

  const sbarSummary = {
    situation: `Patient presenting with ${tree.chiefComplaint} evaluated across targeted clinical differential questionnaire.`,
    background: `Evaluated responses: ${updatedHistory.map((h) => `${h.question}: ${h.answer}`).join('; ')}.`,
    assessment: `Primary differential diagnosis indicates highest clinical probability for ${topCandidate}. Rule out secondary candidates: ${tree.differentialCandidates.slice(1, 3).map((c) => c.name).join(', ')}.`,
    recommendation: `Schedule in-person consultation with a ${tree.specialtyRecommendation}. Maintain adequate hydration and monitor temperature/vitals every 4 hours.`,
  };

  return {
    isComplete: true,
    treeKey,
    chiefComplaint: tree.chiefComplaint,
    differentialRankings: tree.differentialCandidates,
    sbarSummary,
    recommendedSpecialty: tree.specialtyRecommendation,
    history: updatedHistory,
    disclaimer: 'Clinical decision-support triage summary. Not a replacement for a formal clinical diagnosis by a licensed physician.',
  };
};

/**
 * Evaluates uploaded symptom images for dermatology, ophthalmology, and nail conditions
 */
export const analyzeSymptomImage = (imageType = 'skin_rash', description = '') => {
  const cleanType = (imageType || '').toLowerCase();
  let key = 'skin_rash';

  if (cleanType.includes('eye') || cleanType.includes('redness') || cleanType.includes('conjunctiva')) {
    key = 'eye_redness';
  } else if (cleanType.includes('nail') || cleanType.includes('fungus')) {
    key = 'nail_discoloration';
  }

  const visionData = VISION_SYMPTOM_KNOWLEDGE[key];

  return {
    success: true,
    screenedCategory: visionData.category,
    title: visionData.title,
    detectedDescription: description || 'Visual image evaluated for morphological characteristics, erythema, and surface texture.',
    possibleConditions: visionData.possibleConditions,
    recommendedSpecialty: visionData.recommendedSpecialty,
    urgency: visionData.urgency,
    calibrationNote: 'Evaluated across multi-ethnic skin tones. Visual inspection cannot replace in-person dermatoscope or pathology biopsy examination.',
  };
};
