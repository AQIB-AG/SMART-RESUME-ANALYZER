import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { resumeAPI } from '../services/api';
import { Zap, Upload, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MockInterviewPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await resumeAPI.getAll();
      if (res.success) {
        const resumeList = res.data.resumes || [];
        setResumes(resumeList);
        
        if (resumeList.length > 0) {
          // Find the most recent resume
          const sorted = [...resumeList].sort(
            (a, b) => new Date(b.upload_date || b.createdAt) - new Date(a.upload_date || a.createdAt)
          );
          const latestId = sorted[0].id || sorted[0]._id;
          // Redirect immediately to the mock-interview tab of the latest resume
          navigate(`/resume-result/${latestId}?tab=mock-interview`, { replace: true });
        }
      } else {
        setError(res.error || 'Failed to fetch resumes');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading your resumes.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your profile data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20 dark:border-charcoal-700/50 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <Zap className="w-8 h-8 text-white animate-pulse" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 font-heading">
              AI Mock Interview
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
              {error ? error : "You don't have any uploaded resumes yet. To generate resume-based mock interview questions, please upload your resume first."}
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/upload')}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              <Upload className="w-5 h-5" />
              Upload Resume
            </motion.button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default MockInterviewPage;
