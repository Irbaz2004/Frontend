// auth.js — All authentication API calls go through here
// Never call Supabase directly from UI components

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Register a new user or shop owner
 * @param {string} role - 'user' | 'shop'
 * @param {object} data - Registration form data
 */
export async function registerUser(role, data) {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, ...data }),
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
    }
    return result; // { user, token }
}

/**
 * Login with phone and password
 * @param {string} phone
 * @param {string} password
 */
export async function loginUser(phone, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Login failed');
    }
    return result; // { user, token }
}

/**
 * Logout — clears local storage
 */
export function logoutUser() {
    localStorage.removeItem('nearzo_role');
    localStorage.removeItem('nearzo_token');
    localStorage.removeItem('nearzo_user');
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
    const stored = localStorage.getItem('nearzo_user');
    return stored ? JSON.parse(stored) : null;
}

/**
 * Get auth token
 */
export function getToken() {
    return localStorage.getItem('nearzo_token');
}
