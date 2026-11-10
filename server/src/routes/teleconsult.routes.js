import { Router } from 'express';
import {
  logSymptom,
  getLongitudinalReplay,
  getDoctors,
  getPreTriagePacket,
  createTeleconsultRoom,
  finalizeConsultation,
} from '../controllers/teleconsult.controller.js';

const router = Router();

router.post('/symptoms/log', logSymptom);
router.get('/trends/replay', getLongitudinalReplay);
router.get('/doctors', getDoctors);
router.get('/pre-triage/:patientId?', getPreTriagePacket);
router.post('/room/create', createTeleconsultRoom);
router.post('/room/finalize', finalizeConsultation);

export default router;
