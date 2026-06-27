import Resume from '../models/Resume.model.js';
import User from '../models/User.model.js';
import { extractTextFromPdf, performAtsAnalysis, getSkillSuggestions } from '../services/ats.service.js';
import { analyzeResumeWithAI, generateRecruiterReview, generateFallbackRecruiterReview, validateResumeWithAI } from '../ai/ai.service.js';
import path from 'path';

/**
 * Analyze resume for ATS compatibility (AI + keyword hybrid, optional job description)
 */
export const analyzeResumeForATS = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No resume file provided'
      });
    }

    const userId = req.user ? req.user.id : null;
    const filePath = req.file.path;
    const fileName = req.file.filename;
    const originalFileName = req.file.originalname;
    const fileSize = req.file.size;
    const jobDescription = typeof req.body?.jobDescription === 'string' ? req.body.jobDescription.trim() : '';

    // Validate file type
    const allowedExtensions = ['.pdf', '.docx', '.png', '.jpg', '.jpeg'];
    const fileExtension = path.extname(originalFileName).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported file format. Please upload PDF, DOCX, JPG, JPEG, or PNG.'
      });
    }

    // Extract text from file
    let resumeText;
    let extractionMethod = 'unknown';
    let extractionMetadata = null;
    let pagesProcessed = 0;
    let ocrUsed = false;
    let processingTime = null;

    try {
      const extractFn = global.mockExtractTextFromPdf || extractTextFromPdf;
      const extractionResult = await extractFn(req.file);
      resumeText = extractionResult.text;
      extractionMethod = extractionResult.method || 'unknown';
      extractionMetadata = extractionResult.metadata || null;
      pagesProcessed = extractionResult.pagesProcessed || 0;
      ocrUsed = extractionResult.ocrUsed || false;
      processingTime = extractionResult.processingTime || null;
    } catch (error) {
      console.error('File extraction error:', {
        fileName: originalFileName,
        fileSize,
        message: error.message,
        stack: error.stack
      });

      const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to extract text from file'
      });
    }

    // Validate that the document is a professional resume
    const userName = req.user ? `${req.user.first_name} ${req.user.last_name}` : '';
    const validationResult = await validateResumeWithAI(resumeText, userName);

    if (!validationResult.isResume || validationResult.confidence < 80) {
      console.log('❌ RESUME VALIDATION FAILED:', validationResult);
      
      // Delete the file from the filesystem to avoid clutter
      if (filePath) {
        try {
          const fs = await import('fs');
          await fs.promises.unlink(filePath).catch(console.error);
        } catch (unlinkError) {
          console.error('Failed to delete invalid upload:', unlinkError);
        }
      }

      return res.status(400).json({
        success: false,
        isResume: false,
        confidence: validationResult.confidence,
        reason: validationResult.reason,
        error: "This uploaded file doesn't appear to be a professional resume."
      });
    }

    // Always run keyword-based ATS (fallback baseline)
    const keywordResult = performAtsAnalysis(resumeText, jobDescription);
    const keywordScore = keywordResult.atsScore;
    const keywordFeedback = keywordResult.feedback;
    const skills = keywordResult.skills;

    let finalScore;
    let finalFeedback;
    let aiResult;
    let scoreSource;
    let aiScoreBeforeBlend = null;
    const aiModel = 'all-MiniLM-L6-v2';

    console.log('HF TOKEN PRESENT:', !!process.env.HF_TOKEN);
    console.log('➡️ Calling AI analysis');
    try {
      const aiAnalysis = await analyzeResumeWithAI(
        resumeText,
        jobDescription || null,
        {
          technicalMatches: keywordResult.details.technicalMatches,
          softMatches: keywordResult.details.softMatches,
          formatMatches: keywordResult.details.formatMatches,
          hasExperienceSection: keywordResult.details.hasExperienceSection,
          hasEducationSection: keywordResult.details.hasEducationSection,
          contactMatches: keywordResult.details.contactMatches,
          matchedTechnical: keywordResult.details.matchedTechnical,
          matchedSoft: keywordResult.details.matchedSoft
        }
      );
      const aiUsed = aiAnalysis.aiUsed === true;
      const aiScore = aiAnalysis.atsScore ?? 0;
      console.log('⬅️ AI returned:', { aiUsed, atsScore: aiScore, bestFitRole: aiAnalysis.bestFitRole, jobMatchPercentage: aiAnalysis.jobMatchPercentage });

      if (aiUsed) {
        scoreSource = 'ai';
        finalScore = aiScore;
        finalFeedback = aiAnalysis.aiExplanation ?? keywordFeedback;
        aiScoreBeforeBlend = aiScore;
        aiResult = {
          atsScore: aiScore,
          bestFitRole: aiAnalysis.bestFitRole,
          jobMatchPercentage: aiAnalysis.jobMatchPercentage,
          skillGaps: aiAnalysis.skillGaps || [],
          strengthAreas: aiAnalysis.strengthAreas || [],
          aiExplanation: aiAnalysis.aiExplanation,
          aiUsed: true,
          jobDescriptionUsed: jobDescription || undefined
        };
      } else {
        scoreSource = 'keyword';
        finalScore = keywordScore;
        finalFeedback = keywordFeedback;
        aiResult = {
          atsScore: keywordScore,
          bestFitRole: null,
          jobMatchPercentage: null,
          skillGaps: [],
          strengthAreas: [],
          aiExplanation: keywordFeedback,
          aiUsed: false,
          jobDescriptionUsed: jobDescription || undefined
        };
      }
    } catch (aiErr) {
      console.error('❌ AI FAILED – FALLING BACK TO KEYWORD ATS', aiErr.message);
      scoreSource = 'keyword';
      finalScore = keywordScore;
      finalFeedback = keywordFeedback;
      aiResult = {
        atsScore: keywordScore,
        bestFitRole: null,
        jobMatchPercentage: null,
        skillGaps: [],
        strengthAreas: [],
        aiExplanation: keywordFeedback,
        aiUsed: false,
        jobDescriptionUsed: jobDescription || undefined
      };
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('FINAL SCORE SOURCE:', scoreSource, 'SCORE:', finalScore, '| keywordScore:', keywordScore);
    }

    // Ensure skillGaps is never empty
    if (!aiResult.skillGaps || aiResult.skillGaps.length < 5) {
      aiResult.skillGaps = getSkillSuggestions(skills, resumeText);
    }

    // Generate the AI Recruiter Review automatically
    let recruiterReview;
    try {
      recruiterReview = await generateRecruiterReview(
        resumeText,
        finalScore,
        skills,
        aiResult.skillGaps || [],
        jobDescription
      );
    } catch (reviewErr) {
      console.error('❌ AI RECRUITER GENERATION EXCEPTION:', reviewErr.message);
      recruiterReview = generateFallbackRecruiterReview(
        resumeText,
        finalScore,
        skills,
        aiResult.skillGaps || []
      );
    }

    let savedResumeId = null;
    if (userId) {
      const resume = new Resume({
        name: req.user ? `${req.user.first_name} ${req.user.last_name}` : 'Guest User',
        email: req.user ? req.user.email : 'guest@example.com',
        skills,
        resumeText,
        atsScore: finalScore,
        feedback: finalFeedback,
        filePath,
        fileName,
        originalFileName,
        fileSize,
        userId,
        bestFitRole: aiResult.bestFitRole,
        jobMatchPercentage: aiResult.jobMatchPercentage,
        skillGaps: aiResult.skillGaps,
        strengthAreas: aiResult.strengthAreas,
        aiExplanation: aiResult.aiExplanation,
        aiUsed: aiResult.aiUsed,
        jobDescriptionUsed: aiResult.jobDescriptionUsed,
        recruiterReview
      });

      const savedResume = await resume.save();
      await Resume.findByIdAndUpdate(savedResume._id, { status: 'completed' });
      savedResumeId = savedResume._id.toString();

      // Update user activity
      try {
        await User.findByIdAndUpdate(userId, {
          $push: {
            activities: {
              type: 'resume_analyzed',
              details: `ATS ${finalScore}%`,
              timestamp: new Date()
            }
          }
        });
      } catch (actErr) {
        console.error('Failed to log resume analysis activity:', actErr);
      }
    } else {
      // Guest: clean up temp file immediately to save disk space
      if (filePath) {
        try {
          const fs = await import('fs');
          await fs.promises.unlink(filePath).catch(console.error);
        } catch (unlinkError) {
          console.error('Failed to delete guest temp file:', unlinkError);
        }
      }
    }

    const responsePayload = {
      success: true,
      score: finalScore,
      atsScore: finalScore,
      feedback: finalFeedback,
      resumeId: savedResumeId,
      text: resumeText,
      method: extractionMethod,
      pagesProcessed,
      ocrUsed,
      processingTime,
      skills,
      missingKeywords: keywordResult.missingKeywords,
      suggestions: keywordResult.suggestions,
      bestFitRole: aiResult.bestFitRole,
      jobMatchPercentage: aiResult.jobMatchPercentage,
      skillGaps: aiResult.skillGaps,
      strengthAreas: aiResult.strengthAreas,
      aiExplanation: aiResult.aiExplanation,
      aiUsed: !!aiResult.aiUsed,
      scoreSource,
      ai_explanation: finalFeedback,
      best_fit_role: aiResult.bestFitRole,
      job_match_percentage: aiResult.jobMatchPercentage,
      recruiterReview
    };
    if (aiResult.aiUsed) {
      responsePayload.aiModel = aiModel;
      responsePayload.aiScoreBeforeBlend = aiScoreBeforeBlend;
    }
    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('ATS analysis error:', error);
    if (req.file && req.file.path) {
      try {
        const fs = await import('fs');
        await fs.promises.unlink(req.file.path).catch(console.error);
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