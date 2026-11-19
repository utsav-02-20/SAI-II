import { Router } from 'express';
import multer from 'multer';
import { analyzeReport, getReports, getBiomarkerTrend } from '../controllers/report.controller.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { db } from '../config/db.js';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    if (decoded && decoded.userId) {
      try {
        const user = await db.user.findUnique({ where: { id: decoded.userId } });
        if (user) req.user = user;
      } catch (err) {
        // proceed unauthenticated
      }
    }
  }
  next();
};

const normalizeUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

router.post('/analyze', optionalAuth, normalizeUpload, analyzeReport);
router.get('/', optionalAuth, getReports);
router.get('/trend', optionalAuth, getBiomarkerTrend);

export default router;
