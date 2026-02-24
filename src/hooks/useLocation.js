import { useState, useEffect, useCallback } from 'react';
import {
    getCurrentLocation,
    watchLocation,
    clearLocationWatch,
    getSavedRadius,
    saveRadius,
    radiusToMeters,
    formatDistance,
    calculateDistance
} from '../utils/location';
import { saveUserLocation, getUserLocation } from '../utils/storage';

export const useLocation = (autoTrack = false) => {
    const [location, setLocation] = useState(getUserLocation());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [permission, setPermission] = useState(null);
    const [radius, setRadius] = useState(getSavedRadius);
    const [watchId, setWatchId] = useState(null);

    // Request location permission
    const requestPermission = useCallback(async () => {
        if (!navigator.permissions) {
            setPermission('unsupported');
            return;
        }

        try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            setPermission(result.state);
            
            result.addEventListener('change', () => {
                setPermission(result.state);
            });
        } catch (err) {
            console.error('Permission check error:', err);
            setPermission('unknown');
        }
    }, []);

    // Get current location once
    const getLocation = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const position = await getCurrentLocation();
            const locationData = {
                latitude: position.latitude,
                longitude: position.longitude,
                accuracy: position.accuracy,
                timestamp: new Date().toISOString()
            };
            
            setLocation(locationData);
            saveUserLocation(locationData);
            return locationData;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Start tracking location
    const startTracking = useCallback(() => {
        if (watchId) return;

        const id = watchLocation(
            (position) => {
                const locationData = {
                    latitude: position.latitude,
                    longitude: position.longitude,
                    accuracy: position.accuracy,
                    timestamp: new Date().toISOString()
                };
                setLocation(locationData);
                saveUserLocation(locationData);
            },
            (err) => {
                setError(err.message);
            }
        );

        setWatchId(id);
    }, [watchId]);

    // Stop tracking
    const stopTracking = useCallback(() => {
        if (watchId) {
            clearLocationWatch(watchId);
            setWatchId(null);
        }
    }, [watchId]);

    // Update radius preference
    const changeRadius = useCallback((newRadius) => {
        setRadius(newRadius);
        saveRadius(newRadius);
    }, []);

    // Calculate distance to a point
    const distanceTo = useCallback((lat, lng) => {
        if (!location) return null;
        
        const meters = calculateDistance(
            location.latitude,
            location.longitude,
            lat,
            lng
        );
        
        return {
            meters,
            formatted: formatDistance(meters),
            withinRadius: meters <= radiusToMeters(radius)
        };
    }, [location, radius]);

    // Auto-track on mount if enabled
    useEffect(() => {
        requestPermission();
        
        if (autoTrack) {
            getLocation().catch(console.error);
        }

        return () => {
            if (watchId) {
                stopTracking();
            }
        };
    }, [autoTrack, getLocation, requestPermission, stopTracking, watchId]);

    return {
        location,
        loading,
        error,
        permission,
        radius,
        getLocation,
        startTracking,
        stopTracking,
        changeRadius,
        distanceTo,
        isTracking: !!watchId,
        radiusMeters: radiusToMeters(radius)
    };
};