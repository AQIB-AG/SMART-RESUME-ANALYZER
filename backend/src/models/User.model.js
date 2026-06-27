import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  first_name: {
    type: String,
    default: ''
  },
  last_name: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter', 'admin'],
    default: 'candidate'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  // Profile Fields
  profilePicture: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  college: {
    type: String,
    default: ''
  },
  aboutMe: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: ''
  },
  portfolio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  resumeHeadline: {
    type: String,
    default: ''
  },
  careerGoal: {
    type: String,
    default: ''
  },
  // Settings Preferences
  resumeAnalysisNotifications: {
    type: Boolean,
    default: true
  },
  coverLetterNotifications: {
    type: Boolean,
    default: true
  },
  mockInterviewNotifications: {
    type: Boolean,
    default: true
  },
  browserNotifications: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  profileVisibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  // Activity Logging & Counters
  activities: [{
    type: { type: String, required: true },
    details: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  }],
  coverLettersCount: {
    type: Number,
    default: 0
  },
  mockInterviewsCount: {
    type: Number,
    default: 0
  },
  // Session details
  lastLogin: {
    type: Date
  },
  loginDevice: {
    type: String,
    default: 'Web Browser'
  },
  savedCoverLetters: [{
    title: { type: String, default: 'Untitled Cover Letter' },
    companyName: { type: String, default: '' },
    roleTitle: { type: String, default: '' },
    content: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }],
  savedMockInterviews: [{
    role: { type: String, default: '' },
    difficulty: { type: String, default: 'Medium' },
    questions: [{
      question: { type: String },
      answer: { type: String, default: '' }
    }],
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password with cost of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;

