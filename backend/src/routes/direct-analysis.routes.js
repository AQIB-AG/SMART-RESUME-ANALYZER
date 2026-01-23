import express from 'express';
import { analyzeResumeForATS } from '../controllers/ats.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../controllers/resume.controller.js';

const router = express.Router();

// Direct route for resume analysis (for Postman testing)
router.post('/analyzeResume', authenticate, upload.single('resume'), analyzeResumeForATS);

export default router;