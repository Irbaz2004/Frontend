// AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './app/context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

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
            bgcolor: '#F8F8F8'
        }}>
            <CircularProgress size={60} sx={{ color: '#0003b1' }} />
        </Box>
    );
}

function AppRoutes() {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
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

export default AppRoutes;