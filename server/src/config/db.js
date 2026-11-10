import { prisma } from './prisma.js';

// In-Memory Fallback Store (Used when MongoDB Atlas credentials are not yet configured)
class InMemoryStore {
  constructor() {
    this.users = new Map();
    this.patientProfiles = new Map();
    this.doctorProfiles = new Map();
    this.refreshTokens = new Map();
    this.labReports = [];
    this.prescriptions = [];
    this.adherenceLogs = [];
    this.symptomLogs = [];
    this.appointments = [];
    this.isFallback = false;
  }

  generateId() {
    return Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
  }

  // --- PRESCRIPTIONS & ADHERENCE ---
  async prescriptionCreate({ data }) {
    const id = this.generateId();
    const doc = {
      id,
      patientId: data.patientId,
      prescribedBy: data.prescribedBy || 'Dr. Clinical AI',
      diagnosis: data.diagnosis || 'Maintenance Care',
      startDate: data.startDate || new Date(),
      endDate: data.endDate || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      medicines: data.medicines || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.prescriptions.push(doc);
    return doc;
  }

  async prescriptionFindMany({ where }) {
    let list = this.prescriptions;
    if (where?.patientId) list = list.filter((p) => p.patientId === where.patientId);
    if (where?.isActive !== undefined) list = list.filter((p) => p.isActive === where.isActive);
    return list;
  }

  async adherenceLogCreate({ data }) {
    const id = this.generateId();
    const doc = {
      id,
      patientId: data.patientId,
      medicineName: data.medicineName,
      scheduledTime: data.scheduledTime || new Date(),
      takenTime: data.takenTime || null,
      status: data.status || 'TAKEN', // TAKEN, MISSED, SKIPPED
      streakCount: data.streakCount || 1,
      createdAt: new Date(),
    };
    this.adherenceLogs.push(doc);
    return doc;
  }

  async adherenceLogFindMany({ where, orderBy }) {
    let list = this.adherenceLogs;
    if (where?.patientId) list = list.filter((l) => l.patientId === where.patientId);
    if (where?.medicineName) list = list.filter((l) => l.medicineName.toLowerCase() === where.medicineName.toLowerCase());
    return list;
  }

  // --- SYMPTOM OBSERVATIONS & REPLAY ---
  async symptomLogCreate({ data }) {
    const id = this.generateId();
    const doc = {
      id,
      patientId: data.patientId,
      symptom: data.symptom,
      severity: data.severity || 'moderate',
      timestamp: data.timestamp || new Date(),
      notes: data.notes || '',
      createdAt: new Date(),
    };
    this.symptomLogs.push(doc);
    return doc;
  }

  async symptomLogFindMany({ where }) {
    let list = this.symptomLogs;
    if (where?.patientId) list = list.filter((s) => s.patientId === where.patientId);
    return list;
  }

  // --- APPOINTMENTS & TELECONSULTATION ---
  async appointmentCreate({ data }) {
    const id = this.generateId();
    const doc = {
      id,
      patientId: data.patientId,
      doctorId: data.doctorId || 'doc-default',
      doctorName: data.doctorName || 'Dr. Ananya Sharma, MD',
      specialty: data.specialty || 'Internal Medicine',
      scheduledAt: data.scheduledAt || new Date(),
      status: data.status || 'SCHEDULED', // SCHEDULED, IN_PROGRESS, COMPLETED
      clinicalSummary: data.clinicalSummary || '',
      meetingRoomId: data.meetingRoomId || `room-${id.substring(0, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.appointments.push(doc);
    return doc;
  }

  async appointmentFindMany({ where }) {
    let list = this.appointments;
    if (where?.patientId) list = list.filter((a) => a.patientId === where.patientId);
    if (where?.doctorId) list = list.filter((a) => a.doctorId === where.doctorId);
    return list;
  }

  // --- LAB REPORTS ---
  async labReportCreate({ data }) {
    const id = this.generateId();
    const reportDoc = {
      id,
      patientId: data.patientId || null,
      reportTitle: data.reportTitle || 'Diagnostic Lab Report',
      reportDate: data.reportDate || new Date(),
      reportType: data.reportType || 'GENERAL',
      fileUrl: data.fileUrl || '',
      cloudinaryId: data.cloudinaryId || '',
      status: data.status || 'ANALYZED',
      biomarkers: data.biomarkers || [],
      aiSummary: data.aiSummary || '',
      abnormalCount: data.abnormalCount || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.labReports.push(reportDoc);
    return reportDoc;
  }

  async labReportFindMany({ where, orderBy, take }) {
    let list = this.labReports;
    if (where?.patientId) {
      list = list.filter((r) => r.patientId === where.patientId);
    }
    return list.slice(0, take || 50);
  }

  // --- USER ---
  async userCreate({ data, include }) {
    const id = this.generateId();
    const user = {
      id,
      email: data.email,
      passwordHash: data.passwordHash,
      phone: data.phone || null,
      role: data.role || 'PATIENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);

    let patientProfile = null;
    let doctorProfile = null;

    if (data.patientProfile?.create) {
      const pId = this.generateId();
      patientProfile = {
        id: pId,
        userId: id,
        ...data.patientProfile.create,
        allergies: data.patientProfile.create.allergies || [],
        chronicConditions: data.patientProfile.create.chronicConditions || [],
        emergencyContacts: data.patientProfile.create.emergencyContacts || [],
        familyHistory: data.patientProfile.create.familyHistory || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.patientProfiles.set(id, patientProfile);
    }

    if (data.doctorProfile?.create) {
      const dId = this.generateId();
      doctorProfile = {
        id: dId,
        userId: id,
        ...data.doctorProfile.create,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.doctorProfiles.set(id, doctorProfile);
    }

    return {
      ...user,
      ...(include?.patientProfile && { patientProfile }),
      ...(include?.doctorProfile && { doctorProfile }),
    };
  }

  async userFindUnique({ where, include }) {
    let matched = null;
    if (where.id) {
      matched = this.users.get(where.id);
    } else if (where.email) {
      for (const u of this.users.values()) {
        if (u.email.toLowerCase() === where.email.toLowerCase()) {
          matched = u;
          break;
        }
      }
    }

    if (!matched) return null;

    return {
      ...matched,
      ...(include?.patientProfile && { patientProfile: this.patientProfiles.get(matched.id) || null }),
      ...(include?.doctorProfile && { doctorProfile: this.doctorProfiles.get(matched.id) || null }),
    };
  }

  // --- PATIENT PROFILE ---
  async patientProfileFindUnique({ where }) {
    if (where.userId) {
      return this.patientProfiles.get(where.userId) || null;
    }
    return null;
  }

  async patientProfileUpsert({ where, update, create }) {
    const existing = this.patientProfiles.get(where.userId);
    if (existing) {
      const updated = {
        ...existing,
        ...update,
        updatedAt: new Date(),
      };
      this.patientProfiles.set(where.userId, updated);
      return updated;
    } else {
      const pId = this.generateId();
      const newProf = {
        id: pId,
        userId: where.userId,
        ...create,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.patientProfiles.set(where.userId, newProf);
      return newProf;
    }
  }

  // --- REFRESH TOKEN ---
  async refreshTokenCreate({ data }) {
    const id = this.generateId();
    const tokenDoc = { id, ...data };
    this.refreshTokens.set(data.token, tokenDoc);
    return tokenDoc;
  }

  async refreshTokenFindUnique({ where }) {
    return this.refreshTokens.get(where.token) || null;
  }
}

const memStore = new InMemoryStore();

// Check if real MongoDB is reachable
let usePrisma = false;
const testPrismaConnection = async () => {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl || dbUrl.includes('<username>') || dbUrl.includes('<password>')) {
    console.log('[Database] DATABASE_URL is unconfigured template. Using in-memory store for development/testing.');
    usePrisma = false;
    return;
  }

  try {
    // Attempt short connection test
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 2500)),
    ]);
    usePrisma = true;
    console.log('[Database] Connected successfully to MongoDB via Prisma.');
  } catch (err) {
    console.warn('[Database] MongoDB connection failed or timed out. Falling back to local in-memory store.');
    usePrisma = false;
  }
};

testPrismaConnection();

export const db = {
  user: {
    create: async (args) => (usePrisma ? prisma.user.create(args) : memStore.userCreate(args)),
    findUnique: async (args) => (usePrisma ? prisma.user.findUnique(args) : memStore.userFindUnique(args)),
  },
  patientProfile: {
    findUnique: async (args) => (usePrisma ? prisma.patientProfile.findUnique(args) : memStore.patientProfileFindUnique(args)),
    upsert: async (args) => (usePrisma ? prisma.patientProfile.upsert(args) : memStore.patientProfileUpsert(args)),
  },
  doctorProfile: {
    findUnique: async (args) => (usePrisma ? prisma.doctorProfile.findUnique(args) : null),
  },
  refreshToken: {
    create: async (args) => (usePrisma ? prisma.refreshToken.create(args) : memStore.refreshTokenCreate(args)),
    findUnique: async (args) => (usePrisma ? prisma.refreshToken.findUnique(args) : memStore.refreshTokenFindUnique(args)),
  },
  labReport: {
    create: async (args) => (usePrisma ? prisma.labReport.create(args) : memStore.labReportCreate(args)),
    findMany: async (args) => (usePrisma ? prisma.labReport.findMany(args) : memStore.labReportFindMany(args)),
  },
  prescription: {
    create: async (args) => (usePrisma ? prisma.prescription.create(args) : memStore.prescriptionCreate(args)),
    findMany: async (args) => (usePrisma ? prisma.prescription.findMany(args) : memStore.prescriptionFindMany(args)),
  },
  adherenceLog: {
    create: async (args) => (usePrisma ? prisma.medicationAdherenceLog.create(args) : memStore.adherenceLogCreate(args)),
    findMany: async (args) => (usePrisma ? prisma.medicationAdherenceLog.findMany(args) : memStore.adherenceLogFindMany(args)),
  },
  symptomLog: {
    create: async (args) => (usePrisma ? prisma.symptomChatSession.create(args) : memStore.symptomLogCreate(args)),
    findMany: async (args) => (usePrisma ? prisma.symptomChatSession.findMany(args) : memStore.symptomLogFindMany(args)),
  },
  appointment: {
    create: async (args) => (usePrisma ? prisma.appointment.create(args) : memStore.appointmentCreate(args)),
    findMany: async (args) => (usePrisma ? prisma.appointment.findMany(args) : memStore.appointmentFindMany(args)),
  },
};
