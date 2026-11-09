import {
  resolveMedicine,
  detectDuplicateMedicines,
  evaluateInteractions,
  checkPatientAllergies,
  MEDICINE_KNOWLEDGE_BASE,
} from '../services/medicine.service.js';
import { db } from '../config/db.js';

export const analyzeMedicines = async (req, res) => {
  try {
    const { medicines, allergies: passedAllergies } = req.body;

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'An array of at least one medicine name is required.' },
      });
    }

    // 1. Fetch patient's saved allergies if authenticated
    let combinedAllergies = passedAllergies || [];
    if (req.user && req.user.id) {
      const patient = await db.patientProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (patient && Array.isArray(patient.allergies)) {
        combinedAllergies = Array.from(new Set([...combinedAllergies, ...patient.allergies]));
      }
    }

    // 2. Resolve medicines to standardized pharmacology models
    const resolvedMeds = medicines.map((medName) => resolveMedicine(medName));

    // 3. Evaluate duplicate medications and overdose risks
    const duplicateWarnings = detectDuplicateMedicines(resolvedMeds);

    // 4. Evaluate drug-drug interactions
    const detectedInteractions = evaluateInteractions(resolvedMeds);

    // 5. Cross-check against patient allergies
    const allergyWarnings = checkPatientAllergies(resolvedMeds, combinedAllergies);

    // 6. Summary metrics
    const hasHighRisk =
      duplicateWarnings.length > 0 ||
      allergyWarnings.length > 0 ||
      detectedInteractions.some((int) => int.severity === 'HIGH');

    return res.status(200).json({
      success: true,
      summary: {
        totalMedicinesAnalyzed: resolvedMeds.length,
        hasHighRiskWarnings: hasHighRisk,
        duplicateCount: duplicateWarnings.length,
        interactionCount: detectedInteractions.length,
        allergyWarningCount: allergyWarnings.length,
      },
      duplicateWarnings,
      detectedInteractions,
      allergyWarnings,
      individualMedicines: resolvedMeds.map((med) => ({
        brand: med.brand,
        generic: med.generic,
        therapeuticClass: med.therapeuticClass,
        activeIngredients: med.activeIngredients,
        sideEffects: med.sideEffects,
        foodInteractions: med.foodInteractions,
        timingInstructions: med.timingInstructions,
        verifiedSource: med.verifiedSource,
      })),
      verifiedSources: [
        'US National Library of Medicine (RxNorm API)',
        'OpenFDA Drug Adverse Event & Boxed Warning API',
        'Indian Pharmacopoeia & CDSCO Approved Drug List',
      ],
      clinicalDisclaimer:
        'This analysis is for educational and clinical decision-support purposes only. Never alter or discontinue prescribed medication without consulting your attending physician.',
    });
  } catch (error) {
    console.error('[Analyze Medicines Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to complete pharmacological medicine analysis.' },
    });
  }
};

export const searchMedicines = async (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase().trim();
    if (!query) {
      return res.status(200).json({ success: true, results: [] });
    }

    const matches = [];
    for (const [key, med] of Object.entries(MEDICINE_KNOWLEDGE_BASE)) {
      if (
        key.includes(query) ||
        med.generic.toLowerCase().includes(query) ||
        med.synonyms.some((s) => s.includes(query))
      ) {
        matches.push({
          brand: med.brand,
          generic: med.generic,
          therapeuticClass: med.therapeuticClass,
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: matches.length,
      results: matches.slice(0, 10),
    });
  } catch (error) {
    console.error('[Search Medicines Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to search medicine database.' },
    });
  }
};
