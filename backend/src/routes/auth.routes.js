import express from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate, registerValidation, loginValidation } from '../utils/validation.utils.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;

