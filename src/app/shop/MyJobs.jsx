import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Skeleton, Button, IconButton } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

function MyJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: fetch from services/jobs.js → getShopJobs()
        setTimeout(() => { setJobs([]); setLoading(false); }, 800);
    }, []);

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pt: 1 }}>
                <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                    My Jobs
                </Typography>
                <Button variant="contained" size="small" onClick={() => navigate('/app/shop/post-job')}
                    sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)', textTransform: 'none', fontFamily: '"Outfit", sans-serif' }}>
                    + Post Job
                </Button>
            </Box>

            {loading ? (
                [1, 2].map(i => <Skeleton key={i} variant="rounded" height={110} sx={{ mb: 1.5, borderRadius: 3 }} />)
            ) : jobs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <WorkIcon sx={{ fontSize: 50, opacity: 0.2, mb: 1 }} />
                    <Typography>No jobs posted yet</Typography>
                    <Button onClick={() => navigate('/app/shop/post-job')} sx={{ mt: 2, color: '#C00C0C', textTransform: 'none', fontFamily: '"Outfit", sans-serif' }}>
                        Post your first job →
                    </Button>
                </Box>
            ) : (
                jobs.map((job, i) => (
                    <Card key={i} sx={{ mb: 1.5, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                        {job.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                        <Chip label={job.type} size="small" sx={{ bgcolor: 'rgba(192,12,12,0.08)', color: '#C00C0C', fontSize: '0.7rem' }} />
                                        <Chip label={`${job.applicants || 0} applicants`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                    </Box>
                                </Box>
                                <Box>
                                    <IconButton size="small" sx={{ color: '#1976d2' }}><EditIcon fontSize="small" /></IconButton>
                                    <IconButton size="small" sx={{ color: '#C00C0C' }}><DeleteIcon fontSize="small" /></IconButton>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
}

export default MyJobs;
