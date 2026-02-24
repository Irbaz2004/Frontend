const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

// Helper for auth headers
function authHeaders() {
    const token = localStorage.getItem('nearzo_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ==================== WORSHIP PROFILE ====================

/**
 * Get worship place profile
 */
export async function getWorshipProfile() {
    try {
        const user = JSON.parse(localStorage.getItem('nearzo_user') || '{}');
        if (!user.id) throw new Error('User not found');

        const response = await fetch(`${API_BASE}/worship/${user.id}`, {
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to fetch worship profile',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('getWorshipProfile error:', error);
        throw error;
    }
}

/**
 * Update worship place profile
 * @param {object} updates - Worship fields to update
 */
export async function updateWorshipProfile(updates) {
    try {
        const response = await fetch(`${API_BASE}/worship`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(updates)
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update worship profile',
                status: response.status
            };
        }

        // Update local storage
        const user = JSON.parse(localStorage.getItem('nearzo_user') || '{}');
        localStorage.setItem('nearzo_user', JSON.stringify({
            ...user,
            worshipName: updates.name || user.worshipName,
            religionType: updates.religionType || user.religionType
        }));

        return result.worship;
    } catch (error) {
        console.error('updateWorshipProfile error:', error);
        throw error;
    }
}

/**
 * Get worship place stats (views, reviews, events)
 */
export async function getWorshipStats() {
    try {
        const profile = await getWorshipProfile();
        return {
            totalViews: profile.viewCount || 0,
            averageRating: profile.rating || 0,
            totalReviews: profile.reviews?.length || 0,
            upcomingEvents: profile.upcomingEvents?.length || 0,
            totalEvents: profile.stats?.upcomingEvents || 0
        };
    } catch (error) {
        console.error('getWorshipStats error:', error);
        throw error;
    }
}

// ==================== PRAYER TIMINGS ====================

/**
 * Update prayer timings
 * @param {object} timings - Prayer timings object
 */
export async function updatePrayerTimings(timings) {
    try {
        const response = await fetch(`${API_BASE}/worship/prayer-timings`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ prayerTimings: timings })
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update prayer timings',
                status: response.status
            };
        }
        return result.prayerTimings;
    } catch (error) {
        console.error('updatePrayerTimings error:', error);
        throw error;
    }
}

/**
 * Update special timings (Ramadan, Holidays, etc.)
 * @param {object} specialTimings - Special timings object
 */
export async function updateSpecialTimings(specialTimings) {
    try {
        return await updateWorshipProfile({ specialTimings });
    } catch (error) {
        console.error('updateSpecialTimings error:', error);
        throw error;
    }
}

/**
 * Get today's prayer times
 */
export async function getTodayPrayerTimes() {
    try {
        const profile = await getWorshipProfile();
        const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });

        return {
            regular: profile.prayerTimings?.[today] || profile.prayerTimings?.daily || {},
            special: profile.specialTimings?.[today] || {},
            nextPrayer: profile.nextPrayer
        };
    } catch (error) {
        console.error('getTodayPrayerTimes error:', error);
        return { regular: {}, special: {}, nextPrayer: null };
    }
}

/**
 * Get weekly prayer schedule
 */
export async function getWeeklySchedule() {
    try {
        const profile = await getWorshipProfile();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const schedule = {};

        days.forEach(day => {
            schedule[day] = profile.prayerTimings?.[day] || profile.prayerTimings?.daily || {};
        });

        return schedule;
    } catch (error) {
        console.error('getWeeklySchedule error:', error);
        return {};
    }
}

// ==================== EVENTS MANAGEMENT ====================

/**
 * Get all events for worship place
 * @param {boolean} upcoming - Only upcoming events
 */
export async function getMyEvents(upcoming = true) {
    try {
        const user = JSON.parse(localStorage.getItem('nearzo_user') || '{}');
        const url = `${API_BASE}/worship/${user.id}/events?upcoming=${upcoming}`;

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
        console.error('getMyEvents error:', error);
        return [];
    }
}

/**
 * Create a new event
 * @param {object} eventData - { title, description, eventDate, startTime, endTime, type, isRecurring, recurringPattern }
 */
export async function createEvent(eventData) {
    try {
        const response = await fetch(`${API_BASE}/worship/events`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(eventData)
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to create event',
                status: response.status
            };
        }
        return result.event;
    } catch (error) {
        console.error('createEvent error:', error);
        throw error;
    }
}

/**
 * Update an event
 * @param {string} eventId
 * @param {object} updates
 */
export async function updateEvent(eventId, updates) {
    try {
        const response = await fetch(`${API_BASE}/worship/events/${eventId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(updates)
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to update event',
                status: response.status
            };
        }
        return result.event;
    } catch (error) {
        console.error('updateEvent error:', error);
        throw error;
    }
}

/**
 * Delete an event
 * @param {string} eventId
 */
export async function deleteEvent(eventId) {
    try {
        const response = await fetch(`${API_BASE}/worship/events/${eventId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to delete event',
                status: response.status
            };
        }
        return result;
    } catch (error) {
        console.error('deleteEvent error:', error);
        throw error;
    }
}

/**
 * Get upcoming events (limited for dashboard)
 */
export async function getUpcomingEvents(limit = 5) {
    try {
        const events = await getMyEvents(true);
        return events.slice(0, limit);
    } catch (error) {
        console.error('getUpcomingEvents error:', error);
        return [];
    }
}

// ==================== FACILITIES MANAGEMENT ====================

/**
 * Update facilities
 * @param {array} facilities - Array of facility names
 */
export async function updateFacilities(facilities) {
    try {
        return await updateWorshipProfile({ facilities });
    } catch (error) {
        console.error('updateFacilities error:', error);
        throw error;
    }
}

/**
 * Add a facility
 * @param {string} facility - Facility name
 */
export async function addFacility(facility) {
    try {
        const profile = await getWorshipProfile();
        const currentFacilities = profile.facilities || [];
        const newFacilities = [...currentFacilities, facility];
        return await updateFacilities(newFacilities);
    } catch (error) {
        console.error('addFacility error:', error);
        throw error;
    }
}

/**
 * Remove a facility
 * @param {string} facility - Facility name to remove
 */
export async function removeFacility(facility) {
    try {
        const profile = await getWorshipProfile();
        const currentFacilities = profile.facilities || [];
        const newFacilities = currentFacilities.filter(f => f !== facility);
        return await updateFacilities(newFacilities);
    } catch (error) {
        console.error('removeFacility error:', error);
        throw error;
    }
}

// ==================== IMAGES MANAGEMENT ====================

/**
 * Upload images
 * @param {array} images - Array of image URLs or FormData
 */
export async function uploadImages(images) {
    try {
        // This would connect to your upload endpoint
        // For now, just update profile with image URLs
        return await updateWorshipProfile({ images });
    } catch (error) {
        console.error('uploadImages error:', error);
        throw error;
    }
}

/**
 * Add a single image
 * @param {string} imageUrl
 */
export async function addImage(imageUrl) {
    try {
        const profile = await getWorshipProfile();
        const currentImages = profile.images || [];
        const newImages = [...currentImages, imageUrl];
        return await uploadImages(newImages);
    } catch (error) {
        console.error('addImage error:', error);
        throw error;
    }
}

/**
 * Remove an image
 * @param {string} imageUrl
 */
export async function removeImage(imageUrl) {
    try {
        const profile = await getWorshipProfile();
        const currentImages = profile.images || [];
        const newImages = currentImages.filter(img => img !== imageUrl);
        return await uploadImages(newImages);
    } catch (error) {
        console.error('removeImage error:', error);
        throw error;
    }
}

// ==================== DONATIONS (Optional) ====================

/**
 * Get donation history
 */
export async function getDonations() {
    try {
        // This would come from a donations API
        // For now, return empty array
        return [];
    } catch (error) {
        console.error('getDonations error:', error);
        return [];
    }
}

/**
 * Create a donation record
 * @param {object} donationData - { amount, paymentMethod, message }
 */
export async function createDonation(donationData) {
    try {
        const user = JSON.parse(localStorage.getItem('nearzo_user') || '{}');

        const response = await fetch(`${API_BASE}/worship/${user.id}/donations`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(donationData)
        });
        const result = await response.json();

        if (!response.ok) {
            throw {
                message: result.message || 'Failed to create donation',
                status: response.status
            };
        }
        return result.donation;
    } catch (error) {
        console.error('createDonation error:', error);
        throw error;
    }
}

// ==================== REVIEWS ====================

/**
 * Get all reviews for worship place
 */
export async function getWorshipReviews() {
    try {
        const profile = await getWorshipProfile();
        return profile.recentReviews || [];
    } catch (error) {
        console.error('getWorshipReviews error:', error);
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
        // This would connect to a reviews API
        // For now, just log
        console.log('Reply to review:', reviewId, reply);
        return { success: true };
    } catch (error) {
        console.error('replyToReview error:', error);
        throw error;
    }
}

// ==================== DASHBOARD ====================

/**
 * Get complete dashboard data
 */
export async function getDashboardData() {
    try {
        const [profile, stats, events, reviews] = await Promise.all([
            getWorshipProfile(),
            getWorshipStats(),
            getUpcomingEvents(5),
            getWorshipReviews()
        ]);

        // Get today's prayer times
        const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
        const todayPrayers = profile.prayerTimings?.[today] || profile.prayerTimings?.daily || {};

        return {
            profile: {
                name: profile.name,
                type: profile.religionType,
                isVerified: profile.isVerified,
                rating: profile.rating,
                address: profile.address
            },
            stats,
            todayPrayers,
            nextPrayer: profile.nextPrayer,
            upcomingEvents: events,
            recentReviews: reviews.slice(0, 3),
            quickActions: [
                { label: 'Update Prayer Times', icon: '⏰', action: 'prayer' },
                { label: 'Add Event', icon: '📅', action: 'event' },
                { label: 'Upload Photos', icon: '📸', action: 'photos' },
                { label: 'View Reviews', icon: '⭐', action: 'reviews' }
            ]
        };
    } catch (error) {
        console.error('getDashboardData error:', error);
        throw error;
    }
}

// ==================== SETTINGS ====================

/**
 * Update contact information
 * @param {object} contact - { phone, email, website }
 */
export async function updateContactInfo(contact) {
    try {
        return await updateWorshipProfile(contact);
    } catch (error) {
        console.error('updateContactInfo error:', error);
        throw error;
    }
}

/**
 * Update social media links
 * @param {object} social - { facebook, instagram, youtube, twitter }
 */
export async function updateSocialMedia(social) {
    try {
        return await updateWorshipProfile({ socialMedia: social });
    } catch (error) {
        console.error('updateSocialMedia error:', error);
        throw error;
    }
}

/**
 * Update address
 * @param {object} address - { street, area, city, state, pincode }
 */
export async function updateAddress(address) {
    try {
        return await updateWorshipProfile(address);
    } catch (error) {
        console.error('updateAddress error:', error);
        throw error;
    }
}

/**
 * Toggle active status
 * @param {boolean} isActive
 */
export async function toggleWorshipStatus(isActive) {
    try {
        return await updateWorshipProfile({ isActive });
    } catch (error) {
        console.error('toggleWorshipStatus error:', error);
        throw error;
    }
}

// ==================== UTILITIES ====================

/**
 * Format prayer times for display
 * @param {object} prayers - Prayer timings object
 */
export function formatPrayerTimes(prayers) {
    if (!prayers) return [];

    const prayerNames = {
        fajr: 'Fajr',
        sunrise: 'Sunrise',
        dhuhr: 'Dhuhr',
        asr: 'Asr',
        maghrib: 'Maghrib',
        isha: 'Isha',
        jummah: 'Jummah'
    };

    return Object.entries(prayers)
        .filter(([key]) => prayerNames[key])
        .map(([key, time]) => ({
            name: prayerNames[key],
            key,
            time,
            isNext: false // Will be set by component
        }));
}

/**
 * Get religion type options
 */
export function getReligionTypes() {
    return [
        { value: 'masjid', label: 'Masjid / Mosque', icon: '🕌' },
        { value: 'temple', label: 'Temple / Mandir', icon: '🛕' },
        { value: 'church', label: 'Church', icon: '⛪' },
        { value: 'gurudwara', label: 'Gurudwara', icon: '🛐' },
        { value: 'other', label: 'Other', icon: '📿' }
    ];
}

/**
 * Get facility options
 */
export function getFacilityOptions() {
    return [
        { value: 'wudu_area', label: 'Wudu Area' },
        { value: 'parking', label: 'Parking' },
        { value: 'wheelchair_access', label: 'Wheelchair Access' },
        { value: 'separate_entrance_women', label: 'Separate Entrance for Women' },
        { value: 'library', label: 'Library' },
        { value: 'community_hall', label: 'Community Hall' },
        { value: 'cafeteria', label: 'Cafeteria' },
        { value: 'bookshop', label: 'Bookshop' },
        { value: 'children_play_area', label: 'Children Play Area' }
    ];
}

/**
 * Get event type options
 */
export function getEventTypes() {
    return [
        { value: 'religious', label: 'Religious', icon: '📿' },
        { value: 'educational', label: 'Educational', icon: '📚' },
        { value: 'community', label: 'Community', icon: '👥' },
        { value: 'charity', label: 'Charity', icon: '🤝' },
        { value: 'celebration', label: 'Celebration', icon: '🎉' },
        { value: 'other', label: 'Other', icon: '📌' }
    ];
}

/**
 * Format worship data for display
 */
export function formatWorshipData(worship) {
    if (!worship) return null;

    return {
        ...worship,
        fullAddress: worship.address ?
            `${worship.address.street || ''} ${worship.address.area || ''} ${worship.address.city || ''} ${worship.address.state || ''}`.trim() :
            'Address not available',
        status: worship.is_active ? 'Active' : 'Inactive',
        verificationStatus: worship.isVerified ? 'Verified' : 'Pending',
        ratingText: worship.rating ? `${worship.rating} ⭐` : 'No ratings',
        facilitiesCount: worship.facilities?.length || 0,
        eventsCount: worship.upcomingEvents?.length || 0,
        reviewsCount: worship.recentReviews?.length || 0
    };
}

