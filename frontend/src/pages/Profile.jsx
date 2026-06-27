import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { authAPI, resumeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Edit2, 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Award, 
  Briefcase, 
  CheckCircle, 
  AlertCircle, 
  Link as LinkIcon, 
  Phone, 
  FileText, 
  Sparkles, 
  Mic, 
  Camera, 
  Trash2, 
  X,
  Target,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Crop Modal
const ImageCropModal = ({ src, onCrop, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    const img = imageRef.current;
    if (img) {
      ctx.beginPath();
      ctx.arc(150, 150, 150, 0, Math.PI * 2);
      ctx.clip();

      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const size = Math.min(imgWidth, imgHeight);
      const scale = (300 / size) * zoom;
      
      const dw = imgWidth * scale;
      const dh = imgHeight * scale;
      const dx = (300 - dw) / 2 + offset.x;
      const dy = (300 - dh) / 2 + offset.y;

      ctx.drawImage(img, dx, dy, dw, dh);
      
      const base64Image = canvas.toDataURL('image/jpeg', 0.85);
      onCrop(base64Image);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/20 dark:border-charcoal-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">Crop Photo</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative w-64 h-64 mx-auto bg-gray-100 dark:bg-charcoal-900 overflow-hidden rounded-xl cursor-move select-none flex items-center justify-center border border-gray-200 dark:border-charcoal-700"
        >
          <img
            ref={imageRef}
            src={src}
            alt="To crop"
            onMouseDown={handleMouseDown}
            draggable={false}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          />
          <div className="absolute inset-0 border-[32px] border-black/50 pointer-events-none">
            <div className="w-full h-full rounded-full border border-white/60 border-dashed shadow-[0_0_0_9999px_rgba(0,0,0,0.2)]" />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-charcoal-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // File upload state for crop
  const [imageSrc, setImageSrc] = useState(null);
  const fileInputRef = useRef(null);

  // Edit fields state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    college: '',
    aboutMe: '',
    linkedin: '',
    github: '',
    portfolio: '',
    location: '',
    resumeHeadline: '',
    careerGoal: ''
  });

  // UI state
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchResumes()]).finally(() => setLoading(false));
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        setProfile(response.data.user);
        setFormData({
          first_name: response.data.user.first_name || '',
          last_name: response.data.user.last_name || '',
          phone: response.data.user.phone || '',
          college: response.data.user.college || '',
          aboutMe: response.data.user.aboutMe || '',
          linkedin: response.data.user.linkedin || '',
          github: response.data.user.github || '',
          portfolio: response.data.user.portfolio || '',
          location: response.data.user.location || '',
          resumeHeadline: response.data.user.resumeHeadline || '',
          careerGoal: response.data.user.careerGoal || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('error', 'Failed to fetch user profile');
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await resumeAPI.getAll();
      if (response.success) {
        setResumes(response.data.resumes || []);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.first_name.trim()) tempErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) tempErrors.last_name = 'Last name is required';

    if (formData.college.trim() && formData.college.trim().length < 2) {
      tempErrors.college = 'College name must be at least 2 characters';
    }

    if (formData.phone.trim()) {
      const phoneRegex = /^[\d +()-]{7,20}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        tempErrors.phone = 'Invalid phone number format';
      }
    }

    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    const validateUrl = (val, key) => {
      if (val.trim() && !urlRegex.test(val.trim())) {
        tempErrors[key] = 'Invalid URL format';
      }
    };
    validateUrl(formData.linkedin, 'linkedin');
    validateUrl(formData.github, 'github');
    validateUrl(formData.portfolio, 'portfolio');

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      showToast('error', 'Please fix the errors in the form.');
      return;
    }

    setSaving(true);
    try {
      const response = await authAPI.updateProfile(formData);
      if (response.success) {
        setProfile(response.data.user);
        setIsDirty(false);
        setEditing(false);
        showToast('success', 'Profile updated successfully!');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      showToast('error', err.error || 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      setEditing(false);
      setErrors({});
    }
  };

  const confirmDiscardChanges = () => {
    // Reset form fields
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        college: profile.college || '',
        aboutMe: profile.aboutMe || '',
        linkedin: profile.linkedin || '',
        github: profile.github || '',
        portfolio: profile.portfolio || '',
        location: profile.location || '',
        resumeHeadline: profile.resumeHeadline || '',
        careerGoal: profile.careerGoal || ''
      });
    }
    setIsDirty(false);
    setErrors({});
    setEditing(false);
    setShowUnsavedModal(false);
  };

  // Image upload triggers
  const handlePhotoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setImageSrc(fileReader.result);
      };
      fileReader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePhotoCropped = async (croppedBase64) => {
    setImageSrc(null);
    setSaving(true);
    try {
      const response = await authAPI.updateProfile({ profilePicture: croppedBase64 });
      if (response.success) {
        setProfile(prev => ({ ...prev, profilePicture: croppedBase64 }));
        showToast('success', 'Profile picture updated successfully!');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to upload photo');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoRemove = async () => {
    if (!profile?.profilePicture) return;
    setSaving(true);
    try {
      const response = await authAPI.updateProfile({ profilePicture: '' });
      if (response.success) {
        setProfile(prev => ({ ...prev, profilePicture: '' }));
        showToast('success', 'Profile photo removed.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to remove photo');
    } finally {
      setSaving(false);
    }
  };

  // Stats calculators
  const resumesCount = resumes.length;
  const bestAtsScore = resumes.reduce((max, r) => Math.max(max, r.ats_score ?? r.atsScore ?? 0), 0);
  const avgAtsScore = resumesCount > 0 
    ? Math.round(resumes.reduce((sum, r) => sum + (r.ats_score ?? r.atsScore ?? 0), 0) / resumesCount)
    : 0;

  // Completion calculation
  const getCompletionPercent = () => {
    if (!profile) return 0;
    const fields = [
      profile.profilePicture,
      profile.phone,
      profile.college,
      profile.aboutMe,
      profile.linkedin,
      profile.github,
      profile.portfolio,
      profile.location,
      profile.careerGoal,
      profile.resumeHeadline
    ];
    const completed = fields.filter(f => f && String(f).trim() !== '').length;
    return completed * 10;
  };

  const completionPercent = getCompletionPercent();

  const getProgressBar = (percent) => {
    const filled = Math.round(percent / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  // Date relative time helper
  const getRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = dNow.getTime() - dDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 2) return '2 days ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTimelineIcon = (type) => {
    switch (type) {
      case 'resume_analyzed': return <FileText className="w-4 h-4 text-cyan-500" />;
      case 'cover_letter_generated': return <Sparkles className="w-4 h-4 text-indigo-500" />;
      case 'mock_interview_started': return <Mic className="w-4 h-4 text-amber-500" />;
      default: return <User className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getTimelineLabel = (type, details) => {
    switch (type) {
      case 'resume_analyzed': return `Resume analyzed - ${details || 'ATS Scored'}`;
      case 'cover_letter_generated': return `Cover Letter Generated ${details}`;
      case 'mock_interview_started': return `Mock Interview Started ${details}`;
      default: return 'Profile Updated';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4 animate-pulse"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const initials = profile 
    ? `${profile.first_name?.charAt(0) || ''}${profile.last_name?.charAt(0) || ''}`.toUpperCase() || user?.email?.charAt(0).toUpperCase()
    : 'U';

  const fullName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email?.split('@')[0] || 'User';

  return (
    <Layout>
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-heading tracking-tight flex items-center gap-2">
                👤 Account Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage user attributes, database statistics, and credentials.</p>
            </div>
            {!editing && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 text-gray-800 dark:text-white rounded-xl font-semibold shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-charcoal-750 transition-all duration-300"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </motion.button>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column: Avatar & Summary Card */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Profile Main Card */}
              <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50 flex flex-col items-center text-center relative group">
                {/* Profile Picture */}
                <div className="relative mb-4">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-indigo-500 shadow-inner flex items-center justify-center bg-gradient-to-r from-indigo-600 to-cyan-500">
                    {profile?.profilePicture ? (
                      <img src={profile.profilePicture} alt={fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-3xl font-bold font-heading">{initials}</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 shadow-lg border border-white dark:border-charcoal-800 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/png, image/jpeg, image/jpg" 
                      onChange={handlePhotoSelect} 
                    />
                  </label>
                </div>

                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">{fullName}</h2>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-0.5 min-h-[20px]">
                    {profile?.resumeHeadline || 'Add professional headline'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 min-h-[16px] flex items-center gap-1 justify-center">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {profile?.location || 'Not Added Yet'}
                  </p>
                </div>

                <div className="w-full border-t border-gray-100 dark:border-charcoal-700/50 py-4 space-y-3.5 text-left text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400 dark:text-gray-550" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400 dark:text-gray-550" />
                    <span>{profile?.phone || 'Not Added Yet'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-gray-400 dark:text-gray-550" />
                    <span className="truncate">{profile?.college || 'Not Added Yet'}</span>
                  </div>
                </div>

                {profile?.profilePicture && (
                  <button 
                    onClick={handlePhotoRemove} 
                    className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 border border-red-100 dark:border-red-950/20 px-3 py-1.5 rounded-lg bg-red-50/50 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Avatar
                  </button>
                )}
              </div>

              {/* Profile Completion Tracker */}
              <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-heading mb-3">Profile Verification</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-gray-500 dark:text-gray-400">Completion Score</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{completionPercent}%</span>
                  </div>
                  <div className="font-mono text-gray-300 dark:text-charcoal-700 tracking-tighter select-none text-base font-semibold">
                    <span className="text-indigo-600 dark:text-indigo-400">{getProgressBar(completionPercent)}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal pt-1">
                    {completionPercent === 100 
                      ? '🚀 Profile is fully complete! Your visual resume dashboard is ready for recruiters.'
                      : '💡 Complete your profile to improve recruiter match confidence.'}
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Editable Forms & Stats Section */}
            <div className="lg:col-span-2 space-y-6">

              {/* Display or Edit Card */}
              <AnimatePresence mode="wait">
                {editing ? (
                  <motion.div
                    key="edit-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50 space-y-6"
                  >
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-charcoal-700/50">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">Edit Profile Info</h2>
                      <span className="text-xs px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 rounded-full font-semibold">Unsaved Changes</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleFieldChange}
                          className={`w-full px-4 py-2.5 bg-white/70 dark:bg-charcoal-900/40 border ${errors.first_name ? 'border-red-500' : 'border-gray-200 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white`}
                        />
                        {errors.first_name && <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" />{errors.first_name}</span>}
                      </div>

                      {/* Last Name */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleFieldChange}
                          className={`w-full px-4 py-2.5 bg-white/70 dark:bg-charcoal-900/40 border ${errors.last_name ? 'border-red-500' : 'border-gray-200 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white`}
                        />
                        {errors.last_name && <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" />{errors.last_name}</span>}
                      </div>

                      {/* Headline */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resume Headline</label>
                        <input
                          type="text"
                          name="resumeHeadline"
                          placeholder="e.g. Lead ML Engineer | ex-Google"
                          value={formData.resumeHeadline}
                          onChange={handleFieldChange}
                          className="w-full px-4 py-2.5 bg-white/70 dark:bg-charcoal-900/40 border border-gray-200 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          placeholder="+1 (555) 019-2834"
                          value={formData.phone}
                          onChange={handleFieldChange}
                          className={`w-full px-4 py-2.5 bg-white/70 dark:bg-charcoal-900/40 border ${errors.phone ? 'border-red-500' : 'border-gray-200 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white`}
                        />
                        {errors.phone && <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" />{errors.phone}</span>}
                      </div>

                      {/* College */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">College/University</label>
                        <input
                          type="text"
                          name="college"
                          placeholder="Stanford University"
                          value={formData.college}
                          onChange={handleFieldChange}
                          className={`w-full px-4 py-2.5 bg-white/70 dark:bg-charcoal-900/40 border ${errors.college ? 'border-red-500' : 'border-gray-200 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white`}
                        />
                        {errors.college && <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" />{errors.college}</span>}
                      </div>

                      {/* Location */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</label>
                        <input
                          type="text"
                          name="location"
                          placeholder="San Francisco, CA"
                          value={formData.location}
                          onChange={handleFieldChange}
                          className="w-full px-4 py-2.5 bg-white/70 dark:bg-charcoal-900/40 border border-gray-200 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white"
                        />
                      </div>

                      {/* Career Goal */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Career Goal</label>
                        <input
                          type="text"
                          name="careerGoal"
                          placeholder="Transition to Senior Staff AI Architect"
                          value={formData.careerGoal}
                          onChange={handleFieldChange}
                          className="w-full px-4 py-2.5 bg-white/70 dark:bg-charcoal-900/40 border border-gray-200 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white"
                        />
                      </div>

                      {/* About Me */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">About Me / Bio</label>
                        <textarea
                          name="aboutMe"
                          rows="4"
                          placeholder="Write a brief professional bio..."
                          value={formData.aboutMe}
                          onChange={handleFieldChange}
                          className="w-full px-4 py-3 bg-white/70 dark:bg-charcoal-900/40 border border-gray-200 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white resize-none"
                        />
                      </div>

                      {/* Social Links */}
                      <div className="md:col-span-2 border-t border-gray-100 dark:border-charcoal-700/50 pt-4 space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-heading">Social Profiles</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          {/* LinkedIn */}
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">LinkedIn URL</label>
                            <input
                              type="text"
                              name="linkedin"
                              placeholder="https://linkedin.com/in/username"
                              value={formData.linkedin}
                              onChange={handleFieldChange}
                              className={`w-full px-3 py-2 bg-white/70 dark:bg-charcoal-900/40 border ${errors.linkedin ? 'border-red-500' : 'border-gray-200 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white text-sm`}
                            />
                            {errors.linkedin && <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" />{errors.linkedin}</span>}
                          </div>

                          {/* GitHub */}
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">GitHub URL</label>
                            <input
                              type="text"
                              name="github"
                              placeholder="https://github.com/username"
                              value={formData.github}
                              onChange={handleFieldChange}
                              className={`w-full px-3 py-2 bg-white/70 dark:bg-charcoal-900/40 border ${errors.github ? 'border-red-500' : 'border-gray-200 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white text-sm`}
                            />
                            {errors.github && <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" />{errors.github}</span>}
                          </div>

                          {/* Portfolio */}
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">Portfolio Website</label>
                            <input
                              type="text"
                              name="portfolio"
                              placeholder="https://mywebsite.com"
                              value={formData.portfolio}
                              onChange={handleFieldChange}
                              className={`w-full px-3 py-2 bg-white/70 dark:bg-charcoal-900/40 border ${errors.portfolio ? 'border-red-500' : 'border-gray-200 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:text-white text-sm`}
                            />
                            {errors.portfolio && <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" />{errors.portfolio}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-charcoal-700/50">
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-charcoal-700 dark:hover:bg-charcoal-650 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display-card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50 space-y-8"
                  >
                    {/* About me */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-heading">About Me</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed min-h-[36px]">
                        {profile?.aboutMe || 'Not Added Yet. Write a short bio to highlight your unique skills.'}
                      </p>
                    </div>

                    {/* Career details */}
                    <div className="grid md:grid-cols-2 gap-6 border-t border-gray-100 dark:border-charcoal-700/50 pt-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">Career Goal</h4>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {profile?.careerGoal || 'Not Added Yet'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">Education Details</h4>
                        <div className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                          <GraduationCap className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{profile?.college || 'Not Added Yet'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="border-t border-gray-100 dark:border-charcoal-700/50 pt-6 space-y-3">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-heading">Social Links</h3>
                      <div className="flex flex-wrap gap-4">
                        {profile?.linkedin ? (
                          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-950/30 transition-all duration-300 text-sm font-medium">
                            <LinkIcon className="w-4 h-4" />
                            LinkedIn
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-charcoal-700 px-4 py-2 rounded-xl">LinkedIn: Not Added</span>
                        )}

                        {profile?.github ? (
                          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-charcoal-700/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-charcoal-600/50 rounded-xl hover:bg-gray-100 dark:hover:bg-charcoal-750 transition-all duration-300 text-sm font-medium">
                            <LinkIcon className="w-4 h-4" />
                            GitHub
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-charcoal-700 px-4 py-2 rounded-xl">GitHub: Not Added</span>
                        )}

                        {profile?.portfolio ? (
                          <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-900/30 rounded-xl hover:bg-cyan-100 dark:hover:bg-cyan-950/30 transition-all duration-300 text-sm font-medium">
                            <LinkIcon className="w-4 h-4" />
                            Portfolio
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-charcoal-700 px-4 py-2 rounded-xl">Website: Not Added</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Statistics Grid */}
              <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-heading">Real-Time Database Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Resumes Analyzed', value: resumesCount, icon: <FileText className="w-4 h-4 text-indigo-500" /> },
                    { label: 'Average ATS Score', value: resumesCount > 0 ? `${avgAtsScore}%` : '—', icon: <Target className="w-4 h-4 text-cyan-500" /> },
                    { label: 'Best ATS Score', value: resumesCount > 0 ? `${bestAtsScore}%` : '—', icon: <Award className="w-4 h-4 text-yellow-500" /> },
                    { label: 'Cover Letters', value: profile?.coverLettersCount || 0, icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
                    { label: 'Mock Interviews', value: profile?.mockInterviewsCount || 0, icon: <Mic className="w-4 h-4 text-orange-500" /> },
                    { label: 'Account Created', value: profile ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : '—', icon: <Calendar className="w-4 h-4 text-green-500" /> },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50/50 dark:bg-charcoal-900/30 rounded-xl p-4 border border-gray-100 dark:border-charcoal-750 flex flex-col justify-between min-h-[92px]"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-gray-550 dark:text-gray-400 font-medium leading-tight">{stat.label}</span>
                        <div className="p-1 rounded bg-white dark:bg-charcoal-800 border border-gray-100 dark:border-charcoal-700 shadow-sm shrink-0">
                          {stat.icon}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white font-heading mt-2">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Timeline Card */}
              <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-heading">Activity Timeline</h2>
                
                {!profile?.activities || profile.activities.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-charcoal-750 rounded-xl">
                    <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-charcoal-700" />
                    <p className="text-sm font-medium">No activity logged yet.</p>
                    <p className="text-xs mt-0.5">Your analyzed resumes and generated templates will appear here.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l border-gray-200 dark:border-charcoal-700 space-y-6">
                    {profile.activities.slice(0, 15).map((act, index) => (
                      <div key={act._id || index} className="relative group">
                        {/* Bullet Icon */}
                        <div className="absolute -left-[35px] top-1 w-5 h-5 rounded-full bg-white dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 flex items-center justify-center shadow-sm group-hover:border-indigo-500 transition-colors">
                          {getTimelineIcon(act.type)}
                        </div>
                        <div className="space-y-0.5 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-default">
                              {getTimelineLabel(act.type, act.details)}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-555 font-medium">
                              {getRelativeTime(act.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Image Crop Modal Overlay */}
      {imageSrc && (
        <ImageCropModal 
          src={imageSrc} 
          onCrop={handlePhotoCropped} 
          onClose={() => setImageSrc(null)} 
        />
      )}

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/20 dark:border-charcoal-700/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">Unsaved Changes</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 leading-relaxed">
              You have made modifications to your profile. Discarding changes will revert all edits permanently.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUnsavedModal(false)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-charcoal-700 dark:hover:bg-charcoal-650 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmDiscardChanges}
                className="flex-1 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-colors"
              >
                Discard Changes
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

export default Profile;
