// Import pdf-parse - it's a CommonJS module, use createRequire for ES modules
import { createRequire } from 'module';
import fs from 'fs/promises';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Extract text from PDF file
 * @param {Object} file - Multer file object with either .path (diskStorage) or .buffer (memoryStorage)
 * @returns {Promise<string>} Extracted text from PDF
 */
const extractTextFromPdf = async (file) => {
  try {
    // Validate file object
    if (!file) {
      throw new Error('No file provided for PDF extraction');
    }

    let dataBuffer;

    // Handle both diskStorage (file.path) and memoryStorage (file.buffer)
    if (file.buffer && Buffer.isBuffer(file.buffer)) {
      // Memory storage - use buffer directly
      dataBuffer = file.buffer;
    } else if (file.path && typeof file.path === 'string') {
      // Disk storage - read file from path
      try {
        dataBuffer = await fs.readFile(file.path);
      } catch (readError) {
        throw new Error(`Failed to read file from path: ${readError.message}`);
      }
    } else {
      throw new Error('File object must have either .buffer (memoryStorage) or .path (diskStorage) property');
    }

    // Validate that we have a buffer
    if (!Buffer.isBuffer(dataBuffer)) {
      throw new Error('Failed to obtain file buffer for PDF parsing');
    }

    // Validate buffer is not empty
    if (dataBuffer.length === 0) {
      throw new Error('File buffer is empty');
    }

    // Parse PDF using pdf-parse
    const data = await pdfParse(dataBuffer);

    // Validate parsing result
    if (!data) {
      throw new Error('PDF parsing returned no data');
    }

    if (!data.text || typeof data.text !== 'string') {
      throw new Error('PDF parsing returned no extractable text');
    }

    // Check if text is empty or just whitespace
    const extractedText = data.text.trim();
    if (extractedText.length === 0) {
      throw new Error('PDF contains no extractable text (may be image-based or corrupted)');
    }

    return extractedText;
  } catch (error) {
    // Provide user-friendly error messages
    const errorMessage = error.message || 'Unknown error';
    
    if (errorMessage.includes('Invalid PDF') || errorMessage.includes('corrupted') || errorMessage.includes('not a valid PDF')) {
      throw new Error('The uploaded file is not a valid PDF or appears to be corrupted. Please upload a valid PDF file.');
    }
    
    if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
      throw new Error('The PDF is password-protected and cannot be analyzed. Please remove the password and try again.');
    }
    
    if (errorMessage.includes('no extractable text')) {
      throw new Error('The PDF contains no extractable text. It may be image-based. Please use a text-based PDF.');
    }
    
    // Re-throw with context if it's already a formatted error
    if (errorMessage.includes('The uploaded file') || errorMessage.includes('The PDF is')) {
      throw error;
    }
    
    // Generic error with original message
    throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
  }
};

/**
 * Perform rule-based ATS analysis
 */
const performAtsAnalysis = (resumeText) => {
  // Convert text to lowercase for easier matching
  const lowerText = resumeText.toLowerCase();
  
  // Define key ATS keywords and elements
  const keywords = {
    technical: [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'express',
      'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql', 'git', 'github', 'docker',
      'aws', 'azure', 'gcp', 'rest', 'api', 'json', 'xml', 'agile', 'scrum', 'oop',
      'data structures', 'algorithms', 'testing', 'ci/cd', 'linux', 'bash', 'typescript'
    ],
    soft: [
      'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
      'adaptability', 'creativity', 'attention to detail', 'time management', 'collaboration'
    ],
    formats: [
      'header', 'contact', 'phone', 'email', 'address', 'linkedin', 'github', 'website',
      'summary', 'objective', 'experience', 'education', 'skills', 'certifications',
      'awards', 'projects', 'volunteer', 'professional'
    ]
  };
  
  // Count keyword matches
  let technicalMatches = 0;
  let softMatches = 0;
  let formatMatches = 0;
  
  const matchedTechnical = [];
  const matchedSoft = [];
  const matchedFormats = [];
  
  // Check technical keywords
  keywords.technical.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      technicalMatches++;
      if (!matchedTechnical.includes(keyword)) {
        matchedTechnical.push(keyword);
      }
    }
  });
  
  // Check soft skills keywords
  keywords.soft.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      softMatches++;
      if (!matchedSoft.includes(keyword)) {
        matchedSoft.push(keyword);
      }
    }
  });
  
  // Check format keywords
  keywords.formats.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      formatMatches++;
      if (!matchedFormats.includes(keyword)) {
        matchedFormats.push(keyword);
      }
    }
  });
  
  // Calculate formatting score
  let formattingScore = 0;
  if (formatMatches >= 5) formattingScore = 100;
  else if (formatMatches >= 4) formattingScore = 80;
  else if (formatMatches >= 3) formattingScore = 60;
  else if (formatMatches >= 2) formattingScore = 40;
  else formattingScore = 20;
  
  // Calculate keyword density score
  const totalWords = resumeText.split(/\s+/).length;
  const keywordDensity = ((technicalMatches + softMatches) / totalWords) * 100;
  let keywordScore = Math.min(100, keywordDensity * 10);
  
  // Calculate experience section score
  let experienceScore = 0;
  const experienceKeywords = ['experience', 'work', 'employment', 'job', 'position', 'role'];
  const hasExperienceSection = experienceKeywords.some(exp => lowerText.includes(exp));
  if (hasExperienceSection) {
    experienceScore = 20;
  }
  
  // Calculate education section score
  let educationScore = 0;
  const educationKeywords = ['education', 'degree', 'university', 'college', 'school', 'diploma'];
  const hasEducationSection = educationKeywords.some(edu => lowerText.includes(edu));
  if (hasEducationSection) {
    educationScore = 15;
  }
  
  // Calculate skills section score
  let skillsScore = 0;
  if (lowerText.includes('skills')) {
    skillsScore = 15;
  }
  
  // Calculate contact info score
  let contactScore = 0;
  const contactPatterns = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/, // Phone
    /linkedin\.com/i, // LinkedIn
    /github\.com/i // GitHub
  ];
  
  let contactMatches = 0;
  contactPatterns.forEach(pattern => {
    if (pattern.test(resumeText)) {
      contactMatches++;
    }
  });
  
  if (contactMatches >= 2) contactScore = 10;
  else if (contactMatches >= 1) contactScore = 5;
  
  // Calculate ATS compatibility score (0-100)
  const totalPossibleScore = 100;
  const calculatedScore = Math.round(
    (formattingScore * 0.25) +     // 25% weight for formatting
    (keywordScore * 0.30) +       // 30% weight for keyword density
    (experienceScore * 0.10) +    // 10% weight for experience section
    (educationScore * 0.08) +     // 8% weight for education section
    (skillsScore * 0.12) +        // 12% weight for skills section
    (contactScore * 0.15)         // 15% weight for contact info
  );
  
  // Cap the score between 0 and 100
  const atsScore = Math.max(0, Math.min(100, calculatedScore));
  
  // Generate feedback
  const feedback = generateFeedback(atsScore, {
    technicalMatches,
    softMatches,
    formatMatches,
    totalWords,
    hasExperienceSection,
    hasEducationSection,
    hasSkillsSection: lowerText.includes('skills'),
    contactMatches
  });
  
  return {
    atsScore,
    feedback,
    details: {
      technicalMatches,
      softMatches,
      formatMatches,
      keywordDensity: parseFloat(keywordDensity.toFixed(2)),
      matchedTechnical,
      matchedSoft,
      matchedFormats,
      hasExperienceSection,
      hasEducationSection,
      hasSkillsSection: lowerText.includes('skills'),
      contactMatches
    }
  };
};

/**
 * Generate human-readable feedback based on ATS score
 */
const generateFeedback = (atsScore, analysisDetails) => {
  const { 
    technicalMatches, 
    softMatches, 
    formatMatches, 
    totalWords, 
    hasExperienceSection, 
    hasEducationSection, 
    hasSkillsSection, 
    contactMatches 
  } = analysisDetails;
  
  const feedbackParts = [];
  
  if (atsScore >= 85) {
    feedbackParts.push("Excellent! Your resume has strong ATS compatibility.");
  } else if (atsScore >= 70) {
    feedbackParts.push("Good resume with decent ATS compatibility.");
  } else if (atsScore >= 50) {
    feedbackParts.push("Average resume with room for improvement.");
  } else {
    feedbackParts.push("Low ATS compatibility. Significant improvements needed.");
  }
  
  // Technical skills feedback
  if (technicalMatches < 5) {
    feedbackParts.push("Consider adding more technical skills relevant to your target positions.");
  }
  
  // Soft skills feedback
  if (softMatches < 3) {
    feedbackParts.push("Include more soft skills to demonstrate interpersonal abilities.");
  }
  
  // Section feedback
  if (!hasExperienceSection) {
    feedbackParts.push("Add an experience/work section to showcase your professional background.");
  }
  
  if (!hasEducationSection) {
    feedbackParts.push("Include an education section to highlight your academic qualifications.");
  }
  
  if (!hasSkillsSection) {
    feedbackParts.push("Add a dedicated skills section to clearly list your technical and soft skills.");
  }
  
  // Contact info feedback
  if (contactMatches < 2) {
    feedbackParts.push("Ensure your contact information (email, phone, LinkedIn/GitHub) is clearly visible.");
  }
  
  // Length feedback
  if (totalWords < 300) {
    feedbackParts.push("Your resume might be too brief. Consider adding more details about your experiences and accomplishments.");
  } else if (totalWords > 600) {
    feedbackParts.push("Your resume might be too lengthy. Focus on the most relevant and impactful information.");
  }
  
  // Format feedback
  if (formatMatches < 4) {
    feedbackParts.push("Improve resume formatting with clear sections and standard headings.");
  }
  
  return feedbackParts.join(' ');
};

export {
  extractTextFromPdf,
  performAtsAnalysis,
  generateFeedback
};