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
                bgcolor: '#F8F8F8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                py: 6,
            }}
        >
            <Container maxWidth="sm" sx={{ position: 'relative' }}>
                {/* Decorative background element */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -150,
                        left: -150,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(192,12,12,0.04) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        zIndex: 0
                    }}
                />

                {/* Logo & Header */}
                <Box sx={{ textAlign: 'center', mb: 4, position: 'relative', zIndex: 1 }}>
                    <Typography
                        variant="h4"
                        sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1.5px' }}
                    >
                        Near<span style={{ color: '#C00C0C' }}>ZO</span>
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#666',
                            mt: 0.5,
                            fontWeight: 500
                        }}
                    >
                        Create your hyperlocal account
                    </Typography>
                </Box>

                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel
                                sx={{
                                    '& .MuiStepLabel-label': { color: '#999', fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '0.85rem' },
                                    '& .MuiStepLabel-label.Mui-active': { color: '#1a1a1a' },
                                    '& .MuiStepLabel-label.Mui-completed': { color: '#C00C0C' },
                                    '& .MuiStepIcon-root': { color: '#eee' },
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
                        p: { xs: 3, sm: 5 },
                        borderRadius: '32px',
                        bgcolor: 'white',
                        border: '1px solid rgba(0,0,0,0.04)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: '16px',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                '& .MuiAlert-icon': { color: '#C00C0C' }
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Step 1: Role Selection */}
                    {activeStep === 0 && (
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    color: '#1a1a1a',
                                    fontFamily: '"Outfit", sans-serif',
                                    fontWeight: 800,
                                    mb: 1,
                                    letterSpacing: '-0.5px'
                                }}
                            >
                                Who are you?
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#777', mb: 4, fontWeight: 500 }}>
                                Select your role to personalize your experience
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 2, mb: 4 }}>
                                {[
                                    { value: 'user', label: 'Job Seeker', icon: <PersonIcon sx={{ fontSize: 32 }} />, desc: 'Find local jobs & shops' },
                                    { value: 'shop', label: 'Shop Owner', icon: <StoreIcon sx={{ fontSize: 32 }} />, desc: 'Post jobs & manage shop' },
                                ].map((opt) => (
                                    <Box
                                        key={opt.value}
                                        onClick={() => { setRole(opt.value); setError(''); }}
                                        sx={{
                                            flex: 1,
                                            p: 3,
                                            borderRadius: '24px',
                                            border: `2px solid ${role === opt.value ? '#C00C0C' : '#F5F5F5'}`,
                                            bgcolor: role === opt.value ? 'rgba(192,12,12,0.02)' : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                borderColor: role === opt.value ? '#C00C0C' : 'rgba(192,12,12,0.2)',
                                                transform: 'translateY(-4px)',
                                            },
                                        }}
                                    >
                                        <Box sx={{ color: role === opt.value ? '#C00C0C' : '#bbb', mb: 1.5 }}>
                                            {opt.icon}
                                        </Box>
                                        <Typography sx={{ color: '#1a1a1a', fontFamily: '"Outfit", sans-serif', fontWeight: 800, mb: 0.5 }}>
                                            {opt.label}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#888', fontWeight: 500 }}>
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
                            <Typography
                                variant="h5"
                                sx={{
                                    color: '#1a1a1a',
                                    fontFamily: '"Outfit", sans-serif',
                                    fontWeight: 800,
                                    mb: 1,
                                    letterSpacing: '-0.5px'
                                }}
                            >
                                {role === 'shop' ? 'Shop Details' : 'Your Details'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#777', mb: 4, fontWeight: 500 }}>
                                Complete your profile to get started
                            </Typography>

                            <Grid container spacing={2.5}>
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
                                            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                                                <TextField
                                                    fullWidth label="Add Key Item (e.g. Rice, Bread)"
                                                    value={keyItemInput}
                                                    onChange={e => setKeyItemInput(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyItem())}
                                                    sx={inputStyles}
                                                />
                                                <Button
                                                    variant="outlined"
                                                    onClick={addKeyItem}
                                                    sx={{
                                                        borderColor: 'rgba(0,0,0,0.1)',
                                                        color: '#1a1a1a',
                                                        minWidth: 56,
                                                        borderRadius: '16px'
                                                    }}
                                                >
                                                    <AddIcon />
                                                </Button>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {form.shopKeyItems.map(item => (
                                                    <Chip
                                                        key={item}
                                                        label={item}
                                                        onDelete={() => removeKeyItem(item)}
                                                        sx={{
                                                            bgcolor: 'rgba(192,12,12,0.06)',
                                                            color: '#C00C0C',
                                                            fontWeight: 600,
                                                            fontFamily: '"Inter", sans-serif',
                                                            '& .MuiChip-deleteIcon': { color: '#C00C0C' }
                                                        }}
                                                    />
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
                                    <TextField
                                        fullWidth name="phone" label="Phone" value={form.phone}
                                        onChange={handleChange} required placeholder="9876543210"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PhoneIcon sx={{ color: '#C00C0C', fontSize: '1.2rem' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={inputStyles}
                                    />
                                </Grid>

                                {/* Address */}
                                <Grid item xs={12}>
                                    <TextField fullWidth name="street" label="Street / House No." value={form.street}
                                        onChange={handleChange} required sx={inputStyles} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth name="area" label="Area" value={form.area}
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
                                        p: 2.5, borderRadius: '20px',
                                        border: '1px solid rgba(0,0,0,0.04)',
                                        bgcolor: '#FBFAFA',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <LocationOnIcon sx={{ color: '#C00C0C' }} />
                                            <Box>
                                                <Typography sx={{ color: '#1a1a1a', fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>
                                                    Precision Location {role === 'shop' && <span style={{ color: '#C00C0C' }}>*</span>}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#888', fontWeight: 500 }}>
                                                    {form.latitude ? `📍 Located Successfully` : 'Help nearby users find you'}
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
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon sx={{ color: '#C00C0C', fontSize: '1.2rem' }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        sx={{ color: '#999' }}
                                                    >
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
                                        fullWidth name="confirmPassword" label="Confirm"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.confirmPassword} onChange={handleChange} required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon sx={{ color: '#C00C0C', fontSize: '1.2rem' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={inputStyles}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setActiveStep(0)}
                                    sx={{
                                        flex: 1,
                                        py: 2,
                                        borderRadius: '18px',
                                        borderColor: '#eee',
                                        color: '#666',
                                        fontFamily: '"Outfit", sans-serif',
                                        fontWeight: 700,
                                        textTransform: 'none'
                                    }}
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

                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography variant="body2" sx={{ color: '#777', fontWeight: 500 }}>
                            Already have an account?{' '}
                            <Link
                                onClick={() => navigate('/app/login')}
                                sx={{
                                    color: '#C00C0C',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Sign In
                            </Link>
                        </Typography>
                    </Box>
                </Paper>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Link
                        onClick={() => navigate('/')}
                        sx={{
                            color: '#999',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                            fontWeight: 500
                        }}
                    >
                        ← Back to Landing Page
                    </Link>
                </Box>
            </Container>
        </Box>
    );
}

const primaryBtnStyles = {
    py: 2,
    borderRadius: '18px',
    bgcolor: '#C00C0C',
    color: 'white',
    fontFamily: '"Outfit", sans-serif',
    fontWeight: 800,
    fontSize: '1rem',
    textTransform: 'none',
    boxShadow: '0 10px 20px rgba(192, 12, 12, 0.2)',
    '&:hover': {
        bgcolor: '#8A0909',
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 24px rgba(192, 12, 12, 0.3)',
    },
    '&.Mui-disabled': {
        bgcolor: '#eee',
        color: '#aaa'
    }
};

const inputStyles = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        bgcolor: '#FBFAFA',
        color: '#1a1a1a',
        fontFamily: '"Inter", sans-serif',
        '& fieldset': {
            borderColor: 'rgba(0,0,0,0.06)',
            transition: 'all 0.2s ease'
        },
        '&:hover fieldset': { borderColor: 'rgba(192, 12, 12, 0.2)' },
        '&.Mui-focused fieldset': { borderColor: '#C00C0C' },
    },
    '& .MuiInputLabel-root': {
        color: '#888',
        fontFamily: '"Inter", sans-serif',
        fontSize: '0.95rem',
        '&.Mui-focused': { color: '#C00C0C' },
    },
    '& .MuiSelect-icon': { color: '#999' },
};

export default Register;
