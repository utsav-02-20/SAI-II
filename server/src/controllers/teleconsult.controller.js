import { SymptomTrendService } from '../services/symptomTrend.service.js';
import { TeleconsultationService } from '../services/teleconsultation.service.js';

export const logSymptom = async (req, res, next) => {
  try {
    const patientId = req.user?.id || req.body.patientId || 'default-patient';
    const entry = await SymptomTrendService.logSymptom(patientId, req.body);
    return res.status(201).json({ success: true, entry });
  } catch (error) {
    next(error);
  }
};

export const getLongitudinalReplay = async (req, res, next) => {
  try {
    const patientId = req.user?.id || req.query.patientId || 'default-patient';
    const replay = await SymptomTrendService.generateLongitudinalReplay(patientId);
    return res.status(200).json(replay);
  } catch (error) {
    next(error);
  }
};

export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await TeleconsultationService.getDoctorDirectory();
    return res.status(200).json({ success: true, doctors });
  } catch (error) {
    next(error);
  }
};

export const getPreTriagePacket = async (req, res, next) => {
  try {
    const patientId = req.user?.id || req.params.patientId || req.query.patientId || 'default-patient';
    const packet = await TeleconsultationService.generatePreTriagePacket(patientId);
    return res.status(200).json({ success: true, packet });
  } catch (error) {
    next(error);
  }
};

export const createTeleconsultRoom = async (req, res, next) => {
  try {
    const patientId = req.user?.id || req.body.patientId || 'default-patient';
    const doctorId = req.body.doctorId || 'doc-1';
    const room = await TeleconsultationService.createTeleconsultationRoom(patientId, doctorId);
    return res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

export const finalizeConsultation = async (req, res, next) => {
  try {
    const appointmentId = req.body.appointmentId || 'apt-1';
    const result = await TeleconsultationService.finalizeConsultation(appointmentId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
