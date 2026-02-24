import { useState, useCallback } from 'react';
import {
    getAdminStats,
    getReports,
    getAllUsers,
    toggleUserBlock,
    deleteUser,
    getPendingBusinesses,
    verifyBusiness,
    getPendingWorship,
    verifyWorship,
    getAllAdminJobs,
    toggleJobStatus,
    getSystemSettings,
    updateSystemSettings
} from '../services/admin';
import { useAuth } from './useAuth';

export const useAdmin = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { user } = useAuth();

    // Fetch dashboard stats
    const fetchStats = useCallback(async () => {
        if (!user || user.role !== 'admin') return;

        setLoading(true);
        setError(null);

        try {
            const data = await getAdminStats();
            setStats(data);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch reports
    const fetchReports = useCallback(async (period = 'week') => {
        if (!user || user.role !== 'admin') return;

        try {
            return await getReports(period);
        } catch (err) {
            console.error('Error fetching reports:', err);
            throw err;
        }
    }, [user]);

    // User management
    const fetchUsers = useCallback(async (filters = {}) => {
        if (!user || user.role !== 'admin') return;

        try {
            return await getAllUsers(filters);
        } catch (err) {
            console.error('Error fetching users:', err);
            throw err;
        }
    }, [user]);

    const blockUser = useCallback(async (userId, block) => {
        if (!user || user.role !== 'admin') return;

        try {
            return await toggleUserBlock(userId, block);
        } catch (err) {
            console.error('Error toggling user block:', err);
            throw err;
        }
    }, [user]);

    const removeUser = useCallback(async (userId) => {
        if (!user || user.role !== 'admin') return;

        try {
            return await deleteUser(userId);
        } catch (err) {
            console.error('Error deleting user:', err);
            throw err;
        }
    }, [user]);

    // Business verification
    const fetchPendingBusinesses = useCallback(async () => {
        if (!user || user.role !== 'admin') return;

        try {
            return await getPendingBusinesses();
        } catch (err) {
            console.error('Error fetching pending businesses:', err);
            throw err;
        }
    }, [user]);

    const approveBusiness = useCallback(async (businessId) => {
        if (!user || user.role !== 'admin') return;

        try {
            return await verifyBusiness(businessId, 'approve');
        } catch (err) {
            console.error('Error approving business:', err);
            throw err;
        }
    }, [user]);

    const rejectBusiness = useCallback(async (businessId, reason) => {
        if (!user || user.role !== 'admin') return;

        try {
            return await verifyBusiness(businessId, 'reject', reason);
        } catch (err) {
            console.error('Error rejecting business:', err);
            throw err;
        }
    }, [user]);

    // Worship verification
    const fetchPendingWorship = useCallback(async () => {
        if (!user || user.role !== 'admin') return;

        try {
            return await getPendingWorship();
        } catch (err) {
            console.error('Error fetching pending worship:', err);
            throw err;
        }
    }, [user]);

    const approveWorship = useCallback(async (worshipId) => {
        if (!user || user.role !== 'admin') return;

        try {
            return await verifyWorship(worshipId, 'approve');
        } catch (err) {
            console.error('Error approving worship:', err);
            throw err;
        }
    }, [user]);

    const rejectWorship = useCallback(async (worshipId, reason) => {
        if (!user || user.role !== 'admin') return;

        try {
            return await verifyWorship(worshipId, 'reject', reason);
        } catch (err) {
            console.error('Error rejecting worship:', err);
            throw err;
        }
    }, [user]);

    // Job management
    const fetchJobs = useCallback(async (filters = {}) => {
        if (!user || user.role !== 'admin') return;

        try {
            return await getAllAdminJobs(filters);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            throw err;
        }
    }, [user]);

    const activateJob = useCallback(async (jobId) => {
        if (!user || user.role !== 'admin') return;

        try {
            return await toggleJobStatus(jobId, true);
        } catch (err) {
            console.error('Error activating job:', err);
            throw err;
        }
    }, [user]);

    const deactivateJob = useCallback(async (jobId) => {
        if (!user || user.role !== 'admin') return;

        try {
            return await toggleJobStatus(jobId, false);
        } catch (err) {
            console.error('Error deactivating job:', err);
            throw err;
        }
    }, [user]);

    // System settings
    const fetchSettings = useCallback(async () => {
        if (!user || user.role !== 'admin') return;

        try {
            return await getSystemSettings();
        } catch (err) {
            console.error('Error fetching settings:', err);
            throw err;
        }
    }, [user]);

    const updateSettings = useCallback(async (settings) => {
        if (!user || user.role !== 'admin') return;

        try {
            return await updateSystemSettings(settings);
        } catch (err) {
            console.error('Error updating settings:', err);
            throw err;
        }
    }, [user]);

    return {
        stats,
        loading,
        error,
        fetchStats,
        fetchReports,
        fetchUsers,
        blockUser,
        removeUser,
        fetchPendingBusinesses,
        approveBusiness,
        rejectBusiness,
        fetchPendingWorship,
        approveWorship,
        rejectWorship,
        fetchJobs,
        activateJob,
        deactivateJob,
        fetchSettings,
        updateSettings
    };
};