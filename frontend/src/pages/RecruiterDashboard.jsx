import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { jobAPI } from '../services/api';
import { Briefcase, Plus } from 'lucide-react';

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getMyJobs();
      if (response.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Recruiter Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your job postings
            </p>
          </div>
          <Link
            to="/job-post"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Post New Job</span>
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Jobs Posted</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first job posting to get started
            </p>
            <Link
              to="/job-post"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Post Job
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {job.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    job.is_active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;

