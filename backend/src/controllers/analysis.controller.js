// Mock analysis data (replace with actual AI engine later)
// For now, we'll return mock analysis results

/**
 * Analyze resume
 */
export const analyzeResume = async (req, res) => {
  try {
    const resumeId = parseInt(req.params.id);
    
    // In real implementation, fetch resume from DB and run analysis
    // For now, return mock analysis data
    
    const mockAnalysis = {
      ats_score: Math.floor(Math.random() * 30) + 70, // 70-100
      skills: {
        all_skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
        technical_skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        soft_skills: ['Communication', 'Teamwork'],
        certifications: []
      },
      sections_analysis: {
        skills: { score: 85, feedback: 'Strong technical skills demonstrated' },
        ats: { score: 87, feedback: 'Good ATS compatibility' },
        grammar: { score: 92, feedback: 'Excellent grammar and spelling' },
        keywords: { score: 78, feedback: 'Could add more relevant keywords' }
      },
      contact_info: {
        email: 'user@example.com',
        phone: '+1234567890',
        location: 'New York, NY'
      },
      education: [
        { degree: 'Bachelor of Science', field: 'Computer Science', institution: 'University' }
      ],
      experience: [
        { title: 'Software Engineer', company: 'Tech Corp', duration: '2 years' }
      ]
    };

    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      data: {
        resume_id: resumeId,
        ...mockAnalysis
      }
    });
  } catch (error) {
    console.error('Analyze resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze resume'
    });
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
 * Get analysis summary
 */
export const getAnalysisSummary = async (req, res) => {
  try {
    const resumeId = parseInt(req.params.id);
    
    // Mock summary
    const mockSummary = {
      resume_id: resumeId,
      filename: 'resume.pdf',
      ats_score: 87,
      skills_count: 12,
      status: 'completed',
      upload_date: new Date().toISOString(),
      extracted_skills: ['JavaScript', 'React', 'Node.js'],
      education: [{ degree: 'BS Computer Science' }],
      experience: [{ title: 'Software Engineer' }],
      sections_analysis: {
        skills: { score: 85 },
        ats: { score: 87 },
        grammar: { score: 92 },
        keywords: { score: 78 }
      }
    };

    res.json({
      success: true,
      data: mockSummary
    });
  } catch (error) {
    console.error('Get analysis summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analysis summary'
    });
  }
};

