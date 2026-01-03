import { useState } from 'react';
import Navbar from '../components/Navbar';
import { TrendingUp, Target, BookOpen } from 'lucide-react';

const SkillGap = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Skill Gap Analysis</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Identify skills you need to develop
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <p className="text-gray-600 dark:text-gray-300">
            Upload a resume and select a job to see skill gap analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkillGap;

