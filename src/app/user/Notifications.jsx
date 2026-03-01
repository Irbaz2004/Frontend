import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Skeleton, Avatar } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getNotifications } from '../../services/notifications';

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('nearzo_user') || '{}');
                const data = await getNotifications(user.id);
                setNotifications(data || []);
            } catch {
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, pt: 1 }}>
                Notifications
            </Typography>

            {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 1.5, borderRadius: 3 }} />)
            ) : notifications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <NotificationsIcon sx={{ fontSize: 50, opacity: 0.2, mb: 1 }} />
                    <Typography>No notifications yet</Typography>
                </Box>
            ) : (
                notifications.map((notif, i) => (
                    <Card key={i} sx={{ mb: 1.5, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', opacity: notif.read ? 0.7 : 1 }}>
                        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Avatar sx={{ bgcolor: notif.read ? '#e0e0e0' : '#C00C0C', width: 40, height: 40 }}>
                                <NotificationsIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>
                                    {notif.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">{notif.message}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                            {!notif.read && (
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#C00C0C', mt: 0.5 }} />
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
}

export default Notifications;
