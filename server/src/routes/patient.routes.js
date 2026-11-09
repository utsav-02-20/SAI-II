import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/patient.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Routes protected by authentication and role
router.get('/profile', requireAuth, requireRole(['PATIENT', 'ADMIN']), getProfile);
router.put('/profile', requireAuth, requireRole(['PATIENT', 'ADMIN']), updateProfile);

export default router;
