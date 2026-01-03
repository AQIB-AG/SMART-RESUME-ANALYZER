# MERN Stack Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (optional - for now using mock data)

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
MONGODB_URI=mongodb://localhost:27017/resume_analyzer
UPLOAD_FOLDER=uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Running Both Servers

### Option 1: Separate Terminals
- Terminal 1: `cd backend && npm run dev`
- Terminal 2: `cd frontend && npm run dev`

### Option 2: Using npm-run-all (install globally)
```bash
npm install -g npm-run-all
```

Then from project root:
```bash
npm-run-all --parallel backend:dev frontend:dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Resumes
- `POST /api/resumes` - Upload resume
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/:id` - Get single resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Analysis
- `GET /api/analysis/analyze/:id` - Analyze resume
- `GET /api/analysis/match/:id` - Match resume to jobs
- `GET /api/analysis/skill-gap/:id/:jobId` - Skill gap analysis
- `GET /api/analysis/summary/:id` - Get analysis summary

### Jobs
- `POST /api/jobs` - Create job (recruiter/admin only)
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `PUT /api/jobs/:id` - Update job (recruiter/admin only)
- `DELETE /api/jobs/:id` - Delete job (recruiter/admin only)
- `GET /api/jobs/my-jobs` - Get recruiter's jobs

## Testing the Application

1. Start both servers
2. Visit `http://localhost:5173`
3. Register a new account
4. Upload a resume
5. View dashboard and analysis

## Troubleshooting

### Backend Issues
- Ensure port 5000 is not in use
- Check `.env` file exists and has correct values
- Verify all dependencies are installed

### Frontend Issues
- Clear browser cache
- Check that backend is running
- Verify API_BASE_URL in `.env` matches backend URL

### CORS Issues
- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check that both servers are running

## Next Steps

1. Connect MongoDB database
2. Replace mock data with real database operations
3. Implement actual AI analysis (integrate Python AI engine via API)
4. Add file storage (AWS S3 or similar)
5. Deploy to production

