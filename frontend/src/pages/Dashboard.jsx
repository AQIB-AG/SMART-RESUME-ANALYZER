import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { resumeAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Upload, RefreshCw, Clock, ArrowRight, TrendingUp, Target, CheckCircle, AlertCircle, FileText, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const skillGapSectionRef = useRef(null);
  const recentAnalysesRef = useRef(null);

  const isDark = theme === 'dark';
  const chartAxisColor = isDark ? '#22d3ee' : '#334155';
  const chartTickColor = isDark ? '#a5f3fc' : '#334155';
  const chartGridStroke = isDark ? 'rgba(34, 211, 238, 0.25)' : 'rgba(0, 0, 0, 0.1)';

  useEffect(() => {
    fetchResumes();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const truncateText = (text, maxLength = 12) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const fetchResumes = async () => {
    try {
      const response = await resumeAPI.getAll();
      if (response.success) {
        setResumes(response.data.resumes || []);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Average score from stored values only (no client-side score calculation)
  const avgScore = resumes.length > 0
    ? Math.round(resumes.reduce((acc, r) => acc + (r.ats_score ?? r.atsScore ?? 0), 0) / resumes.length)
    : 0;

  // Get score label and emoji
  const getScoreLabel = (score) => {
    if (score >= 80) return { label: 'Excellent', emoji: '🔥', color: 'text-red-500' };
    if (score >= 60) return { label: 'Good', emoji: '😃', color: 'text-green-500' };
    if (score >= 40) return { label: 'Fair', emoji: '⚠️', color: 'text-yellow-500' };
    return { label: 'Needs Improvement', emoji: '😔', color: 'text-red-500' };
  };

  const scoreInfo = getScoreLabel(avgScore);

  // Generate chart data
  const generateChartData = () => {
    if (resumes.length === 0) return [];
    
    // Slice latest 5 and reverse to show them in chronological order (left to right)
    const data = resumes.slice(0, 5).reverse().map((resume, index) => ({
      name: resume.original_filename || resume.originalFileName || `Resume ${index + 1}`,
      score: resume.ats_score ?? resume.atsScore ?? 0,
      date: new Date(resume.upload_date ?? resume.createdAt).toLocaleDateString()
    }));
    
    return data;
  };

  const chartData = generateChartData();

  const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  const getSkillGapData = () => {
    if (resumes.length === 0) return [];
    
    const latestResume = resumes[0];
    const detected = latestResume.skills || [];
    const missing = latestResume.skillGaps || latestResume.skill_gaps || [];
    
    if (detected.length === 0 && missing.length === 0) {
      return [];
    }
    
    // Compile all skills in the latest resume with details
    const allSkills = [
      ...detected.map((name, index) => ({ name, status: 'have', isGap: false, index })),
      ...missing.map((name, index) => ({ name, status: 'gap', isGap: true, index }))
    ];
    
    // Calculate frequencies across all user resumes
    allSkills.forEach(item => {
      let count = 0;
      resumes.forEach(r => {
        const list = item.isGap 
          ? (r.skillGaps || r.skill_gaps || []) 
          : (r.skills || []);
        if (list.includes(item.name)) {
          count++;
        }
      });
      item.frequency = count;
    });
    
    // Sort by frequency (descending), then by status ('have' first), then by original index (ascending)
    allSkills.sort((a, b) => {
      if (b.frequency !== a.frequency) {
        return b.frequency - a.frequency;
      }
      if (a.status !== b.status) {
        return a.status === 'have' ? -1 : 1;
      }
      return a.index - b.index;
    });
    
    const topLimit = 6;
    
    if (allSkills.length <= topLimit + 1) {
      return allSkills.map(item => ({
        name: item.name,
        value: item.frequency || 1,
        status: item.status
      }));
    }
    
    const topSkills = allSkills.slice(0, topLimit);
    const remainingSkills = allSkills.slice(topLimit);
    
    const othersValue = remainingSkills.reduce((sum, item) => sum + (item.frequency || 1), 0);
    
    const data = topSkills.map(item => ({
      name: item.name,
      value: item.frequency || 1,
      status: item.status
    }));
    
    data.push({
      name: 'Others',
      value: othersValue,
      status: 'others'
    });
    
    return data;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your resume analysis overview.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Resume Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1 glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-heading">Resume Score</h2>
            {resumes.length === 0 ? (
              <div className="flex flex-col items-center">
                {/* Circular Progress Placeholder */}
                <div className="relative w-40 h-40 mb-4 flex items-center justify-center">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="72"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="6 6"
                      className="text-gray-305 dark:text-charcoal-600"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-light text-gray-400 dark:text-gray-500">—</div>
                      <div className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">(No score yet)</div>
                    </div>
                  </div>
                </div>
                <div className="text-2xl mb-1 text-indigo-500">✨</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-3 text-center font-heading">Ready to Get Started?</div>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm mb-6 leading-relaxed">
                  Upload your first resume and unlock detailed ATS insights, AI recruiter feedback, and personalized recommendations.
                </p>
                <div className="flex gap-3 w-full mb-4">
                  <button
                    onClick={() => navigate('/upload')}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Resume
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-normal">
                    Your dashboard will update automatically after your first resume analysis.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Circular Progress */}
                <div className="relative w-40 h-40 mb-4">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="72"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-gray-200 dark:text-charcoal-700"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="72"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(avgScore / 100) * 452.39} 452.39`}
                      strokeLinecap="round"
                      className="text-indigo-600"
                      style={{
                        transition: 'stroke-dasharray 0.5s ease-in-out',
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">{avgScore}</div>
                      <div className="text-lg text-gray-600 dark:text-gray-300">%</div>
                    </div>
                  </div>
                </div>
                <div className={`text-3xl mb-2 ${scoreInfo.color}`}>{scoreInfo.emoji}</div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{scoreInfo.label}</div>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm mb-6 leading-relaxed">
                  {avgScore >= 80
                    ? `Your resume is ${avgScore}% job-ready 🚀 Let's push it to 95%+`
                    : avgScore >= 60
                    ? `Your resume is ${avgScore}% job-ready. Great progress! Consider adding more relevant keywords.`
                    : `Your resume is ${avgScore}% job-ready. Focus on adding relevant skills and quantifiable achievements.`}
                </p>
                <div className="flex gap-3 w-full mb-4">
                  <button
                    onClick={() => navigate('/upload')}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Export Report
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">AI Insights</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xs">
                    {avgScore >= 80
                      ? "Your resume demonstrates strong alignment with industry standards."
                      : avgScore >= 60
                      ? "Good progress! Adding more quantifiable achievements could boost your score."
                      : "Consider adding more relevant keywords and skills to improve your score."}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-heading">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/upload')}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl hover:shadow-xl transition-all duration-300 group"
              >
                <Upload className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">Upload Resume</span>
                <span className="text-sm opacity-80 mt-1">Analyze your resume</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => skillGapSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-cyan-500 to-electric-blue-500 text-white rounded-xl hover:shadow-xl transition-all duration-300 group"
              >
                <Target className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">Skill Gap</span>
                <span className="text-sm opacity-80 mt-1">Identify missing skills</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/cover-letter')}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 group"
              >
                <FileText className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">Cover Letter</span>
                <span className="text-sm opacity-80 mt-1">Generate ATS-friendly cover letters</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/mock-interview')}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 group"
              >
                <Mic className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">Mock Interview</span>
                <span className="text-sm opacity-80 mt-1">Generate resume-based questions</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => recentAnalysesRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-electric-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 group"
              >
                <TrendingUp className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">Analytics</span>
                <span className="text-sm opacity-80 mt-1">View detailed analytics</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/profile')}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 group"
              >
                <CheckCircle className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">Profile</span>
                <span className="text-sm opacity-80 mt-1">Manage your profile</span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Score Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-heading">Score Trends</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                  <XAxis dataKey="name" stroke={chartAxisColor} tick={{ fill: chartTickColor }} />
                  <YAxis stroke={chartAxisColor} tick={{ fill: chartTickColor }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }} 
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Skill Gap Analysis */}
          <motion.div
            ref={skillGapSectionRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50 flex flex-col justify-between"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-heading">Skill Gap Analysis</h2>
            {resumes.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-charcoal-700/20 rounded-xl border border-dashed border-gray-200 dark:border-charcoal-700">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-4 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30"
                >
                  <Target className="w-8 h-8 animate-pulse" />
                </motion.div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5 justify-center font-heading">
                  📊 Skill Gap Analysis
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                  Analyze your first resume to discover your skill strengths and improvement areas.
                </p>
              </div>
            ) : getSkillGapData().length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm">No skills details found in the latest resume.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getSkillGapData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={isMobile ? 55 : isTablet ? 65 : 75}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => {
                          const truncatedName = truncateText(name, isMobile ? 8 : 12);
                          return `${truncatedName} ${(percent * 100).toFixed(0)}%`;
                        }}
                      >
                        {getSkillGapData().map((entry, index) => {
                          const color = entry.status === 'have'
                            ? ['#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'][index % 5]
                            : entry.status === 'gap'
                            ? ['#ef4444', '#f97316', '#f59e0b', '#fbbf24', '#fcd34d'][index % 5]
                            : '#94a3b8'; // Grey for Others
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, entry) => {
                          const data = getSkillGapData();
                          const totalFreq = data.reduce((sum, d) => sum + d.value, 0);
                          const percent = totalFreq > 0 ? ((value / totalFreq) * 100).toFixed(0) : 0;
                          const statusText = entry.payload.status === 'have' 
                            ? ' (Have)' 
                            : entry.payload.status === 'gap' 
                            ? ' (Gap)' 
                            : '';
                          return [`${percent}%`, `${name}${statusText}`];
                        }}
                        contentStyle={{ 
                          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: '8px',
                          backdropFilter: 'blur(10px)',
                          color: isDark ? '#fff' : '#0f172a'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Responsive Legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2 select-none">
                  {getSkillGapData().map((entry, idx) => {
                    const color = entry.status === 'have'
                      ? ['#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'][idx % 5]
                      : entry.status === 'gap'
                      ? ['#ef4444', '#f97316', '#f59e0b', '#fbbf24', '#fcd34d'][idx % 5]
                      : '#94a3b8';
                    const statusText = entry.status === 'have' ? ' (Have)' : entry.status === 'gap' ? ' (Gap)' : '';
                    return (
                      <div 
                        key={idx} 
                        className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"
                        title={`${entry.name}${statusText}`}
                      >
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                        <span className="truncate max-w-[120px]">{entry.name}{statusText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Analyses */}
        <motion.div
          ref={recentAnalysesRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">Recent Analyses</h2>
            <button 
              onClick={() => navigate('/upload')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-300"
            >
              New Analysis
            </button>
          </div>
          
          {resumes.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No resumes analyzed yet.</p>
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Upload Your First Resume
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.slice(0, 6).map((resume, index) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/50 dark:bg-charcoal-700/50 rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer border border-white/30 dark:border-charcoal-600/50"
                  onClick={() => navigate(`/resume-result/${resume.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(resume.ats_score ?? resume.atsScore ?? 0)}%
                      </span>
                      {(resume.ai_used ?? resume.aiUsed) && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                          AI
                        </span>
                      )}
                      {import.meta.env.DEV && (resume.score_source ?? resume.scoreSource) && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400" title="scoreSource">
                          [{resume.score_source ?? resume.scoreSource}]
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 truncate">
                    {resume.original_filename ?? resume.originalFileName ?? 'Resume'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {new Date(resume.upload_date ?? resume.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;
