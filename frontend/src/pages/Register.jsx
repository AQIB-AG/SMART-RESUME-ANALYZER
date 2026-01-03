import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { UserPlus } from 'lucide-react';

const Register = () => {
  // Express backend API URL
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    // Prevent page reload
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const requestData = {
        email: formData.email,
        password: formData.password,
      };

      console.log('📤 Sending registration request to:', `${API_URL}/auth/register`);
      console.log('📦 Request data:', { 
        email: formData.email, 
        password: '***' // Don't log actual password
      });

      // Make POST request to Express backend
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('📥 Response status:', response.status);
      
      // Parse JSON response
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (response.ok) {
        // Success
        const successMessage = data.message || 'Registration successful!';
        setSuccess(successMessage);
        alert(`✅ Success! ${successMessage}`);
        console.log('✅ Registration successful:', data);
        
        // Navigate to login page after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        // Error from backend
        const errorMessage = data.error || data.message || 'Registration failed. Please try again.';
        setError(errorMessage);
        alert(`❌ Error: ${errorMessage}`);
        console.error('❌ Registration error:', errorMessage);
      }
    } catch (err) {
      // Network error or other exception
      const errorMessage = err.message || 'Failed to connect to server. Please check if the backend is running.';
      setError(errorMessage);
      alert(`❌ Error: ${errorMessage}`);
      console.error('❌ Registration request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-gray-600">
                Sign up to get started
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
