import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Upload, Sparkles, TrendingUp, Shield, Zap, Target } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI-Powered Resume Analysis & Intelligent Job Matching
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Get instant ATS scoring, comprehensive skill gap analysis, and intelligent job matching powered by advanced AI. Transform your career journey with data-driven insights.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/upload"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Analyze My Resume</span>
                </Link>
                <Link
                  to="#features"
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  View Features
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>ATS Compatible</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Real-time Analysis</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-semibold">Resume Dashboard</h3>
                      <p className="text-white/70 text-sm">Live Analysis Preview</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                        ATS: 87%
                      </span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                        12 Matches
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-white/80 text-sm">ATS Score</span>
                        <span className="text-white font-bold">87%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-white h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-2xl mb-1">🎯</div>
                        <div className="text-white text-xs">Skills</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-2xl mb-1">✨</div>
                        <div className="text-white text-xs">Grammar</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-2xl mb-1">🔑</div>
                        <div className="text-white text-xs">Keywords</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to optimize your resume and land your dream job
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: 'AI-Powered Analysis', desc: 'Advanced AI analyzes your resume for ATS compatibility and optimization' },
              { icon: TrendingUp, title: 'Skill Gap Analysis', desc: 'Identify missing skills and get personalized improvement recommendations' },
              { icon: Target, title: 'Job Matching', desc: 'Intelligent matching algorithm connects you with perfect job opportunities' },
              { icon: Shield, title: 'ATS Optimization', desc: 'Ensure your resume passes through applicant tracking systems' },
              { icon: Zap, title: 'Real-time Feedback', desc: 'Get instant feedback on grammar, keywords, and resume structure' },
              { icon: Upload, title: 'Easy Upload', desc: 'Simply upload your resume and get comprehensive analysis in seconds' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <feature.icon className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Resume?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of job seekers who have optimized their resumes and landed their dream jobs
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;

