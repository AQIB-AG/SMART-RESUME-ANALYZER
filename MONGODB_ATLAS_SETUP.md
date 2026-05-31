# MongoDB Atlas Setup - Configuration Guide

## ✅ What Has Been Configured

### 1. Backend Environment File
**File Created:** `backend/.env`

```
# MongoDB Atlas Configuration
MONGO_URI=mongodb+srv://MONGO_CONNECTION_STRING_HERE

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret-change-this-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Upload Configuration
UPLOAD_FOLDER=uploads
MAX_FILE_SIZE=5242880

# AI Service (Hugging Face) - Optional
HF_TOKEN=your-huggingface-token-here
```

### 2. MongoDB Connection Code
**Location:** `backend/src/config/database.js`

The database connection is properly configured:
- Uses `process.env.MONGO_URI` from .env file
- Implements error handling with clear logging
- Reports connection status (host, database name, connection state)

### 3. Server Configuration
**Location:** `backend/src/server.js`

- ✅ `dotenv.config()` loads environment variables on startup
- ✅ `connectDB()` is called only when `MONGO_URI` is provided
- ✅ Falls back gracefully to "mock mode" if MongoDB is unavailable
- ✅ All routes are properly registered

### 4. User Model (Mongoose)
**Location:** `backend/src/models/User.model.js`

- ✅ Proper schema definition with validation
- ✅ Password hashing via bcryptjs pre-save hook
- ✅ Email uniqueness constraint
- ✅ Ready for MongoDB operations

---

## 🚀 Next Steps

### Step 1: Update MongoDB Connection String

Edit `backend/.env` and replace the placeholder with your actual MongoDB Atlas connection string:

**Before:**
```
MONGO_URI=mongodb+srv://MONGO_CONNECTION_STRING_HERE
```

**After (example):**
```
MONGO_URI=mongodb+srv://username:password@cluster0.abc123.mongodb.net/resume_analyzer?retryWrites=true&w=majority
```

Your connection string should:
- Start with `mongodb+srv://`
- Include username and password
- Point to your MongoDB Atlas cluster
- Include the database name (optional but recommended)

### Step 2: (IMPORTANT) Update JWT_SECRET

Replace the placeholder JWT_SECRET with a secure random string:

```
JWT_SECRET=your-secure-random-string-at-least-32-characters-long
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Test MongoDB Connection

Run the connection test script:

```bash
cd backend
node test-mongo-connection.js
```

**Expected output if successful:**
```
✅ SUCCESS: MongoDB Connected!
   Host: cluster0.abc123.mongodb.net
   Database: resume_analyzer
   State: Connected

✅ Your MongoDB Atlas setup is complete!
   You can now start the backend with: npm start
```

### Step 4: Start the Backend Server

```bash
cd backend
npm install  # If node_modules not installed
npm start    # Starts the server
```

**Expected output:**
```
🚀 Server running on http://localhost:5000
📁 Environment: development
✅ MongoDB Connected: cluster0.abc123.mongodb.net
✅ Database: resume_analyzer
✅ Connection State: Connected
```

### Step 5: Verify with Health Check

Test the API:

```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-05-31T..."
}
```

---

## 🔧 Troubleshooting

### Problem: "MongoDB not connected (running in mock mode)"
**Solution:** 
- Verify `MONGO_URI` is set in `.env`
- Check that the connection string doesn't include `MONGO_CONNECTION_STRING_HERE` placeholder
- Run `node test-mongo-connection.js` for detailed error messages

### Problem: "MongoDB connection error: authentication failed"
**Solution:**
- Verify username and password in connection string
- Check that credentials match your MongoDB Atlas user
- Ensure special characters in password are URL-encoded

### Problem: "MongoDB connection error: getaddrinfo ENOTFOUND cluster0..."
**Solution:**
- Verify cluster name in connection string
- Check that MongoDB Atlas cluster exists and is running
- Verify network connectivity to MongoDB Atlas

### Problem: "MongoDB connection error: connect ETIMEDOUT"
**Solution:**
- Add your IP address to MongoDB Atlas IP Whitelist
- In MongoDB Atlas: Network Access → Add IP Address
- Recommend: Add "0.0.0.0/0" for development (restrict in production)

### Problem: "JWT_SECRET is not configured"
**Solution:**
- Ensure `JWT_SECRET` is set in `.env` file
- Restart the server after updating `.env`
- The value must be a non-empty string

---

## 📝 Environment Variables Reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `MONGO_URI` | ✅ Yes | - | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ Yes | - | Secret key for JWT token signing |
| `PORT` | ❌ No | 5000 | Server port |
| `NODE_ENV` | ❌ No | development | Environment mode |
| `CORS_ORIGIN` | ❌ No | http://localhost:5173 | Frontend origin for CORS |
| `UPLOAD_FOLDER` | ❌ No | uploads | Resume upload directory |
| `MAX_FILE_SIZE` | ❌ No | 5242880 | Max upload size in bytes |
| `HF_TOKEN` | ❌ No | - | Hugging Face API token (optional) |

---

## 🎯 Files Modified/Created

✅ **Created:**
- `backend/.env` - Environment configuration file
- `backend/test-mongo-connection.js` - MongoDB connection test script

✅ **Verified (No changes needed):**
- `backend/src/server.js` - dotenv loading is correct
- `backend/src/config/database.js` - Connection code is correct
- `backend/src/models/User.model.js` - Schema is properly defined
- `backend/package.json` - All dependencies are listed

---

## ✨ Summary

Your backend is now configured for MongoDB Atlas! The connection logic is already in place and properly implemented. All you need to do is:

1. **Replace** the MongoDB URI placeholder with your actual connection string
2. **Generate** a secure JWT secret
3. **Test** the connection using the provided test script
4. **Start** the backend server

The authentication system (JWT + bcryptjs) is fully integrated and will work once MongoDB is connected.
