/**
 * AI-powered resume analysis using Hugging Face free inference API
 * Model: sentence-transformers/all-MiniLM-L6-v2
 * All AI logic stays in backend; free tier only.
 */

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
function generateAIExplanation(atsScore, bestFitRole, jobMatchPercentage, strengthAreas, skillGaps, hadJobDescription) {
  const parts = [];

  if (atsScore >= 80) {
    parts.push(`Your resume shows strong alignment with ${bestFitRole || 'your target role'}.`);
  } else if (atsScore >= 60) {
    parts.push(`Your resume has solid relevance to ${bestFitRole || 'the role'}, with room to strengthen key areas.`);
  } else if (atsScore >= 40) {
    parts.push(`Your resume has moderate fit for ${bestFitRole || 'the role'}. Highlighting more relevant experience and skills will improve your score.`);
  } else {
    parts.push(`Your resume would benefit from clearer alignment with ${bestFitRole || 'the target role'} and more relevant keywords and experience.`);
  }

  if (hadJobDescription && jobMatchPercentage != null) {
    parts.push(`Match to the job description: ${Math.round(jobMatchPercentage)}%.`);
  }

  if (strengthAreas && strengthAreas.length > 0) {
    parts.push(`Strengths include: ${strengthAreas.slice(0, 5).join(', ')}.`);
  }

  if (skillGaps && skillGaps.length > 0) {
    parts.push(`Consider adding or highlighting: ${skillGaps.slice(0, 5).join(', ')} to improve ATS and recruiter match.`);
  }

  parts.push('Use clear section headings, quantify achievements where possible, and tailor keywords to the role.');
  return parts.join(' ');
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
    Boolean(jobDescription && jobDescription.trim())
  );
  return result;
  } catch (err) {
    console.error('❌ AI FAILED – FALLING BACK TO KEYWORD ATS', err.message);
    return result;
  }
}

export { ROLE_TEMPLATES };
