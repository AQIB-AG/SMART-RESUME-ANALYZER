import { useState } from 'react';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { Copy, RefreshCw, Trash2, Sun, Moon, Bell, Key, Shield, Users, Globe, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [apiKey] = useState('sk-*****pgjs1234abcd5676');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    alert('API key copied to clipboard!');
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 font-heading">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and security settings</p>
          </motion.div>

          <div className="space-y-6">
            {/* General Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">General Preferences</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Manage your display and application theme settings.
              </p>
              <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-charcoal-700">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Dark Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enable dark theme for a more comfortable viewing experience.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </motion.button>
              </div>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">Notification Settings</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Control when and how you receive alerts and updates.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-charcoal-700">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive important updates and announcements via email.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      emailNotifications ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        emailNotifications ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </motion.button>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">In-App Alerts</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get real-time notifications directly within the application.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInAppAlerts(!inAppAlerts)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      inAppAlerts ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        inAppAlerts ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* API & Integrations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">API & Integrations</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Connect with third-party services and manage your API keys.
              </p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your API Key
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={apiKey}
                      readOnly
                      className="flex-1 px-4 py-3 bg-white/70 dark:bg-charcoal-700/70 border border-gray-300 dark:border-charcoal-600 rounded-xl"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyApiKey}
                      className="px-4 py-3 bg-white/70 dark:bg-charcoal-700/70 border border-gray-300 dark:border-charcoal-600 rounded-xl hover:shadow-md transition-all duration-300 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-3 bg-white/70 dark:bg-charcoal-700/70 border border-gray-300 dark:border-charcoal-600 rounded-xl hover:shadow-md transition-all duration-300 flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </motion.button>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Slack', desc: 'Connect Slack to receive analysis summaries directly.' },
                    { name: 'Google Drive', desc: 'Sync resume files from Google Drive for easy analysis.' },
                    { name: 'LinkedIn', desc: 'Import profile data from LinkedIn to pre-fill resume details.' }
                  ].map((integration, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/50 dark:bg-charcoal-700/50 rounded-xl border border-gray-200 dark:border-charcoal-600"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{integration.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{integration.desc}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                      >
                        Connect
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Account Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-red-600 to-pink-500 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">Account Management</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Update your password or manage your account status.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-charcoal-700/50 rounded-xl border border-gray-200 dark:border-charcoal-600">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Change Password</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Update your account password regularly for security.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-white/70 dark:bg-charcoal-700/70 border border-gray-300 dark:border-charcoal-600 rounded-xl hover:shadow-md transition-all duration-300 font-semibold"
                  >
                    Change
                  </motion.button>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50/50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700/50">
                  <div>
                    <h3 className="font-semibold text-red-700 dark:text-red-300">Delete Account</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Save Changes Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Save Changes
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full shadow-xl border border-white/30 dark:border-charcoal-700/50"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-heading">Delete Account</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-white/70 dark:bg-charcoal-700/70 border border-gray-300 dark:border-charcoal-600 rounded-xl hover:shadow-md transition-all duration-300 font-semibold"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
              >
                Delete Account
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  );
};

export default Settings;

