# MERN Stack Migration Plan

## Project Overview
Converting Flask/Python backend + HTML/CSS/JS frontend to a full MERN stack application.

## Target Architecture

```
project-root/
├── backend/          # Express.js REST API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/   # MongoDB schemas (placeholders)
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json
│   └── .env
│
└── frontend/         # React + Vite
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── services/
    │   ├── context/
    │   ├── hooks/
    │   ├── utils/
    │   └── App.jsx
    ├── package.json
    └── vite.config.js
```

## Feature Mapping

### Backend Routes (Flask → Express)

| Flask Route | Express Route | Method | Description |
|------------|---------------|--------|-------------|
| `/api/auth/register` | `/api/auth/register` | POST | User registration |
| `/api/auth/login` | `/api/auth/login` | POST | User login (JWT) |
| `/api/auth/logout` | `/api/auth/logout` | POST | User logout |
| `/api/auth/profile` | `/api/auth/profile` | GET/PUT | Get/Update profile |
| `/api/resumes/` | `/api/resumes` | POST/GET | Upload/List resumes |
| `/api/resumes/:id` | `/api/resumes/:id` | GET/PUT/DELETE | Resume operations |
| `/api/analysis/analyze-resume/:id` | `/api/analysis/analyze/:id` | GET | Analyze resume |
| `/api/analysis/match-resume-to-jobs/:id` | `/api/analysis/match/:id` | GET | Match resume to jobs |
| `/api/analysis/skill-gap-analysis/:id/:jobId` | `/api/analysis/skill-gap/:id/:jobId` | GET | Skill gap analysis |
| `/api/jobs/` | `/api/jobs` | POST/GET | Create/List jobs |
| `/api/jobs/:id` | `/api/jobs/:id` | GET/PUT/DELETE | Job operations |
| `/api/jobs/my-jobs` | `/api/jobs/my-jobs` | GET | Get recruiter's jobs |

### Frontend Pages (HTML → React)

| Old Template | New React Page | Route |
|-------------|----------------|-------|
| `index.html` | `Landing.jsx` | `/` |
| `login.html` | `Login.jsx` | `/login` |
| `register.html` | `Register.jsx` | `/register` |
| `dashboard.html` | `Dashboard.jsx` | `/dashboard` |
| `upload.html` | `Upload.jsx` | `/upload` |
| `jobs.html` | `Jobs.jsx` | `/jobs` |
| `skillgap.html` | `SkillGap.jsx` | `/skill-gap` |
| `job_post.html` | `JobPost.jsx` | `/job-post` |
| `recruiter_dashboard.html` | `RecruiterDashboard.jsx` | `/recruiter-dashboard` |
| `admin_dashboard.html` | `AdminDashboard.jsx` | `/admin-dashboard` |

## Authentication Flow

### Old (Flask Sessions)
- Session-based authentication
- `session['user_id']` stored server-side
- Cookies managed by Flask

### New (JWT)
- Token-based authentication
- JWT stored in `localStorage` or `httpOnly` cookies
- Token sent in `Authorization: Bearer <token>` header
- Refresh token mechanism for security

## API Response Structure

All APIs return consistent JSON:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Migration Steps

1. ✅ Create project structure
2. ✅ Set up Express backend with routes
3. ✅ Set up React frontend with Vite
4. ✅ Implement JWT authentication
5. ✅ Migrate API endpoints
6. ✅ Create React pages
7. ✅ Implement API service layer
8. ✅ Add React Router
9. ✅ Implement theme system
10. ✅ Testing & validation

## Commands

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
MONGODB_URI=mongodb://localhost:27017/resume_analyzer
UPLOAD_FOLDER=uploads
MAX_FILE_SIZE=5242880
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Checklist

- [ ] Backend Express server running
- [ ] All API endpoints functional
- [ ] JWT authentication working
- [ ] React app running
- [ ] All pages migrated
- [ ] API integration complete
- [ ] Theme switching works
- [ ] Routing functional
- [ ] Responsive design
- [ ] No Flask/Python dependencies

