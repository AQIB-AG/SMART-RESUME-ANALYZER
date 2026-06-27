import User from '../models/User.model.js';
import Resume from '../models/Resume.model.js';
import { generateToken } from '../utils/jwt.utils.js';
import fs from 'fs';

/**
 * Register a new user
 * Accepts: { email, password }
 */
export const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

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

    // Generate JWT token first (before creating user to avoid orphaned records)
    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error. Please contact support.'
      });
    }

    // Create new user (password will be hashed by pre-save hook)
    const newUser = await User.create({
      email: email.toLowerCase(),
      password, // Will be hashed automatically
      first_name: first_name || '',
      last_name: last_name || '',
      role: 'candidate' // Default role
    });

    // Generate JWT token after user creation
    let token;
    try {
      token = generateToken({
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      });
    } catch (tokenError) {
      // If token generation fails, delete the user to avoid orphaned records
      await User.findByIdAndDelete(newUser._id);
      console.error('❌ Token generation failed:', tokenError);
      return res.status(500).json({
        success: false,
        error: 'Registration failed. Please try again.'
      });
    }

    console.log('✅ User registered successfully:', newUser.email);

    // Ensure response is sent with proper status
    return res.status(201).json({
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

    // Track session details
    try {
      const userAgent = req.headers['user-agent'] || 'Unknown Device';
      let deviceName = 'Web Browser';
      if (userAgent.includes('Windows')) deviceName = 'Windows PC';
      else if (userAgent.includes('Macintosh')) deviceName = 'Mac';
      else if (userAgent.includes('iPhone')) deviceName = 'iPhone';
      else if (userAgent.includes('iPad')) deviceName = 'iPad';
      else if (userAgent.includes('Android')) deviceName = 'Android Device';
      else if (userAgent.includes('Linux')) deviceName = 'Linux PC';
      
      user.lastLogin = new Date();
      user.loginDevice = deviceName;
      await user.save();
    } catch (sessionError) {
      console.error('Failed to log session details:', sessionError);
    }

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
          createdAt: user.createdAt,
          // Profile Fields
          profilePicture: user.profilePicture || '',
          phone: user.phone || '',
          college: user.college || '',
          aboutMe: user.aboutMe || '',
          linkedin: user.linkedin || '',
          github: user.github || '',
          portfolio: user.portfolio || '',
          location: user.location || '',
          resumeHeadline: user.resumeHeadline || '',
          careerGoal: user.careerGoal || '',
          // Settings Preferences
          resumeAnalysisNotifications: user.resumeAnalysisNotifications ?? true,
          coverLetterNotifications: user.coverLetterNotifications ?? true,
          mockInterviewNotifications: user.mockInterviewNotifications ?? true,
          browserNotifications: user.browserNotifications ?? true,
          emailNotifications: user.emailNotifications ?? true,
          profileVisibility: user.profileVisibility || 'public',
          activities: user.activities || [],
          coverLettersCount: user.coverLettersCount || 0,
          mockInterviewsCount: user.mockInterviewsCount || 0,
          lastLogin: user.lastLogin || null,
          loginDevice: user.loginDevice || 'Web Browser'
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
    const {
      first_name,
      last_name,
      email,
      profilePicture,
      phone,
      college,
      aboutMe,
      linkedin,
      github,
      portfolio,
      location,
      resumeHeadline,
      careerGoal,
      resumeAnalysisNotifications,
      coverLetterNotifications,
      mockInterviewNotifications,
      browserNotifications,
      emailNotifications,
      profileVisibility
    } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Validation - No blank names
    if (first_name !== undefined && first_name.trim() === '') {
      return res.status(400).json({ success: false, error: 'First name cannot be empty' });
    }
    if (last_name !== undefined && last_name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Last name cannot be empty' });
    }

    // Validation - College length
    if (college !== undefined && college.trim() !== '' && college.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'College name must be at least 2 characters long' });
    }

    // Validation - Email
    if (email && email.toLowerCase() !== user.email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
      }
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already in use'
        });
      }
      user.email = email.toLowerCase();
    }

    // Validation - Phone
    if (phone !== undefined && phone.trim() !== '') {
      const phoneRegex = /^[\d +()-]{7,20}$/;
      if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({ success: false, error: 'Invalid phone number format' });
      }
    }

    // Validation - URLs
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    const validateUrl = (url, fieldName) => {
      if (url && url.trim() !== '' && !urlRegex.test(url.trim())) {
        throw new Error(`Invalid ${fieldName} URL format`);
      }
    };

    try {
      if (linkedin !== undefined) validateUrl(linkedin, 'LinkedIn');
      if (github !== undefined) validateUrl(github, 'GitHub');
      if (portfolio !== undefined) validateUrl(portfolio, 'Portfolio');
    } catch (e) {
      return res.status(400).json({ success: false, error: e.message });
    }

    // Update fields dynamically
    const fields = [
      'first_name', 'last_name', 'profilePicture', 'phone', 'college', 'aboutMe',
      'linkedin', 'github', 'portfolio', 'location', 'resumeHeadline', 'careerGoal',
      'resumeAnalysisNotifications', 'coverLetterNotifications', 'mockInterviewNotifications',
      'browserNotifications', 'emailNotifications', 'profileVisibility'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Save updated user
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          createdAt: user.createdAt,
          profilePicture: user.profilePicture || '',
          phone: user.phone || '',
          college: user.college || '',
          aboutMe: user.aboutMe || '',
          linkedin: user.linkedin || '',
          github: user.github || '',
          portfolio: user.portfolio || '',
          location: user.location || '',
          resumeHeadline: user.resumeHeadline || '',
          careerGoal: user.careerGoal || '',
          resumeAnalysisNotifications: user.resumeAnalysisNotifications ?? true,
          coverLetterNotifications: user.coverLetterNotifications ?? true,
          mockInterviewNotifications: user.mockInterviewNotifications ?? true,
          browserNotifications: user.browserNotifications ?? true,
          emailNotifications: user.emailNotifications ?? true,
          profileVisibility: user.profileVisibility || 'public'
        }
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
 * Change user password
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
    }

    // Password strength check (at least one letter and one number)
    const strengthRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!strengthRegex.test(newPassword)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long and contain both letters and numbers.' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect current password' });
    }

    user.password = newPassword; // Will be hashed automatically by pre-save hook
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
};

/**
 * Delete user account and associated resumes
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find and delete user
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Delete user's resumes and files
    const resumes = await Resume.find({ userId });
    for (const resume of resumes) {
      if (resume.filePath) {
        try {
          fs.unlinkSync(resume.filePath);
        } catch (err) {
          console.error(`Failed to delete file: ${resume.filePath}`, err);
        }
      }
    }
    await Resume.deleteMany({ userId });

    res.json({ success: true, message: 'Account and associated data deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Save generated cover letter
 */
export const saveCoverLetter = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, companyName, roleTitle, content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required to save cover letter' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.savedCoverLetters.push({ title, companyName, roleTitle, content });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Cover letter saved successfully',
      data: user.savedCoverLetters[user.savedCoverLetters.length - 1]
    });
  } catch (error) {
    console.error('Save cover letter error:', error);
    res.status(500).json({ success: false, error: 'Failed to save cover letter' });
  }
};

/**
 * Get all saved cover letters
 */
export const getSavedCoverLetters = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user.savedCoverLetters || [] });
  } catch (error) {
    console.error('Get cover letters error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch saved cover letters' });
  }
};

/**
 * Delete a saved cover letter
 */
export const deleteSavedCoverLetter = async (req, res) => {
  try {
    const userId = req.user.id;
    const letterId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.savedCoverLetters = user.savedCoverLetters.filter(
      (letter) => letter._id.toString() !== letterId
    );
    await user.save();

    res.json({ success: true, message: 'Cover letter deleted successfully' });
  } catch (error) {
    console.error('Delete cover letter error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete cover letter' });
  }
};

/**
 * Save generated mock interview
 */
export const saveInterview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role, difficulty, questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, error: 'Questions list is required to save interview' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.savedMockInterviews.push({ role, difficulty, questions });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Mock interview saved successfully',
      data: user.savedMockInterviews[user.savedMockInterviews.length - 1]
    });
  } catch (error) {
    console.error('Save mock interview error:', error);
    res.status(500).json({ success: false, error: 'Failed to save mock interview' });
  }
};

/**
 * Get all saved mock interviews
 */
export const getSavedInterviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user.savedMockInterviews || [] });
  } catch (error) {
    console.error('Get mock interviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch saved interviews' });
  }
};

/**
 * Delete a saved mock interview
 */
export const deleteSavedInterview = async (req, res) => {
  try {
    const userId = req.user.id;
    const interviewId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.savedMockInterviews = user.savedMockInterviews.filter(
      (intv) => intv._id.toString() !== interviewId
    );
    await user.save();

    res.json({ success: true, message: 'Mock interview deleted successfully' });
  } catch (error) {
    console.error('Delete mock interview error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete mock interview' });
  }
};

