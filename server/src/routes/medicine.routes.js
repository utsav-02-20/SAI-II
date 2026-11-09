import { Router } from 'express';
import { analyzeMedicines, searchMedicines } from '../controllers/medicine.controller.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { db } from '../config/db.js';

const router = Router();

// Optional authentication middleware
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

router.post('/analyze', optionalAuth, analyzeMedicines);
router.get('/search', searchMedicines);

export default router;
