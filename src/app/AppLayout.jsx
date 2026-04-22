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
    CircularProgress,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    IconButton,
    Tooltip,
    useMediaQuery,
    useTheme
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';

// Role-based nav config
const NAV_CONFIG = {
    user: [
        { label: 'Home', icon: <HomeIcon />, path: '/app/user/home' },
        { label: 'Search', icon: <SearchIcon />, path: '/app/user/search' },
        { label: 'Profile', icon: <AccountCircleIcon />, path: '/app/user/profile' },
    ],
    business: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/business/dashboard' },
        { label: 'Jobs', icon: <WorkIcon />, path: '/app/business/jobs' },
        { label: 'Profile', icon: <AccountCircleIcon />, path: '/app/business/profile' },
    ],
    admin: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/admin/dashboard' },
        { label: 'Businesses', icon: <BusinessIcon />, path: '/app/admin/businesses' },
        { label: 'Doctors', icon: <LocalHospitalIcon />, path: '/app/admin/doctors' },
        { label: 'Jobs', icon: <WorkIcon />, path: '/app/admin/jobs' },
        { label: 'Users', icon: <PeopleIcon />, path: '/app/admin/users' },
        { label: 'Verify Shops', icon: <VerifiedIcon />, path: '/app/admin/verify-shops' },
    ],
};

// Sidebar width
const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 80;

function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    }, [navigate, location.pathname]);

    const handleLogout = () => {
        // Clear all auth data
        localStorage.removeItem('nearzo_token');
        localStorage.removeItem('nearzo_role');
        localStorage.removeItem('nearzo_user');
        navigate('/app/login', { replace: true });
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const toggleSidebarCollapse = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Check if user is admin
    const isAdmin = role === 'admin';
    const navItems = role ? (NAV_CONFIG[role] || NAV_CONFIG.user) : [];

    // Get current active path
    const isActivePath = (path) => {
        return location.pathname.startsWith(path);
    };

    // Render Sidebar for Admin
    const renderSidebar = () => {
        const sidebarContent = (
            <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: 'black',
                color: 'white',

            }}>
                {/* Logo Section */}
                <Box sx={{ 
                    p: sidebarCollapsed ? 2 : 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {!sidebarCollapsed && (
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 900,
                                fontFamily: '"Outfit", sans-serif',
                                letterSpacing: '-1px',
                                background: 'linear-gradient(135deg, #fff 0%, #C00C0C 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate('/')}
                        >
                            Near<span style={{ color: '#C00C0C' }}>ZO</span>
                        </Typography>
                    )}
                    {sidebarCollapsed && (
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 900,
                                color: '#C00C0C',
                                cursor: 'pointer',
                                mx: 'auto'
                            }}
                            onClick={() => navigate('/')}
                        >
                            NZ
                        </Typography>
                    )}
                    <IconButton 
                        onClick={toggleSidebarCollapse} 
                        size="small"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                        <ChevronLeftIcon sx={{ 
                            transform: sidebarCollapsed ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.3s'
                        }} />
                    </IconButton>
                </Box>

                {/* User Info Section */}
                <Box sx={{ 
                    p: sidebarCollapsed ? 2 : 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Avatar
                        sx={{
                            bgcolor: '#C00C0C',
                            width: sidebarCollapsed ? 40 : 50,
                            height: sidebarCollapsed ? 40 : 50,
                        }}
                    >
                        {role ? role[0].toUpperCase() : 'A'}
                    </Avatar>
                    {!sidebarCollapsed && (
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Admin User
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Administrator
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Navigation Items */}
                <List sx={{ flex: 1, pt: 2 }}>
                    {navItems.map((item) => (
                        <ListItem key={item.label} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                selected={isActivePath(item.path)}
                                sx={{
                                    minHeight: 48,
                                    justifyContent: sidebarCollapsed ? 'center' : 'initial',
                                    px: sidebarCollapsed ? 2 : 3,
                                    mx: sidebarCollapsed ? 1 : 1.5,
                                    borderRadius: 2,
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(192, 12, 12, 0.15)',
                                        '&:hover': {
                                            bgcolor: 'rgba(192, 12, 12, 0.25)',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: '#C00C0C',
                                        },
                                        '& .MuiListItemText-primary': {
                                            color: '#C00C0C',
                                            fontWeight: 600,
                                        }
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                    }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: isActivePath(item.path) ? '#C00C0C' : 'rgba(255,255,255,0.7)',
                                        minWidth: 0,
                                        mr: sidebarCollapsed ? 0 : 2,
                                        justifyContent: 'center',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {!sidebarCollapsed && (
                                    <ListItemText 
                                        primary={item.label} 
                                        primaryTypographyProps={{
                                            fontSize: '0.9rem',
                                            fontWeight: isActivePath(item.path) ? 600 : 400
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

                {/* Bottom Actions */}
                <List sx={{ pt: 1 }}>
                  
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={handleLogout}
                            sx={{
                                minHeight: 48,
                                justifyContent: sidebarCollapsed ? 'center' : 'initial',
                                px: sidebarCollapsed ? 2 : 3,
                                mx: sidebarCollapsed ? 1 : 1.5,
                                borderRadius: 2,
                                '&:hover': {
                                    bgcolor: 'rgba(192, 12, 12, 0.1)',
                                }
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: 'rgba(255,255,255,0.7)',
                                    minWidth: 0,
                                    mr: sidebarCollapsed ? 0 : 2,
                                    justifyContent: 'center',
                                }}
                            >
                                <LogoutIcon />
                            </ListItemIcon>
                            {!sidebarCollapsed && <ListItemText primary="Logout" />}
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        );

        return (
            <>
                {/* Desktop Sidebar */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        width: sidebarCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: sidebarCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            borderRight: 'none',
                            bgcolor: '#1a1a2e',
                            transition: 'width 0.3s ease',
                            overflowX: 'hidden',
                        },
                    }}
                    open
                >
                    {sidebarContent}
                </Drawer>

                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            bgcolor: '#1a1a2e',
                        },
                    }}
                >
                    {sidebarContent}
                </Drawer>
            </>
        );
    };

    // Render Bottom Navigation for User/Business
    const renderBottomNav = () => {
        const currentIndex = navItems.findIndex(item =>
            location.pathname.startsWith(item.path)
        );

        const handleNavChange = (_, newValue) => {
            if (navItems[newValue]) {
                navigate(navItems[newValue].path);
            }
        };

        return (
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
                    background: 'rgba(255, 255, 255, 0.95)',
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
                    {navItems.map((item) => (
                        <BottomNavigationAction
                            key={item.label}
                            label={item.label}
                            icon={item.icon}
                        />
                    ))}
                </BottomNavigation>
            </Paper>
        );
    };

    // Render Top App Bar (for non-admin)
    const renderTopBar = () => {
        if (isAdmin) return null;

        return (
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
                    <Tooltip title="Notifications">
                        <IconButton size="small" sx={{ color: '#666' }}>
                            <NotificationsIcon />
                        </IconButton>
                    </Tooltip>
                    
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
        );
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

    // Admin Layout with Sidebar
    if (isAdmin) {
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F5F5' }}>
                {renderSidebar()}
                
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        ml: { xs: 0, md: 0 },
                        transition: 'margin 0.3s ease',
                    }}
                >
                    {/* Admin Top Bar */}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton
                                onClick={handleDrawerToggle}
                                sx={{ display: { xs: 'flex', md: 'none' } }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    fontFamily: '"Outfit", sans-serif',
                                    color: '#1a1a2e'
                                }}
                            >
                                {navItems.find(item => isActivePath(item.path))?.label || 'Dashboard'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Tooltip title="Notifications">
                                <IconButton size="small">
                                    <NotificationsIcon />
                                </IconButton>
                            </Tooltip>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                                Admin
                            </Typography>
                            <Avatar
                                sx={{
                                    width: 35,
                                    height: 35,
                                    bgcolor: '#C00C0C',
                                    cursor: 'pointer'
                                }}
                                onClick={() => navigate('/app/admin/profile')}
                            >
                                A
                            </Avatar>
                        </Box>
                    </Box>

                    {/* Page Content */}
                    <Box sx={{ p: 3 }}>
                        <Outlet />
                    </Box>
                </Box>
            </Box>
        );
    }

    // User/Business Layout with Bottom Navigation
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
            {renderTopBar()}

            {/* Page Content */}
            <Box sx={{ flex: 1 }}>
                <Outlet />
            </Box>

            {renderBottomNav()}

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