import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Skeleton } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedIcon from '@mui/icons-material/Verified';

function AdminDashboard() {
    const [stats, setStats] = useState({ users: 0, shops: 0, jobs: 0, pendingVerification: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: fetch real stats from admin services
        setTimeout(() => {
            setStats({ users: 0, shops: 0, jobs: 0, pendingVerification: 0 });
            setLoading(false);
        }, 800);
    }, []);

    const statCards = [
        { label: 'Total Users', value: stats.users, icon: <PeopleIcon />, color: '#1976d2' },
        { label: 'Total Shops', value: stats.shops, icon: <StoreIcon />, color: '#388e3c' },
        { label: 'Total Jobs', value: stats.jobs, icon: <WorkIcon />, color: '#C00C0C' },
        { label: 'Pending Verify', value: stats.pendingVerification, icon: <VerifiedIcon />, color: '#f57c00' },
    ];

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Box sx={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1515 100%)',
                borderRadius: 4, p: 3, mb: 3,
            }}>
                <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#fff' }}>
                    Admin Dashboard
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                    NearZO Platform Overview
                </Typography>
            </Box>

            <Grid container spacing={1.5}>
                {statCards.map((stat) => (
                    <Grid item xs={6} key={stat.label}>
                        {loading ? (
                            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
                        ) : (
                            <Card sx={{ borderRadius: 3, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <CardContent sx={{ py: 2.5 }}>
                                    <Box sx={{ color: stat.color, mb: 0.5 }}>{stat.icon}</Box>
                                    <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                </CardContent>
                            </Card>
                        )}
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default AdminDashboard;
