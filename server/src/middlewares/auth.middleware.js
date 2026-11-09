import { verifyAccessToken } from '../utils/jwt.js';
import { db } from '../config/db.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required. Missing or invalid Bearer token.' },
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token is invalid or has expired.' },
      });
    }

    // Verify user exists in database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'User account not found.' },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server authentication error.' },
    });
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]` },
      });
    }

    next();
  };
};
