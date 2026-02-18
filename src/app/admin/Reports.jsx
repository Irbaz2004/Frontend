import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';

function Reports() {
    const metrics = [
        { label: 'New Users (7d)', value: '—', icon: <PeopleIcon />, color: '#1976d2' },
        { label: 'New Jobs (7d)', value: '—', icon: <WorkIcon />, color: '#C00C0C' },
        { label: 'Applications (7d)', value: '—', icon: <TrendingUpIcon />, color: '#388e3c' },
        { label: 'Active Shops', value: '—', icon: <AssessmentIcon />, color: '#f57c00' },
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
