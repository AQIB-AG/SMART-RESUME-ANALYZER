import fetch from 'node-fetch'; // Wait, Node.js 18+ has global fetch, but we can import or use global fetch. Since this is ES module, we can just use the global fetch. Let's check package.json to be safe: it does not list node-fetch. Node v18+ supports global fetch, so we can use global fetch directly without importing!
import { buildCoverLetterPrompt, buildInterviewQuestionsPrompt } from '../utils/prompt-builder.js';
import { generateFallbackCoverLetter, generateFallbackQuestions } from '../utils/fallback-generator.js';

const MODELS = [
  'Qwen/Qwen2.5-72B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'meta-llama/Llama-3-8B-Instruct'
];

/**
 * Truncate/clean response text by removing prompt duplicates if returned by model
 */
function cleanModelOutput(generatedText, prompt) {
  if (!generatedText) return '';
  let cleaned = generatedText.trim();
  // Some models prepend the prompt in the output
  if (cleaned.startsWith(prompt)) {
    cleaned = cleaned.substring(prompt.length).trim();
  }
  // Remove possible leading markdown braces if returning raw JSON/text
  return cleaned;
}

/**
 * Call Hugging Face API for text generation with retry/fallback models
 */
async function callHuggingFace(prompt, parameters = {}) {
  const token = process.env.HF_TOKEN || process.env.HF_API_KEY;
  if (!token) {
    console.log('🤖 AI GENERATOR: HF_TOKEN is not set. Skipping Hugging Face API.');
    return null;
  }

  for (const model of MODELS) {
    const url = `https://api-inference.huggingface.co/models/${model}`;
    console.log(`🤖 AI GENERATOR: Attempting generation with model ${model}...`);
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
            max_new_tokens: parameters.max_new_tokens || 1000,
            temperature: parameters.temperature || 0.7,
            return_full_text: false,
            ...parameters
          },
          options: {
            use_cache: false
          }
        }),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000)
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`🤖 AI GENERATOR: Model ${model} returned error status ${res.status}:`, errText);
        continue; // Try next model
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
        const cleaned = cleanModelOutput(text, prompt);
        if (cleaned) {
          console.log(`🤖 AI GENERATOR: Success using model ${model}`);
          return cleaned;
        }
      }
    } catch (err) {
      console.warn(`🤖 AI GENERATOR: Exception while calling model ${model}:`, err.message);
    }
  }

  console.warn('🤖 AI GENERATOR: All Hugging Face model options failed or timed out.');
  return null;
}

/**
 * Main service method to generate cover letter
 */
export async function generateCoverLetter(resume, options) {
  const prompt = buildCoverLetterPrompt({ resume, ...options });
  
  // Try AI call
  const generated = await callHuggingFace(prompt, {
    max_new_tokens: 1200,
    temperature: 0.7
  });

  if (generated) {
    return {
      success: true,
      coverLetter: generated,
      method: 'ai'
    };
  }

  // Fallback local template
  console.log('🤖 AI GENERATOR: Using local fallback cover letter generator');
  const fallbackText = generateFallbackCoverLetter(resume, options);
  return {
    success: true,
    coverLetter: fallbackText,
    method: 'fallback'
  };
}

/**
 * Main service method to generate mock interview questions
 */
export async function generateInterviewQuestions(resume, options) {
  console.log("⚙️ AI GENERATOR SERVICE CALL:", { resumeId: resume._id || resume.id, ...options });
  
  const seed = Math.random().toString(36).substring(2, 10);
  const prompt = buildInterviewQuestionsPrompt({ resume, ...options, seed });
  
  console.log("📝 GENERATED FINAL PROMPT:\n" + prompt + "\n=========================================");

  // Try AI call
  const generated = await callHuggingFace(prompt, {
    max_new_tokens: 1500,
    temperature: 0.85
  });

  if (generated) {
    try {
      const parsedJson = extractJson(generated);
      if (parsedJson && Array.isArray(parsedJson.questions) && parsedJson.questions.length > 0) {
        return {
          success: true,
          questions: parsedJson.questions,
          method: 'ai'
        };
      }
    } catch (err) {
      console.error('🤖 AI GENERATOR: Failed to parse AI generated JSON questions. Output was:', generated);
    }
  }

  // Fallback local questions
  console.log("USING FALLBACK GENERATOR");
  const fallbackData = generateFallbackQuestions(resume, options);
  return {
    success: true,
    questions: fallbackData.questions,
    method: 'fallback'
  };
}

/**
 * Robust JSON extraction from text responses
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
    // Attempt bracket range extraction
    const firstBracket = trimmed.indexOf('{');
    const lastBracket = trimmed.lastIndexOf('}');
    if (firstBracket !== -1 && lastBracket !== -1) {
      try {
        return JSON.parse(trimmed.substring(firstBracket, lastBracket + 1));
      } catch (err) {
        // Fall through
      }
    }
    throw new Error('Unable to extract valid JSON from response string');
  }
}
