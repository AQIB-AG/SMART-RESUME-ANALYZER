import { promises as fs } from 'fs';
import { extractText as extractPdfText } from './pdf.service.js';

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

const extractBufferFromFile = async (file) => {
  if (!file) {
    throw new Error('No file provided for ATS analysis');
  }

  if (file.buffer && Buffer.isBuffer(file.buffer)) {
    return file.buffer;
  }

  if (file.path && typeof file.path === 'string') {
    try {
      return await fs.readFile(file.path);
    } catch (readError) {
      throw new Error(`Failed to read file from path: ${readError.message}`);
    }
  }

  throw new Error('Multer file must provide either .buffer or .path.');
};

export const extractTextFromPdf = async (file) => {
  const fileName = file?.originalname || file?.filename || 'unknown.pdf';
  const fileSize = typeof file?.size === 'number' ? file.size : 0;
  const buffer = await extractBufferFromFile(file);

  const extractionResult = await extractPdfText(buffer, fileName, fileSize);

  if (!extractionResult.success) {
    const error = new Error(extractionResult.error || 'Unable to extract text from PDF');
    error.statusCode = 400;
    throw error;
  }

  return {
    text: extractionResult.text,
    method: extractionResult.metadata?.parser || 'unknown',
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

const generateFeedback = (atsScore, details) => {
  const feedbackParts = [];

  if (atsScore >= 85) {
    feedbackParts.push('Excellent resume. ATS compatibility is strong.');
  } else if (atsScore >= 70) {
    feedbackParts.push('Good resume. There are a few improvements that can increase ATS score.');
  } else if (atsScore >= 50) {
    feedbackParts.push('Fair resume. Enhance keyword coverage and structure for better ATS matching.');
  } else {
    feedbackParts.push('Low ATS compatibility. Focus on clarifying skills, experience, and resume structure.');
  }

  if (details.technicalMatches < 4) {
    feedbackParts.push('Add more relevant technical skills that match the target role.');
  }

  if (details.softMatches < 2) {
    feedbackParts.push('Include additional soft skills such as teamwork, leadership, and communication.');
  }

  if (!details.hasExperienceSection) {
    feedbackParts.push('Add a dedicated experience section with company names, titles, and quantifiable achievements.');
  }

  if (!details.hasEducationSection) {
    feedbackParts.push('Add an education section to highlight your academic background.');
  }

  if (!details.hasSkillsSection) {
    feedbackParts.push('Add a clear skills section to make it easier for ATS and recruiters to find your core strengths.');
  }

  if (details.contactMatches < 2) {
    feedbackParts.push('Ensure your contact information is visible, including email and phone number.');
  }

  if (details.totalWords < 300) {
    feedbackParts.push('The resume is short. Add more details about accomplishments, technologies and results.');
  } else if (details.totalWords > 750) {
    feedbackParts.push('The resume is long. Focus on the most relevant details to avoid diluting ATS signal.');
  }

  if (details.formatMatches < 4) {
    feedbackParts.push('Use standard resume headings such as Experience, Education, and Skills for better parsing.');
  }

  return feedbackParts.join(' ');
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
    contactMatches
  });

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
