import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Skeleton, Button } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [stats, setStats] = useState({ jobs: 0, applications: 0, views: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('nearzo_user');
        if (stored) setShop(JSON.parse(stored));
        // TODO: fetch real stats from services
        setTimeout(() => {
            setStats({ jobs: 0, applications: 0, views: 0 });
            setLoading(false);
        }, 800);
    }, []);

    const statCards = [
        { label: 'Active Jobs', value: stats.jobs, icon: <WorkIcon />, color: '#C00C0C' },
        { label: 'Applications', value: stats.applications, icon: <PeopleIcon />, color: '#1976d2' },
        { label: 'Profile Views', value: stats.views, icon: <TrendingUpIcon />, color: '#388e3c' },
    ];

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            {/* Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
                borderRadius: 4, p: 3, mb: 3,
            }}>
                <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#fff' }}>
                    {shop?.shopName || 'My Shop'}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                    {shop?.shopCategory || ''} • {shop?.city || ''}
                </Typography>
                {!shop?.isVerified && (
                    <Chip label="Pending Verification" size="small" sx={{ mt: 1, bgcolor: 'rgba(255,152,0,0.2)', color: '#ffb74d', fontFamily: '"Outfit", sans-serif' }} />
                )}
            </Box>

            {/* Stats */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
                {statCards.map((stat) => (
                    <Grid item xs={4} key={stat.label}>
                        {loading ? (
                            <Skeleton variant="rounded" height={90} sx={{ borderRadius: 3 }} />
                        ) : (
                            <Card sx={{ borderRadius: 3, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ color: stat.color, mb: 0.5 }}>{stat.icon}</Box>
                                    <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                </CardContent>
                            </Card>
                        )}
                    </Grid>
                ))}
            </Grid>

            {/* Quick Actions */}
            <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 1.5 }}>
                Quick Actions
            </Typography>
            <Grid container spacing={1.5}>
                {[
                    { label: 'Post a Job', icon: <AddBoxIcon />, path: '/app/shop/post-job' },
                    { label: 'View Applications', icon: <PeopleIcon />, path: '/app/shop/applications' },
                    { label: 'My Jobs', icon: <WorkIcon />, path: '/app/shop/my-jobs' },
                ].map(action => (
                    <Grid item xs={12} key={action.label}>
                        <Button
                            fullWidth variant="outlined"
                            startIcon={action.icon}
                            onClick={() => navigate(action.path)}
                            sx={{
                                borderRadius: 3, py: 1.5, borderColor: 'rgba(192,12,12,0.3)', color: '#C00C0C',
                                fontFamily: '"Outfit", sans-serif', fontWeight: 600, textTransform: 'none',
                                justifyContent: 'flex-start', px: 2,
                                '&:hover': { bgcolor: 'rgba(192,12,12,0.05)', borderColor: '#C00C0C' },
                            }}
                        >
                            {action.label}
                        </Button>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Dashboard;
