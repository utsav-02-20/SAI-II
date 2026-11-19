import { Router } from 'express';
import {
  askMedicalRAG,
  checkMisinformation,
  detectDeficiency,
} from '../controllers/knowledge.controller.js';

const router = Router();

router.post('/ask', askMedicalRAG);
router.post('/check-myth', checkMisinformation);
router.post('/myth/verify', checkMisinformation);
router.post('/detect-deficiency', detectDeficiency);
router.post('/deficiency/check', detectDeficiency);

export default router;
