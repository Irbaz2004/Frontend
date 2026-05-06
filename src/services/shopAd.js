// services/shopAd.js
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

// ===================== SHOP AD SERVICES =====================

export async function createShopAd(formData) {
    const token = localStorage.getItem('nearzo_token');
    const response = await fetch(`${API_BASE}/admin/shop-ads`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API call failed');
    return data;
}

export async function getAllShopAds({ page = 1, limit = 20, search = '', status = 'all', priority = '' }) {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    
    return apiCall(`/admin/shop-ads?${params}`);
}

export async function getShopAdById(id) {
    return apiCall(`/admin/shop-ads/${id}`);
}

export async function updateShopAd(id, formData) {
    const token = localStorage.getItem('nearzo_token');
    const response = await fetch(`${API_BASE}/admin/shop-ads/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API call failed');
    return data;
}

export async function deleteShopAd(id) {
    return apiCall(`/admin/shop-ads/${id}`, {
        method: 'DELETE',
    });
}

export async function toggleAdStatus(id, is_active) {
    return apiCall(`/admin/shop-ads/${id}/toggle`, {
        method: 'PUT',
        body: JSON.stringify({ is_active }),
    });
}

export async function getActiveAds(limit = 10) {
    const params = new URLSearchParams({ limit });
    return apiCall(`/shop-ads/active?${params}`);
}

export async function getShopsForAds() {
    return apiCall('/admin/shop-ads/shops');
}

export async function getAdsStatistics() {
    return apiCall('/admin/shop-ads/statistics');
}

export default {
    createShopAd,
    getAllShopAds,
    getShopAdById,
    updateShopAd,
    deleteShopAd,
    toggleAdStatus,
    getActiveAds,
    getShopsForAds,
    getAdsStatistics,
};