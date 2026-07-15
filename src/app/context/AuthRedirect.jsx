// context/AuthRedirect.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function AuthRedirect({ children }) {
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
                user: '/app/home',
                admin: '/app/admin/dashboard',
            };
            
            const redirectPath = roleRoutes[role] || '/app/home';
            console.log('AuthRedirect - Redirecting to:', redirectPath);
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, role, loading, navigate]);

    // If not authenticated, render children (login/register page)
    if (!isAuthenticated && !loading) {
        return children;
    }

    return null;
}