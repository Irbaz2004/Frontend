import { useState, useEffect, useCallback } from 'react';
import {
    getNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteAllNotifications,
    startNotificationPolling,
    stopNotificationPolling,
    requestNotificationPermission,
    showBrowserNotification
} from '../services/notifications';
import { getNotificationPrefs } from '../utils/storage';
import { useAuth } from './useAuth';

export const useNotifications = (enablePolling = true) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const { user } = useAuth();
    const prefs = getNotificationPrefs();

    // Fetch notifications
    const fetchNotifications = useCallback(async (page = 1, filters = {}) => {
        if (!user) return;

        setLoading(true);
        setError(null);
        
        try {
            const result = await getNotifications({ page, ...filters });
            setNotifications(result.notifications);
            setUnreadCount(result.unreadCount);
            setPagination(result.pagination);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch unread count only
    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        
        try {
            const count = await getUnreadCount();
            setUnreadCount(count);
            return count;
        } catch (err) {
            console.error('Error fetching unread count:', err);
            return 0;
        }
    }, [user]);

    // Mark as read
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await markNotificationRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );
            setUnreadCount(0);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    }, []);

    // Delete notification
    const deleteOne = useCallback(async (notificationId) => {
        try {
            await deleteNotification(notificationId);
            const deleted = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            if (deleted && !deleted.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    }, [notifications]);

    // Delete all
    const deleteAll = useCallback(async () => {
        try {
            await deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    }, []);

    // Handle new notification (for polling)
    const handleNewNotification = useCallback((count) => {
        setUnreadCount(count);
        
        // Show browser notification if enabled
        if (prefs.push_notifications && count > unreadCount) {
            showBrowserNotification('New Notification', {
                body: `You have ${count} unread notification${count > 1 ? 's' : ''}`
            });
        }
    }, [unreadCount, prefs.push_notifications]);

    // Request browser notification permission
    const requestPermission = useCallback(async () => {
        if (prefs.push_notifications) {
            return await requestNotificationPermission();
        }
        return false;
    }, [prefs.push_notifications]);

    // Setup polling
    useEffect(() => {
        if (!user || !enablePolling) return;

        fetchNotifications().catch(console.error);
        startNotificationPolling(handleNewNotification);

        return () => {
            stopNotificationPolling(handleNewNotification);
        };
    }, [user, enablePolling, fetchNotifications, handleNewNotification]);

    // Request permission on mount
    useEffect(() => {
        if (user && prefs.push_notifications) {
            requestPermission().catch(console.error);
        }
    }, [user, prefs.push_notifications, requestPermission]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        pagination,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification: deleteOne,
        deleteAllNotifications: deleteAll,
        hasUnread: unreadCount > 0
    };
};