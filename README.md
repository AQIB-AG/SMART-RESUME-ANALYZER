# Smart Resume Analyzer & Intelligent Job Matcher

This is a full-stack application for analyzing resumes using AI & data mining, matching candidates to jobs, providing skill gap analysis, and offering actionable improvement recommendations.

## Project Structure

The project is separated into two distinct parts:

### Backend (`/backend`)
- Flask API server
- Database models
- AI engine
- Business logic

### Frontend (`/frontend`)
- HTML templates
- Static assets (CSS, JS, images)
- Client-side logic

## Backend Setup

The backend is a Flask application that handles:

- User authentication and role management
- Resume upload and parsing
- AI-powered resume analysis
- Job matching algorithms
- Database operations

### Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Running the Backend

```bash
cd backend
python app.py
```

## Frontend Setup

The frontend contains:

- HTML templates for all pages
- CSS stylesheets
- JavaScript for client-side functionality
- Static assets

### Running the Frontend

The frontend is served by the Flask backend. When you run the Flask application, it will serve the frontend files automatically.

## Configuration

The application uses a SQLite database by default. You can change the database configuration in `backend/app.py`.

## API Endpoints

The backend exposes the following API endpoints:

- `/api/auth/*` - Authentication routes
- `/api/users/*` - User management
- `/api/resumes/*` - Resume operations
- `/api/jobs/*` - Job operations
- `/api/analysis/*` - AI analysis operations

## Technology Stack

### Backend
- Python Flask
- SQLAlchemy
- spaCy/NLTK
- scikit-learn
- Pandas/NumPy

### Frontend
- HTML5/CSS3
- JavaScript
- Bootstrap 5
- Chart.js

## Features

- Resume upload and parsing (PDF, DOC, DOCX)
- ATS compatibility scoring
- Skill extraction and gap analysis
- Job matching with similarity scoring
- Role-based dashboards (Candidate, Recruiter, Admin)
- Responsive design