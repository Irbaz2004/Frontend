// src/services/auth.js
// All authentication API calls go through here
// Never call Supabase directly from UI components

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

// Helper for API calls with error handling
async function apiCall(endpoint, options = {}) {
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
            // Handle specific error codes
            if (data.code === 'TOKEN_EXPIRED') {
                logoutUser();
                throw new Error('Session expired. Please login again.');
            }
            if (data.code === 'INVALID_TOKEN') {
                logoutUser();
                throw new Error('Invalid session. Please login again.');
            }
            throw new Error(data.message || 'API call failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

/**
 * Fetch all categories
 */
export async function fetchCategories() {
    const data = await apiCall('/auth/categories');
    return data.categories || [];
}

/**
 * Fetch keywords by category
 * @param {string} categoryId - Category ID
 */
export async function fetchKeywordsByCategory(categoryId) {
    const data = await apiCall(`/auth/categories/${categoryId}/keywords`);
    return data.keywords || [];
}

/**
 * Register a new user or shop owner
 * @param {string} role - 'user' | 'business'
 * @param {object} data - Registration form data
 */
export async function registerUser(role, data) {
    const result = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ role, ...data }),
    });
    
    // Store auth data
    if (result.token && result.user) {
        localStorage.setItem('nearzo_role', result.user.role);
        localStorage.setItem('nearzo_token', result.token);
        localStorage.setItem('nearzo_user', JSON.stringify(result.user));
    }
    
    return result;
}

/**
 * Login with phone and password
 * @param {string} phone
 * @param {string} password
 */
export async function loginUser(phone, password) {
    const result = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
    });
    
    // Store auth data
    if (result.token && result.user) {
        localStorage.setItem('nearzo_role', result.user.role);
        localStorage.setItem('nearzo_token', result.token);
        localStorage.setItem('nearzo_user', JSON.stringify(result.user));
    }
    
    return result;
}

/**
 * Get current user profile
 */
export async function getProfile() {
    const token = getToken();
    if (!token) {
        throw new Error('No authentication token');
    }
    
    const result = await apiCall('/auth/profile', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    return result.user;
}

/**
 * Update user profile
 * @param {object} updates - Profile updates
 */
export async function updateProfile(updates) {
    const token = getToken();
    if (!token) {
        throw new Error('No authentication token');
    }
    
    const result = await apiCall('/auth/profile', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });
    
    // Update stored user data
    if (result.user) {
        localStorage.setItem('nearzo_user', JSON.stringify(result.user));
    }
    
    return result;
}

/**
 * Verify current token
 */
export async function verifyToken() {
    const token = getToken();
    if (!token) {
        return { valid: false };
    }
    
    try {
        const result = await apiCall('/auth/verify-token', {
            method: 'POST',
            body: JSON.stringify({ token })
        });
        return result;
    } catch (error) {
        return { valid: false };
    }
}

/**
 * Logout — clears local storage
 */
export function logoutUser() {
    localStorage.removeItem('nearzo_role');
    localStorage.removeItem('nearzo_token');
    localStorage.removeItem('nearzo_user');
    sessionStorage.clear();
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
    const stored = localStorage.getItem('nearzo_user');
    if (!stored) return null;
    
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

/**
 * Get auth token
 */
export function getToken() {
    return localStorage.getItem('nearzo_token');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    const token = getToken();
    const user = getCurrentUser();
    return !!(token && user);
}

/**
 * Get user role
 */
export function getUserRole() {
    return localStorage.getItem('nearzo_role');
}

/**
 * Check if user has specific role
 * @param {string|string[]} roles - Role or array of roles to check
 */
export function hasRole(roles) {
    const userRole = getUserRole();
    if (!userRole) return false;
    
    if (Array.isArray(roles)) {
        return roles.includes(userRole);
    }
    
    return userRole === roles;
}

/**
 * Set auth headers for API calls
 */
export function getAuthHeaders() {
    const token = getToken();
    return token ? {
        'Authorization': `Bearer ${token}`
    } : {};
}

/**
 * Refresh token (if using refresh tokens)
 */
export async function refreshToken() {
    // Implement if you have refresh token endpoint
    throw new Error('Not implemented');
}

// Export all functions
export default {
    fetchCategories,
    fetchKeywordsByCategory,
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    verifyToken,
    logoutUser,
    getCurrentUser,
    getToken,
    isAuthenticated,
    getUserRole,
    hasRole,
    getAuthHeaders
};