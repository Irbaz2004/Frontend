import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Skeleton, Divider } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

function AppliedJobs() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: fetch from services/jobs.js → getMyApplications()
        setTimeout(() => {
            setApplications([]);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, pt: 1 }}>
                Applied Jobs
            </Typography>

            {loading ? (
                [1, 2].map(i => <Skeleton key={i} variant="rounded" height={100} sx={{ mb: 1.5, borderRadius: 3 }} />)
            ) : applications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <WorkIcon sx={{ fontSize: 50, opacity: 0.2, mb: 1 }} />
                    <Typography>No applications yet</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>Start applying to jobs near you!</Typography>
                </Box>
            ) : (
                applications.map((app, i) => (
                    <Card key={i} sx={{ mb: 1.5, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                        {app.jobTitle}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">{app.shopName}</Typography>
                                </Box>
                                <Chip
                                    icon={app.status === 'accepted' ? <CheckCircleIcon /> : <PendingIcon />}
                                    label={app.status}
                                    size="small"
                                    sx={{
                                        bgcolor: app.status === 'accepted' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                                        color: app.status === 'accepted' ? '#4caf50' : '#ff9800',
                                        textTransform: 'capitalize',
                                    }}
                                />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                Applied on {new Date(app.appliedAt).toLocaleDateString()}
                            </Typography>
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
}

export default AppliedJobs;
