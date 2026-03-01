import React, { useState } from 'react';
import {
    Box, Container, Paper, Typography, TextField, Button,
    InputAdornment, IconButton, Alert, CircularProgress, Link,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/auth';

function Login() {
    const navigate = useNavigate();
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
        if (!form.phone || !form.password) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            const result = await loginUser(form.phone, form.password);
            // Store role and token
            localStorage.setItem('nearzo_role', result.user.role);
            localStorage.setItem('nearzo_token', result.token);
            localStorage.setItem('nearzo_user', JSON.stringify(result.user));

            // Redirect based on role
            const roleRoutes = {
                user: '/app/user/home',
                shop: '/app/shop/dashboard',
                admin: '/app/admin/dashboard',
            };
            navigate(roleRoutes[result.user.role] || '/app/user/home');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#F8F8F8', // Matches landing page background
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <Container maxWidth="xs" sx={{ position: 'relative' }}>
                {/* Decorative background element */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(192,12,12,0.05) 0%, transparent 70%)',
                        filter: 'blur(50px)',
                        zIndex: 0
                    }}
                />

                {/* Logo & Header */}
                <Box sx={{ textAlign: 'center', mb: 4, position: 'relative', zIndex: 1 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily: '"Outfit", sans-serif',
                            fontWeight: 900,
                            color: '#1a1a1a',
                            letterSpacing: '-1.5px',
                        }}
                    >
                        Near<span style={{ color: '#C00C0C' }}>ZO</span>
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#666',
                            mt: 0.5,
                            fontWeight: 500,
                            letterSpacing: '0.5px'
                        }}
                    >
                        Your Hyperlocal Connection
                    </Typography>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: 4.5,
                        borderRadius: '32px',
                        bgcolor: 'white',
                        border: '1px solid rgba(0,0,0,0.04)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: '"Outfit", sans-serif',
                            fontWeight: 800,
                            color: '#1a1a1a',
                            mb: 1,
                            letterSpacing: '-0.5px'
                        }}
                    >
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#777', mb: 4, fontWeight: 500 }}>
                        Login to access your local community
                    </Typography>

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

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            name="phone"
                            label="Phone Number"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="9876543210"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIcon sx={{ color: '#C00C0C', fontSize: '1.2rem' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={inputStyles}
                            margin="normal"
                        />

                        <TextField
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange}
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
                                            edge="end"
                                            sx={{ color: '#999' }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={inputStyles}
                            margin="normal"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 4,
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
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Typography variant="body2" sx={{ color: '#777', fontWeight: 500 }}>
                                Don't have an account?{' '}
                                <Link
                                    onClick={() => navigate('/app/register')}
                                    sx={{
                                        color: '#C00C0C',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Join NearZO
                                </Link>
                            </Typography>
                        </Box>
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
                            fontWeight: 500,
                            '&:hover': { color: '#333' }
                        }}
                    >
                        ← Back to Landing Page
                    </Link>
                </Box>
            </Container>
        </Box>
    );
}

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
};

export default Login;
