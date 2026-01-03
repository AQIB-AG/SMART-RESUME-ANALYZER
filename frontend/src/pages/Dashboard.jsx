import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { resumeAPI } from '../services/api';
import { Upload, RefreshCw, Clock, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

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

  // Calculate average score
  const avgScore = resumes.length > 0
    ? Math.round(resumes.reduce((acc, r) => acc + (r.ats_score || 0), 0) / resumes.length)
    : 0;

  // Get score label and emoji
  const getScoreLabel = (score) => {
    if (score >= 80) return { label: 'Excellent', emoji: '😊' };
    if (score >= 60) return { label: 'Good', emoji: '🙂' };
    if (score >= 40) return { label: 'Fair', emoji: '😐' };
    return { label: 'Needs Work', emoji: '😔' };
  };

  const scoreInfo = getScoreLabel(avgScore);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Resume Score Card */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Resume Score</h2>
            <div className="flex flex-col items-center">
              {/* Circular Progress */}
              <div className="relative w-48 h-48 mb-4">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#3b82f6"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${(avgScore / 100) * 553} 553`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900">{avgScore}</div>
                    <div className="text-2xl">%</div>
                  </div>
                </div>
              </div>
              <div className="text-2xl mb-2">{scoreInfo.emoji}</div>
              <div className="text-xl font-semibold text-gray-900 mb-4">{scoreInfo.label}</div>
              <p className="text-gray-600 text-center text-sm mb-6">
                {avgScore >= 80
                  ? "Excellent Match! Your resume demonstrates a strong alignment with industry standards and target job descriptions. Keep up the great work!"
                  : avgScore >= 60
                  ? "Good progress! Your resume is on the right track. Consider adding more relevant keywords and skills to improve your score."
                  : "Your resume needs improvement. Focus on adding relevant skills, keywords, and quantifiable achievements."}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => navigate('/upload')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  Export Report
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
                  Share
                </button>
              </div>
              <Link
                to="/dashboard"
                className="mt-4 text-blue-600 hover:underline text-sm"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/upload')}
                className="w-full flex items-center justify-between p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5" />
                  <span className="font-semibold">Upload Resume</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Re-analyze Previous</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </button>
              <button className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">View Analysis History</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Analyses</h2>
          {resumes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No resumes analyzed yet.</p>
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Upload Your First Resume
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {resumes.slice(0, 6).map((resume) => (
                <div
                  key={resume.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/resume-result/${resume.id}`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {resume.ats_score || 0}%
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {resume.original_filename || 'Resume'}
                  </div>
                  <div className="text-xs text-gray-500 mb-4">
                    {new Date(resume.upload_date).toLocaleDateString()}
                  </div>
                  <Link
                    to={`/resume-result/${resume.id}`}
                    className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
