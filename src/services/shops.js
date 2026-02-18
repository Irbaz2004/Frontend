// shops.js — All shop-related API calls go through here

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

/**
 * Get nearby shops based on coordinates
 * @param {number|null} lat
 * @param {number|null} lng
 */
export async function getNearbyShops(lat, lng) {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat);
    if (lng) params.append('lng', lng);

    const response = await fetch(`${API_BASE}/shops/nearby?${params}`, {
        headers: authHeaders(),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch shops');
    return result.shops || result;
}

/**
 * Get details of a specific shop
 * @param {string} shopId
 */
export async function getShopDetails(shopId) {
    const response = await fetch(`${API_BASE}/shops/${shopId}`, {
        headers: authHeaders(),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch shop details');
    return result.shop || result;
}
