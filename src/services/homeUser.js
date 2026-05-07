// services/home.js
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

export async function getHomeData(city) {
    const params = new URLSearchParams({ city });
    return apiCall(`/home/data?${params}`);
}

export async function getUserCity() {
    return apiCall('/home/user-city');
}

export async function getShopsByCategory(city, category, limit = 20) {
    const params = new URLSearchParams({ city, category, limit });
    return apiCall(`/home/shops-by-category?${params}`);
}
// services/homeUser.js - Add this function

export const getAllCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/categories/all`);
        return response.data.categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

export default {
    getHomeData,
    getUserCity,
    getShopsByCategory,
    getAllCategories,
};