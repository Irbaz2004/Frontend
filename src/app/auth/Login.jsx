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
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1515 50%, #1a1a1a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <Container maxWidth="xs">
                {/* Logo */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily: '"Outfit", sans-serif',
                            fontWeight: 800,
                            color: '#fff',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Near<span style={{ color: '#C00C0C' }}>ZO</span>
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
                        Find what's near you
                    </Typography>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: '"Outfit", sans-serif',
                            fontWeight: 700,
                            color: '#fff',
                            mb: 0.5,
                        }}
                    >
                        Welcome back
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3 }}>
                        Sign in to your account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
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
                            placeholder="+91 98765 43210"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIcon sx={{ color: '#C00C0C' }} />
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
                                        <LockIcon sx={{ color: '#C00C0C' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(255,255,255,0.5)' }}>
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
                                mt: 3,
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
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2.5 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                Don't have an account?{' '}
                                <Link
                                    onClick={() => navigate('/app/register')}
                                    sx={{ color: '#C00C0C', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Register
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Link
                        onClick={() => navigate('/')}
                        sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        ← Back to Home
                    </Link>
                </Box>
            </Container>
        </Box>
    );
}

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
};

export default Login;
