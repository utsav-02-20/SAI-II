import {
  startTriageSession,
  progressTriageSession,
  analyzeSymptomImage,
} from '../services/triage.service.js';

const activeTriageSessions = new Map();

export const startTriage = async (req, res) => {
  try {
    const { chiefComplaint = 'fever', language = 'en' } = req.body;
    const session = startTriageSession(chiefComplaint);
    if (session.sessionId) {
      activeTriageSessions.set(session.sessionId, session);
    }

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('[Start Triage Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to initiate adaptive clinical triage.' },
    });
  }
};

export const nextTriageQuestion = async (req, res) => {
  try {
    let { treeKey, currentQuestionIndex, answer, history, sessionId } = req.body;

    // Retrieve from session cache if sessionId is passed
    if (sessionId && activeTriageSessions.has(sessionId)) {
      const cached = activeTriageSessions.get(sessionId);
      treeKey = treeKey || cached.treeKey;
      currentQuestionIndex =
        currentQuestionIndex !== undefined ? currentQuestionIndex : cached.currentQuestionIndex;
      history = history || cached.history || [];
    }

    treeKey = treeKey || 'fever';
    currentQuestionIndex = currentQuestionIndex !== undefined ? parseInt(currentQuestionIndex, 10) : 0;
    answer = answer || 'Yes';

    const result = progressTriageSession({
      treeKey,
      currentQuestionIndex,
      answer,
      history: history || [],
    });

    if (sessionId && activeTriageSessions.has(sessionId)) {
      activeTriageSessions.set(sessionId, {
        ...activeTriageSessions.get(sessionId),
        ...result,
      });
    }

    return res.status(200).json({
      success: true,
      session: {
        id: sessionId,
        sessionId,
        ...result,
      },
      ...result,
    });
  } catch (error) {
    console.error('[Next Triage Question Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to process triage question response.' },
    });
  }
};

export const analyzeImage = async (req, res) => {
  try {
    const { imageType, type, description } = req.body;
    let inferredType = type || imageType || 'skin_rash';

    if (req.file) {
      const fileName = (req.file.originalname || '').toLowerCase();
      if (fileName.includes('eye')) inferredType = 'eye_redness';
      else if (fileName.includes('nail')) inferredType = 'nail_discoloration';
      else inferredType = 'skin_rash';
    }

    const analysis = analyzeSymptomImage(inferredType, description);

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('[Analyze Symptom Image Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to complete visual symptom triage.' },
    });
  }
};
