import { Router } from 'express';
import {
  askMedicalRAG,
  checkMisinformation,
  detectDeficiency,
} from '../controllers/knowledge.controller.js';

const router = Router();

router.post('/ask', askMedicalRAG);
router.post('/check-myth', checkMisinformation);
router.post('/detect-deficiency', detectDeficiency);

export default router;
