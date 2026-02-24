import React, { useState, useEffect } from 'react';
import {
    Box, Container, Paper, Typography, TextField, Button,
    InputAdornment, IconButton, Alert, CircularProgress, Link,
    FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent,
    DialogActions, Stepper, Step, StepLabel, Chip
} from '@mui/material';
import {
    Phone as PhoneIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    Person as PersonIcon,
    Store as StoreIcon,
    Church as ChurchIcon,
    LocalHospital as DoctorIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { loginUser, requestPasswordReset, verifyOTPAndResetPassword } from '../../services/auth';

// Role icons mapping
const roleIcons = {
    user: <PersonIcon sx={{ fontSize: 20 }} />,
    business: <StoreIcon sx={{ fontSize: 20 }} />,
    doctor: <DoctorIcon sx={{ fontSize: 20 }} />,
    worship: <ChurchIcon sx={{ fontSize: 20 }} />,
    admin: <AdminIcon sx={{ fontSize: 20 }} />
};

// Role colors
const roleColors = {
    user: '#2196f3',
    business: '#4caf50',
    doctor: '#f44336',
    worship: '#9c27b0',
    admin: '#ff9800'
};

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ phone: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    
    // Forgot password flow
    const [forgotOpen, setForgotOpen] = useState(false);
    const [resetStep, setResetStep] = useState(0);
    const [resetPhone, setResetPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');

    // Load saved phone if remember me was checked
    useEffect(() => {
        const savedPhone = localStorage.getItem('saved_phone');
        if (savedPhone) {
            setForm(prev => ({ ...prev, phone: savedPhone }));
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.phone || !form.password) {
            setError('Please enter both phone number and password');
            return;
        }

        if (form.phone.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        try {
            const result = await loginUser(form.phone, form.password);
            
            // Handle remember me
            if (rememberMe) {
                localStorage.setItem('saved_phone', form.phone);
            } else {
                localStorage.removeItem('saved_phone');
            }

            // Store user data
            localStorage.setItem('nearzo_token', result.token);
            localStorage.setItem('nearzo_user', JSON.stringify(result.user));
            localStorage.setItem('nearzo_role', result.user.role);

            // Show success message
            setError('');
            
            // Redirect based on role
            setTimeout(() => {
                const routes = {
                    user: '/app/user/home',
                    business: '/app/business/dashboard',
                    doctor: '/app/doctor/dashboard',
                    worship: '/app/worship/dashboard',
                    admin: '/app/admin/dashboard'
                };
                navigate(routes[result.user.role] || '/app/user/home');
            }, 500);

        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Forgot password handlers
    const handleForgotOpen = () => {
        setForgotOpen(true);
        setResetStep(0);
        setResetPhone('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setResetError('');
        setResetSuccess('');
    };

    const handleForgotClose = () => {
        setForgotOpen(false);
        setResetStep(0);
        setResetError('');
        setResetSuccess('');
    };

    const handleRequestOTP = async () => {
        if (!resetPhone || resetPhone.length !== 10) {
            setResetError('Please enter a valid 10-digit phone number');
            return;
        }

        setResetLoading(true);
        try {
            await requestPasswordReset(resetPhone);
            setResetSuccess('OTP sent to your phone');
            setResetStep(1);
            setResetError('');
        } catch (err) {
            setResetError(err.message || 'Failed to send OTP');
        } finally {
            setResetLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 4) {
            setResetError('Please enter valid OTP');
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            setResetError('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setResetError('Passwords do not match');
            return;
        }

        setResetLoading(true);
        try {
            await verifyOTPAndResetPassword(resetPhone, otp, newPassword);
            setResetSuccess('Password reset successful! You can now login.');
            setTimeout(() => {
                handleForgotClose();
                // Pre-fill phone number
                setForm(prev => ({ ...prev, phone: resetPhone }));
            }, 2000);
        } catch (err) {
            setResetError(err.message || 'Failed to reset password');
        } finally {
            setResetLoading(false);
        }
    };

    // Role badge component
    const RoleBadge = ({ role }) => (
        <Chip
            icon={roleIcons[role]}
            label={role.charAt(0).toUpperCase() + role.slice(1)}
            size="small"
            sx={{
                bgcolor: `${roleColors[role]}15`,
                color: roleColors[role],
                fontWeight: 600,
                '& .MuiChip-icon': { color: roleColors[role] }
            }}
        />
    );

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#F8F8F8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                py: 4
            }}
        >
            <Container maxWidth="xs" sx={{ position: 'relative' }}>
                {/* Decorative background */}
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

                {/* Logo */}
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
                            fontWeight: 500
                        }}
                    >
                        Welcome back! 👋
                    </Typography>
                </Box>

                {/* Login Form */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
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
                            mb: 1
                        }}
                    >
                        Sign In
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#777', mb: 3 }}>
                        Use your phone number to continue
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: '16px',
                                fontSize: '0.85rem'
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

                        {/* Remember me & Forgot password */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mt: 1,
                            mb: 2
                        }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        sx={{
                                            color: '#C00C0C',
                                            '&.Mui-checked': { color: '#C00C0C' }
                                        }}
                                    />
                                }
                                label="Remember me"
                                sx={{ '& .MuiTypography-root': { color: '#666', fontSize: '0.9rem' } }}
                            />
                            <Link
                                onClick={handleForgotOpen}
                                sx={{
                                    color: '#C00C0C',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Forgot Password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 2,
                                py: 1.8,
                                borderRadius: '16px',
                                bgcolor: '#C00C0C',
                                color: 'white',
                                fontFamily: '"Outfit", sans-serif',
                                fontWeight: 800,
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: '0 8px 16px rgba(192, 12, 12, 0.2)',
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

                        {/* Role badges for demo */}
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1 }}>
                                Demo accounts available for:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                                {Object.keys(roleIcons).map(role => (
                                    <RoleBadge key={role} role={role} />
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Typography variant="body2" sx={{ color: '#777' }}>
                                New to NearZO?{' '}
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
                                    Create Account
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Back to landing */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Link
                        onClick={() => navigate('/')}
                        sx={{
                            color: '#999',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                            fontWeight: 500,
                            '&:hover': { color: '#666' }
                        }}
                    >
                        ← Back to Home
                    </Link>
                </Box>

                {/* Forgot Password Dialog */}
                <Dialog
                    open={forgotOpen}
                    onClose={handleForgotClose}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '24px',
                            p: 2
                        }
                    }}
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Reset Password
                        </Typography>
                    </DialogTitle>

                    <DialogContent>
                        {/* Stepper */}
                        <Stepper activeStep={resetStep} sx={{ mb: 3, mt: 1 }}>
                            <Step><StepLabel>Verify</StepLabel></Step>
                            <Step><StepLabel>Reset</StepLabel></Step>
                        </Stepper>

                        {resetError && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                {resetError}
                            </Alert>
                        )}

                        {resetSuccess && (
                            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                                {resetSuccess}
                            </Alert>
                        )}

                        {resetStep === 0 ? (
                            // Step 1: Request OTP
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={resetPhone}
                                onChange={(e) => setResetPhone(e.target.value)}
                                placeholder="Enter your registered phone"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon sx={{ color: '#C00C0C' }} />
                                        </InputAdornment>
                                    )
                                }}
                                sx={inputStyles}
                            />
                        ) : (
                            // Step 2: Verify OTP and set new password
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                />
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                />
                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                />
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button
                            onClick={handleForgotClose}
                            sx={{
                                color: '#666',
                                borderRadius: '12px',
                                px: 3
                            }}
                        >
                            Cancel
                        </Button>
                        
                        {resetStep === 0 ? (
                            <Button
                                variant="contained"
                                onClick={handleRequestOTP}
                                disabled={resetLoading}
                                sx={{
                                    bgcolor: '#C00C0C',
                                    borderRadius: '12px',
                                    px: 3,
                                    '&:hover': { bgcolor: '#8A0909' }
                                }}
                            >
                                {resetLoading ? <CircularProgress size={24} /> : 'Send OTP'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleVerifyOTP}
                                disabled={resetLoading}
                                sx={{
                                    bgcolor: '#C00C0C',
                                    borderRadius: '12px',
                                    px: 3,
                                    '&:hover': { bgcolor: '#8A0909' }
                                }}
                            >
                                {resetLoading ? <CircularProgress size={24} /> : 'Reset Password'}
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>
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