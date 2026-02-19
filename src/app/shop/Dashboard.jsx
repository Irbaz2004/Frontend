import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Skeleton, Button } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { getShopJobs, getShopApplications } from '../../services/jobs';

function Dashboard() {
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [stats, setStats] = useState({ jobs: 0, applications: 0, views: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('nearzo_user');
        if (stored) setShop(JSON.parse(stored));

        const fetchStats = async () => {
            try {
                setLoading(true);
                const [jobs, applications] = await Promise.all([
                    getShopJobs(),
                    getShopApplications()
                ]);

                setStats({
                    jobs: jobs?.length || 0,
                    applications: applications?.length || 0,
                    views: 0 // Profile views logic can be added later if tracked
                });
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                const ctx = gsap.context(() => {
                    gsap.from(".dash-animate", {
                        y: 30,
                        opacity: 0,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: "power2.out"
                    });
                });
                return () => ctx.revert();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    const statCards = [
        { label: 'Active Jobs', value: stats.jobs, icon: <WorkIcon />, color: '#C00C0C' },
        { label: 'Applications', value: stats.applications, icon: <PeopleIcon />, color: '#1976d2' },
        { label: 'Profile Views', value: stats.views, icon: <TrendingUpIcon />, color: '#388e3c' },
    ];

    if (loading) return (
        <Box sx={{ p: 3, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            <Skeleton variant="rounded" height={160} sx={{ mb: 4, borderRadius: '24px' }} />
            <Skeleton variant="text" width={160} height={32} sx={{ mb: 2 }} />
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[1, 2, 3].map(i => (
                    <Grid item xs={4} key={i}>
                        <Skeleton variant="rounded" height={100} sx={{ borderRadius: '20px' }} />
                    </Grid>
                ))}
            </Grid>
            <Skeleton variant="text" width={140} height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={80} sx={{ mb: 2, borderRadius: '18px' }} />
            <Skeleton variant="rounded" height={80} sx={{ mb: 2, borderRadius: '18px' }} />
        </Box>
    );

    return (
        <Box sx={{ p: 3, pb: 4, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            {/* Header / Shop Info */}
            <Box className="dash-animate" sx={{
                background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
                borderRadius: '24px',
                p: 3,
                mb: 4,
                boxShadow: '0 12px 24px rgba(192,12,12,0.15)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                }} />

                <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, color: '#fff', mb: 0.5 }}>
                    {shop?.shopName || 'My Shop'}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>
                    {shop?.shopCategory || 'Category'} • {shop?.city || 'Location'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    {!shop?.isVerified ? (
                        <Chip
                            label="Pending Verification"
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.15)',
                                color: '#fff',
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        />
                    ) : (
                        <Chip
                            label="Verified Shop"
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.7rem'
                            }}
                        />
                    )}
                </Box>
            </Box>

            {/* Stats Overview */}
            <Typography className="dash-animate" variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#1a1a1a', mb: 2 }}>
                Shop Performance
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {statCards.map((stat) => (
                    <Grid item xs={4} key={stat.label} className="dash-animate">
                        <Card sx={{
                            borderRadius: '20px',
                            textAlign: 'center',
                            border: '1px solid rgba(0,0,0,0.03)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                            bgcolor: 'white'
                        }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ color: stat.color, mb: 1, display: 'flex', justifyContent: 'center' }}>
                                    {React.cloneElement(stat.icon, { sx: { fontSize: 24 } })}
                                </Box>
                                <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, color: '#1a1a1a' }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="caption" sx={{ fontFamily: '"Inter", sans-serif', color: '#888', fontWeight: 600 }}>
                                    {stat.label}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Quick Actions */}
            <Typography className="dash-animate" variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#1a1a1a', mb: 2 }}>
                Management
            </Typography>
            <Grid container spacing={2}>
                {[
                    { label: 'Post a New Job', icon: <AddBoxIcon />, path: '/app/shop/post-job', desc: 'Hire local talent' },
                    { label: 'Applications', icon: <PeopleIcon />, path: '/app/shop/applications', desc: 'View seeker profiles' },
                    { label: 'Active Listings', icon: <WorkIcon />, path: '/app/shop/my-jobs', desc: 'Manage your jobs' },
                ].map(action => (
                    <Grid item xs={12} key={action.label} className="dash-animate">
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => navigate(action.path)}
                            sx={{
                                borderRadius: '18px',
                                p: 2,
                                borderColor: 'rgba(0,0,0,0.06)',
                                bgcolor: 'white',
                                color: '#1a1a1a',
                                fontFamily: '"Outfit", sans-serif',
                                fontWeight: 800,
                                textTransform: 'none',
                                justifyContent: 'flex-start',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: '#FBFAFA',
                                    borderColor: 'rgba(192,12,12,0.2)',
                                    transform: 'translateX(4px)'
                                },
                            }}
                        >
                            <Box sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '12px',
                                bgcolor: 'rgba(192,12,12,0.05)',
                                color: '#C00C0C',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2
                            }}>
                                {action.icon}
                            </Box>
                            <Box sx={{ textAlign: 'left' }}>
                                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>{action.label}</Typography>
                                <Typography variant="caption" sx={{ color: '#888', fontWeight: 500 }}>{action.desc}</Typography>
                            </Box>
                            <Box sx={{ ml: 'auto', color: '#ccc' }}>→</Box>
                        </Button>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Dashboard;
