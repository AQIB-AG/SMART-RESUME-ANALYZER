import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { jobAPI } from '../services/api';
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getAll();
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Job Opportunities</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover jobs that match your skills
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Jobs Available</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Check back later for new opportunities
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {job.description}
                </p>
                <div className="space-y-2 mb-4">
                  {job.location && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.location}
                    </div>
                  )}
                  {job.job_type && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      {job.job_type}
                    </div>
                  )}
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4 mr-2" />
                      ${job.salary_min || 'N/A'} - ${job.salary_max || 'N/A'}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills_required?.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;

