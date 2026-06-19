import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { resumeAPI } from '../services/api';
import { 
  Zap, 
  Download, 
  CheckCircle, 
  XCircle, 
  Copy, 
  RefreshCw, 
  Sparkles, 
  Upload, 
  ArrowRight,
  HelpCircle,
  Award,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  },
  {
    category: "Blockchain",
    roles: [
      "Smart Contracts Developer",
      "Consensus Engineer",
      "Web3 Engineer",
      "Blockchain Developer"
    ]
  }
];

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

const MockInterviewPage = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [isLoadingResumeText, setIsLoadingResumeText] = useState(false);

  // Form states
  const [targetRole, setTargetRole] = useState('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [intType, setIntType] = useState('');
  const [intDifficulty, setIntDifficulty] = useState('');
  const [intNumber, setIntNumber] = useState(null);

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [qError, setQError] = useState(null);
  const [qMethod, setQMethod] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ role: false, type: false, difficulty: false, count: false });

  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await resumeAPI.getAll();
      if (res.success) {
        const list = res.data.resumes || [];
        setResumes(list);
        if (list.length > 0) {
          const firstId = list[0].id;
          setSelectedResumeId(firstId);
          setIsLoadingResumeText(true);
          try {
            const resumeRes = await resumeAPI.getOne(firstId);
            if (resumeRes.success && resumeRes.data?.resume) {
              setResumeText(resumeRes.data.resume.resumeText || '');
            }
          } catch (err) {
            console.error('Failed to load first resume details:', err);
          } finally {
            setIsLoadingResumeText(false);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleResumeChange = async (e) => {
    const resumeId = e.target.value;
    setSelectedResumeId(resumeId);
    if (!resumeId) {
      setResumeText('');
      return;
    }

    setIsLoadingResumeText(true);
    try {
      const res = await resumeAPI.getOne(resumeId);
      if (res.success && res.data?.resume) {
        setResumeText(res.data.resume.resumeText || '');
      }
    } catch (err) {
      console.error('Failed to load resume details:', err);
    } finally {
      setIsLoadingResumeText(false);
    }
  };

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

    setIsGenerating(true);
    setQError(null);
    try {
      const payload = {
        domain: targetRole,
        role: targetRole,
        targetRole: targetRole,
        interviewType: intType,
        type: intType,
        difficulty: intDifficulty,
        questionCount: intNumber,
        number: intNumber,
        resumeText: selectedResumeId ? undefined : resumeText,
        resumeId: selectedResumeId || undefined
      };

      const delayPromise = new Promise(resolve => setTimeout(resolve, 3000));
      const apiPromise = resumeAPI.generateInterviewQuestionsStandalone(payload);
      const [res] = await Promise.all([apiPromise, delayPromise]);

      if (res?.success && res?.questions) {
        setQuestions(res.questions);
        setQMethod(res.method || 'ai');
        window.dispatchEvent(new CustomEvent('mockInterviewComplete'));
      } else {
        setQError(res?.error || 'Failed to generate interview questions');
      }
    } catch (err) {
      console.error(err);
      setQError(err?.error || err?.message || 'Error occurred during generation');
    } finally {
      setIsGenerating(false);
    }
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
    
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  const downloadAsTXT = () => {
    if (!questions.length) return;
    let textContent = `SMART RESUME ANALYZER - STANDALONE MOCK INTERVIEW QUESTIONS\n`;
    textContent += `Role: ${targetRole || 'Software Professional'}\n`;
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
    element.download = `${targetRole ? targetRole.replace(/\s+/g, '_') : 'Candidate'}_Interview_Questions.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportAsPDF = () => {
    if (!questions.length) return;
    let html = `
      <div class="header">
        <h1>Mock Interview Questions</h1>
        <p class="meta">Role: ${targetRole || 'Software Professional'} | Category: ${intType} | Difficulty: ${intDifficulty}</p>
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

  return (
    <Layout>
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-navy-900 dark:to-charcoal-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 font-heading font-sans">
              Mock Interview Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Prepare with custom technical and HR questions tailored to your target job role.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-12 gap-8">
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
                    disabled={isGenerating}
                    className={`w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                      isGenerating ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Generating Questions...
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

            {/* Output (Right) */}
            <div className="md:col-span-7 lg:col-span-8">
              <div className={`glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50 min-h-[550px] flex flex-col justify-between${isGenerating ? ' rotating-neon-border' : ''}`}>
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
                          {copySuccess ? 'Copied All!' : 'Copy All'}
                        </button>
                        <button
                          onClick={downloadAsTXT}
                          className="p-2 bg-slate-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <FileText className="w-4 h-4" />
                          TXT
                        </button>
                        <button
                          onClick={exportAsPDF}
                          className="p-2 bg-slate-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </button>
                        <button
                          onClick={handleGenerateQuestions}
                          disabled={isGenerating}
                          className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
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

                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="relative mb-4">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <Zap className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Synthesizing role specifications and formulating mock questions<span className="loading-dots"></span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 max-w-sm">
                        Formatting interview outlines, preparing sample questions, and establishing key evaluation outlines.
                      </p>
                    </div>
                  ) : questions.length > 0 ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 select-text">
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
                        Select target role and category specifications on the left, then click "Generate Questions" to compile.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MockInterviewPage;
