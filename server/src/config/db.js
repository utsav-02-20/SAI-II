import { prisma } from './prisma.js';

// In-Memory Fallback Store (Used when MongoDB Atlas credentials are not yet configured)
class InMemoryStore {
  constructor() {
    this.users = new Map();
    this.patientProfiles = new Map();
    this.doctorProfiles = new Map();
    this.refreshTokens = new Map();
    this.isFallback = false;
  }

  generateId() {
    return Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
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
};
