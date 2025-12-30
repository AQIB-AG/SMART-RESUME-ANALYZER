/**
 * Smart Resume Analyzer - Frontend JavaScript
 * Handles API calls to backend and UI interactions
 */

// Base API URL
const API_BASE_URL = '/api';

// Utility functions
const api = {
  // Generic API call function
  call: async (endpoint, method = 'GET', data = null, includeCredentials = true) => {
    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (data) {
        config.body = JSON.stringify(data);
      }
      
      if (includeCredentials) {
        config.credentials = 'include';
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API call failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  },
  
  // Authentication
  login: (email, password) => api.call('/auth/login', 'POST', { email, password }),
  register: (userData) => api.call('/auth/register', 'POST', userData),
  logout: () => api.call('/auth/logout', 'POST'),
  getProfile: () => api.call('/auth/profile', 'GET'),
  
  // Resume operations
  uploadResume: (formData) => {
    return fetch(`${API_BASE_URL}/resumes/`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    }).then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.error || 'Upload failed'); });
      }
      return response.json();
    });
  },
  getResume: (resumeId) => api.call(`/resumes/${resumeId}`, 'GET'),
  getResumes: () => api.call('/resumes/', 'GET'),
  deleteResume: (resumeId) => api.call(`/resumes/${resumeId}`, 'DELETE'),
  
  // Analysis operations
  analyzeResume: (resumeId) => api.call(`/analysis/analyze-resume/${resumeId}`, 'GET'),
  getAnalysisSummary: (resumeId) => api.call(`/analysis/get-analysis-summary/${resumeId}`, 'GET'),
  matchResumeToJobs: (resumeId) => api.call(`/analysis/match-resume-to-jobs/${resumeId}`, 'GET'),
  skillGapAnalysis: (resumeId, jobId) => api.call(`/analysis/skill-gap-analysis/${resumeId}/${jobId}`, 'GET'),
  
  // Job operations
  getJobs: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.call(`/jobs/?${params}`, 'GET');
  },
  getJob: (jobId) => api.call(`/jobs/${jobId}`, 'GET'),
  createJob: (jobData) => api.call('/jobs/', 'POST', jobData),
  updateJob: (jobId, jobData) => api.call(`/jobs/${jobId}`, 'PUT', jobData),
  deleteJob: (jobId) => api.call(`/jobs/${jobId}`, 'DELETE'),
  
  // User operations
  getUsers: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.call(`/users/?${params}`, 'GET');
  },
  getUser: (userId) => api.call(`/users/${userId}`, 'GET'),
  updateUser: (userId, userData) => api.call(`/users/${userId}`, 'PUT', userData),
  deleteUser: (userId) => api.call(`/users/${userId}`, 'DELETE'),
};

// Resume Analysis Functions
const resumeAnalyzer = {
  // Analyze a resume and update UI
  analyze: async (resumeId) => {
    try {
      const result = await api.analyzeResume(resumeId);
      
      // Update UI with analysis results
      document.getElementById('ats-score-value').textContent = result.ats_score;
      document.getElementById('ats-score-bar').style.width = `${result.ats_score}%`;
      
      // Update skills section
      const skillsContainer = document.getElementById('skills-container');
      if (skillsContainer) {
        skillsContainer.innerHTML = '';
        result.skills.technical_skills.forEach(skill => {
          const skillTag = document.createElement('span');
          skillTag.className = 'skill-tag';
          skillTag.textContent = skill;
          skillsContainer.appendChild(skillTag);
        });
        
        result.skills.soft_skills.forEach(skill => {
          const skillTag = document.createElement('span');
          skillTag.className = 'skill-tag';
          skillTag.textContent = skill;
          skillsContainer.appendChild(skillTag);
        });
      }
      
      // Update contact info
      const contactInfo = result.contact_info;
      if (contactInfo.email) {
        document.getElementById('contact-email').textContent = contactInfo.email;
      }
      if (contactInfo.phone) {
        document.getElementById('contact-phone').textContent = contactInfo.phone;
      }
      
      return result;
    } catch (error) {
      console.error('Resume analysis error:', error);
      throw error;
    }
  },
  
  // Get analysis summary
  getSummary: async (resumeId) => {
    try {
      return await api.getAnalysisSummary(resumeId);
    } catch (error) {
      console.error('Get analysis summary error:', error);
      throw error;
    }
  },
  
  // Match resume to jobs
  matchToJobs: async (resumeId) => {
    try {
      const result = await api.matchResumeToJobs(resumeId);
      
      // Update job recommendations UI
      const jobsContainer = document.getElementById('jobs-container');
      if (jobsContainer) {
        jobsContainer.innerHTML = '';
        
        result.job_matches.forEach(job => {
          const jobCard = document.createElement('div');
          jobCard.className = 'job-card';
          jobCard.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h5 class="mb-2">${job.job_title}</h5>
                <p class="text-muted mb-1">
                  <i class="bi bi-building me-1"></i> ${job.company}
                </p>
              </div>
              <div class="match-score high-match">${job.match_percentage}% Match</div>
            </div>
            <div class="mb-3">
              <span class="job-type-badge me-2">Full-time</span>
            </div>
            <h6 class="mb-2 fw-bold">Skills Match</h6>
            <div class="skills-match">
              ${job.matched_skills.map(skill => `
                <span class="skill-match matched-skill">${skill} <i class="bi bi-check ms-1"></i></span>
              `).join('')}
              ${job.missing_skills.map(skill => `
                <span class="skill-match missing-skill">${skill} <i class="bi bi-x ms-1"></i></span>
              `).join('')}
            </div>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <button class="btn btn-outline-primary btn-sm me-2">Save Job</button>
              <a href="#" class="btn btn-primary btn-sm">Apply Now</a>
            </div>
          `;
          jobsContainer.appendChild(jobCard);
        });
      }
      
      return result;
    } catch (error) {
      console.error('Job matching error:', error);
      throw error;
    }
  }
};

// UI Helper Functions
const ui = {
  // Show loading state
  showLoading: (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = '<div class="text-center py-3"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    }
  },
  
  // Show error message
  showError: (elementId, message) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
    }
  },
  
  // Show success message
  showSuccess: (elementId, message) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<div class="alert alert-success" role="alert">${message}</div>`;
    }
  },
  
  // Format large numbers
  formatNumber: (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },
  
  // Update progress bar
  updateProgressBar: (elementId, percentage) => {
    const progressBar = document.getElementById(elementId);
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
  }
};

// Initialize common event listeners
const initEventListeners = () => {
  // Handle form submissions
  document.addEventListener('submit', async (e) => {
    if (e.target.classList.contains('api-form')) {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const endpoint = e.target.getAttribute('data-endpoint');
      const method = e.target.getAttribute('data-method') || 'POST';
      
      try {
        // Convert FormData to JSON
        const data = Object.fromEntries(formData);
        
        // Make API call
        const result = await api.call(endpoint, method, data);
        
        // Show success message
        const successMsg = e.target.getAttribute('data-success-msg') || 'Operation completed successfully';
        ui.showSuccess('message-container', successMsg);
      } catch (error) {
        // Show error message
        ui.showError('message-container', error.message);
      }
    }
  });
  
  // Handle AJAX buttons
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('api-btn')) {
      e.preventDefault();
      
      const endpoint = e.target.getAttribute('data-endpoint');
      const method = e.target.getAttribute('data-method') || 'GET';
      const data = e.target.getAttribute('data-payload') ? JSON.parse(e.target.getAttribute('data-payload')) : null;
      
      try {
        // Make API call
        const result = await api.call(endpoint, method, data);
        
        // Show success message
        const successMsg = e.target.getAttribute('data-success-msg') || 'Operation completed successfully';
        ui.showSuccess('message-container', successMsg);
      } catch (error) {
        // Show error message
        ui.showError('message-container', error.message);
      }
    }
  });
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  
  // If on dashboard page, load resume analysis
  if (document.getElementById('ats-score-value')) {
    // Example: load resume data if resume ID is available
    const resumeId = document.getElementById('resume-id')?.value;
    if (resumeId) {
      resumeAnalyzer.getSummary(resumeId)
        .then(data => {
          // Update dashboard with resume data
          document.getElementById('ats-score-value').textContent = data.ats_score || 0;
          document.getElementById('ats-score-bar').style.width = `${data.ats_score || 0}%`;
          
          // Update skills count
          document.getElementById('skills-count').textContent = data.skills_count || 0;
          
          // Update skills list
          const skillsContainer = document.getElementById('skills-container');
          if (skillsContainer && data.extracted_skills) {
            skillsContainer.innerHTML = '';
            data.extracted_skills.forEach(skill => {
              const skillTag = document.createElement('span');
              skillTag.className = 'skill-tag';
              skillTag.textContent = skill;
              skillsContainer.appendChild(skillTag);
            });
          }
        })
        .catch(error => {
          console.error('Error loading resume summary:', error);
        });
    }
  }
});

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { api, resumeAnalyzer, ui };
}