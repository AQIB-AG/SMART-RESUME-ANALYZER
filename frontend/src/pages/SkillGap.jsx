import { useState } from 'react';
import Navbar from '../components/Navbar';
import { TrendingUp, Target, BookOpen, Upload, BarChart3, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SkillGap = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-heading">Skill Gap Analysis</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Identify skills you need to develop
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50"
        >
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-heading">Analyze Your Skills</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Upload your resume and select a target job to identify skill gaps and get personalized recommendations.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Resume
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white rounded-xl font-semibold border border-gray-300 dark:border-charcoal-600 hover:shadow-md transition-all duration-300 flex items-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                View Analytics
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mt-8"
        >
          <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-heading">Matched Skills</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Skills in your resume that match job requirements.
            </p>
          </div>
          
          <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-heading">Missing Skills</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Skills required for the job that are missing from your resume.
            </p>
          </div>
          
          <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-heading">Learning Path</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Recommended courses and resources to develop missing skills.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SkillGap;

