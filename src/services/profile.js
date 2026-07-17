// services/profile.js
import { clearFastCache } from './fastCache';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function clearUserDataCaches() {
    clearFastCache('nearzo:api:home:');
    clearFastCache('nearzo:api:shops:');
    clearFastCache('nearzo:api:houses:');
    clearFastCache('nearzo:api:jobs:');
    clearFastCache('nearzo:api:map:');
}

function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Authorization': `Bearer ${token}`,
    };
}

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                ...authHeaders(),
                'Content-Type': 'application/json',
            },
            ...options,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'API call failed');
        if ((options.method || 'GET').toUpperCase() !== 'GET') {
            clearUserDataCaches();
        }
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// ===================== NOTIFICATION SERVICES =====================

/**
 * Create a notification for a new shop
 */
export async function createShopNotification(shopData) {
    const token = localStorage.getItem('nearzo_token');
    const response = await fetch(`${API_BASE}/profile/notifications`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'new_shop',
            title: `New Shop in ${shopData.city}`,
            message: `${shopData.business_name} (${shopData.category}) has been listed in ${shopData.area || shopData.city}`,
            reference_id: shopData.id,
            reference_type: 'shop',
            reference_image: shopData.shop_image || null,
            city: shopData.city
        })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to create notification');
    return result;
}

/**
 * Create a notification for a new house
 */
export async function createHouseNotification(houseData) {
    const token = localStorage.getItem('nearzo_token');
    const response = await fetch(`${API_BASE}/profile/notifications`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'new_house',
            title: `New House Listing in ${houseData.city}`,
            message: `${houseData.rooms} BHK house listed for ₹${houseData.rent_per_month}/month in ${houseData.area || houseData.city}`,
            reference_id: houseData.id,
            reference_type: 'house',
            reference_image: houseData.house_image || null,
            city: houseData.city
        })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to create notification');
    return result;
}

/**
 * Create a notification for a new job
 */
export async function createJobNotification(jobData) {
    const token = localStorage.getItem('nearzo_token');
    const response = await fetch(`${API_BASE}/profile/notifications`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'new_job',
            title: `New Job Opening in ${jobData.city}`,
            message: `${jobData.job_title} at ${jobData.company_name} - ₹${jobData.salary}/${jobData.salary_type === 'month' ? 'month' : 'day'}`,
            reference_id: jobData.id,
            reference_type: 'job',
            reference_image: jobData.shop_image || null,
            city: jobData.city
        })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to create notification');
    return result;
}

/**
 * Get all notifications for the current user with optional city filter
 * FIXED: Better error handling and city filtering
 */
export async function getNotifications(limit = 50, offset = 0, city = null) {
    const token = localStorage.getItem('nearzo_token');
    let url = `${API_BASE}/profile/notifications?limit=${limit}&offset=${offset}`;
    
    // Add city filter if provided - use for both admin and user
    if (city && city.trim() !== '') {
        url += `&city=${encodeURIComponent(city.trim())}`;
        console.log(`🔍 Fetching notifications for city: ${city}`);
    } else {
        console.log(`🔍 Fetching all notifications (no city filter)`);
    }
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch notifications');
        console.log(`📬 Got ${result.notifications?.length || 0} notifications, unread: ${result.unread_count || 0}`);
        return result;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
}

/**
 * Get unread notification count with optional city filter
 */
export async function getUnreadCount(city = null) {
    const token = localStorage.getItem('nearzo_token');
    let url = `${API_BASE}/profile/notifications/unread-count`;
    
    if (city && city.trim() !== '') {
        url += `?city=${encodeURIComponent(city.trim())}`;
    }
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch unread count');
        return result;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        throw error;
    }
}

/**
 * Get unread notification count (legacy - kept for compatibility)
 */
export async function getUnreadNotificationCount() {
    try {
        const result = await getNotifications(1, 0);
        return result.unread_count || 0;
    } catch (error) {
        console.error('Error fetching notification count:', error);
        return 0;
    }
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationRead(id) {
    const token = localStorage.getItem('nearzo_token');
    const response = await fetch(`${API_BASE}/profile/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to mark notification as read');
    return result;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(city = null) {
    const token = localStorage.getItem('nearzo_token');
    let url = `${API_BASE}/profile/notifications/read-all`;

    if (city && city.trim() !== '') {
        url += `?city=${encodeURIComponent(city.trim())}`;
    }

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to mark all notifications as read');
    return result;
}

/**
 * Delete a specific notification
 */
export async function deleteNotification(id) {
    const token = localStorage.getItem('nearzo_token');
    const response = await fetch(`${API_BASE}/profile/notifications/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to delete notification');
    return result;
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications() {
    const token = localStorage.getItem('nearzo_token');
    const response = await fetch(`${API_BASE}/profile/notifications/all`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to delete all notifications');
    return result;
}

// ===================== PROFILE SERVICES =====================

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

// ===================== LOCATION SERVICES =====================

export async function verifyLocation(lat, lng, city, area) {
    return apiCall('/profile/verify-location', {
        method: 'POST',
        body: JSON.stringify({ latitude: lat, longitude: lng, city, area }),
    });
}

// ===================== SHOP SERVICES =====================

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
    clearUserDataCaches();
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
    clearUserDataCaches();
    return result;
}

export async function deleteShop(id) {
    return apiCall(`/profile/shops/${id}`, {
        method: 'DELETE',
    });
}

// ===================== HOUSE SERVICES =====================

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
    clearUserDataCaches();
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
    clearUserDataCaches();
    return result;
}

export async function deleteHouse(id) {
    return apiCall(`/profile/houses/${id}`, {
        method: 'DELETE',
    });
}

// ===================== JOB SERVICES =====================

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
    const token = localStorage.getItem('nearzo_token');
    const response = await fetch(`${API_BASE}/profile/jobs/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'API call failed');
    clearUserDataCaches();
    return result;
}

export async function deleteJob(id) {
    return apiCall(`/profile/jobs/${id}`, {
        method: 'DELETE',
    });
}

// ===================== EXPORT DEFAULT =====================

export default {
    // Profile
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    getTotalViews,
    
    // Location
    verifyLocation,
    
    // Notifications
    getNotifications,
    getUnreadNotificationCount,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteAllNotifications,
    createShopNotification,
    createHouseNotification,
    createJobNotification,
    
    // Shops
    createShop,
    getUserShops,
    getUserShopsForJob,
    getShopByIdForEdit,
    updateShop,
    deleteShop,
    
    // Houses
    createHouse,
    getUserHouses,
    updateHouse,
    deleteHouse,
    
    // Jobs
    createJob,
    getUserJobs,
    updateJob,
    deleteJob,
};
