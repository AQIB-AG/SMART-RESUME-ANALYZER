import mongoose from 'mongoose';
import Resume from '../models/Resume.model.js';
import * as aiGeneratorService from '../services/ai-generator.service.js';
import { parseResumeText } from '../utils/resume-parser.js';

/**
 * Handle POST /api/resumes/:id/cover-letter
 */
export const handleGenerateCoverLetter = async (req, res) => {
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

    // Extract options from request body
    const { type, difficulty, number, targetRole } = req.body;

    // Validate type, difficulty and number
    const targetType = ['Technical', 'HR', 'Mixed'].includes(type) ? type : 'Technical';
    const targetDifficulty = ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium';
    const targetNumber = [5, 10, 15].includes(Number(number)) ? Number(number) : 5;
    const finalRole = typeof targetRole === 'string' ? targetRole.trim() : '';

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
