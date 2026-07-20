// AppLayout.jsx — Aligned with the Shops/Houses/Jobs design system
import React, { useState, useEffect, useCallback, useLayoutEffect, useMemo, useRef } from 'react';
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
    Slide,
    Chip,
    TextField,
    InputAdornment,
    Fade,
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
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { LocationOnOutlined, HouseOutlined, StoreOutlined, GridViewOutlined } from '@mui/icons-material';
import { PlaceOutlined } from '@mui/icons-material';
import logo from '../assets/helozologo.png';
import loadingGif from '../assets/Radar.gif';
import { getNotifications } from '../services/profile';
import { useAuth } from './context/AuthContext';

// ─── Design Tokens (same theme as Shops / Houses / Jobs) ───────────────────
const C = {
    bg:          '#F4F6FB',
    surface:     '#FFFFFF',
    surfaceAlt:  '#F0F3FA',
    border:      '#E2E8F5',
    borderLight: '#EBF0F9',
    accent:      '#325fec',
    accentLight: '#EEF4FF',
    accentMid:   '#BFCFFF',
    accentDark:  '#1A45C2',
    green:       '#16A34A',
    greenLight:  '#DCFCE7',
    amber:       '#D97706',
    amberLight:  '#FEF3C7',
    red:         '#DC2626',
    redLight:    '#FEE2E2',
    purple:      '#7C3AED',
    purpleLight: '#EDE9FE',
    text:        '#0F172A',
    textSub:     '#475569',
    textMuted:   '#94A3B8',
    shadow:      'rgba(50,95,236,0.12)',
    shadowMd:    'rgba(15,23,42,0.07)',
    shadowLg:    'rgba(15,23,42,0.18)',
    white:       '#FFFFFF',
};

const FONT = '"Inter", sans-serif';
const SHEET_EASE_ENTER = 'cubic-bezier(0.16, 1, 0.3, 1)';
const SHEET_EASE_EXIT  = 'cubic-bezier(0.7, 0, 0.84, 0)';

const SlideUpTransition = React.forwardRef(function SlideUpTransition(props, ref) {
    return <Slide direction="up" ref={ref} easing={{ enter: SHEET_EASE_ENTER, exit: SHEET_EASE_EXIT }} {...props} />;
});

// ─── HAPTIC UTILITY ──────────────────────────────────────────────────────────
const HAPTIC_PATTERNS = {
    tap: 3,
    select: 5,
    action: [4, 18, 4],
    warning: [8, 28, 10],
    success: [5, 18, 5],
};

let lastHapticAt = 0;

const haptic = (type = 'tap') => {
    if (!navigator.vibrate) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const now = performance.now();
    const minGap = type === 'tap' ? 45 : 75;
    if (now - lastHapticAt < minGap) return;

    lastHapticAt = now;
    navigator.vibrate(0);
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
    admin: [
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/app/admin/dashboard' },
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
const NOTIFICATION_POLL_MS = 10000;

const normalizeUnreadCount = (payload) => {
    if (typeof payload === 'number') {
        return Number.isFinite(payload) ? Math.max(0, Math.trunc(payload)) : 0;
    }

    const possibleCounts = [
        payload?.unread_count,
        payload?.unread,
        payload?.unreadCount,
        payload?.count,
        payload?.total_unread,
        payload?.totalUnread,
        payload?.unread_notifications,
    ];
    const raw = possibleCounts.find((value) => value !== undefined && value !== null && value !== '');

    if (raw !== undefined) {
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
    }

    const notifications = Array.isArray(payload?.notifications) ? payload.notifications : [];
    return notifications.filter((notification) => !notification.is_read).length;
};

const getNotificationIdentity = (notification) => {
    const stableId = notification?.id ?? notification?._id ?? notification?.notification_id;
    if (stableId !== undefined && stableId !== null && stableId !== '') {
        return String(stableId);
    }

    return [
        notification?.type,
        notification?.reference_type,
        notification?.reference_id,
        notification?.created_at,
        notification?.title,
    ].filter(Boolean).join(':');
};

const getStoredUser = () => {
    try {
        const storedUser = localStorage.getItem('nearzo_user');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        return null;
    }
};

const getNotificationSeenStorageKey = (user, role) => {
    const scopedUser = user || getStoredUser();
    const userKey = scopedUser?.id ?? scopedUser?.phone ?? scopedUser?.full_name ?? 'guest';
    const roleKey = role || scopedUser?.role || 'user';
    return `nearzo_seen_notifications:${roleKey}:${userKey}`;
};

const readSeenNotificationIds = (storageKey) => {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
        return new Set(Array.isArray(saved) ? saved.map(String) : []);
    } catch {
        return new Set();
    }
};

const saveSeenNotificationIds = (storageKey, seenIds) => {
    try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(seenIds).slice(-500)));
    } catch {
        // Ignore storage failures; the UI can still behave correctly for this session.
    }
};

const countUnseenNotifications = (notifications, seenIds) =>
    (Array.isArray(notifications) ? notifications : []).reduce((count, notification) => (
        seenIds.has(getNotificationIdentity(notification)) ? count : count + 1
    ), 0);

const applyLocalSeenStatus = (notifications, seenIds) =>
    (Array.isArray(notifications) ? notifications : []).map((notification) => ({
        ...notification,
        is_read: seenIds.has(getNotificationIdentity(notification)),
    }));

// ─── Avatar initial — always the person's NAME, never a phone digit ────────
const looksLikePhoneNumber = (str) => /^[+\d\s().-]+$/.test(str.trim());

const getUserInitial = (role, user) => {
    const nameCandidates = [user?.full_name, user?.name, user?.first_name, user?.username];
    for (const candidate of nameCandidates) {
        if (candidate && typeof candidate === 'string') {
            const trimmed = candidate.trim();
            if (trimmed && !looksLikePhoneNumber(trimmed)) {
                return trimmed.charAt(0).toUpperCase();
            }
        }
    }
    return role ? role.charAt(0).toUpperCase() : 'U';
};

// ─── Location Service for City Detection ────────────────────────────────────
class LocationService {
    async getUserCity() {
        try {
            // Try to get from localStorage first
            const savedCity = localStorage.getItem('nearzo_user_city');
            if (savedCity) {
                console.log(`📍 Using saved city: ${savedCity}`);
                return savedCity;
            }

            // Try geolocation
            if (navigator.geolocation) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    });
                });

                const { latitude, longitude } = position.coords;
                const city = await this.reverseGeocode(latitude, longitude);
                
                if (city) {
                    localStorage.setItem('nearzo_user_city', city);
                    console.log(`📍 Detected city via geolocation: ${city}`);
                    return city;
                }
            }

            // Fallback: try to get from user profile
            const user = JSON.parse(localStorage.getItem('nearzo_user') || '{}');
            if (user?.city) {
                localStorage.setItem('nearzo_user_city', user.city);
                console.log(`📍 Using city from user profile: ${user.city}`);
                return user.city;
            }

            console.log('⚠️ Could not detect user city');
            return null;
        } catch (error) {
            console.error('Error getting user city:', error);
            // Try to get from user profile as fallback
            try {
                const user = JSON.parse(localStorage.getItem('nearzo_user') || '{}');
                if (user?.city) {
                    localStorage.setItem('nearzo_user_city', user.city);
                    console.log(`📍 Using city from user profile (fallback): ${user.city}`);
                    return user.city;
                }
            } catch (e) {}
            return null;
        }
    }

    async reverseGeocode(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=en`,
                { headers: { 'User-Agent': 'NearZO-App/1.0' } }
            );
            const data = await response.json();
            if (data?.address) {
                const address = data.address;
                return address.city || address.town || address.village || address.municipality || null;
            }
            return null;
        } catch (error) {
            console.error('Reverse geocode error:', error);
            return null;
        }
    }
}

const locationService = new LocationService();

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
    const notificationSeenStorageKey = useMemo(
        () => getNotificationSeenStorageKey(user, role),
        [user, role]
    );
    
    // ─── Menu States ──────────────────────────────────────────────────────────
    const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
    const profileMenuOpen = Boolean(profileMenuAnchor);
    
    const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
    
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [seenNotificationIds, setSeenNotificationIds] = useState(() =>
        readSeenNotificationIds(notificationSeenStorageKey)
    );
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [userCity, setUserCity] = useState(null);
    const [cityLoading, setCityLoading] = useState(true);
    const [locationError, setLocationError] = useState(null);

    // ─── PWA INSTALL ────────────────────────────────────────────────────────────
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [installSnackbarOpen, setInstallSnackbarOpen] = useState(false);

    // ─── Polling interval for notifications ──────────────────────────────────
    const pollingInterval = useRef(null);
    const bottomNavTrackRef = useRef(null);
    const bottomNavItemRefs = useRef([]);
    const [bottomNavIndicator, setBottomNavIndicator] = useState({
        left: 0,
        width: 0,
        ready: false,
    });
    const previousBottomNavIndexRef = useRef(0);
    const [bottomNavDirection, setBottomNavDirection] = useState(1);

    useEffect(() => {
        setSeenNotificationIds(readSeenNotificationIds(notificationSeenStorageKey));
    }, [notificationSeenStorageKey]);

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
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, []);

    const handleInstallClick = async () => {
        haptic('action');
        if (!deferredPrompt) {
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

    // ─── Get user's city location (only for non-admin) ──────────────────────
    const getUserCityLocation = useCallback(async () => {
        // Admin doesn't need city detection - they see all notifications
        if (role === 'admin') {
            setCityLoading(false);
            console.log('👑 Admin mode - no city detection needed');
            return;
        }

        setCityLoading(true);
        try {
            const city = await locationService.getUserCity();
            if (city) {
                setUserCity(city);
                localStorage.setItem('nearzo_user_city', city);
                console.log(`📍 User city detected: ${city}`);
                setLocationError(null);
            } else {
                setLocationError('Unable to detect your city. Please set your location in profile.');
                console.warn('⚠️ Could not detect user city');
            }
        } catch (error) {
            console.error('Error getting user city:', error);
            setLocationError('Error detecting location. Please check your profile settings.');
        } finally {
            setCityLoading(false);
        }
    }, [role]);

    const fetchNotificationsForCurrentScope = useCallback(async () => {
        const isAdmin = role === 'admin';

        console.log(`📬 Loading notifications - Role: ${role}, isAdmin: ${isAdmin}, userCity: ${userCity}`);

        // For non-admin, wait for city detection
        if (!isAdmin && !userCity) {
            console.log('⏳ Waiting for city detection before loading notifications');
            const savedCity = localStorage.getItem('nearzo_user_city');
            if (savedCity) {
                console.log(`📬 Using saved city from localStorage: ${savedCity}`);
                setUserCity(savedCity);
            } else {
                await getUserCityLocation();
                return null;
            }
        }

        if (isAdmin) {
            console.log('👑 Admin loading all notifications');
            const data = await getNotifications(100, 0);
            console.log(`📬 Admin loaded ${data.notifications?.length || 0} notifications (all cities)`);
            return data;
        }

        const cityToUse = userCity || localStorage.getItem('nearzo_user_city');
        console.log(`📍 Loading notifications for city: ${cityToUse}`);
        const data = await getNotifications(100, 0, cityToUse);
        console.log(`📬 Loaded ${data.notifications?.length || 0} notifications for city: ${cityToUse}`);
        return data;
    }, [userCity, role, getUserCityLocation]);

    const syncNotificationState = useCallback((nextNotifications, nextSeenIds = seenNotificationIds) => {
        const scopedNotifications = Array.isArray(nextNotifications) ? nextNotifications : [];
        const withLocalSeen = applyLocalSeenStatus(scopedNotifications, nextSeenIds);
        setNotifications(withLocalSeen);
        setFilteredNotifications(withLocalSeen);
        setUnreadCount(countUnseenNotifications(scopedNotifications, nextSeenIds));
    }, [seenNotificationIds]);

    // ─── Load notifications with city filter (or all for admin) ──────────────
    const loadNotifications = useCallback(async () => {
        setNotificationsLoading(true);
        try {
            const data = await fetchNotificationsForCurrentScope();
            if (!data) {
                return [];
            }
            const nextNotifications = data.notifications || [];
            syncNotificationState(nextNotifications);
            return nextNotifications;
        } catch (err) {
            console.error('Failed to load notifications:', err);
            try {
                console.log('📬 Trying fallback - loading all notifications');
                const fallbackData = await getNotifications(100, 0);
                const fallbackNotifications = fallbackData.notifications || [];
                syncNotificationState(fallbackNotifications);
                console.log(`📬 Loaded ${fallbackData.notifications?.length || 0} fallback notifications (no city filter)`);
                return fallbackNotifications;
            } catch (fallbackErr) {
                console.error('Fallback notification load failed:', fallbackErr);
                return [];
            }
        } finally {
            setNotificationsLoading(false);
        }
    }, [fetchNotificationsForCurrentScope, syncNotificationState]);

    // ─── Load per-user unopened count for the badge. ──────────────
    const loadUnreadCount = useCallback(async () => {
        try {
            const data = await fetchNotificationsForCurrentScope();
            const nextNotifications = data?.notifications || [];
            setUnreadCount(countUnseenNotifications(nextNotifications, seenNotificationIds));
        } catch (err) {
            console.error('Failed to load unread count:', err);
            try {
                const fallbackData = await getNotifications(100, 0);
                setUnreadCount(countUnseenNotifications(fallbackData.notifications || [], seenNotificationIds));
            } catch (fallbackErr) {
                console.error('Failed to load unread count fallback:', fallbackErr);
            }
        }
    }, [fetchNotificationsForCurrentScope, seenNotificationIds]);

    // ─── Filter notifications by search query ──────────────────────────────
    const filterNotifications = useCallback((query) => {
        if (!query.trim()) {
            setFilteredNotifications(notifications);
            return;
        }
        
        const lowerQuery = query.toLowerCase().trim();
        const filtered = notifications.filter(n => 
            n.title?.toLowerCase().includes(lowerQuery) ||
            n.message?.toLowerCase().includes(lowerQuery) ||
            n.city?.toLowerCase().includes(lowerQuery) ||
            n.type?.toLowerCase().includes(lowerQuery) ||
            n.created_by_name?.toLowerCase().includes(lowerQuery)
        );
        setFilteredNotifications(filtered);
    }, [notifications]);

    // ─── Handle search query change ─────────────────────────────────────────
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        filterNotifications(query);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setFilteredNotifications(notifications);
    };

    // ─── Initialize ─────────────────────────────────────────────────────────────
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

    // ─── Get user city and load notifications ──────────────────────────────────
    useEffect(() => {
        if (!loading && role) {
            getUserCityLocation();
        }
    }, [loading, role, getUserCityLocation]);

    useEffect(() => {
        if (role && userCity !== undefined) {
            loadNotifications();
            loadUnreadCount();

            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
            pollingInterval.current = setInterval(() => {
                loadUnreadCount();
                if (notificationDialogOpen) {
                    loadNotifications();
                }
            }, NOTIFICATION_POLL_MS);
        }

        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [role, userCity, loadNotifications, loadUnreadCount, notificationDialogOpen]);

    useEffect(() => {
        if (!role) return;

        const refreshNotifications = () => {
            loadUnreadCount();
            if (notificationDialogOpen) {
                loadNotifications();
            }
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                refreshNotifications();
            }
        };

        window.addEventListener('focus', refreshNotifications);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', refreshNotifications);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [role, notificationDialogOpen, loadNotifications, loadUnreadCount]);

    const handleLogoutRedirect = () => {
        localStorage.removeItem('nearzo_token');
        localStorage.removeItem('nearzo_role');
        localStorage.removeItem('nearzo_user');
        localStorage.removeItem('nearzo_user_city');
        sessionStorage.clear();
        setTimeout(() => { window.location.href = '/app/login'; }, 100);
    };

    const handleLogout = () => {
        haptic('warning');
        setLogoutDialogOpen(false);
        setProfileMenuAnchor(null);
        handleLogoutRedirect();
    };

    const isAdmin = role === 'admin';
    const navItems = role ? (NAV_CONFIG[role] || NAV_CONFIG.user) : [];
    const unreadBadgeCount = normalizeUnreadCount(unreadCount);

    const isActivePath = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    const currentNavIndex = navItems.findIndex(item => isActivePath(item.path));
    const activeNavIndex = currentNavIndex >= 0 ? currentNavIndex : 0;

    useLayoutEffect(() => {
        if (isAdmin || !isMobile || navItems.length === 0) return;

        const previousIndex = previousBottomNavIndexRef.current;
        if (activeNavIndex !== previousIndex) {
            setBottomNavDirection(activeNavIndex > previousIndex ? 1 : -1);
            previousBottomNavIndexRef.current = activeNavIndex;
        }

        const updateIndicator = () => {
            const track = bottomNavTrackRef.current;
            const activeItem = bottomNavItemRefs.current[activeNavIndex];
            if (!track || !activeItem) return;

            const trackRect = track.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            setBottomNavIndicator({
                left: itemRect.left - trackRect.left,
                width: itemRect.width,
                ready: true,
            });
        };

        updateIndicator();
        const frameId = requestAnimationFrame(updateIndicator);
        const midTimer = window.setTimeout(updateIndicator, 160);
        const endTimer = window.setTimeout(updateIndicator, 340);
        window.addEventListener('resize', updateIndicator);

        return () => {
            cancelAnimationFrame(frameId);
            window.clearTimeout(midTimer);
            window.clearTimeout(endTimer);
            window.removeEventListener('resize', updateIndicator);
        };
    }, [activeNavIndex, isAdmin, isMobile, navItems.length]);

    const markNotificationsSeenLocally = useCallback((notificationsToMark = notifications) => {
        const nextSeenIds = new Set(seenNotificationIds);
        const scopedNotificationsToMark = Array.isArray(notificationsToMark) ? notificationsToMark : [];
        let hasNewSeenId = false;
        scopedNotificationsToMark.forEach((notification) => {
            const notificationId = getNotificationIdentity(notification);
            if (notificationId) {
                hasNewSeenId = hasNewSeenId || !nextSeenIds.has(notificationId);
                nextSeenIds.add(notificationId);
            }
        });

        if (!hasNewSeenId) {
            return;
        }

        const countSource = scopedNotificationsToMark.length > 1 ? scopedNotificationsToMark : notifications;
        saveSeenNotificationIds(notificationSeenStorageKey, nextSeenIds);
        setSeenNotificationIds(nextSeenIds);
        setNotifications(prev => applyLocalSeenStatus(prev, nextSeenIds));
        setFilteredNotifications(prev => applyLocalSeenStatus(prev, nextSeenIds));
        setUnreadCount(countUnseenNotifications(countSource, nextSeenIds));
    }, [notifications, notificationSeenStorageKey, seenNotificationIds]);

    const handleNotificationClick = async (notification) => {
        haptic('select');
        markNotificationsSeenLocally([notification]);
        setNotificationDialogOpen(false);
        if (notification.reference_type === 'shop') navigate(`/app/shops/`);
        else if (notification.reference_type === 'house') navigate(`/app/houses/`);
        else if (notification.reference_type === 'job') navigate(`/app/jobs/`);
    };

    const openNotificationsDialog = async () => {
        haptic('action');
        setNotificationDialogOpen(true);
        setSearchQuery('');
        markNotificationsSeenLocally(notifications);
        const loadedNotifications = await loadNotifications();
        markNotificationsSeenLocally(loadedNotifications);
    };

    // ─── Profile Menu Handlers ──────────────────────────────────────────────────
    const handleProfileMenuOpen = (event) => {
        haptic('action');
        setProfileMenuAnchor(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setProfileMenuAnchor(null);
    };

    const handleProfileClick = () => {
        haptic('select');
        setProfileMenuAnchor(null);
        navigate('/app/profile');
    };

    const handleLogoutClick = () => {
        handleProfileMenuClose();
        haptic('warning');
        setLogoutDialogOpen(true);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_shop': return <StoreIcon sx={{ fontSize: 20, color: C.accent }} />;
            case 'new_house': return <HomeOutlinedIcon sx={{ fontSize: 20, color: C.green }} />;
            case 'new_job': return <WorkIcon sx={{ fontSize: 20, color: C.amber }} />;
            default: return <NotificationsIcon sx={{ fontSize: 20, color: C.accent }} />;
        }
    };

    const renderNotificationBadge = () => (
        <Badge
            badgeContent={unreadBadgeCount}
            max={99}
            color="error"
            invisible={unreadBadgeCount === 0}
            overlap="circular"
            sx={{
                '& .MuiBadge-badge': {
                    minWidth: 18,
                    height: 18,
                    px: '5px',
                    fontFamily: FONT,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    lineHeight: '18px',
                    border: `2px solid ${C.surfaceAlt}`,
                    top: 2,
                    right: 2,
                },
            }}
        >
            <NotificationsIcon sx={{ fontSize: '1.15rem' }} />
        </Badge>
    );

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
                bgcolor: C.surface,
                borderRight: `1px solid ${C.borderLight}`,
            }}>
                <Box sx={{
                    p: sidebarCollapsed ? 1.5 : 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                    borderBottom: `1px solid ${C.borderLight}`,
                    minHeight: TOP_BAR_HEIGHT,
                }}>
                    {!sidebarCollapsed && (
                        <Box
                            component="img" src={logo} alt="NearZO"
                            sx={{ width: 124, height: 'auto', cursor: 'pointer', objectFit: 'contain' }}
                            onClick={() => { haptic('tap'); navigate('/'); }}
                        />
                    )}
                    {sidebarCollapsed && (
                        <Box
                            component="img" src={logo} alt="NearZO"
                            sx={{ width: 40, height: 'auto', cursor: 'pointer', objectFit: 'contain' }}
                            onClick={() => { haptic('tap'); navigate('/'); }}
                        />
                    )}
                    {!sidebarCollapsed && (
                        <IconButton
                            onClick={() => { haptic('tap'); setSidebarCollapsed(true); }}
                            size="small"
                            sx={{ color: C.textMuted, '&:hover': { color: C.accent, bgcolor: C.accentLight } }}
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
                            sx={{ color: C.textMuted, '&:hover': { color: C.accent, bgcolor: C.accentLight } }}
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
                                            bgcolor: active ? C.accentLight : 'transparent',
                                            '&:hover': { bgcolor: active ? C.accentLight : C.surfaceAlt },
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <ListItemIcon sx={{
                                            minWidth: 0,
                                            mr: sidebarCollapsed ? 0 : 1.5,
                                            color: active ? C.accent : C.textMuted,
                                            '& svg': { fontSize: '1.2rem' }
                                        }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        {!sidebarCollapsed && (
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontSize: '0.825rem',
                                                    fontFamily: FONT,
                                                    fontWeight: active ? 700 : 500,
                                                    color: active ? C.accent : C.textSub,
                                                    letterSpacing: '-0.01em',
                                                }}
                                            />
                                        )}
                                        {!sidebarCollapsed && active && (
                                            <Box sx={{
                                                width: 5, height: 5, borderRadius: '50%',
                                                bgcolor: C.accent, ml: 'auto', flexShrink: 0
                                            }} />
                                        )}
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                        );
                    })}
                </List>

                <Box sx={{ px: 1, pb: 2 }}>
                    <Divider sx={{ mb: 1.5, borderColor: C.borderLight }} />
                    <Tooltip title={sidebarCollapsed ? 'Logout' : ''} placement="right">
                        <ListItemButton
                            onClick={() => { haptic('warning'); setLogoutDialogOpen(true); }}
                            sx={{
                                borderRadius: '10px',
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                px: sidebarCollapsed ? 1.2 : 1.5,
                                py: 1,
                                '&:hover': { bgcolor: C.redLight },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: sidebarCollapsed ? 0 : 1.5, color: C.textMuted, '& svg': { fontSize: '1.2rem' } }}>
                                <LogoutIcon />
                            </ListItemIcon>
                            {!sidebarCollapsed && (
                                <ListItemText
                                    primary="Logout"
                                    primaryTypographyProps={{
                                        fontSize: '0.825rem',
                                        fontFamily: FONT,
                                        fontWeight: 500,
                                        color: C.textMuted,
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
                            borderRight: `1px solid ${C.borderLight}`,
                            bgcolor: C.surface,
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
                    transitionDuration={{ enter: 320, exit: 260 }}
                    SlideProps={{ easing: { enter: SHEET_EASE_ENTER, exit: SHEET_EASE_EXIT } }}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            width: `min(${DRAWER_WIDTH}px, calc(100vw - 48px))`,
                            boxSizing: 'border-box',
                            bgcolor: C.surface,
                            maxWidth: '100vw',
                            overflowX: 'hidden',
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
        if (isAdmin) return null;
        const primaryColor = theme.palette.primary?.main || C.accent;
        const primaryContrastText = theme.palette.primary?.contrastText || '#ffffff';

        return (
            <>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                    .nearzo-bottom-nav-item {
                        -webkit-tap-highlight-color: transparent;
                    }

                    .nearzo-bottom-nav-item:active .nearzo-nav-inner {
                        transform: scale(0.88) !important;
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .nearzo-moving-pill,
                        .nearzo-bottom-nav-item,
                        .nearzo-nav-inner,
                        .nearzo-nav-label {
                            transition: none !important;
                        }
                    }
                `}</style>

                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                        pb: 'max(env(safe-area-inset-bottom, 0px), 14px)',
                        pt: '10px',
                        pointerEvents: 'none',
                    }}
                >
                    <Box
                        ref={bottomNavTrackRef}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            position: 'relative',
                            pointerEvents: 'all',
                            bgcolor: C.surface,
                            borderRadius: '100px',
                            px: '6px',
                            py: '6px',
                            maxWidth: 'calc(100vw - 16px)',
                            overflowX: 'hidden',
                            border: `1px solid ${C.border}`,
                            boxShadow: `0 4px 20px ${C.shadowMd}, 0 1px 2px rgba(0,0,0,0.05)`,
                        }}
                    >
                        <Box
                            className="nearzo-moving-pill"
                            sx={{
                                position: 'absolute',
                                left: 0,
                                top: '6px',
                                height: '44px',
                                width: `${bottomNavIndicator.width}px`,
                                borderRadius: '100px',
                                bgcolor: primaryColor,
                                boxShadow: `0 4px 14px ${C.shadow}`,
                                opacity: bottomNavIndicator.ready ? 1 : 0,
                                transform: `translateX(${bottomNavIndicator.left}px)`,
                                transition: 'transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), width 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.16s ease',
                                pointerEvents: 'none',
                            }}
                        />
                        {navItems.map((item, index) => {
                            const active = index === activeNavIndex;
                            const activeWidth = Math.min(118, Math.max(92, item.label.length * 8 + 60));

                            return (
                                <Box
                                    key={item.label}
                                    ref={(node) => {
                                        bottomNavItemRefs.current[index] = node;
                                    }}
                                    className="nearzo-bottom-nav-item"
                                    data-active={active ? 'true' : 'false'}
                                    onClick={() => {
                                        haptic(active ? 'tap' : 'select');
                                        navigate(item.path);
                                    }}
                                    sx={{
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        WebkitUserSelect: 'none',
                                        position: 'relative',
                                        zIndex: 1,
                                        width: active ? `${activeWidth}px` : '44px',
                                        height: '44px',
                                        transition: 'width 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
                                    }}
                                >
                                    <Box
                                        className="nearzo-nav-inner"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: active ? '7px' : 0,
                                            width: '100%',
                                            height: '44px',
                                            px: active ? '14px' : 0,
                                            borderRadius: '100px',
                                            bgcolor: active && !bottomNavIndicator.ready ? primaryColor : 'transparent',
                                            color: active ? primaryContrastText : C.textMuted,
                                            transition: 'background-color 0.2s ease, color 0.24s ease, gap 0.28s ease, padding 0.28s ease, transform 0.1s ease',
                                            '&:hover': {
                                                bgcolor: active ? primaryColor : C.accentLight,
                                                color: active ? primaryContrastText : primaryColor,
                                            },
                                            '& svg': {
                                                fontSize: active ? '1.15rem' : '1.22rem',
                                                transition: 'font-size 0.24s ease',
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                            {item.icon}
                                        </Box>
                                        <Typography
                                            className="nearzo-nav-label"
                                            sx={{
                                                fontFamily: FONT,
                                                fontWeight: 700,
                                                fontSize: '0.82rem',
                                                color: 'inherit',
                                                letterSpacing: 0,
                                                whiteSpace: 'nowrap',
                                                lineHeight: 1,
                                                overflow: 'hidden',
                                                maxWidth: active ? '74px' : 0,
                                                opacity: active ? 1 : 0,
                                                transform: active ? 'translateX(0)' : `translateX(${bottomNavDirection * 8}px)`,
                                                transition: 'max-width 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease 0.06s, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
                                            }}
                                        >
                                            {item.label}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </>
        );
    };

    // ─── TOP BAR ────────────────────────────────────────────────────────────────
    const renderTopBar = () => {
        const cityDisplay = !isAdmin ? (
            userCity ? (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '8px',
                    bgcolor: C.accentLight,
                    color: C.accent,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    fontFamily: FONT,
                    border: `1px solid ${C.accentMid}`,
                }}>
                    <LocationOnIcon sx={{ fontSize: 12 }} />
                    <span>{userCity}</span>
                </Box>
            ) : cityLoading ? (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '8px',
                    bgcolor: C.surfaceAlt,
                    color: C.textMuted,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    fontFamily: FONT,
                }}>
                    <CircularProgress size={12} thickness={4} sx={{ color: C.textMuted }} />
                    <span>Detecting city...</span>
                </Box>
            ) : null
        ) : (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                bgcolor: C.purpleLight,
                color: C.purple,
                fontSize: '0.7rem',
                fontWeight: 600,
                fontFamily: FONT,
                border: `1px solid ${C.purple}44`,
            }}>
                <DashboardIcon sx={{ fontSize: 12 }} />
                <span>All Cities</span>
            </Box>
        );

        return (
            <Box
                sx={{
                    height: TOP_BAR_HEIGHT,
                    width: '100%',
                    maxWidth: '100vw',
                    overflowX: 'hidden',
                    px: { xs: 1.5, sm: 2.5 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: `1px solid ${C.borderLight}`,
                    position: isMobile ? 'fixed' : 'sticky',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1100,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                    <Box
                        component="img" src={logo} alt="NearZO"
                        sx={{ width: 112, height: 'auto', objectFit: 'contain', cursor: 'pointer' }}
                        onClick={() => { haptic('tap'); navigate('/'); }}
                    />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Notifications" arrow>
                        <IconButton
                            size="small"
                            onClick={openNotificationsDialog}
                            sx={{
                                width: 38, height: 38,
                                borderRadius: '12px',
                                color: C.textMuted,
                                bgcolor: C.surfaceAlt,
                                '&:hover': { bgcolor: C.accentLight, color: C.accent },
                                transition: 'all 0.15s ease',
                                overflow: 'visible',
                                '&:active': { transform: 'scale(0.88)' },
                            }}
                        >
                            {renderNotificationBadge()}
                        </IconButton>
                    </Tooltip>

                    <Box
                        onClick={handleProfileMenuOpen}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            ml: 0.5,
                            pl: 1,
                            pr: 1.2,
                            py: 0.6,
                            borderRadius: '12px',
                            bgcolor: C.surfaceAlt,
                            cursor: 'pointer',
                            border: '1px solid transparent',
                            transition: 'all 0.15s ease',
                            '&:hover': { bgcolor: C.accentLight, borderColor: C.accentMid },
                            '&:active': { transform: 'scale(0.94)' },
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 26,
                                height: 26,
                                bgcolor: C.accent,
                                color: '#fff',
                            }}
                        >
                            <PersonIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                      
                    </Box>
{/* sok */}
                    <Menu
                        anchorEl={profileMenuAnchor}
                        open={profileMenuOpen}
                        onClose={handleProfileMenuClose}
                        onClick={handleProfileMenuClose}
                        transitionDuration={{ enter: 220, exit: 160 }}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                mt: 1,
                                borderRadius: '14px',
                                border: `1px solid ${C.borderLight}`,
                                boxShadow: `0 8px 32px ${C.shadowLg}`,
                                minWidth: 170,
                                overflow: 'hidden',
                                '& .MuiMenuItem-root': {
                                    px: 2, 
                                    py: 1.2,
                                    fontSize: '0.82rem',
                                    fontFamily: FONT,
                                    fontWeight: 600,
                                    color: C.text,
                                    gap: 1.5,
                                    '&:hover': { bgcolor: C.accentLight },
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleProfileClick}>
                            <AccountCircleIcon sx={{ fontSize: '1.1rem', color: C.accent }} />
                            Profile
                        </MenuItem>
                        <Divider sx={{ my: 0.5, borderColor: C.borderLight }} />
                        <MenuItem onClick={handleLogoutClick}>
                            <LogoutIcon sx={{ fontSize: '1.1rem', color: C.textMuted }} />
                            <Typography sx={{ fontFamily: FONT, fontSize: '0.82rem', fontWeight: 600, color: C.textMuted }}>
                                Logout
                            </Typography>
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>
        );
    };

    // ─── NOTIFICATION DIALOG ────────────────────────────────────────────────────
    const renderNotificationDialog = () => {
        const displayNotifications = searchQuery.trim() ? filteredNotifications : notifications;

        return (
            <Dialog
                open={notificationDialogOpen}
                onClose={() => { haptic('tap'); setNotificationDialogOpen(false); }}
                fullScreen
                TransitionComponent={SlideUpTransition}
                transitionDuration={{ enter: 360, exit: 280 }}
                PaperProps={{
                    sx: { bgcolor: C.bg, backgroundImage: 'none' }
                }}
            >
                <Box sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    bgcolor: C.surface,
                    borderBottom: `1px solid ${C.borderLight}`,
                    px: 2,
                    py: 1.5,
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1.5,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1.1rem', color: C.text }}>
                                Notifications
                            </Typography>
                            {isAdmin ? (
                                <Chip
                                    label="All Cities"
                                    size="small"
                                    sx={{
                                        bgcolor: C.purpleLight,
                                        color: C.purple,
                                        fontWeight: 600,
                                        fontSize: '0.65rem',
                                        height: 22,
                                        '& .MuiChip-label': { px: 1 },
                                    }}
                                    icon={<DashboardIcon sx={{ fontSize: 12 }} />}
                                />
                            ) : userCity ? (
                                <Chip
                                    label={userCity}
                                    size="small"
                                    sx={{
                                        bgcolor: C.accentLight,
                                        color: C.accent,
                                        fontWeight: 600,
                                        fontSize: '0.65rem',
                                        height: 22,
                                        '& .MuiChip-label': { px: 1 },
                                    }}
                                    icon={<LocationOnIcon sx={{ fontSize: 12 }} />}
                                />
                            ) : (
                                <Chip
                                    label="No City"
                                    size="small"
                                    sx={{
                                        bgcolor: C.amberLight,
                                        color: C.amber,
                                        fontWeight: 600,
                                        fontSize: '0.65rem',
                                        height: 22,
                                    }}
                                    icon={<LocationOnIcon sx={{ fontSize: 12 }} />}
                                />
                            )}
                            {notifications.length > 0 && (
                                <Chip
                                    label={`${displayNotifications.length} shown`}
                                    size="small"
                                    sx={{
                                        bgcolor: C.surfaceAlt,
                                        color: C.textMuted,
                                        fontWeight: 500,
                                        fontSize: '0.6rem',
                                        height: 20,
                                    }}
                                />
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                                onClick={() => { haptic('tap'); setNotificationDialogOpen(false); }}
                                size="small"
                                sx={{ bgcolor: C.surfaceAlt, borderRadius: '10px', '&:active': { transform: 'scale(0.88)' } }}
                            >
                                <CloseIcon sx={{ fontSize: '1.2rem', color: C.textMuted }} />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Search Bar */}
                    <Fade in={true}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search notifications..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    bgcolor: C.surfaceAlt,
                                    '& fieldset': {
                                        borderColor: 'transparent',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: C.accentMid,
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: C.accent,
                                    },
                                    '& input': {
                                        fontFamily: FONT,
                                        fontSize: '0.82rem',
                                        py: 1,
                                        '&::placeholder': {
                                            color: C.textMuted,
                                            fontWeight: 400,
                                        }
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: C.textMuted, fontSize: '1.1rem' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={handleClearSearch}
                                            sx={{ p: 0.5 }}
                                        >
                                            <ClearIcon sx={{ fontSize: '1rem', color: C.textMuted }} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Fade>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                    {!isAdmin && cityLoading ? (
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            py: 8,
                            gap: 2
                        }}>
                            <CircularProgress size={32} thickness={4} sx={{ color: C.accent }} />
                            <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', color: C.textMuted }}>
                                Detecting your location...
                            </Typography>
                        </Box>
                    ) : !isAdmin && !userCity ? (
                        <Box sx={{ 
                            textAlign: 'center', 
                            py: 8, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: 2 
                        }}>
                            <Box sx={{
                                width: 64, height: 64, borderRadius: '50%', 
                                bgcolor: C.amberLight,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <LocationOnIcon sx={{ fontSize: 28, color: C.amber }} />
                            </Box>
                            <Typography sx={{ fontFamily: FONT, fontSize: '0.9rem', color: C.textSub, fontWeight: 600 }}>
                                Location Not Detected
                            </Typography>
                            <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: C.textMuted, maxWidth: 280 }}>
                                {locationError || 'Please enable location services or set your city in profile to see local notifications.'}
                            </Typography>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => { haptic('action'); setNotificationDialogOpen(false); navigate('/app/profile'); }}
                                sx={{
                                    textTransform: 'none',
                                    fontFamily: FONT,
                                    fontWeight: 600,
                                    bgcolor: C.accent,
                                    borderRadius: '10px',
                                    mt: 1,
                                }}
                            >
                                Go to Profile
                            </Button>
                        </Box>
                    ) : notificationsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress size={32} thickness={4} sx={{ color: C.accent }} />
                        </Box>
                    ) : displayNotifications.length === 0 ? (
                        <Box sx={{ 
                            textAlign: 'center', 
                            py: 8, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: 2 
                        }}>
                            <Box sx={{
                                width: 64, height: 64, borderRadius: '50%', 
                                bgcolor: C.accentLight,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <NotificationsIcon sx={{ fontSize: 28, color: C.accent, opacity: 0.7 }} />
                            </Box>
                            <Typography sx={{ fontFamily: FONT, fontSize: '0.9rem', color: C.textSub, fontWeight: 600 }}>
                                {searchQuery.trim() ? 'No matching notifications' :
                                    isAdmin ? 'No notifications across all cities' : `No notifications in ${userCity}`
                                }
                            </Typography>
                            <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: C.textMuted, maxWidth: 280 }}>
                                {searchQuery.trim() ? 'Try adjusting your search terms.' :
                                    isAdmin 
                                        ? 'When users post shops, houses, or jobs anywhere, you\'ll see them here.'
                                        : `When someone posts new shops, houses, or jobs in ${userCity}, you'll see them here.`
                                }
                            </Typography>
                        </Box>
                    ) : (
                        displayNotifications.map((notification) => (
                            <Box
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    bgcolor: notification.is_read ? C.surface : C.accentLight,
                                    borderRadius: '14px',
                                    p: 2,
                                    mb: 1.5,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    border: '1px solid',
                                    borderColor: notification.is_read ? C.borderLight : C.accentMid,
                                    WebkitTapHighlightColor: 'transparent',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: `0 4px 12px ${C.shadowMd}`,
                                        borderColor: C.accentMid,
                                    },
                                    '&:active': {
                                        transform: 'scale(0.97)',
                                        boxShadow: 'none',
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Box sx={{
                                        width: 40, height: 40, borderRadius: '12px',
                                        bgcolor: notification.type === 'new_shop' ? C.accentLight :
                                                 notification.type === 'new_house' ? C.greenLight : C.amberLight,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        {getNotificationIcon(notification.type)}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{
                                            fontFamily: FONT, fontWeight: notification.is_read ? 600 : 800,
                                            fontSize: '0.85rem', color: C.text, mb: 0.5,
                                        }}>
                                            {notification.title}
                                        </Typography>
                                        <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: C.textSub, lineHeight: 1.5, mb: 0.75 }}>
                                            {notification.message}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            <Typography sx={{ fontFamily: FONT, fontSize: '0.65rem', color: C.textMuted, fontWeight: 600 }}>
                                                {formatTimeAgo(notification.created_at)}
                                            </Typography>
                                            {notification.city && (
                                                <>
                                                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: C.textMuted }} />
                                                    <Typography sx={{ 
                                                        fontFamily: FONT, fontSize: '0.65rem', 
                                                        color: isAdmin ? C.purple : C.accent, 
                                                        fontWeight: 600,
                                                        display: 'flex', alignItems: 'center', gap: 0.5
                                                    }}>
                                                        <LocationOnIcon sx={{ fontSize: 10 }} />
                                                        {notification.city}
                                                    </Typography>
                                                </>
                                            )}
                                            {notification.is_my_notification && (
                                                <>
                                                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: C.textMuted }} />
                                                    <Chip
                                                        label="You"
                                                        size="small"
                                                        sx={{
                                                            height: 16,
                                                            fontSize: '0.55rem',
                                                            fontWeight: 700,
                                                            bgcolor: C.accentLight,
                                                            color: C.accent,
                                                            '& .MuiChip-label': { px: 0.8 },
                                                        }}
                                                    />
                                                </>
                                            )}
                                            {!notification.is_read && (
                                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: C.accent }} />
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        ))
                    )}
                </Box>
            </Dialog>
        );
    };

    // ─── LOGOUT DIALOG ──────────────────────────────────────────────────────────
    const renderLogoutDialog = () => (
        <Dialog
            open={logoutDialogOpen}
            onClose={() => { haptic('tap'); setLogoutDialogOpen(false); }}
            transitionDuration={{ enter: 240, exit: 180 }}
            PaperProps={{
                sx: {
                    borderRadius: '18px',
                    boxShadow: `0 20px 60px ${C.shadowLg}`,
                    border: `1px solid ${C.borderLight}`,
                    p: 0.5,
                    minWidth: 300,
                }
            }}
        >
            <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1rem', color: C.text, pb: 0.5 }}>
                Log out?
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ fontFamily: FONT, fontSize: '0.85rem', color: C.textMuted, lineHeight: 1.6 }}>
                    You'll need to sign in again to access your account.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
                <Button
                    onClick={() => { haptic('tap'); setLogoutDialogOpen(false); }}
                    sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        color: C.textSub,
                        fontFamily: FONT,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        px: 2,
                        bgcolor: C.surfaceAlt,
                        '&:hover': { bgcolor: C.borderLight },
                        '&:active': { transform: 'scale(0.94)' },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleLogout}
                    variant="contained"
                    disableElevation
                    sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        fontFamily: FONT,
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        px: 2.5,
                        bgcolor: C.accent,
                        '&:hover': { bgcolor: C.accentDark },
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: C.surface }}>
                <Box component="img" src={loadingGif} alt="Loading..." sx={{ width: 120, height: 'auto', objectFit: 'contain' }} />
            </Box>
        );
    }

    if (!role) return null;

    // ─── ADMIN LAYOUT ───────────────────────────────────────────────────────────
    if (isAdmin) {
        return (
            <>
                <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', bgcolor: C.bg, fontFamily: FONT }}>
                    {renderSidebar()}

                    <Box component="main" sx={{ flexGrow: 1, bgcolor: C.surface, minWidth: 0, width: '100%', maxWidth: '100%', overflowX: 'hidden', minHeight: '100vh' }}>
                        <Box
                            sx={{
                                height: TOP_BAR_HEIGHT,
                                width: '100%',
                                maxWidth: '100vw',
                                overflowX: 'hidden',
                                px: { xs: 1.5, md: 3 },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                bgcolor: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(12px)',
                                borderBottom: `1px solid ${C.borderLight}`,
                                position: { xs: 'fixed', md: 'sticky' },
                                top: 0,
                                left: { xs: 0, md: 'auto' },
                                right: { xs: 0, md: 'auto' },
                                zIndex: 1100,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                                <IconButton
                                    onClick={() => { haptic('tap'); setMobileOpen(!mobileOpen); }}
                                    sx={{
                                        display: { xs: 'flex', md: 'none' },
                                        color: C.textMuted,
                                        width: 36, height: 36,
                                        borderRadius: '10px',
                                        bgcolor: C.surfaceAlt,
                                        '&:active': { transform: 'scale(0.88)' },
                                    }}
                                >
                                    <MenuIcon sx={{ fontSize: '1.1rem' }} />
                                </IconButton>
                                <Typography noWrap sx={{ fontWeight: 700, fontFamily: FONT, color: C.text, fontSize: '1rem', letterSpacing: '-0.02em', minWidth: 0 }}>
                                    {navItems.find(item => isActivePath(item.path))?.label || 'Dashboard'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
                                <Tooltip title="Notifications" arrow>
                                    <IconButton
                                        size="small"
                                        onClick={openNotificationsDialog}
                                        sx={{
                                            width: 38, height: 38,
                                            borderRadius: '12px',
                                            color: C.textMuted,
                                            bgcolor: C.surfaceAlt,
                                            '&:hover': { bgcolor: C.accentLight, color: C.accent },
                                            overflow: 'visible',
                                            '&:active': { transform: 'scale(0.88)' },
                                        }}
                                    >
                                        {renderNotificationBadge()}
                                    </IconButton>
                                </Tooltip>

                                <Box
                                    onClick={handleProfileMenuOpen}
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 1,
                                        pl: 1, pr: 1.2, py: 0.6,
                                        borderRadius: '12px',
                                        bgcolor: C.surfaceAlt,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: C.accentLight },
                                        '&:active': { transform: 'scale(0.94)' },
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 26,
                                            height: 26,
                                            bgcolor: C.accent,
                                            color: '#fff',
                                        }}
                                    >
                                        <PersonIcon sx={{ fontSize: 16 }} />
                                    </Avatar>
                                    <Typography sx={{ fontSize: '0.75rem', fontFamily: FONT, fontWeight: 600, color: C.textSub, display: { xs: 'none', sm: 'block' } }}>
                                        Admin
                                    </Typography>
                                </Box>

                                <Menu
                                    anchorEl={profileMenuAnchor}
                                    open={profileMenuOpen}
                                    onClose={handleProfileMenuClose}
                                    onClick={handleProfileMenuClose}
                                    transitionDuration={{ enter: 220, exit: 160 }}
                                    PaperProps={{
                                        elevation: 0,
                                        sx: {
                                            mt: 1,
                                            borderRadius: '14px',
                                            border: `1px solid ${C.borderLight}`,
                                            boxShadow: `0 8px 32px ${C.shadowLg}`,
                                            minWidth: 170,
                                            overflow: 'hidden',
                                            '& .MuiMenuItem-root': {
                                                px: 2, 
                                                py: 1.2,
                                                fontSize: '0.82rem',
                                                fontFamily: FONT,
                                                fontWeight: 600,
                                                color: C.text,
                                                gap: 1.5,
                                                '&:hover': { bgcolor: C.accentLight },
                                            },
                                        },
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem onClick={handleProfileClick}>
                                        <AccountCircleIcon sx={{ fontSize: '1.1rem', color: C.accent }} />
                                        Profile
                                    </MenuItem>
                                    <Divider sx={{ my: 0.5, borderColor: C.borderLight }} />
                                    <MenuItem onClick={handleLogoutClick}>
                                        <LogoutIcon sx={{ fontSize: '1.1rem', color: C.textMuted }} />
                                        <Typography sx={{ fontFamily: FONT, fontSize: '0.82rem', fontWeight: 600, color: C.textMuted }}>
                                            Logout
                                        </Typography>
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </Box>

                        <Box sx={{ p: { xs: 1.5, md: 3 }, pt: { xs: `calc(${TOP_BAR_HEIGHT}px + 12px)`, md: 3 }, width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
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
                    width: '100%',
                    maxWidth: '100vw',
                    overflowX: 'hidden',
                    bgcolor: C.surface,
                    fontFamily: FONT,
                    pb: `${BOTTOM_NAV_HEIGHT + 32}px`,
                }}
            >
                {renderTopBar()}
                <Box sx={{ flex: 1, minHeight: '100vh', width: '100%', maxWidth: '100%', overflowX: 'hidden', bgcolor: C.surface, pt: { xs: `${TOP_BAR_HEIGHT}px`, md: 0 } }}>
                    <Outlet />
                </Box>
            </Box>

            {renderBottomNav()}
            {renderNotificationDialog()}
            {renderLogoutDialog()}

            <Snackbar
                open={installSnackbarOpen}
                autoHideDuration={3500}
                onClose={() => setInstallSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                message="App is already installed or not supported on this browser"
                ContentProps={{
                    sx: {
                        fontFamily: FONT,
                        fontSize: '0.82rem',
                        borderRadius: '12px',
                        bgcolor: C.text,
                        mb: `${BOTTOM_NAV_HEIGHT + 16}px`,
                    }
                }}
            />
        </>
    );
}

export default AppLayout;
