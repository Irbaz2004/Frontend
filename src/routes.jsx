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
import UserShops from './app/user/Shops';
import ShopDetails from './app/user/ShopDetails';
import AppliedJobs from './app/user/AppliedJobs';
import Notifications from './app/user/Notifications';
import UserProfile from './app/user/Profile';

// Shop pages
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

    if (!token) return <Navigate to="/app/login" replace />;
    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to correct home based on role
        const roleHome = { user: '/app/user/home', shop: '/app/shop/dashboard', admin: '/app/admin/dashboard' };
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
                <Route path="user/jobs" element={<ProtectedRoute allowedRoles={['user']}><UserJobs /></ProtectedRoute>} />
                <Route path="user/shops" element={<ProtectedRoute allowedRoles={['user']}><UserShops /></ProtectedRoute>} />
                <Route path="user/shops/:id" element={<ProtectedRoute allowedRoles={['user']}><ShopDetails /></ProtectedRoute>} />
                <Route path="user/applied-jobs" element={<ProtectedRoute allowedRoles={['user']}><AppliedJobs /></ProtectedRoute>} />
                <Route path="user/notifications" element={<ProtectedRoute allowedRoles={['user']}><Notifications /></ProtectedRoute>} />
                <Route path="user/profile" element={<ProtectedRoute allowedRoles={['user']}><UserProfile /></ProtectedRoute>} />

                {/* Shop Routes */}
                <Route path="shop/dashboard" element={<ProtectedRoute allowedRoles={['shop']}><ShopDashboard /></ProtectedRoute>} />
                <Route path="shop/post-job" element={<ProtectedRoute allowedRoles={['shop']}><PostJob /></ProtectedRoute>} />
                <Route path="shop/my-jobs" element={<ProtectedRoute allowedRoles={['shop']}><MyJobs /></ProtectedRoute>} />
                <Route path="shop/applications" element={<ProtectedRoute allowedRoles={['shop']}><ShopApplications /></ProtectedRoute>} />
                <Route path="shop/profile" element={<ProtectedRoute allowedRoles={['shop']}><ShopProfile /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="admin/verify-shops" element={<ProtectedRoute allowedRoles={['admin']}><VerifyShops /></ProtectedRoute>} />
                <Route path="admin/shops" element={<ProtectedRoute allowedRoles={['admin']}><AdminShops /></ProtectedRoute>} />
                <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
                <Route path="admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><AdminJobs /></ProtectedRoute>} />
                <Route path="admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
