// AppLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
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
    Snackbar,
    Alert,
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
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { LocationOnOutlined, HouseOutlined, StoreOutlined, GridViewOutlined } from '@mui/icons-material';
import { PlaceOutlined } from '@mui/icons-material';
import logo from '../assets/nearzologo.png';
import loadingGif from '../assets/Radar.gif';

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
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // ─── PWA Install State ─────────────────────────────────────────────────────
    const deferredPromptRef = useRef(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [installSnackbar, setInstallSnackbar] = useState({ open: false, type: 'success', message: '' });

    useEffect(() => {
        // Check if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault(); // Prevent auto-prompt
            deferredPromptRef.current = e;
            setShowInstallButton(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowInstallButton(false);
            deferredPromptRef.current = null;
            setInstallSnackbar({ open: true, type: 'success', message: 'NearZO installed successfully! 🎉' });
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        const prompt = deferredPromptRef.current;
        if (!prompt) {
            // Fallback: show manual install instructions
            setInstallSnackbar({
                open: true,
                type: 'info',
                message: 'To install: tap Share → Add to Home Screen (iOS) or use browser menu → Install App (Android/Chrome)',
            });
            return;
        }

        try {
            await prompt.prompt();
            const choiceResult = await prompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                setShowInstallButton(false);
                deferredPromptRef.current = null;
            } else {
                setInstallSnackbar({ open: true, type: 'info', message: 'Install cancelled. You can install anytime from the Download button.' });
            }
        } catch (err) {
            console.error('PWA install error:', err);
            setInstallSnackbar({ open: true, type: 'error', message: 'Install failed. Try from your browser menu.' });
        }
    };

    // ─── Install Button Component ──────────────────────────────────────────────
    const renderInstallButton = (collapsed = false) => {
        if (isInstalled) return null;
        if (!showInstallButton && !collapsed) return null; // hide if not available, except collapsed sidebar shows tooltip always

        return (
            <Tooltip title={collapsed ? 'Download App' : ''} placement="right">
                <Box
                    onClick={handleInstallClick}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: collapsed ? 0 : 1,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        px: collapsed ? 1.2 : 1.5,
                        py: 1,
                        mx: 1,
                        mb: 1,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        bgcolor: showInstallButton ? '#f0f4ff' : 'transparent',
                        border: showInstallButton ? '1px solid #d6e0ff' : '1px dashed #ddd',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                            bgcolor: '#e8effe',
                            borderColor: '#325fec',
                        },
                    }}
                >
                    <Box sx={{ color: '#325fec', display: 'flex', alignItems: 'center', '& svg': { fontSize: '1.1rem' } }}>
                        <DownloadIcon />
                    </Box>
                    {!collapsed && (
                        <Typography sx={{
                            fontSize: '0.8rem',
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 600,
                            color: '#325fec',
                            whiteSpace: 'nowrap',
                        }}>
                            Download App
                        </Typography>
                    )}
                </Box>
            </Tooltip>
        );
    };

    // ─── Top Bar Install Button ────────────────────────────────────────────────
    const renderTopBarInstallBtn = () => {
        if (isInstalled || !showInstallButton) return null;

        return (
            <Button
                onClick={handleInstallClick}
                startIcon={<DownloadIcon sx={{ fontSize: '0.95rem !important' }} />}
                size="small"
                sx={{
                    textTransform: 'none',
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    color: '#325fec',
                    bgcolor: '#f0f4ff',
                    border: '1px solid #d6e0ff',
                    borderRadius: '10px',
                    px: 1.5,
                    py: 0.6,
                    minWidth: 0,
                    boxShadow: 'none',
                    '&:hover': {
                        bgcolor: '#e0eaff',
                        boxShadow: 'none',
                    },
                    // On very small screens, hide label; keep icon
                    '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.5 } },
                    '& span:last-child': { display: { xs: 'none', sm: 'inline' } },
                }}
            >
                Download Now
            </Button>
        );
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
    }, [navigate, location.pathname]);

    const handleLogoutRedirect = () => {
        localStorage.removeItem('nearzo_token');
        localStorage.removeItem('nearzo_role');
        localStorage.removeItem('nearzo_user');
        sessionStorage.clear();
        setTimeout(() => { window.location.href = '/app/login'; }, 100);
    };

    const handleLogout = () => {
        setLogoutDialogOpen(false);
        handleLogoutRedirect();
    };

    const isAdmin = role === 'admin';
    const navItems = role ? (NAV_CONFIG[role] || NAV_CONFIG.user) : [];

    const isActivePath = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

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
                {/* Logo */}
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
                            onClick={() => navigate('/')}
                        />
                    )}
                    {sidebarCollapsed && (
                        <Box
                            component="img" src={logo} alt="NearZO"
                            sx={{ width: 32, height: 'auto', cursor: 'pointer', objectFit: 'contain' }}
                            onClick={() => navigate('/')}
                        />
                    )}
                    {!sidebarCollapsed && (
                        <IconButton onClick={() => setSidebarCollapsed(true)} size="small"
                            sx={{ color: '#aaa', '&:hover': { color: '#325fec', bgcolor: '#f0f4ff' } }}>
                            <ChevronLeftIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                    )}
                    {sidebarCollapsed && <Box />}
                </Box>

                {sidebarCollapsed && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5 }}>
                        <IconButton onClick={() => setSidebarCollapsed(false)} size="small"
                            sx={{ color: '#aaa', '&:hover': { color: '#325fec', bgcolor: '#f0f4ff' } }}>
                            <ChevronLeftIcon sx={{ fontSize: '1.1rem', transform: 'rotate(180deg)' }} />
                        </IconButton>
                    </Box>
                )}

                {/* Nav Items */}
                <List sx={{ flex: 1, pt: 1.5, px: 1 }}>
                    {navItems.map((item) => {
                        const active = isActivePath(item.path);
                        return (
                            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                                <Tooltip title={sidebarCollapsed ? item.label : ''} placement="right">
                                    <ListItemButton
                                        onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
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

                {/* Install App button in sidebar */}
                <Box sx={{ px: 0, pb: 0.5 }}>
                    {renderInstallButton(sidebarCollapsed)}
                </Box>

                <Box sx={{ px: 1, pb: 2 }}>
                    <Divider sx={{ mb: 1.5, borderColor: '#f0f0f0' }} />
                    <Tooltip title={sidebarCollapsed ? 'Logout' : ''} placement="right">
                        <ListItemButton
                            onClick={() => setLogoutDialogOpen(true)}
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
                    onClose={() => setMobileOpen(false)}
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

    // ─── BOTTOM NAV (User/Business) — iOS Liquid Glass Style ──────────────────
    const renderBottomNav = () => {
        const currentIndex = navItems.findIndex(item =>
            location.pathname === item.path || location.pathname.startsWith(item.path + '/')
        );
        const activeIndex = currentIndex >= 0 ? currentIndex : 0;

        return (
            <>
                {/* Keyframe injection */}
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
                        transform: scale(0.92) !important;
                    }

                    .nearzo-active-pill {
                        animation: pillPop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                    }

                    .nearzo-active-label {
                        animation: labelSlide 0.22s ease both;
                        animation-delay: 0.06s;
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
                    {/* Glass pill container */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            pointerEvents: 'all',

                            // Liquid glass base
                            bgcolor: 'rgba(255, 255, 255, 0.72)',
                            backdropFilter: 'blur(40px) saturate(180%) brightness(1.08)',
                            WebkitBackdropFilter: 'blur(40px) saturate(180%) brightness(1.08)',

                            // Shape
                            borderRadius: '100px',
                            px: '6px',
                            py: '6px',

                            // Glass border — iOS style refraction ring
                            border: '1px solid rgba(255, 255, 255, 0.85)',
                            outline: '1px solid rgba(0, 0, 0, 0.07)',

                            // Layered shadow for depth
                            boxShadow: `
                                0 2px 0px rgba(255,255,255,0.9) inset,
                                0 -1px 0px rgba(0,0,0,0.04) inset,
                                0 8px 32px rgba(0, 0, 0, 0.13),
                                0 2px 8px rgba(0, 0, 0, 0.08),
                                0 0 0 0.5px rgba(255,255,255,0.6)
                            `,
                        }}
                    >
                        {navItems.map((item, index) => {
                            const active = index === activeIndex;

                            return (
                                <Box
                                    key={item.label}
                                    className="nearzo-bottom-nav-item"
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        WebkitUserSelect: 'none',
                                    }}
                                >
                                    {active ? (
                                        // ── ACTIVE: Dark capsule pill with icon + label ──
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
                                                boxShadow: `
                                                    0 1px 0 rgba(255,255,255,0.12) inset,
                                                    0 -1px 0 rgba(0,0,0,0.3) inset,
                                                    0 4px 16px rgba(50, 95, 236, 0.25),
                                                    0 2px 6px rgba(0,0,0,0.3)
                                                `,
                                            }}
                                        >
                                            <Box sx={{
                                                color: '#ffffff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                '& svg': {
                                                    fontSize: '1.15rem',
                                                    filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.3))',
                                                }
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
                                        // ── INACTIVE: Just icon, no label ──
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
                                                '& svg': {
                                                    fontSize: '1.22rem',
                                                    transition: 'all 0.18s ease',
                                                }
                                            }}
                                        >
                                            {item.icon}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}

                        {/* ── PWA Install pill (appended after nav items) ── */}
                        {showInstallButton && !isInstalled && (
                            <Box
                                className="nearzo-bottom-nav-item"
                                onClick={handleInstallClick}
                                sx={{ cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        px: '12px',
                                        height: '44px',
                                        borderRadius: '100px',
                                        bgcolor: 'rgba(50, 95, 236, 0.08)',
                                        border: '1px solid rgba(50, 95, 236, 0.18)',
                                        transition: 'all 0.18s ease',
                                        '&:hover': { bgcolor: 'rgba(50, 95, 236, 0.14)' },
                                        '&:active': { transform: 'scale(0.93)' },
                                    }}
                                >
                                    <Box sx={{ color: '#325fec', display: 'flex', alignItems: 'center', '& svg': { fontSize: '1.05rem' } }}>
                                        <DownloadIcon />
                                    </Box>
                                    <Typography sx={{
                                        fontFamily: '"Inter", sans-serif',
                                        fontWeight: 600,
                                        fontSize: '0.78rem',
                                        color: '#325fec',
                                        letterSpacing: '-0.01em',
                                        whiteSpace: 'nowrap',
                                        lineHeight: 1,
                                        display: { xs: 'none', sm: 'block' },
                                    }}>
                                        Get App
                                    </Typography>
                                </Box>
                            </Box>
                        )}
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
                {/* Logo */}
                <Box
                    component="img" src={logo} alt="NearZO"
                    sx={{ width: 90, height: 'auto', objectFit: 'contain', cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                />

                {/* Right actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

                    {/* Download Now button */}
                    {renderTopBarInstallBtn()}

                    <IconButton
                        size="small"
                        sx={{
                            width: 38, height: 38,
                            borderRadius: '12px',
                            color: '#888',
                            bgcolor: '#f7f7f7',
                            '&:hover': { bgcolor: '#f0f4ff', color: '#325fec' },
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <Badge badgeContent={0} color="error" invisible>
                            <NotificationsIcon sx={{ fontSize: '1.15rem' }} />
                        </Badge>
                    </IconButton>

                    <Box
                        onClick={(e) => setAnchorEl(e.currentTarget)}
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
                            {role ? role[0].toUpperCase() : 'U'}
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
                        <MenuItem onClick={() => navigate('/app/profile')}>
                            <AccountCircleIcon sx={{ fontSize: '1.1rem', color: '#325fec' }} />
                            Profile
                        </MenuItem>
                        <Divider sx={{ my: 0.5, borderColor: '#f5f5f5' }} />
                        <MenuItem onClick={() => { setAnchorEl(null); setLogoutDialogOpen(true); }}>
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

    // ─── LOGOUT DIALOG ─────────────────────────────────────────────────────────
    const renderLogoutDialog = () => (
        <Dialog
            open={logoutDialogOpen}
            onClose={() => setLogoutDialogOpen(false)}
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
                    onClick={() => setLogoutDialogOpen(false)}
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
                    }}
                >
                    Log out
                </Button>
            </DialogActions>
        </Dialog>
    );

    // ─── INSTALL SNACKBAR ──────────────────────────────────────────────────────
    const renderInstallSnackbar = () => (
        <Snackbar
            open={installSnackbar.open}
            autoHideDuration={5000}
            onClose={() => setInstallSnackbar(s => ({ ...s, open: false }))}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert
                onClose={() => setInstallSnackbar(s => ({ ...s, open: false }))}
                severity={installSnackbar.type}
                icon={installSnackbar.type === 'success' ? <CheckCircleOutlineIcon /> : undefined}
                sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.82rem',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}
            >
                {installSnackbar.message}
            </Alert>
        </Snackbar>
    );

    // ─── LOADING ───────────────────────────────────────────────────────────────
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

    // ─── ADMIN LAYOUT ──────────────────────────────────────────────────────────
    if (isAdmin) {
        return (
            <>
                <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
                    {renderSidebar()}

                    <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f8f9fa', minWidth: 0 }}>
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
                                    onClick={() => setMobileOpen(!mobileOpen)}
                                    sx={{
                                        display: { xs: 'flex', md: 'none' },
                                        color: '#888',
                                        width: 36, height: 36,
                                        borderRadius: '10px',
                                        bgcolor: '#f5f5f5',
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
                                    sx={{
                                        width: 38, height: 38,
                                        borderRadius: '12px',
                                        color: '#888',
                                        bgcolor: '#f7f7f7',
                                        '&:hover': { bgcolor: '#f0f4ff', color: '#325fec' },
                                    }}
                                >
                                    <NotificationsIcon sx={{ fontSize: '1.15rem' }} />
                                </IconButton>

                                <Box
                                    onClick={() => navigate('/app/admin/profile')}
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 1,
                                        pl: 1, pr: 1.2, py: 0.6,
                                        borderRadius: '12px',
                                        bgcolor: '#f7f7f7',
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: '#f0f4ff' },
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
                                        A
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

                {renderLogoutDialog()}
                {renderInstallSnackbar()}
            </>
        );
    }

    // ─── USER / BUSINESS LAYOUT ────────────────────────────────────────────────
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    bgcolor: '#f8f9fa',
                    pb: `${BOTTOM_NAV_HEIGHT + 32}px`,
                }}
            >
                {renderTopBar()}

                <Box sx={{ flex: 1 }}>
                    <Outlet />
                </Box>
            </Box>

            {renderBottomNav()}
            {renderLogoutDialog()}
            {renderInstallSnackbar()}
        </>
    );
}

export default AppLayout;