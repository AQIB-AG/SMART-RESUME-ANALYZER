# 🚀 Smart Resume Analyzer

An AI-powered, modern career preparation and resume analysis platform designed to help job seekers optimize their resumes, generate custom cover letters, and prepare for interviews.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## 🌟 Overview

**Smart Resume Analyzer** is an advanced career assistant that goes beyond simple keyword matching. By leveraging OCR (Optical Character Recognition) and NLP (Natural Language Processing), it parses resumes (including scanned PDFs), calculates a comprehensive ATS score, generates tailored cover letters, and creates role-specific mock interview questions customized directly to the candidate's actual projects and experience.

Featuring a ChatGPT-inspired sidebar, sleek dark mode, and interactive dashboards, it is a complete, production-ready career tool.

---

## 📄 Core Features

### 1. 📤 Resume Upload & Parsing
- **Format Support:** Full PDF and scanned document parsing.
- **OCR Pipeline:** OCR-enabled parser to extract raw text accurately from scanned resumes.
- **ATS Compatibility Scoring:** Instantly maps resume data to industry keywords and structures.

### 2. 🤖 ATS Resume Analysis
- **ATS Score:** Detailed score based on resume structural quality and content.
- **Quality & Keyword Analysis:** Identifies missing skills, formatting issues, and keyword optimization opportunities.
- **Actionable Recommendations:** Delivers targeted suggestions and resume insights to improve career alignment.

### 3. 📑 AI Cover Letter Generator
Generates personalized cover letters dynamically mapped to your skills, experience, and the target job description.
- **Context-Aware:** Adapts to Resume, Skills, Experience, Company Name, Job Title, and Job Description.
- **Interactive UI:** Supports editing the generated cover letter, copying to clipboard, and regenerating.
- **Exporting Options:** One-click export to `.pdf` or `.txt` files.

### 4. 🧠 AI Mock Interview Generator
Produces tailored interview questions mapped directly to your background and the target job role.
- **Adaptive Questions:** Generates technical, HR, or mixed interview questions.
- **Customizable Runs:** Select question counts (5, 10, 15) and difficulty levels (Easy, Medium, Hard).
- **Exporting Options:** One-click export to `.pdf` or `.txt` files.
- **Role-Awareness:** Fully adapts to roles such as:
  - Software Engineer / Full Stack Developer
  - Frontend / Backend Developer
  - Java / Python Developer
  - AI / Machine Learning / LLM Engineer
  - DevOps / Cloud Engineer
  - Data Scientist / MLOps / Cybersecurity / Blockchain / and many more.

---

## 🎨 UI & UX Highlights

- **Modern Dashboard:** Visual graphs, interactive scorecards, and clean visual progress bars.
- **ChatGPT-Inspired Sidebar:** Minimalist vertical collapse toggle (`◧`) that collapses/expands smoothly and saves preferences locally.
- **Dark Mode Support:** Harmonious dark theme for comfortable, late-night application use.
- **Responsive Layout:** Optimized navigation and structure for desktops, tablets, and mobile devices.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide React Icons, React Router v6.
- **Backend:** Node.js, Express.js, Multer (file handling).
- **AI & Processing:** Hugging Face API / Local Fallback Generator, Tesseract.js (OCR), PDF-parse.
- **Database:** MongoDB Atlas (Cloud Database) connected via Mongoose.

---

## 📁 Project Structure

```
├── backend/          # Express.js REST API
│   ├── src/
│   │   ├── routes/   # API routes (Auth, Resume, Jobs, Cover Letter)
│   │   ├── controllers/  # Core business logic
│   │   ├── middleware/   # JWT authentication & validation
│   │   └── utils/        # OCR & PDF parsers
│   └── package.json
│
├── frontend/         # React + Vite Client
│   ├── src/
│   │   ├── components/   # Sidebar, Navbar, ProtectedRoute
│   │   ├── context/      # Theme & Auth context state
│   │   ├── pages/        # Dashboard, Upload, Mock Interview, Profile
│   │   └── services/     # Axios API service layers
│   └── package.json
│
└── README.md
```

---

## ⚡ Key Highlights
- **OCR-enabled Resume Parsing:** Handles scanned templates with ease.
- **Tailored Interview Preparation:** Role and resume-aware question generation.
- **Document Exporting:** Export all AI outputs (Mock Interviews & Cover Letters) instantly to `.pdf` or `.txt`.
- **Sleek ChatGPT Toggle:** Full screen utilization with a single click.

---

## 🛣️ Future Roadmap
- [ ] **Learning Roadmap Generator:** Suggests courses and projects to bridge skill gaps.
- [ ] **GitHub Portfolio Analyzer:** Syncs and reviews public repositories to add projects automatically.
- [ ] **Resume Version Comparison:** Track progress and scores across multiple uploaded versions.
- [ ] **Interactive AI Recruiter Simulator:** Real-time chat simulation with simulated AI interviewers.
- [ ] **Career Readiness Score:** Composite score highlighting job market competitiveness.

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** 18 or higher.
- **MongoDB** local instance or MongoDB Atlas account.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in a `.env` file:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the client:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:5173`.

---

## 👤 Author

Developed with ❤️ by **Mohd Aqib**
*Passionate about AI-powered developer tools and career technology.*

---

## 📄 License

This project is licensed under the **ISC License**. See the `backend/package.json` file for more details.
