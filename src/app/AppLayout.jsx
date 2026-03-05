// AppLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    Avatar,
    Typography,
    Button,
    CircularProgress
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Role-based nav config
const NAV_CONFIG = {
    user: [
        { label: 'Home', icon: <HomeIcon />, path: '/app/user/home' },
    ],
    business: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/business/dashboard' },
    ],
    admin: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/admin/dashboard' },
    ],
};

function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get role from localStorage (set during login)
        const storedRole = localStorage.getItem('nearzo_role');
        const token = localStorage.getItem('nearzo_token');
        
        console.log('AppLayout - Stored role:', storedRole);
        console.log('AppLayout - Token exists:', !!token);
        console.log('AppLayout - Current path:', location.pathname);
        
        if (!token || !storedRole) {
            // No token or role found, redirect to login
            console.log('No auth found, redirecting to login');
            navigate('/app/login', { replace: true });
            return;
        }
        
        setRole(storedRole);
        setLoading(false);
    }, [navigate, location.pathname]); // Add location.pathname to dependency array

    // Get navigation items based on role
    const navItems = role ? (NAV_CONFIG[role] || NAV_CONFIG.user) : [];

    // Find current index based on path
    const currentIndex = navItems.findIndex(item =>
        location.pathname.startsWith(item.path)
    );

    const handleNavChange = (_, newValue) => {
        if (navItems[newValue]) {
            navigate(navItems[newValue].path);
        }
    };

    const handleLogout = () => {
        // Clear all auth data
        localStorage.removeItem('nearzo_token');
        localStorage.removeItem('nearzo_role');
        localStorage.removeItem('nearzo_user');
        navigate('/app/login', { replace: true });
    };

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                bgcolor: '#F8F8F8'
            }}>
                <CircularProgress sx={{ color: '#0003b1' }} />
            </Box>
        );
    }

    // Don't render if no role (will redirect in useEffect)
    if (!role) {
        return null;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                background: '#F8F8F8',
                pb: '80px',
            }}
        >
            {/* Professional App Header */}
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'white',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 900,
                        fontFamily: '"Outfit", sans-serif',
                        letterSpacing: '-1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/')}
                >
                    Near<span style={{ color: '#C00C0C' }}>ZO</span>
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: '#666',
                            textTransform: 'capitalize',
                            display: { xs: 'none', sm: 'block' }
                        }}
                    >
                        {role}
                    </Typography>
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'rgba(192, 12, 12, 0.1)',
                            color: '#C00C0C',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                bgcolor: 'rgba(192, 12, 12, 0.2)',
                            }
                        }}
                        onClick={() => navigate(`/app/${role}/profile`)}
                    >
                        {role ? role[0].toUpperCase() : 'U'}
                    </Avatar>
                </Box>
            </Box>

            {/* Page Content */}
            <Box sx={{ flex: 1 }}>
                <Outlet />
            </Box>

            {/* Bottom Navigation with Glassmorphism */}
            <Paper
                elevation={0}
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    zIndex: 1000,
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
            >
                <BottomNavigation
                    value={currentIndex >= 0 ? currentIndex : 0}
                    onChange={handleNavChange}
                    showLabels
                    sx={{
                        height: 70,
                        background: 'transparent',
                        '& .MuiBottomNavigationAction-root': {
                            color: '#9e9e9e',
                            minWidth: 'auto',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&.Mui-selected': {
                                color: '#C00C0C',
                                '& .MuiBottomNavigationAction-label': {
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                }
                            },
                            '&:hover': {
                                color: '#C00C0C',
                                transform: 'translateY(-2px)',
                            }
                        },
                        '& .MuiBottomNavigationAction-label': {
                            fontFamily: '"Outfit", sans-serif',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            mt: 0.5,
                        },
                    }}
                >
                    {navItems.map((item, index) => (
                        <BottomNavigationAction
                            key={item.label}
                            label={item.label}
                            icon={item.icon}
                        />
                    ))}
                </BottomNavigation>
            </Paper>

            {/* Optional: Add a logout button for development */}
            {process.env.NODE_ENV === 'development' && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 100,
                        right: 20,
                        zIndex: 2000,
                    }}
                >
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handleLogout}
                        sx={{
                            borderRadius: '20px',
                            borderColor: '#ccc',
                            color: '#666',
                            fontSize: '0.7rem',
                            bgcolor: 'white',
                            '&:hover': {
                                borderColor: '#C00C0C',
                                color: '#C00C0C',
                            }
                        }}
                    >
                        Logout (Dev)
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default AppLayout;