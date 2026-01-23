import express from 'express';
import { upload } from '../controllers/resume.controller.js';
import { analyzeResumeSimple } from '../controllers/simple-analysis.controller.js';

const router = express.Router();

// Simple route for resume analysis (for Postman testing without auth)
router.post('/analyzeResume', upload.single('resume'), analyzeResumeSimple);

export default router;