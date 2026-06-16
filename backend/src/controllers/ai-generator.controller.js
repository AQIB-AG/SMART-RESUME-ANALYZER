import mongoose from 'mongoose';
import Resume from '../models/Resume.model.js';
import * as aiGeneratorService from '../services/ai-generator.service.js';
import { parseResumeText } from '../utils/resume-parser.js';

/**
 * Handle POST /api/resumes/:id/cover-letter
 */
export const handleGenerateCoverLetter = async (req, res) => {
  console.log("➡️ ENTERED handleGenerateCoverLetter with req.params.id:", req.params.id);
  try {
    const resumeId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ success: false, error: 'Invalid resume ID format' });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    // Authorization check
    const userId = req.user.id;
    const userRole = req.user.role;
    if (userRole !== 'admin' && resume.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Extract options from request body
    const { companyName, roleTitle, jobDescription, tone } = req.body;

    const result = await aiGeneratorService.generateCoverLetter(resume, {
      companyName: typeof companyName === 'string' ? companyName.trim() : '',
      roleTitle: typeof roleTitle === 'string' ? roleTitle.trim() : '',
      jobDescription: typeof jobDescription === 'string' ? jobDescription.trim() : '',
      tone: typeof tone === 'string' ? tone.trim() : 'Professional'
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate cover letter'
    });
  }
};

/**
 * Handle POST /api/resumes/:id/interview-questions
 */
export const handleGenerateInterviewQuestions = async (req, res) => {
  try {
    const resumeId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ success: false, error: 'Invalid resume ID format' });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    // Authorization check
    const userId = req.user.id;
    const userRole = req.user.role;
    if (userRole !== 'admin' && resume.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Trace incoming request payload
    console.log(req.body);

    // Verify all selections arrive correctly
    const domain = req.body.domain || req.body.targetRole || req.body.role || '';
    const role = req.body.role || req.body.targetRole || req.body.domain || '';
    const difficulty = req.body.difficulty || 'Medium';
    const interviewType = req.body.interviewType || req.body.type || 'Technical';
    const questionCount = req.body.questionCount || req.body.number || 5;

    // Validate type, difficulty and number
    const targetType = ['Technical', 'HR', 'Mixed'].includes(interviewType) ? interviewType : 'Technical';
    const targetDifficulty = ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium';
    const targetNumber = [5, 10, 15].includes(Number(questionCount)) ? Number(questionCount) : 5;
    const finalRole = typeof role === 'string' ? role.trim() : '';

    // Parse resume details for detailed logging
    const parsed = parseResumeText(resume.resumeText);

    console.log("\n==================================================");
    console.log("📥 RECEIVED INTERVIEW GENERATION REQUEST:");
    console.log(`  * Selected Role:     "${finalRole}"`);
    console.log(`  * Interview Type:    "${targetType}"`);
    console.log(`  * Difficulty:        "${targetDifficulty}"`);
    console.log(`  * Question Count:    ${targetNumber}`);
    console.log(`  * Resume ID:         "${resumeId}"`);
    console.log(`  * Parsed Skills:     ${JSON.stringify(resume.skills || [])}`);
    console.log(`  * Parsed Projects:   ${JSON.stringify(parsed.projects || [])}`);
    console.log(`  * Parsed Experience: ${JSON.stringify(parsed.experience || [])}`);
    console.log("==================================================");

    const result = await aiGeneratorService.generateInterviewQuestions(resume, {
      type: targetType,
      difficulty: targetDifficulty,
      number: targetNumber,
      targetRole: finalRole
    });

    const aiSucceeded = result.method === 'ai';
    const fallbackTriggered = result.method === 'fallback';

    console.log("\n==================================================");
    console.log("📤 INTERVIEW GENERATION RESPONSE STATUS:");
    console.log(`  * AI Succeeded:      ${aiSucceeded}`);
    console.log(`  * Fallback Triggered: ${fallbackTriggered}`);
    console.log(`  * Question Count:    ${result.questions?.length || 0}`);
    console.log("==================================================\n");

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating interview questions:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate interview questions'
    });
  }
};

/**
 * Handle POST /api/resumes/standalone/cover-letter
 */
export const handleGenerateCoverLetterStandalone = async (req, res) => {
  console.log("➡️ ENTERED handleGenerateCoverLetterStandalone with req.body:", req.body);
  try {
    const { resumeId, resumeText, companyName, roleTitle, jobDescription, tone } = req.body;

    let resumeObj = null;

    if (resumeId) {
      if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        return res.status(400).json({ success: false, error: 'Invalid resume ID format' });
      }
      const dbResume = await Resume.findById(resumeId);
      if (!dbResume) {
        return res.status(404).json({ success: false, error: 'Resume not found' });
      }
      // Authorization check
      const userId = req.user.id;
      const userRole = req.user.role;
      if (userRole !== 'admin' && dbResume.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      resumeObj = dbResume;
    } else {
      // Create inline virtual/mock resume object
      resumeObj = {
        resumeText: typeof resumeText === 'string' ? resumeText : '',
        skills: [],
        name: req.user ? `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Candidate' : 'Candidate',
        email: req.user ? req.user.email : ''
      };
    }

    const result = await aiGeneratorService.generateCoverLetter(resumeObj, {
      companyName: typeof companyName === 'string' ? companyName.trim() : '',
      roleTitle: typeof roleTitle === 'string' ? roleTitle.trim() : '',
      jobDescription: typeof jobDescription === 'string' ? jobDescription.trim() : '',
      tone: typeof tone === 'string' ? tone.trim() : 'Professional'
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating standalone cover letter:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate cover letter'
    });
  }
};

/**
 * Handle POST /api/resumes/standalone/interview-questions
 */
export const handleGenerateInterviewQuestionsStandalone = async (req, res) => {
  try {
    const { resumeId, resumeText } = req.body;

    let resumeObj = null;

    if (resumeId) {
      if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        return res.status(400).json({ success: false, error: 'Invalid resume ID format' });
      }
      const dbResume = await Resume.findById(resumeId);
      if (!dbResume) {
        return res.status(404).json({ success: false, error: 'Resume not found' });
      }
      // Authorization check
      const userId = req.user.id;
      const userRole = req.user.role;
      if (userRole !== 'admin' && dbResume.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      resumeObj = dbResume;
    } else {
      // Create inline virtual/mock resume object
      resumeObj = {
        resumeText: typeof resumeText === 'string' ? resumeText : '',
        skills: [],
        name: req.user ? `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Candidate' : 'Candidate',
        email: req.user ? req.user.email : ''
      };
    }

    const domain = req.body.domain || req.body.targetRole || req.body.role || '';
    const role = req.body.role || req.body.targetRole || req.body.domain || '';
    const difficulty = req.body.difficulty || 'Medium';
    const interviewType = req.body.interviewType || req.body.type || 'Technical';
    const questionCount = req.body.questionCount || req.body.number || 5;

    // Validate type, difficulty and number
    const targetType = ['Technical', 'HR', 'Mixed'].includes(interviewType) ? interviewType : 'Technical';
    const targetDifficulty = ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium';
    const targetNumber = [5, 10, 15].includes(Number(questionCount)) ? Number(questionCount) : 5;
    const finalRole = typeof role === 'string' ? role.trim() : '';

    const result = await aiGeneratorService.generateInterviewQuestions(resumeObj, {
      type: targetType,
      difficulty: targetDifficulty,
      number: targetNumber,
      targetRole: finalRole
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating standalone interview questions:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate interview questions'
    });
  }
};

