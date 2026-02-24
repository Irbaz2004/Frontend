import { useState, useCallback, useEffect } from 'react';
import {
    getBusinessProfile,
    updateBusinessProfile,
    getBusinessStats,
    getMyJobs,
    createJob,
    updateJob,
    deleteJob,
    getApplications,
    updateApplicationStatus,
    updateItems,
    getDashboardData
} from '../services/business';
import { useAuth } from './useAuth';

export const useBusiness = () => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { user } = useAuth();

    // Fetch business profile
    const fetchProfile = useCallback(async () => {
        if (!user || !['business', 'doctor'].includes(user.role)) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getBusinessProfile();
            setProfile(data);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch business stats
    const fetchStats = useCallback(async () => {
        if (!user) return;

        try {
            const data = await getBusinessStats();
            setStats(data);
            return data;
        } catch (err) {
            console.error('Error fetching stats:', err);
            return null;
        }
    }, [user]);

    // Fetch jobs
    const fetchJobs = useCallback(async () => {
        if (!user) return;

        try {
            const data = await getMyJobs();
            setJobs(data);
            return data;
        } catch (err) {
            console.error('Error fetching jobs:', err);
            return [];
        }
    }, [user]);

    // Fetch applications
    const fetchApplications = useCallback(async () => {
        if (!user) return;

        try {
            const data = await getApplications();
            setApplications(data);
            return data;
        } catch (err) {
            console.error('Error fetching applications:', err);
            return [];
        }
    }, [user]);

    // Fetch complete dashboard
    const fetchDashboard = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getDashboardData();
            setDashboard(data);
            setProfile(data.profile);
            setStats(data.stats);
            setJobs(data.jobs.list);
            setApplications(data.applications.list);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Update profile
    const updateProfile = useCallback(async (updates) => {
        if (!user) throw new Error('Not authenticated');

        try {
            const data = await updateBusinessProfile(updates);
            setProfile(prev => ({ ...prev, ...data }));
            return data;
        } catch (err) {
            console.error('Error updating profile:', err);
            throw err;
        }
    }, [user]);

    // Update items
    const updateBusinessItems = useCallback(async (items) => {
        if (!user) throw new Error('Not authenticated');

        try {
            const data = await updateItems(items);
            setProfile(prev => ({ ...prev, items: data }));
            return data;
        } catch (err) {
            console.error('Error updating items:', err);
            throw err;
        }
    }, [user]);

    // Create job
    const postJob = useCallback(async (jobData) => {
        if (!user) throw new Error('Not authenticated');

        try {
            const job = await createJob(jobData);
            setJobs(prev => [job, ...prev]);
            return job;
        } catch (err) {
            console.error('Error creating job:', err);
            throw err;
        }
    }, [user]);

    // Edit job
    const editJob = useCallback(async (jobId, updates) => {
        if (!user) throw new Error('Not authenticated');

        try {
            const job = await updateJob(jobId, updates);
            setJobs(prev => prev.map(j => j.id === jobId ? job : j));
            return job;
        } catch (err) {
            console.error('Error updating job:', err);
            throw err;
        }
    }, [user]);

    // Remove job
    const removeJob = useCallback(async (jobId) => {
        if (!user) throw new Error('Not authenticated');

        try {
            await deleteJob(jobId);
            setJobs(prev => prev.filter(j => j.id !== jobId));
            return true;
        } catch (err) {
            console.error('Error deleting job:', err);
            throw err;
        }
    }, [user]);

    // Update application status
    const updateAppStatus = useCallback(async (applicationId, status, feedback = '') => {
        if (!user) throw new Error('Not authenticated');

        try {
            await updateApplicationStatus(applicationId, status, feedback);
            setApplications(prev =>
                prev.map(a =>
                    a.id === applicationId ? { ...a, status, feedback } : a
                )
            );
            return true;
        } catch (err) {
            console.error('Error updating application:', err);
            throw err;
        }
    }, [user]);

    // Load initial data
    useEffect(() => {
        if (user && ['business', 'doctor'].includes(user.role)) {
            fetchDashboard().catch(console.error);
        }
    }, [user, fetchDashboard]);

    return {
        profile,
        stats,
        jobs,
        applications,
        dashboard,
        loading,
        error,
        fetchProfile,
        fetchStats,
        fetchJobs,
        fetchApplications,
        fetchDashboard,
        updateProfile,
        updateBusinessItems,
        postJob,
        editJob,
        removeJob,
        updateAppStatus,
        isDoctor: profile?.category === 'doctor'
    };
};