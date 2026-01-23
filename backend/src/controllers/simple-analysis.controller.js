import path from 'path';

/**
 * Simple resume analysis for testing (without authentication)
 */
export const analyzeResumeSimple = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No resume file uploaded. Please provide a file with key "resume".'
      });
    }

    // Validate file type
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (fileExtension !== '.pdf') {
      return res.status(400).json({
        success: false,
        error: 'Only PDF files are supported for analysis.'
      });
    }

    // Basic ATS analysis placeholder logic
    // In a real implementation, this would parse the PDF and perform actual analysis
    const analysisResult = performBasicAnalysis();

    // Return the expected response format
    res.status(200).json({
      success: true,
      score: analysisResult.score,
      feedback: analysisResult.feedback
    });

  } catch (error) {
    console.error('Simple analysis error:', error);
    
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
      error: 'Failed to analyze resume. Please try again.'
    });
  }
};

/**
 * Basic analysis placeholder function
 */
const performBasicAnalysis = () => {
  // Generate a realistic score between 60-95 for testing
  const score = Math.floor(Math.random() * 36) + 60; // Random score between 60-95
  
  // Generate sample feedback based on the score
  let feedback;
  if (score >= 85) {
    feedback = "Excellent resume! Your resume has strong ATS compatibility with good keyword usage, proper formatting, and relevant skills matching industry standards.";
  } else if (score >= 70) {
    feedback = "Good resume with solid ATS compatibility. Consider adding more industry-specific keywords and quantifying your achievements with specific metrics.";
  } else if (score >= 55) {
    feedback = "Average resume. Improve formatting consistency, add more relevant keywords from job descriptions, and include quantified achievements.";
  } else {
    feedback = "Low ATS compatibility. Focus on improving formatting, adding relevant technical skills, and restructuring sections for better readability.";
  }

  return { score, feedback };
};