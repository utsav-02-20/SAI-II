import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import emergencyRoutes from './routes/emergency.routes.js';
import medicineRoutes from './routes/medicine.routes.js';
import reportRoutes from './routes/report.routes.js';
import triageRoutes from './routes/triage.routes.js';
import knowledgeRoutes from './routes/knowledge.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ArogyaAI Clinical Healthcare API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      patient: '/api/patient',
      emergency: '/api/emergency',
      medicines: '/api/medicines',
      reports: '/api/reports',
      triage: '/api/triage',
      knowledge: '/api/knowledge',
    },
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;
