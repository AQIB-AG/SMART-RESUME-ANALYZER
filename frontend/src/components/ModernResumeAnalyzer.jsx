import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Zap, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { analysisAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ModernResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Allowed file types
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExtensions = ['.pdf', '.doc', '.docx'];

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Validate file
  const validateFile = (file) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return false;
    }

    // Check file type
    if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setError('Only PDF, DOC, and DOCX files are allowed');
      return false;
    }

    setError('');
    return true;
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setError('');
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setError('');
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  // Calculate score color based on value
  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  // Calculate score text color based on value
  const getScoreTextColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Calculate score text
  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent Match!';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };

  // Upload and analyze resume
  const analyzeResume = async () => {
    if (!isAuthenticated) {
      setError('Please log in to analyze your resume');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!validateFile(file)) {
      return;
    }

    setIsUploading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      // Use the API service
      const response = await analysisAPI.analyzeResume(formData);

      if (!response.success) {
        throw new Error(response.error || 'Analysis failed');
      }

      setResult({
        score: response.score,
        feedback: response.feedback
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto"
    >
      <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-2xl mb-4"
          >
            <TrendingUp className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
            Resume Analyzer
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Upload your resume for instant ATS compatibility analysis
          </p>
        </div>

        {/* Drag and Drop Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            isUploading
              ? 'border-cyan-400 bg-cyan-50/30 dark:bg-cyan-900/20 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse'
              : isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 scale-[1.02]'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {file ? file.name : 'Drag and drop your resume here'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              or
            </p>
            
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
            />
            
            {!file && (
              <motion.label
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                htmlFor="resume-upload"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <FileText className="w-5 h-5 mr-2" />
                Choose File
              </motion.label>
            )}

            {file && (
              <div className="mt-4 flex items-center justify-between max-w-md mx-auto">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-charcoal-700/50 rounded-lg px-4 py-2">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="truncate max-w-xs">{file.name}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium ml-2"
                >
                  Remove
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-center"
          >
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </motion.div>
        )}

        {/* Upload Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <motion.button
            whileHover={{ scale: file && !isUploading ? 1.02 : 1 }}
            whileTap={{ scale: file && !isUploading ? 0.98 : 1 }}
            onClick={analyzeResume}
            disabled={isUploading || !file}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center ${
              isUploading
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse'
                : isUploading || !file
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-cyan-500 hover:shadow-lg'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Your Resume...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Analyze Resume
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 space-y-8"
          >
            {/* Score Display */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="relative inline-block"
              >
                <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - result.score / 100)}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className={`text-4xl font-bold font-mono ${getScoreTextColor(result.score)}`}>
                      {result.score}%
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                      {getScoreText(result.score)}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Feedback */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="glass bg-white/50 dark:bg-charcoal-700/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-charcoal-600/50"
            >
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Analysis Feedback
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {result.feedback}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* File Type Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          Supported formats: PDF, DOC, DOCX • Max file size: 5MB
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ModernResumeAnalyzer;