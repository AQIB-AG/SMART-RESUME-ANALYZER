import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Sparkles, Search, Target, Palette } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Unlock Your Career Potential with{' '}
              <span className="text-blue-600">AI Resume Analysis</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get instant feedback, perfect your skills, and land your dream job faster.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Analyze My Resume
              </Link>
              <Link
                to="#how-it-works"
                className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Unlock Your Potential with Our{' '}
              <span className="text-blue-600">Powerful Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how Smart Resume Analyzer gives you the edge in today's competitive job market with intelligent insights and actionable advice.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Sparkles, 
                title: 'AI-Powered Feedback', 
                desc: 'Receive instant, intelligent feedback on your resume\'s content, structure, and keyword optimization to stand out.' 
              },
              { 
                icon: Search, 
                title: 'ATS Optimization Check', 
                desc: 'Ensure your resume passes Applicant Tracking Systems with our comprehensive analysis for keywords and formatting.' 
              },
              { 
                icon: Target, 
                title: 'Skill Gap Identification', 
                desc: 'Identify missing skills and relevant industry keywords by comparing your resume against desired job descriptions.' 
              },
              { 
                icon: Palette, 
                title: 'Customizable Templates', 
                desc: 'Access a library of modern, professional templates and formatting tools to make your resume visually appealing.' 
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Smart Resume Analyzer Works</h2>
            <p className="text-xl text-gray-600">
              Our intuitive process helps you optimize your resume for maximum impact in three simple steps.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {/* Step 1 */}
            <div className="bg-white rounded-lg p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-64 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Upload Image</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-6xl font-bold text-blue-600">1</span>
                  <h3 className="text-2xl font-bold text-gray-900">Upload Your Resume</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Easily upload your resume in PDF, DOCX, or plain text format. Our secure system ensures your data is protected and ready for analysis in moments.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 order-2 md:order-1">
                <div className="w-64 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Analysis Image</span>
                </div>
              </div>
              <div className="flex-1 order-1 md:order-2">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-6xl font-bold text-blue-600">2</span>
                  <h3 className="text-2xl font-bold text-gray-900">AI Analysis</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Our advanced AI analyzes your resume for ATS compatibility, keyword optimization, skill gaps, and provides personalized recommendations.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-lg p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-64 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Results Image</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-6xl font-bold text-blue-600">3</span>
                  <h3 className="text-2xl font-bold text-gray-900">Get Results & Improve</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Receive detailed insights, skill gap analysis, and actionable recommendations to enhance your resume and increase your chances of landing interviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your <span className="text-blue-600">Perfect Plan</span>
            </h2>
            <p className="text-xl text-gray-600">
              Find the right subscription for your needs, whether you're a student, a professional, or leading a team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Basic features to get started with resume analysis.</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">$0<span className="text-lg text-gray-600">/month</span></div>
              <ul className="space-y-3 mb-8">
                {['Upload 3 resumes per month', 'Basic score analysis', 'Limited skill matching', 'Standard templates'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full text-center py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="bg-white border-2 border-blue-600 rounded-lg p-8 relative shadow-lg">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                Popular
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <p className="text-gray-600 mb-6">Advanced tools for serious job seekers.</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">$29<span className="text-lg text-gray-600">/month</span></div>
              <ul className="space-y-3 mb-8">
                {['Unlimited resume uploads', 'Detailed score breakdown', 'In-depth skill gap analysis', 'Customizable templates', 'AI-powered suggestions', 'Priority support'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full text-center py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Choose Pro Plan
              </Link>
            </div>

            {/* Team Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Team</h3>
              <p className="text-gray-600 mb-6">Collaborate and optimize resumes for your entire team.</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">$99<span className="text-lg text-gray-600">/month</span></div>
              <ul className="space-y-3 mb-8">
                {['All Pro features', 'Up to 5 team members', 'Collaborative workspaces', 'Centralized reporting', 'Dedicated account manager', 'Single Sign-On (SSO)'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full text-center py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Transform Your Resume?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of job seekers who are already improving their chances with Smart Resume Analyzer. Sign up today and get started!
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center text-gray-600">
          <p>© 2026 Smart Resume Analyzer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
