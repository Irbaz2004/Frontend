import React, { useState } from 'react';
import {
    Box, Container, Paper, Typography, TextField, Button,
    InputAdornment, IconButton, Alert, CircularProgress, Link,
    Stepper, Step, StepLabel, ToggleButton, ToggleButtonGroup,
    Chip, FormControlLabel, Switch, MenuItem, Grid,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/auth';

const SHOP_CATEGORIES = [
    'Grocery', 'Restaurant', 'Pharmacy', 'Electronics', 'Clothing',
    'Hardware', 'Salon & Beauty', 'Bakery', 'Stationery', 'Other',
];

const steps = ['Choose Role', 'Your Details'];

function Register() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [role, setRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [keyItemInput, setKeyItemInput] = useState('');
    const [gpsLoading, setGpsLoading] = useState(false);

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        age: '',
        shopName: '',
        shopCategory: '',
        shopKeyItems: [],
        street: '',
        area: '',
        city: '',
        state: '',
        password: '',
        confirmPassword: '',
        allowGPS: false,
        latitude: null,
        longitude: null,
    });

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setError('');
    };

    const handleGPSToggle = async (e) => {
        const enabled = e.target.checked;
        setForm(prev => ({ ...prev, allowGPS: enabled }));
        if (enabled) {
            setGpsLoading(true);
            try {
                const pos = await new Promise((res, rej) =>
                    navigator.geolocation.getCurrentPosition(res, rej)
                );
                setForm(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                }));
            } catch {
                setError('Could not get location. Please enable GPS.');
                setForm(prev => ({ ...prev, allowGPS: false }));
            } finally {
                setGpsLoading(false);
            }
        } else {
            setForm(prev => ({ ...prev, latitude: null, longitude: null }));
        }
    };

    const addKeyItem = () => {
        const trimmed = keyItemInput.trim();
        if (trimmed && !form.shopKeyItems.includes(trimmed)) {
            setForm(prev => ({ ...prev, shopKeyItems: [...prev.shopKeyItems, trimmed] }));
        }
        setKeyItemInput('');
    };

    const removeKeyItem = (item) => {
        setForm(prev => ({ ...prev, shopKeyItems: prev.shopKeyItems.filter(i => i !== item) }));
    };

    const handleRoleNext = () => {
        if (!role) { setError('Please select a role.'); return; }
        setError('');
        setActiveStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (role === 'shop' && !form.allowGPS) {
            setError('GPS location is mandatory for shop owners.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            const result = await registerUser(role, form);
            localStorage.setItem('nearzo_role', role);
            localStorage.setItem('nearzo_token', result.token);
            localStorage.setItem('nearzo_user', JSON.stringify(result.user));
            const roleRoutes = {
                user: '/app/user/home',
                shop: '/app/shop/dashboard',
            };
            navigate(roleRoutes[role] || '/app/user/home');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1515 50%, #1a1a1a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                {/* Logo */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography
                        variant="h4"
                        sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#fff' }}
                    >
                        Near<span style={{ color: '#C00C0C' }}>ZO</span>
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
                        Create your account
                    </Typography>
                </Box>

                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel
                                sx={{
                                    '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.5)', fontFamily: '"Outfit", sans-serif' },
                                    '& .MuiStepLabel-label.Mui-active': { color: '#fff' },
                                    '& .MuiStepLabel-label.Mui-completed': { color: '#C00C0C' },
                                    '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.2)' },
                                    '& .MuiStepIcon-root.Mui-active': { color: '#C00C0C' },
                                    '& .MuiStepIcon-root.Mui-completed': { color: '#C00C0C' },
                                }}
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Step 1: Role Selection */}
                    {activeStep === 0 && (
                        <Box>
                            <Typography variant="h6" sx={{ color: '#fff', fontFamily: '"Outfit", sans-serif', mb: 1 }}>
                                Who are you?
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3 }}>
                                Select your role to get started
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                                {[
                                    { value: 'user', label: 'Job Seeker', icon: <PersonIcon sx={{ fontSize: 40 }} />, desc: 'Find jobs & shops near you' },
                                    { value: 'shop', label: 'Shop Owner', icon: <StoreIcon sx={{ fontSize: 40 }} />, desc: 'Post jobs & manage your shop' },
                                ].map((opt) => (
                                    <Box
                                        key={opt.value}
                                        onClick={() => { setRole(opt.value); setError(''); }}
                                        sx={{
                                            flex: 1,
                                            p: 3,
                                            borderRadius: 3,
                                            border: `2px solid ${role === opt.value ? '#C00C0C' : 'rgba(255,255,255,0.1)'}`,
                                            background: role === opt.value ? 'rgba(192,12,12,0.1)' : 'rgba(255,255,255,0.03)',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                border: '2px solid rgba(192,12,12,0.5)',
                                                background: 'rgba(192,12,12,0.05)',
                                            },
                                        }}
                                    >
                                        <Box sx={{ color: role === opt.value ? '#C00C0C' : 'rgba(255,255,255,0.5)', mb: 1 }}>
                                            {opt.icon}
                                        </Box>
                                        <Typography sx={{ color: '#fff', fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 0.5 }}>
                                            {opt.label}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                            {opt.desc}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleRoleNext}
                                sx={primaryBtnStyles}
                            >
                                Continue →
                            </Button>
                        </Box>
                    )}

                    {/* Step 2: Details Form */}
                    {activeStep === 1 && (
                        <Box component="form" onSubmit={handleSubmit}>
                            <Typography variant="h6" sx={{ color: '#fff', fontFamily: '"Outfit", sans-serif', mb: 0.5 }}>
                                {role === 'shop' ? 'Shop Details' : 'Your Details'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2 }}>
                                Fill in your information below
                            </Typography>

                            <Grid container spacing={2}>
                                {/* Common Fields */}
                                <Grid item xs={12}>
                                    <TextField fullWidth name="fullName" label="Full Name" value={form.fullName}
                                        onChange={handleChange} required sx={inputStyles} />
                                </Grid>

                                {/* Shop-specific */}
                                {role === 'shop' && (
                                    <>
                                        <Grid item xs={12}>
                                            <TextField fullWidth name="shopName" label="Shop Name" value={form.shopName}
                                                onChange={handleChange} required sx={inputStyles} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth select name="shopCategory" label="Shop Category"
                                                value={form.shopCategory} onChange={handleChange} required sx={inputStyles}
                                            >
                                                {SHOP_CATEGORIES.map(cat => (
                                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                <TextField
                                                    fullWidth label="Add Key Item (e.g. Rice, Bread)"
                                                    value={keyItemInput}
                                                    onChange={e => setKeyItemInput(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyItem())}
                                                    sx={inputStyles}
                                                />
                                                <Button variant="outlined" onClick={addKeyItem}
                                                    sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', minWidth: 48 }}>
                                                    <AddIcon />
                                                </Button>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {form.shopKeyItems.map(item => (
                                                    <Chip key={item} label={item} onDelete={() => removeKeyItem(item)}
                                                        sx={{ background: 'rgba(192,12,12,0.2)', color: '#fff', '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.5)' } }} />
                                                ))}
                                            </Box>
                                        </Grid>
                                    </>
                                )}

                                {/* User-specific */}
                                {role === 'user' && (
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth name="age" label="Age (optional)" type="number"
                                            value={form.age} onChange={handleChange} sx={inputStyles} />
                                    </Grid>
                                )}

                                <Grid item xs={12} sm={role === 'user' ? 6 : 12}>
                                    <TextField fullWidth name="phone" label="Phone Number" value={form.phone}
                                        onChange={handleChange} required placeholder="+91 98765 43210"
                                        InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#C00C0C' }} /></InputAdornment> }}
                                        sx={inputStyles} />
                                </Grid>

                                {/* Address */}
                                <Grid item xs={12}>
                                    <TextField fullWidth name="street" label="Street / House No." value={form.street}
                                        onChange={handleChange} required sx={inputStyles} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth name="area" label="Area / Locality" value={form.area}
                                        onChange={handleChange} required sx={inputStyles} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth name="city" label="City" value={form.city}
                                        onChange={handleChange} required sx={inputStyles} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth name="state" label="State" value={form.state}
                                        onChange={handleChange} required sx={inputStyles} />
                                </Grid>

                                {/* GPS */}
                                <Grid item xs={12}>
                                    <Box sx={{
                                        p: 2, borderRadius: 2,
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.03)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationOnIcon sx={{ color: '#C00C0C' }} />
                                            <Box>
                                                <Typography sx={{ color: '#fff', fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '0.9rem' }}>
                                                    Allow GPS Location {role === 'shop' && <span style={{ color: '#C00C0C' }}>*</span>}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                                    {form.latitude ? `📍 ${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}` : 'For nearby search accuracy'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Switch
                                            checked={form.allowGPS}
                                            onChange={handleGPSToggle}
                                            disabled={gpsLoading}
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#C00C0C' },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#C00C0C' },
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                {/* Password */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth name="password" label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password} onChange={handleChange} required
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#C00C0C' }} /></InputAdornment>,
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={inputStyles}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth name="confirmPassword" label="Confirm Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.confirmPassword} onChange={handleChange} required
                                        InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#C00C0C' }} /></InputAdornment> }}
                                        sx={inputStyles}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setActiveStep(0)}
                                    sx={{ flex: 1, py: 1.5, borderRadius: 3, borderColor: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: '"Outfit", sans-serif' }}
                                >
                                    ← Back
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{ flex: 2, ...primaryBtnStyles }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                                </Button>
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ textAlign: 'center', mt: 2.5 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Already have an account?{' '}
                            <Link onClick={() => navigate('/app/login')} sx={{ color: '#C00C0C', cursor: 'pointer', fontWeight: 600 }}>
                                Sign In
                            </Link>
                        </Typography>
                    </Box>
                </Paper>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Link onClick={() => navigate('/')} sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem' }}>
                        ← Back to Home
                    </Link>
                </Box>
            </Container>
        </Box>
    );
}

const primaryBtnStyles = {
    py: 1.5,
    borderRadius: 3,
    background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
    fontFamily: '"Outfit", sans-serif',
    fontWeight: 700,
    fontSize: '1rem',
    textTransform: 'none',
    '&:hover': {
        background: 'linear-gradient(135deg, #A00A0A 0%, #700707 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(192,12,12,0.4)',
    },
};

const inputStyles = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        color: '#fff',
        background: 'rgba(255,255,255,0.05)',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
        '&:hover fieldset': { borderColor: 'rgba(192,12,12,0.5)' },
        '&.Mui-focused fieldset': { borderColor: '#C00C0C' },
    },
    '& .MuiInputLabel-root': {
        color: 'rgba(255,255,255,0.5)',
        '&.Mui-focused': { color: '#C00C0C' },
    },
    '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.5)' },
    '& .MuiMenuItem-root': { color: '#1a1a1a' },
};

export default Register;
