import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, MenuItem, Grid,
    Alert, CircularProgress, InputAdornment, Card, CardContent,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { postJob } from '../../services/jobs';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Daily Wage'];

function PostJob() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '', description: '', type: 'Full-time',
        salary: '', requirements: '', openings: 1,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // GSAP Animations on mount
        gsap.from(".post-animate", {
            y: 30,
            opacity: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out"
        });
    }, []);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description) {
            setError('Title and description are required.');
            return;
        }
        setLoading(true);
        try {
            const shop = JSON.parse(localStorage.getItem('nearzo_user') || '{}');
            await postJob({ ...form, shopId: shop.id, shopName: shop.shopName });
            setSuccess(true);
            setTimeout(() => navigate('/app/shop/my-jobs'), 1500);
        } catch (err) {
            setError(err.message || 'Failed to post job.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, pb: 6, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            <Typography variant="h5" className="post-animate" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, mb: 3, color: '#1a1a1a' }}>
                Post a New Job
            </Typography>

            {error && <Alert severity="error" className="post-animate" sx={{ mb: 3, borderRadius: '16px', fontFamily: '"Inter", sans-serif' }}>{error}</Alert>}
            {success && <Alert severity="success" className="post-animate" sx={{ mb: 3, borderRadius: '16px', fontFamily: '"Inter", sans-serif' }}>Job posted successfully! Redirecting...</Alert>}

            <Card className="post-animate" sx={{
                borderRadius: '32px',
                border: '1px solid rgba(0,0,0,0.03)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                bgcolor: 'white'
            }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, mb: 1, color: '#666' }}>Role Title</Typography>
                                <TextField
                                    fullWidth name="title" value={form.title}
                                    onChange={handleChange} placeholder="e.g. Sales Associate, Cashier"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: '#F9F9F9', border: 'none' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, mb: 1, color: '#666' }}>Job Type</Typography>
                                <TextField fullWidth select name="type" value={form.type} onChange={handleChange}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: '#F9F9F9' } }}>
                                    {JOB_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, mb: 1, color: '#666' }}>Salary (optional)</Typography>
                                <TextField
                                    fullWidth name="salary" value={form.salary}
                                    onChange={handleChange} placeholder="e.g. 15,000 - 20,000"
                                    InputProps={{ startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon sx={{ fontSize: 18, color: '#C00C0C' }} /></InputAdornment> }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: '#F9F9F9' } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, mb: 1, color: '#666' }}>Description</Typography>
                                <TextField
                                    fullWidth multiline rows={4} name="description"
                                    value={form.description} onChange={handleChange}
                                    placeholder="Briefly describe the responsibilities and daily tasks..."
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: '#F9F9F9' } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit" fullWidth variant="contained" disabled={loading}
                                    sx={{
                                        py: 2, mt: 1, borderRadius: '18px',
                                        background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
                                        fontFamily: '"Outfit", sans-serif', fontWeight: 800, fontSize: '1.05rem', textTransform: 'none',
                                        boxShadow: '0 10px 25px rgba(192,12,12,0.2)',
                                        '&:hover': { background: 'linear-gradient(135deg, #A00A0A 0%, #700707 100%)', transform: 'translateY(-2px)' },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Publish Job Listing'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default PostJob;
