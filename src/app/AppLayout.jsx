import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    Avatar,
    Typography,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import StoreIcon from '@mui/icons-material/Store';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddBoxIcon from '@mui/icons-material/AddBox';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Role-based nav config
const NAV_CONFIG = {
    user: [
        { label: 'Home', icon: <HomeIcon />, path: '/app/user/home' },
        { label: 'Jobs', icon: <WorkIcon />, path: '/app/user/jobs' },
        { label: 'Shops', icon: <StoreIcon />, path: '/app/user/shops' },
        { label: 'Profile', icon: <PersonIcon />, path: '/app/user/profile' },
    ],
    shop: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/shop/dashboard' },
        { label: 'Post Job', icon: <AddBoxIcon />, path: '/app/shop/post-job' },
        { label: 'Applications', icon: <PeopleIcon />, path: '/app/shop/applications' },
        { label: 'Profile', icon: <PersonIcon />, path: '/app/shop/profile' },
    ],
    admin: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/admin/dashboard' },
        { label: 'Verify', icon: <VerifiedIcon />, path: '/app/admin/verify-shops' },
        { label: 'Users', icon: <PeopleIcon />, path: '/app/admin/users' },
        { label: 'Reports', icon: <AssessmentIcon />, path: '/app/admin/reports' },
    ],
};

function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [role, setRole] = useState('user');

    useEffect(() => {
        const stored = localStorage.getItem('nearzo_role') || 'user';
        setRole(stored);
    }, []);

    const navItems = NAV_CONFIG[role] || NAV_CONFIG.user;

    const currentIndex = navItems.findIndex(item =>
        location.pathname.startsWith(item.path)
    );

    const handleNavChange = (_, newValue) => {
        navigate(navItems[newValue].path);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                background: '#F8F8F8', // Consistent with landing
                pb: '80px', // slightly more space for bottom nav
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
                        gap: 0.5
                    }}
                >
                    Near<span style={{ color: '#C00C0C' }}>ZO</span>
                </Typography>

                <Avatar
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'rgba(192, 12, 12, 0.1)',
                        color: '#C00C0C',
                        fontSize: '0.8rem',
                        fontWeight: 700
                    }}
                >
                    {role[0].toUpperCase()}
                </Avatar>
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
                        },
                        '& .MuiBottomNavigationAction-label': {
                            fontFamily: '"Outfit", sans-serif',
                            fontSize: '0.7rem',
                            fontWeight: 600,
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
        </Box>
    );
}

export default AppLayout;
