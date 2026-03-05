// AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Landing
import LandingPage from './landing/LandingPage';

// Splash
import SplashScreen from './app/SplashScreen';

// Auth
import Login from './app/auth/Login';
import Register from './app/auth/Register';

// App Layout
import AppLayout from './app/AppLayout';

// User pages
import UserHome from './app/user/Home';
import UserJobs from './app/user/Jobs';
import UserShops from './app/commonPages/Shops';
import ShopDetails from './app/commonPages/ShopDetails';
import AppliedJobs from './app/user/AppliedJobs';
import Notifications from './app/user/Notifications';
import UserProfile from './app/user/Profile';

// Shop/Business pages
import ShopDashboard from './app/shop/Dashboard';
import PostJob from './app/shop/PostJob';
import MyJobs from './app/shop/MyJobs';
import ShopApplications from './app/shop/Applications';
import ShopProfile from './app/shop/Profile';

// Admin pages
import AdminDashboard from './app/admin/Dashboard';
import VerifyShops from './app/admin/VerifyShops';
import AdminUsers from './app/admin/Users';
import AdminShops from './app/admin/Shops';
import AdminJobs from './app/admin/Jobs';
import Reports from './app/admin/Reports';

// Simple auth guard
function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem('nearzo_token');
    const role = localStorage.getItem('nearzo_role');

    console.log('ProtectedRoute - Token:', !!token, 'Role:', role, 'Allowed:', allowedRoles);

    if (!token) {
        console.log('No token, redirecting to login');
        return <Navigate to="/app/login" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(role)) {
        console.log('Role not allowed, redirecting to appropriate home');
        // Redirect to correct home based on role
        const roleHome = { 
            user: '/app/user/home', 
            business: '/app/business/dashboard', 
            admin: '/app/admin/dashboard' 
        };
        return <Navigate to={roleHome[role] || '/app/login'} replace />;
    }
    
    return children;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Splash */}
            <Route path="/app/splash" element={<SplashScreen />} />

            {/* Auth */}
            <Route path="/app/login" element={<Login />} />
            <Route path="/app/register" element={<Register />} />

            {/* App Shell */}
            <Route path="/app" element={<AppLayout />}>
                {/* Default redirect to splash */}
                <Route index element={<Navigate to="/app/splash" replace />} />

                {/* User Routes */}
                <Route path="user/home" element={<ProtectedRoute allowedRoles={['user']}><UserHome /></ProtectedRoute>} />
               
                {/* Business Routes - Note: using 'business' not 'shop' */}
                <Route path="business/dashboard" element={<ProtectedRoute allowedRoles={['business']}><ShopDashboard /></ProtectedRoute>} />
              
                {/* Admin Routes */}
                <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                 </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;