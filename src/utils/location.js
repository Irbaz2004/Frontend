// Location utilities

/**
 * Get current location from browser
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                let message = 'Failed to get location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location permission denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timeout';
                        break;
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
};

/**
 * Watch user location
 * @param {Function} onSuccess - Callback with position
 * @param {Function} onError - Error callback
 * @returns {number} watcher ID
 */
export const watchLocation = (onSuccess, onError) => {
    if (!navigator.geolocation) {
        onError(new Error('Geolocation not supported'));
        return null;
    }

    return navigator.geolocation.watchPosition(
        (position) => {
            onSuccess({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            });
        },
        (error) => {
            let message = 'Failed to get location';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Location permission denied';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'Location unavailable';
                    break;
                case error.TIMEOUT:
                    message = 'Location request timeout';
                    break;
            }
            onError(new Error(message));
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
};

/**
 * Clear location watcher
 * @param {number} watcherId
 */
export const clearLocationWatch = (watcherId) => {
    if (watcherId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watcherId);
    }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

/**
 * Format distance for display
 * @param {number} meters
 * @returns {string}
 */
export const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)}km away`;
};

/**
 * Check if a point is within radius
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @param {number} radiusMeters
 * @returns {boolean}
 */
export const isWithinRadius = (lat1, lon1, lat2, lon2, radiusMeters) => {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= radiusMeters;
};

/**
 * Get address from coordinates (reverse geocoding)
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<Object>}
 */
export const getAddressFromCoords = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        
        return {
            street: data.address.road || '',
            area: data.address.suburb || data.address.neighbourhood || '',
            city: data.address.city || data.address.town || '',
            state: data.address.state || '',
            country: data.address.country || '',
            pincode: data.address.postcode || '',
            displayName: data.display_name
        };
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
};

/**
 * Get saved radius preference
 * @returns {string}
 */
export const getSavedRadius = () => {
    return localStorage.getItem('nearzo_radius') || '1km';
};

/**
 * Save radius preference
 * @param {string} radius
 */
export const saveRadius = (radius) => {
    localStorage.setItem('nearzo_radius', radius);
};

/**
 * Radius options for UI
 */
export const radiusOptions = [
    { value: '400m', label: '400m', meters: 400 },
    { value: '1km', label: '1km', meters: 1000 },
    { value: '2km', label: '2km', meters: 2000 },
    { value: '5km', label: '5km', meters: 5000 }
];

/**
 * Convert radius string to meters
 * @param {string} radius
 * @returns {number}
 */
export const radiusToMeters = (radius) => {
    const option = radiusOptions.find(opt => opt.value === radius);
    return option ? option.meters : 1000;
};