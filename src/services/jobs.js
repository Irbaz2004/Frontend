// services/job.js
const API_BASE = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: authHeaders(),
            ...options,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'API call failed');
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// ===================== JOB SERVICES =====================

export async function getJobsByLocation({ 
    latitude, 
    longitude, 
    radius = 10,
    job_type = '',
    job_title = '',
    search = '',
    min_salary = 0,
    max_salary = 100000,
    page = 1, 
    limit = 12 
}) {
    const params = new URLSearchParams({
        latitude,
        longitude,
        radius,
        min_salary,
        max_salary,
        page,
        limit
    });
    if (job_type) params.append('job_type', job_type);
    if (job_title) params.append('job_title', job_title);
    if (search) params.append('search', search);
    
    return apiCall(`/jobs/nearby?${params}`);
}

export async function getJobById(id, userLocation = null) {
    let url = `/jobs/${id}`;
    if (userLocation && userLocation.latitude && userLocation.longitude) {
        url += `?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
    }
    return apiCall(url);
}

export async function getJobFilterOptions() {
    return apiCall('/jobs/filters');
}

export async function applyForJob(id) {
    return apiCall(`/jobs/${id}/apply`, {
        method: 'POST',
    });
}

export async function getFeaturedJobs() {
    return apiCall('/jobs/featured');
}

export default {
    getJobsByLocation,
    getJobById,
    getJobFilterOptions,
    applyForJob,
    getFeaturedJobs
};