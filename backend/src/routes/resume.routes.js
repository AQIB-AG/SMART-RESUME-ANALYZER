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
import { authenticate } from '../middleware/auth.middleware.js';
import { validateFileSignature } from '../middleware/file-validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', upload.single('resume'), validateFileSignature, uploadResume);
router.get('/', getResumes);

// Standalone AI Generator Routes (registered before /:id wildcard)
router.post('/standalone/cover-letter', handleGenerateCoverLetterStandalone);
router.post('/standalone/interview-questions', handleGenerateInterviewQuestionsStandalone);

router.get('/:id', getResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);

// AI Generator Routes
router.post('/:id/cover-letter', handleGenerateCoverLetter);
router.post('/:id/interview-questions', handleGenerateInterviewQuestions);

export default router;


