import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Calculate score text color based on value
  const getScoreTextColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calculate score text
  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent';
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
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Resume Analyzer
        </h2>

        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isUploading
              ? 'border-cyan-400 bg-cyan-50/30 dark:bg-cyan-900/20 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse'
              : isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
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
            <label
              htmlFor="resume-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 mr-2" />
              Choose File
            </label>
          )}

          {file && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <FileText className="w-4 h-4 mr-2" />
                <span>{file.name}</span>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-6">
          <button
            onClick={analyzeResume}
            disabled={isUploading || !file}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors flex items-center justify-center ${
              isUploading
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse'
                : isUploading || !file
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Resume'
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
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
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - result.score / 100)}`}
                    className={getScoreColor(result.score)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className={`text-3xl font-bold ${getScoreTextColor(result.score)}`}>
                      {result.score}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {getScoreText(result.score)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Analysis Feedback
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {result.feedback}
              </p>
            </div>
          </div>
        )}

        {/* File Type Info */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Supported formats: PDF, DOC, DOCX • Max file size: 5MB
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;