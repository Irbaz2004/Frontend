// shops.js — Backward compatibility layer for shops
// Now uses businesses API internally

import {
    getNearbyBusinesses as getNearbyBiz,
    getBusinessDetails,
    searchByCategory,
    getDoctors
} from './user.js';

import {
    getBusinessProfile,
    updateBusinessProfile,
    getMyJobs,
    createJob,
    getApplications,
    updateApplicationStatus,
    updateItems,
    getBusinessStats
} from './business.js';

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ==================== SHOP LISTINGS & DISCOVERY ====================

/**
 * Get nearby shops based on coordinates
 * @param {number} lat
 * @param {number} lng
 * @param {string} radius - '400m', '1km', '2km'
 */
export async function getNearbyShops(lat, lng, radius = '1km') {
    try {
        // Use the businesses API from user.js
        const result = await getNearbyBiz({
            latitude: lat,
            longitude: lng,
            radius
        });

        // Transform to old format for backward compatibility
        return {
            shops: result.businesses.map(b => ({
                id: b.id,
                name: b.name,
                category: b.category,
                phone: b.phone,
                address: b.address,
                distance: b.distance?.text,
                rating: b.rating,
                isVerified: b.isVerified,
                hasJobVacancy: b.hasJobVacancy,
                jobsCount: b.jobsCount,
                image: b.images?.[0]
            }))
        };
    } catch (error) {
        console.error('getNearbyShops error:', error);
        throw error;
    }
}

/**
 * Get details of a specific shop
 * @param {string} shopId
 */
export async function getShopDetails(shopId) {
    try {
        // Use businesses API from user.js
        const business = await getBusinessDetails(shopId);

        // Transform to old shop format
        return {
            shop: {
                id: business.id,
                name: business.businessName,
                category: business.category,
                description: business.description,
                phone: business.phone,
                email: business.email,
                website: business.website,
                address: business.address,
                location: business.location,
                items: business.items || [],
                specialization: business.specialization,
                timings: business.timings,
                images: business.images || [],
                rating: business.rating,
                reviews: business.reviews?.map(r => ({
                    id: r.id,
                    user: r.user,
                    rating: r.rating,
                    comment: r.comment,
                    date: r.date,
                    timeAgo: r.timeAgo
                })),
                isVerified: business.isVerified,
                hasJobVacancy: business.hasJobVacancy,
                jobs: business.jobs?.map(j => ({
                    id: j.id,
                    title: j.title,
                    description: j.description,
                    salary: j.salary,
                    type: j.jobType,
                    postedAt: j.postedAt
                })),
                stats: {
                    views: business.viewCount,
                    totalReviews: business.reviews?.length || 0,
                    activeJobs: business.jobs?.length || 0
                }
            }
        };
    } catch (error) {
        console.error('getShopDetails error:', error);
        throw error;
    }
}

// ==================== SHOP MANAGEMENT (for owners) ====================

/**
 * Get current shop owner's profile
 */
export async function getMyShopProfile() {
    try {
        return await getBusinessProfile();
    } catch (error) {
        console.error('getMyShopProfile error:', error);
        throw error;
    }
}

/**
 * Update shop profile
 * @param {object} updates
 */
export async function updateShopProfile(updates) {
    try {
        return await updateBusinessProfile(updates);
    } catch (error) {
        console.error('updateShopProfile error:', error);
        throw error;
    }
}

/**
 * Get shop statistics
 */
export async function getShopStats() {
    try {
        return await getBusinessStats();
    } catch (error) {
        console.error('getShopStats error:', error);
        throw error;
    }
}

// ==================== ITEMS MANAGEMENT ====================

/**
 * Update shop items
 * @param {array} items
 */
export async function updateShopItems(items) {
    try {
        return await updateItems(items);
    } catch (error) {
        console.error('updateShopItems error:', error);
        throw error;
    }
}

/**
 * Add an item
 * @param {string} item
 */
export async function addShopItem(item) {
    try {
        const profile = await getBusinessProfile();
        const currentItems = profile.items || [];
        const newItems = [...currentItems, item];
        return await updateItems(newItems);
    } catch (error) {
        console.error('addShopItem error:', error);
        throw error;
    }
}

/**
 * Remove an item
 * @param {string} item
 */
export async function removeShopItem(item) {
    try {
        const profile = await getBusinessProfile();
        const currentItems = profile.items || [];
        const newItems = currentItems.filter(i => i !== item);
        return await updateItems(newItems);
    } catch (error) {
        console.error('removeShopItem error:', error);
        throw error;
    }
}

// ==================== JOB MANAGEMENT ====================

/**
 * Get jobs posted by shop
 */
export async function getShopJobs() {
    try {
        return await getMyJobs();
    } catch (error) {
        console.error('getShopJobs error:', error);
        return [];
    }
}

/**
 * Post a new job
 * @param {object} jobData
 */
export async function postShopJob(jobData) {
    try {
        return await createJob(jobData);
    } catch (error) {
        console.error('postShopJob error:', error);
        throw error;
    }
}

// ==================== APPLICATIONS ====================

/**
 * Get applications for shop's jobs
 */
export async function getShopApplications() {
    try {
        return await getApplications();
    } catch (error) {
        console.error('getShopApplications error:', error);
        return [];
    }
}

/**
 * Update application status
 * @param {string} applicationId
 * @param {string} status
 * @param {string} feedback
 */
export async function updateShopApplicationStatus(applicationId, status, feedback = '') {
    try {
        return await updateApplicationStatus(applicationId, status, feedback);
    } catch (error) {
        console.error('updateShopApplicationStatus error:', error);
        throw error;
    }
}

// ==================== SEARCH & FILTERS ====================

/**
 * Search shops by category
 * @param {string} category
 * @param {object} params
 */
export async function searchShopsByCategory(category, params = {}) {
    try {
        const result = await searchByCategory({ category, ...params });

        return {
            shops: result.businesses?.map(b => ({
                id: b.id,
                name: b.name,
                category: b.category,
                items: b.items,
                rating: b.rating,
                distance: b.distance,
                phone: b.phone
            })) || [],
            availableItems: result.availableItems || []
        };
    } catch (error) {
        console.error('searchShopsByCategory error:', error);
        throw error;
    }
}

/**
 * Search shops by item
 * @param {string} item
 * @param {object} params
 */
export async function searchShopsByItem(item, params = {}) {
    try {
        return await searchShopsByCategory(params.category || 'stationery', {
            ...params,
            item
        });
    } catch (error) {
        console.error('searchShopsByItem error:', error);
        throw error;
    }
}

// ==================== DOCTORS (Special shops) ====================

/**
 * Get nearby doctors
 * @param {object} params
 */
export async function getNearbyDoctors(params) {
    try {
        return await getDoctors(params);
    } catch (error) {
        console.error('getNearbyDoctors error:', error);
        throw error;
    }
}

// ==================== UTILITIES ====================

/**
 * Get shop categories
 */
export function getShopCategories() {
    return [
        { value: 'stationery', label: 'Stationery Shop', icon: '📝' },
        { value: 'doctor', label: 'Doctor/Clinic', icon: '👨‍⚕️' },
        { value: 'grocery', label: 'Grocery Store', icon: '🛒' },
        { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
        { value: 'salon', label: 'Salon/Spa', icon: '💇' },
        { value: 'electronics', label: 'Electronics', icon: '📱' },
        { value: 'clothing', label: 'Clothing Store', icon: '👕' },
        { value: 'pharmacy', label: 'Pharmacy', icon: '💊' },
        { value: 'bakery', label: 'Bakery', icon: '🥐' },
        { value: 'other', label: 'Other', icon: '🏪' }
    ];
}

/**
 * Format shop hours
 * @param {object} timings
 */
export function formatShopHours(timings) {
    if (!timings) return 'Hours not available';

    const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
    const todayHours = timings[today] || timings.daily;

    if (!todayHours) return 'Closed today';
    if (todayHours === 'closed') return 'Closed today';

    return `Open: ${todayHours}`;
}

/**
 * Check if shop is open now
 * @param {object} timings
 */
export function isShopOpen(timings) {
    if (!timings) return false;

    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const todayHours = timings[today] || timings.daily;

    if (!todayHours || todayHours === 'closed') return false;

    // Parse hours like "9am-6pm" or "09:00-18:00"
    const [open, close] = todayHours.split('-').map(t => t.trim());

    // Simple check - you might want to parse properly
    return true; // Placeholder
}

// ==================== BACKWARD COMPATIBILITY ALIASES ====================

// Export all functions with both old and new names
export const getShopById = getShopDetails;
export const updateShop = updateShopProfile;
export const getShopStatistics = getShopStats;
export const getShopItems = async () => {
    const profile = await getBusinessProfile();
    return profile.items || [];
};