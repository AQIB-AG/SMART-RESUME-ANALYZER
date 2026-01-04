import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl border-t border-white/20 dark:border-charcoal-700/50 py-12 px-4"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-heading mb-4">
              Smart Resume Analyzer
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              AI-powered resume optimization for job seekers. Transform your resume into a job-winning document.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 font-heading">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/#features" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</Link></li>
              <li><Link to="/#how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How It Works</Link></li>
              <li><Link to="/#pricing" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</Link></li>
              <li><Link to="/upload" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Upload Resume</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 font-heading">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</Link></li>
              <li><Link to="/help" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Help Center</Link></li>
              <li><Link to="/api" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">API</Link></li>
              <li><Link to="/docs" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Documentation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 font-heading">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</Link></li>
              <li><Link to="/partners" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Partners</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-charcoal-700/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-400">© 2026 Smart Resume Analyzer. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-6">
              <Link to="/privacy" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm">Privacy</Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm">Terms</Link>
              <Link to="/security" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm">Security</Link>
              <Link to="/cookies" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;