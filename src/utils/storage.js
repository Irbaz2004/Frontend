// Local storage utilities

import { STORAGE_KEYS } from './constants';

/**
 * Save data to localStorage
 * @param {string} key
 * @param {any} value
 */
export const setStorage = (key, value) => {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

/**
 * Get data from localStorage
 * @param {string} key
 * @param {any} defaultValue
 * @returns {any}
 */
export const getStorage = (key, defaultValue = null) => {
    try {
        const serialized = localStorage.getItem(key);
        if (serialized === null) return defaultValue;
        return JSON.parse(serialized);
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
};

/**
 * Remove data from localStorage
 * @param {string} key
 */
export const removeStorage = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
};

/**
 * Clear all app data from localStorage
 */
export const clearStorage = () => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
};

/**
 * Save auth data
 * @param {Object} data
 */
export const saveAuthData = (data) => {
    setStorage(STORAGE_KEYS.TOKEN, data.token);
    setStorage(STORAGE_KEYS.USER, data.user);
    setStorage(STORAGE_KEYS.ROLE, data.user.role);
};

/**
 * Get auth data
 * @returns {Object}
 */
export const getAuthData = () => {
    return {
        token: getStorage(STORAGE_KEYS.TOKEN),
        user: getStorage(STORAGE_KEYS.USER),
        role: getStorage(STORAGE_KEYS.ROLE)
    };
};

/**
 * Clear auth data
 */
export const clearAuthData = () => {
    removeStorage(STORAGE_KEYS.TOKEN);
    removeStorage(STORAGE_KEYS.USER);
    removeStorage(STORAGE_KEYS.ROLE);
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    return !!getStorage(STORAGE_KEYS.TOKEN);
};

/**
 * Save notification preferences
 * @param {Object} prefs
 */
export const saveNotificationPrefs = (prefs) => {
    setStorage(STORAGE_KEYS.NOTIFICATION_PREFS, prefs);
};

/**
 * Get notification preferences
 * @returns {Object}
 */
export const getNotificationPrefs = () => {
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
    
    return getStorage(STORAGE_KEYS.NOTIFICATION_PREFS, defaultPrefs);
};

/**
 * Save theme preference
 * @param {string} theme
 */
export const saveTheme = (theme) => {
    setStorage(STORAGE_KEYS.THEME, theme);
};

/**
 * Get theme preference
 * @returns {string}
 */
export const getTheme = () => {
    return getStorage(STORAGE_KEYS.THEME, 'light');
};

/**
 * Save radius preference
 * @param {string} radius
 */
export const saveRadius = (radius) => {
    setStorage(STORAGE_KEYS.RADIUS, radius);
};

/**
 * Get radius preference
 * @returns {string}
 */
export const getRadius = () => {
    return getStorage(STORAGE_KEYS.RADIUS, '1km');
};

/**
 * Save remembered phone
 * @param {string} phone
 */
export const saveRememberedPhone = (phone) => {
    if (phone) {
        setStorage(STORAGE_KEYS.SAVED_PHONE, phone);
    } else {
        removeStorage(STORAGE_KEYS.SAVED_PHONE);
    }
};

/**
 * Get remembered phone
 * @returns {string}
 */
export const getRememberedPhone = () => {
    return getStorage(STORAGE_KEYS.SAVED_PHONE, '');
};

/**
 * Save user location
 * @param {Object} location
 */
export const saveUserLocation = (location) => {
    setStorage('user_location', location);
};

/**
 * Get user location
 * @returns {Object}
 */
export const getUserLocation = () => {
    return getStorage('user_location', null);
};

/**
 * Save draft data (for forms)
 * @param {string} key
 * @param {Object} data
 */
export const saveDraft = (key, data) => {
    setStorage(`draft_${key}`, data);
};

/**
 * Get draft data
 * @param {string} key
 * @returns {Object}
 */
export const getDraft = (key) => {
    return getStorage(`draft_${key}`, null);
};

/**
 * Clear draft data
 * @param {string} key
 */
export const clearDraft = (key) => {
    removeStorage(`draft_${key}`);
};

/**
 * Save recent searches
 * @param {string} query
 */
export const addRecentSearch = (query) => {
    if (!query) return;
    
    const searches = getRecentSearches();
    const newSearches = [query, ...searches.filter(q => q !== query)].slice(0, 10);
    setStorage('recent_searches', newSearches);
};

/**
 * Get recent searches
 * @returns {Array}
 */
export const getRecentSearches = () => {
    return getStorage('recent_searches', []);
};

/**
 * Clear recent searches
 */
export const clearRecentSearches = () => {
    removeStorage('recent_searches');
};