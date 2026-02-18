// jobs.js — All job-related API calls go through here

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

/**
 * Get nearby jobs based on coordinates
 * @param {number|null} lat
 * @param {number|null} lng
 */
export async function getNearbyJobs(lat, lng) {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat);
    if (lng) params.append('lng', lng);

    const response = await fetch(`${API_BASE}/jobs/nearby?${params}`, {
        headers: authHeaders(),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch jobs');
    return result.jobs || result;
}

/**
 * Post a new job (shop owners only)
 * @param {object} data - Job data
 */
export async function postJob(data) {
    const response = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to post job');
    return result;
}

/**
 * Apply to a job
 * @param {string} jobId
 * @param {string} userId
 */
export async function applyJob(jobId, userId) {
    const response = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to apply');
    return result;
}

/**
 * Get jobs posted by the current shop
 */
export async function getShopJobs() {
    const response = await fetch(`${API_BASE}/jobs/my-jobs`, {
        headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch jobs');
    return result.jobs || result;
}

/**
 * Get applications for the current shop's jobs
 */
export async function getShopApplications() {
    const response = await fetch(`${API_BASE}/jobs/applications`, {
        headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch applications');
    return result.applications || result;
}

/**
 * Get applications submitted by the current user
 */
export async function getMyApplications() {
    const response = await fetch(`${API_BASE}/jobs/my-applications`, {
        headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch applications');
    return result.applications || result;
}
