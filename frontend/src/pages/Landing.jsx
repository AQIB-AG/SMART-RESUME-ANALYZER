import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ModernResumeAnalyzer from '../components/ModernResumeAnalyzer';
import { Sparkles, Search, Target, Palette, ArrowRight, Check, Star, Zap, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Handle hash navigation for smooth scrolling
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-electric-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Resume Analysis
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-electric-blue-500 to-cyan-500 bg-clip-text text-transparent mb-6 font-heading">
                Unlock Your Career Potential
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Get instant AI-powered feedback, perfect your skills, and land your dream job faster with our intelligent resume analysis platform.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-electric-blue-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 flex items-center gap-2 group"
                  >
                    Analyze My Resume
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="#how-it-works"
                    className="px-8 py-4 bg-white dark:bg-charcoal-800 text-indigo-600 dark:text-indigo-300 border-2 border-indigo-600 dark:border-indigo-500 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 flex items-center gap-2 group"
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
              
              <div className="flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-indigo-500 fill-current" />
                  <span>50k+ Users</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-cyan-500 fill-current" />
                  <span>85% Success Rate</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resume Analyzer Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50/50 to-cyan-50/50 dark:from-indigo-900/10 dark:to-cyan-900/10">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
              Try Our <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">Resume Analyzer</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Upload your resume and get instant AI-powered analysis with actionable feedback to improve your job prospects.
            </p>
          </motion.div>
          
          <div className="flex justify-center">
            <ModernResumeAnalyzer />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
              Powerful <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">AI Features</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover how Smart Resume Analyzer gives you the edge in today's competitive job market with intelligent insights and actionable advice.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Sparkles, 
                title: 'AI-Powered Feedback', 
                desc: 'Receive instant, intelligent feedback on your resume\'s content, structure, and keyword optimization to stand out.',
                color: 'from-indigo-500 to-electric-blue-500'
              },
              { 
                icon: Search, 
                title: 'ATS Optimization Check', 
                desc: 'Ensure your resume passes Applicant Tracking Systems with our comprehensive analysis for keywords and formatting.',
                color: 'from-cyan-500 to-electric-blue-500'
              },
              { 
                icon: Target, 
                title: 'Skill Gap Identification', 
                desc: 'Identify missing skills and relevant industry keywords by comparing your resume against desired job descriptions.',
                color: 'from-electric-blue-500 to-cyan-500'
              },
              { 
                icon: Palette, 
                title: 'Customizable Templates', 
                desc: 'Access a library of modern, professional templates and formatting tools to make your resume visually appealing.',
                color: 'from-indigo-500 to-cyan-500'
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-charcoal-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 dark:border-charcoal-700 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-charcoal-900">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
              How It <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Our intuitive process helps you optimize your resume for maximum impact in three simple steps.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto space-y-16">
            {[
              {
                step: 1,
                title: 'Upload Your Resume',
                desc: 'Easily upload your resume in PDF, DOCX, or plain text format. Our secure system ensures your data is protected and ready for analysis in moments.',
                color: 'indigo',
                reverse: false,
                image: 'https://media.istockphoto.com/id/1402436756/photo/uploading-documents-from-folder-open-file-folder-with-flying-blank-documents-with-laptop.webp'
              },
              {
                step: 2,
                title: 'AI Analysis',
                desc: 'Our advanced AI analyzes your resume for ATS compatibility, keyword optimization, skill gaps, and provides personalized recommendations.',
                color: 'cyan',
                reverse: true,
                image: 'https://plus.unsplash.com/premium_photo-1681426690743-1a2f26db94fa'
              },
              {
                step: 3,
                title: 'Get Results & Improve',
                desc: 'Receive detailed insights, skill gap analysis, and actionable recommendations to enhance your resume and increase your chances of landing interviews.',
                color: 'electric-blue',
                reverse: false,
                image: 'https://plus.unsplash.com/premium_vector-1761955857847-932ea41dc1da'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: item.reverse ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center gap-12 ${item.reverse ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-shrink-0 w-full md:w-1/2">
                  <motion.div
                    initial={{ opacity: 0, x: item.reverse ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl transform rotate-3 blur-lg opacity-30"></div>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl glass border border-white/20">
                        {/* Image Rendering */}
                        <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                        />
                    </div>
                  </motion.div>
                </div>
                
                <div className="w-full md:w-1/2">
                  <div className="flex items-center gap-6 mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r from-${item.color}-500 to-${item.color === 'indigo' ? 'electric-blue' : item.color === 'cyan' ? 'electric-blue' : 'cyan'}-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl`}>
                      {item.step}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
                  >
                    Start Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-charcoal-800 dark:to-navy-900">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
              Loved by <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">Job Seekers</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what our users say about their experience with Smart Resume Analyzer.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Software Engineer',
                content: 'This platform helped me identify critical gaps in my resume. I landed my dream job at Google within 2 weeks!',
                rating: 5
              },
              {
                name: 'Michael Chen',
                role: 'Product Manager',
                content: 'The AI feedback was incredibly detailed and actionable. My interview rate increased by 300% after using this tool.',
                rating: 5
              },
              {
                name: 'Emily Rodriguez',
                role: 'Marketing Director',
                content: 'Finally, a tool that understands what recruiters really look for. My resume score went from 45% to 92%!',
                rating: 5
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-charcoal-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-charcoal-700"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white dark:bg-charcoal-900">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-heading">
              Choose Your <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">Perfect Plan</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Find the right subscription for your needs, whether you're a student, a professional, or leading a team.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-charcoal-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-charcoal-700"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Free</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Basic features to get started with resume analysis.</p>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-6">$0<span className="text-lg text-gray-600 dark:text-gray-400">/month</span></div>
              <ul className="space-y-4 mb-8">
                {['Upload 3 resumes per month', 'Basic score analysis', 'Limited skill matching', 'Standard templates'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full text-center py-3 border-2 border-gray-300 dark:border-charcoal-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-charcoal-700 transition-colors"
              >
                Get Started Free
              </Link>
            </motion.div>

            {/* Pro Plan - Highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-2xl p-8 shadow-xl border-2 border-indigo-200 dark:border-indigo-500 relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pro</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Advanced tools for serious job seekers.</p>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-6">$29<span className="text-lg text-gray-600 dark:text-gray-400">/month</span></div>
              <ul className="space-y-4 mb-8">
                {['Unlimited resume uploads', 'Detailed score breakdown', 'In-depth skill gap analysis', 'Customizable templates', 'AI-powered suggestions', 'Priority support'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full text-center py-3 bg-gradient-to-r from-indigo-600 to-electric-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Choose Pro Plan
              </Link>
            </motion.div>

            {/* Team Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-charcoal-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-charcoal-700"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Team</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Collaborate and optimize resumes for your entire team.</p>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-6">$99<span className="text-lg text-gray-600 dark:text-gray-400">/month</span></div>
              <ul className="space-y-4 mb-8">
                {['All Pro features', 'Up to 5 team members', 'Collaborative workspaces', 'Centralized reporting', 'Dedicated account manager', 'Single Sign-On (SSO)'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full text-center py-3 border-2 border-gray-300 dark:border-charcoal-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-charcoal-700 transition-colors"
              >
                Contact Sales
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-electric-blue-500">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading">
              Ready to Transform Your Resume?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who are already improving their chances with Smart Resume Analyzer. Sign up today and get started!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/demo"
                  className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors flex items-center gap-2 group"
                >
                  Watch Demo
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
