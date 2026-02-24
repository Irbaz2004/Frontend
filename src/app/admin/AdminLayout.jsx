import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Badge,
    Avatar,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    AccountCircle as AccountIcon
} from '@mui/icons-material';
import AdminSidebar from './components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

export default function AdminLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafafa' }}>
            {/* Sidebar */}
            <AdminSidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - 280px)` },
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        bgcolor: 'white',
                        color: 'text.primary',
                        borderBottom: '1px solid #eee'
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                            {/* Page title will be handled by child routes */}
                        </Typography>

                        {/* Notifications */}
                        <Tooltip title="Notifications">
                            <IconButton color="inherit" sx={{ mr: 2 }}>
                                <Badge badgeContent={unreadCount} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        {/* Profile */}
                        <Box>
                            <IconButton
                                onClick={handleMenuOpen}
                                sx={{ p: 0 }}
                            >
                                <Avatar sx={{ bgcolor: '#ff9800' }}>
                                    {user?.fullName?.charAt(0)}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right'
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right'
                                }}
                            >
                                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                                <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Page Content */}
                <Box sx={{ p: 4, flex: 1 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}