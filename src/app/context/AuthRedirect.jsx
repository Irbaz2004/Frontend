// context/AuthRedirect.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function AuthRedirect() {
    const { isAuthenticated, role, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('AuthRedirect - Checking redirect:', { isAuthenticated, role, loading });
        
        // Don't redirect while still loading
        if (loading) {
            console.log('AuthRedirect - Still loading...');
            return;
        }

        if (isAuthenticated && role) {
            console.log('AuthRedirect - User already authenticated, redirecting based on role:', role);
            
            const roleRoutes = {
                user: '/app/user/home',
                business: '/app/business/dashboard',
                admin: '/app/admin/dashboard',
            };
            
            const redirectPath = roleRoutes[role] || '/app/splash';
            console.log('AuthRedirect - Redirecting to:', redirectPath);
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, role, loading, navigate]);

    return null;
}