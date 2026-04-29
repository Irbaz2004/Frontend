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
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Menu,
    MenuItem
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { LocationOnOutlined, HouseOutlined, StoreOutlined, GridViewOutlined } from '@mui/icons-material';
import { PlaceOutlined } from '@mui/icons-material';
import logo from '../assets/nearzologo.png';

// Role-based nav config - Profile removed from bottom nav (only in avatar menu)
const NAV_CONFIG = {
    user: [
        { label: 'Home', icon: <GridViewOutlined />, path: '/app/home' },
        { label: 'Map View', icon: <LocationOnOutlined />, path: '/app/map' },
        { label: 'Shops', icon: <StoreOutlined />, path: '/app/shops' },
        { label: 'Houses', icon: <HouseOutlined />, path: '/app/houses' },
        { label: 'Jobs', icon: <WorkIcon />, path: '/app/jobs' },
        // Profile removed from here - now only in avatar dropdown
    ],
    business: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/business/dashboard' },
        { label: 'Jobs', icon: <WorkIcon />, path: '/app/business/jobs' },
        // Profile removed from here
    ],
    admin: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/admin/dashboard' },
        { label: 'Shops', icon: <BusinessIcon />, path: '/app/admin/businesses' },
        { label: 'Categories', icon: <GridViewOutlined />, path: '/app/admin/categories' },
        { label: 'Jobs', icon: <WorkIcon />, path: '/app/admin/jobs' },
        { label: 'Verify Shops', icon: <VerifiedIcon />, path: '/app/admin/verify-shops' },
        { label: 'Verify Houses', icon: <VerifiedIcon />, path: '/app/admin/verify-houses' },
        { label: 'Locations', icon: <PlaceOutlined />, path: '/app/admin/locations' },
        { label: 'Users', icon: <PeopleIcon />, path: '/app/admin/users' },
    ],
};

// Sidebar width
const DRAWER_WIDTH = 260;
const COLLAPSED_DRAWER_WIDTH = 70;

function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    
    // Avatar menu state
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        const storedRole = localStorage.getItem('nearzo_role');
        const token = localStorage.getItem('nearzo_token');
        
        console.log('AppLayout - Stored role:', storedRole);
        console.log('AppLayout - Token exists:', !!token);
        console.log('AppLayout - Current path:', location.pathname);
        
        // If no token or role, redirect to login
        if (!token || !storedRole) {
            console.log('No auth found, redirecting to login');
            handleLogoutRedirect();
            return;
        }
        
        setRole(storedRole);
        
        // Redirect from root /app to role-appropriate default page
        if (location.pathname === '/app' || location.pathname === '/app/') {
            let defaultPath = '/app/home';
            if (storedRole === 'business') {
                defaultPath = '/app/business/dashboard';
            } else if (storedRole === 'admin') {
                defaultPath = '/app/admin/dashboard';
            }
            console.log('Redirecting from root /app to:', defaultPath);
            navigate(defaultPath, { replace: true });
        }
        
        setLoading(false);
    }, [navigate, location.pathname]);

    const handleLogoutRedirect = () => {
        localStorage.removeItem('nearzo_token');
        localStorage.removeItem('nearzo_role');
        localStorage.removeItem('nearzo_user');
        sessionStorage.clear();
        
        setTimeout(() => {
            window.location.href = '/app/login';
        }, 100);
    };

    const handleLogout = () => {
        setLogoutDialogOpen(false);
        handleLogoutRedirect();
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const toggleSidebarCollapse = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Avatar menu handlers
    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileClick = () => {
        handleMenuClose();
        navigate('/app/profile');
    };

    const handleLogoutClick = () => {
        handleMenuClose();
        setLogoutDialogOpen(true);
    };

    const isAdmin = role === 'admin';
    const navItems = role ? (NAV_CONFIG[role] || NAV_CONFIG.user) : [];

    const isActivePath = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // Render Sidebar for Admin
    const renderSidebar = () => {
        const sidebarContent = (
            <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: '#ffffff',
                borderRight: '1px solid #e8ecef',
            }}>
                {/* Logo Section */}
                <Box sx={{ 
                    p: sidebarCollapsed ? 1.5 : 2.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e8ecef'
                }}>
                    {!sidebarCollapsed && (
                        <Box
                            component="img"
                            src={logo}
                            alt="NearZO"
                            sx={{
                                width: '110px',
                                height: 'auto',
                                objectFit: 'contain',
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate('/')}
                        />
                    )}
                    {sidebarCollapsed && (
                        <Box
                            component="img"
                            src={logo}
                            alt="NearZO"
                            sx={{
                                width: '35px',
                                height: 'auto',
                                objectFit: 'contain',
                                cursor: 'pointer',
                                mx: 'auto'
                            }}
                            onClick={() => navigate('/')}
                        />
                    )}
                    <IconButton 
                        onClick={toggleSidebarCollapse} 
                        size="small"
                        sx={{ color: '#5a6e8a' }}
                    >
                        <ChevronLeftIcon sx={{ 
                            transform: sidebarCollapsed ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.3s',
                            fontSize: '1.2rem'
                        }} />
                    </IconButton>
                </Box>

                {/* Navigation Items */}
                <List sx={{ flex: 1, pt: 2, px: 1.5 }}>
                    {navItems.map((item) => (
                        <ListItem key={item.label} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                selected={isActivePath(item.path)}
                                sx={{
                                    minHeight: 40,
                                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                    px: sidebarCollapsed ? 1 : 2,
                                    py: 1,
                                    borderRadius: 1,
                                    '&.Mui-selected': {
                                        bgcolor: '#e8f0fe',
                                        '&:hover': {
                                            bgcolor: '#dce8fb',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: '#325fec',
                                        },
                                        '& .MuiListItemText-primary': {
                                            color: '#325fec',
                                            fontWeight: 600,
                                        }
                                    },
                                    '&:hover': {
                                        bgcolor: '#f5f5f5',
                                    }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: isActivePath(item.path) ? '#325fec' : '#5a6e8a',
                                        minWidth: 0,
                                        mr: sidebarCollapsed ? 0 : 2,
                                        justifyContent: 'center',
                                        '& svg': {
                                            fontSize: '1.25rem'
                                        }
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {!sidebarCollapsed && (
                                    <ListItemText 
                                        primary={item.label} 
                                        primaryTypographyProps={{
                                            fontSize: '0.8rem',
                                            fontFamily: '"Inter", sans-serif',
                                            fontWeight: isActivePath(item.path) ? 600 : 400,
                                            color: '#020402'
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ bgcolor: '#e8ecef', mx: 1.5 }} />

                {/* Bottom Actions - Logout button with theme color (no red) */}
                <List sx={{ pt: 1, px: 1.5, pb: 2 }}>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={() => setLogoutDialogOpen(true)}
                            sx={{
                                minHeight: 40,
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                px: sidebarCollapsed ? 1 : 2,
                                py: 1,
                                borderRadius: 1,
                                '&:hover': {
                                    bgcolor: '#e8f0fe',
                                }
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: '#5a6e8a',
                                    minWidth: 0,
                                    mr: sidebarCollapsed ? 0 : 2,
                                    justifyContent: 'center',
                                    '& svg': {
                                        fontSize: '1.25rem'
                                    }
                                }}
                            >
                                <LogoutIcon />
                            </ListItemIcon>
                            {!sidebarCollapsed && (
                                <ListItemText 
                                    primary="Logout" 
                                    primaryTypographyProps={{
                                        fontSize: '0.8rem',
                                        fontFamily: '"Inter", sans-serif',
                                        color: '#5a6e8a'
                                    }}
                                />
                            )}
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        );

        return (
            <>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        width: sidebarCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: sidebarCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            borderRight: '1px solid #e8ecef',
                            bgcolor: '#ffffff',
                            transition: 'width 0.3s ease',
                            overflowX: 'hidden',
                            boxShadow: 'none'
                        },
                    }}
                    open
                >
                    {sidebarContent}
                </Drawer>

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
                            bgcolor: '#ffffff',
                            borderRight: '1px solid #e8ecef'
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
            location.pathname === item.path || location.pathname.startsWith(item.path + '/')
        );

        const handleNavChange = (_, newValue) => {
            if (navItems[newValue]) {
                console.log('Navigating to:', navItems[newValue].path);
                navigate(navItems[newValue].path);
            }
        };

        return (
            <Paper
                elevation={0}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    borderRadius: 0,
                    borderTop: '1px solid #e8ecef',
                    background: '#ffffff',
                    boxShadow: 'none',
                }}
            >
                <BottomNavigation
                    value={currentIndex >= 0 ? currentIndex : 0}
                    onChange={handleNavChange}
                    showLabels
                    sx={{
                        height: 60,
                        background: 'transparent',
                        '& .MuiBottomNavigationAction-root': {
                            color: '#9e9e9e',
                            minWidth: 'auto',
                            padding: '6px 0',
                            transition: 'all 0.2s ease',
                            '&.Mui-selected': {
                                color: '#325fec',
                                '& .MuiBottomNavigationAction-label': {
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    fontFamily: '"Inter", sans-serif',
                                }
                            },
                            '&:hover': {
                                color: '#325fec',
                                transform: 'translateY(-2px)',
                            }
                        },
                        '& .MuiBottomNavigationAction-label': {
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            marginTop: '4px',
                        },
                        '& .MuiSvgIcon-root': {
                            fontSize: '1.3rem',
                        }
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
                    px: 2.5,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#ffffff',
                    borderBottom: '1px solid #e8ecef',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                    boxShadow: 'none'
                }}
            >
                <Box
                    component="img"
                    src={logo}
                    alt="NearZO"
                    sx={{
                        width: '100px',
                        height: 'auto',
                        objectFit: 'contain',
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/')}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Tooltip title="Notifications">
                        <IconButton size="small" sx={{ color: '#5a6e8a' }}>
                            <NotificationsIcon sx={{ fontSize: '1.2rem' }} />
                        </IconButton>
                    </Tooltip>
                    
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: '#5a6e8a',
                            textTransform: 'capitalize',
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '0.7rem',
                            display: { xs: 'none', sm: 'block' }
                        }}
                    >
                        {role}
                    </Typography>
                    
                    {/* Avatar with dropdown menu */}
                    <Tooltip title="Account">
                        <IconButton
                            onClick={handleAvatarClick}
                            size="small"
                            sx={{ p: 0 }}
                        >
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: '#e8f0fe',
                                    color: '#325fec',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    fontFamily: '"Inter", sans-serif',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        bgcolor: '#dce8fb',
                                    }
                                }}
                            >
                                {role ? role[0].toUpperCase() : 'U'}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    
                    {/* Dropdown Menu - Profile and Logout (no red colors) */}
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.08))',
                                mt: 1.5,
                                borderRadius: 2,
                                border: '1px solid #e8ecef',
                                minWidth: 160,
                                '& .MuiMenuItem-root': {
                                    px: 2,
                                    py: 1,
                                    fontSize: '0.8rem',
                                    fontFamily: '"Inter", sans-serif',
                                }
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleProfileClick}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <AccountCircleIcon fontSize="small" sx={{ color: '#325fec' }} />
                            </ListItemIcon>
                            Profile
                        </MenuItem>
                        <Divider sx={{ my: 0.5 }} />
                        <MenuItem onClick={handleLogoutClick}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <LogoutIcon fontSize="small" sx={{ color: '#5a6e8a' }} />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
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
                bgcolor: '#ffffff'
            }}>
                <CircularProgress sx={{ color: '#325fec' }} />
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
            <>
                <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
                    {renderSidebar()}
                    
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            ml: { xs: 0, md: 0 },
                            transition: 'margin 0.3s ease',
                            bgcolor: '#f8f9fa'
                        }}
                    >
                        {/* Admin Top Bar */}
                        <Box
                            sx={{
                                px: 3,
                                py: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                bgcolor: '#ffffff',
                                borderBottom: '1px solid #e8ecef',
                                position: 'sticky',
                                top: 0,
                                zIndex: 1100,
                                boxShadow: 'none'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <IconButton
                                    onClick={handleDrawerToggle}
                                    sx={{ display: { xs: 'flex', md: 'none' }, color: '#5a6e8a' }}
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        fontFamily: '"Alumni Sans", sans-serif',
                                        color: '#020402',
                                        fontSize: '1.3rem',
                                        letterSpacing: '1px'
                                    }}
                                >
                                    {navItems.find(item => isActivePath(item.path))?.label || 'Dashboard'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Tooltip title="Notifications">
                                    <IconButton size="small" sx={{ color: '#5a6e8a' }}>
                                        <NotificationsIcon sx={{ fontSize: '1.2rem' }} />
                                    </IconButton>
                                </Tooltip>
                                <Typography variant="caption" sx={{ 
                                    color: '#5a6e8a',
                                    fontFamily: '"Inter", sans-serif',
                                    fontSize: '0.7rem'
                                }}>
                                    Admin
                                </Typography>
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: '#e8f0fe',
                                        color: '#325fec',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
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

                {/* Logout Confirmation Dialog - No red colors */}
                <Dialog
                    open={logoutDialogOpen}
                    onClose={() => setLogoutDialogOpen(false)}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            boxShadow: 'none',
                            border: '1px solid #e8ecef'
                        }
                    }}
                >
                    <DialogTitle sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>
                        Confirm Logout
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.875rem' }}>
                            Are you sure you want to logout?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 0 }}>
                        <Button 
                            onClick={() => setLogoutDialogOpen(false)}
                            sx={{ textTransform: 'none', borderRadius: 1, color: '#5a6e8a' }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleLogout}
                            variant="contained"
                            sx={{ 
                                textTransform: 'none', 
                                borderRadius: 1,
                                bgcolor: '#325fec',
                                '&:hover': { bgcolor: '#1a4bcf' }
                            }}
                        >
                            Logout
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }

    // User/Business Layout with Bottom Navigation
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    background: '#f8f9fa',
                    pb: '60px',
                }}
            >
                {renderTopBar()}

                {/* Page Content */}
                <Box sx={{ flex: 1 }}>
                    <Outlet />
                </Box>

                {renderBottomNav()}
            </Box>

            {/* Logout Confirmation Dialog for User/Business - No red colors */}
            <Dialog
                open={logoutDialogOpen}
                onClose={() => setLogoutDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: 'none',
                        border: '1px solid #e8ecef'
                    }
                }}
            >
                <DialogTitle sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>
                    Confirm Logout
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.875rem' }}>
                        Are you sure you want to logout?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                        onClick={() => setLogoutDialogOpen(false)}
                        sx={{ textTransform: 'none', borderRadius: 1, color: '#5a6e8a' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleLogout}
                        variant="contained"
                        sx={{ 
                            textTransform: 'none', 
                            borderRadius: 1,
                            bgcolor: '#325fec',
                            '&:hover': { bgcolor: '#1a4bcf' }
                        }}
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AppLayout;