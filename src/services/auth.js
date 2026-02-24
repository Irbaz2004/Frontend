const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

/**
 * Register a new user/business/worship
 * @param {string} role - 'user' | 'business' | 'worship' | 'doctor' (business with category doctor)
 * @param {object} data - Registration form data
 */
export async function registerUser(role, data) {
    try {
        // Add role to data
        const payload = { role, ...data };

        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Registration failed',
                code: result.code,
                status: response.status
            };
        }

        // Save to localStorage if registration successful
        if (result.token) {
            localStorage.setItem('nearzo_token', result.token);
            localStorage.setItem('nearzo_user', JSON.stringify(result.user));
            localStorage.setItem('nearzo_role', result.user.role);
        }

        return result; // { user, token, message }
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

/**
 * Login with phone and password
 * @param {string} phone
 * @param {string} password
 */
export async function loginUser(phone, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Login failed',
                code: result.code,
                status: response.status
            };
        }

        // Save to localStorage
        localStorage.setItem('nearzo_token', result.token);
        localStorage.setItem('nearzo_user', JSON.stringify(result.user));
        localStorage.setItem('nearzo_role', result.user.role);

        return result; // { user, token }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Logout — clears local storage
 */
export function logoutUser() {
    localStorage.removeItem('nearzo_role');
    localStorage.removeItem('nearzo_token');
    localStorage.removeItem('nearzo_user');
    localStorage.removeItem('nearzo_radius'); // Clear saved radius
    sessionStorage.clear(); // Clear any session data
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
    try {
        const stored = localStorage.getItem('nearzo_user');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

/**
 * Get auth token
 */
export function getToken() {
    return localStorage.getItem('nearzo_token');
}

/**
 * Get user role
 */
export function getUserRole() {
    return localStorage.getItem('nearzo_role');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    return !!getToken();
}

/**
 * Get user profile from API
 */
export async function fetchUserProfile() {
    try {
        const token = getToken();
        if (!token) throw new Error('No token found');

        const response = await fetch(`${API_BASE}/auth/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch profile',
                status: response.status
            };
        }

        // Update stored user data
        if (result.user) {
            localStorage.setItem('nearzo_user', JSON.stringify(result.user));
        }

        return result.user;
    } catch (error) {
        console.error('Fetch profile error:', error);
        throw error;
    }
}

/**
 * Update user profile
 * @param {object} updates - Profile fields to update
 */
export async function updateUserProfile(updates) {
    try {
        const token = getToken();
        if (!token) throw new Error('No token found');

        const response = await fetch(`${API_BASE}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update profile',
                status: response.status
            };
        }

        // Update stored user data
        if (result.user) {
            const currentUser = getCurrentUser();
            localStorage.setItem('nearzo_user', JSON.stringify({
                ...currentUser,
                ...result.user
            }));
        }

        return result.user;
    } catch (error) {
        console.error('Update profile error:', error);
        throw error;
    }
}

/**
 * Change password
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export async function changePassword(currentPassword, newPassword) {
    try {
        const token = getToken();
        if (!token) throw new Error('No token found');

        const response = await fetch(`${API_BASE}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to change password',
                status: response.status
            };
        }

        return result;
    } catch (error) {
        console.error('Change password error:', error);
        throw error;
    }
}

/**
 * Request password reset (OTP)
 * @param {string} phone
 */
export async function requestPasswordReset(phone) {
    try {
        const response = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to request reset',
                status: response.status
            };
        }

        return result;
    } catch (error) {
        console.error('Password reset request error:', error);
        throw error;
    }
}

/**
 * Verify OTP and reset password
 * @param {string} phone
 * @param {string} otp
 * @param {string} newPassword
 */
export async function verifyOTPAndResetPassword(phone, otp, newPassword) {
    try {
        const response = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp, newPassword })
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to reset password',
                status: response.status
            };
        }

        return result;
    } catch (error) {
        console.error('Password reset error:', error);
        throw error;
    }
}

/**
 * Refresh token
 */
export async function refreshToken() {
    try {
        const token = getToken();
        if (!token) throw new Error('No token found');

        const response = await fetch(`${API_BASE}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to refresh token',
                status: response.status
            };
        }

        // Update stored token
        if (result.token) {
            localStorage.setItem('nearzo_token', result.token);
        }

        return result.token;
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
    }
}

/**
 * Delete account
 */
export async function deleteAccount() {
    try {
        const token = getToken();
        if (!token) throw new Error('No token found');

        const response = await fetch(`${API_BASE}/auth/delete-account`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to delete account',
                status: response.status
            };
        }

        // Clear storage on successful deletion
        logoutUser();

        return result;
    } catch (error) {
        console.error('Delete account error:', error);
        throw error;
    }
}

/**
 * Check if phone is already registered
 * @param {string} phone
 */
export async function checkPhoneAvailability(phone) {
    try {
        const response = await fetch(`${API_BASE}/auth/check-phone?phone=${phone}`);
        const result = await response.json();

        return {
            available: !result.exists,
            message: result.message
        };
    } catch (error) {
        console.error('Check phone error:', error);
        return { available: false, message: 'Error checking phone' };
    }
}

/**
 * Get registration form fields based on role
 * @param {string} role
 */
export function getRegistrationFields(role) {
    const commonFields = [
        { name: 'fullName', label: 'Full Name', type: 'text', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
        { name: 'latitude', type: 'hidden' },
        { name: 'longitude', type: 'hidden' },
        { name: 'area', label: 'Area', type: 'text', required: true },
        { name: 'city', label: 'City', type: 'text', required: true },
        { name: 'state', label: 'State', type: 'text', required: true },
        { name: 'street', label: 'Street', type: 'text' }
    ];

    const roleFields = {
        user: [
            { name: 'business', label: 'Business/Company (if any)', type: 'text' }
        ],
        business: [
            { name: 'businessName', label: 'Business Name', type: 'text', required: true },
            {
                name: 'businessCategory', label: 'Category', type: 'select',
                options: ['stationery', 'doctor', 'grocery', 'restaurant', 'salon', 'other'], required: true
            },
            { name: 'items', label: 'Items/Services (comma separated)', type: 'text' },
            { name: 'specialization', label: 'Specialization (for doctors)', type: 'text' },
            { name: 'coordinatorId', label: 'Coordinator ID (if any)', type: 'text' },
            { name: 'timings', label: 'Business Hours (JSON)', type: 'textarea' },
            { name: 'consultationFee', label: 'Consultation Fee (for doctors)', type: 'number' },
            { name: 'hasJobVacancy', label: 'Currently Hiring', type: 'checkbox' }
        ],
        doctor: [ // Special case of business
            { name: 'businessName', label: 'Clinic/Hospital Name', type: 'text', required: true },
            { name: 'doctorName', label: 'Doctor Name', type: 'text', required: true },
            { name: 'specialization', label: 'Specialization', type: 'text', required: true },
            { name: 'consultationFee', label: 'Consultation Fee', type: 'number', required: true },
            { name: 'timings', label: 'Clinic Hours', type: 'textarea', required: true },
            { name: 'qualifications', label: 'Qualifications', type: 'text' },
            { name: 'experience', label: 'Experience (years)', type: 'number' }
        ],
        worship: [
            { name: 'worshipName', label: 'Place of Worship Name', type: 'text', required: true },
            {
                name: 'religionType', label: 'Religion Type', type: 'select',
                options: ['masjid', 'temple', 'church', 'gurudwara', 'other'], required: true
            },
            { name: 'prayerTimings', label: 'Prayer Timings (JSON)', type: 'textarea' },
            { name: 'coordinatorId', label: 'Coordinator ID', type: 'text' }
        ]
    };

    return {
        common: commonFields,
        specific: roleFields[role] || []
    };
}