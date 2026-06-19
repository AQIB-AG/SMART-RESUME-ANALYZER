import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell, User as UserIcon, LogOut, X, FileText, Sparkles, Zap, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => 
    typeof window !== 'undefined' && localStorage.getItem('sidebarCollapsed') === 'true'
  );
  
  // Notification states
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notifications_list');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isRinging, setIsRinging] = useState(false);
  const [timeTick, setTimeTick] = useState(0);

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const ringTimeoutRef = useRef(null);
  const readTimeoutRef = useRef(null);

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', String(next));
      return next;
    });
  };

  // Helper: Format relative timestamp
  const formatRelativeTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 0) return 'Just now'; // handle slight time sync differences
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Helper: Add a notification — every event is stored independently (no type dedup)
  const addNotification = (newNotificationData) => {
    setNotifications((prev) => {
      const newNotification = {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        type: newNotificationData.type,
        title: newNotificationData.title,
        detail: newNotificationData.detail || null,
        fileName: newNotificationData.fileName || null,
        timestamp: new Date().toISOString(),
        read: false,
      };

      // Prepend new event and keep the latest 10 only
      const updated = [newNotification, ...prev].slice(0, 10);
      localStorage.setItem('notifications_list', JSON.stringify(updated));
      return updated;
    });

    // Start bell ringing
    setIsRinging(true);
    
    // Clear and reset the 5 seconds auto-stop timer
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
    }
    ringTimeoutRef.current = setTimeout(() => {
      setIsRinging(false);
      ringTimeoutRef.current = null;
    }, 5000);
  };

  // Helper: Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => {
      const hasUnreadItems = prev.some((n) => !n.read);
      if (!hasUnreadItems) return prev;
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem('notifications_list', JSON.stringify(updated));
      return updated;
    });
  };

  const handleBellClick = () => {
    // Stop ringing immediately if user clicks
    if (isRinging) {
      setIsRinging(false);
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
        ringTimeoutRef.current = null;
      }
    }
    
    // Toggle notifications dropdown
    setNotificationsOpen((prev) => !prev);
  };

  // Listen to custom notification events
  useEffect(() => {
    const handleNewAnalysis = (e) => {
      const score = e?.detail?.score ?? localStorage.getItem('analysisScore') ?? '0';
      const fileName = e?.detail?.fileName || '';
      addNotification({
        type: 'ATS_ANALYSIS',
        title: 'Resume Analysis Completed',
        detail: `ATS Score: ${score}%`,
        fileName,
      });
    };

    const handleCoverLetter = () => {
      addNotification({
        type: 'COVER_LETTER',
        title: 'Cover Letter Generated Successfully',
      });
    };

    const handleMockInterview = () => {
      addNotification({
        type: 'MOCK_INTERVIEW',
        title: 'Mock Interview Generated Successfully',
      });
    };

    window.addEventListener('newAnalysisComplete', handleNewAnalysis);
    window.addEventListener('coverLetterComplete', handleCoverLetter);
    window.addEventListener('mockInterviewComplete', handleMockInterview);

    return () => {
      window.removeEventListener('newAnalysisComplete', handleNewAnalysis);
      window.removeEventListener('coverLetterComplete', handleCoverLetter);
      window.removeEventListener('mockInterviewComplete', handleMockInterview);
    };
  }, []);

  // Handle auto marking notifications as read when panel is opened/closed
  useEffect(() => {
    if (notificationsOpen) {
      const hasUnreadItems = notifications.some((n) => !n.read);
      if (hasUnreadItems) {
        readTimeoutRef.current = setTimeout(() => {
          markAllAsRead();
          readTimeoutRef.current = null;
        }, 1500);
      }
    } else {
      if (readTimeoutRef.current) {
        clearTimeout(readTimeoutRef.current);
        readTimeoutRef.current = null;
      }
      markAllAsRead();
    }
    return () => {
      if (readTimeoutRef.current) {
        clearTimeout(readTimeoutRef.current);
      }
    };
  }, [notificationsOpen]);

  // Periodic ticking to update relative timestamps while dropdown is open
  useEffect(() => {
    let interval;
    if (notificationsOpen) {
      interval = setInterval(() => {
        setTimeTick((t) => t + 1);
      }, 15000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [notificationsOpen]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
    };
  }, []);

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
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
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
                onClick={handleBellClick}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-charcoal-700 text-gray-600 dark:text-gray-300 relative transition-colors ${
                  isRinging ? 'animate-shake' : ''
                }`}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read) && (
                  <span
                    className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-charcoal-800 animate-pulse"
                    aria-hidden="true"
                  />
                )}
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-charcoal-800 rounded-lg shadow-xl border border-gray-200 dark:border-charcoal-700 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-charcoal-700 flex justify-between items-center bg-gray-50/50 dark:bg-charcoal-800/50">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
                    {notifications.length > 0 && (
                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                        {notifications.filter(n => !n.read).length} new
                      </span>
                    )}
                  </div>
                  <div>
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-100 dark:divide-charcoal-700/50 max-h-96 overflow-y-auto">
                        {notifications.map((n) => {
                          const Icon = n.type === 'ATS_ANALYSIS' ? Award : n.type === 'COVER_LETTER' ? FileText : Zap;
                          const iconColorClass = n.type === 'ATS_ANALYSIS'
                            ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                            : n.type === 'COVER_LETTER'
                            ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'text-amber-500 bg-amber-50 dark:bg-amber-950/40';

                          return (
                            <div
                              key={n.id}
                              className={`p-4 flex gap-3 transition-colors duration-300 relative ${
                                !n.read
                                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                                  : 'bg-white hover:bg-slate-50/50 dark:bg-charcoal-800 dark:hover:bg-charcoal-700/30'
                              }`}
                            >
                              <div className={`p-2 rounded-xl ${iconColorClass} self-start flex-shrink-0`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                                    {n.title}
                                  </p>
                                  {!n.read && (
                                    <span className="h-2 w-2 bg-red-500 rounded-full flex-shrink-0 animate-pulse mt-1" />
                                  )}
                                </div>
                                {n.fileName && (
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium truncate">
                                    📄 {n.fileName}
                                  </p>
                                )}
                                {n.detail && (
                                  <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-1">
                                    {n.detail}
                                  </p>
                                )}
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1 font-medium">
                                  ⏱ {formatRelativeTime(n.timestamp)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-white dark:bg-charcoal-800">
                        <Bell className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 font-semibold text-sm">No notifications yet</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-medium">You'll see updates here when they arrive</p>
                      </div>
                    )}
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

