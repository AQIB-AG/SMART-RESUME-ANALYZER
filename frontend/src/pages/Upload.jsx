import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { analysisAPI } from '../services/api';
import { Upload as UploadIcon, FileText, CheckCircle, X, Cloud, Zap, Target, TrendingUp, ArrowRight, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MIN_LOADING_TIME = 10000;

const Upload = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [analyzingStep, setAnalyzingStep] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const analyzingSteps = [
    'Analyzing your resume with AI… This may take a few moments.',
    'Extracting skills...',
    'Calculating ATS score...',
    'Generating feedback...'
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    setError('');
    if (!allowedTypes.includes(ext)) {
      setError('Please upload a PDF, DOC, or DOCX file');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    if (isSubmitting || uploading) {
      return;
    }

    setIsSubmitting(true);
    setUploading(true);
    setError('');
    setResult(null);
    setAnalyzingStep(analyzingSteps[0]);
    const startTime = Date.now();

    const stepInterval = setInterval(() => {
      setAnalyzingStep(prev => {
        const currentIndex = analyzingSteps.indexOf(prev);
        if (currentIndex < analyzingSteps.length - 1) {
          return analyzingSteps[currentIndex + 1];
        }
        return prev;
      });
    }, 2500);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription.trim());
      }

      const response = await analysisAPI.analyzeResume(formData);
      clearInterval(stepInterval);
      const responseData = response?.data ?? response;

      if (response?.status >= 200 && response?.status < 300 && responseData?.success !== false) {
        const atsScore = responseData.ats_score;
        const remaining = Math.max(0, MIN_LOADING_TIME - (Date.now() - startTime));
        setTimeout(() => {
          setResult({
            ...responseData,
            ats_score: responseData.ats_score
          });
          localStorage.setItem('hasNewAnalysis', 'true');
          localStorage.setItem('analysisScore', String(atsScore ?? 0));
          window.dispatchEvent(new CustomEvent('newAnalysisComplete'));
          setUploading(false);
          setAnalyzingStep('');
          setIsSubmitting(false);
        }, remaining);
        return;
      }

      throw new Error(responseData?.error || 'Analysis failed');
    } catch (err) {
      clearInterval(stepInterval);
      console.error('Upload error details:', err);
      let errorMessage = 'Analysis failed. Please try again.';
      if (err?.response?.data) {
        const errorData = err.response.data;
        errorMessage = errorData?.error || errorData?.message || errorMessage;
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setUploading(false);
      setAnalyzingStep('');
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreTextColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
              Upload Your Resume
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Submit your resume to get an in-depth analysis. We'll provide a score, skill matches, and personalized recommendations to help you land your dream job.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 mb-8 shadow-lg border border-white/20 dark:border-charcoal-700/50"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-heading">Upload Your Resume File</h2>

            <div className="mb-6">
              <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job description (optional)
              </label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here for a tailored match score and skill gap analysis. Leave blank to match against role templates (Frontend, Backend, Full Stack, etc.)."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
              />
            </div>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                uploading
                  ? 'neon-border-analyzing bg-cyan-50/30 dark:bg-cyan-900/20'
                  : dragActive
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-400 scale-105' 
                  : 'border-gray-300 dark:border-charcoal-600 bg-white/30 dark:bg-charcoal-700/30'
              }`}
            >
              {!file ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block p-6 bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 rounded-2xl"
                  >
                    <Cloud className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-lg mb-2">
                    Drag & drop your resume here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Max file size: 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="file-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <motion.label
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    htmlFor="file-upload"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Choose File
                  </motion.label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Supported formats: PDF, DOC, DOCX</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-6"
                >
                  <div className="p-4 bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 rounded-2xl">
                    <FileText className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={removeFile}
                    className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl text-red-600 dark:text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Analyzing Status */}
            {uploading && analyzingStep && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-6 bg-gradient-to-r from-cyan-50/80 to-indigo-50/80 dark:from-cyan-900/20 dark:to-indigo-900/20 border border-cyan-200 dark:border-cyan-700/50 rounded-xl"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Loader2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-spin" />
                  <span className="text-cyan-700 dark:text-cyan-300 font-semibold text-lg">
                    {analyzingStep}
                  </span>
                </div>
                <div className="w-full bg-cyan-200 dark:bg-cyan-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </motion.div>
            )}

            {file && !uploading && !result && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={!(isSubmitting || uploading) ? { scale: 1.02 } : {}}
                whileTap={!(isSubmitting || uploading) ? { scale: 0.98 } : {}}
                onClick={handleUpload}
                disabled={uploading || isSubmitting}
                className="mt-6 w-full py-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Zap className="w-5 h-5" />
                Analyze My Resume
              </motion.button>
            )}

            {/* Results Display */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-8 space-y-6"
              >
                {/* Score Display */}
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="relative inline-block"
                  >
                    <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - (result.ats_score ?? 0) / 100)}`}
                        strokeLinecap="round"
                        className={`text-gradient-to-r ${getScoreColor(result.ats_score ?? 0)}`}
                        style={{
                          stroke: (result.ats_score ?? 0) >= 80 ? '#22c55e' : (result.ats_score ?? 0) >= 60 ? '#eab308' : '#ef4444'
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div>
                        <div className="flex items-center justify-center gap-2">
                          <span className={`text-4xl font-bold font-mono ${getScoreTextColor(result.ats_score ?? 0)}`}>
                            {result.ats_score ?? 0}%
                          </span>
                          {result.aiUsed && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                              AI Analyzed
                            </span>
                          )}
                        {import.meta.env.DEV && result.scoreSource && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400" title="scoreSource">
                            [{result.scoreSource}]
                          </span>
                        )}
                        </div>
                        <div className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                          {getScoreText(result.ats_score ?? 0)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Best-fit role & match % when AI used */}
                {result.bestFitRole != null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="flex flex-wrap gap-4 justify-center text-sm"
                  >
                    <span className="px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium">
                      Best-fit role: {result.bestFitRole}
                    </span>
                    {result.jobMatchPercentage != null && (
                      <span className="px-4 py-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 font-medium">
                        Job match: {result.jobMatchPercentage}%
                      </span>
                    )}
                  </motion.div>
                )}

                {/* Feedback / AI explanation - always render */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="glass bg-white/50 dark:bg-charcoal-700/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-charcoal-600/50"
                >
                  <div className="flex items-start gap-3">
                    <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        {result.aiUsed ? 'AI Analysis' : 'Analysis Feedback'}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        {result.aiUsed
                          ? (result.aiExplanation ?? result.ai_explanation ?? result.feedback ?? 'AI analysis completed successfully.')
                          : (result.feedback ?? 'AI analysis completed successfully.')}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Skill gaps - always render, with fallback */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="glass bg-white/50 dark:bg-charcoal-700/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-charcoal-600/50"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Suggested skills to add</h3>
                  <div className="flex flex-wrap gap-2">
                    {(result.skillGaps ?? result.skill_gaps ?? []).length > 0
                      ? (result.skillGaps ?? result.skill_gaps).map((s, i) => (
                          <span key={i} className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm">
                            {s}
                          </span>
                        ))
                      : <span className="text-gray-600 dark:text-gray-400 text-sm">No specific skill gaps identified. Keep building relevant experience.</span>}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                      setJobDescription('');
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="flex-1 min-w-[140px] py-3 bg-gray-200 dark:bg-charcoal-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-charcoal-600 transition-colors"
                  >
                    Analyze Another Resume
                  </motion.button>
                  {result.resumeId && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/resume-result/${result.resumeId}`)}
                      className="flex-1 min-w-[140px] py-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors"
                    >
                      View Full Report
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 min-w-[140px] py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    View Dashboard
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">
                What Our AI Will Analyze
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">ATS Compatibility</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Check if your resume passes ATS filters</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Keyword Optimization</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Identify missing job-relevant keywords</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Score Breakdown</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Detailed score with improvement tips</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <Target className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Skill Gap Analysis</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Identify skills you need to develop</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Actionable Recommendations</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Specific steps to improve your resume</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Format Optimization</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Suggestions for better layout and structure</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
