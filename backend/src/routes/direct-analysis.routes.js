import express from 'express';
import { analyzeResumeForATS } from '../controllers/ats.controller.js';
import { authenticateOptional } from '../middleware/auth.middleware.js';
import { upload } from '../controllers/resume.controller.js';
import { validateFileSignature } from '../middleware/file-validation.middleware.js';

const router = express.Router();

// Direct route for resume analysis (for Postman testing)
router.post('/analyzeResume', authenticateOptional, upload.single('resume'), validateFileSignature, analyzeResumeForATS);

export default router;