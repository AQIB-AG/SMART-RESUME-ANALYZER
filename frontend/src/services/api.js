import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Resume API
export const resumeAPI = {
  upload: (formData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_BASE_URL}/resumes`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getAll: () => api.get('/resumes'),
  getOne: (id) => api.get(`/resumes/${id}`),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  delete: (id) => api.delete(`/resumes/${id}`),
};

// Analysis API
export const analysisAPI = {
  analyze: (resumeId) => api.get(`/analysis/analyze/${resumeId}`),
  matchJobs: (resumeId) => api.get(`/analysis/match/${resumeId}`),
  skillGap: (resumeId, jobId) => api.get(`/analysis/skill-gap/${resumeId}/${jobId}`),
  getSummary: (resumeId) => api.get(`/analysis/summary/${resumeId}`),
  analyzeResume: (formData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_BASE_URL}/analyzeResume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// Job API
export const jobAPI = {
  create: (data) => api.post('/jobs', data),
  getAll: (params) => api.get('/jobs', { params }),
  getOne: (id) => api.get(`/jobs/${id}`),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/my-jobs'),
};

// User API
export const userAPI = {
  getInfo: () => api.get('/users/info'),
};

export default api;

