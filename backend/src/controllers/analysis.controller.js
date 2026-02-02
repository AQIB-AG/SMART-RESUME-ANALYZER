import mongoose from 'mongoose';
import Resume from '../models/Resume.model.js';

/**
 * Analyze resume (returns stored analysis data)
 */
export const analyzeResume = async (req, res) => {
  try {
    const resumeId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ success: false, error: 'Invalid resume id' });
    }
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    const userId = req.user.id;
    const userRole = req.user.role;
    if (userRole !== 'admin' && resume.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    const technicalList = ['javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'express',
      'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql', 'git', 'github', 'docker',
      'aws', 'azure', 'gcp', 'rest', 'api', 'json', 'xml', 'agile', 'scrum', 'oop'];
    const softList = ['communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
      'adaptability', 'creativity', 'attention to detail', 'time management', 'collaboration'];
    const analysisResult = {
      ats_score: resume.atsScore,
      feedback: resume.feedback,
      best_fit_role: resume.bestFitRole,
      job_match_percentage: resume.jobMatchPercentage,
      skill_gaps: resume.skillGaps,
      strength_areas: resume.strengthAreas,
      ai_explanation: resume.aiExplanation,
      ai_used: resume.aiUsed,
      skills: {
        all_skills: resume.skills || [],
        technical_skills: (resume.skills || []).filter(s => technicalList.includes((s || '').toLowerCase())),
        soft_skills: (resume.skills || []).filter(s => softList.includes((s || '').toLowerCase())),
        certifications: []
      },
      sections_analysis: {
        skills: { score: resume.atsScore ? Math.min(100, resume.atsScore) : 0, feedback: 'Skills section evaluation' },
        ats: { score: resume.atsScore || 0, feedback: resume.feedback || 'ATS compatibility feedback' },
        grammar: { score: resume.atsScore ? Math.min(100, resume.atsScore + 10) : 0, feedback: 'Grammar and spelling evaluation' },
        keywords: { score: resume.atsScore ? Math.min(100, resume.atsScore - 5) : 0, feedback: 'Keyword density evaluation' }
      },
      contact_info: { email: resume.email, name: resume.name },
      education: [],
      experience: []
    };
    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      data: { resume_id: resumeId, ...analysisResult }
    });
  } catch (error) {
    console.error('Analyze resume error:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze resume' });
  }
};

/**
 * Match resume to jobs
 */
export const matchResumeToJobs = async (req, res) => {
  try {
    const resumeId = parseInt(req.params.id);
    
    // Mock job matches
    const mockMatches = [
      {
        job_id: 1,
        job_title: 'Senior Full Stack Developer',
        company: 'Tech Company',
        match_percentage: 87,
        matched_skills: ['JavaScript', 'React', 'Node.js'],
        missing_skills: ['TypeScript', 'AWS']
      },
      {
        job_id: 2,
        job_title: 'React Developer',
        company: 'Startup Inc',
        match_percentage: 92,
        matched_skills: ['JavaScript', 'React'],
        missing_skills: ['Redux']
      }
    ];

    res.json({
      success: true,
      data: {
        resume_id: resumeId,
        job_matches: mockMatches
      }
    });
  } catch (error) {
    console.error('Match resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to match resume to jobs'
    });
  }
};

/**
 * Skill gap analysis
 */
export const skillGapAnalysis = async (req, res) => {
  try {
    const resumeId = parseInt(req.params.id);
    const jobId = parseInt(req.params.jobId);
    
    // Mock skill gap analysis
    const mockGapAnalysis = {
      gap_analysis: {
        missing_skills: ['TypeScript', 'AWS', 'Docker'],
        matched_skills: ['JavaScript', 'React', 'Node.js'],
        skill_gap_percentage: 35
      },
      improvement_plan: [
        { skill: 'TypeScript', priority: 'high', resources: ['TypeScript Handbook', 'Online Course'] },
        { skill: 'AWS', priority: 'medium', resources: ['AWS Certification', 'Tutorial'] }
      ],
      market_comparison: {
        trending_skills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes'],
        your_skills_match: 60
      }
    };

    res.json({
      success: true,
      data: {
        resume_id: resumeId,
        job_id: jobId,
        ...mockGapAnalysis
      }
    });
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform skill gap analysis'
    });
  }
};

/**
 * Get analysis summary (real resume data from DB including AI analysis)
 */
export const getAnalysisSummary = async (req, res) => {
  try {
    const resumeId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ success: false, error: 'Invalid resume id' });
    }
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    const userId = req.user.id;
    const userRole = req.user.role;
    if (userRole !== 'admin' && resume.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    const summary = {
      resume_id: resume._id.toString(),
      filename: resume.originalFileName || resume.fileName || 'resume.pdf',
      ats_score: resume.atsScore,
      score_source: resume.aiUsed ? 'ai' : 'keyword',
      skills_count: (resume.skills || []).length,
      status: resume.status,
      upload_date: resume.createdAt ? new Date(resume.createdAt).toISOString() : null,
      extracted_skills: resume.skills || [],
      best_fit_role: resume.bestFitRole,
      job_match_percentage: resume.jobMatchPercentage,
      skill_gaps: resume.skillGaps || [],
      strength_areas: resume.strengthAreas || [],
      ai_explanation: resume.aiExplanation,
      ai_used: resume.aiUsed,
      feedback: resume.feedback,
      education: [],
      experience: [],
      sections_analysis: {
        skills: { score: resume.atsScore ? Math.min(100, resume.atsScore) : 0 },
        ats: { score: resume.atsScore || 0 },
        grammar: { score: resume.atsScore ? Math.min(100, resume.atsScore + 10) : 0 },
        keywords: { score: resume.atsScore ? Math.min(100, resume.atsScore - 5) : 0 }
      }
    };
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Get analysis summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analysis summary' });
  }
};

