import { Router } from 'express';
import {
  evaluateFullRisk,
  calculateHealthAgeOnly,
  generatePreventionPlanOnly,
} from '../controllers/risk.controller.js';

const router = Router();

router.post('/evaluate', evaluateFullRisk);
router.post('/health-age', calculateHealthAgeOnly);
router.post('/prevention-plan', generatePreventionPlanOnly);

export default router;
