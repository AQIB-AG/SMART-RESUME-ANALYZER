import Resume from '../models/Resume.model.js';
import { extractTextFromPdf, performAtsAnalysis } from '../services/ats.service.js';
import { analyzeResumeWithAI } from '../ai/ai.service.js';
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

    const userId = req.user.id;
    const filePath = req.file.path;
    const fileName = req.file.filename;
    const originalFileName = req.file.originalname;
    const fileSize = req.file.size;
    const jobDescription = typeof req.body?.jobDescription === 'string' ? req.body.jobDescription.trim() : '';

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
      resumeText = await extractTextFromPdf(req.file);
    } catch (error) {
      console.error('PDF extraction error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to extract text from PDF'
      });
    }

    // Always run keyword-based ATS (fallback baseline)
    const keywordResult = performAtsAnalysis(resumeText);
    const keywordScore = keywordResult.atsScore;
    const keywordFeedback = keywordResult.feedback;
    const skills = keywordResult.details.matchedTechnical.concat(keywordResult.details.matchedSoft);

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

    const resume = new Resume({
      name: req.user.first_name + ' ' + req.user.last_name,
      email: req.user.email,
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
      jobDescriptionUsed: aiResult.jobDescriptionUsed
    });

    const savedResume = await resume.save();
    await Resume.findByIdAndUpdate(savedResume._id, { status: 'completed' });

    const responsePayload = {
      success: true,
      score: finalScore,
      feedback: finalFeedback,
      resumeId: savedResume._id.toString(),
      bestFitRole: aiResult.bestFitRole,
      jobMatchPercentage: aiResult.jobMatchPercentage,
      skillGaps: aiResult.skillGaps,
      strengthAreas: aiResult.strengthAreas,
      aiExplanation: aiResult.aiExplanation,
      aiUsed: !!aiResult.aiUsed,
      ats_score: finalScore,
      scoreSource,
      ai_explanation: finalFeedback,
      best_fit_role: aiResult.bestFitRole,
      job_match_percentage: aiResult.jobMatchPercentage
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