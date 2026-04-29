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
import UserMap from './app/user/Map';
import UserProfile from './app/user/Profile';
import UserShops from './app/user/Shops';
import UserHouses from './app/user/House';
import UserJobs from './app/user/Jobs';
import CreateShop from './app/user/CreateShop';
import CreateHouse from './app/user/CreateHouse';

// Admin pages
import AdminDashboard from './app/admin/Dashboard';
import AdminBusinesses from './app/admin/Business';
import AdminLocations from './app/admin/Location';
import AdminJobs from './app/admin/Jobs';
import AdminUsers from './app/admin/Users';
import AdminVerifyShops from './app/admin/VerifyShops';
import AdminVerifyHouses from './app/admin/VerifyHouses';
import ShopCategory from './app/admin/ShopCategory';

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

// WebsiteSplash component
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
                        transform: 'translateZ(0)',
                    }}
                >
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

    if (showWebsiteSplash) {
        return <WebsiteSplash onComplete={handleSplashComplete} />;
    }

    return (
        <Routes>
            {/* Landing - Public */}
            <Route path="/" element={<LandingPage />} />

            {/* Splash - Public */}
            {/* <Route path="/app/splash" element={<SplashScreen />} /> */}

            {/* Auth Routes - with redirect if already logged in */}
            <Route path="/app/login" element={
                <AuthRedirect>
                    <Login />
                </AuthRedirect>
            } />
            <Route path="/app/register" element={
                <AuthRedirect>
                    <Register />
                </AuthRedirect>
            } />

            {/* App Shell - Protected */}
            <Route path="/app" element={<AppLayout />}>
                {/* Default redirect to home */}
                <Route index element={<Navigate to="/app/home" replace />} />

                {/* User Routes - MATCHING NAV_CONFIG paths */}
                <Route path="home" element={
                    <AuthGuard allowedRoles={['user', 'admin']}>
                        <UserHome />
                    </AuthGuard>
                } />
                
                <Route path="map" element={
                    <AuthGuard allowedRoles={['user', 'admin']}>
                        <UserMap />
                    </AuthGuard>
                } />

                  <Route path="shops" element={
                    <AuthGuard allowedRoles={['user', 'admin']}>
                        <UserShops />
                    </AuthGuard>
                } />
                  <Route path="house" element={
                    <AuthGuard allowedRoles={['user', 'admin']}>
                        <UserHouses />
                    </AuthGuard>
                } />

                    <Route path="jobs" element={
                    <AuthGuard allowedRoles={['user', 'admin']}>
                        <UserJobs />
                    </AuthGuard>
                } />

                <Route path="profile" element={
                    <AuthGuard allowedRoles={['user', 'admin']}>
                        <UserProfile />
                    </AuthGuard>
                } />

                {/* Shop Routes */}
                <Route path="shops" element={
                    <AuthGuard allowedRoles={['user', 'admin']}>
                        <UserShops />
                    </AuthGuard>
                } />
                
                <Route path="shops/create" element={
                    <AuthGuard allowedRoles={['user', 'admin']}>
                        <CreateShop />
                    </AuthGuard>
                } />

                {/* House Routes */}
                <Route path="houses" element={
                    <AuthGuard allowedRoles={['user', 'admin']}>
                        <UserHouses />
                    </AuthGuard>
                } />
                
                <Route path="houses/create" element={
                    <AuthGuard allowedRoles={['user', 'admin']}>
                        <CreateHouse />
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
                        <AdminBusinesses />
                    </AuthGuard>
                } />
                
                <Route path="admin/locations" element={
                    <AuthGuard allowedRoles={['admin']}>
                        <AdminLocations />
                    </AuthGuard>
                } />
                
                <Route path="admin/jobs" element={
                    <AuthGuard allowedRoles={['admin']}>
                        <AdminJobs />
                    </AuthGuard>
                } />
                
                <Route path="admin/users" element={
                    <AuthGuard allowedRoles={['admin']}>
                        <AdminUsers />
                    </AuthGuard>
                } />
                
                <Route path="admin/verify-shops" element={
                    <AuthGuard allowedRoles={['admin']}>
                        <AdminVerifyShops />
                    </AuthGuard>
                } />
                  <Route path="admin/verify-houses" element={
                    <AuthGuard allowedRoles={['admin']}>
                        <AdminVerifyHouses />
                    </AuthGuard>
                } />
                   <Route path="admin/categories" element={
                    <AuthGuard allowedRoles={['admin']}>
                        <ShopCategory />
                    </AuthGuard>
                } />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

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