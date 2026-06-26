import express from 'express';
import { upload } from '../controllers/resume.controller.js';
import { analyzeResumeSimple } from '../controllers/simple-analysis.controller.js';
import { validateFileSignature } from '../middleware/file-validation.middleware.js';

const router = express.Router();

// Simple route for resume analysis (for Postman testing without auth)
router.post('/analyzeResume', upload.single('resume'), validateFileSignature, analyzeResumeSimple);

export default router;