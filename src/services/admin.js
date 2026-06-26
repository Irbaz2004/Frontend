// services/admin.js
const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

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

// ===================== DASHBOARD STATS =====================

export async function getStats() {
    return apiCall('/admin/stats');
}

// ===================== ADMIN USER SERVICES =====================

export async function getAllUsers({ page = 1, limit = 10, search = '', role = 'all', verified = 'all', status = 'all', startDate = '', endDate = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (verified) params.append('verified', verified);
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return apiCall(`/admin/users?${params}`);
}

export async function getUserById(id) {
    return apiCall(`/admin/users/${id}`);
}

export async function updateUser(id, updates) {
    return apiCall(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
}

export async function deleteUser(id) {
    return apiCall(`/admin/users/${id}`, {
        method: 'DELETE',
    });
}

// ===================== ADMIN SHOP SERVICES =====================

export async function getAllShops({ page = 1, limit = 10, search = '', category = 'all', verified = 'all', status = 'all', startDate = '', endDate = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (verified) params.append('verified', verified);
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return apiCall(`/admin/shops?${params}`);
}

export async function getShopById(id) {
    return apiCall(`/admin/shops/${id}`);
}

export async function updateShop(id, updates) {
    return apiCall(`/admin/shops/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
}

export async function deleteShop(id) {
    return apiCall(`/admin/shops/${id}`, {
        method: 'DELETE',
    });
}

export async function getShopCategories() {
    return apiCall('/admin/shops/categories');
}

// ===================== SHOP VERIFICATION SERVICES =====================

export async function getUnverifiedShops({ page = 1, limit = 10, search = '', category = 'all', dateRange = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (dateRange) params.append('dateRange', dateRange);

    return apiCall(`/admin/verify-shops?${params}`);
}

export async function verifyShop(id) {
    return apiCall(`/admin/verify-shops/${id}/verify`, {
        method: 'POST',
    });
}

export default {
    getStats,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllShops,
    getShopById,
    updateShop,
    deleteShop,
    getShopCategories,
    getUnverifiedShops,
    verifyShop,
};