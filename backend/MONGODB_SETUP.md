# MongoDB Atlas Setup Guide

## Connection Setup

To connect your Smart Resume Analyzer application to MongoDB Atlas, follow these steps:

### 1. Update the Database Password

1. In your MongoDB Atlas dashboard, find your database user's password
2. Replace `<DB_PASSWORD>` in the `.env` file with your actual database password
3. The connection string format should be:
   ```
MONGO_URI=mongodb+srv://akeeb:9059079093@cluster0.pf3s5fa.mongodb.net/smart_resume_analyzer?retryWrites=true&w=majority&appName=Cluster0
   ```

**Note:** If you see an authentication error like `bad auth : Authentication failed`, it means the connection logic is working correctly but the password needs to be updated with the actual database password from your MongoDB Atlas dashboard.

### 2. Environment Configuration

Make sure your `.env` file contains:
```
MONGO_URI=mongodb+srv://akeeb:9059079093@cluster0.pf3s5fa.mongodb.net/smart_resume_analyzer?retryWrites=true&w=majority&appName=Cluster0
```

### 3. IP Whitelist

Ensure that your IP address (or 0.0.0.0/0 for any IP) is whitelisted in your MongoDB Atlas dashboard.

### 4. Database User

Make sure the database user `akeeb` has the necessary permissions to read/write to the `smart_resume_analyzer` database.

## Connection Process

The application will automatically:
- Connect to MongoDB Atlas when `MONGO_URI` is present in the environment
- Create the database and collections automatically when data is inserted
- Use Mongoose for object modeling
- Handle async/await connections with proper error handling