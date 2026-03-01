// notifications.js — All notification API calls go through here

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

/**
 * Get notifications for a user
 * @param {string} userId
 */
export async function getNotifications(userId) {
    const response = await fetch(`${API_BASE}/notifications/${userId}`, {
        headers: authHeaders(),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch notifications');
    return result.notifications || result;
}

/**
 * Mark a notification as read
 * @param {string} notificationId
 */
export async function markNotificationRead(notificationId) {
    const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: authHeaders(),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to mark notification');
    return result;
}
