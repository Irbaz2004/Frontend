// services/adminHouse.js
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

// ===================== ADMIN HOUSE SERVICES =====================

export async function getAllHouses({ page = 1, limit = 20, search = '', status = 'all', city = '', minRent = 0, maxRent = 100000 }) {
    const params = new URLSearchParams({ page, limit, minRent, maxRent });
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (city) params.append('city', city);
    
    return apiCall(`/admin/houses?${params}`);
}

export async function getHouseByIdForAdmin(id) {
    return apiCall(`/admin/houses/${id}`);
}

export async function verifyHouse(id, is_verified) {
    return apiCall(`/admin/houses/${id}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ is_verified }),
    });
}

export async function deleteHouse(id) {
    return apiCall(`/admin/houses/${id}`, {
        method: 'DELETE',
    });
}

export async function getHouseStatistics() {
    return apiCall('/admin/houses/statistics');
}

export async function bulkVerifyHouses(ids, is_verified) {
    return apiCall('/admin/houses/bulk-verify', {
        method: 'POST',
        body: JSON.stringify({ ids, is_verified }),
    });
}

export async function getHouseCitiesList() {
    return apiCall('/admin/houses/cities');
}

export default {
    getAllHouses,
    getHouseByIdForAdmin,
    verifyHouse,
    deleteHouse,
    getHouseStatistics,
    bulkVerifyHouses,
    getHouseCitiesList,
};