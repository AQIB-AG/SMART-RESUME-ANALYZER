import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { resumeAPI, analysisAPI } from '../services/api';
import { 
  Download, 
  Share2, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Target, 
  Zap, 
  BarChart3, 
  FileText, 
  ArrowRight, 
  Flame, 
  ThumbsUp, 
  AlertTriangle, 
  Copy, 
  RefreshCw, 
  Sparkles, 
  HelpCircle,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
          .question-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 18px;
            margin-bottom: 20px;
            page-break-inside: avoid;
            background-color: #f8fafc;
          }
          .question-title {
            font-weight: 700;
            font-size: 16px;
            color: #4f46e5;
            margin-bottom: 8px;
          }
          .section-title {
            font-weight: 600;
            margin-top: 12px;
            margin-bottom: 4px;
            font-size: 13px;
            color: #334155;
          }
          .section-text {
            font-size: 14px;
            color: #475569;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            background-color: #e2e8f0;
            color: #334155;
            margin-bottom: 10px;
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
    roles: [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "Software Engineer",
      "Embedded Systems Engineer"
    ]
  },
  {
    category: "AI & Data Science",
    roles: [
      "Data Scientist",
      "Machine Learning Engineer",
      "Data Analyst",
      "Data Engineer",
      "AI Researcher"
    ]
  },
  {
    category: "Cloud & DevOps",
    roles: [
      "DevOps Engineer",
      "Cloud Architect",
      "Site Reliability Engineer (SRE)",
      "Systems Administrator"
    ]
  },
  {
    category: "Mobile Development",
    roles: [
      "iOS Developer",
      "Android Developer",
      "React Native Developer",
      "Flutter Developer"
    ]
  },
  {
    category: "Quality Assurance & Testing",
    roles: [
      "QA Engineer",
      "Automation Test Engineer",
      "SDET (Software Development Engineer in Test)"
    ]
  },
  {
    category: "Product & Management",
    roles: [
      "Product Manager",
      "Project Manager",
      "Scrum Master",
      "Business Analyst"
    ]
  },
  {
    category: "Cybersecurity",
    roles: [
      "Security Analyst",
      "Penetration Tester",
      "Security Engineer",
      "CISO"
    ]
  }
];

const ResumeResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'analysis';

  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Nav Tabs state
  const [activeTab, setActiveTab] = useState(initialTab); // 'analysis', 'cover-letter', 'mock-interview'

  // Cover Letter states
  const [clCompany, setClCompany] = useState('');
  const [clRole, setClRole] = useState('');
  const [clJobDesc, setClJobDesc] = useState('');
  const [clTone, setClTone] = useState('Professional');
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);
  const [clResult, setClResult] = useState('');
  const [clError, setClError] = useState(null);
  const [clMethod, setClMethod] = useState('');
  const [copyCLSuccess, setCopyCLSuccess] = useState(false);
  const [isEditingCL, setIsEditingCL] = useState(false);
  const [clEditedText, setClEditedText] = useState('');

  // Dropdown states for cover letter
  const [clCompanyDropdownOpen, setClCompanyDropdownOpen] = useState(false);
  const [clCompanySearchQuery, setClCompanySearchQuery] = useState('');
  const [clCompanyOtherSelected, setClCompanyOtherSelected] = useState(false);

  const [clRoleDropdownOpen, setClRoleDropdownOpen] = useState(false);
  const [clRoleSearchQuery, setClRoleSearchQuery] = useState('');
  const [clRoleOtherSelected, setClRoleOtherSelected] = useState(false);

  const [intType, setIntType] = useState('');
  const [intDifficulty, setIntDifficulty] = useState('');
  const [intNumber, setIntNumber] = useState(null);
  const [isGeneratingQ, setIsGeneratingQ] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [qError, setQError] = useState(null);
  const [qMethod, setQMethod] = useState('');
  const [copyQSuccess, setCopyQSuccess] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ role: false, type: false, difficulty: false, count: false });

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    fetchResumeData();
  }, [id]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab');
    if (tab && ['analysis', 'cover-letter', 'mock-interview'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.cl-company-dropdown-container')) {
        setClCompanyDropdownOpen(false);
      }
      if (!event.target.closest('.cl-role-dropdown-container')) {
        setClRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchResumeData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [resumeRes, analysisRes] = await Promise.all([
        resumeAPI.getOne(id).catch((err) => ({ success: false, error: err })),
        analysisAPI.getSummary(id).catch(() => null)
      ]);

      if (resumeRes?.success && resumeRes?.data?.resume) {
        setResume(resumeRes.data.resume);
      } else {
        setResume(null);
      }

      if (analysisRes?.success && analysisRes?.data) {
        setAnalysis(analysisRes.data);
      } else {
        try {
          const analyzeRes = await analysisAPI.analyze(id);
          if (analyzeRes?.success && analyzeRes?.data) {
            setAnalysis(analyzeRes.data);
          } else {
            setAnalysis(null);
          }
        } catch (err) {
          console.error('Analysis fetch error:', err);
          setAnalysis(null);
        }
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      setFetchError(error?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Cover Letter Handler
  const handleGenerateCL = async (e) => {
    if (e) e.preventDefault();
    setIsGeneratingCL(true);
    setClError(null);
    try {
      const delayPromise = new Promise(resolve => setTimeout(resolve, 10000));
      const apiPromise = resumeAPI.generateCoverLetter(id, {
        companyName: clCompany,
        roleTitle: clRole,
        jobDescription: clJobDesc,
        tone: clTone
      });
      const [res] = await Promise.all([apiPromise, delayPromise]);
      if (res?.success && res?.coverLetter) {
        setClResult(res.coverLetter);
        setClEditedText(res.coverLetter);
        setIsEditingCL(false);
        setClMethod(res.method || 'ai');
      } else {
        setClError(res?.error || 'Failed to generate cover letter');
      }
    } catch (err) {
      console.error(err);
      setClError(err?.error || err?.message || 'Error occurred during generation');
    } finally {
      setIsGeneratingCL(false);
    }
  };

  // Generate Interview Questions Handler
  const handleGenerateQuestions = async (e) => {
    if (e) e.preventDefault();

    // Validate required fields
    const missing = {
      role: !targetRole.trim(),
      type: !intType,
      difficulty: !intDifficulty,
      count: intNumber === null
    };
    setValidationErrors(missing);

    const missingFields = [];
    if (missing.role) missingFields.push('Target Job Role');
    if (missing.type) missingFields.push('Interview Type');
    if (missing.difficulty) missingFields.push('Difficulty Level');
    if (missing.count) missingFields.push('Number of Questions');

    if (missingFields.length > 0) {
      setQError(`Please select the following before generating: ${missingFields.join(', ')}.`);
      return;
    }

    setIsGeneratingQ(true);
    setQError(null);
    try {
      const domain = targetRole;
      const interviewType = intType;
      const difficulty = intDifficulty;
      const questionCount = intNumber;

      const delayPromise = new Promise(resolve => setTimeout(resolve, 3000));
      const apiPromise = resumeAPI.generateInterviewQuestions(id, {
        domain,
        role: domain,
        targetRole: domain,
        interviewType,
        type: interviewType,
        difficulty,
        questionCount,
        number: questionCount
      });
      const [res] = await Promise.all([apiPromise, delayPromise]);
      if (res?.success && res?.questions) {
        setQuestions(res.questions);
        setQMethod(res.method || 'ai');
      } else {
        setQError(res?.error || 'Failed to generate interview questions');
      }
    } catch (err) {
      console.error(err);
      setQError(err?.error || err?.message || 'Error occurred during generation');
    } finally {
      setIsGeneratingQ(false);
    }
  };

  // Clipboard Helpers
  const handleCopyText = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'cl') {
        setCopyCLSuccess(true);
        setTimeout(() => setCopyCLSuccess(false), 2000);
      } else {
        setCopyQSuccess(true);
        setTimeout(() => setCopyQSuccess(false), 2000);
      }
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  // Cover Letter Export Helpers
  const downloadCLAsTXT = () => {
    const textToExport = clEditedText || clResult;
    if (!textToExport) return;
    const element = document.createElement("a");
    const file = new Blob([textToExport], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const candidateName = resume?.name?.replace(/\s+/g, '_') || 'Candidate';
    element.download = `${candidateName}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportCLAsPDF = () => {
    const textToExport = clEditedText || clResult;
    if (!textToExport) return;
    const html = `
      <div class="header">
        <h1>Cover Letter</h1>
        <p class="meta">Generated for: ${resume?.name || 'Applicant'} on ${new Date().toLocaleDateString()}</p>
      </div>
      <div class="content">
        <pre>${textToExport}</pre>
      </div>
    `;
    printPdf('Cover Letter', html);
  };

  // Questions Export Helpers
  const downloadQAsTXT = () => {
    if (!questions.length) return;
    let textContent = `SMART RESUME ANALYZER - MOCK INTERVIEW QUESTIONS\n`;
    textContent += `Generated for: ${resume?.name || 'Applicant'}\n`;
    textContent += `Difficulty: ${intDifficulty} | Mode: ${intType}\n`;
    textContent += `Date: ${new Date().toLocaleDateString()}\n`;
    textContent += `=========================================\n\n`;

    questions.forEach((q, idx) => {
      textContent += `Q${idx + 1}: ${q.question}\n`;
      textContent += `Difficulty: ${q.difficulty}\n`;
      textContent += `Why: ${q.why}\n`;
      textContent += `Expected Answer Outline:\n`;
      if (Array.isArray(q.expectedAnswer)) {
        q.expectedAnswer.forEach(pt => {
          textContent += `  - ${pt}\n`;
        });
      } else {
        textContent += `  - ${q.expectedAnswer}\n`;
      }
      textContent += `-----------------------------------------\n\n`;
    });

    const element = document.createElement("a");
    const file = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const candidateName = resume?.name?.replace(/\s+/g, '_') || 'Candidate';
    element.download = `${candidateName}_Interview_Questions.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportQAsPDF = () => {
    if (!questions.length) return;
    let html = `
      <div class="header">
        <h1>Mock Interview Questions</h1>
        <p class="meta">Generated for: ${resume?.name || 'Applicant'} | Category: ${intType} | Difficulty: ${intDifficulty}</p>
      </div>
      <div class="content">
    `;

    questions.forEach((q, idx) => {
      const answersHtml = Array.isArray(q.expectedAnswer)
        ? q.expectedAnswer.map(ans => `<li>${ans}</li>`).join('')
        : typeof q.expectedAnswer === 'string'
        ? `<li>${q.expectedAnswer}</li>`
        : '';

      html += `
        <div class="question-card">
          <div class="badge">Q${idx + 1} - ${q.difficulty}</div>
          <div class="question-title">${q.question}</div>
          <div class="section-title">Why it is asked:</div>
          <div class="section-text">${q.why}</div>
          <div class="section-title">Expected answer outline:</div>
          <ul class="section-text" style="padding-left: 20px; margin-top: 5px; margin-bottom: 0;">
            ${answersHtml}
          </ul>
        </div>
      `;
    });

    html += `</div>`;
    printPdf('Mock Interview Questions', html);
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
        q.expectedAnswer.forEach(ans => {
          text += ` - ${ans}\n`;
        });
      } else {
        text += ` - ${q.expectedAnswer}\n`;
      }
      text += `\n`;
    });
    handleCopyText(text, 'questions');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analysis...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (fetchError || !resume) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {fetchError || 'Resume not found.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const aiUsed = analysis?.ai_used ?? resume.aiUsed ?? false;
  const atsScore = analysis?.ats_score ?? resume?.ats_score ?? resume?.atsScore ?? 0;
  const scoreSource = analysis?.score_source ?? (resume?.aiUsed ? 'ai' : 'keyword');
  
  const getScoreLabel = (s) => {
    if (s >= 80) return { label: 'Excellent Match!', emoji: '🔥', color: 'text-red-500' };
    if (s >= 60) return { label: 'Good', emoji: '😃', color: 'text-green-500' };
    return { label: 'Needs Improvement', emoji: '⚠️', color: 'text-yellow-500' };
  };

  const scoreInfo = getScoreLabel(atsScore);
  const matchedSkills = analysis?.extracted_skills ?? resume?.skills ?? [];
  const missingSkills = analysis?.skill_gaps ?? resume?.skillGaps ?? [];
  const aiExplanation = analysis?.ai_explanation ?? resume?.aiExplanation ?? '';
  const feedback = analysis?.feedback ?? resume?.feedback ?? '';
  const bestFitRole = analysis?.best_fit_role ?? resume?.bestFitRole;
  const jobMatchPercentage = analysis?.job_match_percentage ?? resume?.jobMatchPercentage;

  const genericRecommendations = [
    'Quantify achievements with specific metrics (e.g., "Increased revenue by 15%").',
    'Tailor your resume for each specific job application by highlighting relevant keywords.',
    'Consider adding a "Projects" section to showcase your practical experience.',
    'Refine your summary statement to be more impactful and career-goal oriented.',
    'Seek peer review for fresh perspectives and error checking.'
  ];

  const generateChartData = () => [
    { name: 'ATS Score', value: atsScore },
    { name: 'Remaining', value: 100 - atsScore },
  ];

  const COLORS = ['#6366f1', '#e5e7eb'];

  const skillChartData = [
    { name: 'Matched', value: Math.max(0, matchedSkills.length) },
    { name: 'Missing', value: Math.max(0, missingSkills.length) },
  ];

  const skillColors = ['#10b981', '#f59e0b'];

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'cover-letter':
        return {
          title: '📄 Cover Letter Generator',
          description: 'Generate and customize a personalized, ATS-friendly cover letter based on your resume and target role.'
        };
      case 'mock-interview':
        return {
          title: '🎤 AI Mock Interview',
          description: 'Prepare with custom technical and HR questions tailored to your target job role and experience.'
        };
      case 'analysis':
      default:
        return {
          title: '📊 Resume Analysis Results',
          description: 'Detailed evaluation, ATS score match metrics, and actionable skill recommendations.'
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <Layout>
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {analysis == null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl text-amber-800 dark:text-amber-200"
            >
              <p className="font-medium">
                Analysis data not found. Please re-analyze the resume from Upload to generate a full report.
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 font-heading font-sans">
              {headerInfo.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {headerInfo.description}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Tab 1: Analysis Report */}
            {activeTab === 'analysis' && (
              <motion.div
                key="analysis-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-3 gap-6"
              >
                {/* Left Column - Resume Score */}
                <div className="lg:col-span-1">
                  <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Resume Score</h2>
                      </div>
                      {aiUsed && (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                          AI Analyzed
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative w-48 h-48 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={generateChartData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {generateChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                              ))}
                            </Pie>
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold text-gray-900 dark:text-white">
                              {atsScore}%
                            </text>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className={`text-3xl mb-2 ${scoreInfo.color}`}>{scoreInfo.emoji}</div>
                      <div className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{scoreInfo.label}</div>
                      <p className="text-gray-600 dark:text-gray-300 text-center text-sm">
                        {atsScore >= 80
                          ? `Your resume is ${atsScore}% job-ready 🚀 Let's push it to 95%+`
                          : atsScore >= 60
                          ? `Your resume is ${atsScore}% job-ready. Good progress!`
                          : `Your resume is ${atsScore}% job-ready. Focus on adding relevant skills.`}
                      </p>
                      {(bestFitRole != null || jobMatchPercentage != null) && (
                        <div className="flex flex-wrap gap-2 justify-center mt-2">
                          {bestFitRole != null && (
                            <span className="px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                              Best-fit: {bestFitRole}
                            </span>
                          )}
                          {jobMatchPercentage != null && (
                            <span className="px-3 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium">
                              Match: {jobMatchPercentage}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const html = `
                            <div class="header">
                              <h1>Resume Analysis Report</h1>
                              <p class="meta">Generated for: ${resume.name} on ${new Date().toLocaleDateString()}</p>
                            </div>
                            <div class="content">
                              <div class="question-card">
                                <div class="question-title">Overall Score: ${atsScore}%</div>
                                <p class="section-text">${feedback || aiExplanation}</p>
                              </div>
                              <div class="question-card">
                                <div class="question-title">Extracted Skills</div>
                                <p class="section-text">${matchedSkills.join(', ')}</p>
                              </div>
                              <div class="question-card">
                                <div class="question-title">Skill Gaps / Missing Suggestions</div>
                                <p class="section-text">${missingSkills.length ? missingSkills.join(', ') : 'None identified'}</p>
                              </div>
                            </div>
                          `;
                          printPdf('Analysis Report', html);
                        }}
                        className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        <Download className="w-5 h-5" />
                        Export Report
                      </motion.button>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium flex items-center justify-center gap-2 mt-4"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Back to Dashboard
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Analysis Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Matched Skills */}
                  <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Matched Skills</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      These are the key skills identified in your resume that align with your target roles.
                    </p>
                    <div className="flex flex-wrap gap-3 mb-6">
                      {matchedSkills.slice(0, 15).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium border border-green-200 dark:border-green-700/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skill Suggestions / Skill gaps */}
                  <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                        {missingSkills.length ? 'Skill Gaps / Missing Skills' : 'Missing Skill Suggestions'}
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {missingSkills.length
                        ? 'Consider adding or highlighting these skills to improve your match for the target role or job.'
                        : 'Consider adding these highly sought-after skills to enhance your resume for relevant job applications.'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {missingSkills.length > 0
                        ? missingSkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium border border-yellow-200 dark:border-yellow-700/50"
                            >
                              {skill}
                            </span>
                          ))
                        : ['Relevant keywords for target role', 'Quantifiable achievements', 'Clear section headings', 'Contact & links'].map((s, idx) => (
                            <span key={idx} className="px-4 py-2 bg-gray-100 dark:bg-charcoal-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                              {s}
                            </span>
                          ))}
                    </div>
                  </div>

                  {/* AI Explanation / Feedback / Actionable Recommendations */}
                  <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 dark:border-charcoal-700/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                        {aiUsed ? 'AI Analysis & Recommendations' : 'Actionable Recommendations'}
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {aiUsed
                        ? 'Recruiter-style feedback based on your resume and target role or job description.'
                        : "Follow these personalized steps to significantly improve your resume's impact and effectiveness."}
                    </p>
                    {aiUsed ? (
                      <div className="p-4 bg-white/30 dark:bg-charcoal-700/30 rounded-xl border border-white/40 dark:border-charcoal-600/50">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {aiExplanation || feedback || 'AI analysis completed successfully.'}
                        </p>
                      </div>
                    ) : (
                      <ul className="space-y-4">
                        {genericRecommendations.map((rec, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-4 p-4 bg-white/30 dark:bg-charcoal-700/30 rounded-xl border border-white/40 dark:border-charcoal-600/50"
                          >
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 flex-1">{rec}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 2: AI Cover Letter Generator */}
            {activeTab === 'cover-letter' && (
              <motion.div
                key="cover-letter-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-12 gap-8"
              >
                {/* Form Inputs (Left) */}
                <div className="md:col-span-5 lg:col-span-4 space-y-6">
                  <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      Letter Setup
                    </h2>
                    
                    <form onSubmit={handleGenerateCL} className="space-y-4">
                      <div className="cl-company-dropdown-container">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Company Name
                        </label>
                        {clCompanyOtherSelected ? (
                          <div className="relative">
                            <input
                              type="text"
                              value={clCompany}
                              onChange={(e) => setClCompany(e.target.value)}
                              placeholder="Enter Company Name"
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setClCompanyOtherSelected(false);
                                setClCompany('');
                                setClCompanySearchQuery('');
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                            >
                              Use List
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setClCompanyDropdownOpen(!clCompanyDropdownOpen)}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-gray-900 dark:text-white rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm flex items-center justify-between"
                            >
                              <span className="truncate">{clCompany || "Select Company"}</span>
                              <span className="text-gray-400">▼</span>
                            </button>
                            {clCompanyDropdownOpen && (
                              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 rounded-xl shadow-xl p-2 flex flex-col gap-2">
                                <input
                                  type="text"
                                  value={clCompanySearchQuery}
                                  onChange={(e) => setClCompanySearchQuery(e.target.value)}
                                  placeholder="Search company..."
                                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                                  autoFocus
                                />
                                <div className="max-h-48 overflow-y-auto space-y-0.5">
                                  {COMPANIES.filter(c => 
                                    c.toLowerCase().includes(clCompanySearchQuery.toLowerCase())
                                  ).length === 0 ? (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 p-2 text-center">
                                      No matches found. Select "Other" to type.
                                    </div>
                                  ) : (
                                    COMPANIES.filter(c => 
                                      c.toLowerCase().includes(clCompanySearchQuery.toLowerCase())
                                    ).map(c => (
                                      <button
                                        key={c}
                                        type="button"
                                        onClick={() => {
                                          if (c === "Other") {
                                            setClCompanyOtherSelected(true);
                                            setClCompany('');
                                          } else {
                                            setClCompany(c);
                                          }
                                          setClCompanyDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg cursor-pointer transition-colors"
                                      >
                                        {c}
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="cl-role-dropdown-container">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Role Title
                        </label>
                        {clRoleOtherSelected ? (
                          <div className="relative">
                            <input
                              type="text"
                              value={clRole}
                              onChange={(e) => setClRole(e.target.value)}
                              placeholder="Enter Job Role"
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setClRoleOtherSelected(false);
                                setClRole('');
                                setClRoleSearchQuery('');
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                            >
                              Use List
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setClRoleDropdownOpen(!clRoleDropdownOpen)}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-gray-900 dark:text-white rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm flex items-center justify-between"
                            >
                              <span className="truncate">{clRole || "Select Job Role"}</span>
                              <span className="text-gray-400">▼</span>
                            </button>
                            {clRoleDropdownOpen && (
                              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 rounded-xl shadow-xl p-2 flex flex-col gap-2">
                                <input
                                  type="text"
                                  value={clRoleSearchQuery}
                                  onChange={(e) => setClRoleSearchQuery(e.target.value)}
                                  placeholder="Search job role..."
                                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                                  autoFocus
                                />
                                <div className="max-h-48 overflow-y-auto space-y-0.5">
                                  {ROLES.filter(r => 
                                    r.toLowerCase().includes(clRoleSearchQuery.toLowerCase())
                                  ).length === 0 ? (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 p-2 text-center">
                                      No matches found. Select "Other" to type.
                                    </div>
                                  ) : (
                                    ROLES.filter(r => 
                                      r.toLowerCase().includes(clRoleSearchQuery.toLowerCase())
                                    ).map(r => (
                                      <button
                                        key={r}
                                        type="button"
                                        onClick={() => {
                                          if (r === "Other") {
                                            setClRoleOtherSelected(true);
                                            setClRole('');
                                          } else {
                                            setClRole(r);
                                          }
                                          setClRoleDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg cursor-pointer transition-colors"
                                      >
                                        {r}
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Tone Selector
                        </label>
                        <select
                          value={clTone}
                          onChange={(e) => setClTone(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        >
                          <option value="Professional">Professional (Recommended)</option>
                          <option value="Formal">Formal</option>
                          <option value="Friendly">Friendly</option>
                          <option value="Enthusiastic">Enthusiastic</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Job Description (optional)
                        </label>
                        <textarea
                          rows="6"
                          value={clJobDesc}
                          onChange={(e) => setClJobDesc(e.target.value)}
                          placeholder="Paste the target job description here to tailor match matching skills and projects..."
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isGeneratingCL}
                        className={`w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                          isGeneratingCL ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {isGeneratingCL ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Generating Letter...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Generate Cover Letter
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Cover Letter Output editor (Right) */}
                <div className="md:col-span-7 lg:col-span-8">
                  <div className={`glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50 min-h-[500px] flex flex-col justify-between${isGeneratingCL ? ' rotating-neon-border' : ''}`}>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-charcoal-700 pb-4 mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Generated Cover Letter
                          </h2>
                          {clMethod && (
                            <span className="text-xs text-gray-500 mt-1 block">
                              Source: {clMethod === 'ai' ? '🤖 Advanced AI' : '⚙️ Template Fallback'}
                            </span>
                          )}
                        </div>

                        {clResult && (
                          <div className="flex flex-wrap gap-2">
                            {isEditingCL ? (
                              <button
                                onClick={() => {
                                  setClResult(clEditedText);
                                  setIsEditingCL(false);
                                }}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 text-xs font-semibold"
                                title="Save Changes"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Save Changes
                              </button>
                            ) : (
                              <button
                                onClick={() => setIsEditingCL(true)}
                                className="p-2 bg-slate-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                                title="Edit Content"
                              >
                                <span>✏️ Edit</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleCopyText(clEditedText || clResult, 'cl')}
                              className="p-2 bg-slate-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-all relative flex items-center gap-1.5 text-xs font-semibold"
                              title="Copy"
                            >
                              <Copy className="w-4 h-4" />
                              {copyCLSuccess ? 'Copied!' : '📋 Copy'}
                            </button>
                            <button
                              onClick={downloadCLAsTXT}
                              className="p-2 bg-slate-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                              title="Download Text File"
                            >
                              <FileText className="w-4 h-4" />
                              ⬇ Download TXT
                            </button>
                            <button
                              onClick={exportCLAsPDF}
                              className="p-2 bg-slate-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                              title="Print/Save as PDF"
                            >
                              <Download className="w-4 h-4" />
                              ⬇ Download PDF
                            </button>
                            <button
                              onClick={handleGenerateCL}
                              disabled={isGeneratingCL}
                              className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-1.5 text-xs font-semibold"
                              title="Regenerate"
                            >
                              <RefreshCw className={`w-4 h-4 ${isGeneratingCL ? 'animate-spin' : ''}`} />
                              🔄 Regenerate
                            </button>
                          </div>
                        )}
                      </div>

                      {clError && (
                        <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
                          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">Generation Error:</span> {clError}
                          </div>
                        </div>
                      )}

                      {isGeneratingCL ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="relative mb-4">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <Sparkles className="w-6 h-6 text-cyan-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">
                            Analyzing parsed resume data and target metrics<span className="loading-dots"></span>
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 max-w-sm">
                            Tailoring key achievements, sorting matched keywords, and preparing formatting parameters.
                          </p>
                        </div>
                      ) : clResult ? (
                        isEditingCL ? (
                          <textarea
                            value={clEditedText}
                            onChange={(e) => setClEditedText(e.target.value)}
                            className="w-full h-[500px] p-6 md:p-8 bg-slate-50/50 dark:bg-charcoal-900/50 border border-indigo-500 dark:border-indigo-400 rounded-2xl font-sans leading-relaxed text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-0 resize-y"
                            placeholder="Edit your cover letter here..."
                          />
                        ) : (
                          <div className="bg-slate-50/50 dark:bg-charcoal-900/50 border border-slate-100 dark:border-charcoal-700/50 rounded-2xl p-6 md:p-8 max-h-[600px] overflow-y-auto font-sans leading-relaxed text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap select-text">
                            {clEditedText || clResult}
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 dark:border-charcoal-700 rounded-2xl p-6">
                          <FileText className="w-12 h-12 text-slate-300 dark:text-charcoal-600 mb-4 animate-pulse" />
                          <p className="text-gray-500 dark:text-gray-400 font-medium">
                            No Cover Letter Generated Yet
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
                            Provide target details in the letter configuration on the left and click "Generate Cover Letter" to compile.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 3: AI Resume-Based Interview Question Generator */}
            {activeTab === 'mock-interview' && (
              <motion.div
                key="mock-interview-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-12 gap-8"
              >
                {/* Form Setup (Left) */}
                <div className="md:col-span-5 lg:col-span-4 space-y-6">
                  <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 font-heading">
                      <Zap className="w-5 h-5 text-amber-500" />
                      Mock Setup
                    </h2>
                    
                    <form onSubmit={handleGenerateQuestions} className="space-y-5">
                      <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Target Job Role
                        </label>
                        <input
                          type="text"
                          value={roleSearchQuery}
                          onFocus={() => setIsDropdownOpen(true)}
                          onBlur={() => {
                            setTimeout(() => setIsDropdownOpen(false), 200);
                          }}
                          onChange={(e) => {
                            setRoleSearchQuery(e.target.value);
                            setTargetRole(e.target.value);
                            if (e.target.value.trim()) setValidationErrors(prev => ({ ...prev, role: false }));
                          }}
                          placeholder="Search or type a target role..."
                          className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-charcoal-900 border text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm ${validationErrors.role ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-charcoal-700'}`}
                        />
                        
                        {isDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 rounded-xl shadow-xl">
                            {(() => {
                              const query = roleSearchQuery.toLowerCase();
                              let hasAnyMatches = false;
                              
                              const items = ROLE_GROUPS.map((group) => {
                                const filteredRoles = group.roles.filter(role => 
                                  role.toLowerCase().includes(query)
                                );
                                
                                if (filteredRoles.length === 0) return null;
                                hasAnyMatches = true;
                                
                                return (
                                  <div key={group.category} className="p-2 border-b border-slate-50 dark:border-charcoal-700 last:border-b-0">
                                    <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 px-2 py-1 select-none">
                                      {group.category}
                                    </div>
                                    {filteredRoles.map(role => (
                                      <div
                                        key={role}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          setTargetRole(role);
                                          setRoleSearchQuery(role);
                                          setIsDropdownOpen(false);
                                          setValidationErrors(prev => ({ ...prev, role: false }));
                                        }}
                                        className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg cursor-pointer transition-colors"
                                      >
                                        {role}
                                      </div>
                                    ))}
                                  </div>
                                );
                              });
                              
                              if (!hasAnyMatches && roleSearchQuery.trim()) {
                                return (
                                  <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
                                    Use typed role: <span className="font-semibold text-gray-700 dark:text-gray-300">"{roleSearchQuery}"</span>
                                  </div>
                                );
                              }
                              
                              return items;
                            })()}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Interview Type
                        </label>
                        <div className={`grid grid-cols-3 gap-2 rounded-xl p-1 transition-all ${validationErrors.type ? 'ring-2 ring-red-500' : ''}`}>
                          {['Technical', 'HR', 'Mixed'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => { setIntType(prev => prev === type ? '' : type); setValidationErrors(prev => ({ ...prev, type: false })); }}
                              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                                intType === type
                                  ? 'bg-cyan-600 text-white border-cyan-600 dark:bg-cyan-500 dark:border-cyan-500 shadow-md'
                                  : 'bg-slate-50 dark:bg-charcoal-900 border-slate-200 dark:border-charcoal-700 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-charcoal-800'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Difficulty Level
                        </label>
                        <div className={`grid grid-cols-3 gap-2 rounded-xl p-1 transition-all ${validationErrors.difficulty ? 'ring-2 ring-red-500' : ''}`}>
                          {['Easy', 'Medium', 'Hard'].map(lvl => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => { setIntDifficulty(prev => prev === lvl ? '' : lvl); setValidationErrors(prev => ({ ...prev, difficulty: false })); }}
                              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                                intDifficulty === lvl
                                  ? lvl === 'Easy'
                                    ? 'bg-green-600 text-white border-green-600 dark:bg-green-500 dark:border-green-500 shadow-md'
                                    : lvl === 'Medium'
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                                    : 'bg-red-600 text-white border-red-600 dark:bg-red-500 dark:border-red-500 shadow-md'
                                  : 'bg-slate-50 dark:bg-charcoal-900 border-slate-200 dark:border-charcoal-700 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-charcoal-800'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Number of Questions
                        </label>
                        <div className={`grid grid-cols-3 gap-2 rounded-xl p-1 transition-all ${validationErrors.count ? 'ring-2 ring-red-500' : ''}`}>
                          {[5, 10, 15].map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => { setIntNumber(prev => prev === num ? null : num); setValidationErrors(prev => ({ ...prev, count: false })); }}
                              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                                intNumber === num
                                  ? 'bg-purple-600 text-white border-purple-600 dark:bg-purple-500 dark:border-purple-500 shadow-md'
                                  : 'bg-slate-50 dark:bg-charcoal-900 border-slate-200 dark:border-charcoal-700 text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-charcoal-800'
                              }`}
                            >
                              {num} Qs
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isGeneratingQ}
                        className={`w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                          isGeneratingQ ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {isGeneratingQ ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Analyzing Resume...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            Generate Questions
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Question Output Cards (Right) */}
                <div className="md:col-span-7 lg:col-span-8">
                  <div className={`glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50 min-h-[500px] flex flex-col justify-between${isGeneratingQ ? ' rotating-neon-border' : ''}`}>
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-charcoal-700 pb-4 mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Generated Mock Interview Questions
                          </h2>
                          {qMethod && (
                            <span className="text-xs text-gray-500 mt-1 block">
                              Source: {qMethod === 'ai' ? '🤖 Advanced AI' : '⚙️ Template Fallback'}
                            </span>
                          )}
                        </div>

                        {questions.length > 0 && (
                          <div className="flex gap-2">
                            <button
                              onClick={handleCopyAllQuestions}
                              className="p-2 bg-slate-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                            >
                              <Copy className="w-4 h-4" />
                              {copyQSuccess ? 'Copied All!' : 'Copy All'}
                            </button>
                            <button
                              onClick={downloadQAsTXT}
                              className="p-2 bg-slate-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                            >
                              <FileText className="w-4 h-4" />
                              TXT
                            </button>
                            <button
                              onClick={exportQAsPDF}
                              className="p-2 bg-slate-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                            >
                              <Download className="w-4 h-4" />
                              PDF
                            </button>
                            <button
                              onClick={handleGenerateQuestions}
                              disabled={isGeneratingQ}
                              className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-1.5 text-xs font-semibold"
                            >
                              <RefreshCw className={`w-4 h-4 ${isGeneratingQ ? 'animate-spin' : ''}`} />
                              Regenerate
                            </button>
                          </div>
                        )}
                      </div>

                      {qError && (
                        <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
                          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">Generation Error:</span> {qError}
                          </div>
                        </div>
                      )}

                      {isGeneratingQ ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="relative mb-4">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <Zap className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">
                            Synthesizing skills, experience keywords, and project targets<span className="loading-dots"></span>
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 max-w-sm">
                            Extracting language frameworks, formatting interview outlines, and establishing key expected answers.
                          </p>
                        </div>
                      ) : questions.length > 0 ? (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 select-text">
                          {questions.map((q, idx) => (
                            <div
                              key={idx}
                              className="p-5 bg-slate-50/50 dark:bg-charcoal-900/50 border border-slate-100 dark:border-charcoal-700/50 rounded-2xl hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                  Question {idx + 1}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  q.difficulty === 'Easy'
                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
                                    : q.difficulty === 'Hard'
                                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
                                }`}>
                                  {q.difficulty}
                                </span>
                              </div>

                              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                                {q.question}
                              </h3>

                              <div className="space-y-3 pl-1 text-xs">
                                <div>
                                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                                    Why this is asked:
                                  </h4>
                                  <p className="text-gray-600 dark:text-gray-400 mt-1 pl-4 leading-relaxed">
                                    {q.why}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5 text-emerald-500" />
                                    Expected answer outline:
                                  </h4>
                                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1 pl-4 space-y-1 leading-relaxed">
                                    {Array.isArray(q.expectedAnswer) ? (
                                      q.expectedAnswer.map((point, pIdx) => (
                                        <li key={pIdx}>{point}</li>
                                      ))
                                    ) : (
                                      <li>{q.expectedAnswer}</li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 dark:border-charcoal-700 rounded-2xl p-6">
                          <Zap className="w-12 h-12 text-slate-300 dark:text-charcoal-600 mb-4 animate-pulse" />
                          <p className="text-gray-500 dark:text-gray-400 font-medium">
                            No Mock Interview Questions Generated
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
                            Select category and difficulty settings on the left, then click "Generate Questions" to compile.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default ResumeResult;
