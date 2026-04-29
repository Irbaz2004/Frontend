// services/adminShop.js
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

// ===================== ADMIN SHOP SERVICES =====================

export async function getAllShops({ page = 1, limit = 20, search = '', status = 'all', category = '' }) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    
    return apiCall(`/admin/shops?${params}`);
}

export async function getShopByIdForAdmin(id) {
    return apiCall(`/admin/shops/${id}`);
}

export async function verifyShop(id, is_verified) {
    return apiCall(`/admin/shops/${id}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ is_verified }),
    });
}

export async function deleteShop(id) {
    return apiCall(`/admin/shops/${id}`, {
        method: 'DELETE',
    });
}

export async function getShopStatistics() {
    return apiCall('/admin/shops/statistics');
}

export async function bulkVerifyShops(ids, is_verified) {
    return apiCall('/admin/shops/bulk-verify', {
        method: 'POST',
        body: JSON.stringify({ ids, is_verified }),
    });
}

export async function getShopCategoriesList() {
    return apiCall('/admin/shops/categories');
}

export default {
    getAllShops,
    getShopByIdForAdmin,
    verifyShop,
    deleteShop,
    getShopStatistics,
    bulkVerifyShops,
    getShopCategoriesList,
};