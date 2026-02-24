import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Badge,
    Avatar,
    Box,
    Tooltip,
    Menu,
    MenuItem,
    Divider
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    AccountCircle as AccountIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import { useNotifications } from '../../../hooks/useNotifications';

export default function AdminHeader({ onMenuClick }) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();

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
                    edge="start"
                    onClick={onMenuClick}
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
                        <MenuItem onClick={handleMenuClose}>
                            <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose}>
                            <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                            Settings
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: '#f44336' }}>
                            <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}