/**
 * AI-powered resume analysis using Hugging Face free inference API
 * Model: sentence-transformers/all-MiniLM-L6-v2
 * All AI logic stays in backend; free tier only.
 */

import { generateFeedback } from '../services/ats.service.js';

const HF_API_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';
const MAX_TEXT_LENGTH = 5120; // ~512 tokens safe for API

// Predefined role templates for auto-matching when no job description is provided
const ROLE_TEMPLATES = {
  'Frontend Developer': 'Frontend development, React, Vue, Angular, JavaScript, TypeScript, HTML, CSS, responsive design, UI/UX, single page applications, component architecture, state management, Redux, web performance.',
  'Backend Developer': 'Backend development, Node.js, Python, Java, C#, REST APIs, databases, SQL, MongoDB, PostgreSQL, microservices, authentication, server-side logic, API design, caching.',
  'Full Stack Developer': 'Full stack development, frontend and backend, React, Node.js, databases, REST APIs, JavaScript, TypeScript, system design, deployment, DevOps basics, end-to-end development.',
  'Data Engineer': 'Data engineering, ETL, Python, SQL, data pipelines, Apache Spark, data warehousing, cloud data services, database design, data modeling, big data, Airflow.',
  'Data Scientist': 'Data science, machine learning, Python, statistics, pandas, scikit-learn, data analysis, visualization, SQL, Jupyter, predictive modeling, deep learning.',
  'DevOps Engineer': 'DevOps, CI/CD, Docker, Kubernetes, AWS, Azure, GCP, Linux, scripting, infrastructure as code, Terraform, monitoring, cloud architecture, automation.',
  'Software Engineer': 'Software engineering, programming, algorithms, data structures, OOP, design patterns, version control, testing, agile, problem solving, code quality.',
  'Product Manager': 'Product management, roadmap, user stories, agile, stakeholder management, analytics, prioritization, cross-functional teams, product strategy, requirements.',
};

// In-memory cache for role embeddings (reduces API calls)
let roleEmbeddingsCache = null;

/**
 * Truncate text to safe length for API (model has 512 token limit)
 */
function truncateForApi(text) {
  if (!text || typeof text !== 'string') return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= MAX_TEXT_LENGTH) return cleaned;
  return cleaned.substring(0, MAX_TEXT_LENGTH);
}

/**
 * Get embedding for a single text via Hugging Face Inference API
 * @param {string} text
 * @returns {Promise<number[]>} embedding vector or null on failure
 */
export async function getEmbedding(text) {
  const token = process.env.HF_TOKEN || process.env.HF_API_KEY;
  if (!token) {
    console.warn('AI: HF_TOKEN not set, embeddings disabled');
    return null;
  }

  const truncated = truncateForApi(text);
  if (!truncated) return null;

  try {
    console.log('🤖 USING HF EMBEDDINGS');
    const res = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ inputs: truncated }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('AI embedding API error:', res.status, errText);
      return null;
    }

    const data = await res.json();
    // API returns array of numbers for single input, or array of arrays for batch
    if (Array.isArray(data) && data.length > 0) {
      return Array.isArray(data[0]) ? data[0] : data;
    }
    return null;
  } catch (err) {
    console.warn('AI getEmbedding error:', err.message);
    return null;
  }
}

/**
 * Cosine similarity between two vectors (0 to 1)
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return Math.max(0, Math.min(1, dot / denom));
}

/**
 * Get or build cached role embeddings
 */
async function getRoleEmbeddings() {
  if (roleEmbeddingsCache) return roleEmbeddingsCache;
  const token = process.env.HF_TOKEN || process.env.HF_API_KEY;
  if (!token) return null;

  const roles = Object.entries(ROLE_TEMPLATES);
  const embeddings = {};
  for (const [role, desc] of roles) {
    const emb = await getEmbedding(desc);
    if (emb) embeddings[role] = emb;
  }
  if (Object.keys(embeddings).length > 0) {
    roleEmbeddingsCache = embeddings;
  }
  return roleEmbeddingsCache;
}

/**
 * Parse resume text into rough sections for weighted scoring
 */
function parseResumeSections(resumeText) {
  const lower = (resumeText || '').toLowerCase();
  const sections = {
    skills: '',
    experience: '',
    projects: '',
    full: resumeText || '',
  };

  const skillHeaders = ['skills', 'technical skills', 'core competencies', 'expertise', 'technologies'];
  const expHeaders = ['experience', 'work experience', 'employment', 'professional experience', 'career'];
  const projHeaders = ['projects', 'personal projects', 'side projects', 'key projects'];

  const extractAfter = (headers, maxLen = 800) => {
    for (const h of headers) {
      const idx = lower.indexOf(h);
      if (idx === -1) continue;
      let end = lower.indexOf('\n\n', idx + 1);
      if (end === -1) end = lower.length;
      let chunk = resumeText.substring(idx, Math.min(idx + maxLen, end + 200));
      chunk = chunk.replace(/\s+/g, ' ').trim();
      return chunk || '';
    }
    return '';
  };

  sections.skills = extractAfter(skillHeaders, 600);
  sections.experience = extractAfter(expHeaders, 1200);
  sections.projects = extractAfter(projHeaders, 800);

  if (!sections.skills) {
    const bulletMatch = (resumeText || '').match(/(?:javascript|python|react|node|java|sql|html|css|aws|docker|git)[^.\n]*/gi);
    if (bulletMatch) sections.skills = bulletMatch.join(' ').substring(0, 600);
  }

  return sections;
}

/**
 * Normalize score to 0-100 with consistent scaling (avoid randomness)
 */
function normalizeScore(rawSimilarity, keywordScoreComponent = 0) {
  const scaled = rawSimilarity * 100;
  const blended = keywordScoreComponent > 0
    ? scaled * 0.65 + Math.min(100, keywordScoreComponent) * 0.35
    : scaled;
  return Math.round(Math.max(0, Math.min(100, blended)));
}

/**
 * Generate recruiter-style human-readable explanation
 */
function generateAIExplanation(atsScore, bestFitRole, jobMatchPercentage, strengthAreas, skillGaps, hadJobDescription, resumeText = '', keywordDetails = null) {
  const details = {
    technicalMatches: strengthAreas?.length || 0,
    softMatches: keywordDetails?.softMatches || 0,
    formatMatches: keywordDetails?.formatMatches || 4,
    totalWords: (resumeText || '').split(/\s+/).length,
    hasExperienceSection: keywordDetails?.hasExperienceSection ?? (resumeText || '').toLowerCase().includes('experience'),
    hasEducationSection: keywordDetails?.hasEducationSection ?? (resumeText || '').toLowerCase().includes('education'),
    hasSkillsSection: keywordDetails?.hasSkillsSection ?? (resumeText || '').toLowerCase().includes('skills'),
    contactMatches: keywordDetails?.contactMatches || 2,
    matchedTechnical: strengthAreas || [],
    experienceYears: keywordDetails?.experienceYears || 0
  };
  return generateFeedback(atsScore, details, resumeText);
}

/**
 * Extract keyword-based component scores (for hybrid scoring)
 */
function getKeywordComponentScores(resumeText, details) {
  if (!details) return { skills: 50, experience: 50, projects: 50, structure: 50 };
  const d = details;
  const totalWords = Math.max(1, (resumeText || '').split(/\s+/).length);
  const skillsRaw = ((d.technicalMatches || 0) + (d.softMatches || 0)) * 8;
  const skills = Math.min(100, skillsRaw);
  const experience = (d.hasExperienceSection ? 80 : 20) + (d.formatMatches || 0) * 2;
  const projects = (resumeText || '').toLowerCase().includes('project') ? 70 : 40;
  const structure = Math.min(100, (d.formatMatches || 0) * 15 + (d.contactMatches || 0) * 10);
  return {
    skills: Math.min(100, skills),
    experience: Math.min(100, experience),
    projects: Math.min(100, projects),
    structure: Math.min(100, structure),
  };
}

/**
 * Main AI analysis: embeddings + cosine similarity + weighted score + explanation
 * @param {string} resumeText - Full resume text
 * @param {string} [jobDescription] - Optional job description for match %
 * @param {object} [keywordDetails] - From existing performAtsAnalysis details for hybrid scoring
 * @returns {Promise<object>} { atsScore, bestFitRole, jobMatchPercentage, skillGaps, strengthAreas, aiExplanation, aiUsed }
 */
export async function analyzeResumeWithAI(resumeText, jobDescription = null, keywordDetails = null) {
  console.log('🤖 AI SERVICE CALLED');
  const result = {
    atsScore: 0,
    bestFitRole: null,
    jobMatchPercentage: null,
    skillGaps: [],
    strengthAreas: [],
    aiExplanation: '',
    aiUsed: false,
  };

  const token = process.env.HF_TOKEN || process.env.HF_API_KEY;
  console.log('HF TOKEN PRESENT:', !!token);
  if (!token) {
    console.warn('❌ AI SKIPPED – HF_TOKEN not set, falling back to keyword ATS');
    return result;
  }

  try {
  const sections = parseResumeSections(resumeText);
  const keywordScores = getKeywordComponentScores(resumeText, keywordDetails);

  const resumeEmbedding = await getEmbedding(sections.full);
  if (!resumeEmbedding) {
    console.error('❌ AI FAILED – FALLING BACK TO KEYWORD ATS', 'Resume embedding returned null');
    return result;
  }

  let skillsSim = 0.5;
  let experienceSim = 0.5;
  let projectsSim = 0.5;
  let structureSim = 0.5;

  if (sections.skills) {
    const skillEmb = await getEmbedding(sections.skills);
    if (skillEmb) skillsSim = cosineSimilarity(resumeEmbedding, skillEmb);
  }
  if (sections.experience) {
    const expEmb = await getEmbedding(sections.experience);
    if (expEmb) experienceSim = cosineSimilarity(resumeEmbedding, expEmb);
  }
  if (sections.projects) {
    const projEmb = await getEmbedding(sections.projects);
    if (projEmb) projectsSim = cosineSimilarity(resumeEmbedding, projEmb);
  }
  structureSim = 0.4 + 0.3 * (sections.full.length > 500 ? 1 : 0) + 0.3 * (sections.full.includes('experience') || sections.full.includes('skills') ? 1 : 0);

  if (jobDescription && jobDescription.trim()) {
    const jdEmb = await getEmbedding(truncateForApi(jobDescription.trim()));
    if (jdEmb) {
      const matchSim = cosineSimilarity(resumeEmbedding, jdEmb);
      result.jobMatchPercentage = Math.round(matchSim * 100);
      result.strengthAreas = keywordDetails?.matchedTechnical?.slice(0, 8) || [];
      const allKeywords = (jobDescription || '').toLowerCase().match(/\b(?:javascript|python|react|node|java|sql|aws|docker|api|frontend|backend|full.?stack|data|machine learning|typescript|html|css|mongodb|postgres|rest|agile|scrum)\b/g) || [];
      const mentioned = (resumeText || '').toLowerCase();
      result.skillGaps = [...new Set(allKeywords.filter(k => !mentioned.includes(k)))].slice(0, 10);
    }
  } else {
    const roleEmbs = await getRoleEmbeddings();
    if (roleEmbs) {
      let bestRole = null;
      let bestSim = 0;
      for (const [role, emb] of Object.entries(roleEmbs)) {
        const sim = cosineSimilarity(resumeEmbedding, emb);
        if (sim > bestSim) {
          bestSim = sim;
          bestRole = role;
        }
      }
      result.bestFitRole = bestRole;
      result.jobMatchPercentage = bestRole ? Math.round(bestSim * 100) : null;
      result.strengthAreas = keywordDetails?.matchedTechnical?.slice(0, 8) || [];
      const roleDesc = bestRole ? ROLE_TEMPLATES[bestRole] : '';
      const roleTerms = (roleDesc || '').toLowerCase().split(/[\s,]+/).filter(Boolean);
      const mentioned = (resumeText || '').toLowerCase();
      result.skillGaps = [...new Set(roleTerms.filter(t => t.length > 3 && !mentioned.includes(t)))].slice(0, 10);
    }
  }

  const aiSkills = skillsSim * 100;
  const aiExperience = experienceSim * 100;
  const aiProjects = projectsSim * 100;
  const aiStructure = Math.min(100, structureSim * 100);

  const skillsCombined = aiSkills * 0.6 + keywordScores.skills * 0.4;
  const experienceCombined = aiExperience * 0.6 + keywordScores.experience * 0.4;
  const projectsCombined = aiProjects * 0.6 + keywordScores.projects * 0.4;
  const structureCombined = aiStructure * 0.6 + keywordScores.structure * 0.4;

  const weighted =
    (skillsCombined * 0.4) +
    (experienceCombined * 0.25) +
    (projectsCombined * 0.2) +
    (structureCombined * 0.15);
  const aiScore = Math.round(Math.max(0, Math.min(100, weighted)));
  result.atsScore = aiScore;
  console.log('🤖 AI SCORE:', aiScore);
  result.aiUsed = true;
  result.aiExplanation = generateAIExplanation(
    result.atsScore,
    result.bestFitRole,
    result.jobMatchPercentage,
    result.strengthAreas,
    result.skillGaps,
    Boolean(jobDescription && jobDescription.trim()),
    resumeText,
    keywordDetails
  );
  return result;
  } catch (err) {
    console.error('❌ AI FAILED – FALLING BACK TO KEYWORD ATS', err.message);
    return result;
  }
}

/**
 * Generates an intelligent fallback recruiter review locally when AI inference is unavailable.
 */
export function generateFallbackRecruiterReview(resumeText, atsScore, skills = [], missingSkills = []) {
  const score = atsScore || 0;
  const lowercaseText = (resumeText || '').toLowerCase();
  
  // Dynamic Strengths detection
  const strengths = [];
  if (score >= 75) {
    strengths.push('Overall profile demonstrates robust readiness for core engineering roles.');
  }
  if (skills.length >= 8) {
    strengths.push(`Strong technology breadth with solid exposure to ${skills.slice(0, 4).join(', ')}.`);
  } else if (skills.length >= 4) {
    strengths.push(`Good foundation in key domain tools including ${skills.slice(0, 3).join(', ')}.`);
  } else {
    strengths.push('Possesses fundamental knowledge of industry-standard tools.');
  }

  if (lowercaseText.includes('experience') || lowercaseText.includes('employment') || lowercaseText.includes('work history') || lowercaseText.includes('experience:')) {
    strengths.push('Professional experience section is present and structured with traditional timelines.');
  }
  if (lowercaseText.includes('project') || lowercaseText.includes('portfolio') || lowercaseText.includes('github.com')) {
    strengths.push('Showcases practical application of skills through hands-on project examples.');
  }
  if (lowercaseText.includes('bachelor') || lowercaseText.includes('master') || lowercaseText.includes('degree') || lowercaseText.includes('university')) {
    strengths.push('Clear educational background listed, meeting standard academic filter requirements.');
  }
  // Guarantee at least 2 strengths
  if (strengths.length < 2) {
    strengths.push('Clear contact details and structural sections present.');
    strengths.push('Basic technical toolkit is present.');
  }

  // Dynamic Weaknesses detection
  const weaknesses = [];
  const matches = (resumeText || '').match(/\b\d+%/g) || (resumeText || '').match(/\$\d+/g) || [];
  if (matches.length < 2) {
    weaknesses.push('Lack of quantifiable achievements or metrics to prove professional business impact.');
  }
  if (skills.length < 6) {
    weaknesses.push('Limited depth in modern frameworks and core library keywords.');
  }
  if (missingSkills.length > 3) {
    weaknesses.push(`Noticeable skill gaps in key role requirements: ${missingSkills.slice(0, 3).join(', ')}.`);
  }
  if (!lowercaseText.includes('certif')) {
    weaknesses.push('No professional certifications listed to validate domain expertise.');
  }
  if (resumeText && resumeText.length < 1200) {
    weaknesses.push('The resume content is brief; project and role descriptions could be expanded.');
  } else if (resumeText && resumeText.length > 5000) {
    weaknesses.push('The resume is very long; risk of diluting key search matches for ATS systems.');
  }
  // Guarantee at least 2 weaknesses
  if (weaknesses.length < 2) {
    weaknesses.push('Details on soft skills application could be highlighted more explicitly.');
    weaknesses.push('Project descriptions can emphasize target design and system-level challenges.');
  }

  // Dynamic Improvements recommendations
  const improvements = [];
  if (weaknesses.some(w => w.includes('quantifiable'))) {
    improvements.push('Incorporate bullet points with clear numerical metrics (e.g. "reduced latency by 25%", "managed 5 developers").');
  }
  if (weaknesses.some(w => w.includes('gaps') || w.includes('frameworks'))) {
    improvements.push(`Study and add fundamental proficiencies in: ${missingSkills.slice(0, 3).join(', ') || 'modern target framework tools'}.`);
  }
  if (weaknesses.some(w => w.includes('certifications'))) {
    improvements.push('Add relevant professional certifications (e.g. AWS Certified Developer, Scrum Master, or equivalent).');
  }
  if (weaknesses.some(w => w.includes('brief'))) {
    improvements.push('Expand on project challenges, outlining your specific contributions and architectural decisions.');
  }
  if (weaknesses.some(w => w.includes('very long'))) {
    improvements.push('Trim wordy sentences and restrict historical details to keep the resume strictly within 1-2 pages.');
  }
  // Guarantee at least 2 improvements
  if (improvements.length < 2) {
    improvements.push('Tailor keywords to match target roles to enhance semantic compatibility.');
    improvements.push('Use active action verbs (e.g. "Engineered", "Optimized", "Architected") to begin bullet points.');
  }

  // Round Chances Calculation
  const atsScreening = Math.round(score);
  const technicalRound = Math.max(30, Math.min(95, Math.round(score * 0.9 + (skills.length > 5 ? 10 : -10))));
  const hrRound = Math.max(40, Math.min(95, Math.round(score * 0.85 + 10)));
  const overall = Math.round((atsScreening + technicalRound + hrRound) / 3);

  return {
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    improvements: improvements.slice(0, 4),
    chances: {
      atsScreening,
      technicalRound,
      hrRound,
      overall
    },
    method: 'fallback'
  };
}

/**
 * Automatically generates a recruiter-style review using Hugging Face Inference API.
 */
export async function generateRecruiterReview(resumeText, atsScore, skills = [], missingSkills = [], jobDescription = '') {
  const token = process.env.HF_TOKEN || process.env.HF_API_KEY;
  const fallbackResult = generateFallbackRecruiterReview(resumeText, atsScore, skills, missingSkills);

  if (!token) {
    console.warn('AI: HF_TOKEN not set, returning fallback recruiter review');
    return fallbackResult;
  }

  // Build a concise prompt to describe target job context
  const jdSection = jobDescription ? `Target Job Description:\n${jobDescription.substring(0, 1000)}\n\n` : '';
  const skillsList = skills.join(', ');
  const missingSkillsList = missingSkills.slice(0, 6).join(', ');

  const prompt = `You are a Senior Technical Recruiter, ATS Expert, and Career Coach. 
Analyze the following candidate's resume information and provide a professional, constructive, and realistic evaluation.

ATS Score: ${atsScore}%
Candidate Skills: ${skillsList}
Potential Skill Gaps: ${missingSkillsList}
${jdSection}
Resume Text (First 3500 chars):
${resumeText.substring(0, 3500)}

Provide your response in raw JSON format. DO NOT output any markdown tags (like \`\`\`json) or conversational text. Return only the JSON object.
JSON structure must match this EXACT schema:
{
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "improvements": ["string", "string", "string"],
  "chances": {
    "atsScreening": number (between 0 and 100),
    "technicalRound": number (between 0 and 100),
    "hrRound": number (between 0 and 100),
    "overall": number (between 0 and 100)
  }
}
Strengths should highlight specific professional elements.
Weaknesses should be constructive criticisms.
Improvements should give actionable advice to fix the weaknesses.
Round chances must be realistic integers representing percentage likelihood of passing each interview stage.`;

  const models = [
    'Qwen/Qwen2.5-72B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'meta-llama/Llama-3-8B-Instruct'
  ];

  for (const model of models) {
    const url = `https://api-inference.huggingface.co/models/${model}`;
    console.log(`🤖 AI RECRUITER: Trying model ${model}...`);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.7,
            return_full_text: false
          },
          options: {
            use_cache: false,
            wait_for_model: true
          }
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!res.ok) {
        console.warn(`🤖 AI RECRUITER: Model ${model} failed with status ${res.status}`);
        continue;
      }

      const data = await res.json();
      let text = '';
      if (Array.isArray(data) && data[0]?.generated_text) {
        text = data[0].generated_text;
      } else if (data && typeof data === 'object' && data.generated_text) {
        text = data.generated_text;
      } else if (data && typeof data === 'string') {
        text = data;
      }

      if (text) {
        // Clean and parse JSON
        const parsed = extractJson(text);
        if (parsed && Array.isArray(parsed.strengths) && Array.isArray(parsed.weaknesses) && Array.isArray(parsed.improvements) && parsed.chances) {
          console.log(`🤖 AI RECRUITER: Success using model ${model}`);
          return {
            strengths: parsed.strengths.slice(0, 5),
            weaknesses: parsed.weaknesses.slice(0, 5),
            improvements: parsed.improvements.slice(0, 5),
            chances: {
              atsScreening: Number(parsed.chances.atsScreening || atsScore),
              technicalRound: Number(parsed.chances.technicalRound || 60),
              hrRound: Number(parsed.chances.hrRound || 70),
              overall: Number(parsed.chances.overall || 65)
            },
            method: 'ai'
          };
        }
      }
    } catch (err) {
      console.warn(`🤖 AI RECRUITER: Exception on model ${model}:`, err.message);
    }
  }

  console.warn('🤖 AI RECRUITER: AI generation failed. Falling back to local rules.');
  return fallbackResult;
}

/**
 * Clean and parse JSON from string helper
 */
function extractJson(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Attempt markdown block extraction
    const blockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (blockMatch) {
      try {
        return JSON.parse(blockMatch[1].trim());
      } catch (err) {
        // Fall through
      }
    }
    const firstBracket = trimmed.indexOf('{');
    const lastBracket = trimmed.lastIndexOf('}');
    if (firstBracket !== -1 && lastBracket !== -1) {
      try {
        return JSON.parse(trimmed.substring(firstBracket, lastBracket + 1));
      } catch (err) {
        // Fall through
      }
    }
    return null;
  }
}

/**
 * Perform point-based heuristic validation for resume criteria
 * @param {string} resumeText
 * @param {string} userName
 * @returns {object} { isResume, confidence, reason, method }
 */
export function runHeuristicValidation(resumeText, userName = '') {
  const lowerText = String(resumeText || '').toLowerCase();
  let score = 0;
  const breakdown = {};

  // 1. Email check (+10)
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const hasEmail = emailPattern.test(resumeText);
  if (hasEmail) {
    score += 10;
    breakdown.email = 10;
  } else {
    breakdown.email = 0;
  }

  // 2. Phone check (+10)
  const phonePattern = /(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
  const hasPhone = phonePattern.test(resumeText);
  if (hasPhone) {
    score += 10;
    breakdown.phone = 10;
  } else {
    breakdown.phone = 0;
  }

  // 3. Name check (+10)
  let hasName = false;
  if (userName) {
    const nameParts = userName.toLowerCase().split(/\s+/).filter(p => p.length > 2);
    if (nameParts.length > 0 && nameParts.every(part => lowerText.includes(part))) {
      hasName = true;
    }
  }
  if (!hasName) {
    const firstLines = String(resumeText || '').split('\n').map(l => l.trim()).filter(l => l.length > 0).slice(0, 5);
    for (const line of firstLines) {
      if (/^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,2}$/.test(line)) {
        hasName = true;
        break;
      }
    }
  }
  if (hasName) {
    score += 10;
    breakdown.name = 10;
  } else {
    breakdown.name = 0;
  }

  // 4. Skills check (+20)
  const hasSkillsSection = /(skills|technical skills|core competencies|expertise|technologies)/i.test(lowerText);
  const commonSkills = ['javascript', 'python', 'react', 'node', 'sql', 'html', 'css', 'java', 'c++', 'aws', 'docker', 'git'];
  const matchedSkillsCount = commonSkills.filter(s => lowerText.includes(s)).length;
  const hasSkills = hasSkillsSection || (matchedSkillsCount >= 3);
  if (hasSkills) {
    score += 20;
    breakdown.skills = 20;
  } else {
    breakdown.skills = 0;
  }

  // 5. Education check (+20)
  const hasEducation = /(education|academic|university|college|b\.tech|b\.com|mca|diploma|bachelor|master|phd)/i.test(lowerText);
  if (hasEducation) {
    score += 20;
    breakdown.education = 20;
  } else {
    breakdown.education = 0;
  }

  // 6. Experience check (+20)
  const hasExperience = /(experience|employment|work history|professional history|internship|responsibilities|software engineer|developer)/i.test(lowerText);
  if (hasExperience) {
    score += 20;
    breakdown.experience = 20;
  } else {
    breakdown.experience = 0;
  }

  // 7. Projects check (+20)
  const hasProjects = /(projects|project experience|portfolio|github\.com)/i.test(lowerText);
  if (hasProjects) {
    score += 20;
    breakdown.projects = 20;
  } else {
    breakdown.projects = 0;
  }

  const passed = score >= 60;
  
  let confidence = 0;
  if (passed) {
    confidence = Math.round(80 + ((score - 60) / 50) * 20);
  } else {
    confidence = Math.round(80 + ((60 - score) / 60) * 20);
  }

  const reason = passed 
    ? `Document passed heuristic checks with a score of ${score}/110.` 
    : `Document failed heuristic checks with a score of ${score}/110 (needed at least 60).`;

  console.log('🤖 HEURISTIC VALIDATOR:', { score, passed, confidence, reason, breakdown });

  return {
    isResume: passed,
    confidence,
    reason,
    method: 'heuristic'
  };
}

/**
 * Validate if text content is a resume using LLM with heuristic fallback
 * @param {string} resumeText
 * @param {string} userName
 * @returns {Promise<object>} { isResume, confidence, reason, method }
 */
export async function validateResumeWithAI(resumeText, userName = '') {
  const token = process.env.HF_TOKEN || process.env.HF_API_KEY;
  if (!token) {
    console.warn('AI: HF_TOKEN not set, performing heuristic validation fallback');
    return runHeuristicValidation(resumeText, userName);
  }

  const prompt = `You are an AI assistant that determines if a given document is a professional resume (also known as a CV).
Analyze the following document text and determine if it is genuinely a professional resume.

A professional resume must represent a person's professional profile, history, education, skills, or projects.
It should NOT be a:
- Question paper or assignment
- Lecture notes or study guide
- Research paper, article, or book chapter
- Bank statement, bill, invoice, or receipt
- Medical report
- Legal document
- Random text or placeholder document

Look for presence of contact info (name, email, phone, linkedin, github), education (e.g. B.Tech, B.Com, MCA, university, college), skills (e.g. Java, Python, React, SQL), work experience, projects, or certifications.

Document Text (first 4000 characters):
"${resumeText.substring(0, 4000)}"

Output only a valid JSON object. DO NOT output any markdown tags (like \`\`\`json) or conversational text. Return only the JSON object.
JSON format must be EXACTLY:
{
  "isResume": true or false,
  "confidence": <integer percentage between 0 and 100>,
  "reason": "<brief justification sentence>"
}
`;

  const models = [
    'Qwen/Qwen2.5-72B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.3',
    'meta-llama/Llama-3-8B-Instruct'
  ];

  for (const model of models) {
    const url = `https://api-inference.huggingface.co/models/${model}`;
    console.log(`🤖 AI VALIDATOR: Trying model ${model}...`);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.1,
            return_full_text: false
          },
          options: {
            use_cache: false,
            wait_for_model: true
          }
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (!res.ok) {
        console.warn(`🤖 AI VALIDATOR: Model ${model} failed with status ${res.status}`);
        continue;
      }

      const data = await res.json();
      let text = '';
      if (Array.isArray(data) && data[0]?.generated_text) {
        text = data[0].generated_text;
      } else if (data && typeof data === 'object' && data.generated_text) {
        text = data.generated_text;
      } else if (data && typeof data === 'string') {
        text = data;
      }

      if (text) {
        const parsed = extractJson(text);
        if (parsed && typeof parsed.isResume === 'boolean' && typeof parsed.confidence === 'number' && parsed.reason) {
          console.log(`🤖 AI VALIDATOR: Success using model ${model}`, parsed);
          return {
            isResume: parsed.isResume,
            confidence: parsed.confidence,
            reason: parsed.reason,
            method: 'ai'
          };
        }
      }
    } catch (err) {
      console.warn(`🤖 AI VALIDATOR: Exception on model ${model}:`, err.message);
    }
  }

  console.warn('🤖 AI VALIDATOR: AI validation failed or timed out. Falling back to heuristic rules.');
  return runHeuristicValidation(resumeText, userName);
}

export { ROLE_TEMPLATES };
