import { db } from '../config/db.js';

// Deterministic Emergency Clinical Criteria
const EMERGENCY_CRITERIA = [
  {
    category: 'CARDIAC',
    name: 'Suspected Acute Coronary Syndrome (Heart Attack)',
    keywords: [
      'crushing chest pain',
      'chest pain radiating',
      'radiating to left arm',
      'radiating to jaw',
      'chest pressure and sweating',
      'severe chest heaviness',
      'heart attack',
      'cardiac arrest',
    ],
    action: 'Immediately call for emergency cardiac ambulance (108 / 112). Chew Aspirin 300mg if not allergic and accessible.',
    actionHi: 'तुरंत आपातकालीन एम्बुलेंस (108 / 112) को कॉल करें। यदि एलर्जी नहीं है तो 300mg एस्पिरिन चबाएं।',
  },
  {
    category: 'STROKE',
    name: 'Suspected Acute Cerebrovascular Stroke (FAST Criteria)',
    keywords: [
      'facial droop',
      'face is drooping',
      'slurred speech',
      'cannot speak properly',
      'arm weakness',
      'one side weakness',
      'sudden numbness on one side',
      'stroke symptoms',
    ],
    action: 'Immediately reach the nearest Stroke-Ready Hospital within the golden hour (under 3.5 hours for thrombolysis).',
    actionHi: 'तुरंत निकटतम स्ट्रोक-तैयार अस्पताल पहुंचे (3.5 घंटे के भीतर)। समय अत्यंत महत्वपूर्ण है।',
  },
  {
    category: 'ANAPHYLAXIS',
    name: 'Severe Allergic Reaction / Anaphylactic Shock',
    keywords: [
      'throat is closing',
      'throat swelling',
      'tongue swelling',
      'lips swelling',
      'cannot breathe after eating',
      'anaphylaxis',
      'gasping for air',
      'turning blue',
    ],
    action: 'Administer Epinephrine auto-injector (EpiPen) if available into outer thigh. Call emergency services immediately.',
    actionHi: 'यदि उपलब्ध हो तो तुरंत एपिनेफ्रीन ऑटो-इंजेक्टर (EpiPen) लगाएं। आपातकालीन सेवाओं को 108 पर कॉल करें।',
  },
  {
    category: 'CRISIS',
    name: 'Acute Mental Health Emergency / Crisis',
    keywords: [
      'want to kill myself',
      'commit suicide',
      'end my life',
      'suicidal thoughts',
      'want to die',
    ],
    action: 'Please reach out immediately to Tele-MANAS (14416 or 1800-891-4416) or National Suicide Prevention Helpline (988). You are not alone.',
    actionHi: 'कृपया तुरंत टेली-मानस (14416 या 1800-891-4416) पर कॉल करें। हम आपकी सहायता के लिए उपस्थित हैं।',
  },
];

export const checkEmergency = async (req, res) => {
  try {
    const { message, text } = req.body;
    const queryText = (message || text || '').toLowerCase().trim();

    if (!queryText) {
      return res.status(400).json({
        success: false,
        error: { message: 'Query text or message is required.' },
      });
    }

    let detectedEmergency = null;

    // Check each emergency rule
    for (const criterion of EMERGENCY_CRITERIA) {
      for (const kw of criterion.keywords) {
        if (queryText.includes(kw.toLowerCase())) {
          detectedEmergency = criterion;
          break;
        }
      }
      if (detectedEmergency) break;
    }

    // If authenticated user, fetch emergency contacts
    let contactsToAlert = [];
    if (req.user && req.user.id) {
      try {
        const patient = await db.patientProfile.findUnique({
          where: { userId: req.user.id },
        });
        if (patient && patient.emergencyContacts) {
          contactsToAlert = patient.emergencyContacts;
        }
      } catch (e) {
        // non-blocking
      }
    }

    if (detectedEmergency) {
      return res.status(200).json({
        success: true,
        isEmergency: true,
        category: detectedEmergency.category,
        title: detectedEmergency.name,
        recommendedAction: detectedEmergency.action,
        recommendedActionHi: detectedEmergency.actionHi,
        emergencyHotlines: ['108 (Ambulance)', '112 (National Emergency)', '102 (Pregnancy/Child)'],
        emergencyContacts: contactsToAlert,
        disclaimer:
          'DO NOT WAIT FOR ONLINE CHATS OR APPOINTMENTS. SEEK PHYSICAL IN-PERSON EMERGENCY MEDICAL EVALUATION IMMEDIATELY.',
      });
    }

    // No emergency detected
    return res.status(200).json({
      success: true,
      isEmergency: false,
      message: 'No acute emergency red flags detected. Proceeding with routine clinical consultation.',
    });
  } catch (error) {
    console.error('[Check Emergency Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to process emergency check.' },
    });
  }
};
