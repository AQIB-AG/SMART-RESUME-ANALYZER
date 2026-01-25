import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell, User as UserIcon, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-charcoal-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Top Header */}
        <header className="bg-white dark:bg-charcoal-800 border-b border-gray-200 dark:border-charcoal-700 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            
            {/* Notifications Bell */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700 text-gray-600 dark:text-gray-300 relative transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-charcoal-800 rounded-lg shadow-xl border border-gray-200 dark:border-charcoal-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-charcoal-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">You'll see updates here when they arrive</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Avatar Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium hidden md:block text-sm">
                  {user?.email?.split('@')[0] || 'User'}
                </span>
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-charcoal-800 rounded-lg shadow-xl border border-gray-200 dark:border-charcoal-700 z-50">
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-charcoal-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

