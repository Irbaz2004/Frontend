// Login.jsx
import React, { useState } from 'react';
import {
    Box, Container, Paper, Typography, TextField, Button,
    InputAdornment, IconButton, Alert, CircularProgress, Link,
    useMediaQuery, useTheme
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/auth';
import { useAuth } from '../context/AuthContext';

function Login() {
    const navigate = useNavigate();
    const theme = useTheme();
    const { login } = useAuth();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isVerySmall = useMediaQuery('(max-width:350px)');
    
    const [form, setForm] = useState({ phone: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Phone validation
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(form.phone)) {
            setError('Please enter a valid 10-digit Indian mobile number');
            return;
        }
        
        if (!form.password) {
            setError('Please enter your password');
            return;
        }
        
        setLoading(true);
        try {
            console.log('Attempting login with:', form.phone);
            const result = await loginUser(form.phone, form.password);
            console.log('Login result:', result);

            // Get the role from the result
            const userRole = result.user?.role;
            
            if (!userRole) {
                console.error('No role in response:', result);
                setError('Invalid response from server');
                setLoading(false);
                return;
            }

            // IMPORTANT: Update AuthContext state
            login(result.user, result.token, userRole);

            // Redirect based on role
            const roleRoutes = {
                user: '/app/user/home',
                business: '/app/business/dashboard',
                admin: '/app/admin/dashboard',
            };
            
            const redirectPath = roleRoutes[userRole];
            
            if (!redirectPath) {
                console.error('Unknown role:', userRole);
                setError(`Unknown user role: ${userRole}`);
                setLoading(false);
                return;
            }
            
            console.log('Redirecting to:', redirectPath);
            
            // Use replace to prevent going back to login
            navigate(redirectPath, { replace: true });
            
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={styles.container}>
            <Container maxWidth="xs" sx={{ position: 'relative', px: isVerySmall ? 1 : 2 }}>
                {/* Decorative background element */}
                <Box sx={styles.decorative} />

                {/* Logo & Header */}
                <Box sx={styles.logoContainer}>
                    <Typography 
                        variant={isVerySmall ? "h5" : "h4"} 
                        sx={styles.logo}
                    >
                        Near<span style={{ color: '#0003b1' }}>ZO</span>
                    </Typography>
                    <Typography variant="body2" sx={styles.logoSubtitle}>
                        Your Hyperlocal Connection
                    </Typography>
                </Box>

                <Paper elevation={0} sx={styles.paper}>
                    <Typography variant="h5" sx={styles.title}>
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" sx={styles.subtitle}>
                        Login to access your local community
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={styles.alert}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            name="phone"
                            label="Phone Number"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="9876543210"
                            required
                            size={isVerySmall ? 'small' : 'medium'}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIcon sx={{ color: '#0003b1', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={styles.input}
                            margin={isVerySmall ? 'dense' : 'normal'}
                        />

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
                                        <LockIcon sx={{ color: '#0003b1', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            size={isVerySmall ? 'small' : 'medium'}
                                            sx={{ color: '#999' }}
                                        >
                                            {showPassword ? 
                                                <VisibilityOff fontSize={isVerySmall ? 'small' : 'medium'} /> : 
                                                <Visibility fontSize={isVerySmall ? 'small' : 'medium'} />
                                            }
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={styles.input}
                            margin={isVerySmall ? 'dense' : 'normal'}
                        />

                        {/* Forgot Password Link */}
                        <Box sx={styles.forgotPassword}>
                            <Link
                                onClick={() => navigate('/app/forgot-password')}
                                sx={styles.link}
                            >
                                Forgot Password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            size={isVerySmall ? 'small' : 'large'}
                            sx={styles.primaryButton}
                        >
                            {loading ? <CircularProgress size={isVerySmall ? 16 : 24} sx={{ color: 'white' }} /> : 'Sign In'}
                        </Button>

                        <Box sx={styles.signupLink}>
                            <Typography variant="body2" sx={{ color: '#777', fontSize: isVerySmall ? '0.7rem' : '0.875rem' }}>
                                Don't have an account?{' '}
                                <Link
                                    onClick={() => navigate('/app/register')}
                                    sx={styles.link}
                                >
                                    Join NearZO
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Back to Home */}
                <Box sx={styles.backLink}>
                    <Link
                        onClick={() => navigate('/')}
                        sx={styles.link}
                    >
                        ← Back to Home
                    </Link>
                </Box>
            </Container>
        </Box>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        bgcolor: '#F8F8F8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, sm: 2 },
    },
    decorative: {
        position: 'absolute',
        top: { xs: -80, sm: -100 },
        right: { xs: -80, sm: -100 },
        width: { xs: 250, sm: 300 },
        height: { xs: 250, sm: 300 },
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 11, 49, 0.02) 0%, transparent 70%)',
        filter: 'blur(50px)',
        zIndex: 0
    },
    logoContainer: {
        textAlign: 'center',
        mb: { xs: 2, sm: 4 },
        position: 'relative',
        zIndex: 1
    },
    logo: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 900,
        color: '#1a1a1a',
        letterSpacing: '-1.5px',
        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
    },
    logoSubtitle: {
        color: '#666',
        mt: 0.5,
        fontWeight: 500,
        fontSize: { xs: '0.7rem', sm: '0.875rem' }
    },
    paper: {
        p: { xs: 2.5, sm: 4.5 },
        borderRadius: { xs: '24px', sm: '32px' },
        bgcolor: 'white',
        border: '1px solid rgba(0, 11, 49, 0.04)',
        boxShadow: '0 20px 40px rgba(0, 11, 49, 0.04)',
        position: 'relative',
        zIndex: 1
    },
    title: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 800,
        color: '#1a1a1a',
        mb: 1,
        letterSpacing: '-0.5px',
        fontSize: { xs: '1.25rem', sm: '1.5rem' }
    },
    subtitle: {
        color: '#777',
        mb: { xs: 2, sm: 4 },
        fontWeight: 500,
        fontSize: { xs: '0.7rem', sm: '0.875rem' }
    },
    alert: {
        mb: { xs: 2, sm: 3 },
        borderRadius: '16px',
        fontSize: { xs: '0.7rem', sm: '0.85rem' },
        fontWeight: 500,
        '& .MuiAlert-icon': { color: '#0003b1' }
    },
    input: {
        '& .MuiOutlinedInput-root': {
            borderRadius: { xs: '14px', sm: '16px' },
            bgcolor: '#FBFAFA',
            color: '#1a1a1a',
            fontFamily: '"Inter", sans-serif',
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            '& fieldset': {
                borderColor: 'rgba(0, 11, 49, 0.06)',
                transition: 'all 0.2s ease'
            },
            '&:hover fieldset': { borderColor: 'rgba(0, 11, 49, 0.2)' },
            '&.Mui-focused fieldset': { borderColor: '#0003b1' },
        },
        '& .MuiInputLabel-root': {
            color: '#888',
            fontFamily: '"Inter", sans-serif',
            fontSize: { xs: '0.8rem', sm: '0.95rem' },
            '&.Mui-focused': { color: '#0003b1' },
        },
    },
    forgotPassword: {
        textAlign: 'right',
        mt: { xs: 0.5, sm: 1 },
        mb: { xs: 2, sm: 3 }
    },
    primaryButton: {
        mt: { xs: 2, sm: 4 },
        py: { xs: 1.5, sm: 2 },
        borderRadius: '18px',
        bgcolor: '#0003b1',
        color: 'white',
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 800,
        fontSize: { xs: '0.85rem', sm: '1rem' },
        textTransform: 'none',
        boxShadow: '0 10px 20px rgba(0, 3, 177, 0.2)',
        '&:hover': {
            bgcolor: 'white',
            color: '#0003b1',
            border: '2px solid #0003b1',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 24px rgba(0, 3, 177, 0.3)',
        },
        '&.Mui-disabled': {
            bgcolor: '#eee',
            color: '#aaa'
        }
    },
    signupLink: {
        textAlign: 'center',
        mt: { xs: 2.5, sm: 4 }
    },
    backLink: {
        textAlign: 'center',
        mt: { xs: 2, sm: 4 }
    },
    link: {
        color: '#0003b1',
        cursor: 'pointer',
        fontWeight: 700,
        textDecoration: 'none',
        fontSize: { xs: '0.8rem', sm: '0.9rem' },
        '&:hover': { 
            textDecoration: 'underline',
            color: '#000290' 
        }
    }
};

export default Login;