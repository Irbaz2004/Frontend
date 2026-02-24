import { useState, useEffect, useCallback } from 'react';
import {
    getNearbyAll,
    getNearbyBusinesses,
    getNearbyWorship,
    getNearbyJobs
} from '../services/user';
import { useLocation } from './useLocation';
import { useDebounce } from './useDebounce';

export const useNearby = (autoFetch = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        type: '',
        search: ''
    });

    const { location, radius, distanceTo } = useLocation(true);
    const debouncedFilters = useDebounce(filters, 500);

    // Fetch nearby data
    const fetchNearby = useCallback(async (customFilters = {}) => {
        if (!location) {
            setError('Location not available');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = {
                latitude: location.latitude,
                longitude: location.longitude,
                radius,
                ...filters,
                ...customFilters
            };

            const result = await getNearbyAll(params);
            setData(result);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [location, radius, filters]);

    // Fetch specific types
    const fetchBusinesses = useCallback(async (customFilters = {}) => {
        if (!location) return;

        try {
            const params = {
                latitude: location.latitude,
                longitude: location.longitude,
                radius,
                ...filters,
                ...customFilters
            };
            return await getNearbyBusinesses(params);
        } catch (err) {
            console.error('Error fetching businesses:', err);
            throw err;
        }
    }, [location, radius, filters]);

    const fetchWorship = useCallback(async (customFilters = {}) => {
        if (!location) return;

        try {
            const params = {
                latitude: location.latitude,
                longitude: location.longitude,
                radius,
                ...filters,
                ...customFilters
            };
            return await getNearbyWorship(params);
        } catch (err) {
            console.error('Error fetching worship:', err);
            throw err;
        }
    }, [location, radius, filters]);

    const fetchJobs = useCallback(async (customFilters = {}) => {
        if (!location) return;

        try {
            const params = {
                latitude: location.latitude,
                longitude: location.longitude,
                radius,
                ...filters,
                ...customFilters
            };
            return await getNearbyJobs(params);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            throw err;
        }
    }, [location, radius, filters]);

    // Auto-fetch on location change
    useEffect(() => {
        if (autoFetch && location) {
            fetchNearby().catch(console.error);
        }
    }, [location, radius, debouncedFilters, autoFetch, fetchNearby]);

    // Get distance to a point
    const getDistance = useCallback((lat, lng) => {
        return distanceTo(lat, lng);
    }, [distanceTo]);

    // Update filters
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    // Refresh data
    const refresh = useCallback(() => {
        return fetchNearby();
    }, [fetchNearby]);

    return {
        data,
        loading,
        error,
        filters,
        location,
        radius,
        fetchNearby,
        fetchBusinesses,
        fetchWorship,
        fetchJobs,
        updateFilters,
        refresh,
        getDistance,
        counts: data?.counts || { businesses: 0, worship: 0, jobs: 0, total: 0 },
        businesses: data?.results?.businesses || [],
        worship: data?.results?.worship || [],
        jobs: data?.results?.jobs || []
    };
};