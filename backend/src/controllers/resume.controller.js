import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Resume from '../models/Resume.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_FOLDER || 'uploads', 'resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  }
});

/**
 * Upload resume
 */
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No resume file provided'
      });
    }

    const resume = new Resume({
      name: req.user.first_name + ' ' + req.user.last_name,
      email: req.user.email,
      filePath: req.file.path,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      userId: req.user.id,
      status: 'uploaded'
    });

    const savedResume = await resume.save();

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resume_id: savedResume._id,
        filename: savedResume.fileName,
        status: savedResume.status
      }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload resume'
    });
  }
};

/**
 * Get all resumes
 */
export const getResumes = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = {};
    if (userRole !== 'admin') {
      query.userId = userId;
    } else {
      // Admin can filter by user_id
      if (req.query.user_id) {
        query.userId = req.query.user_id;
      }
    }

    const resumes = await Resume.find(query).populate('userId', 'email first_name last_name');

    const resumeList = resumes.map(resume => ({
      id: resume._id,
      filename: resume.fileName,
      original_filename: resume.originalFileName,
      file_size: resume.fileSize,
      upload_date: resume.createdAt,
      status: resume.status,
      ats_score: resume.atsScore,
      score_source: resume.aiUsed ? 'ai' : 'keyword',
      ai_used: !!resume.aiUsed,
      feedback: resume.feedback,
      ai_explanation: resume.aiExplanation,
      best_fit_role: resume.bestFitRole,
      job_match_percentage: resume.jobMatchPercentage,
      user_id: resume.userId._id
    }));

    res.json({
      success: true,
      data: {
        resumes: resumeList
      }
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resumes'
    });
  }
};

/**
 * Get single resume
 */
export const getResume = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const resume = await Resume.findById(resumeId).populate('userId', 'email first_name last_name');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Check permissions
    const userId = req.user.id;
    const userRole = req.user.role;
    if (userRole !== 'admin' && resume.userId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        resume
      }
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resume'
    });
  }
};

/**
 * Update resume
 */
export const updateResume = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'admin' && resume.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Update allowed fields
    const { status, atsScore, resumeText, skills, feedback } = req.body;
    
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (atsScore !== undefined) updateData.atsScore = atsScore;
    if (resumeText !== undefined) updateData.resumeText = resumeText;
    if (skills !== undefined) updateData.skills = skills;
    if (feedback !== undefined) updateData.feedback = feedback;

    const updatedResume = await Resume.findByIdAndUpdate(resumeId, updateData, { new: true });

    res.json({
      success: true,
      message: 'Resume updated successfully',
      data: {
        resume_id: updatedResume._id
      }
    });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update resume'
    });
  }
};

/**
 * Delete resume
 */
export const deleteResume = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'admin' && resume.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(resume.filePath)) {
      await fs.promises.unlink(resume.filePath);
    }

    await Resume.findByIdAndDelete(resumeId);

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete resume'
    });
  }
};

