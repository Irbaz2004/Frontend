import { useState, useCallback, useEffect } from 'react';
import {
    getJobs,
    getJobDetails,
    getMyJobs,
    getMyApplications,
    applyToJob,
    saveJob,
    getSavedJobs,
    getRecommendedJobs
} from '../services/jobs';
import { useAuth } from './useAuth';
import { useLocation } from './useLocation';
import { showBrowserNotification } from '../services/notifications';

export const useJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const [filters, setFilters] = useState({
        category: '',
        type: '',
        search: '',
        minSalary: '',
        maxSalary: '',
        sort: 'recent'
    });

    const { user } = useAuth();
    const { location } = useLocation();

    // Fetch jobs with filters
    const fetchJobs = useCallback(async (page = 1, customFilters = {}) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                ...filters,
                ...customFilters,
                ...(location && {
                    lat: location.latitude,
                    lng: location.longitude
                })
            };

            const result = await getJobs(params);
            setJobs(result.jobs);
            setPagination(result.pagination);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [filters, location]);

    // Get job details
    const getJob = useCallback(async (jobId) => {
        try {
            return await getJobDetails(jobId);
        } catch (err) {
            console.error('Error fetching job:', err);
            throw err;
        }
    }, []);

    // Apply to job
    const apply = useCallback(async (jobId, data = {}) => {
        if (!user) throw new Error('Please login to apply');

        try {
            const result = await applyToJob(jobId, data);
            
            // Show notification
            showBrowserNotification('Application Submitted', {
                body: 'Your application has been submitted successfully'
            });
            
            return result;
        } catch (err) {
            console.error('Error applying to job:', err);
            throw err;
        }
    }, [user]);

    // Save/unsave job
    const toggleSave = useCallback(async (jobId) => {
        if (!user) throw new Error('Please login to save jobs');

        try {
            const saved = await saveJob(jobId);
            return saved;
        } catch (err) {
            console.error('Error saving job:', err);
            throw err;
        }
    }, [user]);

    // Get saved jobs
    const fetchSavedJobs = useCallback(async () => {
        if (!user) return [];

        try {
            return await getSavedJobs();
        } catch (err) {
            console.error('Error fetching saved jobs:', err);
            return [];
        }
    }, [user]);

    // Get my applications
    const fetchMyApplications = useCallback(async () => {
        if (!user || user.role !== 'user') return [];

        try {
            return await getMyApplications();
        } catch (err) {
            console.error('Error fetching applications:', err);
            return [];
        }
    }, [user]);

    // Get my posted jobs (for businesses)
    const fetchMyJobs = useCallback(async () => {
        if (!user || !['business', 'doctor'].includes(user.role)) return [];

        try {
            return await getMyJobs();
        } catch (err) {
            console.error('Error fetching my jobs:', err);
            return [];
        }
    }, [user]);

    // Get recommended jobs
    const fetchRecommended = useCallback(async () => {
        if (!user) return [];

        try {
            return await getRecommendedJobs();
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            return [];
        }
    }, [user]);

    // Update filters
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    // Reset filters
    const resetFilters = useCallback(() => {
        setFilters({
            category: '',
            type: '',
            search: '',
            minSalary: '',
            maxSalary: '',
            sort: 'recent'
        });
    }, []);

    // Load jobs on mount
    useEffect(() => {
        fetchJobs().catch(console.error);
    }, [fetchJobs]);

    return {
        jobs,
        loading,
        error,
        pagination,
        filters,
        fetchJobs,
        getJob,
        apply,
        toggleSave,
        fetchSavedJobs,
        fetchMyApplications,
        fetchMyJobs,
        fetchRecommended,
        updateFilters,
        resetFilters,
        hasMore: pagination.page < pagination.pages
    };
};