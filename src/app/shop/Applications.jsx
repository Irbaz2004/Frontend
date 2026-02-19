import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Chip, Button, Skeleton, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { getShopApplications } from '../../services/jobs';

function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                const data = await getShopApplications();
                setApplications(data || []);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch applications:', err);
                setError('Failed to load applications. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (loading) return (
        <Box sx={{ p: 3, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            <Skeleton variant="text" width={180} height={40} sx={{ mb: 3 }} />
            {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rounded" height={140} sx={{ mb: 2, borderRadius: '24px' }} />
            ))}
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 3, bgcolor: '#F8F8F8', minHeight: '100vh', textAlign: 'center' }}>
            <Typography color="error" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>{error}</Typography>
        </Box>
    );

    return (
        <Box sx={{ p: 3, pb: 4, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, mb: 3, color: '#1a1a1a' }}>
                Applications Received
            </Typography>

            {applications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: '32px', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <Box sx={{
                        width: 80, height: 80, borderRadius: '50%', bgcolor: '#F8F8F8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2
                    }}>
                        <PeopleIcon sx={{ fontSize: 40, color: '#ccc' }} />
                    </Box>
                    <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#666' }}>No applications yet</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: '#999', fontFamily: '"Inter", sans-serif' }}>Post jobs to start receiving applications</Typography>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {applications.map((app, i) => (
                        <Card key={app.id || i} sx={{
                            borderRadius: '24px',
                            border: '1px solid rgba(0,0,0,0.03)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                                    <Avatar sx={{
                                        bgcolor: 'rgba(192,12,12,0.1)', color: '#C00C0C',
                                        width: 56, height: 56,
                                        fontFamily: '"Outfit", sans-serif', fontWeight: 900,
                                        fontSize: '1.2rem',
                                        boxShadow: '0 4px 10px rgba(192,12,12,0.1)'
                                    }}>
                                        {app.users?.full_name?.[0] || 'A'}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, color: '#1a1a1a', lineHeight: 1.2 }}>
                                            {app.users?.full_name || 'Generic Applicant'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666', fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>
                                            Applied for: <span style={{ fontWeight: 700, color: '#C00C0C' }}>{app.jobs?.title || 'Job Listing'}</span>
                                        </Typography>
                                        {app.users?.phone && (
                                            <Typography variant="caption" sx={{ color: '#888' }}>
                                                Contact: {app.users.phone}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Chip
                                        label={app.status || 'pending'}
                                        size="small"
                                        sx={{
                                            bgcolor: app.status === 'accepted' ? '#E8F5E9' : app.status === 'rejected' ? '#FFEBEE' : '#FFF8E1',
                                            color: app.status === 'accepted' ? '#2E7D32' : app.status === 'rejected' ? '#C62828' : '#FF8F00',
                                            fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem',
                                            borderRadius: '8px', px: 0.5
                                        }}
                                    />
                                </Box>
                                <Stack direction="row" spacing={1.5}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<CheckIcon />}
                                        sx={{
                                            borderRadius: '14px', py: 1.5,
                                            bgcolor: '#1a1a1a', color: 'white',
                                            textTransform: 'none', fontFamily: '"Outfit", sans-serif', fontWeight: 800,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            '&:hover': { bgcolor: '#333' }
                                        }}
                                    >
                                        Shortlist
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<CloseIcon />}
                                        sx={{
                                            borderRadius: '14px', py: 1.5,
                                            borderColor: 'rgba(192,12,12,0.2)', color: '#C00C0C',
                                            textTransform: 'none', fontFamily: '"Outfit", sans-serif', fontWeight: 800,
                                            '&:hover': { bgcolor: '#FFF5F5', borderColor: '#C00C0C' }
                                        }}
                                    >
                                        Reject
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
        </Box>
    );
}

export default Applications;
