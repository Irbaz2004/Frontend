// services/profile.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Authorization': `Bearer ${token}`,
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

export async function getTotalViews() {
    return apiCall('/profile/total-views');
}

// Shops - FormData for image upload (like shopAds)
export async function createShop(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            if (key === 'keywords') {
                formData.append(key, JSON.stringify(data[key]));
            } else if (key !== 'shop_image') {
                formData.append(key, data[key]);
            }
        }
    });
    
    if (data.shop_image && data.shop_image instanceof File) {
        formData.append('shop_image', data.shop_image);
    }
    
    const token = localStorage.getItem('nearzo_token');
    const response = await fetch(`${API_BASE}/profile/shops`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'API call failed');
    return result;
}

export async function getUserShops() {
    return apiCall('/profile/shops');
}

export async function getUserShopsForJob() {
    return apiCall('/profile/shops/for-job');
}

export async function getShopByIdForEdit(id) {
    return apiCall(`/profile/shops/${id}/edit`);
}

export async function updateShop(id, data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            if (key === 'keywords') {
                formData.append(key, JSON.stringify(data[key]));
            } else if (key !== 'shop_image') {
                formData.append(key, data[key]);
            }
        }
    });
    
    if (data.shop_image && data.shop_image instanceof File) {
        formData.append('shop_image', data.shop_image);
    }
    
    const token = localStorage.getItem('nearzo_token');
    const response = await fetch(`${API_BASE}/profile/shops/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'API call failed');
    return result;
}

export async function deleteShop(id) {
    return apiCall(`/profile/shops/${id}`, {
        method: 'DELETE',
    });
}

// Houses - FormData for image upload
export async function createHouse(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            if (key !== 'house_image') {
                formData.append(key, data[key]);
            }
        }
    });
    
    if (data.house_image && data.house_image instanceof File) {
        formData.append('house_image', data.house_image);
    }
    
    const token = localStorage.getItem('nearzo_token');
    const response = await fetch(`${API_BASE}/profile/houses`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'API call failed');
    return result;
}

export async function getUserHouses() {
    return apiCall('/profile/houses');
}

export async function updateHouse(id, data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            if (key !== 'house_image') {
                formData.append(key, data[key]);
            }
        }
    });
    
    if (data.house_image && data.house_image instanceof File) {
        formData.append('house_image', data.house_image);
    }
    
    const token = localStorage.getItem('nearzo_token');
    const response = await fetch(`${API_BASE}/profile/houses/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'API call failed');
    return result;
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
    getTotalViews,
    createShop,
    getUserShops,
    getUserShopsForJob,
    getShopByIdForEdit,
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