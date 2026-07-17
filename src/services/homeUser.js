// services/homeUser.js
import { cachedJson } from './fastCache';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

async function apiCall(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const run = async () => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: getAuthHeaders(),
            ...options,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'API call failed');
        }
        return data;
    };

    try {
        if (method === 'GET') {
            return cachedJson(`nearzo:api:home:${endpoint}`, run, 12000);
        }
        return run();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

export const getHomeData = async (city) => {
    const params = new URLSearchParams({ city });
    return apiCall(`/home/data?${params}`);
};

export const getUserCity = async () => {
    return apiCall('/home/user-city');
};

export const updateUserCity = async (city) => {
    return apiCall('/home/update-city', {
        method: 'POST',
        body: JSON.stringify({ city })
    });
};

export const getShopsByCategory = async (city, category, limit = 20) => {
    const params = new URLSearchParams({ city, category, limit: limit.toString() });
    return apiCall(`/home/shops-by-category?${params}`);
};

export default {
    getHomeData,
    getUserCity,
    updateUserCity,
    getShopsByCategory,
};
