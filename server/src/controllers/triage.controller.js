import {
  startTriageSession,
  progressTriageSession,
  analyzeSymptomImage,
} from '../services/triage.service.js';

export const startTriage = async (req, res) => {
  try {
    const { chiefComplaint = 'fever', language = 'en' } = req.body;
    const session = startTriageSession(chiefComplaint);

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
    const { treeKey, currentQuestionIndex, answer, history } = req.body;

    if (!treeKey || currentQuestionIndex === undefined || !answer) {
      return res.status(400).json({
        success: false,
        error: { message: 'treeKey, currentQuestionIndex, and answer are required.' },
      });
    }

    const result = progressTriageSession({
      treeKey,
      currentQuestionIndex: parseInt(currentQuestionIndex, 10),
      answer,
      history: history || [],
    });

    return res.status(200).json({
      success: true,
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
    const { imageType, description } = req.body;
    let inferredType = imageType || 'skin_rash';

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
