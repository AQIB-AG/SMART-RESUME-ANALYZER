import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { resumeAPI } from '../services/api';
import { Upload as UploadIcon, FileText, CheckCircle } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const ext = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(ext)) {
        setError('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await resumeAPI.upload(formData);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      setError(error.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Upload Resume</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Upload your resume to get AI-powered analysis
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {success ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Upload Successful!</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Redirecting to dashboard...
                </p>
              </div>
            ) : (
              <>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center mb-6">
                  <UploadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Choose File
                  </label>
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    PDF, DOC, or DOCX (Max 5MB)
                  </p>
                </div>

                {file && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-primary-600" />
                    <div className="flex-1">
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Resume'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;

