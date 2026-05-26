// AppLayout.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Avatar,
    Typography,
    Button,
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
    MenuItem,
    Badge,
    CircularProgress,
    Snackbar,
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
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import StoreIcon from '@mui/icons-material/Store';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import { LocationOnOutlined, HouseOutlined, StoreOutlined, GridViewOutlined } from '@mui/icons-material';
import { PlaceOutlined } from '@mui/icons-material';
import logo from '../assets/nearzologo.png';
import loadingGif from '../assets/Radar.gif';
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '../services/notification';
import { useAuth } from './context/AuthContext';

// ─── HAPTIC UTILITY ──────────────────────────────────────────────────────────
const HAPTIC_PATTERNS = {
    tap: [4],
    select: 12,
    action: [10, 30, 10],
    warning: [20, 60, 20],
    success: [8, 20, 8, 20, 8],
};

const haptic = (type = 'tap') => {
    if (!navigator.vibrate) return;
    navigator.vibrate(HAPTIC_PATTERNS[type] ?? HAPTIC_PATTERNS.tap);
};
// ─────────────────────────────────────────────────────────────────────────────

const NAV_CONFIG = {
    user: [
        { label: 'Home', icon: <GridViewOutlined />, path: '/app/home' },
        { label: 'Map', icon: <LocationOnOutlined />, path: '/app/map' },
        { label: 'Shops', icon: <StoreOutlined />, path: '/app/shops' },
        { label: 'Houses', icon: <HouseOutlined />, path: '/app/houses' },
        { label: 'Jobs', icon: <WorkIcon />, path: '/app/jobs' },
    ],
    business: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/business/dashboard' },
        { label: 'Jobs', icon: <WorkIcon />, path: '/app/business/jobs' },
    ],
    admin: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/admin/dashboard' },
        { label: 'Shops', icon: <BusinessIcon />, path: '/app/admin/businesses' },
        { label: 'Categories', icon: <GridViewOutlined />, path: '/app/admin/categories' },
        { label: 'Jobs', icon: <WorkIcon />, path: '/app/admin/jobs' },
        { label: 'Verify Shops', icon: <VerifiedIcon />, path: '/app/admin/verify-shops' },
        { label: 'Verify Houses', icon: <VerifiedIcon />, path: '/app/admin/verify-houses' },
        { label: 'Shop Ads', icon: <StoreOutlined />, path: '/app/admin/shop-ads' },
        { label: 'Locations', icon: <PlaceOutlined />, path: '/app/admin/locations' },
        { label: 'Users', icon: <PeopleIcon />, path: '/app/admin/users' },
    ],
};

const DRAWER_WIDTH = 256;
const COLLAPSED_DRAWER_WIDTH = 68;
const BOTTOM_NAV_HEIGHT = 66;
const TOP_BAR_HEIGHT = 64;

const getUserInitial = (role, user) => {
    if (user?.full_name) return user.full_name.charAt(0).toUpperCase();
    return role ? role.charAt(0).toUpperCase() : 'U';
};

function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useAuth();

    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

    // ─── PWA INSTALL ────────────────────────────────────────────────────────────
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [installSnackbarOpen, setInstallSnackbarOpen] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        window.addEventListener('appinstalled', () => {
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        haptic('action');
        if (!deferredPrompt) {
            // If prompt not available (already installed or not supported), show info snackbar
            setInstallSnackbarOpen(true);
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };
    // ───────────────────────────────────────────────────────────────────────────

    const open = Boolean(anchorEl);
    const notificationsOpen = Boolean(notificationsAnchorEl);

    const loadNotifications = async () => {
        setNotificationsLoading(true);
        try {
            const data = await getNotifications(100, 0);
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setNotificationsLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const data = await getUnreadCount();
            setUnreadCount(data.unread_count || 0);
        } catch (err) {
            console.error('Failed to load unread count:', err);
        }
    };

    useEffect(() => {
        const storedRole = localStorage.getItem('nearzo_role');
        const token = localStorage.getItem('nearzo_token');
        if (!token || !storedRole) {
            handleLogoutRedirect();
            return;
        }
        setRole(storedRole);
        if (location.pathname === '/app' || location.pathname === '/app/') {
            let defaultPath = '/app/home';
            if (storedRole === 'business') defaultPath = '/app/business/dashboard';
            else if (storedRole === 'admin') defaultPath = '/app/admin/dashboard';
            navigate(defaultPath, { replace: true });
        }
        setLoading(false);
        loadUnreadCount();
    }, [navigate, location.pathname]);

    const handleLogoutRedirect = () => {
        localStorage.removeItem('nearzo_token');
        localStorage.removeItem('nearzo_role');
        localStorage.removeItem('nearzo_user');
        sessionStorage.clear();
        setTimeout(() => { window.location.href = '/app/login'; }, 100);
    };

    const handleLogout = () => {
        haptic('warning');
        setLogoutDialogOpen(false);
        handleLogoutRedirect();
    };

    const isAdmin = role === 'admin';
    const navItems = role ? (NAV_CONFIG[role] || NAV_CONFIG.user) : [];

    const isActivePath = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    const handleNotificationClick = async (notification) => {
        haptic('select');
        if (!notification.is_read) {
            await markNotificationRead(notification.id);
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setNotificationDialogOpen(false);
        setNotificationsAnchorEl(null);
        if (notification.reference_type === 'shop') navigate(`/app/shops/${notification.reference_id}`);
        else if (notification.reference_type === 'house') navigate(`/app/houses/${notification.reference_id}`);
        else if (notification.reference_type === 'job') navigate(`/app/jobs/${notification.reference_id}`);
    };

    const handleMarkAllRead = async () => {
        haptic('success');
        try {
            await markAllNotificationsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const openNotificationsDialog = async () => {
        haptic('action');
        setNotificationDialogOpen(true);
        await loadNotifications();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_shop': return <StoreIcon sx={{ fontSize: 20, color: '#325fec' }} />;
            case 'new_house': return <HomeOutlinedIcon sx={{ fontSize: 20, color: '#16a34a' }} />;
            case 'new_job': return <WorkIcon sx={{ fontSize: 20, color: '#ea580c' }} />;
            default: return <NotificationsIcon sx={{ fontSize: 20, color: '#325fec' }} />;
        }
    };

    const formatTimeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // ─── SIDEBAR (Admin) ───────────────────────────────────────────────────────
    const renderSidebar = () => {
        const sidebarContent = (
            <Box sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#fff',
                borderRight: '1px solid #f0f0f0',
            }}>
                <Box sx={{
                    p: sidebarCollapsed ? 1.5 : 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                    borderBottom: '1px solid #f0f0f0',
                    minHeight: TOP_BAR_HEIGHT,
                }}>
                    {!sidebarCollapsed && (
                        <Box
                            component="img" src={logo} alt="NearZO"
                            sx={{ width: 100, height: 'auto', cursor: 'pointer', objectFit: 'contain' }}
                            onClick={() => { haptic('tap'); navigate('/'); }}
                        />
                    )}
                    {sidebarCollapsed && (
                        <Box
                            component="img" src={logo} alt="NearZO"
                            sx={{ width: 32, height: 'auto', cursor: 'pointer', objectFit: 'contain' }}
                            onClick={() => { haptic('tap'); navigate('/'); }}
                        />
                    )}
                    {!sidebarCollapsed && (
                        <IconButton
                            onClick={() => { haptic('tap'); setSidebarCollapsed(true); }}
                            size="small"
                            sx={{ color: '#aaa', '&:hover': { color: '#325fec', bgcolor: '#f0f4ff' } }}
                        >
                            <ChevronLeftIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                    )}
                    {sidebarCollapsed && <Box />}
                </Box>

                {sidebarCollapsed && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5 }}>
                        <IconButton
                            onClick={() => { haptic('tap'); setSidebarCollapsed(false); }}
                            size="small"
                            sx={{ color: '#aaa', '&:hover': { color: '#325fec', bgcolor: '#f0f4ff' } }}
                        >
                            <ChevronLeftIcon sx={{ fontSize: '1.1rem', transform: 'rotate(180deg)' }} />
                        </IconButton>
                    </Box>
                )}

                <List sx={{ flex: 1, pt: 1.5, px: 1 }}>
                    {navItems.map((item) => {
                        const active = isActivePath(item.path);
                        return (
                            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                                <Tooltip title={sidebarCollapsed ? item.label : ''} placement="right">
                                    <ListItemButton
                                        onClick={() => {
                                            haptic('select');
                                            navigate(item.path);
                                            if (isMobile) setMobileOpen(false);
                                        }}
                                        sx={{
                                            minHeight: 42,
                                            borderRadius: '10px',
                                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                            px: sidebarCollapsed ? 1.2 : 1.5,
                                            py: 1,
                                            bgcolor: active ? '#f0f4ff' : 'transparent',
                                            '&:hover': { bgcolor: active ? '#e8effe' : '#f8f8f8' },
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <ListItemIcon sx={{
                                            minWidth: 0,
                                            mr: sidebarCollapsed ? 0 : 1.5,
                                            color: active ? '#325fec' : '#9aa',
                                            '& svg': { fontSize: '1.2rem' }
                                        }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        {!sidebarCollapsed && (
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontSize: '0.825rem',
                                                    fontFamily: '"Inter", sans-serif',
                                                    fontWeight: active ? 600 : 400,
                                                    color: active ? '#325fec' : '#444',
                                                    letterSpacing: '-0.01em',
                                                }}
                                            />
                                        )}
                                        {!sidebarCollapsed && active && (
                                            <Box sx={{
                                                width: 5, height: 5, borderRadius: '50%',
                                                bgcolor: '#325fec', ml: 'auto', flexShrink: 0
                                            }} />
                                        )}
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                        );
                    })}
                </List>

                <Box sx={{ px: 1, pb: 2 }}>
                    <Divider sx={{ mb: 1.5, borderColor: '#f0f0f0' }} />
                    <Tooltip title={sidebarCollapsed ? 'Logout' : ''} placement="right">
                        <ListItemButton
                            onClick={() => { haptic('warning'); setLogoutDialogOpen(true); }}
                            sx={{
                                borderRadius: '10px',
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                px: sidebarCollapsed ? 1.2 : 1.5,
                                py: 1,
                                '&:hover': { bgcolor: '#fff1f0' },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: sidebarCollapsed ? 0 : 1.5, color: '#ccc', '& svg': { fontSize: '1.2rem' } }}>
                                <LogoutIcon />
                            </ListItemIcon>
                            {!sidebarCollapsed && (
                                <ListItemText
                                    primary="Logout"
                                    primaryTypographyProps={{
                                        fontSize: '0.825rem',
                                        fontFamily: '"Inter", sans-serif',
                                        fontWeight: 400,
                                        color: '#999',
                                    }}
                                />
                            )}
                        </ListItemButton>
                    </Tooltip>
                </Box>
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
                            border: 'none',
                            borderRight: '1px solid #f0f0f0',
                            bgcolor: '#fff',
                            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            overflowX: 'hidden',
                        },
                    }}
                    open
                >
                    {sidebarContent}
                </Drawer>

                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => { haptic('tap'); setMobileOpen(false); }}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            bgcolor: '#fff',
                        },
                    }}
                >
                    {sidebarContent}
                </Drawer>
            </>
        );
    };

    // ─── BOTTOM NAV (User/Business) ──────────────────────────────────────────
    const renderBottomNav = () => {
        const currentIndex = navItems.findIndex(item =>
            location.pathname === item.path || location.pathname.startsWith(item.path + '/')
        );
        const activeIndex = currentIndex >= 0 ? currentIndex : 0;

        return (
            <>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                    @keyframes pillPop {
                        0%   { transform: scale(0.88); opacity: 0.5; }
                        55%  { transform: scale(1.05); opacity: 1; }
                        100% { transform: scale(1);    opacity: 1; }
                    }

                    @keyframes labelSlide {
                        0%   { opacity: 0; transform: translateX(-4px); }
                        100% { opacity: 1; transform: translateX(0); }
                    }

                    .nearzo-bottom-nav-item {
                        -webkit-tap-highlight-color: transparent;
                    }

                    .nearzo-bottom-nav-item:active .nearzo-nav-inner {
                        transform: scale(0.88) !important;
                    }

                    .nearzo-active-pill {
                        animation: pillPop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                    }

                    .nearzo-active-label {
                        animation: labelSlide 0.22s ease both;
                        animation-delay: 0.06s;
                    }

                    .nearzo-bottom-nav-item:active .nearzo-active-pill {
                        transform: scale(0.93) !important;
                        transition: transform 0.08s ease !important;
                    }
                `}</style>

                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1300,
                        display: 'flex',
                        justifyContent: 'center',
                        pb: 'max(env(safe-area-inset-bottom, 0px), 14px)',
                        pt: '10px',
                        pointerEvents: 'none',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            pointerEvents: 'all',
                            bgcolor: '#ffffff',
                            borderRadius: '100px',
                            px: '6px',
                            py: '6px',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)',
                        }}
                    >
                        {navItems.map((item, index) => {
                            const active = index === activeIndex;

                            return (
                                <Box
                                    key={item.label}
                                    className="nearzo-bottom-nav-item"
                                    onClick={() => {
                                        haptic(active ? 'tap' : 'select');
                                        navigate(item.path);
                                    }}
                                    sx={{
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        WebkitUserSelect: 'none',
                                    }}
                                >
                                    {active ? (
                                        <Box
                                            className="nearzo-active-pill"
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '7px',
                                                px: '14px',
                                                height: '44px',
                                                borderRadius: '100px',
                                                bgcolor: '#325fec',
                                                boxShadow: '0 2px 8px rgba(50, 95, 236, 0.3)',
                                            }}
                                        >
                                            <Box sx={{
                                                color: '#ffffff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                '& svg': { fontSize: '1.15rem' }
                                            }}>
                                                {item.icon}
                                            </Box>
                                            <Typography
                                                className="nearzo-active-label"
                                                sx={{
                                                    fontFamily: '"Inter", sans-serif',
                                                    fontWeight: 600,
                                                    fontSize: '0.82rem',
                                                    color: '#ffffff',
                                                    letterSpacing: '-0.015em',
                                                    whiteSpace: 'nowrap',
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {item.label}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box
                                            className="nearzo-nav-inner"
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '100px',
                                                transition: 'all 0.18s ease',
                                                color: 'rgba(60, 60, 80, 0.5)',
                                                '&:hover': {
                                                    bgcolor: 'rgba(50, 95, 236, 0.08)',
                                                    color: '#325fec',
                                                },
                                                '& svg': { fontSize: '1.22rem' }
                                            }}
                                        >
                                            {item.icon}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </>
        );
    };

    // ─── TOP BAR (User/Business) ───────────────────────────────────────────────
    const renderTopBar = () => {
        if (isAdmin) return null;

        return (
            <Box
                sx={{
                    height: TOP_BAR_HEIGHT,
                    px: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                }}
            >
                <Box
                    component="img" src={logo} alt="NearZO"
                    sx={{ width: 90, height: 'auto', objectFit: 'contain', cursor: 'pointer' }}
                    onClick={() => { haptic('tap'); navigate('/'); }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

                    {/* ── Download Now / Install PWA button ── */}
                    {/* <Button
                        size="small"
                        startIcon={<DownloadIcon sx={{ fontSize: '0.95rem !important' }} />}
                        onClick={handleInstallClick}
                        sx={{
                            textTransform: 'none',
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            color: '#325fec',
                            bgcolor: '#f0f4ff',
                            border: '1px solid #d6e0ff',
                            borderRadius: '10px',
                            px: 1.5,
                            py: 0.6,
                            mr: 0.5,
                            whiteSpace: 'nowrap',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#e3eaff',
                                boxShadow: 'none',
                            },
                            '&:active': {
                                transform: 'scale(0.93)',
                            },
                            transition: 'all 0.15s ease',
                            // Hide on very small screens, show from sm up
                            display: { xs: 'none', sm: 'flex' },
                        }}
                    >
                        Download Now
                    </Button> */}

                    {/* Download icon-only on xs */}
                    {/* <IconButton
                        size="small"
                        onClick={handleInstallClick}
                        sx={{
                            width: 38, height: 38,
                            borderRadius: '12px',
                            color: '#325fec',
                            bgcolor: '#f0f4ff',
                            border: '1px solid #d6e0ff',
                            '&:hover': { bgcolor: '#e3eaff' },
                            '&:active': { transform: 'scale(0.88)' },
                            transition: 'all 0.15s ease',
                            display: { xs: 'flex', sm: 'none' },
                            mr: 0.5,
                        }}
                    >
                        <DownloadIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton> */}

                    {/* Notification bell */}
                    <IconButton
                        size="small"
                        onClick={openNotificationsDialog}
                        sx={{
                            width: 38, height: 38,
                            borderRadius: '12px',
                            color: '#888',
                            bgcolor: '#f7f7f7',
                            '&:hover': { bgcolor: '#f0f4ff', color: '#325fec' },
                            transition: 'all 0.15s ease',
                            '&:active': { transform: 'scale(0.88)' },
                        }}
                    >
                        <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                            <NotificationsIcon sx={{ fontSize: '1.15rem' }} />
                        </Badge>
                    </IconButton>

                    {/* Profile chip */}
                    <Box
                        onClick={(e) => { haptic('action'); setAnchorEl(e.currentTarget); }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            ml: 0.5,
                            pl: 1,
                            pr: 1.2,
                            py: 0.6,
                            borderRadius: '12px',
                            bgcolor: '#f7f7f7',
                            cursor: 'pointer',
                            border: '1px solid transparent',
                            transition: 'all 0.15s ease',
                            '&:hover': { bgcolor: '#f0f4ff', borderColor: '#d6e0ff' },
                            '&:active': { transform: 'scale(0.94)' },
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 26, height: 26,
                                bgcolor: '#325fec',
                                color: '#fff',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                fontFamily: '"Inter", sans-serif',
                            }}
                        >
                            {getUserInitial(role, user)}
                        </Avatar>
                        <Typography sx={{
                            fontSize: '0.75rem',
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 500,
                            color: '#555',
                            textTransform: 'capitalize',
                            display: { xs: 'none', sm: 'block' },
                        }}>
                            {role}
                        </Typography>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={() => setAnchorEl(null)}
                        onClick={() => setAnchorEl(null)}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                mt: 1,
                                borderRadius: '14px',
                                border: '1px solid #f0f0f0',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                                minWidth: 170,
                                overflow: 'hidden',
                                '& .MuiMenuItem-root': {
                                    px: 2, py: 1.2,
                                    fontSize: '0.82rem',
                                    fontFamily: '"Inter", sans-serif',
                                    fontWeight: 500,
                                    color: '#333',
                                    gap: 1.5,
                                    '&:hover': { bgcolor: '#f5f7ff' },
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={() => { haptic('select'); navigate('/app/profile'); }}>
                            <AccountCircleIcon sx={{ fontSize: '1.1rem', color: '#325fec' }} />
                            Profile
                        </MenuItem>
                        <Divider sx={{ my: 0.5, borderColor: '#f5f5f5' }} />
                        <MenuItem onClick={() => { haptic('warning'); setAnchorEl(null); setLogoutDialogOpen(true); }}>
                            <LogoutIcon sx={{ fontSize: '1.1rem', color: '#aaa' }} />
                            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.82rem', color: '#888' }}>
                                Logout
                            </Typography>
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>
        );
    };

    // ─── NOTIFICATION DIALOG ────────────────────────────────────────────────────
    const renderNotificationDialog = () => (
        <Dialog
            open={notificationDialogOpen}
            onClose={() => { haptic('tap'); setNotificationDialogOpen(false); }}
            fullScreen
            PaperProps={{
                sx: { bgcolor: '#f8f9fa', backgroundImage: 'none' }
            }}
        >
            <Box sx={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                bgcolor: '#ffffff',
                borderBottom: '1px solid #f0f0f0',
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Typography sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: '#1a1a1a',
                }}>
                    Notifications
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {notifications.length > 0 && unreadCount > 0 && (
                        <Button
                            size="small"
                            onClick={handleMarkAllRead}
                            sx={{
                                textTransform: 'none',
                                fontFamily: '"Inter", sans-serif',
                                fontSize: '0.75rem',
                                color: '#325fec',
                                fontWeight: 600,
                                '&:active': { transform: 'scale(0.92)' },
                            }}
                        >
                            Mark all as read
                        </Button>
                    )}
                    <IconButton
                        onClick={() => { haptic('tap'); setNotificationDialogOpen(false); }}
                        size="small"
                        sx={{ '&:active': { transform: 'scale(0.88)' } }}
                    >
                        <CloseIcon sx={{ fontSize: '1.2rem', color: '#888' }} />
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                {notificationsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress size={32} sx={{ color: '#325fec' }} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{
                        textAlign: 'center',
                        py: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Box sx={{
                            width: 64, height: 64,
                            borderRadius: '50%',
                            bgcolor: '#f0f4ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <NotificationsIcon sx={{ fontSize: 28, color: '#325fec', opacity: 0.6 }} />
                        </Box>
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '0.9rem',
                            color: '#888',
                            fontWeight: 500,
                        }}>
                            No notifications yet
                        </Typography>
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '0.75rem',
                            color: '#aaa',
                        }}>
                            When someone posts in your city, you'll see it here
                        </Typography>
                    </Box>
                ) : (
                    notifications.map((notification) => (
                        <Box
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            sx={{
                                bgcolor: notification.is_read ? '#ffffff' : '#f0f7ff',
                                borderRadius: '14px',
                                p: 2,
                                mb: 1.5,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                border: '1px solid',
                                borderColor: notification.is_read ? '#f0f0f0' : '#d6e4ff',
                                WebkitTapHighlightColor: 'transparent',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    borderColor: '#c7d2fe',
                                },
                                '&:active': {
                                    transform: 'scale(0.97)',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <Box sx={{
                                    width: 40, height: 40,
                                    borderRadius: '12px',
                                    bgcolor: notification.type === 'new_shop' ? '#f0f4ff' :
                                             notification.type === 'new_house' ? '#f0fdf4' : '#fff7ed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {getNotificationIcon(notification.type)}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{
                                        fontFamily: '"Inter", sans-serif',
                                        fontWeight: notification.is_read ? 500 : 700,
                                        fontSize: '0.85rem',
                                        color: '#1a1a1a',
                                        mb: 0.5,
                                    }}>
                                        {notification.title}
                                    </Typography>
                                    <Typography sx={{
                                        fontFamily: '"Inter", sans-serif',
                                        fontSize: '0.75rem',
                                        color: '#666',
                                        lineHeight: 1.5,
                                        mb: 0.75,
                                    }}>
                                        {notification.message}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography sx={{
                                            fontFamily: '"Inter", sans-serif',
                                            fontSize: '0.65rem',
                                            color: '#aaa',
                                        }}>
                                            {formatTimeAgo(notification.created_at)}
                                        </Typography>
                                        {!notification.is_read && (
                                            <Box sx={{
                                                width: 6, height: 6,
                                                borderRadius: '50%',
                                                bgcolor: '#325fec',
                                            }} />
                                        )}
                                    </Box>
                                </Box>
                                {notification.reference_image && (
                                    <Box sx={{
                                        width: 48, height: 48,
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        bgcolor: '#f5f5f5',
                                        flexShrink: 0,
                                    }}>
                                        <img
                                            src={notification.reference_image}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ))
                )}
            </Box>
        </Dialog>
    );

    // ─── LOGOUT DIALOG ──────────────────────────────────────────────────────────
    const renderLogoutDialog = () => (
        <Dialog
            open={logoutDialogOpen}
            onClose={() => { haptic('tap'); setLogoutDialogOpen(false); }}
            PaperProps={{
                sx: {
                    borderRadius: '18px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                    border: '1px solid #f0f0f0',
                    p: 0.5,
                    minWidth: 300,
                }
            }}
        >
            <DialogTitle sx={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 700,
                fontSize: '1rem',
                color: '#1a1a1a',
                pb: 0.5,
            }}>
                Log out?
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.85rem',
                    color: '#888',
                    lineHeight: 1.6,
                }}>
                    You'll need to sign in again to access your account.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
                <Button
                    onClick={() => { haptic('tap'); setLogoutDialogOpen(false); }}
                    sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        color: '#666',
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        px: 2,
                        bgcolor: '#f5f5f5',
                        '&:hover': { bgcolor: '#eee' },
                        '&:active': { transform: 'scale(0.94)' },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleLogout}
                    variant="contained"
                    sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        px: 2.5,
                        bgcolor: '#325fec',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#1a4bcf', boxShadow: 'none' },
                        '&:active': { transform: 'scale(0.94)' },
                    }}
                >
                    Log out
                </Button>
            </DialogActions>
        </Dialog>
    );

    // ─── LOADING ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: '#fff'
            }}>
                <Box
                    component="img"
                    src={loadingGif}
                    alt="Loading..."
                    sx={{ width: 120, height: 'auto', objectFit: 'contain' }}
                />
            </Box>
        );
    }

    if (!role) return null;

    // ─── ADMIN LAYOUT ───────────────────────────────────────────────────────────
    if (isAdmin) {
        return (
            <>
                <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
                    {renderSidebar()}

                    <Box component="main" sx={{ flexGrow: 1, bgcolor: '#ffffff', minWidth: 0, minHeight: '100vh' }}>
                        <Box
                            sx={{
                                height: TOP_BAR_HEIGHT,
                                px: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                bgcolor: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(12px)',
                                borderBottom: '1px solid #f0f0f0',
                                position: 'sticky',
                                top: 0,
                                zIndex: 1100,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <IconButton
                                    onClick={() => { haptic('tap'); setMobileOpen(!mobileOpen); }}
                                    sx={{
                                        display: { xs: 'flex', md: 'none' },
                                        color: '#888',
                                        width: 36, height: 36,
                                        borderRadius: '10px',
                                        bgcolor: '#f5f5f5',
                                        '&:active': { transform: 'scale(0.88)' },
                                    }}
                                >
                                    <MenuIcon sx={{ fontSize: '1.1rem' }} />
                                </IconButton>
                                <Typography sx={{
                                    fontWeight: 700,
                                    fontFamily: '"Inter", sans-serif',
                                    color: '#1a1a1a',
                                    fontSize: '1rem',
                                    letterSpacing: '-0.02em',
                                }}>
                                    {navItems.find(item => isActivePath(item.path))?.label || 'Dashboard'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton
                                    size="small"
                                    onClick={openNotificationsDialog}
                                    sx={{
                                        width: 38, height: 38,
                                        borderRadius: '12px',
                                        color: '#888',
                                        bgcolor: '#f7f7f7',
                                        '&:hover': { bgcolor: '#f0f4ff', color: '#325fec' },
                                        '&:active': { transform: 'scale(0.88)' },
                                    }}
                                >
                                    <Badge badgeContent={unreadCount} color="error" invisible={unreadCount === 0}>
                                        <NotificationsIcon sx={{ fontSize: '1.15rem' }} />
                                    </Badge>
                                </IconButton>

                                <Box
                                    onClick={() => { haptic('action'); navigate('/app/admin/profile'); }}
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 1,
                                        pl: 1, pr: 1.2, py: 0.6,
                                        borderRadius: '12px',
                                        bgcolor: '#f7f7f7',
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: '#f0f4ff' },
                                        '&:active': { transform: 'scale(0.94)' },
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <Avatar sx={{
                                        width: 26, height: 26,
                                        bgcolor: '#325fec',
                                        color: '#fff',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        fontFamily: '"Inter", sans-serif',
                                    }}>
                                        {getUserInitial(role, user)}
                                    </Avatar>
                                    <Typography sx={{
                                        fontSize: '0.75rem',
                                        fontFamily: '"Inter", sans-serif',
                                        fontWeight: 500,
                                        color: '#555',
                                        display: { xs: 'none', sm: 'block' },
                                    }}>
                                        Admin
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ p: 3 }}>
                            <Outlet />
                        </Box>
                    </Box>
                </Box>

                {renderNotificationDialog()}
                {renderLogoutDialog()}
            </>
        );
    }

    // ─── USER / BUSINESS LAYOUT ─────────────────────────────────────────────────
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    bgcolor: '#ffffff',
                    pb: `${BOTTOM_NAV_HEIGHT + 32}px`,
                }}
            >
                {renderTopBar()}
                {/* ── Main content: full height + white background ── */}
                <Box sx={{ flex: 1, minHeight: '100vh', bgcolor: '#ffffff' }}>
                    <Outlet />
                </Box>
            </Box>

            {renderBottomNav()}
            {renderNotificationDialog()}
            {renderLogoutDialog()}

            {/* ── PWA install not-supported snackbar ── */}
            <Snackbar
                open={installSnackbarOpen}
                autoHideDuration={3500}
                onClose={() => setInstallSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                message="App is already installed or not supported on this browser"
                ContentProps={{
                    sx: {
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '0.82rem',
                        borderRadius: '12px',
                        bgcolor: '#1a1a1a',
                        mb: `${BOTTOM_NAV_HEIGHT + 16}px`,
                    }
                }}
            />
        </>
    );
}

export default AppLayout;