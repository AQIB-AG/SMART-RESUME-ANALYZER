import Resume from '../models/Resume.model.js';
import { extractTextFromPdf, performAtsAnalysis } from '../services/ats.service.js';
import path from 'path';

/**
 * Analyze resume for ATS compatibility
 */
export const analyzeResumeForATS = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No resume file provided'
      });
    }

    const userId = req.user.id;
    const filePath = req.file.path;
    const fileName = req.file.filename;
    const originalFileName = req.file.originalname;
    const fileSize = req.file.size;

    // Validate file type
    const fileExtension = path.extname(originalFileName).toLowerCase();
    if (fileExtension !== '.pdf') {
      return res.status(400).json({
        success: false,
        error: 'Only PDF files are allowed for ATS analysis'
      });
    }

    // Extract text from PDF
    let resumeText;
    try {
      resumeText = await extractTextFromPdf(filePath);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Failed to extract text from PDF: ${error.message}`
      });
    }

    // Perform ATS analysis
    const analysisResult = await performAtsAnalysis(resumeText);

    // Create resume record in database
    const resume = new Resume({
      name: req.user.first_name + ' ' + req.user.last_name,
      email: req.user.email,
      skills: analysisResult.details.matchedTechnical.concat(analysisResult.details.matchedSoft),
      resumeText,
      atsScore: analysisResult.atsScore,
      feedback: analysisResult.feedback,
      filePath,
      fileName,
      originalFileName,
      fileSize,
      userId
    });

    // Save resume to database
    const savedResume = await resume.save();

    // Update resume status to completed
    await Resume.findByIdAndUpdate(savedResume._id, { status: 'completed' });

    res.status(200).json({
      success: true,
      score: analysisResult.atsScore,
      feedback: analysisResult.feedback
    });

  } catch (error) {
    console.error('ATS analysis error:', error);
    
    // Clean up uploaded file if analysis fails
    if (req.file && req.file.path) {
      try {
        import('fs').then(fs => {
          fs.promises.unlink(req.file.path).catch(console.error);
        });
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze resume for ATS compatibility'
    });
  }
};