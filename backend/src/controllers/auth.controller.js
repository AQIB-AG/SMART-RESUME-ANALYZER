import User from '../models/User.model.js';
import { generateToken } from '../utils/jwt.utils.js';

/**
 * Register a new user
 * Accepts: { email, password }
 */
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create new user (password will be hashed by pre-save hook)
    const newUser = await User.create({
      email: email.toLowerCase(),
      password, // Will be hashed automatically
      role: 'candidate' // Default role
    });

    // Generate JWT token
    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      role: newUser.role
    });

    console.log('✅ User registered successfully:', newUser.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors[0] || 'Validation error'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
};

/**
 * Login user
 * Accepts: { email, password }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    console.log('✅ User logged in successfully:', user.email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

/**
 * Get user profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userIndex = mockUsers.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { first_name, last_name, email } = req.body;
    const user = mockUsers[userIndex];

    // Update fields
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (email) {
      // Check if email is already taken
      const emailExists = mockUsers.find(u => u.email === email && u.id !== userId);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: 'Email already in use'
        });
      }
      user.email = email;
    }

    const { passwordHash: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

/**
 * Logout user (client-side token removal, but we can blacklist tokens here)
 */
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

