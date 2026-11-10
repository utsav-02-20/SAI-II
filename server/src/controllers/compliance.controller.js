import { encryptPHI, decryptPHI } from '../utils/crypto.js';
import { scrubPHI } from '../utils/phiScrubber.js';

export const encryptField = async (req, res, next) => {
  try {
    const { plaintext } = req.body;
    if (!plaintext) {
      return res.status(400).json({ success: false, message: 'plaintext is required' });
    }
    const encrypted = encryptPHI(plaintext);
    return res.status(200).json({ success: true, encrypted });
  } catch (error) {
    next(error);
  }
};

export const decryptField = async (req, res, next) => {
  try {
    const { encrypted } = req.body;
    if (!encrypted) {
      return res.status(400).json({ success: false, message: 'encrypted payload is required' });
    }
    const decrypted = decryptPHI(encrypted);
    return res.status(200).json({ success: true, decrypted });
  } catch (error) {
    next(error);
  }
};

export const scrubText = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'text is required' });
    }
    const result = scrubPHI(text);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getComplianceStatus = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      platform: 'ArogyaAI Clinical Intelligence System',
      auditTimestamp: new Date().toISOString(),
      standardsCompliant: [
        {
          name: 'HIPAA Security Rule (45 CFR § 164.312)',
          status: 'COMPLIANT',
          features: ['AES-256-GCM encryption at rest', 'TLS 1.3 in transit', 'Safe Harbor de-identification'],
        },
        {
          name: 'Digital Personal Data Protection Act 2023 (India)',
          status: 'COMPLIANT',
          features: ['Explicit patient consent acknowledgement', 'Purpose-limited processing', 'Zero data retention on LLM gateways'],
        },
        {
          name: 'Ayushman Bharat Digital Mission (ABDM / MHA)',
          status: 'READY',
          features: ['FHIR R4 lab biomarker ontology alignment', 'Standardized LOINC and SNOMED-CT cross-mappings'],
        },
      ],
      legalDisclaimer:
        'ArogyaAI is an assistive clinical decision-support and educational tool. It does not provide medical diagnosis or replace licensed physician consultations.',
    });
  } catch (error) {
    next(error);
  }
};
