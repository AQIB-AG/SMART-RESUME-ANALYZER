import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock resume data (replace with MongoDB later)
const mockResumes = [];

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

    const resume = {
      id: mockResumes.length + 1,
      user_id: req.user.id,
      filename: req.file.filename,
      file_path: req.file.path,
      original_filename: req.file.originalname,
      file_size: req.file.size,
      upload_date: new Date().toISOString(),
      status: 'uploaded',
      ats_score: null,
      extracted_skills: null,
      extracted_education: null,
      extracted_experience: null,
      extracted_contact: null,
      raw_text: null,
      keyword_density: null,
      sections_analysis: null
    };

    mockResumes.push(resume);

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resume_id: resume.id,
        filename: resume.filename,
        status: resume.status
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

    let resumes;
    if (userRole === 'admin') {
      const filterUserId = req.query.user_id;
      resumes = filterUserId 
        ? mockResumes.filter(r => r.user_id === parseInt(filterUserId))
        : mockResumes;
    } else {
      resumes = mockResumes.filter(r => r.user_id === userId);
    }

    const resumeList = resumes.map(resume => ({
      id: resume.id,
      filename: resume.filename,
      original_filename: resume.original_filename,
      file_size: resume.file_size,
      upload_date: resume.upload_date,
      status: resume.status,
      ats_score: resume.ats_score,
      user_id: resume.user_id
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
    const resumeId = parseInt(req.params.id);
    const resume = mockResumes.find(r => r.id === resumeId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Check permissions
    const userId = req.user.id;
    const userRole = req.user.role;
    if (userRole !== 'admin' && resume.user_id !== userId) {
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
    const resumeId = parseInt(req.params.id);
    const resumeIndex = mockResumes.findIndex(r => r.id === resumeId);

    if (resumeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    const resume = mockResumes[resumeIndex];
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'admin' && resume.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Update allowed fields
    const { status, ats_score, raw_text, extracted_skills, keyword_density } = req.body;
    if (status) mockResumes[resumeIndex].status = status;
    if (ats_score !== undefined) mockResumes[resumeIndex].ats_score = ats_score;
    if (raw_text) mockResumes[resumeIndex].raw_text = raw_text;
    if (extracted_skills) mockResumes[resumeIndex].extracted_skills = extracted_skills;
    if (keyword_density) mockResumes[resumeIndex].keyword_density = keyword_density;

    res.json({
      success: true,
      message: 'Resume updated successfully',
      data: {
        resume_id: resumeId
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
    const resumeId = parseInt(req.params.id);
    const resumeIndex = mockResumes.findIndex(r => r.id === resumeId);

    if (resumeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    const resume = mockResumes[resumeIndex];
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'admin' && resume.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(resume.file_path)) {
      fs.unlinkSync(resume.file_path);
    }

    mockResumes.splice(resumeIndex, 1);

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

