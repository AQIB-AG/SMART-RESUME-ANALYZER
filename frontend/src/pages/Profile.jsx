import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Building, Edit2 } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  // Mock data for education and experience (replace with actual API data when available)
  const education = [
    {
      degree: 'Master of Science in Computer Science',
      institution: 'Stanford University',
      year: '2018',
      details: 'Specialized in Artificial Intelligence',
      gpa: 'GPA: 3.9/4.0'
    },
    {
      degree: 'Bachelor of Technology in Computer Engineering',
      institution: 'University of California, Berkeley',
      year: '2016',
      details: 'Graduated with Honors',
      awards: "Dean's List 2014, 2015"
    }
  ];

  const experience = [
    {
      title: 'Senior Software Developer',
      company: 'Tech Solutions Inc.',
      period: 'Jan 2020 - Present',
      responsibilities: [
        'Led development of a new microservices architecture, improving system scalability by 40%.',
        'Mentored junior developers and conducted code reviews.',
        'Implemented CI/CD pipelines, reducing deployment time by 25%.'
      ]
    }
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile?.first_name && profile?.last_name
                        ? `${profile.first_name} ${profile.last_name}`
                        : user?.email || 'User'}
                    </h2>
                    <p className="text-gray-600">Software Engineer</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Passionate software engineer with 5 years of experience in full-stack development, specializing in scalable web applications and cloud services. Dedicated to continuous learning and building impactful products. Strong problem-solver and team player.
              </p>
            </div>

            {/* Education Card */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Education</h2>
              </div>
              <div className="space-y-6">
                {education.map((edu, idx) => (
                  <div key={idx} className="border-l-4 border-blue-600 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{edu.degree}</h3>
                    <p className="text-gray-600 mb-1">{edu.institution}, {edu.year}</p>
                    <p className="text-sm text-gray-500">{edu.details}</p>
                    {edu.gpa && <p className="text-sm text-gray-500">{edu.gpa}</p>}
                    {edu.awards && <p className="text-sm text-gray-500">{edu.awards}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Card */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <Building className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Experience</h2>
              </div>
              <div className="space-y-6">
                {experience.map((exp, idx) => (
                  <div key={idx} className="border-l-4 border-blue-600 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{exp.title} at {exp.company}</h3>
                    <p className="text-gray-600 mb-3">{exp.period}</p>
                    <ul className="space-y-2">
                      {exp.responsibilities.map((resp, rIdx) => (
                        <li key={rIdx} className="text-gray-600 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

