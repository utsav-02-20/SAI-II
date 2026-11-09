import { queryClinicalRAG } from '../services/rag.service.js';
import { checkMedicalMyth } from '../services/misinformation.service.js';
import { detectNutritionalDeficiency } from '../services/nutrition.service.js';

export const askMedicalRAG = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Query string is required.' },
      });
    }

    const answerData = queryClinicalRAG(query);
    return res.status(200).json({
      success: true,
      data: answerData,
    });
  } catch (error) {
    console.error('[Ask Medical RAG Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve grounded medical guidelines.' },
    });
  }
};

export const checkMisinformation = async (req, res) => {
  try {
    const { claim } = req.body;
    if (!claim || !claim.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Health claim or statement is required for verification.' },
      });
    }

    const verdictData = checkMedicalMyth(claim);
    return res.status(200).json({
      success: true,
      data: verdictData,
    });
  } catch (error) {
    console.error('[Check Misinformation Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to verify health claim.' },
    });
  }
};

export const detectDeficiency = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'An array of reported physical symptoms is required.' },
      });
    }

    const result = detectNutritionalDeficiency(symptoms);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Detect Deficiency Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to evaluate nutritional deficiencies.' },
    });
  }
};
