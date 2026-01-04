import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { jobAPI } from '../services/api';
import { Briefcase, MapPin, DollarSign, Clock, Users, Building2, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading job opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-heading">Job Opportunities</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover jobs that match your skills
          </p>
        </motion.div>

        {jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No Jobs Available</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Check back later for new opportunities
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</h3>
                  <div className="p-2 bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 rounded-lg">
                    <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {job.description}
                </p>
                <div className="space-y-3 mb-4">
                  {job.location && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                      {job.location}
                    </div>
                  )}
                  {job.job_type && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                      {job.job_type}
                    </div>
                  )}
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4 mr-2 text-indigo-500" />
                      ${job.salary_min || 'N/A'} - ${job.salary_max || 'N/A'}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.skills_required?.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-xs font-medium border border-indigo-200 dark:border-indigo-700/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Jobs;

