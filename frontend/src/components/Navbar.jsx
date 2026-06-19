import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Menu, X, User, Upload, BarChart3, Settings, FileText, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import UserMenu from './UserMenu';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Features', path: '/', hash: '#features' },
    { name: 'How It Works', path: '/', hash: '#how-it-works' },
    { name: 'Pricing', path: '/', hash: '#pricing' },
  ];

  const handleHashNavigation = (e, item) => {
    e.preventDefault();
    if (item.hash) {
      if (window.location.pathname === '/') {
        const element = document.getElementById(item.hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.location.href = `/${item.hash}`;
      }
    }
  };

  const authNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'Cover Letter', path: '/cover-letter', icon: FileText },
    { name: 'Mock Interview', path: '/mock-interview', icon: Brain },
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

        {/* ── DESKTOP: 3-column grid ── */}
        <div
          className="hidden md:grid w-full"
          style={{ gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', minHeight: '5rem' }}
        >
          {/* LEFT — Logo */}
          <Link to="/" className="flex items-center space-x-3 py-4">
            <img
              src="/assets/logo.png"
              alt="Smart Resume Analyzer Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="font-bold text-xl text-gray-900 dark:text-white font-heading whitespace-nowrap">
              Smart Resume Analyzer
            </span>
          </Link>

          {/* CENTER — Nav links (truly centered via justify-center on a 1fr column) */}
          <div className="flex items-center justify-center gap-5 px-4">
            {!isAuthenticated ? (
              <>
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.hash || item.path}
                    onClick={(e) => handleHashNavigation(e, item)}
                    className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium cursor-pointer whitespace-nowrap"
                  >
                    {item.name}
                  </a>
                ))}
              </>
            ) : (
              <>
                {authNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium flex items-center gap-1 whitespace-nowrap"
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* RIGHT — Theme toggle + auth buttons */}
          <div className="flex items-center space-x-3 py-4">
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
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium whitespace-nowrap"
                >
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold whitespace-nowrap"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            ) : (
              <UserMenu user={user} />
            )}
          </div>
        </div>

        {/* ── MOBILE: logo + hamburger ── */}
        <div className="flex md:hidden items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/assets/logo.png"
              alt="Smart Resume Analyzer Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center space-x-2">
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

        {/* ── MOBILE DRAWER ── */}
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
                    <a
                      key={item.name}
                      href={item.hash || item.path}
                      onClick={(e) => {
                        handleHashNavigation(e, item);
                        setIsMenuOpen(false);
                      }}
                      className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700 cursor-pointer"
                    >
                      {item.name}
                    </a>
                  ))}
                  <div className="flex flex-col space-y-3 pt-2">
                    <Link
                      to="/login"
                      className="px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-center"
                      onClick={() => setIsMenuOpen(false)}
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
                  <div className="pt-2 px-4">
                    <UserMenu user={user} />
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
