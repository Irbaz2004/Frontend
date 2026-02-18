import React, { useEffect, useState } from 'react';
import {
    Box, Typography, TextField, InputAdornment, Card, CardContent,
    Chip, Button, Skeleton, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { getNearbyJobs, applyJob } from '../../services/jobs';

function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [applying, setApplying] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getNearbyJobs(null, null);
                setJobs(data || []);
            } catch {
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = jobs.filter(j => {
        const matchSearch = j.title?.toLowerCase().includes(search.toLowerCase()) ||
            j.shopName?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || j.type === filter;
        return matchSearch && matchFilter;
    });

    const handleApply = async (jobId) => {
        setApplying(jobId);
        try {
            const user = JSON.parse(localStorage.getItem('nearzo_user') || '{}');
            await applyJob(jobId, user.id);
        } catch (e) {
            console.error(e);
        } finally {
            setApplying(null);
        }
    };

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, pt: 1 }}>
                Find Jobs
            </Typography>

            {/* Search & Filter */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                    fullWidth placeholder="Search jobs or shops..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#C00C0C' }} /></InputAdornment> }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    size="small"
                />
                <FormControl size="small" sx={{ minWidth: 110 }}>
                    <Select value={filter} onChange={e => setFilter(e.target.value)} sx={{ borderRadius: 3 }}>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="Full-time">Full-time</MenuItem>
                        <MenuItem value="Part-time">Part-time</MenuItem>
                        <MenuItem value="Contract">Contract</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Job Cards */}
            {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={130} sx={{ mb: 1.5, borderRadius: 3 }} />)
            ) : filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <WorkIcon sx={{ fontSize: 50, opacity: 0.2, mb: 1 }} />
                    <Typography>No jobs found</Typography>
                </Box>
            ) : (
                filtered.map((job, i) => (
                    <Card key={i} sx={{ mb: 1.5, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                        {job.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        {job.shopName}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip label={job.type || 'Full-time'} size="small" sx={{ bgcolor: 'rgba(192,12,12,0.08)', color: '#C00C0C', fontSize: '0.7rem' }} />
                                        {job.salary && <Chip label={`₹${job.salary}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />}
                                        <Chip icon={<LocationOnIcon sx={{ fontSize: '12px !important' }} />} label={`${job.distance || '< 1'} km`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                    </Box>
                                </Box>
                                <Button
                                    variant="contained" size="small"
                                    disabled={applying === job.id}
                                    onClick={() => handleApply(job.id)}
                                    sx={{
                                        borderRadius: 2, background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
                                        textTransform: 'none', fontFamily: '"Outfit", sans-serif', fontWeight: 600, ml: 1,
                                    }}
                                >
                                    Apply
                                </Button>
                            </Box>
                            {job.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
                                    {job.description.slice(0, 100)}...
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
}

export default Jobs;
