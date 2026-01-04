import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Menu, X, Sparkles, User, Upload, BarChart3, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Features', path: '/#features' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Pricing', path: '/#pricing' },
  ];

  const authNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/20 dark:border-charcoal-700/50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white font-heading">
              Smart Resume Analyzer
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            ) : (
              <div className="flex items-center space-x-6">
                {authNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium flex items-center gap-1"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </motion.button>

              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium hidden md:block">
                    {user?.email?.split('@')[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
          >
            <div className="flex flex-col space-y-3 pt-4">
              {!isAuthenticated ? (
                <>
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="flex flex-col space-y-3 pt-2">
                    <Link
                      to="/login"
                      className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {authNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  ))}
                  <div className="flex items-center gap-3 pt-2 px-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {user?.email?.split('@')[0]}
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
