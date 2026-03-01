import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Skeleton } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';

import { getAllAdminJobs } from '../../services/admin';

function AdminJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getAllAdminJobs();
                setJobs(data);
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, pt: 1 }}>
                All Jobs
            </Typography>

            {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={100} sx={{ mb: 1.5, borderRadius: 3 }} />)
            ) : jobs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <WorkIcon sx={{ fontSize: 50, opacity: 0.2, mb: 1 }} />
                    <Typography>No jobs posted yet</Typography>
                </Box>
            ) : (
                jobs.map((job, i) => (
                    <Card key={i} sx={{ mb: 1.5, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                {job.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">{job.shop_name}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip label={job.type} size="small" sx={{ bgcolor: 'rgba(192,12,12,0.08)', color: '#C00C0C', fontSize: '0.7rem' }} />
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
}

export default AdminJobs;
