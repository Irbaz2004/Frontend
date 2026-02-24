import { useState, useCallback, useEffect } from 'react';
import {
    getWorshipProfile,
    updateWorshipProfile,
    getWorshipStats,
    getMyEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    updatePrayerTimings,
    getDashboardData,
    getTodayPrayerTimes,
    getUpcomingEvents
} from '../services/worship';
import { useAuth } from './useAuth';

export const useWorship = () => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { user } = useAuth();

    // Fetch worship profile
    const fetchProfile = useCallback(async () => {
        if (!user || user.role !== 'worship') return;

        setLoading(true);
        setError(null);

        try {
            const data = await getWorshipProfile();
            setProfile(data);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch worship stats
    const fetchStats = useCallback(async () => {
        if (!user) return;

        try {
            const data = await getWorshipStats();
            setStats(data);
            return data;
        } catch (err) {
            console.error('Error fetching stats:', err);
            return null;
        }
    }, [user]);

    // Fetch events
    const fetchEvents = useCallback(async (upcoming = true) => {
        if (!user) return;

        try {
            const data = await getMyEvents(upcoming);
            setEvents(data);
            return data;
        } catch (err) {
            console.error('Error fetching events:', err);
            return [];
        }
    }, [user]);

    // Fetch prayer times
    const fetchPrayerTimes = useCallback(async () => {
        if (!user) return;

        try {
            const data = await getTodayPrayerTimes();
            setPrayerTimes(data);
            return data;
        } catch (err) {
            console.error('Error fetching prayer times:', err);
            return null;
        }
    }, [user]);

    // Fetch complete dashboard
    const fetchDashboard = useCallback(async () => {
        if (!user || user.role !== 'worship') return;

        setLoading(true);
        setError(null);

        try {
            const data = await getDashboardData();
            setDashboard(data);
            setProfile(data.profile);
            setStats(data.stats);
            setPrayerTimes(data.todayPrayers);
            setEvents(data.upcomingEvents);
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
            const data = await updateWorshipProfile(updates);
            setProfile(prev => ({ ...prev, ...data }));
            return data;
        } catch (err) {
            console.error('Error updating profile:', err);
            throw err;
        }
    }, [user]);

    // Update prayer timings
    const updatePrayers = useCallback(async (timings) => {
        if (!user) throw new Error('Not authenticated');

        try {
            const data = await updatePrayerTimings(timings);
            setPrayerTimes(prev => ({ ...prev, regular: data }));
            return data;
        } catch (err) {
            console.error('Error updating prayer times:', err);
            throw err;
        }
    }, [user]);

    // Create event
    const addEvent = useCallback(async (eventData) => {
        if (!user) throw new Error('Not authenticated');

        try {
            const event = await createEvent(eventData);
            setEvents(prev => [event, ...prev]);
            return event;
        } catch (err) {
            console.error('Error creating event:', err);
            throw err;
        }
    }, [user]);

    // Edit event
    const editEvent = useCallback(async (eventId, updates) => {
        if (!user) throw new Error('Not authenticated');

        try {
            const event = await updateEvent(eventId, updates);
            setEvents(prev => prev.map(e => e.id === eventId ? event : e));
            return event;
        } catch (err) {
            console.error('Error updating event:', err);
            throw err;
        }
    }, [user]);

    // Remove event
    const removeEvent = useCallback(async (eventId) => {
        if (!user) throw new Error('Not authenticated');

        try {
            await deleteEvent(eventId);
            setEvents(prev => prev.filter(e => e.id !== eventId));
            return true;
        } catch (err) {
            console.error('Error deleting event:', err);
            throw err;
        }
    }, [user]);

    // Load initial data
    useEffect(() => {
        if (user && user.role === 'worship') {
            fetchDashboard().catch(console.error);
        }
    }, [user, fetchDashboard]);

    return {
        profile,
        stats,
        events,
        prayerTimes,
        dashboard,
        loading,
        error,
        fetchProfile,
        fetchStats,
        fetchEvents,
        fetchPrayerTimes,
        fetchDashboard,
        updateProfile,
        updatePrayers,
        addEvent,
        editEvent,
        removeEvent,
        hasEvents: events.length > 0,
        nextPrayer: prayerTimes?.nextPrayer
    };
};