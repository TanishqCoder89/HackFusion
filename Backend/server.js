import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { initializeDatabase } from './config/db.js';
import { seedDatabase } from './config/seed.js';
import { migrateProblems } from './config/migrateProblems.js';
import { apiLimiter } from './middleware/security.js';

import authRoutes from './routes/authRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import proctoringRoutes from './routes/proctoringRoutes.js';
import avatarRoutes from './avatar/avatarRoutes.js';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

// Fail fast on an unsafe production configuration instead of silently running with a public default secret
if (isProd) {
  const problems = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || /hackfusion_super_secure/i.test(process.env.JWT_SECRET)) {
    problems.push('JWT_SECRET must be set to a unique random string of at least 32 characters.');
  }
  if (!process.env.DB_URL && !process.env.DB_HOST) problems.push('Set DB_URL (or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME).');
  if (!process.env.CLIENT_URL) problems.push('CLIENT_URL must be set to your public site URL (e.g. https://app.example.com).');
  if (problems.length) {
    console.error('\n[Config] Refusing to start in production:\n - ' + problems.join('\n - ') + '\n');
    process.exit(1);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Behind a reverse proxy (nginx, Render, Railway...) this makes rate limiting and req.ip use the real client address
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : process.env.TRUST_PROXY);
const PORT = process.env.PORT || 5000;

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Allow inline scripts/styles for development
  })
);

// CORS: in production only CLIENT_URL (comma-separated list allowed) may call the API from a browser.
// When the frontend is served by this same server (the default deployment) requests are same-origin and CORS isn't involved.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl, mobile apps, same-origin navigations
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (!isProd && /^http:\/\/(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+):\d+$/.test(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Request body parsers
// 50mb: the AI interview room posts camera frames / violation screenshots as base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
app.use(morgan('dev'));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// General API rate limiter
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/proctoring', proctoringRoutes);
// AI avatar interviewer: /api/start-interview, /submit-answer, /end-interview, /tts, /stt, /detect-mobile, /webrtc/*
app.use('/api', avatarRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'NexaHire Backend',
    database: 'MySQL 8.0'
  });
});

// Serve the built frontend (Frontend/dist) from this server so the whole app is one deployable service on one origin.
// That keeps the AI interview room's login token, camera permissions and phone pairing working without extra CORS setup.
const frontendDist = process.env.FRONTEND_DIST || path.join(__dirname, '..', 'Frontend', 'dist');
const hasFrontend = fs.existsSync(path.join(frontendDist, 'index.html'));
if (hasFrontend) {
  app.use(express.static(frontendDist, { index: false, maxAge: isProd ? '1h' : 0 }));
}

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.originalUrl} not found.`
  });
});

// SPA fallback: any non-API GET returns the React app (client-side routing)
if (hasFrontend) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred.'
  });
});

// Start server and initialize database
const startServer = async () => {
  try {
    console.log('[Server] Connecting to MySQL and synchronizing schema...');
    await initializeDatabase();
    // Demo accounts (known passwords) are only created outside production, or when explicitly requested
    if (!isProd || process.env.SEED_DEMO_DATA === 'true') await seedDatabase();
    await migrateProblems();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n======================================================`);
      console.log(`🚀 NexaHire Backend running on http://localhost:${PORT}`);
      console.log(`🔒 Login security enabled with bcrypt, JWT, and rate limiting`);
      console.log(`🗄️  Connected to MySQL Database: ${process.env.DB_NAME || 'ai_interview_db'}`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('[Server Startup Failure]:', err.message);
    process.exit(1);
  }
};

startServer();
