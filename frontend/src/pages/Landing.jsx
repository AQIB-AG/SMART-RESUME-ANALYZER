import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroAnimatedBackground from '../components/HeroAnimatedBackground';
import Hero3DBackground from '../components/Hero3DBackground';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI, resumeAPI, analysisAPI } from '../services/api';
import { 
  Sparkles, 
  Search, 
  Target, 
  Palette, 
  ArrowRight, 
  Check, 
  Star, 
  Zap, 
  TrendingUp, 
  Award, 
  Upload as UploadIcon, 
  FileText, 
  CheckCircle, 
  X, 
  Cloud, 
  Loader2, 
  AlertTriangle, 
  Copy, 
  RefreshCw, 
  HelpCircle, 
  Briefcase, 
  Mic, 
  ChevronDown,
  AlertCircle,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MIN_LOADING_TIME = 10000;

// Global iframe-based PDF printing helper
const printPdf = (title, htmlContent) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            padding: 40px;
            margin: 0;
          }
          h1 {
            color: #4f46e5;
            font-size: 24px;
            font-weight: 700;
            margin-top: 0;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          pre {
            white-space: pre-wrap;
            font-family: inherit;
            font-size: 15px;
            color: #334155;
          }
          .meta {
            font-size: 12px;
            color: #64748b;
            margin-top: -20px;
            margin-bottom: 30px;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 500);
  }, 300);
};

const COMPANIES = [
  "Tata Consultancy Services", "Infosys", "Wipro", "HCLTech", "Tech Mahindra",
  "Reliance Industries", "Tata Steel", "Tata Motors", "Larsen & Toubro", "Mahindra & Mahindra",
  "State Bank of India", "ICICI Bank", "HDFC Bank", "Axis Bank", "Bharat Petroleum",
  "Indian Oil Corporation", "Oil and Natural Gas Corporation", "Coal India", "Adani Enterprises",
  "Adani Ports and Special Economic Zone", "Asian Paints", "Hindustan Unilever", "ITC Limited",
  "Maruti Suzuki", "Bajaj Finserv", "Bajaj Auto", "UltraTech Cement", "JSW Steel",
  "Sun Pharmaceutical Industries", "Dr. Reddy's Laboratories", "Other"
];

const ROLES = [
  "Software Engineer", "Software Developer", "Full Stack Developer", "Frontend Developer",
  "Backend Developer", "MERN Stack Developer", "MEAN Stack Developer", "Java Developer",
  "Python Developer", ".NET Developer", "PHP Developer", "React Developer",
  "Angular Developer", "Node.js Developer", "Mobile App Developer", "Android Developer",
  "iOS Developer", "Flutter Developer", "React Native Developer", "DevOps Engineer",
  "Site Reliability Engineer", "Cloud Engineer", "Cloud Architect", "Data Engineer",
  "Data Analyst", "Business Analyst", "Data Scientist", "Machine Learning Engineer",
  "AI Engineer", "Generative AI Engineer", "Prompt Engineer", "NLP Engineer",
  "Computer Vision Engineer", "MLOps Engineer", "Cybersecurity Analyst", "Ethical Hacker",
  "Security Engineer", "Network Engineer", "Database Administrator", "SQL Developer",
  "Blockchain Developer", "SAP Consultant", "Salesforce Developer", "Salesforce Administrator",
  "UI Designer", "UX Designer", "Product Designer", "Product Manager",
  "Project Manager", "Scrum Master", "QA Engineer", "Automation Tester",
  "Manual Tester", "Performance Tester", "Embedded Systems Engineer", "IoT Engineer",
  "ERP Developer", "Technical Support Engineer", "Systems Engineer", "Application Support Engineer",
  "Linux Administrator", "Windows Administrator", "Platform Engineer", "Solutions Architect",
  "Enterprise Architect", "Big Data Engineer", "BI Developer", "Power BI Developer",
  "Tableau Developer", "Robotics Engineer", "AR/VR Developer", "Game Developer",
  "Firmware Engineer", "Site Engineer", "Release Engineer", "Build Engineer",
  "Infrastructure Engineer", "API Developer", "Integration Engineer", "Digital Transformation Consultant",
  "IT Consultant", "Technology Analyst", "Technology Consultant", "Risk Analyst",
  "SOC Analyst", "Cloud Security Engineer", "Penetration Tester", "Information Security Analyst",
  "CRM Developer", "ERP Consultant", "Technical Lead", "Engineering Manager",
  "Software Architect", "Solution Engineer", "AI Research Engineer", "Deep Learning Engineer",
  "Data Architect", "Database Engineer", "Web Developer", "Technical Program Manager", "Other"
];

const ROLE_GROUPS = [
  {
    category: "Software Development",
    roles: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer", "Embedded Systems Engineer"]
  },
  {
    category: "AI & Data Science",
    roles: ["Data Scientist", "Machine Learning Engineer", "Data Analyst", "Data Engineer", "AI Researcher"]
  },
  {
    category: "Cloud & DevOps",
    roles: ["DevOps Engineer", "Cloud Architect", "Site Reliability Engineer (SRE)", "Systems Administrator"]
  },
  {
    category: "Mobile Development",
    roles: ["iOS Developer", "Android Developer", "React Native Developer", "Flutter Developer"]
  },
  {
    category: "Quality Assurance & Testing",
    roles: ["QA Engineer", "Automation Test Engineer", "SDET (Software Development Engineer in Test)"]
  },
  {
    category: "Product & Management",
    roles: ["Product Manager", "Project Manager", "Scrum Master", "Business Analyst"]
  },
  {
    category: "Cybersecurity",
    roles: ["Security Analyst", "Penetration Tester", "Security Engineer", "CISO"]
  },
  {
    category: "Blockchain",
    roles: ["Smart Contracts Developer", "Consensus Engineer", "Web3 Engineer", "Blockchain Developer"]
  }
];

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  
  // ── RESUME ANALYSIS STATE ──
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [result, setResult] = useState(null);
  const [analyzingStep, setAnalyzingStep] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const fileInputRef = useRef(null);

  // ── COVER LETTER STATE ──
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [tone, setTone] = useState('');
  const [clJobDescription, setClJobDescription] = useState('');
  const [clValidationErrors, setClValidationErrors] = useState({ companyName: false, roleTitle: false, tone: false });
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);
  const [clResult, setClResult] = useState('');
  const [clError, setClError] = useState(null);
  const [clMethod, setClMethod] = useState('');
  const [clCopySuccess, setClCopySuccess] = useState(false);
  const [clIsEditing, setClIsEditing] = useState(false);
  const [clEditedText, setClEditedText] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  // ── MOCK INTERVIEW STATE ──
  const [targetRole, setTargetRole] = useState('');
  const [interviewRoleQuery, setInterviewRoleQuery] = useState('');
  const [isInterviewDropdownOpen, setIsInterviewDropdownOpen] = useState(false);
  const [intType, setIntType] = useState('');
  const [intDifficulty, setIntDifficulty] = useState('');
  const [intNumber, setIntNumber] = useState(null);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [qError, setQError] = useState(null);
  const [qMethod, setQMethod] = useState('');
  const [intCopySuccess, setIntCopySuccess] = useState(false);
  const [intValidationErrors, setIntValidationErrors] = useState({ role: false, type: false, difficulty: false, count: false });

  // ── USER AUTH TRIGGER MODAL ──
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('');
  const [loginCallback, setLoginCallback] = useState(null);
  const [savingReport, setSavingReport] = useState(false);
  const [savingCL, setSavingCL] = useState(false);
  const [savingInterview, setSavingInterview] = useState(false);

  // ── TOAST NOTIFICATIONS ──
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Click outside dropdowns
    const handleClickOutside = (event) => {
      if (!event.target.closest('.company-dropdown-container')) setIsCompanyDropdownOpen(false);
      if (!event.target.closest('.role-dropdown-container')) setIsRoleDropdownOpen(false);
      if (!event.target.closest('.interview-dropdown-container')) setIsInterviewDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    // Load Guest State from sessionStorage
    const savedResult = sessionStorage.getItem('guest_resume_result');
    const savedCL = sessionStorage.getItem('guest_cover_letter');
    const savedInterview = sessionStorage.getItem('guest_mock_interview');
    const savedFileName = sessionStorage.getItem('guest_file_name');
    const savedText = sessionStorage.getItem('guest_resume_text');
    
    if (savedResult) setResult(JSON.parse(savedResult));
    if (savedCL) {
      setClResult(savedCL);
      setClEditedText(savedCL);
    }
    if (savedInterview) setQuestions(JSON.parse(savedInterview));
    if (savedFileName) setFile({ name: savedFileName, size: 0 });
    if (savedText) setResumeText(savedText);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const scrollToUpload = (e) => {
    e.preventDefault();
    const element = document.getElementById('upload-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ── ANALYSIS LOGIC ──
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedTypes = ['.pdf', '.docx', '.png', '.jpg', '.jpeg'];
    const ext = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    if (!allowedTypes.includes(ext)) {
      setError('Unsupported file format. Please upload PDF, DOCX, JPG, JPEG, or PNG.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    setFile(selectedFile);
    setError('');
    setValidationError(null);
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setValidationError(null);
    setResult(null);
    setResumeText('');
    setQuestions([]);
    setClResult('');
    setClEditedText('');
    sessionStorage.clear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setIsSubmitting(true);
    setError('');
    setValidationError(null);
    
    const steps = [
      'Scanning document structure...',
      'Extracting professional credentials...',
      'Comparing keywords against templates...',
      'Measuring ATS scoring criteria...',
      'Formulating recruiter audit feedback...'
    ];
    let stepIdx = 0;
    setAnalyzingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setAnalyzingStep(steps[stepIdx]);
    }, 2000);

    const startTime = Date.now();
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription.trim());
      }

      const response = await analysisAPI.analyzeResume(formData);
      clearInterval(stepInterval);
      const responseData = response?.data ?? response;

      if (responseData?.success !== false) {
        const scoreVal = responseData.ats_score ?? responseData.atsScore ?? responseData.score ?? 0;
        const remaining = Math.max(0, MIN_LOADING_TIME - (Date.now() - startTime));
        setTimeout(() => {
          const formattedResult = {
            ...responseData,
            ats_score: scoreVal
          };
          setResult(formattedResult);
          setResumeText(responseData.text || '');
          setUploading(false);
          setAnalyzingStep('');
          setIsSubmitting(false);

          // Save in SessionStorage for guests
          if (!isAuthenticated) {
            sessionStorage.setItem('guest_resume_result', JSON.stringify(formattedResult));
            sessionStorage.setItem('guest_file_name', file.name);
            sessionStorage.setItem('guest_resume_text', responseData.text || '');
          }

          // Auto-scroll to results
          setTimeout(() => {
            const resSection = document.getElementById('results-section');
            if (resSection) {
              resSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 300);
        }, remaining);
      } else {
        throw new Error(responseData?.error || 'Analysis failed');
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
      let errMsg = 'Analysis failed. Please try again.';
      const errObj = err?.response?.data || err;
      if (errObj && errObj.isResume === false) {
        setValidationError({
          isResume: false,
          confidence: errObj.confidence,
          reason: errObj.reason
        });
      } else {
        setError(errObj?.error || errObj?.message || errMsg);
      }
      setUploading(false);
      setAnalyzingStep('');
      setIsSubmitting(false);
    }
  };

  // ── SAVE REPORT ACTION ──
  const handleSaveReport = async () => {
    const saveReportFn = async () => {
      if (file) {
        try {
          setSavingReport(true);
          const formData = new FormData();
          formData.append('resume', file);
          if (jobDescription.trim()) {
            formData.append('jobDescription', jobDescription.trim());
          }
          const res = await analysisAPI.analyzeResume(formData);
          if (res.data?.success !== false) {
            const newRes = res.data ?? res;
            setResult(prev => ({
              ...prev,
              resumeId: newRes.resumeId
            }));
            showToast('success', 'Resume analysis report saved to your account!');
          }
        } catch (e) {
          showToast('error', 'Failed to save analysis report.');
        } finally {
          setSavingReport(false);
        }
      }
    };

    if (!isAuthenticated) {
      setLoginCallback(() => saveReportFn);
      setLoginModalMessage('Sign in or create an account to save this resume analysis report to your account history.');
      setIsLoginModalOpen(true);
      return;
    }

    if (result && !result.resumeId) {
      await saveReportFn();
    } else {
      showToast('info', 'This report is already saved in your history!');
    }
  };

  // ── COVER LETTER GENERATION ──
  const handleGenerateCL = async (e) => {
    if (e) e.preventDefault();
    const missing = {
      companyName: !companyName.trim(),
      roleTitle: !roleTitle.trim(),
      tone: !tone.trim()
    };
    setClValidationErrors(missing);
    
    if (Object.values(missing).some(Boolean)) {
      setClError("Please complete all required fields before generating.");
      return;
    }

    setIsGeneratingCL(true);
    setClError(null);
    try {
      const payload = {
        companyName,
        roleTitle,
        jobDescription: clJobDescription,
        tone,
        resumeText: result?.resumeId ? undefined : resumeText,
        resumeId: result?.resumeId || undefined
      };

      const delayPromise = new Promise(resolve => setTimeout(resolve, 8000));
      const apiPromise = resumeAPI.generateCoverLetterStandalone(payload);
      const [res] = await Promise.all([apiPromise, delayPromise]);

      if (res?.success && res?.coverLetter) {
        setClResult(res.coverLetter);
        setClEditedText(res.coverLetter);
        setClIsEditing(false);
        setClMethod(res.method || 'ai');
        
        if (!isAuthenticated) {
          sessionStorage.setItem('guest_cover_letter', res.coverLetter);
        }
        showToast('success', 'Cover letter generated successfully!');
      } else {
        setClError(res?.error || 'Failed to generate cover letter');
      }
    } catch (err) {
      console.error(err);
      setClError(err?.response?.data?.error || err?.message || 'Error occurred during generation');
    } finally {
      setIsGeneratingCL(false);
    }
  };

  const handleSaveCoverLetter = async () => {
    const saveCLFn = async () => {
      try {
        setSavingCL(true);
        const response = await authAPI.saveCoverLetter({
          title: `${companyName || 'Target'} Cover Letter`,
          companyName,
          roleTitle,
          content: clEditedText || clResult
        });
        if (response.success) {
          showToast('success', 'Cover letter saved to your account!');
        }
      } catch (err) {
        showToast('error', 'Failed to save cover letter.');
      } finally {
        setSavingCL(false);
      }
    };

    if (!isAuthenticated) {
      setLoginCallback(() => saveCLFn);
      setLoginModalMessage('Sign in or register to save this cover letter to your account settings.');
      setIsLoginModalOpen(true);
      return;
    }
    await saveCLFn();
  };

  // ── MOCK INTERVIEW GENERATION ──
  const handleGenerateQuestions = async (e) => {
    if (e) e.preventDefault();
    const missing = {
      role: !targetRole.trim(),
      type: !intType,
      difficulty: !intDifficulty,
      count: intNumber === null
    };
    setIntValidationErrors(missing);

    if (Object.values(missing).some(Boolean)) {
      setQError("Please complete all required fields before generating.");
      return;
    }

    setIsGeneratingInterview(true);
    setQError(null);
    try {
      const payload = {
        domain: targetRole,
        role: targetRole,
        targetRole,
        interviewType: intType,
        type: intType,
        difficulty: intDifficulty,
        questionCount: intNumber,
        number: intNumber,
        resumeText: result?.resumeId ? undefined : resumeText,
        resumeId: result?.resumeId || undefined
      };

      const delayPromise = new Promise(resolve => setTimeout(resolve, 8000));
      const apiPromise = resumeAPI.generateInterviewQuestionsStandalone(payload);
      const [res] = await Promise.all([apiPromise, delayPromise]);

      if (res?.success && res?.questions) {
        setQuestions(res.questions);
        setQMethod(res.method || 'ai');
        if (!isAuthenticated) {
          sessionStorage.setItem('guest_mock_interview', JSON.stringify(res.questions));
        }
        showToast('success', 'Mock interview questions generated!');
      } else {
        setQError(res?.error || 'Failed to generate interview questions');
      }
    } catch (err) {
      console.error(err);
      setQError(err?.response?.data?.error || err?.message || 'Error occurred during generation');
    } finally {
      setIsGeneratingInterview(false);
    }
  };

  const handleSaveInterview = async () => {
    const saveIntFn = async () => {
      try {
        setSavingInterview(true);
        const response = await authAPI.saveInterview({
          role: targetRole,
          difficulty: intDifficulty,
          questions: questions.map(q => ({
            question: q.question,
            answer: ''
          }))
        });
        if (response.success) {
          showToast('success', 'Mock interview saved to your account!');
        }
      } catch (err) {
        showToast('error', 'Failed to save mock interview session.');
      } finally {
        setSavingInterview(false);
      }
    };

    if (!isAuthenticated) {
      setLoginCallback(() => saveIntFn);
      setLoginModalMessage('Sign in or register to save this mock interview session to your account settings.');
      setIsLoginModalOpen(true);
      return;
    }
    await saveIntFn();
  };

  // Autocomplete Autoload values from parsed results
  useEffect(() => {
    if (result) {
      // Auto-extract a potential role title
      if (result.bestFitRole) {
        setRoleTitle(result.bestFitRole);
        setTargetRole(result.bestFitRole);
      }
    }
  }, [result]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreTextColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };

  const handleCopyCLText = () => {
    const text = clEditedText || clResult;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setClCopySuccess(true);
      setTimeout(() => setClCopySuccess(false), 2000);
    });
  };

  const downloadCLAsTXT = () => {
    const text = clEditedText || clResult;
    if (!text) return;
    const element = document.createElement("a");
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(blob);
    element.download = `${roleTitle ? roleTitle.replace(/\s+/g, '_') : 'Candidate'}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  const exportCLAsPDF = () => {
    const text = clEditedText || clResult;
    if (!text) return;
    const html = `
      <div class="header">
        <h1>Cover Letter</h1>
        <p class="meta">Generated for: ${roleTitle || 'Applicant'} on ${new Date().toLocaleDateString()}</p>
      </div>
      <pre>${text}</pre>
    `;
    printPdf('Cover_Letter', html);
  };

  const handleCopyAllQuestions = () => {
    if (!questions.length) return;
    let text = '';
    questions.forEach((q, idx) => {
      text += `Question ${idx + 1}: ${q.question}\n`;
      text += `Difficulty: ${q.difficulty}\n`;
      text += `Why Asked: ${q.why}\n`;
      text += `Expected Answer:\n`;
      if (Array.isArray(q.expectedAnswer)) {
        q.expectedAnswer.forEach(ans => { text += ` - ${ans}\n`; });
      } else {
        text += ` - ${q.expectedAnswer}\n`;
      }
      text += `\n`;
    });
    navigator.clipboard.writeText(text).then(() => {
      setIntCopySuccess(true);
      setTimeout(() => setIntCopySuccess(false), 2000);
    });
  };

  const exportInterviewAsPDF = () => {
    if (!questions.length) return;
    let html = `
      <div class="header">
        <h1>Mock Interview Questions</h1>
        <p class="meta">Target Role: ${targetRole || 'Software Engineer'} | Difficulty: ${intDifficulty} on ${new Date().toLocaleDateString()}</p>
      </div>
    `;
    questions.forEach((q, idx) => {
      html += `
        <div class="question-card">
          <div class="badge">${q.difficulty || intDifficulty}</div>
          <div class="question-title">Q${idx + 1}: ${q.question}</div>
          <div class="section-title">Why this is asked:</div>
          <div class="section-text">${q.why || ''}</div>
          <div class="section-title">Expected talking points:</div>
          <div class="section-text">
            ${Array.isArray(q.expectedAnswer) 
              ? `<ul>${q.expectedAnswer.map(ans => `<li>${ans}</li>`).join('')}</ul>`
              : `<p>${q.expectedAnswer || ''}</p>`
            }
          </div>
        </div>
      `;
    });
    printPdf('Mock_Interview_Questions', html);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ background: 'transparent' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <Hero3DBackground />
        </div>

        <section className="py-20 px-4 relative z-10 overflow-hidden" style={{ background: 'transparent' }}>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10" style={{ background: 'transparent' }}>
            <HeroAnimatedBackground />
            <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10 text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Resume Analysis
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-electric-blue-500 to-cyan-500 bg-clip-text text-transparent mb-6 font-heading">
                Unlock Your Career Potential
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Get instant AI-powered feedback, perfect your skills, and generate job-seeking templates instantly with our intelligent resume analysis platform.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={scrollToUpload}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-electric-blue-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 flex items-center gap-2 group"
                >
                  Analyze My Resume
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={scrollToUpload}
                  className="px-8 py-4 bg-white dark:bg-charcoal-800 text-indigo-600 dark:text-indigo-300 border-2 border-indigo-600 dark:border-indigo-500 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 flex items-center gap-2 group"
                >
                  Try Demo
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              <div className="flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-current" /><span>4.9/5 Rating</span></div>
                <div className="flex items-center gap-1"><Award className="w-4 h-4 text-indigo-500 fill-current" /><span>50k+ Users</span></div>
                <div className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-cyan-500 fill-current" /><span>85% Success Rate</span></div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Main Upload Workspace Section */}
      <section id="upload-section" className="py-16 px-4 bg-white dark:bg-charcoal-900/40">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass bg-white/85 dark:bg-charcoal-800/85 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 dark:border-charcoal-700/50"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-heading text-center">AI Resume Scan Workspace</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6 text-sm">Upload your resume to get instant ATS scores, recruiter review, skill gaps, and interview prep.</p>

            <div className="mb-5 text-left">
              <label htmlFor="job-desc" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Target Job Description (Optional)</label>
              <textarea
                id="job-desc"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to calculate a tailored match score. Leaving this blank matches against default job families."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-250 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm resize-none"
              />
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                uploading
                  ? 'border-cyan-500 bg-cyan-50/20 dark:bg-cyan-900/10'
                  : dragActive
                  ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-900/20 scale-102'
                  : 'border-gray-250 dark:border-charcoal-700 bg-white/40 dark:bg-charcoal-900/20'
              }`}
            >
              {!file ? (
                <div className="space-y-4">
                  <div className="inline-block p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl">
                    <Cloud className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">
                    Drag & drop your resume file here, or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="file-upload"
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold cursor-pointer hover:shadow-md transition-all duration-300 text-sm"
                  >
                    Select Resume File
                  </label>
                  <p className="text-xs text-gray-400">Supported formats: PDF, DOCX, PNG, JPG, JPEG (Max 5MB)</p>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <div className="flex items-center gap-3 truncate text-left">
                    <FileText className="w-10 h-10 text-indigo-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">Ready for analysis</p>
                    </div>
                  </div>
                  <button onClick={removeFile} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-charcoal-800 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {error && <div className="mt-4 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-100 dark:border-red-950/20 text-left">{error}</div>}

            {validationError && (
              <div className="mt-4 p-5 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-950/20 text-left space-y-2">
                <h4 className="font-bold text-red-800 dark:text-red-400 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Invalid Document Type</h4>
                <p className="text-xs text-red-700 dark:text-red-400">The uploaded file did not pass professional resume signature validation. Reason: {validationError.reason || 'Not classified as a resume.'} (Confidence: {validationError.confidence}%)</p>
              </div>
            )}

            {uploading && (
              <div className="mt-6 p-5 bg-slate-50 dark:bg-charcoal-900/50 rounded-xl border border-gray-150 dark:border-charcoal-750 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{analyzingStep}</span>
                </div>
                <div className="w-full bg-gray-250 dark:bg-charcoal-700 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-indigo-600 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              </div>
            )}

            {file && !uploading && !result && (
              <button
                onClick={handleUpload}
                disabled={isSubmitting}
                className="mt-5 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold shadow hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Analyze Resume Now</span>
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            id="results-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="py-16 px-4 bg-slate-50 dark:bg-charcoal-950/20 border-t border-b border-gray-200/50 dark:border-charcoal-750"
          >
            <div className="max-w-4xl mx-auto space-y-8">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">Analysis Results</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Review your compliance scores and suggested improvements.</p>
                </div>
                <button
                  onClick={handleSaveReport}
                  disabled={savingReport}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-semibold shadow hover:shadow-md transition-all duration-300 disabled:opacity-75"
                >
                  {savingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{result.resumeId ? 'Report Saved' : 'Save Report to Account'}</span>
                </button>
              </div>

              {/* 1. Score Display */}
              <div className="glass bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-md border border-white/20 dark:border-charcoal-700 flex flex-col items-center justify-center text-center py-10">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                    <circle 
                      cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={`${2 * Math.PI * 44}`}
                      strokeDashoffset={`${2 * Math.PI * 44 * (1 - (result.ats_score ?? 0) / 100)}`}
                      strokeLinecap="round"
                      style={{ stroke: (result.ats_score ?? 0) >= 80 ? '#22c55e' : (result.ats_score ?? 0) >= 60 ? '#eab308' : '#ef4444' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold font-mono ${getScoreTextColor(result.ats_score ?? 0)}`}>{result.ats_score ?? 0}%</span>
                    <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">{getScoreText(result.ats_score ?? 0)}</span>
                  </div>
                </div>
              </div>

              {/* 2. AI Recruiter Review */}
              {result.recruiterReview && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-150 dark:border-charcoal-700 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      Key Strength Areas
                    </h3>
                    <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
                      {result.recruiterReview.strengths?.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                          <span>{str}</span>
                        </li>
                      )) || <p className="text-gray-400 italic">No specific strengths mapped.</p>}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-150 dark:border-charcoal-700 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                      Improvement Areas
                    </h3>
                    <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
                      {result.recruiterReview.weaknesses?.map((wk, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0" />
                          <span>{wk}</span>
                        </li>
                      )) || <p className="text-gray-400 italic">No specific areas mapped.</p>}
                    </ul>
                  </div>
                </div>
              )}

              {/* 3. Resume Analysis Feedback & Recommendations */}
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-150 dark:border-charcoal-700 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider font-heading">AI Recruiter Overall Feed</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {result.feedback || result.aiExplanation || 'No feedback explanation compiled.'}
                </p>
              </div>

              {/* 4. Skills Found & Suggested Skills */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-150 dark:border-charcoal-700 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-heading mb-4">Detected Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.skills?.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/35 rounded-lg text-xs font-semibold">
                        {skill}
                      </span>
                    )) || <span className="text-gray-400 italic text-sm">No skills parsed.</span>}
                  </div>
                </div>

                <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-150 dark:border-charcoal-700 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-heading mb-4">Suggested Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.skillGaps?.map((gap, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/35 rounded-lg text-xs font-semibold">
                        {gap}
                      </span>
                    )) || <span className="text-gray-400 italic text-sm">No suggestions mapped.</span>}
                  </div>
                </div>
              </div>

              {/* 5. Recruiter Chances */}
              {result.recruiterReview?.chances && (
                <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-150 dark:border-charcoal-700 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-heading mb-4">Probability of Passing Rounds</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'ATS Screening', value: `${result.recruiterReview.chances.atsScreening}%`, color: 'text-indigo-600' },
                      { label: 'Technical Screening', value: `${result.recruiterReview.chances.technicalRound}%`, color: 'text-cyan-500' },
                      { label: 'HR Screening', value: `${result.recruiterReview.chances.hrRound}%`, color: 'text-purple-500' },
                      { label: 'Overall Chances', value: `${result.recruiterReview.chances.overall}%`, color: 'text-green-500' }
                    ].map((chance, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-charcoal-900/30 rounded-xl p-3.5 border border-gray-100 dark:border-charcoal-750 text-center">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{chance.label}</span>
                        <p className={`text-2xl font-bold font-mono mt-1 ${chance.color}`}>{chance.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover Letter Generator Section */}
      <AnimatePresence>
        {result && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 px-4 bg-white dark:bg-charcoal-900/40 border-b border-gray-200/50 dark:border-charcoal-750"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">AI Cover Letter Generator</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Build a matching cover letter utilizing your uploaded resume details.</p>
              </div>

              <div className="glass bg-slate-50/50 dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-150 dark:border-charcoal-700/50 space-y-6">
                <form onSubmit={handleGenerateCL} className="grid md:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div className="space-y-1 text-left relative company-dropdown-container">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        setCompanySearchQuery(e.target.value);
                        setIsCompanyDropdownOpen(true);
                      }}
                      onFocus={() => setIsCompanyDropdownOpen(true)}
                      placeholder="e.g. Google"
                      className={`w-full px-4 py-2.5 bg-white dark:bg-charcoal-900 border ${clValidationErrors.companyName ? 'border-red-500' : 'border-gray-250 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
                    />
                    {isCompanyDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700 rounded-xl shadow-lg">
                        {COMPANIES.filter(c => c.toLowerCase().includes(companySearchQuery.toLowerCase())).map((c, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setCompanyName(c);
                              setIsCompanyDropdownOpen(false);
                            }}
                            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 cursor-pointer"
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Role Title */}
                  <div className="space-y-1 text-left relative role-dropdown-container">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target Role Title</label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => {
                        setRoleTitle(e.target.value);
                        setRoleSearchQuery(e.target.value);
                        setIsRoleDropdownOpen(true);
                      }}
                      onFocus={() => setIsRoleDropdownOpen(true)}
                      placeholder="e.g. Frontend Engineer"
                      className={`w-full px-4 py-2.5 bg-white dark:bg-charcoal-900 border ${clValidationErrors.roleTitle ? 'border-red-500' : 'border-gray-250 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
                    />
                    {isRoleDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700 rounded-xl shadow-lg">
                        {ROLES.filter(r => r.toLowerCase().includes(roleSearchQuery.toLowerCase())).map((r, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setRoleTitle(r);
                              setIsRoleDropdownOpen(false);
                            }}
                            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 cursor-pointer"
                          >
                            {r}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tone */}
                  <div className="space-y-1 text-left">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tone of writing</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className={`w-full px-4 py-2.5 bg-white dark:bg-charcoal-900 border ${clValidationErrors.tone ? 'border-red-500' : 'border-gray-250 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold`}
                    >
                      <option value="">Select Tone</option>
                      <option value="Professional">Professional (Standard)</option>
                      <option value="Confident">Confident & Bold</option>
                      <option value="Creative">Creative & Unique</option>
                      <option value="Friendly">Warm & Friendly</option>
                    </select>
                  </div>

                  {/* Job Description Optional */}
                  <div className="space-y-1 text-left md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job Description context (Optional)</label>
                    <textarea
                      value={clJobDescription}
                      onChange={(e) => setClJobDescription(e.target.value)}
                      placeholder="Paste details of the role here to customize prompts..."
                      rows={2}
                      className="w-full px-4 py-2.5 bg-white dark:bg-charcoal-900 border border-gray-250 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingCL}
                    className="md:col-span-2 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-550 text-white rounded-xl font-semibold shadow hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-75"
                  >
                    {isGeneratingCL ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating cover letter (takes ~10s)...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Cover Letter
                      </>
                    )}
                  </button>
                </form>

                {clError && <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-100 dark:border-red-950/20 text-left">{clError}</div>}

                {/* Cover Letter Output */}
                {clResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 border-t border-gray-250 dark:border-charcoal-700 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Generated Output</span>
                      <div className="flex gap-2">
                        <button onClick={handleCopyCLText} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700 rounded-xl text-xs flex items-center gap-1.5 transition-all">
                          <Copy className="w-3.5 h-3.5" />
                          <span>{clCopySuccess ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button onClick={downloadCLAsTXT} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700 rounded-xl text-xs flex items-center gap-1.5 transition-all">
                          <FileText className="w-3.5 h-3.5" />
                          <span>TXT</span>
                        </button>
                        <button onClick={exportCLAsPDF} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700 rounded-xl text-xs flex items-center gap-1.5 transition-all">
                          <Download className="w-3.5 h-3.5" />
                          <span>Print PDF</span>
                        </button>
                        <button onClick={handleSaveCoverLetter} disabled={savingCL} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs flex items-center gap-1.5 transition-all">
                          {savingCL ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          <span>Save to Account</span>
                        </button>
                      </div>
                    </div>

                    {clIsEditing ? (
                      <textarea
                        value={clEditedText}
                        onChange={(e) => setClEditedText(e.target.value)}
                        rows={12}
                        className="w-full p-4 bg-white dark:bg-charcoal-900 border border-gray-250 dark:border-charcoal-755 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-gray-200 resize-y"
                      />
                    ) : (
                      <div className="p-4 bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-750 rounded-xl font-sans text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                        {clEditedText || clResult}
                      </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        if (clIsEditing) setClResult(clEditedText);
                        setClIsEditing(!clIsEditing);
                      }} 
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      {clIsEditing ? 'Lock Changes' : '📝 Inline Edit Content'}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Mock Interview Generator Section */}
      <AnimatePresence>
        {result && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 px-4 bg-slate-50 dark:bg-charcoal-950/20 border-b border-gray-200/50 dark:border-charcoal-750"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">AI Mock Interview Generator</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Generate tailored technical and behavioral questions from your resume.</p>
              </div>

              <div className="glass bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-150 dark:border-charcoal-700/50 space-y-6">
                <form onSubmit={handleGenerateQuestions} className="grid md:grid-cols-2 gap-4">
                  {/* Target Role */}
                  <div className="space-y-1 text-left relative interview-dropdown-container">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target Job Role</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => {
                        setTargetRole(e.target.value);
                        setInterviewRoleQuery(e.target.value);
                        setIsInterviewDropdownOpen(true);
                      }}
                      onFocus={() => setIsInterviewDropdownOpen(true)}
                      placeholder="e.g. Full Stack Developer"
                      className={`w-full px-4 py-2.5 bg-white dark:bg-charcoal-900 border ${intValidationErrors.role ? 'border-red-500' : 'border-gray-250 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
                    />
                    {isInterviewDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700 rounded-xl shadow-lg">
                        {ROLE_GROUPS.map((group) => (
                          <div key={group.category}>
                            <div className="px-3 py-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-charcoal-950/20 uppercase tracking-wider">{group.category}</div>
                            {group.roles.filter(r => r.toLowerCase().includes(interviewRoleQuery.toLowerCase())).map((r, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setTargetRole(r);
                                  setIsInterviewDropdownOpen(false);
                                }}
                                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 cursor-pointer pl-6"
                              >
                                {r}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interview Type */}
                  <div className="space-y-1 text-left">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interview Type</label>
                    <select
                      value={intType}
                      onChange={(e) => setIntType(e.target.value)}
                      className={`w-full px-4 py-2.5 bg-white dark:bg-charcoal-900 border ${intValidationErrors.type ? 'border-red-500' : 'border-gray-250 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold`}
                    >
                      <option value="">Select Type</option>
                      <option value="Technical">Technical (Coding & System Design)</option>
                      <option value="HR">HR & Behavioral</option>
                      <option value="Mixed">Mixed Rounds</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-1 text-left">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Difficulty Level</label>
                    <select
                      value={intDifficulty}
                      onChange={(e) => setIntDifficulty(e.target.value)}
                      className={`w-full px-4 py-2.5 bg-white dark:bg-charcoal-900 border ${intValidationErrors.difficulty ? 'border-red-500' : 'border-gray-250 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold`}
                    >
                      <option value="">Select Difficulty</option>
                      <option value="Easy">Easy (Entry-level)</option>
                      <option value="Medium">Medium (Mid-level)</option>
                      <option value="Hard">Hard (Senior/Staff)</option>
                    </select>
                  </div>

                  {/* Count */}
                  <div className="space-y-1 text-left">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Question Count</label>
                    <select
                      value={intNumber || ''}
                      onChange={(e) => setIntNumber(Number(e.target.value))}
                      className={`w-full px-4 py-2.5 bg-white dark:bg-charcoal-900 border ${intValidationErrors.count ? 'border-red-500' : 'border-gray-250 dark:border-charcoal-700'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold`}
                    >
                      <option value="">Select Count</option>
                      <option value="5">5 Questions</option>
                      <option value="10">10 Questions</option>
                      <option value="15">15 Questions</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingInterview}
                    className="md:col-span-2 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-555 text-white rounded-xl font-semibold shadow hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-75"
                  >
                    {isGeneratingInterview ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating interview questions (~10s)...
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Generate Mock Interview
                      </>
                    )}
                  </button>
                </form>

                {qError && <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-100 dark:border-red-950/20 text-left">{qError}</div>}

                {/* Interview Questions Output */}
                {questions.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 border-t border-gray-250 dark:border-charcoal-700 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Compiled Questions</span>
                      <div className="flex gap-2">
                        <button onClick={handleCopyAllQuestions} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700 rounded-xl text-xs flex items-center gap-1.5 transition-all">
                          <Copy className="w-3.5 h-3.5" />
                          <span>{intCopySuccess ? 'Copied' : 'Copy All'}</span>
                        </button>
                        <button onClick={exportInterviewAsPDF} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-charcoal-900 border border-gray-200 dark:border-charcoal-700 rounded-xl text-xs flex items-center gap-1.5 transition-all">
                          <Download className="w-3.5 h-3.5" />
                          <span>Print PDF</span>
                        </button>
                        <button onClick={handleSaveInterview} disabled={savingInterview} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs flex items-center gap-1.5 transition-all">
                          {savingInterview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          <span>Save to Account</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {questions.map((q, idx) => (
                        <div key={q.id || idx} className="p-4 bg-white dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-750 rounded-xl space-y-2 text-sm leading-relaxed">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">Question {idx + 1}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-charcoal-800 text-gray-500 dark:text-gray-400 rounded uppercase tracking-wider">{q.difficulty || intDifficulty}</span>
                          </div>
                          <p className="font-semibold text-gray-800 dark:text-white">{q.question}</p>
                          <div className="pt-2 text-xs border-t border-gray-100 dark:border-charcoal-850 space-y-1.5">
                            <p className="text-gray-500 dark:text-gray-400"><strong className="text-gray-650 dark:text-gray-300">Why Asked: </strong>{q.why}</p>
                            <div>
                              <strong className="text-gray-650 dark:text-gray-300">Expected Answers: </strong>
                              {Array.isArray(q.expectedAnswer) ? (
                                <ul className="list-disc pl-4 mt-1 space-y-1">
                                  {q.expectedAnswer.map((ans, i) => <li key={i} className="text-gray-600 dark:text-gray-300">{ans}</li>)}
                                </ul>
                              ) : (
                                <span className="text-gray-650 dark:text-gray-300">{q.expectedAnswer}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <Footer />

      {/* Auth Optional Login Modal Overlay */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          message={loginModalMessage}
          onClose={() => {
            setIsLoginModalOpen(false);
            setLoginCallback(null);
          }}
          onSuccess={() => {
            if (loginCallback) {
              loginCallback();
            }
          }}
        />
      )}

      {/* Floating Success/Error Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-[200] px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 border ${
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

    </div>
  );
};

export default Landing;
