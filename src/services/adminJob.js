// services/adminJob.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// ===================== ADMIN JOB SERVICES =====================

export async function getAllJobs({ page = 1, limit = 20, search = '', status = 'all', job_type = '', min_salary = 0, max_salary = 100000 }) {
    const params = new URLSearchParams({ page, limit, min_salary, max_salary });
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (job_type) params.append('job_type', job_type);
    
    return apiCall(`/admin/jobs?${params}`);
}

export async function getJobByIdForAdmin(id) {
    return apiCall(`/admin/jobs/${id}`);
}

export async function toggleJobStatus(id, is_active) {
    return apiCall(`/admin/jobs/${id}/toggle-status`, {
        method: 'PUT',
        body: JSON.stringify({ is_active }),
    });
}

export async function toggleJobOpen(id, is_open) {
    return apiCall(`/admin/jobs/${id}/toggle-open`, {
        method: 'PUT',
        body: JSON.stringify({ is_open }),
    });
}

export async function deleteJob(id) {
    return apiCall(`/admin/jobs/${id}`, {
        method: 'DELETE',
    });
}

export async function getJobStatistics() {
    return apiCall('/admin/jobs/statistics');
}

export async function bulkAction(ids, action) {
    return apiCall('/admin/jobs/bulk-action', {
        method: 'POST',
        body: JSON.stringify({ ids, action }),
    });
}

export async function getJobTypesList() {
    return apiCall('/admin/jobs/types');
}

export async function updateJob(id, data) {
    return apiCall(`/admin/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export default {
    getAllJobs,
    getJobByIdForAdmin,
    toggleJobStatus,
    toggleJobOpen,
    deleteJob,
    getJobStatistics,
    bulkAction,
    getJobTypesList,
    updateJob,
};