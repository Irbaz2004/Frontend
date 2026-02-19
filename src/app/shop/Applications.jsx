import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Chip, Button, Skeleton, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import gsap from 'gsap';

function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulating data fetch
        setTimeout(() => {
            setApplications([
                { id: 1, applicantName: 'Rahul Kumar', jobTitle: 'Sales Associate', status: 'pending' },
                { id: 2, applicantName: 'Sonia Sharma', jobTitle: 'Store Manager', status: 'pending' }
            ]);
            setLoading(false);

            // GSAP Animations
            setTimeout(() => {
                gsap.from(".app-animate", {
                    y: 20,
                    opacity: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power2.out"
                });
            }, 100);
        }, 1200);
    }, []);

    if (loading) return (
        <Box sx={{ p: 3, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            <Skeleton variant="text" width={180} height={40} sx={{ mb: 3 }} />
            {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rounded" height={140} sx={{ mb: 2, borderRadius: '24px' }} />
            ))}
        </Box>
    );

    return (
        <Box sx={{ p: 3, pb: 4, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            <Typography variant="h5" className="app-animate" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, mb: 3, color: '#1a1a1a' }}>
                Applications Received
            </Typography>

            {applications.length === 0 ? (
                <Box className="app-animate" sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: '32px', border: '1px solid rgba(0,0,0,0.03)' }}>
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
                        <Card key={i} className="app-animate" sx={{
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
                                        {app.applicantName?.[0]}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, color: '#1a1a1a', lineHeight: 1.2 }}>
                                            {app.applicantName}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666', fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>
                                            Applied for: <span style={{ fontWeight: 700, color: '#C00C0C' }}>{app.jobTitle}</span>
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={app.status || 'pending'}
                                        size="small"
                                        sx={{
                                            bgcolor: '#FFF8E1', color: '#FF8F00',
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
