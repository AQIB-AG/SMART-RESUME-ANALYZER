# Smart Resume Analyzer - MERN Stack

A modern, full-stack resume analysis application built with the MERN stack (MongoDB, Express, React, Node.js).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Edit with your values
npm run dev
```

2. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

3. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
├── backend/          # Express.js REST API
│   └── src/
│       ├── routes/   # API routes
│       ├── controllers/  # Business logic
│       ├── middleware/   # Auth & validation
│       └── utils/       # Helpers
│
└── frontend/        # React + Vite
    └── src/
        ├── pages/   # Page components
        ├── components/  # Reusable components
        ├── context/     # React Context
        └── services/    # API calls
```

## 🔑 Key Features

- ✅ JWT Authentication
- ✅ Resume Upload & Analysis
- ✅ ATS Score Calculation
- ✅ Job Matching
- ✅ Skill Gap Analysis
- ✅ Role-based Access Control
- ✅ Light/Dark Theme
- ✅ Responsive Design

## 📚 Documentation

- [Migration Plan](./MERN_MIGRATION_PLAN.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Conversion Summary](./MERN_CONVERSION_SUMMARY.md)

## 🛠️ Tech Stack

**Backend:**
- Express.js
- JWT Authentication
- Multer (File Uploads)
- express-validator

**Frontend:**
- React 18
- Vite
- React Router v6
- Tailwind CSS
- Axios

## 📝 API Endpoints

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete API documentation.

## 🎯 Next Steps

1. Connect MongoDB database
2. Integrate AI analysis engine
3. Add file storage (AWS S3)
4. Deploy to production

---

**Status**: ✅ MERN Conversion Complete

