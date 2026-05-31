import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 MongoDB Connection Test');
console.log('========================================');
console.log(`📁 Working directory: ${process.cwd()}`);
console.log(`📄 .env file path: ${path.join(__dirname, '.env')}`);
console.log('');

// Check environment variables
console.log('✓ Environment Variables:');
console.log(`  - MONGO_URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ NOT SET'}`);
console.log(`  - JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET'}`);
console.log(`  - PORT: ${process.env.PORT || '5000 (default)'}`);
console.log(`  - NODE_ENV: ${process.env.NODE_ENV || 'development (default)'}`);
console.log('');

// Test MongoDB connection
if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('MONGO_CONNECTION_STRING_HERE')) {
  console.log('❌ ERROR: MONGO_URI not properly configured');
  console.log('');
  console.log('📋 NEXT STEPS:');
  console.log('1. Replace "mongodb+srv://MONGO_CONNECTION_STRING_HERE" in .env with your actual MongoDB Atlas connection string');
  console.log('2. Your connection string should look like:');
  console.log('   mongodb+srv://username:password@clustername.mongodb.net/dbname?retryWrites=true&w=majority');
  console.log('');
  process.exit(1);
}

console.log('🔗 Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(conn => {
    console.log('✅ SUCCESS: MongoDB Connected!');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log('');
    console.log('✅ Your MongoDB Atlas setup is complete!');
    console.log('   You can now start the backend with: npm start');
    console.log('');
    process.exit(0);
  })
  .catch(error => {
    console.log('❌ ERROR: Failed to connect to MongoDB');
    console.log(`   ${error.message}`);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Verify your connection string is correct');
    console.log('2. Check that MongoDB Atlas cluster is running');
    console.log('3. Check network access in MongoDB Atlas (IP whitelist)');
    console.log('4. Verify credentials (username/password) are correct');
    console.log('');
    process.exit(1);
  });
