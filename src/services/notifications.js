const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

// Helper for auth headers
function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ==================== GET NOTIFICATIONS ====================

/**
 * Get notifications for current user
 * @param {object} params - { page, limit, type, unreadOnly }
 */
export async function getNotifications(params = {}) {
    try {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.type) searchParams.append('type', params.type);
        if (params.unreadOnly) searchParams.append('unreadOnly', params.unreadOnly);

        const url = `${API_BASE}/notifications${searchParams.toString() ? `?${searchParams}` : ''}`;
        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch notifications',
                status: response.status
            };
        }
        return result; // Returns { notifications, pagination, unreadCount }
    } catch (error) {
        console.error('getNotifications error:', error);
        throw error;
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
    try {
        const response = await fetch(`${API_BASE}/notifications/unread-count`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to get unread count',
                status: response.status
            };
        }
        return result.unreadCount || 0;
    } catch (error) {
        console.error('getUnreadCount error:', error);
        return 0;
    }
}

// ==================== MARK AS READ ====================

/**
 * Mark a notification as read
 * @param {string} notificationId
 */
export async function markNotificationRead(notificationId) {
    try {
        const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
            method: 'PUT', // Changed from PATCH to PUT to match our controller
            headers: authHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to mark notification as read',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('markNotificationRead error:', error);
        throw error;
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
    try {
        const response = await fetch(`${API_BASE}/notifications/read-all`, {
            method: 'PUT',
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to mark all as read',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('markAllNotificationsRead error:', error);
        throw error;
    }
}

// ==================== DELETE NOTIFICATIONS ====================

/**
 * Delete a notification
 * @param {string} notificationId
 */
export async function deleteNotification(notificationId) {
    try {
        const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to delete notification',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('deleteNotification error:', error);
        throw error;
    }
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications() {
    try {
        const response = await fetch(`${API_BASE}/notifications`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to delete all notifications',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('deleteAllNotifications error:', error);
        throw error;
    }
}

// ==================== POLLING & REAL-TIME ====================

let pollingInterval = null;
let pollingCallbacks = [];

/**
 * Start polling for new notifications
 * @param {function} callback - Function to call with new count
 * @param {number} intervalMs - Polling interval in milliseconds (default 30000)
 */
export function startNotificationPolling(callback, intervalMs = 30000) {
    if (pollingCallbacks.includes(callback)) return;

    pollingCallbacks.push(callback);

    // If already polling, just add callback
    if (pollingInterval) return;

    // Start polling
    pollingInterval = setInterval(async () => {
        try {
            const count = await getUnreadCount();
            pollingCallbacks.forEach(cb => cb(count));
        } catch (error) {
            console.error('Polling error:', error);
        }
    }, intervalMs);
}

/**
 * Stop notification polling
 * @param {function} callback - Callback to remove (omit to stop all)
 */
export function stopNotificationPolling(callback) {
    if (callback) {
        pollingCallbacks = pollingCallbacks.filter(cb => cb !== callback);
    } else {
        pollingCallbacks = [];
    }

    if (pollingCallbacks.length === 0 && pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

// ==================== NOTIFICATION TYPES ====================

/**
 * Get notification icon based on type
 * @param {string} type
 */
export function getNotificationIcon(type) {
    const icons = {
        'appointment_request': '📅',
        'appointment_approved': '✅',
        'appointment_rejected': '❌',
        'appointment_reminder': '⏰',
        'appointment_cancelled': '🚫',
        'business_verified': '🏪',
        'business_rejected': '⚠️',
        'new_job': '💼',
        'job_application': '📝',
        'application_status': '📊',
        'new_review': '⭐',
        'review_reply': '💬',
        'system': '🔔',
        'broadcast': '📢',
        'welcome': '👋',
        'verification': '✅'
    };
    return icons[type] || '📌';
}

/**
 * Get notification color based on type
 * @param {string} type
 */
export function getNotificationColor(type) {
    const colors = {
        'appointment_request': 'orange',
        'appointment_approved': 'green',
        'appointment_rejected': 'red',
        'appointment_reminder': 'blue',
        'appointment_cancelled': 'gray',
        'business_verified': 'green',
        'business_rejected': 'red',
        'new_job': 'purple',
        'job_application': 'blue',
        'application_status': 'teal',
        'new_review': 'yellow',
        'review_reply': 'cyan',
        'system': 'gray',
        'broadcast': 'indigo',
        'welcome': 'green',
        'verification': 'blue'
    };
    return colors[type] || 'gray';
}

/**
 * Get notification action button text
 * @param {object} notification
 */
export function getNotificationAction(notification) {
    if (!notification.data?.action) return null;

    const actions = {
        'view_appointment': 'View Appointment',
        'view_business': 'View Business',
        'view_job': 'View Job',
        'view_application': 'View Application',
        'view_reviews': 'View Reviews',
        'edit_business': 'Edit Business',
        'edit_worship': 'Edit Worship Place',
        'book_again': 'Book Again',
        'view_applications': 'View Applications'
    };

    return actions[notification.data.action] || 'View';
}

// ==================== UTILITIES ====================

/**
 * Format notification time
 * @param {string} timestamp
 */
export function formatNotificationTime(timestamp) {
    if (!timestamp) return '';

    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return past.toLocaleDateString();
}

/**
 * Group notifications by date
 * @param {array} notifications
 */
export function groupNotificationsByDate(notifications) {
    const groups = {
        today: [],
        yesterday: [],
        thisWeek: [],
        earlier: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    notifications.forEach(notification => {
        const date = new Date(notification.created_at);

        if (date >= today) {
            groups.today.push(notification);
        } else if (date >= yesterday) {
            groups.yesterday.push(notification);
        } else if (date >= weekAgo) {
            groups.thisWeek.push(notification);
        } else {
            groups.earlier.push(notification);
        }
    });

    return groups;
}

/**
 * Get notification sound (for audio alerts)
 * @param {string} type
 */
export function getNotificationSound(type) {
    // You can map different sounds to different notification types
    const sounds = {
        'appointment_request': 'soft',
        'appointment_approved': 'success',
        'new_job': 'notification',
        'system': 'alert'
    };
    return sounds[type] || 'default';
}

/**
 * Request notification permissions (for browser notifications)
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

/**
 * Show browser notification
 * @param {string} title
 * @param {object} options
 */
export function showBrowserNotification(title, options = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return false;
    }

    try {
        const notification = new Notification(title, {
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            ...options
        });

        notification.onclick = () => {
            window.focus();
            if (options.onClick) options.onClick();
        };

        return true;
    } catch (error) {
        console.error('Browser notification error:', error);
        return false;
    }
}

// ==================== NOTIFICATION PREFERENCES ====================

/**
 * Get notification preferences
 */
export function getNotificationPreferences() {
    const defaultPrefs = {
        appointment_requests: true,
        appointment_reminders: true,
        job_alerts: true,
        application_updates: true,
        business_verification: true,
        reviews: true,
        system_notifications: true,
        email_notifications: false,
        push_notifications: true,
        sound_enabled: true
    };

    const saved = localStorage.getItem('notification_preferences');
    return saved ? JSON.parse(saved) : defaultPrefs;
}

/**
 * Update notification preferences
 * @param {object} preferences
 */
export function updateNotificationPreferences(preferences) {
    const current = getNotificationPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem('notification_preferences', JSON.stringify(updated));
    return updated;
}

/**
 * Check if notification type is enabled
 * @param {string} type
 */
export function isNotificationEnabled(type) {
    const prefs = getNotificationPreferences();

    const typeMap = {
        'appointment_request': 'appointment_requests',
        'appointment_approved': 'appointment_requests',
        'appointment_rejected': 'appointment_requests',
        'appointment_reminder': 'appointment_reminders',
        'appointment_cancelled': 'appointment_requests',
        'new_job': 'job_alerts',
        'job_application': 'application_updates',
        'application_status': 'application_updates',
        'business_verified': 'business_verification',
        'business_rejected': 'business_verification',
        'new_review': 'reviews',
        'review_reply': 'reviews',
        'system': 'system_notifications',
        'broadcast': 'system_notifications'
    };

    const prefKey = typeMap[type] || 'system_notifications';
    return prefs[prefKey] !== false;
}

// ==================== BACKWARD COMPATIBILITY ====================

/**
 * @deprecated Use getNotifications() without userId
 */
export async function getNotificationsForUser(userId) {
    console.warn('getNotificationsForUser is deprecated. Use getNotifications() instead.');
    return getNotifications();
}