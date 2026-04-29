// services/auth.js - Remove verifyLocation function

const API_BASE = import.meta.env.VITE_API_URL;

// Helper for API calls that don't require authentication
async function publicApiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API call failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// Helper for API calls that require authentication
async function privateApiCall(endpoint, options = {}) {
    try {
        const token = getToken();
        
        if (!token) {
            throw new Error('No authentication token');
        }
        
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                logoutUser();
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(data.message || 'API call failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// ===================== LOCATION SERVICES (Public) =====================
export async function fetchCities() {
    const data = await publicApiCall('/auth/cities');
    return data.cities || [];
}

export async function fetchAreasByCity(cityName) {
    const data = await publicApiCall(`/auth/areas/${encodeURIComponent(cityName)}`);
    return data.areas || [];
}

// ===================== AUTH SERVICES (Public) =====================
export async function registerUser(userData) {
    const result = await publicApiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
    
    if (result.token && result.user) {
        localStorage.setItem('nearzo_token', result.token);
        localStorage.setItem('nearzo_user', JSON.stringify(result.user));
        localStorage.setItem('nearzo_role', result.user.role);
    }
    
    return result;
}

export async function loginUser(phone, password) {
    const result = await publicApiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
    });
    
    if (result.token && result.user) {
        localStorage.setItem('nearzo_token', result.token);
        localStorage.setItem('nearzo_user', JSON.stringify(result.user));
        localStorage.setItem('nearzo_role', result.user.role);
    }
    
    return result;
}

export async function checkAuth() {
    try {
        const token = getToken();
        if (!token) {
            return { authenticated: false };
        }
        
        const result = await privateApiCall('/auth/check-auth');
        return result;
    } catch (error) {
        return { authenticated: false };
    }
}

// ===================== PROFILE SERVICES (Private) =====================
export async function getProfile() {
    const result = await privateApiCall('/auth/profile');
    return result;
}

export async function updateProfile(updates) {
    const result = await privateApiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
    
    if (result.user) {
        const currentUser = getCurrentUser();
        const updatedUser = { ...currentUser, ...result.user };
        localStorage.setItem('nearzo_user', JSON.stringify(updatedUser));
    }
    
    return result;
}

// ===================== SHOP SERVICES (Private) =====================
export async function createShop(shopData) {
    const result = await privateApiCall('/auth/shops', {
        method: 'POST',
        body: JSON.stringify(shopData)
    });
    return result;
}

export async function getUserShops() {
    const result = await privateApiCall('/auth/shops');
    return result.shops || [];
}

// ===================== HOUSE SERVICES (Private) =====================
export async function createHouse(houseData) {
    const result = await privateApiCall('/auth/houses', {
        method: 'POST',
        body: JSON.stringify(houseData)
    });
    return result;
}

export async function getUserHouses() {
    const result = await privateApiCall('/auth/houses');
    return result.houses || [];
}

// ===================== HELPER FUNCTIONS =====================
export function logoutUser() {
    localStorage.removeItem('nearzo_role');
    localStorage.removeItem('nearzo_token');
    localStorage.removeItem('nearzo_user');
    sessionStorage.clear();
}

export function getCurrentUser() {
    const stored = localStorage.getItem('nearzo_user');
    if (!stored) return null;
    
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

export function getToken() {
    return localStorage.getItem('nearzo_token');
}

export function getUserRole() {
    return localStorage.getItem('nearzo_role');
}

export function isAuthenticated() {
    const token = getToken();
    const user = getCurrentUser();
    return !!(token && user);
}

export default {
    // Location
    fetchCities,
    fetchAreasByCity,
    // Auth
    registerUser,
    loginUser,
    checkAuth,
    logoutUser,
    getCurrentUser,
    getToken,
    getUserRole,
    isAuthenticated,
    // Profile
    getProfile,
    updateProfile,
    // Shop
    createShop,
    getUserShops,
    // House
    createHouse,
    getUserHouses
};