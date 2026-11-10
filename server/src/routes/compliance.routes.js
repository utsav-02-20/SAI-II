import { Router } from 'express';
import {
  encryptField,
  decryptField,
  scrubText,
  getComplianceStatus,
} from '../controllers/compliance.controller.js';

const router = Router();

router.post('/encrypt-phi', encryptField);
router.post('/decrypt-phi', decryptField);
router.post('/scrub-pii', scrubText);
router.get('/status', getComplianceStatus);

export default router;
