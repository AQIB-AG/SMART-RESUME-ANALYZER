import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Upload,
  User,
  Settings,
  Home,
  FileText,
  Brain
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isToggleHovered, setIsToggleHovered] = useState(false);

  useEffect(() => {
    setIsHeaderHovered(false);
    setIsToggleHovered(false);
  }, [isCollapsed]);

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
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Toggle Header */}
          <div 
            onMouseEnter={() => setIsHeaderHovered(true)}
            onMouseLeave={() => setIsHeaderHovered(false)}
            onClick={isCollapsed ? onToggleCollapse : undefined}
            className={`border-b border-gray-200 dark:border-charcoal-700 flex items-center h-20 transition-all duration-300 relative select-none cursor-pointer ${
              isCollapsed ? 'p-2 justify-center' : 'p-6 justify-between'
            }`}
          >
            {/* Expanded State Header */}
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full transition-all duration-300 ease-in-out">
                <div className="flex items-center justify-start min-w-0">
                  <img 
                    src="/assets/logo.png" 
                    alt="Logo" 
                    className="h-[34px] w-auto object-contain flex-shrink-0" 
                  />
                </div>
                <button
                  onMouseEnter={() => setIsToggleHovered(true)}
                  onMouseLeave={() => setIsToggleHovered(false)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollapse();
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none flex items-center justify-center p-1 select-none flex-shrink-0 cursor-pointer"
                  aria-label="Collapse sidebar"
                >
                  <span className="text-2xl font-bold">◧</span>
                </button>

                {/* Hover State: Close Sidebar Outside Sidebar */}
                <div 
                  className={`absolute left-full top-1/2 transform -translate-y-1/2 ml-4 transition-all duration-200 ease-in-out select-none z-50 ${
                    isToggleHovered 
                      ? 'opacity-100 scale-100 pointer-events-auto' 
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollapse();
                  }}
                >
                  <div className="bg-gray-900 dark:bg-charcoal-800 text-white dark:text-gray-100 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xl border border-gray-800 dark:border-charcoal-700 whitespace-nowrap flex items-center cursor-pointer">
                    Close Sidebar
                  </div>
                </div>
              </div>
            )}

            {/* Collapsed State Header with Hover to Open */}
            {isCollapsed && (
              <div className="relative w-full h-full flex items-center justify-center transition-all duration-300">
                {/* Default State: Logo Only */}
                <div className={`transition-all duration-300 ease-in-out flex items-center justify-center ${isHeaderHovered ? 'opacity-0 scale-90 pointer-events-none absolute' : 'opacity-100 scale-100'}`}>
                  <img 
                    src="/assets/logo.png" 
                    alt="Logo" 
                    className="h-[30px] w-auto object-contain" 
                  />
                </div>

                {/* Hover State: ◧ Inside Sidebar */}
                <div className={`transition-all duration-300 ease-in-out flex items-center justify-center ${isHeaderHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none absolute'}`}>
                  <span className="text-2xl font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors select-none">
                    ◧
                  </span>
                </div>

                {/* Hover State: Open Sidebar Outside Sidebar */}
                <div 
                  className={`absolute left-full top-1/2 transform -translate-y-1/2 ml-4 transition-all duration-200 ease-in-out select-none z-50 ${
                    isHeaderHovered 
                      ? 'opacity-100 scale-100 pointer-events-auto' 
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollapse();
                  }}
                >
                  <div className="bg-gray-900 dark:bg-charcoal-800 text-white dark:text-gray-100 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xl border border-gray-800 dark:border-charcoal-700 whitespace-nowrap flex items-center">
                    Open Sidebar
                  </div>
                </div>
              </div>
            )}
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
              </Link>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

