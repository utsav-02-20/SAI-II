import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { email, password, role = 'PATIENT', firstName = '', lastName = '', phone = '' } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required.' },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: 'Password must be at least 6 characters long.' },
      });
    }

    // Check duplicate email
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { message: 'An account with this email already exists.' },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user and profile
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        phone,
        role: role.toUpperCase(),
        ...(role.toUpperCase() === 'PATIENT' && {
          patientProfile: {
            create: {
              firstName: firstName || 'New',
              lastName: lastName || 'Patient',
              dateOfBirth: new Date('2000-01-01'),
              gender: 'OTHER',
              allergies: [],
              chronicConditions: [],
            },
          },
        }),
        ...(role.toUpperCase() === 'DOCTOR' && {
          doctorProfile: {
            create: {
              fullName: `${firstName} ${lastName}`.trim() || 'Dr. Specialist',
              specialty: 'General Physician',
              medicalLicenseNo: `LIC-${Date.now()}`,
              experienceYears: 5,
              consultationFee: 500,
            },
          },
        }),
      },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    // Store refresh token
    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profile: user.patientProfile || user.doctorProfile,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to register account.' },
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required.' },
      });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password.' },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password.' },
      });
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profile: user.patientProfile || user.doctorProfile,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to process login.' },
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: { message: 'Refresh token is required.' } });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, error: { message: 'Invalid or expired refresh token.' } });
    }

    const stored = await db.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ success: false, error: { message: 'Refresh token revoked or expired.' } });
    }

    const user = await db.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'User not found.' } });
    }

    const newAccessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });

    return res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    console.error('[RefreshToken Error]', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to refresh token.' } });
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        profile: req.user.patientProfile || req.user.doctorProfile,
      },
    },
  });
};
