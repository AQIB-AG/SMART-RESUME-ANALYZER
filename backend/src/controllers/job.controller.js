// Mock job data (replace with MongoDB later)
const mockJobs = [];

/**
 * Create a new job posting
 */
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      skills_required,
      experience_level,
      job_type,
      location,
      salary_min,
      salary_max,
      deadline
    } = req.body;

    const job = {
      id: mockJobs.length + 1,
      recruiter_id: req.user.id,
      title,
      description,
      requirements: requirements || [],
      skills_required: skills_required || [],
      experience_level,
      job_type,
      location,
      salary_min,
      salary_max,
      posted_date: new Date().toISOString(),
      deadline,
      is_active: true
    };

    mockJobs.push(job);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        job_id: job.id
      }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create job'
    });
  }
};

/**
 * Get all jobs (with pagination and filters)
 */
export const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const { title, location, job_type, experience_level } = req.query;

    let filteredJobs = mockJobs.filter(job => job.is_active);

    // Apply filters
    if (title) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(title.toLowerCase())
      );
    }
    if (location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location && job.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    if (job_type) {
      filteredJobs = filteredJobs.filter(job => job.job_type === job_type);
    }
    if (experience_level) {
      filteredJobs = filteredJobs.filter(job => job.experience_level === experience_level);
    }

    // Pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        jobs: paginatedJobs,
        pagination: {
          page,
          per_page: perPage,
          total: filteredJobs.length,
          pages: Math.ceil(filteredJobs.length / perPage)
        }
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs'
    });
  }
};

/**
 * Get single job
 */
export const getJob = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const job = mockJobs.find(j => j.id === jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    if (!job.is_active) {
      return res.status(404).json({
        success: false,
        error: 'Job is no longer active'
      });
    }

    res.json({
      success: true,
      data: {
        job
      }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job'
    });
  }
};

/**
 * Update job
 */
export const updateJob = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const jobIndex = mockJobs.findIndex(j => j.id === jobId);

    if (jobIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const job = mockJobs[jobIndex];
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'admin' && job.recruiter_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Update allowed fields
    const updatableFields = [
      'title', 'description', 'requirements', 'skills_required',
      'experience_level', 'job_type', 'location', 'salary_min',
      'salary_max', 'deadline', 'is_active'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        mockJobs[jobIndex][field] = req.body[field];
      }
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: {
        job_id: jobId
      }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update job'
    });
  }
};

/**
 * Delete job
 */
export const deleteJob = async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const jobIndex = mockJobs.findIndex(j => j.id === jobId);

    if (jobIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const job = mockJobs[jobIndex];
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'admin' && job.recruiter_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    mockJobs.splice(jobIndex, 1);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete job'
    });
  }
};

/**
 * Get recruiter's jobs
 */
export const getMyJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let jobs;
    if (userRole === 'admin') {
      jobs = mockJobs;
    } else {
      jobs = mockJobs.filter(job => job.recruiter_id === userId);
    }

    res.json({
      success: true,
      data: {
        jobs
      }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs'
    });
  }
};

