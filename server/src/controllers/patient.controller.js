import { db } from '../config/db.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await db.patientProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { message: 'Patient profile not found for this user.' },
      });
    }

    return res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    console.error('[Get Patient Profile Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve patient profile.' },
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      heightCm,
      weightKg,
      allergies,
      chronicConditions,
      familyHistory,
      emergencyContacts,
    } = req.body;

    const profile = await db.patientProfile.upsert({
      where: { userId: req.user.id },
      update: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(bloodGroup && { bloodGroup }),
        ...(heightCm !== undefined && { heightCm: parseFloat(heightCm) }),
        ...(weightKg !== undefined && { weightKg: parseFloat(weightKg) }),
        ...(allergies && { allergies }),
        ...(chronicConditions && { chronicConditions }),
        ...(familyHistory && { familyHistory }),
        ...(emergencyContacts && { emergencyContacts }),
      },
      create: {
        userId: req.user.id,
        firstName: firstName || 'Patient',
        lastName: lastName || 'User',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('2000-01-01'),
        gender: gender || 'OTHER',
        bloodGroup,
        heightCm: heightCm ? parseFloat(heightCm) : null,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        allergies: allergies || [],
        chronicConditions: chronicConditions || [],
        familyHistory: familyHistory || [],
        emergencyContacts: emergencyContacts || [],
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Medical profile updated successfully.',
      data: { profile },
    });
  } catch (error) {
    console.error('[Update Patient Profile Error]', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to update patient profile.' },
    });
  }
};
