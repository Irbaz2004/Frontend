import { useState, useCallback, useEffect } from 'react';
import {
    getAvailableSlots,
    bookAppointment,
    getMyAppointments,
    getUpcomingAppointments,
    getAppointmentDetails,
    cancelAppointment,
    rescheduleAppointment,
    getUserAppointmentStats
} from '../services/appointments';
import { useAuth } from './useAuth';
import { showBrowserNotification } from '../services/notifications';

export const useAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        upcoming: 0,
        pending: 0,
        completed: 0,
        cancelled: 0
    });

    const { user } = useAuth();

    // Fetch user's appointments
    const fetchAppointments = useCallback(async (filters = {}) => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const result = await getMyAppointments(filters);
            setAppointments(result.appointments || []);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch upcoming appointments
    const fetchUpcoming = useCallback(async () => {
        if (!user) return;

        try {
            const result = await getUpcomingAppointments();
            setUpcoming(result.appointments || []);
            return result;
        } catch (err) {
            console.error('Error fetching upcoming:', err);
            return [];
        }
    }, [user]);

    // Fetch appointment stats
    const fetchStats = useCallback(async () => {
        if (!user) return;

        try {
            const data = await getUserAppointmentStats();
            setStats(data);
            return data;
        } catch (err) {
            console.error('Error fetching stats:', err);
            return stats;
        }
    }, [user]);

    // Get available slots for a doctor
    const checkAvailability = useCallback(async (doctorId, date) => {
        try {
            return await getAvailableSlots(doctorId, date);
        } catch (err) {
            console.error('Error checking availability:', err);
            throw err;
        }
    }, []);

    // Book an appointment
    const book = useCallback(async (data) => {
        if (!user) throw new Error('Please login to book appointment');

        setLoading(true);
        setError(null);

        try {
            const result = await bookAppointment(data);
            
            // Show notification
            showBrowserNotification('Appointment Booked', {
                body: result.requiresApproval 
                    ? 'Waiting for doctor approval'
                    : 'Appointment confirmed'
            });
            
            // Refresh lists
            await fetchAppointments();
            await fetchUpcoming();
            await fetchStats();
            
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user, fetchAppointments, fetchUpcoming, fetchStats]);

    // Cancel an appointment
    const cancel = useCallback(async (appointmentId) => {
        if (!user) throw new Error('Please login');

        try {
            await cancelAppointment(appointmentId);
            
            // Refresh lists
            await fetchAppointments();
            await fetchUpcoming();
            await fetchStats();
            
            return true;
        } catch (err) {
            console.error('Error cancelling appointment:', err);
            throw err;
        }
    }, [user, fetchAppointments, fetchUpcoming, fetchStats]);

    // Reschedule an appointment
    const reschedule = useCallback(async (appointmentId, newSlot) => {
        if (!user) throw new Error('Please login');

        try {
            const result = await rescheduleAppointment(appointmentId, newSlot);
            
            // Refresh lists
            await fetchAppointments();
            await fetchUpcoming();
            
            return result;
        } catch (err) {
            console.error('Error rescheduling:', err);
            throw err;
        }
    }, [user, fetchAppointments, fetchUpcoming]);

    // Get appointment details
    const getDetails = useCallback(async (appointmentId) => {
        try {
            return await getAppointmentDetails(appointmentId);
        } catch (err) {
            console.error('Error getting details:', err);
            throw err;
        }
    }, []);

    // Load initial data
    useEffect(() => {
        if (user) {
            fetchAppointments();
            fetchUpcoming();
            fetchStats();
        }
    }, [user, fetchAppointments, fetchUpcoming, fetchStats]);

    return {
        appointments,
        upcoming,
        loading,
        error,
        stats,
        fetchAppointments,
        fetchUpcoming,
        fetchStats,
        checkAvailability,
        book,
        cancel,
        reschedule,
        getDetails,
        hasUpcoming: upcoming.length > 0
    };
};