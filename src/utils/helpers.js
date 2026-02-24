// Common helper functions

/**
 * Debounce function
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function
 * @param {Function} func
 * @param {number} limit
 * @returns {Function}
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Deep clone object
 * @param {Object} obj
 * @returns {Object}
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj
 * @returns {boolean}
 */
export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

/**
 * Generate random ID
 * @returns {string}
 */
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

/**
 * Truncate text
 * @param {string} text
 * @param {number} length
 * @returns {string}
 */
export const truncateText = (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substr(0, length) + '...';
};

/**
 * Capitalize first letter
 * @param {string} text
 * @returns {string}
 */
export const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Get query params from URL
 * @returns {Object}
 */
export const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
};

/**
 * Build URL with query params
 * @param {string} base
 * @param {Object} params
 * @returns {string}
 */
export const buildUrl = (base, params = {}) => {
    const url = new URL(base, window.location.origin);
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            url.searchParams.append(key, params[key]);
        }
    });
    return url.toString();
};

/**
 * Copy to clipboard
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Copy failed:', err);
        return false;
    }
};

/**
 * Share content
 * @param {Object} data
 * @returns {Promise<boolean>}
 */
export const shareContent = async (data) => {
    if (navigator.share) {
        try {
            await navigator.share(data);
            return true;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
            }
            return false;
        }
    }
    return false;
};

/**
 * Open directions in maps
 * @param {number} lat
 * @param {number} lng
 */
export const openDirections = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
};

/**
 * Make phone call
 * @param {string} phone
 */
export const makePhoneCall = (phone) => {
    window.location.href = `tel:${phone}`;
};

/**
 * Send WhatsApp message
 * @param {string} phone
 * @param {string} message
 */
export const sendWhatsApp = (phone, message = '') => {
    const url = `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    window.open(url, '_blank');
};

/**
 * Download file
 * @param {Blob} blob
 * @param {string} filename
 */
export const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Convert file to base64
 * @param {File} file
 * @returns {Promise<string>}
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

/**
 * Sleep for ms
 * @param {number} ms
 * @returns {Promise}
 */
export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function
 * @param {Function} fn
 * @param {number} maxAttempts
 * @param {number} delay
 * @returns {Promise}
 */
export const retry = async (fn, maxAttempts = 3, delay = 1000) => {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxAttempts - 1) throw error;
            await sleep(delay);
        }
    }
};