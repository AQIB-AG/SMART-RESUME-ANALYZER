import express from 'express';
import { getUserInfo } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/info', getUserInfo);

export default router;

