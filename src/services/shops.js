// services/shops.js - Add new function
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

export async function getShopsByLocation({ latitude, longitude, radius = 10, category = '', search = '', page = 1, limit = 20 }) {
    const params = new URLSearchParams({
        latitude,
        longitude,
        radius,
        page,
        limit
    });
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    return apiCall(`/shops/nearby?${params}`);
}

export async function getShopById(id, userLocation = null) {
    let url = `/shops/${id}`;
    if (userLocation && userLocation.latitude && userLocation.longitude) {
        url += `?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
    }
    return apiCall(url);
}

export async function getShopCategoriesWithCount() {
    return apiCall('/shops/categories');
}

export async function getTopViewedShops(limit = 10) {
    return apiCall(`/shops/top-viewed?limit=${limit}`);
}

export async function incrementShopViewCount(id) {
    return apiCall(`/shops/${id}/view`, {
        method: 'POST',
    });
}

export default {
    getShopsByLocation,
    getShopById,
    getShopCategoriesWithCount,
    getTopViewedShops,
    incrementShopViewCount,
};