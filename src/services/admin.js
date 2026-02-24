const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

// Helper for auth headers
function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ==================== DASHBOARD STATS ====================

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch stats',
                status: response.status,
                code: result.code
            };
        }
        return result; // Returns overview, pending, today, trends
    } catch (error) {
        console.error('getAdminStats error:', error);
        throw error;
    }
}

/**
 * Get detailed reports with period filter
 * @param {string} period - 'week' | 'month' | 'year'
 */
export async function getReports(period = 'week') {
    try {
        const response = await fetch(`${API_BASE}/admin/reports?period=${period}`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch reports',
                status: response.status
            };
        }
        return result; // Returns registrations, topBusinesses, popularSearches, appointmentsByStatus
    } catch (error) {
        console.error('getReports error:', error);
        throw error;
    }
}

// ==================== USER MANAGEMENT ====================

/**
 * Get all users with filters
 * @param {object} filters - { page, limit, role, search, verified, blocked }
 */
export async function getAllUsers(filters = {}) {
    try {
        const params = new URLSearchParams(filters).toString();
        const url = `${API_BASE}/admin/users${params ? `?${params}` : ''}`;

        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch users',
                status: response.status
            };
        }
        return result; // Returns { users, pagination }
    } catch (error) {
        console.error('getAllUsers error:', error);
        throw error;
    }
}

/**
 * Block or unblock a user
 * @param {string} userId
 * @param {boolean} block - true to block, false to unblock
 */
export async function toggleUserBlock(userId, block) {
    try {
        const response = await fetch(`${API_BASE}/admin/users/${userId}/block`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ block })
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || `Failed to ${block ? 'block' : 'unblock'} user`,
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('toggleUserBlock error:', error);
        throw error;
    }
}

/**
 * Delete a user (soft delete)
 * @param {string} userId
 */
export async function deleteUser(userId) {
    try {
        const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to delete user',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('deleteUser error:', error);
        throw error;
    }
}

// ==================== BUSINESS VERIFICATION ====================

/**
 * Get pending businesses for verification
 */
export async function getPendingBusinesses() {
    try {
        const response = await fetch(`${API_BASE}/admin/pending-businesses`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch pending businesses',
                status: response.status
            };
        }
        return result.businesses || [];
    } catch (error) {
        console.error('getPendingBusinesses error:', error);
        throw error;
    }
}

/**
 * Verify or reject a business
 * @param {string} businessId
 * @param {string} action - 'approve' or 'reject'
 * @param {string} reason - rejection reason (required for reject)
 */
export async function verifyBusiness(businessId, action, reason = '') {
    try {
        const response = await fetch(`${API_BASE}/admin/businesses/${businessId}/verify`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ action, reason })
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || `Failed to ${action} business`,
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('verifyBusiness error:', error);
        throw error;
    }
}

/**
 * Get all businesses (for admin view)
 * @param {object} filters - { page, limit, verified, active, search }
 */
export async function getAllBusinesses(filters = {}) {
    try {
        const params = new URLSearchParams(filters).toString();
        const url = `${API_BASE}/admin/businesses${params ? `?${params}` : ''}`;

        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch businesses',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('getAllBusinesses error:', error);
        throw error;
    }
}

// ==================== WORSHIP VERIFICATION ====================

/**
 * Get pending worship places for verification
 */
export async function getPendingWorship() {
    try {
        const response = await fetch(`${API_BASE}/admin/pending-worship`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch pending worship places',
                status: response.status
            };
        }
        return result.worship || [];
    } catch (error) {
        console.error('getPendingWorship error:', error);
        throw error;
    }
}

/**
 * Verify or reject a worship place
 * @param {string} worshipId
 * @param {string} action - 'approve' or 'reject'
 * @param {string} reason - rejection reason (required for reject)
 */
export async function verifyWorship(worshipId, action, reason = '') {
    try {
        const response = await fetch(`${API_BASE}/admin/worship/${worshipId}/verify`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ action, reason })
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || `Failed to ${action} worship place`,
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('verifyWorship error:', error);
        throw error;
    }
}

/**
 * Get all worship places (for admin view)
 */
export async function getAllWorship(filters = {}) {
    try {
        const params = new URLSearchParams(filters).toString();
        const url = `${API_BASE}/admin/worship${params ? `?${params}` : ''}`;

        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch worship places',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('getAllWorship error:', error);
        throw error;
    }
}

// ==================== JOB MANAGEMENT ====================

/**
 * Get all jobs (for admin view)
 * @param {object} filters - { page, limit, status, search }
 */
export async function getAllAdminJobs(filters = {}) {
    try {
        const params = new URLSearchParams(filters).toString();
        const url = `${API_BASE}/admin/jobs${params ? `?${params}` : ''}`;

        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch jobs',
                status: response.status
            };
        }
        return result; // Returns { jobs, pagination }
    } catch (error) {
        console.error('getAllAdminJobs error:', error);
        throw error;
    }
}

/**
 * Toggle job active status
 * @param {string} jobId
 * @param {boolean} active
 */
export async function toggleJobStatus(jobId, active) {
    try {
        const response = await fetch(`${API_BASE}/admin/jobs/${jobId}/toggle`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ active })
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update job status',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('toggleJobStatus error:', error);
        throw error;
    }
}

// ==================== SYSTEM SETTINGS ====================

/**
 * Get system settings
 */
export async function getSystemSettings() {
    try {
        const response = await fetch(`${API_BASE}/admin/settings`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch settings',
                status: response.status
            };
        }
        return result.settings;
    } catch (error) {
        console.error('getSystemSettings error:', error);
        throw error;
    }
}

/**
 * Update system settings
 * @param {object} settings - { requireBusinessVerification, requireWorshipVerification, defaultSearchRadius, maintenanceMode }
 */
export async function updateSystemSettings(settings) {
    try {
        const response = await fetch(`${API_BASE}/admin/settings`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(settings)
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update settings',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('updateSystemSettings error:', error);
        throw error;
    }
}

// ==================== BACKWARD COMPATIBILITY ====================

// Keep old function names for backward compatibility
export const getPendingShops = getPendingBusinesses;
export const verifyShop = verifyBusiness;
export const getAllShops = getAllBusinesses;

// ==================== HELPER FUNCTIONS ====================

/**
 * Format admin data for display
 * @param {object} data - Raw data from API
 */
export function formatAdminData(data) {
    if (!data) return null;

    return {
        ...data,
        createdAt: data.created_at ? new Date(data.created_at).toLocaleDateString() : null,
        status: data.is_active ? 'Active' : 'Inactive',
        verificationStatus: data.is_verified ? 'Verified' : 'Pending'
    };
}

/**
 * Export data as CSV
 * @param {array} data - Array of objects
 * @param {string} filename
 */
export function exportToCSV(data, filename = 'export.csv') {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}