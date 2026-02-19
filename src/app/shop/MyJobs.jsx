import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Skeleton, Button, IconButton, Stack } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

function MyJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulating data fetch
        setTimeout(() => {
            setJobs([
                { id: 1, title: 'Sales Associate', type: 'Full-time', applicants: 5 },
                { id: 2, title: 'Store Manager', type: 'Full-time', applicants: 7 }
            ]);
            setLoading(false);

            // GSAP Animations
            setTimeout(() => {
                gsap.from(".job-animate", {
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Skeleton variant="text" width={140} height={40} />
                <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: '12px' }} />
            </Box>
            {[1, 2].map(i => (
                <Skeleton key={i} variant="rounded" height={100} sx={{ mb: 2, borderRadius: '24px' }} />
            ))}
        </Box>
    );

    return (
        <Box sx={{ p: 3, pb: 4, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" className="job-animate" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, color: '#1a1a1a' }}>
                    Active Listings
                </Typography>
                <Button
                    className="job-animate"
                    variant="contained"
                    size="small"
                    onClick={() => navigate('/app/shop/post-job')}
                    sx={{
                        borderRadius: '12px', px: 2, py: 1,
                        background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
                        textTransform: 'none', fontFamily: '"Outfit", sans-serif', fontWeight: 800,
                        boxShadow: '0 8px 20px rgba(192,12,12,0.2)'
                    }}
                >
                    + Post Job
                </Button>
            </Box>

            {jobs.length === 0 ? (
                <Box className="job-animate" sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: '32px', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <Box sx={{
                        width: 80, height: 80, borderRadius: '50%', bgcolor: '#F8F8F8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2
                    }}>
                        <WorkIcon sx={{ fontSize: 40, color: '#ccc' }} />
                    </Box>
                    <Typography sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#666' }}>No jobs posted yet</Typography>
                    <Button
                        onClick={() => navigate('/app/shop/post-job')}
                        sx={{ mt: 1, color: '#C00C0C', textTransform: 'none', fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}
                    >
                        Post your first job now →
                    </Button>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {jobs.map((job, i) => (
                        <Card key={i} className="job-animate" sx={{
                            borderRadius: '24px',
                            border: '1px solid rgba(0,0,0,0.03)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateX(6px)', borderColor: 'rgba(192,12,12,0.1)' }
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, color: '#1a1a1a', lineHeight: 1.2 }}>
                                            {job.title}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                                            <Chip
                                                label={job.type}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(192,12,12,0.05)', color: '#C00C0C',
                                                    fontSize: '0.7rem', fontWeight: 800, borderRadius: '8px'
                                                }}
                                            />
                                            <Chip
                                                label={`${job.applicants || 0} applicants`}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    fontSize: '0.7rem', fontWeight: 600, borderRadius: '8px',
                                                    borderColor: 'rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </Stack>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton size="small" sx={{ bgcolor: '#F0F7FF', color: '#1976d2', '&:hover': { bgcolor: '#E1EFFF' } }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" sx={{ bgcolor: '#FFF5F5', color: '#C00C0C', '&:hover': { bgcolor: '#FFE9E9' } }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
        </Box>
    );
}

export default MyJobs;
