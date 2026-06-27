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
  handleGenerateInterviewQuestions,
  handleGenerateCoverLetterStandalone,
  handleGenerateInterviewQuestionsStandalone
} from '../controllers/ai-generator.controller.js';
import { authenticate, authenticateOptional } from '../middleware/auth.middleware.js';
import { validateFileSignature } from '../middleware/file-validation.middleware.js';

const router = express.Router();

// Standalone AI Generator Routes (Available to Guests)
router.post('/standalone/cover-letter', authenticateOptional, handleGenerateCoverLetterStandalone);
router.post('/standalone/interview-questions', authenticateOptional, handleGenerateInterviewQuestionsStandalone);

// All subsequent routes require authentication
router.use(authenticate);

router.post('/', upload.single('resume'), validateFileSignature, uploadResume);
router.get('/', getResumes);

router.get('/:id', getResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);

// AI Generator Routes (Linked to stored resume ID)
router.post('/:id/cover-letter', handleGenerateCoverLetter);
router.post('/:id/interview-questions', handleGenerateInterviewQuestions);

export default router;


