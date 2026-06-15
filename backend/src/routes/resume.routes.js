import express from 'express';
import {
  uploadResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
  upload
} from '../controllers/resume.controller.js';
import {
  handleGenerateCoverLetter,
  handleGenerateInterviewQuestions
} from '../controllers/ai-generator.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);

// AI Generator Routes
router.post('/:id/cover-letter', handleGenerateCoverLetter);
router.post('/:id/interview-questions', handleGenerateInterviewQuestions);

export default router;


