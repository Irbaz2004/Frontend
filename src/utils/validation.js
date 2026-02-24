// Form validation utilities

/**
 * Validate phone number
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate email
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {Object}
 */
export const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 6) {
        errors.push('At least 6 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('One number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('One special character (!@#$%^&*)');
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength: errors.length === 0 ? 'strong' : errors.length <= 2 ? 'medium' : 'weak'
    };
};

/**
 * Validate PIN code
 * @param {string} pincode
 * @returns {boolean}
 */
export const isValidPincode = (pincode) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
};

/**
 * Validate age
 * @param {number} age
 * @returns {boolean}
 */
export const isValidAge = (age) => {
    return age >= 18 && age <= 100;
};

/**
 * Validate URL
 * @param {string} url
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate coordinates
 * @param {number} lat
 * @param {number} lng
 * @returns {boolean}
 */
export const isValidCoordinates = (lat, lng) => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Validate registration form
 * @param {Object} data
 * @param {string} role
 * @returns {Object}
 */
export const validateRegistration = (data, role) => {
    const errors = {};

    // Common fields
    if (!data.fullName?.trim()) {
        errors.fullName = 'Full name is required';
    }

    if (!data.phone) {
        errors.phone = 'Phone number is required';
    } else if (!isValidPhone(data.phone)) {
        errors.phone = 'Invalid phone number';
    }

    if (!data.password) {
        errors.password = 'Password is required';
    } else if (data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    // Location fields
    if (!data.area?.trim()) {
        errors.area = 'Area is required';
    }
    if (!data.city?.trim()) {
        errors.city = 'City is required';
    }
    if (!data.state?.trim()) {
        errors.state = 'State is required';
    }

    // Role-specific fields
    if (role === 'business') {
        if (!data.businessName?.trim()) {
            errors.businessName = 'Business name is required';
        }
        if (!data.businessCategory) {
            errors.businessCategory = 'Business category is required';
        }
    }

    if (role === 'doctor') {
        if (!data.doctorName?.trim()) {
            errors.doctorName = 'Doctor name is required';
        }
        if (!data.specialization) {
            errors.specialization = 'Specialization is required';
        }
    }

    if (role === 'worship') {
        if (!data.worshipName?.trim()) {
            errors.worshipName = 'Worship place name is required';
        }
        if (!data.religionType) {
            errors.religionType = 'Religion type is required';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate login form
 * @param {Object} data
 * @returns {Object}
 */
export const validateLogin = (data) => {
    const errors = {};

    if (!data.phone) {
        errors.phone = 'Phone number is required';
    } else if (!isValidPhone(data.phone)) {
        errors.phone = 'Invalid phone number';
    }

    if (!data.password) {
        errors.password = 'Password is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate job form
 * @param {Object} data
 * @returns {Object}
 */
export const validateJob = (data) => {
    const errors = {};

    if (!data.title?.trim()) {
        errors.title = 'Job title is required';
    }

    if (!data.description?.trim()) {
        errors.description = 'Job description is required';
    }

    if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
        errors.salary = 'Minimum salary cannot be greater than maximum';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate appointment booking
 * @param {Object} data
 * @returns {Object}
 */
export const validateAppointment = (data) => {
    const errors = {};

    if (!data.date) {
        errors.date = 'Date is required';
    } else {
        const selectedDate = new Date(data.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            errors.date = 'Cannot book appointment in the past';
        }
    }

    if (!data.time) {
        errors.time = 'Time is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};