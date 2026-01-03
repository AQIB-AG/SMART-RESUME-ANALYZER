import express from 'express';
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getMyJobs
} from '../controllers/job.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', authorize('recruiter', 'admin'), createJob);
router.get('/', getJobs);
router.get('/my-jobs', authorize('recruiter', 'admin'), getMyJobs);
router.get('/:id', getJob);
router.put('/:id', authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', authorize('recruiter', 'admin'), deleteJob);

export default router;

