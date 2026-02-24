// Formatting utilities

/**
 * Format date
 * @param {string|Date} date
 * @param {Object} options
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    const d = new Date(date);
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    return d.toLocaleDateString('en-IN', { ...defaultOptions, ...options });
};

/**
 * Format time
 * @param {string} time - "14:30"
 * @returns {string}
 */
export const formatTime = (time) => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Format datetime
 * @param {string} dateTime
 * @returns {string}
 */
export const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    
    const date = new Date(dateTime);
    return `${formatDate(date)} at ${formatTime(date.toTimeString().slice(0, 5))}`;
};

/**
 * Format relative time (time ago)
 * @param {string} timestamp
 * @returns {string}
 */
export const timeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatDate(past);
};

/**
 * Format currency
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'INR') => {
    if (amount === undefined || amount === null) return '';
    
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Format salary range
 * @param {number} min
 * @param {number} max
 * @param {string} period
 * @returns {string}
 */
export const formatSalary = (min, max, period = 'monthly') => {
    if (!min && !max) return 'Not specified';
    
    const periodText = {
        hourly: '/hr',
        daily: '/day',
        monthly: '/mo',
        yearly: '/yr'
    }[period] || '';
    
    if (min && !max) return `${formatCurrency(min)}${periodText}`;
    if (!min && max) return `Up to ${formatCurrency(max)}${periodText}`;
    return `${formatCurrency(min)} - ${formatCurrency(max)}${periodText}`;
};

/**
 * Format phone number
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
    if (!phone) return '';
    if (phone.length === 10) {
        return `${phone.slice(0, 5)} ${phone.slice(5)}`;
    }
    return phone;
};

/**
 * Format number with commas
 * @param {number} num
 * @returns {string}
 */
export const formatNumber = (num) => {
    return num?.toLocaleString('en-IN') || '0';
};

/**
 * Format file size
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format rating
 * @param {number} rating
 * @returns {string}
 */
export const formatRating = (rating) => {
    if (!rating) return 'New';
    return `${rating.toFixed(1)} ⭐`;
};

/**
 * Format address
 * @param {Object} address
 * @returns {string}
 */
export const formatAddress = (address) => {
    if (!address) return '';
    
    const parts = [
        address.street,
        address.area,
        address.city,
        address.state,
        address.pincode
    ].filter(Boolean);
    
    return parts.join(', ');
};

/**
 * Format duration
 * @param {number} minutes
 * @returns {string}
 */
export const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Format percentage
 * @param {number} value
 * @returns {string}
 */
export const formatPercentage = (value) => {
    return `${Math.round(value)}%`;
};

/**
 * Get day name from date
 * @param {string} date
 * @returns {string}
 */
export const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(date).getDay()];
};

/**
 * Get month name from date
 * @param {string} date
 * @returns {string}
 */
export const getMonthName = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[new Date(date).getMonth()];
};