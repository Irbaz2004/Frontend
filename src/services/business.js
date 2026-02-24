const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

// Helper for auth headers
function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ==================== BUSINESS PROFILE ====================

/**
 * Get business profile
 */
export async function getBusinessProfile() {
    try {
        const user = JSON.parse(localStorage.getItem('nearzo_user') || '{}');
        if (!user.id) throw new Error('User not found');

        const response = await fetch(`${API_BASE}/businesses/${user.id}`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch business profile',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('getBusinessProfile error:', error);
        throw error;
    }
}

/**
 * Update business profile
 * @param {object} updates - Business fields to update
 */
export async function updateBusinessProfile(updates) {
    try {
        const response = await fetch(`${API_BASE}/businesses/profile`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(updates)
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update business profile',
                status: response.status
            };
        }

        // Update local storage
        const user = JSON.parse(localStorage.getItem('nearzo_user') || '{}');
        localStorage.setItem('nearzo_user', JSON.stringify({
            ...user,
            businessName: updates.businessName || user.businessName,
            businessCategory: updates.category || user.businessCategory
        }));

        return result.business;
    } catch (error) {
        console.error('updateBusinessProfile error:', error);
        throw error;
    }
}

/**
 * Get business stats (views, searches, reviews)
 */
export async function getBusinessStats() {
    try {
        const response = await fetch(`${API_BASE}/businesses/stats/owner`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch stats',
                status: response.status
            };
        }
        return result; // Returns { totalViews, totalSearches, averageRating, totalReviews, activeJobs, pendingAppointments }
    } catch (error) {
        console.error('getBusinessStats error:', error);
        throw error;
    }
}

// ==================== ITEMS MANAGEMENT ====================

/**
 * Update business items/products
 * @param {array} items - Array of items
 */
export async function updateItems(items) {
    try {
        const response = await fetch(`${API_BASE}/businesses/items`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ items })
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update items',
                status: response.status
            };
        }
        return result.items;
    } catch (error) {
        console.error('updateItems error:', error);
        throw error;
    }
}

/**
 * Add a single item
 * @param {string} item - Item name
 */
export async function addItem(item) {
    try {
        const currentItems = await getItems();
        const newItems = [...currentItems, item];
        return await updateItems(newItems);
    } catch (error) {
        console.error('addItem error:', error);
        throw error;
    }
}

/**
 * Remove an item
 * @param {string} item - Item name to remove
 */
export async function removeItem(item) {
    try {
        const currentItems = await getItems();
        const newItems = currentItems.filter(i => i !== item);
        return await updateItems(newItems);
    } catch (error) {
        console.error('removeItem error:', error);
        throw error;
    }
}

/**
 * Get current items
 */
export async function getItems() {
    try {
        const profile = await getBusinessProfile();
        return profile.items || [];
    } catch (error) {
        console.error('getItems error:', error);
        return [];
    }
}

// ==================== JOB VACANCY ====================

/**
 * Toggle job vacancy status
 * @param {boolean} hasVacancy - Whether business is hiring
 */
export async function toggleJobVacancy(hasVacancy) {
    try {
        const response = await fetch(`${API_BASE}/businesses/job-vacancy`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ hasVacancy })
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update job vacancy',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('toggleJobVacancy error:', error);
        throw error;
    }
}

// ==================== JOB MANAGEMENT ====================

/**
 * Get all jobs posted by this business
 */
export async function getMyJobs() {
    try {
        const response = await fetch(`${API_BASE}/jobs/my-jobs`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch jobs',
                status: response.status
            };
        }
        return result.jobs || [];
    } catch (error) {
        console.error('getMyJobs error:', error);
        throw error;
    }
}

/**
 * Create a new job posting
 * @param {object} jobData - { title, description, requirements, salary, type, openings }
 */
export async function createJob(jobData) {
    try {
        const response = await fetch(`${API_BASE}/jobs`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(jobData)
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to create job',
                status: response.status
            };
        }
        return result.job;
    } catch (error) {
        console.error('createJob error:', error);
        throw error;
    }
}

/**
 * Update a job posting
 * @param {string} jobId
 * @param {object} updates
 */
export async function updateJob(jobId, updates) {
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(updates)
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update job',
                status: response.status
            };
        }
        return result.job;
    } catch (error) {
        console.error('updateJob error:', error);
        throw error;
    }
}

/**
 * Delete a job posting
 * @param {string} jobId
 */
export async function deleteJob(jobId) {
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to delete job',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('deleteJob error:', error);
        throw error;
    }
}

// ==================== APPLICATIONS MANAGEMENT ====================

/**
 * Get all applications for business jobs
 */
export async function getApplications() {
    try {
        const response = await fetch(`${API_BASE}/jobs/applications`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch applications',
                status: response.status
            };
        }
        return result.applications || [];
    } catch (error) {
        console.error('getApplications error:', error);
        throw error;
    }
}

/**
 * Get applications for a specific job
 * @param {string} jobId
 */
export async function getJobApplications(jobId) {
    try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}/applications`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch applications',
                status: response.status
            };
        }
        return result.applications || [];
    } catch (error) {
        console.error('getJobApplications error:', error);
        throw error;
    }
}

/**
 * Update application status
 * @param {string} applicationId
 * @param {string} status - 'shortlisted' | 'rejected' | 'hired'
 * @param {string} feedback - Optional feedback
 */
export async function updateApplicationStatus(applicationId, status, feedback = '') {
    try {
        const response = await fetch(`${API_BASE}/jobs/applications/${applicationId}/status`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status, feedback })
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update application',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('updateApplicationStatus error:', error);
        throw error;
    }
}

// ==================== REVIEWS MANAGEMENT ====================

/**
 * Get all reviews for business
 */
export async function getBusinessReviews() {
    try {
        const profile = await getBusinessProfile();
        return profile.reviews || [];
    } catch (error) {
        console.error('getBusinessReviews error:', error);
        return [];
    }
}

/**
 * Reply to a review
 * @param {string} reviewId
 * @param {string} reply
 */
export async function replyToReview(reviewId, reply) {
    try {
        const response = await fetch(`${API_BASE}/reviews/${reviewId}/reply`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ reply })
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to reply to review',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('replyToReview error:', error);
        throw error;
    }
}

// ==================== DOCTOR SPECIFIC ====================

/**
 * Get today's appointments (for doctors)
 */
export async function getTodayAppointments() {
    try {
        const response = await fetch(`${API_BASE}/appointments/doctor/today`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch today\'s appointments',
                status: response.status
            };
        }
        return result; // Returns { date, total, upcoming, passed, nextAppointment }
    } catch (error) {
        console.error('getTodayAppointments error:', error);
        throw error;
    }
}

/**
 * Get appointment statistics (for doctors)
 */
export async function getAppointmentStats() {
    try {
        const response = await fetch(`${API_BASE}/appointments/doctor/stats`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch appointment stats',
                status: response.status
            };
        }
        return result; // Returns { today, pending, approved, completed, cancelled, monthly, completionRate }
    } catch (error) {
        console.error('getAppointmentStats error:', error);
        throw error;
    }
}

/**
 * Update doctor's availability/timings
 * @param {object} timings - { monday: "9am-5pm", tuesday: "9am-5pm", ... }
 */
export async function updateDoctorTimings(timings) {
    try {
        return await updateBusinessProfile({ timings });
    } catch (error) {
        console.error('updateDoctorTimings error:', error);
        throw error;
    }
}

/**
 * Update consultation fee
 * @param {number} fee
 */
export async function updateConsultationFee(fee) {
    try {
        return await updateBusinessProfile({ consultationFee: fee });
    } catch (error) {
        console.error('updateConsultationFee error:', error);
        throw error;
    }
}

// ==================== DASHBOARD ====================

/**
 * Get complete dashboard data
 */
export async function getDashboardData() {
    try {
        const [profile, stats, jobs, applications, reviews] = await Promise.all([
            getBusinessProfile(),
            getBusinessStats(),
            getMyJobs(),
            getApplications(),
            getBusinessReviews()
        ]);

        // Check if doctor for appointment stats
        let appointmentStats = null;
        if (profile.category === 'doctor') {
            appointmentStats = await getAppointmentStats();
        }

        return {
            profile,
            stats,
            jobs: {
                total: jobs.length,
                active: jobs.filter(j => j.is_active).length,
                list: jobs
            },
            applications: {
                total: applications.length,
                pending: applications.filter(a => a.status === 'pending').length,
                list: applications.slice(0, 5) // Recent 5
            },
            reviews: {
                total: reviews.length,
                average: profile.rating,
                list: reviews.slice(0, 5) // Recent 5
            },
            appointments: appointmentStats,
            recentActivity: await getRecentActivity()
        };
    } catch (error) {
        console.error('getDashboardData error:', error);
        throw error;
    }
}

/**
 * Get recent activity (for dashboard)
 */
async function getRecentActivity() {
    try {
        // This would come from an activity log API
        // For now, return empty array
        return [];
    } catch (error) {
        return [];
    }
}

// ==================== SETTINGS ====================

/**
 * Update business hours
 * @param {object} hours - Business hours object
 */
export async function updateBusinessHours(hours) {
    try {
        return await updateBusinessProfile({ timings: hours });
    } catch (error) {
        console.error('updateBusinessHours error:', error);
        throw error;
    }
}

/**
 * Toggle business active status
 * @param {boolean} isActive
 */
export async function toggleBusinessStatus(isActive) {
    try {
        return await updateBusinessProfile({ isActive });
    } catch (error) {
        console.error('toggleBusinessStatus error:', error);
        throw error;
    }
}

/**
 * Upload business photos
 * @param {array} photos - Array of photo URLs or FormData
 */
export async function uploadPhotos(photos) {
    try {
        // This would connect to your upload endpoint
        // For now, just update profile with image URLs
        return await updateBusinessProfile({ images: photos });
    } catch (error) {
        console.error('uploadPhotos error:', error);
        throw error;
    }
}

// ==================== UTILITIES ====================

/**
 * Format business data for display
 */
export function formatBusinessData(business) {
    if (!business) return null;

    return {
        ...business,
        address: business.address ?
            `${business.address.street || ''} ${business.address.area || ''} ${business.address.city || ''}`.trim() :
            'Address not available',
        status: business.is_active ? 'Active' : 'Inactive',
        verificationStatus: business.isVerified ? 'Verified' : 'Pending',
        ratingText: business.rating ? `${business.rating} ⭐` : 'No ratings',
        itemsCount: business.items?.length || 0,
        jobsCount: business.jobs?.length || 0,
        reviewsCount: business.reviews?.length || 0
    };
}

/**
 * Get business category options
 */
export function getBusinessCategories() {
    return [
        { value: 'stationery', label: 'Stationery Shop' },
        { value: 'doctor', label: 'Doctor/Clinic' },
        { value: 'grocery', label: 'Grocery Store' },
        { value: 'restaurant', label: 'Restaurant' },
        { value: 'salon', label: 'Salon/Spa' },
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing Store' },
        { value: 'other', label: 'Other' }
    ];
}

/**
 * Get job type options
 */
export function getJobTypes() {
    return [
        { value: 'full_time', label: 'Full Time' },
        { value: 'part_time', label: 'Part Time' },
        { value: 'contract', label: 'Contract' },
        { value: 'internship', label: 'Internship' }
    ];
}