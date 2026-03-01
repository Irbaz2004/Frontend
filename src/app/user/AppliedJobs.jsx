import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Skeleton, Stack } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { getMyApplications } from '../../services/jobs';

function AppliedJobs() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyApplications = async () => {
            try {
                setLoading(true);
                const data = await getMyApplications();
                setApplications(data || []);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch my applications:', err);
                setError('Failed to load your applications.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyApplications();
    }, []);

    if (loading) return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, pt: 1 }}>
                Applied Jobs
            </Typography>
            {[1, 2].map(i => <Skeleton key={i} variant="rounded" height={100} sx={{ mb: 1.5, borderRadius: 3 }} />)
            }
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 2, pb: 4, textAlign: 'center' }}>
            <Typography color="error" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>{error}</Typography>
        </Box>
    );

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, pt: 1 }}>
                Applied Jobs
            </Typography>

            {applications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <WorkIcon sx={{ fontSize: 50, opacity: 0.2, mb: 1 }} />
                    <Typography>No applications yet</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>Start applying to jobs near you!</Typography>
                </Box>
            ) : (
                <Stack spacing={1.5}>
                    {applications.map((app, i) => (
                        <Card key={app.id || i} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                            {app.jobs?.title || 'Job Listing'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">{app.jobs?.shop_name || 'Shop Name'}</Typography>
                                    </Box>
                                    <Chip
                                        icon={app.status === 'accepted' ? <CheckCircleIcon /> : <PendingIcon />}
                                        label={app.status || 'pending'}
                                        size="small"
                                        sx={{
                                            bgcolor: app.status === 'accepted' ? 'rgba(76,175,80,0.1)' : app.status === 'rejected' ? 'rgba(244,67,54,0.1)' : 'rgba(255,152,0,0.1)',
                                            color: app.status === 'accepted' ? '#4caf50' : app.status === 'rejected' ? '#f44336' : '#ff9800',
                                            textTransform: 'capitalize',
                                            fontWeight: 700
                                        }}
                                    />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontWeight: 500 }}>
                                    Applied on {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
        </Box>
    );
}

export default AppliedJobs;
