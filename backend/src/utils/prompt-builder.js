import { parseResumeText } from './resume-parser.js';

/**
 * Builds the prompt for AI cover letter generation.
 */
export function buildCoverLetterPrompt({ resume, companyName = '', roleTitle = '', jobDescription = '', tone = 'Professional' }) {
  const parsed = parseResumeText(resume.resumeText);
  const skills = resume.skills || [];
  const name = resume.name || 'Candidate';
  const email = resume.email || '';

  const skillsStr = skills.length > 0 ? skills.slice(0, 15).join(', ') : 'Various technical and professional skills';
  
  let experienceSnippet = '';
  if (parsed.experience.length > 0) {
    experienceSnippet = `Work Experience Highlights:\n${parsed.experience.slice(0, 8).map(e => `- ${e}`).join('\n')}\n`;
  }
  
  let projectsSnippet = '';
  if (parsed.projects.length > 0) {
    projectsSnippet = `Projects Highlights:\n${parsed.projects.slice(0, 6).map(p => `- ${p}`).join('\n')}\n`;
  }

  let educationSnippet = '';
  if (parsed.education.length > 0) {
    educationSnippet = `Education:\n${parsed.education.slice(0, 3).map(ed => `- ${ed}`).join('\n')}\n`;
  }

  return `You are an expert career advisor and professional resume writer.
Generate a personalized, ATS-friendly, professional cover letter (300-450 words) based on the following resume data:

Candidate Name: ${name}
Candidate Email: ${email}
Top Skills: ${skillsStr}

${experienceSnippet}
${projectsSnippet}
${educationSnippet}
${companyName ? `Target Company: ${companyName}` : ''}
${roleTitle ? `Target Role: ${roleTitle}` : ''}
${jobDescription ? `Job Description / Requirements:\n${jobDescription}` : ''}

Tone: ${tone}

Structure:
- Header: Candidate Name, Email, Date
- Greeting: Dear Hiring Team / Hiring Manager (tailored to Company Name if provided)
- Introduction: Express interest in the specific Role Title and Company Name
- Body Paragraph 1 (Why this role): Explain why you want to work there, aligning with their mission/vibe or project needs.
- Body Paragraph 2 (Skills & Projects): Highlight matching skills and projects from the resume that fit the Job Description (if provided) or general role context.
- Body Paragraph 3 (Value Add): Summarize key strengths without repeating previous items.
- Closing: Professional call to action, invitation to discuss further.
- Sign-off: Professional sign-off and Candidate Name.

Rules:
1. Avoid generic, robotic templates (e.g. "I am writing to express my interest in the position of..."). Write engagingly.
2. If Job Description exists: closely align the cover letter with its keywords, mention matching skills, relevant projects, and highlight candidate-role alignment.
3. If no Job Description exists: generate a generic but highly tailored professional cover letter.
4. STRICT SAFETY: Never hallucinate fake achievements. Never invent companies. Never invent experience. Only use available resume data.
5. Length must be strictly between 300 and 450 words.
6. Return ONLY the plain text cover letter. No introduction text, no markdown styling around the letter, no wrapper tags. Ready to copy.`;
}

/**
 * Builds the prompt for AI interview question generation.
 */
export function buildInterviewQuestionsPrompt({ resume, type = 'Technical', difficulty = 'Medium', number = 5, targetRole = '', seed = '' }) {
  const parsed = parseResumeText(resume.resumeText);
  const skills = resume.skills || [];
  const name = resume.name || 'Candidate';

  const skillsStr = skills.length > 0 ? skills.slice(0, 20).join(', ') : 'Various technical skills';
  
  let experienceSnippet = '';
  if (parsed.experience.length > 0) {
    experienceSnippet = `Experience Highlights:\n${parsed.experience.slice(0, 8).map(e => `- ${e}`).join('\n')}\n`;
  }
  
  let projectsSnippet = '';
  if (parsed.projects.length > 0) {
    projectsSnippet = `Projects Highlights:\n${parsed.projects.slice(0, 6).map(p => `- ${p}`).join('\n')}\n`;
  }

  let educationSnippet = '';
  if (parsed.education.length > 0) {
    educationSnippet = `Education:\n${parsed.education.slice(0, 5).map(ed => `- ${ed}`).join('\n')}\n`;
  }

  let certificationsSnippet = '';
  if (parsed.certifications.length > 0) {
    certificationsSnippet = `Certifications:\n${parsed.certifications.slice(0, 5).map(c => `- ${c}`).join('\n')}\n`;
  }

  let achievementsSnippet = '';
  if (parsed.achievements.length > 0) {
    achievementsSnippet = `Achievements:\n${parsed.achievements.slice(0, 5).map(a => `- ${a}`).join('\n')}\n`;
  }

  // Define instruction details based on type
  let typeInstruction = '';
  if (type === 'Technical') {
    typeInstruction = `Generate ONLY technical questions assessing coding, algorithms, system design, databases, API design, tools, and technical concepts matching the candidate's resume/skills and the target role '${targetRole}'. Do NOT include HR, behavioral, or general background questions.`;
  } else if (type === 'HR') {
    typeInstruction = `Generate ONLY behavioral, situational, and personalized background questions (no technical syntax or coding questions). Focus questions on their projects, experience highlights, achievements, certifications, education, and how their background prepares them to succeed in the target role '${targetRole}'.`;
  } else { // Mixed
    typeInstruction = `Generate an interleaved mix of 50% Technical questions and 50% HR/behavioral questions. Interleave them sequentially (e.g. Q1 is Technical, Q2 is HR/behavioral, Q3 is Technical, Q4 is HR/behavioral, etc.) rather than grouping all technical or HR questions together.`;
  }

  // Define difficulty instructions
  let difficultyInstruction = '';
  if (difficulty === 'Easy') {
    difficultyInstruction = `All questions must be at an 'Easy' level. Focus on basic definitions, introductory concepts, simple tool configurations, and foundational terms.`;
  } else if (difficulty === 'Hard') {
    difficultyInstruction = `All questions must be at a 'Hard' level. Focus on deep internals, complex architectural trade-offs, optimization, scalability, scenario-based problem solving, system design at scale, edge cases, and security vulnerabilities.`;
  } else { // Medium
    difficultyInstruction = `All questions must be at a 'Medium' level. Focus on practical implementation details, debugging common issues, standard architectural design, and everyday problem solving.`;
  }

  return `Generate ${number} ${difficulty} ${targetRole || 'Software Professional'} interview questions based on this resume.
Candidate Name: ${name}
Skills: ${skillsStr}

${experienceSnippet}
${projectsSnippet}
${educationSnippet}
${certificationsSnippet}
${achievementsSnippet}

=========================================
Interview Settings:
- Target Job Role: ${targetRole || 'Software Professional'}
- Interview Type: ${type}
- Difficulty Level: ${difficulty}
- Number of Questions Requested: ${number}
- Random Session Seed: ${seed}
=========================================

Instructions:
1. ${typeInstruction}
2. ${difficultyInstruction}
3. The questions MUST specifically consider BOTH the candidate's resume details and the target job role. If the target role is Frontend Developer and they list React, ask about React hook optimizations or virtual DOM. If the target role is AI/ML Engineer, ask about neural networks, RAG, transformers, vector databases, and evaluation frameworks.
4. Ensure every generation explores different angles of the candidate's profile. Use the Session Seed (${seed}) to steer question selections away from generic questions.
5. For HR questions, construct personalized behavioral questions referencing actual projects, experience milestones, or achievements from their resume (e.g. "On your resume, you listed the project X. What was...").
6. Ensure the output is a valid JSON object.
7. The output MUST be a JSON object with a single root key "questions" containing an array of objects.
8. Each question object MUST have exactly these keys:
   - "question": The question text.
   - "why": Explanation of why the interviewer asks this question (what competency it measures).
   - "expectedAnswer": An array of bullet points or brief outlines indicating what a good candidate should include in their response.
   - "difficulty": The difficulty level (Easy, Medium, Hard).

Strict Output Rule:
Return ONLY the raw JSON string. Do not wrap in markdown code blocks like \`\`\`json. Do not include any greeting, explanation, or conversational filler outside the JSON structure. Ensure it is clean and parseable.`;
}
