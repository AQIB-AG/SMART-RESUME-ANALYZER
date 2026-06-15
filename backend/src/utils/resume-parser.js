/**
 * Helper to parse raw resume text into structured sections.
 * Uses regex-based boundaries to group lines under headings.
 * 
 * @param {string} resumeText - Raw text extracted from the PDF.
 * @returns {object} Structured sections: education, experience, projects, certifications, achievements.
 */
export function parseResumeText(resumeText) {
  const result = {
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    achievements: []
  };

  if (!resumeText || typeof resumeText !== 'string') {
    return result;
  }

  const lines = resumeText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const sectionHeaders = {
    education: /^(education|academic background|academic credentials|qualifications|studies|scholastic)/i,
    experience: /^(work experience|professional experience|experience|employment history|work history|career history|job history|internships)/i,
    projects: /^(projects|personal projects|side projects|academic projects|key projects|selected projects|technical projects)/i,
    certifications: /^(certifications|licenses|credentials|courses|certifications & licenses|certifications and licenses)/i,
    achievements: /^(achievements|awards|accomplishments|honors|extracurricular activities|recognition)/i
  };

  let currentSection = null;

  for (const line of lines) {
    // Check if line looks like a new section header
    let matchedHeader = false;
    for (const [sectionKey, regex] of Object.entries(sectionHeaders)) {
      // Headers are usually short lines (less than 35 characters)
      if (regex.test(line) && line.length < 35) {
        currentSection = sectionKey;
        matchedHeader = true;
        break;
      }
    }

    if (matchedHeader) continue;

    if (currentSection) {
      // Clean up bullet characters and spacing
      const cleanedLine = line.replace(/^[•\-\*\s]+/, '').trim();
      if (cleanedLine.length > 2 && result[currentSection].length < 20) {
        result[currentSection].push(cleanedLine);
      }
    }
  }

  return result;
}
