import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { resumeAPI } from '../services/api';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  Copy, 
  RefreshCw, 
  Sparkles, 
  Upload, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const CoverLetterPage = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [isLoadingResumeText, setIsLoadingResumeText] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [tone, setTone] = useState('Professional');
  const [jobDescription, setJobDescription] = useState('');

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [clResult, setClResult] = useState('');
  const [clError, setClError] = useState(null);
  const [clMethod, setClMethod] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clEditedText, setClEditedText] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await resumeAPI.getAll();
      if (res.success) {
        setResumes(res.data.resumes || []);
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

  const handleGenerateCL = async (e) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setClError(null);
    try {
      const payload = {
        companyName,
        roleTitle,
        jobDescription,
        tone,
        resumeText: selectedResumeId ? undefined : resumeText,
        resumeId: selectedResumeId || undefined
      };

      const res = await resumeAPI.generateCoverLetterStandalone(payload);
      if (res?.success && res?.coverLetter) {
        setClResult(res.coverLetter);
        setClEditedText(res.coverLetter);
        setIsEditing(false);
        setClMethod(res.method || 'ai');
      } else {
        setClError(res?.error || 'Failed to generate cover letter');
      }
    } catch (err) {
      console.error(err);
      setClError(err?.error || err?.message || 'Error occurred during generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    const textToCopy = clEditedText || clResult;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  const downloadAsTXT = () => {
    const textToExport = clEditedText || clResult;
    if (!textToExport) return;
    const element = document.createElement("a");
    const file = new Blob([textToExport], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${roleTitle ? roleTitle.replace(/\s+/g, '_') : 'Candidate'}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportAsPDF = () => {
    const textToExport = clEditedText || clResult;
    if (!textToExport) return;
    const html = `
      <div class="header">
        <h1>Cover Letter</h1>
        <p class="meta">Generated for: ${roleTitle || 'Applicant'} on ${new Date().toLocaleDateString()}</p>
      </div>
      <div class="content">
        <pre>${textToExport}</pre>
      </div>
    `;
    printPdf('Cover Letter', html);
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
              📄 Standalone Cover Letter Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate and customize a personalized, ATS-friendly cover letter. Resume upload is completely optional!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-12 gap-8">
            {/* Form Setup (Left) */}
            <div className="md:col-span-5 lg:col-span-4 space-y-6">
              <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Letter Setup
                </h2>

                <form onSubmit={handleGenerateCL} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Select Stored Resume (Optional)
                    </label>
                    <select
                      value={selectedResumeId}
                      onChange={handleResumeChange}
                      disabled={loadingResumes}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    >
                      <option value="">-- Generate without stored resume --</option>
                      {resumes.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.original_filename || r.filename}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!selectedResumeId && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Paste Resume Text (Optional)
                      </label>
                      <textarea
                        rows="4"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your resume details here to tailor achievements and skills..."
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                      />
                    </div>
                  )}

                  {selectedResumeId && isLoadingResumeText && (
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading resume contents...
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Google, Stripe"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Role Title
                    </label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Tone Selector
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
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
                      Job Description (Optional)
                    </label>
                    <textarea
                      rows="5"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the target job description to match core skills and roles..."
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
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

            {/* Output Editor (Right) */}
            <div className="md:col-span-7 lg:col-span-8">
              <div className="glass bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-charcoal-700/50 min-h-[550px] flex flex-col justify-between">
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
                        {isEditing ? (
                          <button
                            onClick={() => {
                              setClResult(clEditedText);
                              setIsEditing(false);
                            }}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 text-xs font-semibold"
                            title="Save Changes"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Save Changes
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 bg-slate-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                            title="Edit Content"
                          >
                            <span>✏️ Edit</span>
                          </button>
                        )}
                        <button
                          onClick={handleCopyText}
                          className="p-2 bg-slate-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-all relative flex items-center gap-1.5 text-xs font-semibold"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                          {copySuccess ? 'Copied!' : '📋 Copy'}
                        </button>
                        <button
                          onClick={downloadAsTXT}
                          className="p-2 bg-slate-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                          title="Download Text File"
                        >
                          <FileText className="w-4 h-4" />
                          ⬇ Download TXT
                        </button>
                        <button
                          onClick={exportAsPDF}
                          className="p-2 bg-slate-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                          title="Print/Save as PDF"
                        >
                          <Download className="w-4 h-4" />
                          ⬇ Download PDF
                        </button>
                        <button
                          onClick={handleGenerateCL}
                          disabled={isGenerating}
                          className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-1.5 text-xs font-semibold"
                          title="Regenerate"
                        >
                          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
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

                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="relative mb-4">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <Sparkles className="w-6 h-6 text-cyan-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Analyzing configuration and tailoring cover letter...
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 max-w-sm">
                        Injecting relevant achievements, matching tone parameters, and formatting output.
                      </p>
                    </div>
                  ) : clResult ? (
                    isEditing ? (
                      <textarea
                        value={clEditedText}
                        onChange={(e) => setClEditedText(e.target.value)}
                        className="w-full h-[450px] p-6 md:p-8 bg-slate-50/50 dark:bg-charcoal-900/50 border border-indigo-500 dark:border-indigo-400 rounded-2xl font-sans leading-relaxed text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-0 resize-y"
                        placeholder="Edit your cover letter here..."
                      />
                    ) : (
                      <div className="bg-slate-50/50 dark:bg-charcoal-900/50 border border-slate-100 dark:border-charcoal-700/50 rounded-2xl p-6 md:p-8 max-h-[500px] overflow-y-auto font-sans leading-relaxed text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap select-text">
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
                        Configure setup parameters on the left and click "Generate Cover Letter" to compile.
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

export default CoverLetterPage;
