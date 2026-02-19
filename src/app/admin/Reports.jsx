import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';

import { getAdminStats } from '../../services/admin';

function Reports() {
    const [stats, setStats] = useState({ users: 0, shops: 0, jobs: 0, pendingVerification: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch reports stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const metrics = [
        { label: 'Total Users', value: stats.users, icon: <PeopleIcon />, color: '#1976d2' },
        { label: 'Total Jobs', value: stats.jobs, icon: <WorkIcon />, color: '#C00C0C' },
        { label: 'Pending Shops', value: stats.pendingVerification, icon: <TrendingUpIcon />, color: '#388e3c' },
        { label: 'Active Shops', value: stats.shops, icon: <AssessmentIcon />, color: '#f57c00' },
    ];

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, pt: 1 }}>
                Reports & Analytics
            </Typography>

            <Grid container spacing={1.5}>
                {metrics.map((m) => (
                    <Grid item xs={6} key={m.label}>
                        <Card sx={{ borderRadius: 3, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ py: 2.5 }}>
                                <Box sx={{ color: m.color, mb: 0.5 }}>{m.icon}</Box>
                                <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                    {m.value}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">{m.label}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 3, p: 3, borderRadius: 3, bgcolor: 'rgba(192,12,12,0.04)', border: '1px dashed rgba(192,12,12,0.2)', textAlign: 'center' }}>
                <AssessmentIcon sx={{ color: '#C00C0C', fontSize: 40, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                    Detailed analytics charts will be available once data starts flowing in.
                </Typography>
            </Box>
        </Box>
    );
}

export default Reports;
