import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

// Import database connection
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import jobRoutes from './routes/job.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import atsRoutes from './routes/ats.routes.js';
import directAnalysisRoutes from './routes/direct-analysis.routes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim());

// Apply Helmet for security headers (ensuring CORP is cross-origin so frontend can load resources)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Apply express-mongo-sanitize to prevent NoSQL injection
app.use(mongoSanitize());

// Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again after 15 minutes'
  }
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many resume uploads from this IP, please try again after 15 minutes'
  }
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many AI generation requests, please try again after 15 minutes'
  }
});

// Apply global limiter to all API routes
app.use('/api', globalLimiter);

// Apply auth limiter to login and register
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Specific rate limiters for uploads and AI endpoints
app.use('/api/ats/analyzeResume', uploadLimiter);
app.use('/api/analyzeResume', uploadLimiter);
app.use('/api/resumes', (req, res, next) => {
  if (req.method === 'POST') {
    if (req.path.includes('cover-letter') || req.path.includes('interview-questions')) {
      return aiLimiter(req, res, next);
    }
    if (req.path === '/' || req.path === '') {
      return uploadLimiter(req, res, next);
    }
  }
  next();
});

// Disable caching globally for API endpoints to prevent stale data
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Create uploads directory
import fs from 'fs';
const uploadsDir = path.join(__dirname, '..', process.env.UPLOAD_FOLDER || 'uploads', 'resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_FOLDER || 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api', directAnalysisRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Connect to MongoDB only if MONGO_URI is provided
if (process.env.MONGO_URI) {
  connectDB().then((connected) => {
    if (!connected) {
      console.warn('⚠️ MongoDB connection failed during startup. The server will continue running and may recover automatically.');
    }
  }).catch((dbError) => {
    console.error('❌ Unexpected MongoDB startup error:', dbError);
  });
} else {
  console.log('⚠️ MongoDB not connected (running in mock mode)');
}

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

