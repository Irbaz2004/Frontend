// services/notification.js
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

export async function getNotifications(limit = 50, offset = 0) {
    return apiCall(`/notifications?limit=${limit}&offset=${offset}`);
}

export async function getUnreadCount() {
    return apiCall('/notifications/unread/count');
}

export async function markNotificationRead(id) {
    return apiCall(`/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsRead() {
    return apiCall('/notifications/read/all', { method: 'PUT' });
}

export default {
    getNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
};