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

router.post('/analyze', optionalAuth, upload.single('file'), analyzeReport);
router.get('/', optionalAuth, getReports);
router.get('/trend', optionalAuth, getBiomarkerTrend);

export default router;
