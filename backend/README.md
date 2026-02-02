# Smart Resume Analyzer – Backend

Node.js + Express API with MongoDB and optional AI-powered resume analysis.

## Setup

1. Install dependencies: `npm install`
2. Create `.env` with at least:
   - `MONGO_URI` – MongoDB connection string
   - `JWT_SECRET` – Secret for JWT auth
   - `HF_TOKEN` (optional) – [Hugging Face](https://huggingface.co/settings/tokens) API token for **free** AI resume analysis (sentence-transformers/all-MiniLM-L6-v2). If not set, analysis uses keyword-based ATS only.
3. Run: `npm run dev` (or `npm start`)

## AI Resume Analysis

- When `HF_TOKEN` is set, the app uses Hugging Face’s free Inference API to compute semantic embeddings and:
  - ATS score (0–100) with weighted components: skills 40%, experience 25%, projects 20%, structure 15%
  - Best-fit role (Frontend, Backend, Full Stack, Data, etc.) or job-description match %
  - Skill gaps and strength areas
  - Human-readable AI explanation
- If the AI API fails, the backend falls back to keyword-based ATS without errors.
- Optional `jobDescription` can be sent with the resume (e.g. in the upload form) for tailored matching.
