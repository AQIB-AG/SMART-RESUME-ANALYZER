import express from 'express';
import {
  analyzeResume,
  matchResumeToJobs,
  skillGapAnalysis,
  getAnalysisSummary
} from '../controllers/analysis.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/analyze/:id', analyzeResume);
router.get('/match/:id', matchResumeToJobs);
router.get('/skill-gap/:id/:jobId', skillGapAnalysis);
router.get('/summary/:id', getAnalysisSummary);

export default router;

