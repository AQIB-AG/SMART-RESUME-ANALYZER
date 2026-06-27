import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { authAPI, resumeAPI } from '../services/api';
import { 
  User, 
  Trash2, 
  Sun, 
  Moon, 
  Bell, 
  Key, 
  Shield, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  LogOut, 
  Download, 
  Laptop, 
  Info,
  Loader2,
  X,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Selected tab state
  const [activeTab, setActiveTab] = useState('account');

  // User Profile from DB
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState(null);

  // Forms states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchResumes()]).finally(() => setLoading(false));
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching settings profile:', error);
      showToast('error', 'Failed to fetch settings data');
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await resumeAPI.getAll();
      if (response.success) {
        setResumes(response.data.resumes || []);
      }
    } catch (error) {
      console.error('Error fetching resumes for download:', error);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Immediate toggle save function
  const handleToggleChange = async (fieldName, currentValue) => {
    setSavingField(fieldName);
    const newValue = !currentValue;
    try {
      const response = await authAPI.updateProfile({ [fieldName]: newValue });
      if (response.success) {
        setProfile(response.data.user);
        showToast('success', 'Preferences updated successfully');
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Failed to save preference changes');
    } finally {
      setSavingField(null);
    }
  };

  const handleVisibilityChange = async (e) => {
    const value = e.target.value;
    setSavingField('profileVisibility');
    try {
      const response = await authAPI.updateProfile({ profileVisibility: value });
      if (response.success) {
        setProfile(response.data.user);
        showToast('success', `Profile visibility is now ${value}`);
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Failed to update visibility setting');
    } finally {
      setSavingField(null);
    }
  };

  // Password updating
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    if (passwordForm.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    
    // Check password strength (at least one letter and one number)
    const strengthRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (passwordForm.newPassword && !strengthRegex.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain both letters and numbers';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setPasswordSaving(true);
    try {
      const response = await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (response.success) {
        showToast('success', 'Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error('Password change error:', err);
      showToast('error', err.response?.data?.error || err.error || 'Failed to update password. Verify current password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Data Export download
  const handleExportData = () => {
    if (!profile) return;
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      userInfo: {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        phone: profile.phone,
        college: profile.college,
        aboutMe: profile.aboutMe,
        socials: {
          linkedin: profile.linkedin,
          github: profile.github,
          portfolio: profile.portfolio
        },
        location: profile.location,
        headline: profile.resumeHeadline,
        careerGoal: profile.careerGoal,
        settings: {
          profileVisibility: profile.profileVisibility,
          emailNotifications: profile.emailNotifications,
          browserNotifications: profile.browserNotifications,
          resumeAnalysisNotifications: profile.resumeAnalysisNotifications,
          coverLetterNotifications: profile.coverLetterNotifications,
          mockInterviewNotifications: profile.mockInterviewNotifications
        }
      },
      resumesAnalyzed: resumes.map(r => ({
        id: r._id,
        originalName: r.originalFileName,
        fileSize: r.fileSize,
        uploadedAt: r.createdAt,
        atsScore: r.atsScore ?? r.ats_score,
        feedback: r.feedback,
        bestFitRole: r.bestFitRole || r.best_fit_role,
        skills: r.skills || []
      })),
      activities: profile.activities || []
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `smart-resume-analyzer-data-${profile.first_name || 'user'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('success', 'Your personal data export downloaded successfully.');
  };

  // Account deletion
  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      setDeleteError('Please type "DELETE" exactly to confirm.');
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      const response = await authAPI.deleteAccount();
      if (response.success) {
        showToast('success', 'Account deleted successfully.');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4 animate-pulse"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Loading settings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const sections = [
    { id: 'account', label: 'My Account', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Sessions', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy & Data', icon: <Globe className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" /> }
  ];

  return (
    <Layout>
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-heading tracking-tight">⚙️ Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Configure profile visibility, credentials, active sessions, and notification preferences.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 items-start">
            
            {/* Sidebar Navigation */}
            <div className="md:col-span-1 flex md:flex-col overflow-x-auto md:overflow-visible gap-1.5 p-1 bg-white/60 dark:bg-charcoal-800/60 backdrop-blur-md rounded-xl border border-white/20 dark:border-charcoal-700/50">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    activeTab === section.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-charcoal-750 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {section.icon}
                  <span>{section.label}</span>
                </button>
              ))}
            </div>

            {/* Main Tabs Container */}
            <div className="md:col-span-3">
              <AnimatePresence mode="wait">
                
                {/* Account Tab */}
                {activeTab === 'account' && (
                  <motion.div
                    key="account-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50 space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">My Account Info</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Overview of credentials and registration details.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 border-t border-b border-gray-150/50 dark:border-charcoal-700/50 py-5">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Account ID</span>
                        <p className="text-sm font-semibold font-mono text-gray-700 dark:text-gray-300 truncate">{profile?.id}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Registered Email</span>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{profile?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">User Role</span>
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-xs bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 border border-indigo-100 dark:border-indigo-900/30 rounded inline-block">
                          {profile?.role}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Member Since</span>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {profile ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">Delete Account</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">
                          Permanently delete your profile, all uploaded resumes, analyzed results, mock interview counts, and statistics. This action is irreversible.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setDeleteInput('');
                          setDeleteError('');
                          setShowDeleteModal(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950/30 rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete My Account</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <motion.div
                    key="security-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Password Change form */}
                    <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                          <Key className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">Change Password</h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Secure your account credentials.</p>
                        </div>
                      </div>

                      <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Password</label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            className={`w-full px-4 py-2.5 bg-white/70 dark:bg-charcoal-900/40 border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-200 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white`}
                          />
                          {passwordErrors.currentPassword && <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" />{passwordErrors.currentPassword}</span>}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Password</label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                              className={`w-full px-4 py-2.5 bg-white/70 dark:bg-charcoal-900/40 border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-200 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white`}
                            />
                            {passwordErrors.newPassword && <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" />{passwordErrors.newPassword}</span>}
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                              className={`w-full px-4 py-2.5 bg-white/70 dark:bg-charcoal-900/40 border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white`}
                            />
                            {passwordErrors.confirmPassword && <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" />{passwordErrors.confirmPassword}</span>}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={passwordSaving}
                          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 mt-2"
                        >
                          {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                          <span>Update Password</span>
                        </button>
                      </form>
                    </div>

                    {/* Active Sessions list */}
                    <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                          <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">Active Login Sessions</h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Details of device authorizations.</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 dark:bg-charcoal-900/40 rounded-xl p-4 border border-gray-100 dark:border-charcoal-750 flex justify-between items-center">
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 bg-white dark:bg-charcoal-800 border border-gray-150 dark:border-charcoal-700 rounded-lg shadow-sm">
                            <Laptop className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                              <span>{profile?.loginDevice || 'Web Browser'}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/20 rounded-full uppercase tracking-wider">Active Now</span>
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              Last login: {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Just Now'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50 space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">Notifications Setup</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">Manage how and when you receive system alerts.</p>
                    </div>

                    <div className="space-y-4 pt-2">
                      {[
                        { id: 'resumeAnalysisNotifications', label: 'Resume Analysis Alerts', desc: 'Notify me when resume parsing and score computation is completed.' },
                        { id: 'coverLetterNotifications', label: 'Cover Letter Templates', desc: 'Notify me when AI cover letter outputs are ready.' },
                        { id: 'mockInterviewNotifications', label: 'Mock Interview Progress', desc: 'Notify me on completed AI questions compilation.' },
                        { id: 'browserNotifications', label: 'In-App Dashboard Alerts', desc: 'Display push notifications directly in the browser header.' },
                        { id: 'emailNotifications', label: 'Email Correspondence', desc: 'Receive periodic analytics and templates updates via email.' }
                      ].map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-3.5 border-b border-gray-100 dark:border-charcoal-700/50 last:border-0">
                          <div className="space-y-0.5 max-w-[80%]">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{item.label}</h4>
                            <p className="text-xs text-gray-400 dark:text-gray-500 leading-normal">{item.desc}</p>
                          </div>
                          <button
                            disabled={savingField === item.id}
                            onClick={() => handleToggleChange(item.id, profile?.[item.id] ?? true)}
                            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                              profile?.[item.id] ?? true 
                                ? 'bg-indigo-600' 
                                : 'bg-gray-200 dark:bg-charcoal-700'
                            } disabled:opacity-50`}
                          >
                            <span 
                              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                profile?.[item.id] ?? true ? 'translate-x-5' : 'translate-x-0'
                              }`} 
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Privacy & Data Tab */}
                {activeTab === 'privacy' && (
                  <motion.div
                    key="privacy-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50 space-y-8"
                  >
                    {/* Profile visibility */}
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">Profile Visibility</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Control if your dashboard profile can be reviewed by recruiters.</p>
                      </div>
                      <div className="max-w-xs">
                        <select
                          disabled={savingField === 'profileVisibility'}
                          value={profile?.profileVisibility || 'public'}
                          onChange={handleVisibilityChange}
                          className="w-full px-4 py-2.5 bg-white/70 dark:bg-charcoal-900/40 border border-gray-200 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white text-sm font-semibold"
                        >
                          <option value="public">Public (Visible to recruiters)</option>
                          <option value="private">Private (Restricted to self)</option>
                        </select>
                      </div>
                    </div>

                    {/* Download details */}
                    <div className="space-y-4 border-t border-gray-100 dark:border-charcoal-700/50 pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg mt-0.5">
                          <Download className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">Download My Data</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">
                            Request and download a portable JSON copy containing your personal credentials, resume texts, computed scores, AI feedback recommendations, and dashboard statistics.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleExportData}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download My Data (JSON)</span>
                      </button>
                    </div>

                    {/* Delete data details */}
                    <div className="space-y-4 border-t border-gray-100 dark:border-charcoal-700/50 pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg mt-0.5">
                          <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">Delete My Data</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">
                            Submit a request to wipe your dashboard clean. This removes all stored metrics and documents. Equivalent to deleting the account.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDeleteInput('');
                          setDeleteError('');
                          setShowDeleteModal(true);
                        }}
                        className="px-5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-950/20 rounded-xl font-semibold transition-all duration-300"
                      >
                        Delete My Data
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <motion.div
                    key="appearance-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50 space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">Appearance Preferences</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Configure theme settings for optimized visibility.</p>
                    </div>

                    <div className="flex justify-between items-center py-4 pt-2">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                          {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                          <span>Theme Selection</span>
                        </h4>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Toggle between light and dark visual aesthetics.</p>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-xl font-semibold shadow-sm hover:shadow transition-colors"
                      >
                        {theme === 'dark' ? (
                          <>
                            <Sun className="w-4 h-4" />
                            <span>Switch to Light</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4" />
                            <span>Switch to Dark</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20 dark:border-charcoal-700/50">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-charcoal-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                <span>Confirm Account Deletion</span>
              </h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="flex gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-950/30 text-xs">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="leading-normal">
                  <strong>WARNING:</strong> This will permanently delete your user profile and all associated data, including scores, uploads, and history. This cannot be undone.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Type <span className="font-mono text-red-500 font-bold bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded border border-red-150 dark:border-red-900/35">DELETE</span> below to confirm:
                </label>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-4 py-2.5 bg-white/70 dark:bg-charcoal-900/40 border border-gray-200 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/55 dark:text-white text-sm"
                />
                {deleteError && <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" />{deleteError}</span>}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-gray-150 hover:bg-gray-200 dark:bg-charcoal-700 dark:hover:bg-charcoal-650 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-650 to-red-550 text-white rounded-xl font-semibold hover:shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-[100] px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 border ${
              toast.type === 'success' 
                ? 'bg-green-500/90 border-green-400 text-white' 
                : 'bg-red-500/90 border-red-400 text-white'
            } backdrop-blur-md`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Settings;
