import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Upload,
  User,
  Settings,
  X,
  Home,
  FileText,
  Brain
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Sidebar = ({ isOpen, onClose, isCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload Resume' },
    { path: '/cover-letter', icon: FileText, label: 'Cover Letter Generator' },
    { path: '/mock-interview', icon: Brain, label: 'Mock Interview' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-50 dark:bg-charcoal-800 border-r border-gray-200 dark:border-charcoal-700 z-50 transform transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-64 lg:w-20' : 'w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-charcoal-700">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">RA</span>
              </div>
              {!isCollapsed && <span className="font-bold text-lg text-gray-900 dark:text-white truncate">Dashboard</span>}
            </div>
            <button
              onClick={onClose}
              className="lg:hidden absolute top-6 right-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col min-h-0 p-4">
            <div className="flex-1 overflow-y-auto space-y-1">
               {navItems.map((item) => {
                const Icon = item.icon;
                let isActive = location.pathname === item.path;
                
                // Smart tab-based highlights
                if (location.pathname.startsWith('/resume-result/')) {
                  const searchParams = new URLSearchParams(location.search);
                  const activeTab = searchParams.get('tab');
                  if (activeTab === 'cover-letter' && item.path === '/cover-letter') {
                    isActive = true;
                  } else if (activeTab === 'mock-interview' && item.path === '/mock-interview') {
                    isActive = true;
                  }
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center rounded-lg transition-all group relative ${
                      isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                    } ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
                    {isCollapsed && (
                      <div className="absolute left-16 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Return to Home - bottom only, separated, exit-style */}
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-charcoal-700">
              <Link
                to="/"
                onClick={onClose}
                className={`flex items-center rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 group relative ${
                  isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                }`}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Return to Home</span>}
                {isCollapsed && (
                  <div className="absolute left-16 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                    Return to Home
                  </div>
                )}
              </Link>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

