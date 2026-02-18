import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Avatar, Skeleton, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import StoreIcon from '@mui/icons-material/Store';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getNearbyJobs } from '../../services/jobs';
import { getNearbyShops } from '../../services/shops';

function Home() {
    const [jobs, setJobs] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('nearzo_user');
        if (stored) setUser(JSON.parse(stored));

        const load = async () => {
            try {
                const [j, s] = await Promise.all([
                    getNearbyJobs(null, null),
                    getNearbyShops(null, null),
                ]);
                setJobs(j?.slice(0, 4) || []);
                setShops(s?.slice(0, 4) || []);
            } catch {
                // silently fail — show empty state
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pt: 1 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                        Hi, {user?.fullName?.split(' ')[0] || 'there'} 👋
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 14, color: '#C00C0C' }} />
                        <Typography variant="caption" color="text.secondary">
                            {user?.city || 'Detecting location...'}
                        </Typography>
                    </Box>
                </Box>
                <Avatar sx={{ bgcolor: '#C00C0C', width: 44, height: 44, fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                    {user?.fullName?.[0] || 'U'}
                </Avatar>
            </Box>

            {/* Nearby Jobs */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon sx={{ color: '#C00C0C', fontSize: 20 }} /> Nearby Jobs
                    </Typography>
                    <Button size="small" sx={{ color: '#C00C0C', fontFamily: '"Outfit", sans-serif', textTransform: 'none' }}>
                        See all
                    </Button>
                </Box>
                {loading ? (
                    [1, 2].map(i => <Skeleton key={i} variant="rounded" height={90} sx={{ mb: 1, borderRadius: 3 }} />)
                ) : jobs.length === 0 ? (
                    <EmptyState icon={<WorkIcon />} text="No nearby jobs found yet" />
                ) : (
                    jobs.map((job, i) => (
                        <Card key={i} sx={{ mb: 1.5, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                    {job.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">{job.shopName}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                    <Chip label={job.type || 'Full-time'} size="small" sx={{ bgcolor: 'rgba(192,12,12,0.08)', color: '#C00C0C', fontSize: '0.7rem' }} />
                                    <Chip label={`${job.distance || '< 1'} km`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>

            {/* Nearby Shops */}
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StoreIcon sx={{ color: '#C00C0C', fontSize: 20 }} /> Nearby Shops
                    </Typography>
                    <Button size="small" sx={{ color: '#C00C0C', fontFamily: '"Outfit", sans-serif', textTransform: 'none' }}>
                        See all
                    </Button>
                </Box>
                {loading ? (
                    [1, 2].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 1, borderRadius: 3 }} />)
                ) : shops.length === 0 ? (
                    <EmptyState icon={<StoreIcon />} text="No nearby shops found yet" />
                ) : (
                    shops.map((shop, i) => (
                        <Card key={i} sx={{ mb: 1.5, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                    {shop.shopName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">{shop.category}</Typography>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>
        </Box>
    );
}

function EmptyState({ icon, text }) {
    return (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Box sx={{ fontSize: 40, mb: 1, opacity: 0.3 }}>{icon}</Box>
            <Typography variant="body2">{text}</Typography>
        </Box>
    );
}

export default Home;
