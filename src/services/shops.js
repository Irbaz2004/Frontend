// services/shop.js
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

// ===================== SHOP SERVICES =====================

/**
 * Get shops by location with filters
 * @param {Object} params - Query parameters
 * @param {number} params.latitude - User's latitude
 * @param {number} params.longitude - User's longitude
 * @param {number} params.radius - Radius in km (default: 10)
 * @param {string} params.category - Category filter
 * @param {string} params.search - Search term
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 */
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

/**
 * Get shop by ID
 * @param {string} id - Shop ID
 * @param {Object} userLocation - User's location for distance calculation
 */
export async function getShopById(id, userLocation = null) {
    let url = `/shops/${id}`;
    if (userLocation && userLocation.latitude && userLocation.longitude) {
        url += `?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
    }
    return apiCall(url);
}

/**
 * Get all shop categories with counts
 */
export async function getShopCategoriesWithCount() {
    return apiCall('/shops/categories');
}

export default {
    getShopsByLocation,
    getShopById,
    getShopCategoriesWithCount
};