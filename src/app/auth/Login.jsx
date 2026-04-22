// Login.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Container, Paper, Typography, TextField, Button,
    InputAdornment, IconButton, Alert, CircularProgress, Link,
    useMediaQuery, useTheme, Fade
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/auth';
import { useAuth } from '../context/AuthContext';
import logo from '../../assets/nearzologo.png';

function Login() {
    const navigate = useNavigate();
    const theme = useTheme();
    const { login } = useAuth();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isVerySmall = useMediaQuery('(max-width:350px)');
    const [isVisible, setIsVisible] = useState(false);
    
    const [form, setForm] = useState({ phone: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
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
            const result = await loginUser(form.phone, form.password);
            const userRole = result.user?.role;
            
            if (!userRole) {
                setError('Invalid response from server');
                setLoading(false);
                return;
            }

            login(result.user, result.token, userRole);

            const roleRoutes = {
                user: '/app/user/home',
                business: '/app/business/dashboard',
                admin: '/app/admin/dashboard',
            };
            
            const redirectPath = roleRoutes[userRole];
            
            if (!redirectPath) {
                setError(`Unknown user role: ${userRole}`);
                setLoading(false);
                return;
            }
            
            navigate(redirectPath, { replace: true });
            
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={styles.container}>
            {/* Modern Background Design */}
            <Box sx={styles.backgroundWrapper}>
                {/* Main background color */}
                <Box sx={styles.bgBase} />
                
                {/* Diagonal split design */}
                <Box sx={styles.diagonalSplit} />
                
                {/* Abstract shapes */}
                <Box sx={styles.shapeCircle1} />
                <Box sx={styles.shapeCircle2} />
                <Box sx={styles.shapeCircle3} />
                <Box sx={styles.shapeDots} />
                
                {/* Grid pattern overlay */}
                <Box sx={styles.gridPattern} />
                
                {/* Gradient overlay */}
                <Box sx={styles.gradientOverlay} />
            </Box>

            <Container maxWidth="xs" sx={{ px: isVerySmall ? 1 : 2, position: 'relative', zIndex: 10 }}>
                <Fade in={isVisible} timeout={800}>
                    <Box>
                    

                        <Paper elevation={0} sx={styles.paper}>
                            {/* Logo inside form */}
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

                            <Typography variant="h5" sx={styles.title}>
                                Welcome Back
                            </Typography>
                            <Typography variant="body2" sx={styles.subtitle}>
                                Sign in to continue to your account
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
                                                <PhoneIcon sx={{ color: '#325fec', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
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
                                                <LockIcon sx={{ color: '#325fec', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
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
                                    {loading ? <CircularProgress size={isVerySmall ? 20 : 24} sx={{ color: '#ffffff' }} /> : 'Sign In'}
                                </Button>

                                <Box sx={styles.signupLink}>
                                    <Typography variant="body2" sx={{ color: '#5a6e8a', fontSize: isVerySmall ? '0.7rem' : '0.875rem' }}>
                                        Don't have an account?{' '}
                                        <Link
                                            onClick={() => navigate('/app/register')}
                                            sx={styles.link}
                                        >
                                            Create Account
                                        </Link>
                                    </Typography>
                                </Box>
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
        background: 'linear-gradient(125deg, #325fec 100%, #325fec 100%)',
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
    backButton: {
        mb: { xs: 1, sm: 2 },
    },
    backIcon: {
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        color: '#325fec',
        backdropFilter: 'blur(10px)',
        '&:hover': {
            bgcolor: '#ffffff',
            transform: 'translateX(-4px)',
        },
        transition: 'all 0.3s ease',
    },
   paper: {
        p: { xs: 2.5, sm: 3.5, md: 4.5 },
        borderRadius: { xs: '28px', sm: '36px' },
        bgcolor: 'transparent',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        // boxShadow: '10px 25px 0px 2px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        zIndex: 1,
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
    title: {
        fontFamily: '"Alumni Sans", sans-serif',
        fontWeight: 700,
        color: '#020402',
        mb: 0.5,
        fontSize: { xs: '1.5rem', sm: '1.8rem' },
        textAlign: 'center',
    },
    subtitle: {
        color: '#5a6e8a',
        mb: { xs: 2, sm: 3 },
        fontWeight: 400,
        fontFamily: '"Inter", sans-serif',
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        textAlign: 'center',
    },
    alert: {
        mb: { xs: 2, sm: 3 },
        borderRadius: '16px',
        fontSize: { xs: '0.7rem', sm: '0.85rem' },
        fontWeight: 500,
        '& .MuiAlert-icon': { color: '#325fec' }
    },
    input: {
        '& .MuiOutlinedInput-root': {
            borderRadius: { xs: '14px', sm: '16px' },
            bgcolor: '#f8f9fa',
            color: '#020402',
            fontFamily: '"Inter", sans-serif',
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
            fontFamily: '"Inter", sans-serif',
            fontSize: { xs: '0.8rem', sm: '0.95rem' },
            '&.Mui-focused': { color: '#325fec' },
        },
    },
    forgotPassword: {
        textAlign: 'right',
        mt: { xs: 0.5, sm: 1 },
        mb: { xs: 2, sm: 3 }
    },
    primaryButton: {
        mt: { xs: 2, sm: 3 },
        py: { xs: 1.2, sm: 1.5 },
        borderRadius: '50px',
        bgcolor: '#325fec',
        color: 'white',
        fontFamily: '"Inter", sans-serif',
        fontWeight: 700,
        fontSize: { xs: '0.85rem', sm: '1rem' },
        textTransform: 'none',
        // boxShadow: '0 8px 20px rgba(50, 95, 236, 0.25)',
        '&:hover': {
            bgcolor: '#2548b0',
            transform: 'translateY(-2px)',
            // boxShadow: '0 12px 28px rgba(50, 95, 236, 0.35)',
        },
        '&.Mui-disabled': {
            bgcolor: '#e0e0e0',
            color: '#999'
        }
    },
    signupLink: {
        textAlign: 'center',
        mt: { xs: 2.5, sm: 3 }
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

// Add keyframes to document
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(20px, -20px); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.05); opacity: 0.9; }
    }
`;
document.head.appendChild(style);

export default Login;