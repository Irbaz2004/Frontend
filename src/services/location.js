// services/location.js - All location-related API calls go through here

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

// ===================== LOCATION SERVICES =====================

export async function getAllCities() {
    const response = await fetch(`${API_BASE}/locations/cities`, {
        headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch cities');
    return result;
}

export async function getAreasByCity(city) {
    const response = await fetch(`${API_BASE}/locations/areas/${encodeURIComponent(city)}`, {
        headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch areas');
    return result;
}

export async function getCitiesWithAreas() {
    const response = await fetch(`${API_BASE}/locations/cities/with-areas`, {
        headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch cities with areas');
    return result;
}

export async function getAreasByCities(cities) {
    const citiesParam = cities.join(',');
    const response = await fetch(`${API_BASE}/locations/areas?cities=${encodeURIComponent(citiesParam)}`, {
        headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch areas');
    return result;
}

export async function searchLocations(query, city = null, limit = 20) {
    const params = new URLSearchParams({ q: query, limit });
    if (city) params.append('city', city);
    const response = await fetch(`${API_BASE}/locations/search?${params}`, {
        headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to search locations');
    return result;
}

export async function getAllLocations({ city, state, search, page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (city) params.append('city', city);
    if (state) params.append('state', state);
    if (search) params.append('search', search);
    const response = await fetch(`${API_BASE}/locations?${params}`, {
        headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch locations');
    return result;
}

export async function getLocationById(id) {
    const response = await fetch(`${API_BASE}/locations/${id}`, {
        headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch location details');
    return result;
}

export async function getLocationStats() {
    const response = await fetch(`${API_BASE}/locations/stats`, {
        headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch location stats');
    return result;
}

// ===================== VERIFY LOCATION =====================
// services/location.js - Update verifyLocation function

// ===================== VERIFY LOCATION =====================
export async function verifyLocation(latitude, longitude, city, area) {
    try {
        const response = await fetch(`${API_BASE}/locations/verify-location`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ 
                latitude: parseFloat(latitude), 
                longitude: parseFloat(longitude), 
                city: city.trim(), 
                area: area.trim() 
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Location verification failed');
        }
        
        return {
            verified: data.verified,
            message: data.message,
            selected: data.selected,
            actual: data.actual
        };
    } catch (error) {
        console.error('Error verifying location:', error);
        throw error;
    }
}

// ===================== SHOP CATEGORIES =====================
export async function getShopCategories() {
    try {
        const response = await fetch(`${API_BASE}/shop-categories/with-items`, {
            headers: authHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch categories');
        return data;
    } catch (error) {
        console.error('Error fetching shop categories:', error);
        return { categories: [] };
    }
}

// ===================== ADMIN ONLY APIS =====================

export async function createLocation(locationData) {
    const response = await fetch(`${API_BASE}/locations`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(locationData),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to create location');
    return result;
}

export async function updateLocation(id, locationData) {
    const response = await fetch(`${API_BASE}/locations/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(locationData),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to update location');
    return result;
}

export async function deleteLocation(id) {
    const response = await fetch(`${API_BASE}/locations/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to delete location');
    return result;
}

export async function permanentDeleteLocation(id) {
    const response = await fetch(`${API_BASE}/locations/${id}/permanent`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to permanently delete location');
    return result;
}

export async function bulkImportLocations(locations) {
    const response = await fetch(`${API_BASE}/locations/bulk-import`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ locations }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to bulk import locations');
    return result;
}

// ===================== HELPER FUNCTIONS =====================

export async function getCityOptions() {
    try {
        const result = await getAllCities();
        return result.cities || [];
    } catch (error) {
        console.error('Error fetching city options:', error);
        return [];
    }
}

export async function getAreaOptions(city) {
    if (!city) return [];
    try {
        const result = await getAreasByCity(city);
        return result.areas || [];
    } catch (error) {
        console.error(`Error fetching areas for ${city}:`, error);
        return [];
    }
}

export function formatLocationString(location) {
    if (!location) return '';
    const parts = [];
    if (location.area) parts.push(location.area);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    return parts.join(', ');
}

export async function locationExists(city, area) {
    try {
        const result = await searchLocations(area, city, 1);
        return result.total > 0;
    } catch (error) {
        return false;
    }
}