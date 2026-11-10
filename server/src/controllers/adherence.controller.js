import { AdherenceService } from '../services/adherence.service.js';

export const getSchedule = async (req, res, next) => {
  try {
    const patientId = req.user?.id || req.query.patientId || 'default-patient';
    const schedule = await AdherenceService.getActiveSchedule(patientId);
    return res.status(200).json({ success: true, schedule });
  } catch (error) {
    next(error);
  }
};

export const addSchedule = async (req, res, next) => {
  try {
    const patientId = req.user?.id || req.body.patientId || 'default-patient';
    const prescription = await AdherenceService.addPrescriptionSchedule(patientId, req.body);
    return res.status(201).json({ success: true, prescription });
  } catch (error) {
    next(error);
  }
};

export const logDose = async (req, res, next) => {
  try {
    const patientId = req.user?.id || req.body.patientId || 'default-patient';
    const { medicineName, status, scheduledTime } = req.body;
    if (!medicineName) {
      return res.status(400).json({ success: false, message: 'medicineName is required' });
    }
    const result = await AdherenceService.logDose(patientId, medicineName, status, scheduledTime);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const patientId = req.user?.id || req.query.patientId || 'default-patient';
    const stats = await AdherenceService.getAdherenceStats(patientId);
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};

export const triggerReminderSimulation = async (req, res, next) => {
  try {
    const patientId = req.user?.id || req.body.patientId || 'default-patient';
    const medicineName = req.body.medicineName || 'Glycomet 500 SR';
    const reminder = await AdherenceService.simulateReminderDispatch(patientId, medicineName);
    return res.status(200).json({ success: true, reminder });
  } catch (error) {
    next(error);
  }
};
