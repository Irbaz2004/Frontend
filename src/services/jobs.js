const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

// Helper for auth headers
function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ==================== JOB LISTINGS ====================

/**
 * Get jobs with filters
 * @param {object} params - { lat, lng, radius, category, type, search, minSalary, maxSalary, sort, page, limit }
 */
export async function getJobs(params = {}) {
    try {
        const searchParams = new URLSearchParams();

        // Add all non-empty params
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, value);
            }
        });

        const url = `${API_BASE}/jobs?${searchParams.toString()}`;
        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch jobs',
                status: response.status
            };
        }
        return result; // Returns { jobs, pagination, filters }
    } catch (error) {
        console.error('getJobs error:', error);
        throw error;
    }
}

/**
 * Get nearby jobs (backward compatibility)
 * @param {number} lat
 * @param {number} lng
 * @param {string} radius
 */
export async function getNearbyJobs(lat, lng, radius = '5km') {
    return getJobs({ lat, lng, radius, sort: 'distance' });
}

/**
 * Get job details
 * @param {string} jobId
 */
export async function getJobDetails(jobId) {
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch job details',
                status: response.status
            };
        }
        return result.job; // Returns job with similar jobs
    } catch (error) {
        console.error('getJobDetails error:', error);
        throw error;
    }
}

/**
 * Get recommended jobs for user
 */
export async function getRecommendedJobs() {
    try {
        const response = await fetch(`${API_BASE}/jobs/recommended`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch recommendations',
                status: response.status
            };
        }
        return result.jobs || [];
    } catch (error) {
        console.error('getRecommendedJobs error:', error);
        return [];
    }
}

// ==================== JOB POSTING (for businesses) ====================

/**
 * Post a new job (business owners only)
 * @param {object} data - Job data
 */
export async function postJob(data) {
    try {
        const response = await fetch(`${API_BASE}/jobs`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to post job',
                status: response.status
            };
        }
        return result.job;
    } catch (error) {
        console.error('postJob error:', error);
        throw error;
    }
}

/**
 * Update a job posting
 * @param {string} jobId
 * @param {object} updates
 */
export async function updateJob(jobId, updates) {
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(updates)
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update job',
                status: response.status
            };
        }
        return result.job;
    } catch (error) {
        console.error('updateJob error:', error);
        throw error;
    }
}

/**
 * Delete a job posting
 * @param {string} jobId
 */
export async function deleteJob(jobId) {
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to delete job',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('deleteJob error:', error);
        throw error;
    }
}

/**
 * Toggle job vacancy status
 * @param {boolean} hasVacancy
 */
export async function toggleJobVacancy(hasVacancy) {
    try {
        const response = await fetch(`${API_BASE}/businesses/job-vacancy`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ hasVacancy })
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update job vacancy',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('toggleJobVacancy error:', error);
        throw error;
    }
}

// ==================== JOB APPLICATIONS ====================

/**
 * Apply to a job
 * @param {string} jobId
 * @param {object} data - { coverLetter, expectedSalary, resume }
 */
export async function applyToJob(jobId, data = {}) {
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to apply',
                status: response.status
            };
        }
        return result.application;
    } catch (error) {
        console.error('applyToJob error:', error);
        throw error;
    }
}

// Backward compatibility
export async function applyJob(jobId, userId) {
    return applyToJob(jobId, { userId });
}

/**
 * Get applications for the current user
 * @param {object} filters - { status }
 */
export async function getMyApplications(filters = {}) {
    try {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);

        const url = `${API_BASE}/jobs/my-applications${params.toString() ? `?${params}` : ''}`;
        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch applications',
                status: response.status
            };
        }
        return result.applications || [];
    } catch (error) {
        console.error('getMyApplications error:', error);
        return [];
    }
}

/**
 * Get jobs posted by current business
 */
export async function getMyJobs() {
    try {
        const response = await fetch(`${API_BASE}/jobs/my-jobs`, {
            headers: authHeaders(),
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch jobs',
                status: response.status
            };
        }
        return result.jobs || [];
    } catch (error) {
        console.error('getMyJobs error:', error);
        return [];
    }
}

// Backward compatibility
export const getShopJobs = getMyJobs;

/**
 * Get applications for business jobs
 */
export async function getBusinessApplications() {
    try {
        const response = await fetch(`${API_BASE}/jobs/applications`, {
            headers: authHeaders(),
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch applications',
                status: response.status
            };
        }
        return result.applications || [];
    } catch (error) {
        console.error('getBusinessApplications error:', error);
        return [];
    }
}

// Backward compatibility
export const getShopApplications = getBusinessApplications;

/**
 * Get applications for a specific job
 * @param {string} jobId
 */
export async function getJobApplications(jobId) {
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}/applications`, {
            headers: authHeaders(),
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch applications',
                status: response.status
            };
        }
        return result.applications || [];
    } catch (error) {
        console.error('getJobApplications error:', error);
        return [];
    }
}

/**
 * Update application status (for businesses)
 * @param {string} applicationId
 * @param {string} status - 'shortlisted' | 'rejected' | 'hired'
 * @param {string} feedback
 */
export async function updateApplicationStatus(applicationId, status, feedback = '') {
    try {
        const response = await fetch(`${API_BASE}/jobs/applications/${applicationId}/status`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status, feedback })
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update application',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('updateApplicationStatus error:', error);
        throw error;
    }
}

// ==================== SAVED JOBS ====================

/**
 * Save a job
 * @param {string} jobId
 */
export async function saveJob(jobId) {
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}/save`, {
            method: 'POST',
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to save job',
                status: response.status
            };
        }
        return result.saved; // Returns boolean
    } catch (error) {
        console.error('saveJob error:', error);
        throw error;
    }
}

/**
 * Get saved jobs for user
 */
export async function getSavedJobs() {
    try {
        const response = await fetch(`${API_BASE}/jobs/saved`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch saved jobs',
                status: response.status
            };
        }
        return result.jobs || [];
    } catch (error) {
        console.error('getSavedJobs error:', error);
        return [];
    }
}

// ==================== UTILITIES ====================

/**
 * Format salary for display
 * @param {object} job - Job object with salary fields
 */
export function formatSalary(job) {
    if (!job) return 'Not specified';

    const { salary_min, salary_max, salary_period } = job;

    if (!salary_min && !salary_max) return 'Not specified';
    if (salary_min && !salary_max) return `₹${salary_min}/${salary_period || 'month'}`;
    if (!salary_min && salary_max) return `Up to ₹${salary_max}/${salary_period || 'month'}`;
    return `₹${salary_min} - ₹${salary_max}/${salary_period || 'month'}`;
}

/**
 * Get job type badge color
 * @param {string} type
 */
export function getJobTypeColor(type) {
    const colors = {
        'full_time': 'green',
        'part_time': 'blue',
        'contract': 'orange',
        'internship': 'purple'
    };
    return colors[type] || 'gray';
}

/**
 * Get job type label
 * @param {string} type
 */
export function getJobTypeLabel(type) {
    const labels = {
        'full_time': 'Full Time',
        'part_time': 'Part Time',
        'contract': 'Contract',
        'internship': 'Internship'
    };
    return labels[type] || type;
}

/**
 * Format experience required
 * @param {string} experience
 */
export function formatExperience(experience) {
    if (!experience) return 'Fresher can apply';

    const expMap = {
        '0-1': '0-1 years',
        '1-3': '1-3 years',
        '3-5': '3-5 years',
        '5+': '5+ years'
    };
    return expMap[experience] || experience;
}

/**
 * Get job filter options
 */
export function getJobFilterOptions() {
    return {
        jobTypes: [
            { value: 'full_time', label: 'Full Time' },
            { value: 'part_time', label: 'Part Time' },
            { value: 'contract', label: 'Contract' },
            { value: 'internship', label: 'Internship' }
        ],
        experienceLevels: [
            { value: '0-1', label: '0-1 years' },
            { value: '1-3', label: '1-3 years' },
            { value: '3-5', label: '3-5 years' },
            { value: '5+', label: '5+ years' }
        ],
        sortOptions: [
            { value: 'recent', label: 'Most Recent' },
            { value: 'salary_high', label: 'Salary: High to Low' },
            { value: 'salary_low', label: 'Salary: Low to High' },
            { value: 'distance', label: 'Nearest First' }
        ],
        radiusOptions: [
            { value: '1km', label: 'Within 1 km' },
            { value: '2km', label: 'Within 2 km' },
            { value: '5km', label: 'Within 5 km' },
            { value: '10km', label: 'Within 10 km' }
        ]
    };
}

/**
 * Check if job is still accepting applications
 * @param {object} job
 */
export function isJobActive(job) {
    if (!job) return false;
    if (!job.is_active) return false;
    if (job.deleted_at) return false;

    // Check deadline
    if (job.deadline) {
        const deadline = new Date(job.deadline);
        if (deadline < new Date()) return false;
    }

    // Check if max applications reached
    if (job.openings && job.applicationsCount >= job.openings) return false;

    return true;
}

/**
 * Get application status color
 * @param {string} status
 */
export function getApplicationStatusColor(status) {
    const colors = {
        'pending': 'orange',
        'shortlisted': 'green',
        'rejected': 'red',
        'hired': 'blue'
    };
    return colors[status] || 'gray';
}

/**
 * Get application status label
 * @param {string} status
 */
export function getApplicationStatusLabel(status) {
    const labels = {
        'pending': 'Pending Review',
        'shortlisted': 'Shortlisted',
        'rejected': 'Not Selected',
        'hired': 'Hired'
    };
    return labels[status] || status;
}