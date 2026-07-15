// services/user.js
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

// ===================== USER MANAGEMENT =====================

/**
 * Get all users with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search term
 * @param {string} params.role - Filter by role
 * @param {string} params.status - Filter by status (active/inactive/verified/unverified)
 */
export async function getUsers({ page = 1, limit = 10, search = '', role = '', status = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    
    return apiCall(`/admin/users?${params}`);
}

/**
 * Get user by ID with their shops and houses
 * @param {string} id - User ID
 */
export async function getUserById(id) {
    return apiCall(`/admin/users/${id}`);
}

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} userData - Updated user data
 */
export async function updateUser(id, userData) {
    return apiCall(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
}

/**
 * Delete user (soft delete)
 * @param {string} id - User ID
 */
export async function deleteUser(id) {
    return apiCall(`/admin/users/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Activate user
 * @param {string} id - User ID
 */
export async function activateUser(id) {
    return apiCall(`/admin/users/${id}/activate`, {
        method: 'POST',
    });
}

/**
 * Get user statistics
 */
export async function getUserStats() {
    return apiCall('/admin/users/stats');
}

export default {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    activateUser,
    getUserStats,
};