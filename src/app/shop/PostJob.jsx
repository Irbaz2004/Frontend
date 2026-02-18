import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, MenuItem, Grid,
    Alert, CircularProgress, Chip, InputAdornment,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
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
        <Box sx={{ p: 2, pb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, pt: 1 }}>
                Post a Job
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Job posted successfully! Redirecting...</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField fullWidth name="title" label="Job Title *" value={form.title}
                            onChange={handleChange} placeholder="e.g. Cashier, Delivery Boy, Cook"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth select name="type" label="Job Type" value={form.type} onChange={handleChange}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                            {JOB_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth name="salary" label="Salary (optional)" value={form.salary}
                            onChange={handleChange} placeholder="e.g. 8000-12000"
                            InputProps={{ startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth name="openings" label="Number of Openings" type="number"
                            value={form.openings} onChange={handleChange} inputProps={{ min: 1 }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth multiline rows={4} name="description" label="Job Description *"
                            value={form.description} onChange={handleChange}
                            placeholder="Describe the role, responsibilities, and what you're looking for..."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth multiline rows={2} name="requirements" label="Requirements (optional)"
                            value={form.requirements} onChange={handleChange}
                            placeholder="e.g. 2+ years experience, 10th pass, etc."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            type="submit" fullWidth variant="contained" disabled={loading}
                            sx={{
                                py: 1.5, borderRadius: 3,
                                background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
                                fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1rem', textTransform: 'none',
                                '&:hover': { background: 'linear-gradient(135deg, #A00A0A 0%, #700707 100%)', transform: 'translateY(-2px)' },
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Post Job'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default PostJob;
