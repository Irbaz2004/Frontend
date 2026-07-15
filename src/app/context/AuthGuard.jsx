// context/AuthGuard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Box, CircularProgress } from '@mui/material';

export default function AuthGuard({ children, allowedRoles }) {
    const { isAuthenticated, role, loading } = useAuth();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        console.log('AuthGuard - Auth state:', { 
            isAuthenticated, 
            role, 
            allowedRoles, 
            loading 
        });
        
        // Wait for loading to complete
        if (loading) {
            console.log('AuthGuard - Still loading...');
            return;
        }

        // Check if authenticated
        if (!isAuthenticated) {
            console.log('AuthGuard - Not authenticated, redirecting to login');
            navigate('/app/login', { replace: true });
            return;
        }

        // Check if role is allowed
        if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
            console.log('AuthGuard - Role not allowed:', role);
            // Redirect to appropriate dashboard based on role
            const roleRoutes = {
                user: '/app/home',
                admin: '/app/admin/dashboard',
            };
            const redirectPath = roleRoutes[role] || '/app/home';
            console.log('AuthGuard - Redirecting to:', redirectPath);
            navigate(redirectPath, { replace: true });
            return;
        }

        // If we get here, user is authenticated and role is allowed
        console.log('AuthGuard - Access granted for role:', role);
        setIsChecking(false);
    }, [isAuthenticated, role, loading, allowedRoles, navigate]);

    // Show loading spinner while checking
    if (loading || isChecking) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: '#F8F8F8'
            }}>
                <CircularProgress size={60} sx={{ color: '#325fec' }} />
            </Box>
        );
    }

    // If authenticated and role allowed, render children
    if (isAuthenticated && (!allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(role))) {
        return children;
    }

    // Return null while redirecting
    return null;
}