import { extractTextFromPdf as extractPdfText } from './pdf.service.js';
import path from 'path';
import mammoth from 'mammoth';
import { runOcrOnImages } from './ocr.service.js';

const extractTextFromDocx = async (file) => {
  try {
    let result;
    if (file.buffer && Buffer.isBuffer(file.buffer)) {
      result = await mammoth.extractRawText({ buffer: file.buffer });
    } else if (typeof file.path === 'string') {
      result = await mammoth.extractRawText({ path: file.path });
    } else {
      throw new Error('No file buffer or path provided');
    }
    return {
      success: true,
      text: String(result.value || '').trim(),
      method: 'mammoth',
      pagesProcessed: 1,
      ocrUsed: false
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      method: 'mammoth',
      error: `DOCX extraction failed: ${error.message || String(error)}`
    };
  }
};

const extractTextFromImage = async (file) => {
  try {
    if (!file.path) {
      throw new Error('Image file path is missing');
    }
    const ocrResult = await runOcrOnImages([file.path]);
    if (ocrResult.error && !ocrResult.text) {
      throw new Error(ocrResult.error);
    }
    return {
      success: ocrResult.text.length > 0,
      text: ocrResult.text,
      method: 'ocr',
      pagesProcessed: ocrResult.pagesProcessed || 1,
      ocrUsed: true,
      error: ocrResult.error
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      method: 'ocr',
      ocrUsed: true,
      error: `Image OCR failed: ${error.message || String(error)}`
    };
  }
};

const TECHNICAL_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'node.js', 'nodejs',
  'react', 'angular', 'vue', 'svelte', 'express', 'next.js', 'nuxt', 'html', 'css',
  'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes',
  'aws', 'azure', 'gcp', 'rest', 'graphql', 'api', 'microservices', 'git',
  'github', 'gitlab', 'ci/cd', 'testing', 'jest', 'mocha', 'selenium', 'linux',
  'bash', 'powershell', 'machine learning', 'ml', 'data structures', 'algorithms',
  'oop', 'object oriented', 'react native', 'mobile', 'ios', 'android'
];

const SOFT_SKILLS = [
  'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
  'adaptability', 'creativity', 'attention to detail', 'time management', 'collaboration',
  'initiative', 'organization', 'stakeholder', 'presentation', 'mentoring'
];

const FORMAT_KEYWORDS = [
  'contact', 'email', 'phone', 'linkedin', 'github', 'website', 'summary',
  'objective', 'experience', 'education', 'skills', 'certifications', 'projects',
  'awards', 'volunteer', 'professional'
];

const DEGREE_KEYWORDS = [
  'bachelor', 'master', 'mba', 'phd', 'associate', 'degree', 'diploma', 'certificate',
  'university', 'college', 'school', 'graduated', 'graduation'
];

export const extractTextFromPdf = async (file) => {
  const fileExtension = path.extname(file.originalname || '').toLowerCase();
  
  let extractionResult;
  if (fileExtension === '.pdf') {
    extractionResult = await extractPdfText(file);
  } else if (fileExtension === '.docx') {
    extractionResult = await extractTextFromDocx(file);
  } else if (['.png', '.jpg', '.jpeg'].includes(fileExtension)) {
    extractionResult = await extractTextFromImage(file);
  } else {
    extractionResult = {
      success: false,
      error: 'Unsupported file format. Please upload PDF, DOCX, JPG, JPEG, or PNG.'
    };
  }

  // If extraction succeeded but returned empty text, treat as failure
  if (extractionResult.success && (!extractionResult.text || extractionResult.text.trim().length === 0)) {
    extractionResult.success = false;
    extractionResult.error = 'Unable to extract text from the uploaded file. Please try another resume.';
  }

  if (!extractionResult.success) {
    const error = new Error(extractionResult.error || 'Unable to extract text from the uploaded file. Please try another resume.');
    error.statusCode = 400;
    throw error;
  }

  return {
    text: extractionResult.text,
    method: extractionResult.method || 'unknown',
    pagesProcessed: extractionResult.pagesProcessed || 0,
    ocrUsed: extractionResult.ocrUsed || false,
    processingTime: extractionResult.processingTime || null,
    metadata: extractionResult.metadata
  };
};

const normalizeText = (text) => String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();

const extractKeywords = (text, candidates) => {
  const lowerText = normalizeText(text);
  return candidates.filter((keyword) => lowerText.includes(keyword));
};

const cleanJobDescription = (jobDescription) => {
  if (!jobDescription || typeof jobDescription !== 'string') {
    return '';
  }
  return jobDescription
    .replace(/[\r\n]+/g, ' ')
    .replace(/[<>\[\]{}()]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .toLowerCase();
};

const extractJobKeywords = (jobDescription) => {
  const normalized = cleanJobDescription(jobDescription);
  if (!normalized) {
    return [];
  }

  const jobWords = normalized
    .split(/[^a-z0-9\.\+\-]+/u)
    .filter((token) => token.length >= 3 && token.length <= 20);

  const uniqueJobWords = Array.from(new Set(jobWords));
  return uniqueJobWords.filter((word) => [
    ...TECHNICAL_KEYWORDS,
    ...SOFT_SKILLS,
    ...FORMAT_KEYWORDS,
    ...DEGREE_KEYWORDS
  ].includes(word));
};

const countYearsOfExperience = (text) => {
  const occurrences = text.match(/(\d+)\s+years?/g) ?? [];
  let maxYears = 0;

  for (const match of occurrences) {
    const value = parseInt(match.replace(/\D/g, ''), 10);
    if (!Number.isNaN(value)) {
      maxYears = Math.max(maxYears, value);
    }
  }

  const dateMatches = text.match(/(19|20)\d{2}/g) ?? [];
  if (dateMatches.length >= 2) {
    const years = dateMatches.map((value) => parseInt(value, 10)).sort((a, b) => a - b);
    const rangeYears = years[years.length - 1] - years[0];
    maxYears = Math.max(maxYears, rangeYears);
  }

  return maxYears;
};

const matchedEducationKeywords = (text) => {
  return DEGREE_KEYWORDS.some((keyword) => text.includes(keyword));
};

export const getSkillSuggestions = (skills = [], resumeText = '') => {
  const lowercaseText = String(resumeText || '').toLowerCase();
  const lowerSkills = skills.map(s => String(s).toLowerCase());
  
  // Define technology stacks and their recommended skills
  const stacks = [
    {
      keywords: ['react', 'angular', 'vue', 'svelte', 'javascript', 'typescript', 'next.js', 'nextjs', 'html', 'css', 'frontend'],
      suggestions: ['TypeScript', 'Redux', 'AWS', 'Docker', 'CI/CD', 'Tailwind CSS', 'GraphQL', 'Jest']
    },
    {
      keywords: ['python', 'machine learning', 'ml', 'deep learning', 'pandas', 'numpy', 'scikit-learn', 'data science', 'ai', 'tensorflow', 'pytorch'],
      suggestions: ['TensorFlow', 'PyTorch', 'MLOps', 'Docker', 'AWS', 'Kubernetes', 'SQL', 'Git']
    },
    {
      keywords: ['java', 'spring', 'spring boot', 'hibernate'],
      suggestions: ['Microservices', 'Kafka', 'Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'Redis', 'CI/CD']
    },
    {
      keywords: ['django', 'flask', 'fastapi'],
      suggestions: ['FastAPI', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Redis', 'Celery', 'CI/CD']
    },
    {
      keywords: ['c#', '.net', 'asp.net'],
      suggestions: ['Azure', 'Docker', 'SQL Server', 'Entity Framework', 'Microservices', 'Kubernetes', 'CI/CD']
    },
    {
      keywords: ['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin', 'mobile'],
      suggestions: ['TypeScript', 'Redux', 'Firebase', 'GraphQL', 'CI/CD', 'App Store Deployment', 'Fastlane']
    },
    {
      keywords: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'devops', 'ci/cd', 'terraform', 'ansible', 'jenkins'],
      suggestions: ['Terraform', 'Prometheus', 'Grafana', 'Python', 'Bash', 'ArgoCD', 'Helm']
    }
  ];

  // Domain fallback maps
  const domainFallbacks = [
    {
      keywords: ['product manager', 'product management', 'project manager', 'project management', 'agile', 'scrum', 'pmp'],
      suggestions: ['Agile', 'Scrum', 'Jira', 'Product Roadmap', 'SQL', 'Data Analytics', 'Stakeholder Management']
    },
    {
      keywords: ['marketing', 'sales', 'seo', 'analytics', 'growth', 'advertising'],
      suggestions: ['CRM', 'SEO', 'Google Analytics', 'Lead Generation', 'Email Marketing', 'Copywriting', 'A/B Testing']
    },
    {
      keywords: ['finance', 'accounting', 'analyst', 'excel', 'valuation', 'financial'],
      suggestions: ['Excel', 'Financial Modeling', 'SQL', 'Python', 'Tableau', 'QuickBooks', 'Forecasting']
    },
    {
      keywords: ['design', 'ui', 'ux', 'figma', 'photoshop', 'illustrator', 'creative'],
      suggestions: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Adobe Creative Suite', 'Design Systems', 'HTML/CSS']
    },
    {
      keywords: ['hr', 'recruiting', 'recruiter', 'talent', 'hiring', 'onboarding'],
      suggestions: ['ATS', 'Talent Acquisition', 'Onboarding', 'HRIS', 'Employee Relations', 'LinkedIn Recruiter']
    }
  ];

  const targetSuggestions = new Set();

  // Find matching stacks
  for (const stack of stacks) {
    const matchesKeyword = stack.keywords.some(k => lowerSkills.includes(k) || lowercaseText.includes(k));
    if (matchesKeyword) {
      stack.suggestions.forEach(s => {
        if (!lowerSkills.includes(s.toLowerCase()) && !lowercaseText.includes(s.toLowerCase())) {
          targetSuggestions.add(s);
        }
      });
    }
  }

  // Find matching domains if targetSuggestions has less than 5 items
  if (targetSuggestions.size < 5) {
    for (const dom of domainFallbacks) {
      const matchesKeyword = dom.keywords.some(k => lowercaseText.includes(k));
      if (matchesKeyword) {
        dom.suggestions.forEach(s => {
          if (!lowerSkills.includes(s.toLowerCase()) && !lowercaseText.includes(s.toLowerCase())) {
            targetSuggestions.add(s);
          }
        });
      }
    }
  }

  // Convert to array
  let finalSuggestions = Array.from(targetSuggestions);

  // If still empty or fewer than 5, use general high-value tech suggestions
  if (finalSuggestions.length < 5) {
    const generalTech = ['Git', 'Docker', 'AWS', 'SQL', 'Agile', 'CI/CD', 'TypeScript', 'Python'];
    generalTech.forEach(s => {
      if (!lowerSkills.includes(s.toLowerCase()) && !lowercaseText.includes(s.toLowerCase())) {
        finalSuggestions.push(s);
      }
    });
    // Remove duplicates
    finalSuggestions = [...new Set(finalSuggestions)];
  }

  // Keep between 5 to 8 elements
  return finalSuggestions.slice(0, 8);
};

const generateFeedback = (atsScore, details, resumeText = '') => {
  const lowercaseText = String(resumeText || '').toLowerCase();
  
  // Extract matched tech skills
  const skillsMatched = details.matchedTechnical || [];
  
  // Detect if projects are present
  const hasProjectsSection = lowercaseText.includes('project') || lowercaseText.includes('portfolio') || lowercaseText.includes('github.com');
  // Detect if internships are present
  const hasInternships = lowercaseText.includes('intern') || lowercaseText.includes('internship') || lowercaseText.includes('co-op') || lowercaseText.includes('trainee');
  // Detect if certifications are present
  const hasCertifications = lowercaseText.includes('certif') || lowercaseText.includes('certified');
  // Experience years
  const experienceYears = details.experienceYears || 0;

  // Let's check for the specific user requested cases first
  const hasReact = skillsMatched.map(s => String(s).toLowerCase()).includes('react');
  const hasNode = skillsMatched.map(s => String(s).toLowerCase()).includes('node.js') || skillsMatched.map(s => String(s).toLowerCase()).includes('nodejs');

  // Resume C: Excellent ATS Score
  if (atsScore >= 85) {
    return "Your resume is well-structured and ATS-friendly. The keyword coverage is strong and major sections are present. To further strengthen the profile, consider adding measurable achievements and leadership examples.";
  }

  // Resume A: Strong React + Node.js projects, No internships, No certifications
  if ((hasReact || hasNode) && hasProjectsSection && !hasInternships && !hasCertifications && experienceYears === 0) {
    return "Your resume demonstrates strong practical development skills through multiple React and Node.js projects. However, adding internship experience or industry certifications would improve recruiter confidence and increase competitiveness.";
  }

  // Resume B: Strong experience, Weak project section
  if (experienceYears >= 3 && !hasProjectsSection) {
    return "Your professional experience is a strong aspect of your profile. Consider expanding your project descriptions with measurable outcomes and technologies used to better demonstrate technical depth.";
  }

  // Generic Dynamic Builder
  const parts = [];
  if (atsScore >= 70) {
    parts.push("Your resume has solid ATS compatibility with clear formatting and a good foundation.");
  } else if (atsScore >= 50) {
    parts.push("Your resume has fair ATS compatibility, but key adjustments are needed to improve keyword match and structure.");
  } else {
    parts.push("Your resume currently has low ATS compatibility, making it difficult for automated filters to parse your profile.");
  }

  if (skillsMatched.length > 0) {
    const list = skillsMatched.slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' and ');
    parts.push(`The profile demonstrates key competencies in ${list}.`);
  }

  if (experienceYears > 0) {
    parts.push(`Your ${experienceYears} year${experienceYears > 1 ? 's' : ''} of professional experience is a strong asset that adds significant weight.`);
  } else if (!details.hasExperienceSection) {
    parts.push("A dedicated work experience section is missing, which is highly recommended to establish professional context.");
  }

  const missingElements = [];
  if (!hasInternships && experienceYears === 0) {
    missingElements.push("adding internship experience");
  }
  if (!hasCertifications) {
    missingElements.push("industry certifications");
  }
  if (!hasProjectsSection) {
    missingElements.push("project descriptions with measurable outcomes");
  }

  if (missingElements.length > 0) {
    parts.push(`Consider ${missingElements.slice(0, 2).join(' or ')} to build recruiter confidence and showcase technical depth.`);
  } else {
    parts.push("To further improve recruiter confidence, emphasize quantifiable metrics and business impact in your roles.");
  }

  return parts.join(' ');
};


export const performAtsAnalysis = (resumeText, jobDescription = '') => {
  const lowerText = normalizeText(resumeText);
  const totalWords = Math.max(1, lowerText.split(/\s+/).length);

  const matchedTechnical = extractKeywords(lowerText, TECHNICAL_KEYWORDS);
  const matchedSoft = extractKeywords(lowerText, SOFT_SKILLS);
  const matchedFormats = extractKeywords(lowerText, FORMAT_KEYWORDS);

  const hasExperienceSection = /(^|\n)\s*(experience|work experience|professional experience|employment)\b/.test(lowerText);
  const hasEducationSection = /(^|\n)\s*(education|academic background|academics|training)\b/.test(lowerText);
  const hasSkillsSection = /(^|\n)\s*(skills|technical skills|core competencies|areas of expertise)\b/.test(lowerText);

  const contactPatterns = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
    /(\+?\d{1,3}[\s-.])?(\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/,
    /linkedin\.com/i,
    /github\.com/i
  ];

  let contactMatches = 0;
  for (const pattern of contactPatterns) {
    if (pattern.test(resumeText)) {
      contactMatches += 1;
    }
  }

  const experienceYears = countYearsOfExperience(lowerText);
  const experienceScore = experienceYears >= 5 ? 100 : experienceYears >= 3 ? 85 : experienceYears >= 1 ? 70 : hasExperienceSection ? 50 : 20;
  const educationScore = matchedEducationKeywords(lowerText) ? 100 : hasEducationSection ? 70 : 0;

  const formatScore = Math.min(100, Math.max(20, Math.round((matchedFormats.length / 8) * 100)));
  const skillCoverage = Math.min(1, (matchedTechnical.length + matchedSoft.length) / 12);
  const skillsScore = Math.round(skillCoverage * 100);

  const jobKeywords = extractJobKeywords(jobDescription);
  const matchedJobKeywords = jobKeywords.filter((keyword) => lowerText.includes(keyword));
  const missingKeywords = jobKeywords.filter((keyword) => !matchedJobKeywords.includes(keyword));
  const keywordScore = jobKeywords.length > 0 ? Math.round((matchedJobKeywords.length / jobKeywords.length) * 100) : skillsScore;

  const atsScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        skillsScore * 0.30 +
        experienceScore * 0.30 +
        educationScore * 0.10 +
        keywordScore * 0.20 +
        formatScore * 0.10
      )
    )
  );

  const suggestions = [];
  if (!hasExperienceSection) {
    suggestions.push('Add or clarify an Experience section with clear dates, job titles, and achievements.');
  }
  if (!hasEducationSection) {
    suggestions.push('Add an Education section with your degree, institution, and graduation date.');
  }
  if (!hasSkillsSection) {
    suggestions.push('Add a dedicated Skills section to surface your technical and soft skills.');
  }
  if (contactMatches < 2) {
    suggestions.push('Ensure your resume includes a visible email address and phone number.');
  }
  if (matchedTechnical.length < 4) {
    suggestions.push('Include more targeted technical keywords that reflect your experience and the role you want.');
  }
  if (matchedSoft.length < 2) {
    suggestions.push('Add more soft skills to demonstrate teamwork, communication, and leadership.');
  }
  if (missingKeywords.length > 0) {
    suggestions.push(`Include the following job description keywords when relevant: ${missingKeywords.slice(0, 10).join(', ')}.`);
  }
  if (totalWords < 300) {
    suggestions.push('Add more project or achievement detail to make your resume more complete.');
  }

  const feedback = generateFeedback(atsScore, {
    technicalMatches: matchedTechnical.length,
    softMatches: matchedSoft.length,
    formatMatches: matchedFormats.length,
    totalWords,
    hasExperienceSection,
    hasEducationSection,
    hasSkillsSection,
    contactMatches,
    matchedTechnical,
    experienceYears
  }, resumeText);


  return {
    atsScore,
    feedback,
    skills: Array.from(new Set([...matchedTechnical, ...matchedSoft])),
    missingKeywords,
    suggestions,
    details: {
      matchedTechnical,
      matchedSoft,
      matchedFormats,
      totalWords,
      experienceYears,
      hasExperienceSection,
      hasEducationSection,
      hasSkillsSection,
      contactMatches,
      jobKeywords,
      matchedJobKeywords,
      keywordScore
    }
  };
};

export { generateFeedback };
