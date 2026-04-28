// services/profile.js
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

// Profile
export async function getProfile() {
    return apiCall('/profile');
}

export async function updateProfile(data) {
    return apiCall('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function changePassword(data) {
    return apiCall('/profile/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function deleteAccount(password) {
    return apiCall('/profile/account', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
    });
}

// Shops
export async function createShop(data) {
    return apiCall('/profile/shops', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getUserShops() {
    return apiCall('/profile/shops');
}

export async function updateShop(id, data) {
    return apiCall(`/profile/shops/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteShop(id) {
    return apiCall(`/profile/shops/${id}`, {
        method: 'DELETE',
    });
}

// Houses
export async function createHouse(data) {
    return apiCall('/profile/houses', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getUserHouses() {
    return apiCall('/profile/houses');
}

export async function updateHouse(id, data) {
    return apiCall(`/profile/houses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteHouse(id) {
    return apiCall(`/profile/houses/${id}`, {
        method: 'DELETE',
    });
}

// Jobs
export async function createJob(data) {
    return apiCall('/profile/jobs', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getUserJobs() {
    return apiCall('/profile/jobs');
}

export async function updateJob(id, data) {
    return apiCall(`/profile/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteJob(id) {
    return apiCall(`/profile/jobs/${id}`, {
        method: 'DELETE',
    });
}

export default {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    createShop,
    getUserShops,
    updateShop,
    deleteShop,
    createHouse,
    getUserHouses,
    updateHouse,
    deleteHouse,
    createJob,
    getUserJobs,
    updateJob,
    deleteJob,
};