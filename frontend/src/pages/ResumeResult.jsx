import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { resumeAPI, analysisAPI } from '../services/api';
import { Download, Share2, CheckCircle, XCircle } from 'lucide-react';

const ResumeResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumeData();
  }, [id]);

  const fetchResumeData = async () => {
    try {
      const [resumeRes, analysisRes] = await Promise.all([
        resumeAPI.getOne(id),
        analysisAPI.getSummary(id).catch(() => null)
      ]);

      if (resumeRes.success) {
        setResume(resumeRes.data.resume);
      }

      if (analysisRes?.success) {
        setAnalysis(analysisRes.data);
      } else {
        // Trigger analysis if not done
        try {
          await analysisAPI.analyze(id);
          const newAnalysis = await analysisAPI.getSummary(id);
          if (newAnalysis.success) {
            setAnalysis(newAnalysis.data);
          }
        } catch (err) {
          console.error('Analysis error:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!resume) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-gray-600">Resume not found</p>
        </div>
      </Layout>
    );
  }

  const score = resume.ats_score || analysis?.ats_score || 0;
  const getScoreLabel = (score) => {
    if (score >= 80) return { label: 'Excellent Match!', emoji: '😊', color: 'text-yellow-500' };
    if (score >= 60) return { label: 'Good', emoji: '🙂', color: 'text-blue-500' };
    return { label: 'Needs Improvement', emoji: '😐', color: 'text-gray-500' };
  };

  const scoreInfo = getScoreLabel(score);
  const matchedSkills = analysis?.extracted_skills || resume.extracted_skills || [];
  const sectionsAnalysis = analysis?.sections_analysis || resume.sections_analysis || {};

  // Mock missing skills and recommendations (replace with actual data when available)
  const missingSkills = ['Machine Learning', 'Cloud Security', 'DevOps Tools (e.g., Kubernetes)', 'Microservices Architecture', 'GoLang', 'GraphQL'];
  const recommendations = [
    'Quantify achievements with specific metrics (e.g., "Increased revenue by 15%").',
    'Tailor your resume for each specific job application by highlighting relevant keywords.',
    'Consider adding a "Projects" section to showcase your practical experience.',
    'Refine your summary statement to be more impactful and career-goal oriented.',
    'Seek peer review for fresh perspectives and error checking.'
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Resume Score */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume Score</h2>
                <div className="flex flex-col items-center mb-6">
                  <div className={`text-6xl mb-2 ${scoreInfo.color}`}>{scoreInfo.emoji}</div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{score}%</div>
                  <p className="text-gray-600 text-center">
                    {scoreInfo.label} Your resume demonstrates a strong alignment with industry standards and target job descriptions. Keep up the great work!
                  </p>
                </div>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    <Download className="w-5 h-5" />
                    Export Report
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full text-blue-600 hover:underline text-sm font-medium"
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Analysis Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Matched Skills */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Matched Skills</h2>
                <p className="text-gray-600 mb-6">
                  These are the key skills identified in your resume that align with your target roles.
                </p>
                <div className="flex flex-wrap gap-3">
                  {matchedSkills.slice(0, 15).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skill Suggestions */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Missing Skill Suggestions</h2>
                <p className="text-gray-600 mb-6">
                  Consider adding these highly sought-after skills to enhance your resume for relevant job applications.
                </p>
                <div className="flex flex-wrap gap-3">
                  {missingSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Actionable Recommendations</h2>
                <p className="text-gray-600 mb-6">
                  Follow these personalized steps to significantly improve your resume's impact and effectiveness.
                </p>
                <ul className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResumeResult;

