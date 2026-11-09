import { Router } from 'express';
import multer from 'multer';
import {
  startTriage,
  nextTriageQuestion,
  analyzeImage,
} from '../controllers/triage.controller.js';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.post('/start', startTriage);
router.post('/next', nextTriageQuestion);
router.post('/analyze-image', upload.single('image'), analyzeImage);

export default router;
