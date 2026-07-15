// services/house.js
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

export async function getHousesByLocation({ 
    latitude, 
    longitude, 
    radius = 10, 
    minRent = 0,
    maxRent = 100000,
    rooms = 0,
    furnished = '',
    search = '',
    page = 1, 
    limit = 12 
}) {
    const params = new URLSearchParams({
        latitude,
        longitude,
        radius,
        minRent,
        maxRent,
        rooms,
        page,
        limit
    });
    if (furnished && furnished !== 'all') params.append('furnished', furnished);
    if (search) params.append('search', search);
    
    return apiCall(`/houses/nearby?${params}`);
}

export async function getHouseById(id, userLocation = null) {
    let url = `/houses/${id}`;
    if (userLocation && userLocation.latitude && userLocation.longitude) {
        url += `?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
    }
    return apiCall(url);
}

export async function getHouseFilterOptions() {
    return apiCall('/houses/filters');
}

export async function incrementHouseViewCount(id) {
    return apiCall(`/houses/${id}/view`, {
        method: 'POST',
    });
}

export async function getTopViewedHouses(limit = 10) {
    return apiCall(`/houses/top-viewed?limit=${limit}`);
}

export default {
    getHousesByLocation,
    getHouseById,
    getHouseFilterOptions,
    incrementHouseViewCount,
    getTopViewedHouses,
};