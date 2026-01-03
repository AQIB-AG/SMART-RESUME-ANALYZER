# Signup Implementation Guide

## ✅ Complete MERN Stack Signup Solution

### Frontend (React Component)

**File:** `frontend/src/pages/Register.jsx`

**Features:**
- ✅ Simple form with email and password fields
- ✅ Prevents page reload on form submission
- ✅ Sends POST request to `/api/auth/register`
- ✅ Sends JSON: `{ email, password }`
- ✅ Shows success/error alerts
- ✅ Console logging for debugging
- ✅ Loading state during request
- ✅ Auto-navigation to login on success

**API Endpoint:** `http://localhost:5000/api/auth/register`

### Backend (Express + MongoDB)

**Files Created/Updated:**
1. `backend/src/models/User.model.js` - MongoDB User schema
2. `backend/src/config/database.js` - MongoDB connection
3. `backend/src/controllers/auth.controller.js` - Updated with MongoDB
4. `backend/src/server.js` - Added MongoDB connection

**Features:**
- ✅ MongoDB integration with Mongoose
- ✅ Password hashing with bcrypt (automatic on save)
- ✅ Email validation
- ✅ Duplicate email checking
- ✅ JWT token generation
- ✅ Error handling

## 🚀 Setup Instructions

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install mongoose
```

**Frontend:**
Already has all dependencies.

### 2. Configure MongoDB

Update `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/resume_analyzer
```

Or use MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resume_analyzer
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# Make sure MongoDB is running
mongod
```

**Or use MongoDB Atlas** (cloud) - no local setup needed.

### 4. Start Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 📝 API Request/Response

### Request
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "role": "candidate"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Response (400/409/500)
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

## 🔍 Testing

1. **Open browser console** (F12)
2. **Fill form** with email and password
3. **Click "Sign Up"**
4. **Check console** for:
   - Request URL
   - Request data (password hidden)
   - Response status
   - Response data
5. **Check Network tab** for:
   - POST request to `/api/auth/register`
   - Request payload (JSON)
   - Response status code
   - Response body

## 🐛 Troubleshooting

### No Request Sent
- Check if form has `onSubmit={handleSubmit}`
- Check if button has `type="submit"`
- Check browser console for errors

### CORS Error
- Ensure backend has CORS enabled (already configured)
- Check `CORS_ORIGIN` in backend `.env` matches frontend URL

### MongoDB Connection Error
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env`
- Check MongoDB connection logs in backend console

### 401/403 Errors
- Check JWT_SECRET in backend `.env`
- Verify token is being sent in Authorization header

## 📋 Checklist

- [x] React form with email and password
- [x] POST request to `/api/auth/register`
- [x] JSON payload: `{ email, password }`
- [x] Prevents page reload
- [x] Shows alerts for success/error
- [x] Console logging
- [x] MongoDB integration
- [x] Password hashing
- [x] Error handling
- [x] CORS enabled

## 🎯 Next Steps

1. Test the signup flow
2. Implement login page (similar pattern)
3. Add email verification (optional)
4. Add password strength indicator (optional)
5. Add form validation feedback (optional)

