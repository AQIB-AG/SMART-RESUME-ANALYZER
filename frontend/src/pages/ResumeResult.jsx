import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { resumeAPI, analysisAPI } from '../services/api';
import { Download, Share2, CheckCircle, XCircle, TrendingUp, Target, Zap, BarChart3, FileText, ArrowRight, Flame, ThumbsUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ResumeResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    fetchResumeData();
  }, [id]);

  const fetchResumeData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [resumeRes, analysisRes] = await Promise.all([
        resumeAPI.getOne(id).catch((err) => ({ success: false, error: err })),
        analysisAPI.getSummary(id).catch(() => null)
      ]);

      if (resumeRes?.success && resumeRes?.data?.resume) {
        setResume(resumeRes.data.resume);
      } else {
        setResume(null);
      }

      if (analysisRes?.success && analysisRes?.data) {
        setAnalysis(analysisRes.data);
      } else {
        try {
          const analyzeRes = await analysisAPI.analyze(id);
          if (analyzeRes?.success && analyzeRes?.data) {
            setAnalysis(analyzeRes.data);
          } else {
            setAnalysis(null);
          }
        } catch (err) {
          console.error('Analysis fetch error:', err);
          setAnalysis(null);
        }
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      setFetchError(error?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analysis...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (fetchError || !resume) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {fetchError || 'Resume not found.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const aiUsed = analysis?.ai_used ?? resume.aiUsed ?? false;
  const atsScore =
    analysis?.ats_score ?? resume?.ats_score ?? resume?.atsScore ?? 0;
  const scoreSource = analysis?.score_source ?? (resume?.aiUsed ? 'ai' : 'keyword');
  const getScoreLabel = (s) => {
    if (s >= 80) return { label: 'Excellent Match!', emoji: '🔥', color: 'text-red-500' };
    if (s >= 60) return { label: 'Good', emoji: '😃', color: 'text-green-500' };
    return { label: 'Needs Improvement', emoji: '⚠️', color: 'text-yellow-500' };
  };

  const scoreInfo = getScoreLabel(atsScore);
  const matchedSkills = analysis?.extracted_skills ?? resume?.skills ?? [];
  const sectionsAnalysis = analysis?.sections_analysis ?? resume?.sections_analysis ?? {};
  const missingSkills = analysis?.skill_gaps ?? resume?.skillGaps ?? [];
  const aiExplanation = analysis?.ai_explanation ?? resume?.aiExplanation ?? '';
  const feedback = analysis?.feedback ?? resume?.feedback ?? '';
  const bestFitRole = analysis?.best_fit_role ?? resume?.bestFitRole;
  const jobMatchPercentage = analysis?.job_match_percentage ?? resume?.jobMatchPercentage;
  const strengthAreas = analysis?.strength_areas ?? resume?.strengthAreas ?? [];

  const genericRecommendations = [
    'Quantify achievements with specific metrics (e.g., "Increased revenue by 15%").',
    'Tailor your resume for each specific job application by highlighting relevant keywords.',
    'Consider adding a "Projects" section to showcase your practical experience.',
    'Refine your summary statement to be more impactful and career-goal oriented.',
    'Seek peer review for fresh perspectives and error checking.'
  ];

  // Generate chart data
  const generateChartData = () => {
    return [
      { name: 'ATS Score', value: atsScore },
      { name: 'Remaining', value: 100 - atsScore },
    ];
  };

  const COLORS = ['#6366f1', '#e5e7eb'];

  const skillChartData = [
    { name: 'Matched', value: Math.max(0, matchedSkills.length) },
    { name: 'Missing', value: Math.max(0, missingSkills.length) },
  ];

  const skillColors = ['#10b981', '#f59e0b'];

  return (
    <Layout>
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {analysis == null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl text-amber-800 dark:text-amber-200"
            >
              <p className="font-medium">
                Analysis data not found. Please re-analyze the resume from Upload to generate a full report.
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
              Resume Analysis Results
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed insights and recommendations to improve your resume
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Resume Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Resume Score</h2>
                  </div>
                  {aiUsed && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                      AI Analyzed
                    </span>
                  )}
                  {import.meta.env.DEV && scoreSource && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400" title="scoreSource">
                      [{scoreSource}]
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-48 h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={generateChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {generateChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold text-gray-900 dark:text-white">
                          {atsScore}%
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={`text-3xl mb-2 ${scoreInfo.color}`}>{scoreInfo.emoji}</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{scoreInfo.label}</div>
                  <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                    {atsScore >= 80
                      ? `Your resume is ${atsScore}% job-ready 🚀 Let's push it to 95%+`
                      : atsScore >= 60
                      ? `Your resume is ${atsScore}% job-ready. Good progress!`
                      : `Your resume is ${atsScore}% job-ready. Focus on adding relevant skills.`}
                  </p>
                  {(bestFitRole != null || jobMatchPercentage != null) && (
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      {bestFitRole != null && (
                        <span className="px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                          Best-fit: {bestFitRole}
                        </span>
                      )}
                      {jobMatchPercentage != null && (
                        <span className="px-3 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium">
                          Match: {jobMatchPercentage}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    <Download className="w-5 h-5" />
                    Export Report
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white rounded-xl font-semibold border border-gray-300 dark:border-charcoal-600 hover:shadow-md transition-all duration-300"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </motion.button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Analysis Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Matched Skills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Matched Skills</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  These are the key skills identified in your resume that align with your target roles.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  {matchedSkills.slice(0, 15).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium border border-green-200 dark:border-green-700/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={skillChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {skillChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={skillColors[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Missing Skill Suggestions / Skill gaps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                    {missingSkills.length ? 'Skill Gaps / Missing Skills' : 'Missing Skill Suggestions'}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {missingSkills.length
                    ? 'Consider adding or highlighting these skills to improve your match for the target role or job.'
                    : 'Consider adding these highly sought-after skills to enhance your resume for relevant job applications.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  {missingSkills.length > 0
                    ? missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium border border-yellow-200 dark:border-yellow-700/50"
                        >
                          {skill}
                        </span>
                      ))
                    : ['Relevant keywords for target role', 'Quantifiable achievements', 'Clear section headings', 'Contact & links'].map((s, idx) => (
                        <span key={idx} className="px-4 py-2 bg-gray-100 dark:bg-charcoal-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                          {s}
                        </span>
                      ))}
                </div>
              </motion.div>

              {/* AI Explanation / Feedback / Actionable Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                    {aiUsed ? 'AI Analysis & Recommendations' : 'Actionable Recommendations'}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {aiUsed
                    ? 'Recruiter-style feedback based on your resume and target role or job description.'
                    : "Follow these personalized steps to significantly improve your resume's impact and effectiveness."}
                </p>
                {aiUsed ? (
                  <div className="p-4 bg-white/30 dark:bg-charcoal-700/30 rounded-xl border border-white/40 dark:border-charcoal-600/50">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {aiExplanation || feedback || 'AI analysis completed successfully.'}
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {genericRecommendations.map((rec, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-4 p-4 bg-white/30 dark:bg-charcoal-700/30 rounded-xl border border-white/40 dark:border-charcoal-600/50"
                      >
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 flex-1">{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResumeResult;

