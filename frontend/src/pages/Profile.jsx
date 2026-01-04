import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Building, Edit2, User, Mail, Calendar, MapPin, Award, Briefcase, Settings, Shield, Globe, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Mock data for education and experience (replace with actual API data when available)
  const education = [
    {
      degree: 'Master of Science in Computer Science',
      institution: 'Stanford University',
      year: '2018',
      details: 'Specialized in Artificial Intelligence',
      gpa: 'GPA: 3.9/4.0'
    },
    {
      degree: 'Bachelor of Technology in Computer Engineering',
      institution: 'University of California, Berkeley',
      year: '2016',
      details: 'Graduated with Honors',
      awards: "Dean's List 2014, 2015"
    }
  ];

  const experience = [
    {
      title: 'Senior Software Developer',
      company: 'Tech Solutions Inc.',
      period: 'Jan 2020 - Present',
      responsibilities: [
        'Led development of a new microservices architecture, improving system scalability by 40%.',
        'Mentored junior developers and conducted code reviews.',
        'Implemented CI/CD pipelines, reducing deployment time by 25%.'
      ]
    }
  ];

  const skills = ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'MongoDB'];

  const stats = [
    { label: 'Resumes Analyzed', value: 12 },
    { label: 'Average Score', value: '78%' },
    { label: 'Skill Matches', value: 85 },
    { label: 'Improvement Tips', value: 24 },
  ];

  return (
    <Layout>
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account and view your analytics</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 flex items-center justify-center mb-4">
                    <span className="text-white text-3xl font-bold">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {profile?.first_name && profile?.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : user?.email || 'User'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">Software Engineer</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Member since 2023</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm">Joined: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm">San Francisco, CA</span>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditing(!editing)}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  <Edit2 className="w-5 h-5" />
                  <span>Edit Profile</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-heading">Your Analytics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass bg-white/50 dark:bg-charcoal-700/50 rounded-xl p-4 text-center border border-white/30 dark:border-charcoal-600/50"
                    >
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Skills Card */}
              <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-heading">Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium border border-indigo-200 dark:border-indigo-700/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Education Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Education</h2>
              </div>
              <div className="space-y-6">
                {education.map((edu, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-l-4 border-indigo-500 pl-6 py-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-indigo-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{edu.degree}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-1">{edu.institution}, {edu.year}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{edu.details}</p>
                    {edu.gpa && <p className="text-sm text-gray-500 dark:text-gray-400">{edu.gpa}</p>}
                    {edu.awards && <p className="text-sm text-gray-500 dark:text-gray-400">{edu.awards}</p>}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Experience Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Experience</h2>
              </div>
              <div className="space-y-6">
                {experience.map((exp, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-l-4 border-indigo-500 pl-6 py-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="w-4 h-4 text-indigo-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{exp.title}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-1">{exp.company}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{exp.period}</p>
                    <ul className="space-y-2">
                      {exp.responsibilities.map((resp, rIdx) => (
                        <li key={rIdx} className="text-gray-600 dark:text-gray-300 flex items-start gap-2 text-sm">
                          <span className="text-indigo-500 mt-1">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

