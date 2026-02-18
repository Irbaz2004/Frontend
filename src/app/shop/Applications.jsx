import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Chip, Button, Skeleton } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: fetch from services/jobs.js → getShopApplications()
        setTimeout(() => { setApplications([]); setLoading(false); }, 800);
    }, []);

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, pt: 1 }}>
                Applications
            </Typography>

            {loading ? (
                [1, 2].map(i => <Skeleton key={i} variant="rounded" height={120} sx={{ mb: 1.5, borderRadius: 3 }} />)
            ) : applications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <PeopleIcon sx={{ fontSize: 50, opacity: 0.2, mb: 1 }} />
                    <Typography>No applications yet</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>Post jobs to start receiving applications</Typography>
                </Box>
            ) : (
                applications.map((app, i) => (
                    <Card key={i} sx={{ mb: 1.5, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: '#C00C0C', width: 44, height: 44, fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                    {app.applicantName?.[0]}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                        {app.applicantName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Applied for: {app.jobTitle}</Typography>
                                </Box>
                                <Chip label={app.status || 'pending'} size="small"
                                    sx={{ bgcolor: 'rgba(255,152,0,0.1)', color: '#ff9800', textTransform: 'capitalize' }} />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" variant="contained" startIcon={<CheckIcon />}
                                    sx={{ borderRadius: 2, background: '#388e3c', textTransform: 'none', fontFamily: '"Outfit", sans-serif', flex: 1 }}>
                                    Accept
                                </Button>
                                <Button size="small" variant="outlined" startIcon={<CloseIcon />}
                                    sx={{ borderRadius: 2, borderColor: '#C00C0C', color: '#C00C0C', textTransform: 'none', fontFamily: '"Outfit", sans-serif', flex: 1 }}>
                                    Reject
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
}

export default Applications;
