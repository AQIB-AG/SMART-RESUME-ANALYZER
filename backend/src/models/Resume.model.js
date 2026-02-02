import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  skills: [{
    type: String
  }],
  resumeText: {
    type: String
  },
  atsScore: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  originalFileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'failed'],
    default: 'uploaded'
  },
  // AI-powered analysis (optional; populated when HF_TOKEN is set)
  bestFitRole: { type: String },
  jobMatchPercentage: { type: Number },
  skillGaps: [{ type: String }],
  strengthAreas: [{ type: String }],
  aiExplanation: { type: String },
  aiUsed: { type: Boolean, default: false },
  jobDescriptionUsed: { type: String }
}, {
  timestamps: true
});

const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

export default Resume;