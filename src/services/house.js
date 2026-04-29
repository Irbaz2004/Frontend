// services/house.js
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

// ===================== HOUSE SERVICES =====================

/**
 * Get houses by location with filters
 * @param {Object} params - Query parameters
 * @param {number} params.latitude - User's latitude
 * @param {number} params.longitude - User's longitude
 * @param {number} params.radius - Radius in km (default: 10)
 * @param {number} params.minRent - Minimum rent
 * @param {number} params.maxRent - Maximum rent
 * @param {number} params.rooms - Minimum rooms
 * @param {string} params.furnished - Furnished status
 * @param {string} params.search - Search term
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 */
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

/**
 * Get house by ID
 * @param {string} id - House ID
 * @param {Object} userLocation - User's location for distance calculation
 */
export async function getHouseById(id, userLocation = null) {
    let url = `/houses/${id}`;
    if (userLocation && userLocation.latitude && userLocation.longitude) {
        url += `?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
    }
    return apiCall(url);
}

/**
 * Get house filter options
 */
export async function getHouseFilterOptions() {
    return apiCall('/houses/filters');
}

export default {
    getHousesByLocation,
    getHouseById,
    getHouseFilterOptions
};