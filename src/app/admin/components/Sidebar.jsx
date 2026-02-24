import React, { useState } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Avatar,
    Typography,
    Divider,
    Collapse,
    Chip
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Store as StoreIcon,
    Church as ChurchIcon,
    Work as WorkIcon,
    Verified as VerifiedIcon,
    Assessment as AssessmentIcon,
    Settings as SettingsIcon,
    ExpandLess,
    ExpandMore,
    Logout as LogoutIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useNotifications } from '../../../hooks/useNotifications';

const drawerWidth = 280;

export default function AdminSidebar({ mobileOpen, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const [openMenus, setOpenMenus] = useState({});

    const handleMenuToggle = (menu) => {
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const handleNavigation = (path) => {
        navigate(path);
        if (mobileOpen) onClose();
    };

    const menuItems = [
        {
            title: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/app/admin/dashboard'
        },
        {
            title: 'Users',
            icon: <PeopleIcon />,
            path: '/app/admin/users'
        },
        {
            title: 'Verifications',
            icon: <VerifiedIcon />,
            path: '/app/admin/verifications',
            badge: unreadCount
        },
        {
            title: 'Businesses',
            icon: <StoreIcon />,
            path: '/app/admin/businesses'
        },
        {
            title: 'Worship Places',
            icon: <ChurchIcon />,
            path: '/app/admin/worship'
        },
        {
            title: 'Jobs',
            icon: <WorkIcon />,
            path: '/app/admin/jobs'
        },
        {
            title: 'Reports',
            icon: <AssessmentIcon />,
            path: '/app/admin/reports'
        },
        {
            title: 'Settings',
            icon: <SettingsIcon />,
            path: '/app/admin/settings'
        }
    ];

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                    sx={{
                        bgcolor: '#C00C0C',
                        width: 40,
                        height: 40,
                        fontWeight: 'bold'
                    }}
                >
                    NZ
                </Avatar>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                        Near<span style={{ color: '#C00C0C' }}>ZO</span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                        Admin Panel
                    </Typography>
                </Box>
            </Box>

            <Divider />

            {/* Admin Profile */}
            <Box sx={{ p: 2, bgcolor: '#f8f8f8', m: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#ff9800' }}>
                        {user?.fullName?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {user?.fullName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            Administrator
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Navigation */}
            <List sx={{ flex: 1, px: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            onClick={() => handleNavigation(item.path)}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    bgcolor: '#C00C0C15',
                                    color: '#C00C0C',
                                    '& .MuiListItemIcon-root': { color: '#C00C0C' }
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.title} />
                            {item.badge > 0 && (
                                <Chip
                                    label={item.badge}
                                    size="small"
                                    color="error"
                                    sx={{ height: 20, minWidth: 20 }}
                                />
                            )}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />

            {/* Logout */}
            <List sx={{ p: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={logout}
                        sx={{
                            borderRadius: 2,
                            color: '#f44336',
                            '&:hover': { bgcolor: '#f4433615' }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: '#f44336' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        borderRight: 'none'
                    }
                }}
            >
                {drawer}
            </Drawer>

            {/* Desktop drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        borderRight: 'none',
                        boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
                    }
                }}
                open
            >
                {drawer}
            </Drawer>
        </Box>
    );
}