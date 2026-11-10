import { Router } from 'express';
import {
  getSchedule,
  addSchedule,
  logDose,
  getStats,
  triggerReminderSimulation,
} from '../controllers/adherence.controller.js';

const router = Router();

router.get('/schedule', getSchedule);
router.post('/schedule', addSchedule);
router.post('/log', logDose);
router.get('/stats', getStats);
router.post('/simulate-reminder', triggerReminderSimulation);

export default router;
