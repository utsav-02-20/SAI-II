import { db } from '../config/db.js';

/**
 * ArogyaAI Medication Adherence Service
 * Implements:
 * 1. Medication Scheduling & Regimen Management
 * 2. Dose Logging (TAKEN, SKIPPED, SNOOZED)
 * 3. Consecutive Day Streak Calculation & Perfect Adherence Badges
 * 4. Multi-channel Notification Payload Dispatch Simulator
 */

export class AdherenceService {
  /**
   * Adds or updates a prescribed medication schedule
   */
  static async addPrescriptionSchedule(patientId, scheduleData) {
    const medicines = scheduleData.medicines || [
      {
        brandName: scheduleData.brandName || scheduleData.name || 'Metformin',
        genericName: scheduleData.genericName || 'Metformin HCl',
        dosage: scheduleData.dosage || '500mg',
        frequency: scheduleData.frequency || 'Twice Daily',
        timings: scheduleData.timings || ['08:00', '20:00'],
        instructions: scheduleData.instructions || 'Take with food to prevent gastrointestinal upset',
        durationDays: scheduleData.durationDays || 30,
      },
    ];

    const prescription = await db.prescription.create({
      data: {
        patientId: patientId || 'default-patient',
        prescribedBy: scheduleData.prescribedBy || 'Dr. Clinical Care',
        diagnosis: scheduleData.diagnosis || 'Type 2 Diabetes Management',
        startDate: new Date(),
        isActive: true,
        medicines,
      },
    });

    return prescription;
  }

  /**
   * Retrieves active medication schedule for patient
   */
  static async getActiveSchedule(patientId) {
    const list = await db.prescription.findMany({
      where: { patientId: patientId || 'default-patient', isActive: true },
    });

    // If empty, supply default standard schedule
    if (list.length === 0) {
      return [
        {
          id: 'rx-default-1',
          patientId: patientId || 'default-patient',
          prescribedBy: 'Dr. Ananya Sharma, MD',
          diagnosis: 'Type 2 Diabetes & Hypertension',
          isActive: true,
          medicines: [
            {
              brandName: 'Glycomet 500 SR',
              genericName: 'Metformin Hydrochloride',
              dosage: '500mg',
              frequency: 'Twice Daily',
              timings: ['08:00 AM', '08:00 PM'],
              instructions: 'Take immediately after breakfast and dinner',
              durationDays: 60,
            },
            {
              brandName: 'Telma 40',
              genericName: 'Telmisartan',
              dosage: '40mg',
              frequency: 'Once Daily',
              timings: ['09:00 AM'],
              instructions: 'Take in morning with a glass of water',
              durationDays: 30,
            },
          ],
        },
      ];
    }

    return list;
  }

  /**
   * Logs a medication dose action (TAKEN, SKIPPED, SNOOZED)
   */
  static async logDose(patientId, medicineName, status = 'TAKEN', scheduledTime = new Date()) {
    const normStatus = status.toUpperCase();
    const pid = patientId || 'default-patient';

    // Retrieve previous logs to compute current running streak
    const previousLogs = await db.adherenceLog.findMany({
      where: { patientId: pid, medicineName },
      orderBy: { createdAt: 'desc' },
    });

    let currentStreak = 1;
    if (previousLogs.length > 0) {
      const last = previousLogs[previousLogs.length - 1];
      if (normStatus === 'TAKEN' && (last.status === 'TAKEN')) {
        currentStreak = (last.streakCount || 1) + 1;
      } else if (normStatus !== 'TAKEN') {
        currentStreak = 0; // Reset streak on missed/skipped dose
      }
    }

    const logEntry = await db.adherenceLog.create({
      data: {
        patientId: pid,
        medicineName,
        scheduledTime: new Date(scheduledTime),
        takenTime: normStatus === 'TAKEN' ? new Date() : null,
        status: normStatus,
        streakCount: currentStreak,
      },
    });

    const metrics = await this.getAdherenceStats(pid);

    return {
      success: true,
      log: logEntry,
      currentStreakDays: metrics.consecutiveStreakDays,
      adherenceRatePercent: metrics.adherenceRatePercent,
      unlockedBadges: metrics.badges,
    };
  }

  /**
   * Calculates overall adherence metrics, consecutive day streaks, and rewards
   */
  static async getAdherenceStats(patientId) {
    const pid = patientId || 'default-patient';
    const logs = await db.adherenceLog.findMany({
      where: { patientId: pid },
    });

    // If no logs yet, provide baseline seed metrics
    if (logs.length === 0) {
      return {
        totalLoggedDoses: 14,
        takenDoses: 13,
        skippedDoses: 1,
        adherenceRatePercent: 93,
        consecutiveStreakDays: 7,
        badges: [
          { id: 'streak-3', name: '3-Day Consistency Pioneer', icon: 'Sparkles', unlocked: true },
          { id: 'streak-7', name: '7-Day Perfect Adherence Champion', icon: 'Award', unlocked: true },
          { id: 'streak-14', name: '14-Day Wellness Streak', icon: 'ShieldCheck', unlocked: false },
          { id: 'streak-30', name: '30-Day Master of Health', icon: 'Flame', unlocked: false },
        ],
        recentLogs: [],
      };
    }

    const total = logs.length;
    const taken = logs.filter((l) => l.status === 'TAKEN').length;
    const skipped = logs.filter((l) => l.status !== 'TAKEN').length;
    const rate = Math.round((taken / total) * 100);

    // Calculate maximum streak recorded
    let maxStreak = 0;
    logs.forEach((l) => {
      if (l.streakCount && l.streakCount > maxStreak) maxStreak = l.streakCount;
    });

    // Unlocked badges based on streak
    const badges = [
      { id: 'streak-3', name: '3-Day Consistency Pioneer', icon: 'Sparkles', unlocked: maxStreak >= 3 },
      { id: 'streak-7', name: '7-Day Perfect Adherence Champion', icon: 'Award', unlocked: maxStreak >= 7 },
      { id: 'streak-14', name: '14-Day Wellness Streak', icon: 'ShieldCheck', unlocked: maxStreak >= 14 },
      { id: 'streak-30', name: '30-Day Master of Health', icon: 'Flame', unlocked: maxStreak >= 30 },
    ];

    return {
      totalLoggedDoses: total,
      takenDoses: taken,
      skippedDoses: skipped,
      adherenceRatePercent: rate,
      consecutiveStreakDays: maxStreak,
      badges,
      recentLogs: logs.slice(-10),
    };
  }

  /**
   * Simulates Web Push / SMS notification dispatch
   */
  static async simulateReminderDispatch(patientId, medicineName = 'Glycomet 500 SR') {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      status: 'dispatched',
      channel: 'WebPush & WhatsApp Simulated Alert',
      recipientPatientId: patientId || 'default-patient',
      payload: {
        title: `💊 Medication Reminder: ${medicineName}`,
        body: `It is ${timeStr}. Time for your scheduled dose of ${medicineName}. Please take with water after your meal to maintain therapeutic plasma concentration.`,
        urgency: 'HIGH',
        actions: ['Mark as Taken', 'Snooze 15 Mins', 'Skip Dose'],
      },
      timestamp: now.toISOString(),
    };
  }
}
