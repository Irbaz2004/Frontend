// Register.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Container, Paper, Typography, TextField, Button,
    InputAdornment, IconButton, Alert, CircularProgress, Link,
    MenuItem, FormControl, InputLabel, Select, FormHelperText,
    useMediaQuery, useTheme, Fade, Autocomplete
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { registerUser, fetchCities, fetchAreasByCity } from '../../services/auth';
import logo from '../../assets/nearzologo.png';

function Register() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isVerySmall = useMediaQuery('(max-width:350px)');
    const [isVisible, setIsVisible] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Location data
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingAreas, setLoadingAreas] = useState(false);

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        area: '',
        city: '',
        state: '',
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        setIsVisible(true);
        loadCities();
    }, []);

    // When city changes, auto-populate state and load areas
    useEffect(() => {
        if (form.city) {
            // Find selected city and auto-populate state
            const selectedCity = cities.find(c => c.name === form.city);
            if (selectedCity && selectedCity.state) {
                setForm(prev => ({ ...prev, state: selectedCity.state }));
            }
            
            // Load areas for selected city
            loadAreas(form.city);
            
            // Reset area when city changes
            setForm(prev => ({ ...prev, area: '' }));
        }
    }, [form.city, cities]);

    const loadCities = async () => {
        setLoadingCities(true);
        try {
            const citiesData = await fetchCities();
            console.log('Loaded cities:', citiesData);
            setCities(citiesData);
        } catch (err) {
            console.error('Error loading cities:', err);
            setError('Failed to load cities. Please refresh the page.');
        } finally {
            setLoadingCities(false);
        }
    };

    const loadAreas = async (cityName) => {
        setLoadingAreas(true);
        try {
            const areasData = await fetchAreasByCity(cityName);
            console.log('Loaded areas for', cityName, ':', areasData);
            setAreas(areasData);
        } catch (err) {
            console.error('Error loading areas:', err);
            setError('Failed to load areas for selected city');
        } finally {
            setLoadingAreas(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const validateForm = () => {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!form.fullName.trim()) return 'Full name is required';
        if (!phoneRegex.test(form.phone)) return 'Please enter a valid 10-digit Indian mobile number';
        if (!form.city) return 'Please select a city';
        if (!form.area) return 'Please select an area';
        if (!form.state) return 'State is required';
        if (!form.password) return 'Password is required';
        if (form.password.length < 6) return 'Password must be at least 6 characters';
        if (form.password !== form.confirmPassword) return 'Passwords do not match';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            const registrationData = {
                fullName: form.fullName,
                phone: form.phone,
                area: form.area,
                city: form.city,
                state: form.state,
                password: form.password,
            };

            const result = await registerUser(registrationData);
            navigate('/app/user/home');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={styles.container}>
            <Box sx={styles.backgroundWrapper}>
                <Box sx={styles.bgBase} />
                <Box sx={styles.diagonalSplit} />
                <Box sx={styles.shapeDots} />
                <Box sx={styles.gridPattern} />
                <Box sx={styles.gradientOverlay} />
            </Box>

            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10, px: isVerySmall ? 1 : 2 }}>
                <Fade in={isVisible} timeout={800}>
                    <Box>
                        <Paper elevation={0} sx={styles.paper}>
                            <Box sx={styles.logoWrapper}>
                                <Box
                                    component="img"
                                    src={logo}
                                    alt="NearZO"
                                    sx={{
                                        width: { xs: 'min(120px, 50vw)', sm: '140px', md: '160px' },
                                        height: 'auto',
                                        objectFit: 'contain',
                                    }}
                                />
                                <Box sx={styles.logoDivider} />
                            </Box>

                            {error && (
                                <Alert severity="error" sx={styles.alert}>
                                    {error}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={handleSubmit} sx={styles.formContainer}>
                                <Typography variant="h5" sx={styles.title}>
                                    Create Account
                                </Typography>
                                <Typography variant="body2" sx={styles.subtitle}>
                                    Join NearZO to discover local shops and services
                                </Typography>

                                {/* Full Name and Phone Number Row */}
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                    <TextField
                                        fullWidth
                                        name="fullName"
                                        label="Full Name"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        required
                                        size={isVerySmall ? 'small' : 'medium'}
                                        sx={styles.input}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon sx={{ color: '#325fec', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        name="phone"
                                        label="Phone Number"
                                        value={form.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="9876543210"
                                        size={isVerySmall ? 'small' : 'medium'}
                                        sx={styles.input}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PhoneIcon sx={{ color: '#325fec', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Box>

                                {/* City Selection with Search */}
                                <Autocomplete
                                    fullWidth
                                    options={cities}
                                    getOptionLabel={(option) => option.name}
                                    value={cities.find(c => c.name === form.city) || null}
                                    onChange={(event, newValue) => {
                                        setForm(prev => ({ 
                                            ...prev, 
                                            city: newValue ? newValue.name : '',
                                            area: ''
                                        }));
                                        setError('');
                                    }}
                                    loading={loadingCities}
                                    disabled={loadingCities}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="City"
                                            required
                                            size={isVerySmall ? 'small' : 'medium'}
                                            sx={styles.input}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <>
                                                        <InputAdornment position="start">
                                                            <LocationOnIcon sx={{ color: '#325fec', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
                                                        </InputAdornment>
                                                        {params.InputProps.startAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />

                                {/* Area Selection with Search */}
                                <Autocomplete
                                    fullWidth
                                    options={areas}
                                    getOptionLabel={(option) => `${option.area}${option.pincode ? ` (${option.pincode})` : ''}`}
                                    value={areas.find(a => a.area === form.area) || null}
                                    onChange={(event, newValue) => {
                                        setForm(prev => ({ ...prev, area: newValue ? newValue.area : '' }));
                                        setError('');
                                    }}
                                    loading={loadingAreas}
                                    disabled={!form.city || loadingAreas}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Area / Locality"
                                            required
                                            size={isVerySmall ? 'small' : 'medium'}
                                            sx={styles.input}
                                            helperText={!form.city ? "Please select a city first" : ""}
                                        />
                                    )}
                                />

                                {/* State - Auto-populated from city selection, disabled */}
                                <TextField
                                    fullWidth
                                    name="state"
                                    label="State"
                                    value={form.state}
                                    onChange={handleChange}
                                    required
                                    disabled
                                    size={isVerySmall ? 'small' : 'medium'}
                                    sx={styles.input}
                                    placeholder="State will auto-populate from selected city"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOnIcon sx={{ color: '#325fec', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Password Fields */}
                                <Box sx={styles.rowContainer}>
                                    <TextField
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        size={isVerySmall ? 'small' : 'medium'}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon sx={{ color: '#325fec', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        size={isVerySmall ? 'small' : 'medium'}
                                                        sx={{ color: '#999' }}
                                                    >
                                                        {showPassword ? <VisibilityOff fontSize={isVerySmall ? 'small' : 'medium'} /> : <Visibility fontSize={isVerySmall ? 'small' : 'medium'} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={styles.input}
                                    />
                                    <TextField
                                        fullWidth
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        size={isVerySmall ? 'small' : 'medium'}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon sx={{ color: '#325fec', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={styles.input}
                                    />
                                </Box>

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    sx={styles.primaryButton}
                                >
                                    {loading ? <CircularProgress size={isVerySmall ? 20 : 24} sx={{ color: '#ffffff' }} /> : 'Create Account'}
                                </Button>
                            </Box>

                            {/* Login Link */}
                            <Box sx={styles.loginLink}>
                                <Typography variant="body2" sx={{ color: '#5a6e8a', fontSize: isVerySmall ? '0.75rem' : '0.875rem' }}>
                                    Already have an account?{' '}
                                    <Link
                                        onClick={() => navigate('/app/login')}
                                        sx={styles.link}
                                    >
                                        Sign In
                                    </Link>
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, sm: 2 },
        py: { xs: 3, sm: 6 },
        position: 'relative',
        overflow: 'hidden',
    },
    backgroundWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
    },
    bgBase: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #325fec 100%, #325fec 100%)',
    },
    diagonalSplit: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '60%',
        height: '100%',
        background: '#ffffff',
        transform: 'skewX(-35deg)',
        transformOrigin: 'top right',
        '@media (max-width: 768px)': {
            width: '100%',
            transform: 'skewX(0deg)',
        },
    },
    shapeDots: {
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: '150px',
        height: '150px',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 2px, transparent 2px)',
        backgroundSize: '20px 20px',
        animation: 'float 30s ease-in-out infinite',
    },
    gridPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.04) 100%)',
    },
    logoWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 3,
    },
    logoDivider: {
        width: '50px',
        height: '3px',
        background: 'linear-gradient(90deg, #325fec, #325fec)',
        borderRadius: '3px',
        mt: 2,
    },
    paper: {
        p: { xs: 2.5, sm: 3.5, md: 4.5 },
        borderRadius: { xs: '28px', sm: '36px' },
        bgcolor: 'white',
        position: 'relative',
        zIndex: 1,
        maxWidth: '550px',
        margin: 'auto',
        maxHeight: '85vh',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            width: '6px',
        },
        '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#325fec',
            borderRadius: '10px',
        },
        '@media (max-width: 600px)': {
            bgcolor: 'rgba(255,255,255,0.95)',
            maxHeight: '90vh',
        }
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    alert: {
        mb: 2,
        borderRadius: '16px',
        fontSize: { xs: '0.75rem', sm: '0.85rem' },
        fontWeight: 500,
        '& .MuiAlert-icon': { color: '#325fec' }
    },
    title: {
        color: '#020402',
        fontFamily: '"Alumni Sans", sans-serif',
        fontWeight: 700,
        fontSize: { xs: '1.5rem', sm: '1.75rem' },
        textAlign: 'center',
        letterSpacing: '1px',
        mb: 0.5,
    },
    subtitle: {
        color: '#5a6e8a',
        mb: 2,
        fontWeight: 400,
        fontFamily: '"Inter", sans-serif',
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        textAlign: 'center'
    },
    rowContainer: {
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.5, sm: 2 },
        width: '100%',
    },
    primaryButton: {
        mt: 1,
        py: { xs: 1.2, sm: 1.5 },
        borderRadius: '50px',
        bgcolor: '#325fec',
        color: 'white',
        fontFamily: '"Inter", sans-serif',
        fontWeight: 700,
        fontSize: { xs: '0.9rem', sm: '1rem' },
        textTransform: 'none',
        boxShadow: '0 8px 20px rgba(50, 95, 236, 0.25)',
        '&:hover': {
            bgcolor: '#2548b0',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 28px rgba(50, 95, 236, 0.35)',
        },
        '&.Mui-disabled': {
            bgcolor: '#e0e0e0',
            color: '#999'
        }
    },
    input: {
        '& .MuiOutlinedInput-root': {
            borderRadius: { xs: '14px', sm: '16px' },
            bgcolor: '#f8f9fa',
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            '& fieldset': {
                borderColor: 'rgba(50, 95, 236, 0.15)',
                transition: 'all 0.2s ease'
            },
            '&:hover fieldset': { borderColor: 'rgba(50, 95, 236, 0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#325fec', borderWidth: '2px' },
        },
        '& .MuiInputLabel-root': {
            color: '#5a6e8a',
            fontSize: { xs: '0.8rem', sm: '0.95rem' },
            '&.Mui-focused': { color: '#325fec' },
        },
        '& .Mui-disabled': {
            // bgcolor: '#f0f0f0',
            '& .MuiOutlinedInput-root': {
                bgcolor: '#f0f0f0',
            }
        }
    },
    loginLink: {
        textAlign: 'center',
        mt: 3,
        pt: 2,
        borderTop: '1px solid rgba(0,0,0,0.05)',
    },
    link: {
        color: '#325fec',
        cursor: 'pointer',
        fontWeight: 700,
        textDecoration: 'none',
        fontFamily: '"Inter", sans-serif',
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        '&:hover': { 
            textDecoration: 'underline',
            color: '#2548b0' 
        }
    }
};

// Add keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(20px, -20px); }
    }
`;
document.head.appendChild(style);

export default Register;