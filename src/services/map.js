// services/map.js
import { cachedJson } from './fastCache';

const API_BASE = import.meta.env.VITE_API_URL;

function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function apiCall(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const run = async () => {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: authHeaders(),
            ...options,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'API call failed');
        return data;
    };

    try {
        if (method === 'GET') {
            return cachedJson(`nearzo:api:map:${endpoint}`, run, 8000);
        }
        return run();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// ===================== MAP SERVICES =====================

export async function getNearbyShops(latitude, longitude, radius = 2, search = '') {
    const params = new URLSearchParams({ latitude, longitude, radius });
    if (search) params.append('search', search);
    return apiCall(`/map/nearby/shops?${params}`);
}

export async function getNearbyHouses(latitude, longitude, radius = 2, search = '') {
    const params = new URLSearchParams({ latitude, longitude, radius });
    if (search) params.append('search', search);
    return apiCall(`/map/nearby/houses?${params}`);
}

export async function getNearbyJobs(latitude, longitude, radius = 2, search = '') {
    const params = new URLSearchParams({ latitude, longitude, radius });
    if (search) params.append('search', search);
    return apiCall(`/map/nearby/jobs?${params}`);
}

// services/map.js
export async function getAllNearby(latitude, longitude, radius = 2, types = 'shops,houses,jobs', search = '') {
    const params = new URLSearchParams({ 
        latitude, 
        longitude, 
        radius, 
        types 
    });
    if (search) params.append('search', search);
    return apiCall(`/map/nearby/all?${params}`);
}

export default {
    getNearbyShops,
    getNearbyHouses,
    getNearbyJobs,
    getAllNearby
};
