const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

// Helper for auth headers
function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ==================== LOCATION & NEARBY ====================

/**
 * Save user's current location
 * @param {number} latitude
 * @param {number} longitude
 */
export async function updateUserLocation(latitude, longitude) {
    try {
        const response = await fetch(`${API_BASE}/nearby/location`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ latitude, longitude })
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update location',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('updateUserLocation error:', error);
        throw error;
    }
}

/**
 * Get nearby places (all)
 * @param {object} params - { latitude, longitude, radius }
 */
export async function getNearbyAll(params) {
    try {
        const { latitude, longitude, radius = '1km' } = params;
        const url = `${API_BASE}/nearby/all?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;

        const response = await fetch(url, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch nearby places',
                status: response.status
            };
        }
        return result; // Returns { radius, counts, results: { businesses, worship, jobs } }
    } catch (error) {
        console.error('getNearbyAll error:', error);
        throw error;
    }
}

/**
 * Get nearby businesses only
 * @param {object} params - { latitude, longitude, radius, category, search }
 */
export async function getNearbyBusinesses(params) {
    try {
        const { latitude, longitude, radius = '1km', category, search } = params;
        let url = `${API_BASE}/nearby/businesses?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;

        if (category) url += `&category=${category}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch nearby businesses',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('getNearbyBusinesses error:', error);
        throw error;
    }
}

/**
 * Get nearby worship places
 * @param {object} params - { latitude, longitude, radius, type }
 */
export async function getNearbyWorship(params) {
    try {
        const { latitude, longitude, radius = '1km', type } = params;
        let url = `${API_BASE}/nearby/worship?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;

        if (type) url += `&type=${type}`;

        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch nearby worship places',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('getNearbyWorship error:', error);
        throw error;
    }
}

/**
 * Get nearby jobs
 * @param {object} params - { latitude, longitude, radius }
 */
export async function getNearbyJobs(params) {
    try {
        const { latitude, longitude, radius = '1km' } = params;
        const url = `${API_BASE}/nearby/jobs?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;

        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch nearby jobs',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('getNearbyJobs error:', error);
        throw error;
    }
}

// ==================== SEARCH ====================

/**
 * Search for businesses, jobs, worship
 * @param {object} params - { q, lat, lng, radius, category, type, sort, page }
 */
export async function searchAll(params) {
    try {
        const searchParams = new URLSearchParams();

        // Add all non-empty params
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, value);
            }
        });

        const url = `${API_BASE}/search?${searchParams.toString()}`;
        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Search failed',
                status: response.status
            };
        }
        return result; // Returns { businesses, worship, jobs, suggestions, pagination }
    } catch (error) {
        console.error('searchAll error:', error);
        throw error;
    }
}

/**
 * Get autocomplete suggestions
 * @param {string} query
 */
export async function getAutocomplete(query) {
    try {
        if (!query || query.length < 2) return { suggestions: [] };

        const response = await fetch(`${API_BASE}/search/autocomplete?q=${encodeURIComponent(query)}`);
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to get suggestions',
                status: response.status
            };
        }
        return result; // Returns { suggestions }
    } catch (error) {
        console.error('getAutocomplete error:', error);
        return { suggestions: [] };
    }
}

/**
 * Get trending searches
 */
export async function getTrendingSearches() {
    try {
        const response = await fetch(`${API_BASE}/search/trending`);
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to get trending searches',
                status: response.status
            };
        }
        return result; // Returns { trending, popularCategories }
    } catch (error) {
        console.error('getTrendingSearches error:', error);
        return { trending: [], popularCategories: [] };
    }
}

/**
 * Search by category
 * @param {object} params - { category, lat, lng, radius, item, sort }
 */
export async function searchByCategory(params) {
    try {
        const searchParams = new URLSearchParams(params);
        const url = `${API_BASE}/search/category?${searchParams.toString()}`;

        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to search by category',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('searchByCategory error:', error);
        throw error;
    }
}

/**
 * Get user's search history
 */
export async function getSearchHistory() {
    try {
        const response = await fetch(`${API_BASE}/search/history`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to get search history',
                status: response.status
            };
        }
        return result.history || [];
    } catch (error) {
        console.error('getSearchHistory error:', error);
        return [];
    }
}

/**
 * Clear search history
 */
export async function clearSearchHistory() {
    try {
        const response = await fetch(`${API_BASE}/search/history`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to clear history',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('clearSearchHistory error:', error);
        throw error;
    }
}

// ==================== BUSINESSES ====================

/**
 * Get business details
 * @param {string} businessId
 */
export async function getBusinessDetails(businessId) {
    try {
        const response = await fetch(`${API_BASE}/businesses/${businessId}`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch business details',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('getBusinessDetails error:', error);
        throw error;
    }
}

/**
 * Get list of doctors with filters
 * @param {object} params - { lat, lng, radius, specialization, minFee, maxFee }
 */
export async function getDoctors(params) {
    try {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, value);
            }
        });

        const url = `${API_BASE}/businesses/doctors?${searchParams.toString()}`;
        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch doctors',
                status: response.status
            };
        }
        return result; // Returns { count, doctors }
    } catch (error) {
        console.error('getDoctors error:', error);
        throw error;
    }
}

/**
 * Add a review to a business
 * @param {string} businessId
 * @param {object} data - { rating, comment }
 */
export async function addBusinessReview(businessId, data) {
    try {
        const response = await fetch(`${API_BASE}/businesses/${businessId}/reviews`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to add review',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('addBusinessReview error:', error);
        throw error;
    }
}

// ==================== WORSHIP ====================

/**
 * Get worship place details
 * @param {string} worshipId
 */
export async function getWorshipDetails(worshipId) {
    try {
        const response = await fetch(`${API_BASE}/worship/${worshipId}`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch worship details',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('getWorshipDetails error:', error);
        throw error;
    }
}

/**
 * Get worship events
 * @param {string} worshipId
 * @param {boolean} upcoming - only upcoming events
 */
export async function getWorshipEvents(worshipId, upcoming = true) {
    try {
        const url = `${API_BASE}/worship/${worshipId}/events?upcoming=${upcoming}`;
        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch events',
                status: response.status
            };
        }
        return result.events || [];
    } catch (error) {
        console.error('getWorshipEvents error:', error);
        return [];
    }
}

/**
 * Add a review to worship place
 * @param {string} worshipId
 * @param {object} data - { rating, comment }
 */
export async function addWorshipReview(worshipId, data) {
    try {
        const response = await fetch(`${API_BASE}/worship/${worshipId}/reviews`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to add review',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('addWorshipReview error:', error);
        throw error;
    }
}

// ==================== NOTIFICATIONS ====================

/**
 * Get user notifications
 * @param {object} params - { page, limit, type, unreadOnly }
 */
export async function getNotifications(params = {}) {
    try {
        const searchParams = new URLSearchParams(params);
        const url = `${API_BASE}/notifications?${searchParams.toString()}`;

        const response = await fetch(url, { headers: authHeaders() });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch notifications',
                status: response.status
            };
        }
        return result; // Returns { notifications, unreadCount, pagination }
    } catch (error) {
        console.error('getNotifications error:', error);
        return { notifications: [], unreadCount: 0, pagination: {} };
    }
}

/**
 * Mark notification as read
 * @param {string} notificationId
 */
export async function markNotificationRead(notificationId) {
    try {
        const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to mark as read',
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

// ==================== UTILITIES ====================

/**
 * Save radius preference
 * @param {string} radius - '400m', '1km', '2km'
 */
export function saveRadiusPreference(radius) {
    localStorage.setItem('nearzo_radius', radius);
}

/**
 * Get saved radius preference
 */
export function getRadiusPreference() {
    return localStorage.getItem('nearzo_radius') || '1km';
}

/**
 * Format distance for display
 * @param {number} meters
 */
export function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)}km away`;
}

/**
 * Format time ago
 * @param {string} timestamp
 */
export function timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return past.toLocaleDateString();
}