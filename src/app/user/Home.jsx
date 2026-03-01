import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Avatar, Skeleton, Button, Grid } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import StoreIcon from '@mui/icons-material/Store';
import { getNearbyJobs } from '../../services/jobs';
import { getNearbyShops } from '../../services/shops';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
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

    if (loading) return (
        <Box sx={{ p: 3, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Box>
                    <Skeleton variant="text" width={140} height={32} />
                    <Skeleton variant="text" width={100} height={20} />
                </Box>
                <Skeleton variant="circular" width={48} height={48} />
            </Box>
            <Skeleton variant="rounded" height={120} sx={{ mb: 4, borderRadius: '24px' }} />
            <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: '20px' }} />
            <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: '20px' }} />
        </Box>
    );

    return (
        <Box sx={{ p: 3, pb: 4, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            {/* Header / Welcome Section */}
            <Box sx={{ mb: 4, pt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography
                            variant="h5"
                            sx={{
                                fontFamily: '"Outfit", sans-serif',
                                fontWeight: 900,
                                color: '#1a1a1a',
                                letterSpacing: '-0.5px'
                            }}
                        >
                            Hello, {user?.fullName?.split(' ')[0] || 'there'} 👋
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 16, color: '#C00C0C' }} />
                            <Typography
                                variant="caption"
                                sx={{
                                    fontFamily: '"Inter", sans-serif',
                                    fontWeight: 600,
                                    color: '#777'
                                }}
                            >
                                {user?.city || 'Detecting location...'}
                            </Typography>
                        </Box>
                    </Box>
                    <Avatar
                        sx={{
                            bgcolor: 'white',
                            color: '#C00C0C',
                            width: 48,
                            height: 48,
                            fontFamily: '"Outfit", sans-serif',
                            fontWeight: 800,
                            border: '1px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                    >
                        {user?.fullName?.[0] || 'U'}
                    </Avatar>
                </Box>
            </Box>

            {/* Promo Card */}
            <Box
                sx={{
                    mb: 4,
                    p: 3,
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
                    color: 'white',
                    boxShadow: '0 12px 24px rgba(192,12,12,0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, mb: 0.5, fontSize: '1.25rem' }}>
                    Find Local Services
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', opacity: 0.9, fontSize: '0.85rem', maxWidth: '80%' }}>
                    Discover top-rated shops and job openings in your area.
                </Typography>
            </Box>

            {/* Nearby Jobs Section */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: '"Outfit", sans-serif',
                                fontWeight: 800,
                                color: '#1a1a1a'
                            }}
                        >
                            Nearby Jobs
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                            Hiring in {user?.city || 'your area'}
                        </Typography>
                    </Box>
                    <Button
                        size="small"
                        onClick={() => navigate('/app/user/jobs')}
                        sx={{
                            color: '#C00C0C',
                            fontFamily: '"Outfit", sans-serif',
                            fontWeight: 800,
                            textTransform: 'none'
                        }}
                    >
                        View All
                    </Button>
                </Box>

                {jobs.length === 0 ? (
                    <EmptyState icon={<WorkIcon />} text="No jobs found in your area" />
                ) : (
                    jobs.map((job, i) => (
                        <Card
                            key={i}
                            onClick={() => navigate(`/app/user/shops/${job.shopId}`)}
                            sx={{
                                mb: 2,
                                borderRadius: '20px',
                                border: '1px solid rgba(0,0,0,0.03)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': { transform: 'translateX(4px)', borderColor: 'rgba(192,12,12,0.1)' }
                            }}
                        >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#1a1a1a', lineHeight: 1.2 }}>
                                            {job.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', color: '#666', mt: 0.5, fontSize: '0.85rem' }}>
                                            {job.shop_name}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`${job.distance || '< 1'} km`}
                                        size="small"
                                        sx={{
                                            bgcolor: '#FBFAFA',
                                            color: '#555',
                                            fontWeight: 700,
                                            fontSize: '0.65rem',
                                            border: '1px solid rgba(0,0,0,0.05)'
                                        }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                    <Chip label={job.type || 'Full-time'} size="small" sx={{ bgcolor: 'rgba(192,12,12,0.06)', color: '#C00C0C', fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px' }} />
                                    <Chip label={job.salary || 'Competitive'} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.03)', color: '#444', fontWeight: 600, fontSize: '0.7rem', borderRadius: '8px' }} />
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>

            {/* Nearby Shops Section */}
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: '"Outfit", sans-serif',
                                fontWeight: 800,
                                color: '#1a1a1a'
                            }}
                        >
                            Premium Shops
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                            Hiring or selling nearby
                        </Typography>
                    </Box>
                    <Button
                        size="small"
                        onClick={() => navigate('/app/user/shops')}
                        sx={{
                            color: '#C00C0C',
                            fontFamily: '"Outfit", sans-serif',
                            fontWeight: 800,
                            textTransform: 'none'
                        }}
                    >
                        View All
                    </Button>
                </Box>

                {shops.length === 0 ? (
                    <EmptyState icon={<StoreIcon />} text="No shops found nearby" />
                ) : (
                    <Grid container spacing={2}>
                        {shops.map((shop, i) => (
                            <Grid item xs={6} key={i}>
                                <Card
                                    onClick={() => navigate(`/app/user/shops/${shop.id}`)}
                                    sx={{
                                        borderRadius: '20px',
                                        border: '1px solid rgba(0,0,0,0.03)',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(192,12,12,0.1)' }
                                    }}
                                >
                                    <CardContent sx={{ p: 2 }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: 'rgba(192,12,12,0.05)',
                                                color: '#C00C0C',
                                                mx: 'auto',
                                                mb: 1.5,
                                                width: 44,
                                                height: 44
                                            }}
                                        >
                                            <StoreIcon />
                                        </Avatar>
                                        <Typography variant="subtitle2" noWrap sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#1a1a1a' }}>
                                            {shop.shop_name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontFamily: '"Inter", sans-serif', color: '#888', fontWeight: 500 }}>
                                            {shop.category}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
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
