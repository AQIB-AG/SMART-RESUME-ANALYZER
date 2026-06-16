import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/Users/aqib2/Downloads/resumewd/backend/.env' });

const UserSchema = new mongoose.Schema({
  email: String,
  first_name: String,
  last_name: String
}, { collection: 'users' });

const ResumeSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  fileName: String,
  originalFileName: String,
  resumeText: String
}, { collection: 'resumes' });

const User = mongoose.model('User', UserSchema);
const Resume = mongoose.model('Resume', ResumeSchema);

async function check() {
  const uri = process.env.MONGO_URI;
  console.log("Connecting to:", uri);
  await mongoose.connect(uri);
  console.log("Connected.");

  const user = await User.findOne({ email: 'test02@gmail.com' });
  if (!user) {
    console.log("User test02@gmail.com not found!");
    process.exit(1);
  }
  console.log("User:", user._id, user.email, user.first_name, user.last_name);

  const resumes = await Resume.find({ userId: user._id });
  console.log("Found resumes:", resumes.length);
  resumes.forEach(r => {
    console.log(`- ID: ${r._id}, Name: ${r.originalFileName || r.fileName}`);
  });

  await mongoose.disconnect();
}

check().catch(console.error);
