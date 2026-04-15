// AppRoutes.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './app/context/AuthContext';
import { Box, CircularProgress, Fade } from '@mui/material';
import radar from './assets/Radar.gif'
import logo from './assets/nearzologo.png';

// Landing
import LandingPage from './landing/LandingPage';

// Splash
import SplashScreen from './app/SplashScreen';

// Auth
import Login from './app/auth/Login';
import Register from './app/auth/Register';

// App Layout
import AppLayout from './app/AppLayout';

// Guards
import AuthGuard from './app/context/AuthGuard';
import AuthRedirect from './app/context/AuthRedirect';

// User pages
import UserHome from './app/user/Home';

// Shop/Business pages
import ShopDashboard from './app/business/Dashboard';
import BusinessProfile from './app/business/Profile';
import BusinessJobs from './app/business/Jobs';

// Admin pages
import AdminDashboard from './app/admin/Dashboard';
import Business from './app/admin/Business';
import Doctor from './app/admin/Doctor';
import Jobs from './app/admin/Jobs';
import Users from './app/admin/Users';
import VerifyShops from './app/admin/VerifyShops';

// Loading component
function LoadingScreen() {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            bgcolor: '#ffffff'
        }}>
            <CircularProgress size={60} sx={{ color: '#325fec' }} />
        </Box>
    );
}

// Alternative WebsiteSplash component with ultra-responsive sizing
function WebsiteSplash({ onComplete }) {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
                onComplete();
            }, 500);
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <Fade in={!fadeOut} timeout={500}>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: '#ffffff',
                    zIndex: 9999,
                    flexDirection: 'column',
                    gap: { xs: 0.5, sm: 2, md: 3 },
                    p: { xs: 1, sm: 3, md: 4 },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '100%',
                        transform: 'translateZ(0)', // Force GPU acceleration
                    }}
                >
                    {/* Ultra-responsive GIF sizing */}
                    <Box
                        component="img"
                        src={radar}
                        alt="NearZO Animation"
                        sx={{
                            width: { 
                                xs: 'clamp(120px, 70vw, 180px)', 
                                sm: 'clamp(160px, 60vw, 220px)', 
                                md: 'clamp(200px, 50vw, 280px)' 
                            },
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto',
                            animation: 'pulse 1.5s ease-in-out infinite',
                            flexShrink: 0,
                        }}
                    />
                    
                    {/* Ultra-responsive logo sizing */}
                    <Box
                        component="img"
                        src={logo}
                        alt="NearZO"
                        sx={{
                            width: { 
                                xs: 'clamp(100px, 60vw, 160px)', 
                                sm: 'clamp(140px, 55vw, 200px)', 
                                md: 'clamp(180px, 45vw, 250px)' 
                            },
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto',
                            mt: { xs: '-8px', sm: '-12px', md: '-16px' },
                            flexShrink: 0,
                        }}
                    />

                </Box>
            </Box>
        </Fade>
    );
}

function AppRoutes() {
    const { loading } = useAuth();
    const [showWebsiteSplash, setShowWebsiteSplash] = useState(true);

    // Check if splash has been shown before
    useEffect(() => {
        const hasSeenSplash = sessionStorage.getItem('hasSeenWebsiteSplash');
        if (hasSeenSplash) {
            setShowWebsiteSplash(false);
        }
    }, []);

    const handleSplashComplete = () => {
        setShowWebsiteSplash(false);
        sessionStorage.setItem('hasSeenWebsiteSplash', 'true');
    };

    if (loading) {
        return <LoadingScreen />;
    }

    // Show website splash on first visit
    if (showWebsiteSplash) {
        return <WebsiteSplash onComplete={handleSplashComplete} />;
    }

    return (
        <Routes>
            {/* Landing - Public */}
            <Route path="/" element={<LandingPage />} />

            {/* Splash - Public */}
            <Route path="/app/splash" element={<SplashScreen />} />

            {/* Auth Routes - with redirect if already logged in */}
            <Route path="/app/login" element={
                <>
                    <AuthRedirect />
                    <Login />
                </>
            } />
            <Route path="/app/register" element={
                <>
                    <AuthRedirect />
                    <Register />
                </>
            } />

            {/* App Shell - Protected */}
            <Route path="/app" element={<AppLayout />}>
                {/* Default redirect */}
                <Route index element={<Navigate to="/app/splash" replace />} />

                {/* User Routes */}
                <Route path="user/home" element={
                    <AuthGuard allowedRoles={['user']}>
                        <UserHome />
                    </AuthGuard>
                } />

                {/* Business Routes */}
                <Route path="business/dashboard" element={
                    <AuthGuard allowedRoles={['business']}>
                        <ShopDashboard />
                    </AuthGuard>
                } />
                <Route path="business/profile" element={
                    <AuthGuard allowedRoles={['business']}>
                        <BusinessProfile />
                    </AuthGuard>
                } />
                <Route path="business/jobs" element={
                    <AuthGuard allowedRoles={['business']}>
                        <BusinessJobs />
                    </AuthGuard>
                } />

                {/* Admin Routes */}
                <Route path="admin/dashboard" element={
                    <AuthGuard allowedRoles={['admin']}>
                        <AdminDashboard />
                    </AuthGuard>
                } />
                <Route path="admin/businesses" element={
                    <AuthGuard allowedRoles={['admin']}>
                        <Business />
                    </AuthGuard>
                } />
                <Route path="admin/doctors" element={
                    <AuthGuard allowedRoles={['admin']}>
                        <Doctor />
                    </AuthGuard>
                } />
                <Route path="admin/jobs" element={
                    <AuthGuard allowedRoles={['admin']}>
                        <Jobs />
                    </AuthGuard>
                } />
                <Route path="admin/users" element={
                    <AuthGuard allowedRoles={['admin']}>
                        <Users />
                    </AuthGuard>
                } />
                <Route path="admin/verify-shops" element={
                    <AuthGuard allowedRoles={['admin']}>
                        <VerifyShops />
                    </AuthGuard>
                } />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

// Add Typography import
import { Typography } from '@mui/material';

// Add styles to head
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    
    @keyframes fadeInOut {
        0%, 100% {
            opacity: 0.6;
        }
        50% {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

export default AppRoutes;