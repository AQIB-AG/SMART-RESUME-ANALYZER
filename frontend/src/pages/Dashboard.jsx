import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { resumeAPI, analysisAPI } from '../services/api';
import { Upload, FileText, TrendingUp, Target } from 'lucide-react';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your resumes and track your progress
          </p>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <Upload className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Resumes Yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Upload your first resume to get started with AI-powered analysis
            </p>
            <Link
              to="/upload"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Upload Resume
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8" />
                <span className="text-3xl font-bold">{resumes.length}</span>
              </div>
              <p className="text-blue-100">Total Resumes</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8" />
                <span className="text-3xl font-bold">
                  {Math.round(resumes.reduce((acc, r) => acc + (r.ats_score || 0), 0) / resumes.length) || 0}%
                </span>
              </div>
              <p className="text-purple-100">Avg ATS Score</p>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8" />
                <span className="text-3xl font-bold">12</span>
              </div>
              <p className="text-pink-100">Job Matches</p>
            </div>
          </div>
        )}

        {resumes.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Recent Resumes</h2>
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{resume.original_filename}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Uploaded {new Date(resume.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {resume.ats_score !== null ? (
                        <div className="text-2xl font-bold text-primary-600">
                          {resume.ats_score}%
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not analyzed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

