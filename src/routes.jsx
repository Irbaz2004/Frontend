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
import UserHome from './app/user/pages/Home';
import UserJobs from './app/user/pages/Jobs';
import UserShops from './app/user/pages/Shops';
import ShopDetails from './app/user/pages/[id]/ShopDetails';
import AppliedJobs from './app/user/pages/AppliedJobs';
import Notifications from './app/user/pages/Notifications';
import UserProfile from './app/user/pages/Profile';
import UserSearch from './app/user/pages/Search';
import UserDoctors from './app/user/pages/Doctors';
import UserJobDetails from './app/user/pages/[id]/JobDetails';
import UserDoctorDetails from './app/user/pages/[id]/DoctorDetails';

// Business pages
import BusinessDashboard from './app/business/pages/Dashboard';
import ShopManagement from './app/business/pages/ShopManagement';
import BusinessJobs from './app/business/pages/Jobs';
import BusinessApplications from './app/business/pages/Applications';
import BusinessProfile from './app/business/pages/Profile';

// Doctor pages
import DoctorDashboard from './app/doctor/pages/Dashboard';
import DoctorAppointments from './app/doctor/pages/Appointments';
import DoctorAvailability from './app/doctor/pages/Availability';
import DoctorPatients from './app/doctor/pages/Patients';
import DoctorProfile from './app/doctor/pages/Profile';

// Worship pages
import WorshipDashboard from './app/worship/pages/Dashboard';
import PlaceDetails from './app/worship/pages/PlaceDetails';
import PrayerTimes from './app/worship/pages/PrayerTimes';
import WorshipEvents from './app/worship/pages/Events';
import WorshipProfile from './app/worship/pages/Profile';

// Admin pages
import AdminDashboard from './app/admin/pages/Dashboard';
import AdminUsers from './app/admin/pages/Users';
import AdminBusinesses from './app/admin/pages/Businesses';
import AdminWorship from './app/admin/pages/Worship';
import AdminJobs from './app/admin/pages/Jobs';
import AdminVerifications from './app/admin/pages/Verifications';
import AdminReports from './app/admin/pages/Reports';
import AdminSettings from './app/admin/pages/Settings';

// Admin Layout (if you have a separate admin layout)
import AdminLayout from './app/admin/AdminLayout';

// Simple auth guard
function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem('nearzo_token');
    const role = localStorage.getItem('nearzo_role');

    if (!token) return <Navigate to="/app/login" replace />;
    
    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to correct home based on role
        const roleHome = { 
            user: '/app/user/home', 
            business: '/app/business/dashboard',
            doctor: '/app/doctor/dashboard',
            worship: '/app/worship/dashboard', 
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

            {/* App Shell - Main App Layout */}
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
                <Route path="user/search" element={<ProtectedRoute allowedRoles={['user']}><UserSearch /></ProtectedRoute>} />
                <Route path="user/doctors" element={<ProtectedRoute allowedRoles={['user']}><UserDoctors /></ProtectedRoute>} />
                <Route path="user/jobs/:id" element={<ProtectedRoute allowedRoles={['user']}><UserJobDetails /></ProtectedRoute>} />
                <Route path="user/doctors/:id" element={<ProtectedRoute allowedRoles={['user']}><UserDoctorDetails /></ProtectedRoute>} />

                {/* Business Routes */}
                <Route path="business/dashboard" element={<ProtectedRoute allowedRoles={['business']}><BusinessDashboard /></ProtectedRoute>} />
                <Route path="business/shop-management" element={<ProtectedRoute allowedRoles={['business']}><ShopManagement /></ProtectedRoute>} />
                <Route path="business/jobs" element={<ProtectedRoute allowedRoles={['business']}><BusinessJobs /></ProtectedRoute>} />
                <Route path="business/applications" element={<ProtectedRoute allowedRoles={['business']}><BusinessApplications /></ProtectedRoute>} />
                <Route path="business/profile" element={<ProtectedRoute allowedRoles={['business']}><BusinessProfile /></ProtectedRoute>} />

                {/* Doctor Routes */}
                <Route path="doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
                <Route path="doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
                <Route path="doctor/availability" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAvailability /></ProtectedRoute>} />
                <Route path="doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPatients /></ProtectedRoute>} />
                <Route path="doctor/profile" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>} />

                {/* Worship Routes */}
                <Route path="worship/dashboard" element={<ProtectedRoute allowedRoles={['worship']}><WorshipDashboard /></ProtectedRoute>} />
                <Route path="worship/details" element={<ProtectedRoute allowedRoles={['worship']}><PlaceDetails /></ProtectedRoute>} />
                <Route path="worship/prayer-times" element={<ProtectedRoute allowedRoles={['worship']}><PrayerTimes /></ProtectedRoute>} />
                <Route path="worship/events" element={<ProtectedRoute allowedRoles={['worship']}><WorshipEvents /></ProtectedRoute>} />
                <Route path="worship/profile" element={<ProtectedRoute allowedRoles={['worship']}><WorshipProfile /></ProtectedRoute>} />
            </Route>

            {/* Admin Routes - Separate Layout (Optional) */}
            <Route path="/app/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="businesses" element={<AdminBusinesses />} />
                <Route path="worship" element={<AdminWorship />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="verifications" element={<AdminVerifications />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;