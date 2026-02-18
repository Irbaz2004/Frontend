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
                background: '#f5f5f5',
                pb: '70px', // space for bottom nav
            }}
        >
            {/* Page Content */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <Outlet />
            </Box>

            {/* Bottom Navigation */}
            <Paper
                elevation={8}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    borderRadius: '20px 20px 0 0',
                    overflow: 'hidden',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
                }}
            >
                <BottomNavigation
                    value={currentIndex >= 0 ? currentIndex : 0}
                    onChange={handleNavChange}
                    sx={{
                        height: 70,
                        background: '#fff',
                        '& .MuiBottomNavigationAction-root': {
                            color: '#9e9e9e',
                            minWidth: 'auto',
                            transition: 'all 0.3s ease',
                            '&.Mui-selected': {
                                color: '#C00C0C',
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
