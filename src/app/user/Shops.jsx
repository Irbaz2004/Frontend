// app/user/Shops.jsx - Updated with full-screen drawer and Map.jsx design consistency

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Typography,
    Chip,
    IconButton,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    Button,
    Divider,
    Skeleton,
    Drawer,
    useMediaQuery,
    useTheme,
    Dialog,
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Close as CloseIcon,
    Phone as PhoneIcon,
    Directions as DirectionsIcon,
    Store as StoreIcon,
    Clear as ClearIcon,
    Verified as VerifiedIcon,
    Pending as PendingIcon,
    KeyboardArrowDown as ArrowDownIcon,
    ChevronRight as ChevronRightIcon,
    ShoppingBag as ShoppingBagIcon,
    Visibility as VisibilityIcon,
    MyLocation as MyLocationIcon,
    Refresh as RefreshIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { getShopsByLocation, getShopById, getShopCategoriesWithCount, incrementShopViewCount } from '../../services/shops';

// ─── Design tokens (matching Map.jsx) ────────────────────────────────────────
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
    shadowLg:    'rgba(15,23,42,0.15)',
    white:       '#FFFFFF',
};

// Bottom nav height — must match AppLayout.jsx BOTTOM_NAV_HEIGHT
const BOTTOM_NAV_OFFSET = 150;

/* ─── Skeleton row ───────────────────────────────────────────────────────── */
const ShopRowSkeleton = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
        <Skeleton variant="rounded" width={78} height={78} sx={{ borderRadius: '10px', flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={22 } />
            <Skeleton variant="text" width="40%" height={18} />
            <Skeleton variant="text" width="50%" height={16} />
        </Box>
        <Skeleton variant="circular" width={40} height={40} />
    </Box>
);

/* ─── Shop Row ────────────────────────────────────────────────────────────── */
function ShopRow({ shop, onClick, onCall }) {
    const isOpen      = shop.is_open ?? true;
    const closingTime = shop.closing_time ?? '10:00 PM';

    return (
        <Box
            onClick={onClick}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.5,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { background: '#f8faff' },
                '&:active': { transform: 'scale(0.98)' },
            }}
        >
            {/* Thumbnail */}
            <Box
                sx={{
                    width: 78,
                    height: 78,
                    borderRadius: '12px',
                    flexShrink: 0,
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${C.surfaceAlt} 0%, ${C.borderLight} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {shop.shop_image ? (
                    <img
                        src={shop.shop_image}
                        alt={shop.business_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StoreIcon" style="font-size: 36px; color: #c4c9d4;"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path></svg>`;
                        }}
                    />
                ) : (
                    <StoreIcon sx={{ fontSize: 36, color: '#c4c9d4' }} />
                )}
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 700,
                        fontSize: 14,
                        color: C.text,
                        lineHeight: 1.3,
                        mb: 0.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {shop.business_name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mb: 0.5 }}>
                    <LocationIcon sx={{ fontSize: 12, color: C.accent, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: C.textMuted, fontWeight: 500 }}>
                        {shop.distance ? `${shop.distance.toFixed(2)} km away` : shop.area}
                    </Typography>
                </Box>

                <Box sx={{ mb: 0.6 }}>
                    <Chip
                        label={shop.category}
                        size="small"
                        sx={{
                            height: 22,
                            borderRadius: '6px',
                            bgcolor: C.accentLight,
                            color: C.accent,
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 600,
                            fontSize: 11,
                            '& .MuiChip-label': { px: '8px' },
                        }}
                    />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Box
                        sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: isOpen ? C.green : '#ef4444',
                            flexShrink: 0,
                        }}
                    />
                    <Typography
                        variant="caption"
                        sx={{ fontFamily: '"Inter", sans-serif', fontSize: 11.5, fontWeight: 600, color: isOpen ? C.green : '#ef4444' }}
                    >
                        {isOpen ? 'Open' : 'Closed'}
                    </Typography>
                    {isOpen && closingTime && (
                        <>
                            <Typography variant="caption" sx={{ color: C.textMuted, fontSize: 11 }}>·</Typography>
                            <Typography variant="caption" sx={{ fontFamily: '"Inter", sans-serif', fontSize: 11, color: C.textMuted }}>
                                Closes {closingTime}
                            </Typography>
                        </>
                    )}
                </Box>
            </Box>

            {/* Call + Arrow */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <Box
                    onClick={onCall}
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        background: C.accentLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        '&:hover': { background: '#c7d9fd', transform: 'scale(1.05)' },
                        '&:active': { transform: 'scale(0.95)' },
                    }}
                >
                    <PhoneIcon sx={{ fontSize: 18, color: C.accent }} />
                </Box>
                <ChevronRightIcon sx={{ fontSize: 20, color: '#9ca3af' }} />
            </Box>
        </Box>
    );
}

/* ─── Filter panel ───────────────────────────────────────────────────────── */
const FilterPanel = ({ radius, setRadius, selectedCategory, setSelectedCategory, categories, clearFilters, onApply }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="subtitle1" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, color: C.text }}>
            Filters
        </Typography>

        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500, color: C.textMuted }}>
                    Distance Radius
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, color: C.accent }}>
                    {radius} km
                </Typography>
            </Box>
            <Slider
                value={radius}
                onChange={(_, val) => setRadius(val)}
                min={1}
                max={50}
                valueLabelDisplay="auto"
                sx={{
                    color: C.accent,
                    height: 4,
                    '& .MuiSlider-thumb': { width: 16, height: 16, '&:hover': { boxShadow: `0 0 0 6px ${C.accent}22` } },
                    '& .MuiSlider-rail': { opacity: 0.2 },
                }}
            />
        </Box>

        <FormControl fullWidth size="small">
            <InputLabel sx={{ fontFamily: '"Inter", sans-serif' }}>Category</InputLabel>
            <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
                sx={{ borderRadius: '8px', fontFamily: '"Inter", sans-serif', fontSize: 14 }}
            >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                    <MenuItem key={cat.category} value={cat.category} sx={{ fontFamily: '"Inter", sans-serif', fontSize: 14 }}>
                        {cat.category}
                        <Typography component="span" variant="caption" sx={{ ml: 'auto', pl: 1, color: C.textMuted }}>
                            {cat.count}
                        </Typography>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>

        <Button
            fullWidth
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={clearFilters}
            size="small"
            sx={{
                fontFamily: '"Inter", sans-serif',
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: C.border,
                color: C.textMuted,
                fontSize: 13,
                '&:hover': { borderColor: C.accent, color: C.accent, background: C.accentLight },
            }}
        >
            Clear All Filters
        </Button>

        <Button
            fullWidth
            variant="contained"
            onClick={onApply}
            sx={{
                fontFamily: '"Inter", sans-serif',
                textTransform: 'none',
                borderRadius: '10px',
                background: C.accent,
                fontWeight: 600,
                '&:hover': { background: C.accentDark },
            }}
        >
            Apply Filters
        </Button>
    </Box>
);

// ─── Full Screen Shop Details Drawer ───────────────────────────────────────
function ShopDetailsDrawer({ shop, onClose, onRoute, onCall, userLocation }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
    
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 600);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const isOpen = shop?.is_open ?? true;
    const closingTime = shop?.closing_time ?? '10:00 PM';
    const openingTime = shop?.opening_time ?? '9:00 AM';

    // Apply different styles based on screen size
    const drawerStyle = isMobile ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        borderRadius: 0,
        margin: 0,
        zIndex: 1400,
        background: C.surface,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    } : {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        top: 'auto',
        maxHeight: '85vh',
        borderRadius: '24px 24px 0 0',
        margin: '0 15px',
        marginBottom: 0,
        zIndex: 500,
        background: C.surface,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: `0 -12px 50px ${C.shadowLg}`,
        border: `1.5px solid ${C.border}`,
        borderBottom: 'none',
    };

    if (!shop) return null;

    return (
        <>
            {/* Backdrop - only visible on desktop */}
            {!isMobile && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 400,
                        background: 'rgba(15,23,42,0.4)',
                        backdropFilter: 'blur(3px)',
                    }}
                    onClick={onClose}
                />
            )}

            <Box sx={drawerStyle}>
                {/* Handle for desktop */}
                {!isMobile && <Box sx={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '10px auto 0' }} />}

                {/* Close button */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: C.surfaceAlt,
                        border: `1.5px solid ${C.border}`,
                        borderRadius: '12px',
                        width: 36,
                        height: 36,
                        zIndex: 10,
                        '&:hover': { bgcolor: C.borderLight },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 18, color: C.textMuted }} />
                </IconButton>

                {/* Shop Image Header */}
                <Box sx={{ position: 'relative', flexShrink: 0, height: isMobile ? 250 : 200 }}>
                    {shop.shop_image ? (
                        <img
                            src={shop.shop_image}
                            alt={shop.business_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `<div style="height:100%;background:linear-gradient(135deg, ${C.surfaceAlt} 0%, ${C.borderLight} 100%);display:flex;align-items:center;justify-content:center"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeLarge" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="StoreIcon" style="font-size: 72px; color: #c4c9d4;"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path></svg></div>`;
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                height: '100%',
                                background: `linear-gradient(135deg, ${C.surfaceAlt} 0%, ${C.borderLight} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <StoreIcon sx={{ fontSize: 72, color: '#c4c9d4' }} />
                        </Box>
                    )}

                    {/* Status Badges */}
                    <Box sx={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 1 }}>
                        <Chip
                            label={shop.is_verified ? 'Verified' : 'Not Verified'}
                            icon={shop.is_verified ? <VerifiedIcon sx={{ fontSize: '14px !important' }} /> : <PendingIcon sx={{ fontSize: '14px !important' }} />}
                            sx={{
                                bgcolor: shop.is_verified ? C.green : C.amber,
                                color: 'white',
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: 600,
                                fontSize: 11,
                                '& .MuiChip-icon': { color: 'white' },
                            }}
                        />
                        <Chip
                            label={isOpen ? 'Open Now' : 'Closed'}
                            sx={{
                                bgcolor: isOpen ? C.green : '#ef4444',
                                color: 'white',
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: 600,
                                fontSize: 11,
                            }}
                        />
                    </Box>

                    {shop.views_count !== undefined && (
                        <Box sx={{ 
                            position: 'absolute', 
                            bottom: 12, 
                            right: 12, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            bgcolor: 'rgba(255,255,255,0.95)',
                            borderRadius: '20px',
                            px: 1.5,
                            py: 0.6,
                            boxShadow: `0 2px 8px ${C.shadowMd}`,
                        }}>
                            <VisibilityIcon sx={{ fontSize: 14, color: C.accent }} />
                            <Typography variant="caption" sx={{ fontFamily: '"Inter", sans-serif', color: C.accent, fontWeight: 600 }}>
                                {shop.views_count} views
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Details Body */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                    <Typography
                        variant="h5"
                        sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, color: C.text, mb: 1, letterSpacing: '-0.3px' }}
                    >
                        {shop.business_name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                        <Chip
                            label={shop.category}
                            size="small"
                            sx={{
                                borderRadius: '6px',
                                bgcolor: C.accentLight,
                                color: C.accent,
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: 600,
                                fontSize: 12,
                            }}
                        />
                        {shop.distance && (
                            <Chip
                                label={`${shop.distance.toFixed(1)} km away`}
                                size="small"
                                sx={{
                                    borderRadius: '6px',
                                    bgcolor: C.surfaceAlt,
                                    color: C.textSub,
                                    fontFamily: '"Inter", sans-serif',
                                    fontSize: 11,
                                }}
                                icon={<LocationIcon sx={{ fontSize: 12, color: C.accent }} />}
                            />
                        )}
                    </Box>

                    <Divider sx={{ mb: 2.5, borderColor: C.borderLight }} />

                    {/* Description */}
                    {shop.description && (
                        <>
                            <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, color: C.text, mb: 1.5 }}>
                                About
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', color: C.textSub, lineHeight: 1.65, mb: 2.5 }}>
                                {shop.description}
                            </Typography>
                            <Divider sx={{ mb: 2.5, borderColor: C.borderLight }} />
                        </>
                    )}

                    {/* Business Hours */}
                    <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, color: C.text, mb: 1.5 }}>
                        Business Hours
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: C.accent }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', color: C.text }}>
                            {openingTime.slice(0,5)} – {closingTime.slice(0,5)}
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2.5, borderColor: C.borderLight }} />

                    {/* Key Items */}
                    {shop.keywords?.length > 0 && (
                        <>
                            <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, color: C.text, mb: 1.5 }}>
                                Key Items Available
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                                {shop.keywords.map((item, idx) => (
                                    <Chip
                                        key={idx}
                                        label={item}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            borderRadius: '6px',
                                            fontFamily: '"Inter", sans-serif',
                                            fontSize: 12,
                                            borderColor: C.border,
                                            color: C.textSub,
                                        }}
                                    />
                                ))}
                            </Box>
                            <Divider sx={{ mb: 2.5, borderColor: C.borderLight }} />
                        </>
                    )}

                    {/* Contact */}
                    <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, color: C.text, mb: 1.5 }}>
                        Contact Information
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PhoneIcon sx={{ fontSize: 16, color: C.accent }} />
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', color: C.text }}>
                                {shop.additional_phone || shop.owner_phone || 'Not available'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LocationIcon sx={{ fontSize: 16, color: C.accent }} />
                            </Box>
                            <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', color: C.text }}>
                                {shop.area}, {shop.city}, {shop.state}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<DirectionsIcon />}
                            onClick={() => onRoute(shop)}
                            sx={{
                                fontFamily: '"Inter", sans-serif',
                                textTransform: 'none',
                                borderRadius: '12px',
                                background: C.accent,
                                fontWeight: 600,
                                py: 1.2,
                                '&:hover': { background: C.accentDark },
                            }}
                        >
                            Directions
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<PhoneIcon />}
                            onClick={() => onCall(shop.additional_phone || shop.owner_phone)}
                            sx={{
                                fontFamily: '"Inter", sans-serif',
                                textTransform: 'none',
                                borderRadius: '12px',
                                borderColor: C.accent,
                                color: C.accent,
                                fontWeight: 600,
                                py: 1.2,
                                '&:hover': { bgcolor: C.accentLight },
                            }}
                        >
                            Call
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

// Missing AccessTimeIcon import
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════════════ */
export default function Shops() {
    const theme    = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const viewedShopsRef = useRef(new Set());

    const [loading,          setLoading]          = useState(true);
    const [shops,            setShops]            = useState([]);
    const [categories,       setCategories]       = useState([]);
    const [error,            setError]            = useState('');
    const [userLocation,     setUserLocation]     = useState(null);
    const [gettingLocation,  setGettingLocation]  = useState(true);
    const [radius,           setRadius]           = useState(10);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm,       setSearchTerm]       = useState('');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [selectedShop,     setSelectedShop]     = useState(null);
    const [detailsOpen,      setDetailsOpen]      = useState(false);
    const [loadingDetails,   setLoadingDetails]   = useState(false);

    const scrollRef = useRef(null);

    /* ── Effects ── */
    useEffect(() => {
        getCurrentLocation();
    }, []);

    useEffect(() => {
        if (userLocation) {
            loadShops();
            loadCategories();
        }
    }, [userLocation, radius, selectedCategory, searchTerm]);

    /* ── Handlers ── */
    const getCurrentLocation = () => {
        setGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                    setGettingLocation(false);
                },
                () => {
                    setError('Unable to get your location.');
                    setGettingLocation(false);
                    setUserLocation({ latitude: 12.9165, longitude: 79.1325 });
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setError('Geolocation not supported.');
            setGettingLocation(false);
            setUserLocation({ latitude: 12.9165, longitude: 79.1325 });
        }
    };

    const loadShops = async () => {
        if (!userLocation) return;
        setLoading(true);
        try {
            const result = await getShopsByLocation({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                radius,
                category: selectedCategory,
                search: searchTerm,
                page: 1,
                limit: 50,
            });
            setShops(result.shops || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const result = await getShopCategoriesWithCount();
            setCategories(result.categories || []);
        } catch {
            // silent
        }
    };

    const handleShopClick = useCallback(async (shop) => {
        if (viewedShopsRef.current.has(shop.id)) {
            setLoadingDetails(true);
            setDetailsOpen(true);
            try {
                const result = await getShopById(shop.id, userLocation);
                setSelectedShop(result.shop);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoadingDetails(false);
            }
            return;
        }
        
        setLoadingDetails(true);
        setDetailsOpen(true);
        
        viewedShopsRef.current.add(shop.id);
        
        incrementShopViewCount(shop.id).catch(err => {
            console.log('View count error:', err);
            viewedShopsRef.current.delete(shop.id);
        });
        
        try {
            const result = await getShopById(shop.id, userLocation);
            setSelectedShop(result.shop);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingDetails(false);
        }
    }, [userLocation]);

    const handleGetDirections = (shop) => {
        if (!userLocation) return;
        window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${shop.latitude},${shop.longitude}`,
            '_blank'
        );
        setDetailsOpen(false);
    };

    const handleCallShop = (e, phone) => {
        if (e) e.stopPropagation();
        if (phone) {
            window.location.href = `tel:${phone}`;
        }
    };

    const clearFilters = () => {
        setRadius(10);
        setSelectedCategory('');
        setSearchTerm('');
        setFilterDrawerOpen(false);
    };

    const refreshLocation = () => {
        getCurrentLocation();
    };

    /* ── Location loading screen ── */
    if (gettingLocation) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh',
                    gap: 2,
                    bgcolor: C.bg,
                }}
            >
                <CircularProgress sx={{ color: C.accent }} size={36} />
                <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', color: C.textMuted }}>
                    Detecting your location…
                </Typography>
            </Box>
        );
    }

    /* ══════════════════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════════════════ */
    return (
        <Box
            sx={{
                height: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: C.bg,
                fontFamily: '"Inter", sans-serif',
            }}
        >
            {/* ══ STICKY HEADER ══ */}
            <Box
                sx={{
                    flexShrink: 0,
                    background: C.surface,
                    px: 2,
                    pt: 1.5,
                    pb: 1.5,
                    borderBottom: `1px solid ${C.border}`,
                    zIndex: 100,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 18, color: C.text, letterSpacing: '-0.3px' }}
                        >
                            Nearby Shops
                        </Typography>
                        {userLocation && (
                            <Typography variant="caption" sx={{ fontFamily: '"Inter", sans-serif', color: C.textMuted, fontSize: 11 }}>
                                Showing shops near your location
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            onClick={refreshLocation}
                            sx={{
                                width: 34, height: 34,
                                borderRadius: '10px',
                                bgcolor: C.surfaceAlt,
                                color: C.textMuted,
                                '&:hover': { bgcolor: C.accentLight, color: C.accent },
                            }}
                        >
                            <RefreshIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                            onClick={() => setFilterDrawerOpen(true)}
                            sx={{
                                width: 34, height: 34,
                                borderRadius: '10px',
                                bgcolor: filterDrawerOpen ? C.accentLight : C.surfaceAlt,
                                color: filterDrawerOpen ? C.accent : C.textMuted,
                                '&:hover': { bgcolor: C.accentLight, color: C.accent },
                            }}
                        >
                            <FilterIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                </Box>

                {/* Search bar */}
                <TextField
                    fullWidth
                    placeholder="Search shops or items... (e.g. milk, rice, vegetables)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{
                        mb: 1.5,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '28px',
                            fontFamily: '"Inter", sans-serif',
                            fontSize: 14,
                            background: '#f1f3f4',
                            '& fieldset': { border: 'none' },
                            '&:hover fieldset': { border: 'none' },
                            '&.Mui-focused fieldset': { border: `2px solid ${C.accent}` },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 20, color: C.textMuted }} />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Radius chip */}
                <Chip
                    icon={<LocationIcon sx={{ fontSize: '14px !important', color: `${C.accent} !important` }} />}
                    label={`Within ${radius} km`}
                    deleteIcon={<ArrowDownIcon sx={{ fontSize: '16px !important', color: `${C.textMuted} !important` }} />}
                    onDelete={() => setFilterDrawerOpen(true)}
                    onClick={() => setFilterDrawerOpen(true)}
                    size="small"
                    sx={{
                        borderRadius: '20px',
                        border: `1px solid ${C.border}`,
                        background: C.surface,
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 500,
                        fontSize: 13,
                        color: C.text,
                        height: 32,
                        cursor: 'pointer',
                        '& .MuiChip-label': { px: '8px' },
                        '&:hover': { background: C.accentLight },
                    }}
                />
            </Box>
            {/* ══ END HEADER ══ */}

            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError('')}
                    sx={{ mx: 2, mt: 1, borderRadius: '10px', fontFamily: '"Inter", sans-serif', flexShrink: 0 }}
                >
                    {error}
                </Alert>
            )}

            {/* ══ SCROLLABLE BODY ══ */}
            <Box
                ref={scrollRef}
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    pb: { xs: `${BOTTOM_NAV_OFFSET + 20}px`, md: '16px' },
                }}
            >
                <Box
                    sx={{
                        background: C.surface,
                        mt: 1.5,
                        mx: { xs: 0, md: 2 },
                        borderRadius: { md: '16px' },
                        overflow: 'hidden',
                        border: { md: `1px solid ${C.border}` },
                    }}
                >
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <React.Fragment key={i}>
                                <ShopRowSkeleton />
                                {i < 5 && <Divider sx={{ mx: 2, borderColor: C.borderLight }} />}
                            </React.Fragment>
                        ))
                    ) : shops.length === 0 ? (
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                            <StoreIcon sx={{ fontSize: 56, color: '#d1d5db', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, color: C.text, mb: 1 }}>
                                No shops found
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', color: C.textMuted, mb: 3 }}>
                                Try expanding your radius or changing filters.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={clearFilters}
                                sx={{ fontFamily: '"Inter", sans-serif', textTransform: 'none', borderRadius: '10px', background: C.accent, px: 3 }}
                            >
                                Clear Filters
                            </Button>
                        </Box>
                    ) : (
                        shops.map((shop, idx) => (
                            <React.Fragment key={shop.id}>
                                <ShopRow
                                    shop={shop}
                                    onClick={() => handleShopClick(shop)}
                                    onCall={(e) => handleCallShop(e, shop.additional_phone || shop.owner_phone)}
                                />
                                {idx < shops.length - 1 && <Divider sx={{ mx: 2, borderColor: C.borderLight }} />}
                            </React.Fragment>
                        ))
                    )}
                </Box>

                {/* Can't find banner */}
                {!loading && shops.length > 0 && (
                    <Box
                        sx={{
                            mx: { xs: 1.5, md: 2 },
                            mt: 2,
                            mb: 2,
                            px: 2.5,
                            py: 1.8,
                            background: C.accentLight,
                            borderRadius: '16px',
                            border: `1px solid ${C.accentMid}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '12px',
                                background: C.accent,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <ShoppingBagIcon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="body2"
                                sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, color: C.text, fontSize: 13, lineHeight: 1.3 }}
                            >
                                Can't find what you need?
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: '"Inter", sans-serif', color: C.textMuted, fontSize: 11 }}>
                                Tell us the item, we'll help you find it near you!
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            size="small"
                            sx={{
                                fontFamily: '"Inter", sans-serif',
                                textTransform: 'none',
                                borderRadius: '12px',
                                background: C.accent,
                                fontWeight: 600,
                                fontSize: 12,
                                px: 2.5,
                                py: 0.9,
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                                boxShadow: 'none',
                                '&:hover': { background: C.accentDark },
                            }}
                        >
                            Search Items
                        </Button>
                    </Box>
                )}
            </Box>
            {/* ══ END SCROLLABLE BODY ══ */}

            {/* ══ FILTER DRAWER (Bottom Sheet) ══ */}
            <Drawer
                anchor="bottom"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                PaperProps={{ sx: { borderRadius: '20px 20px 0 0', p: 3, maxHeight: '85vh', background: C.surface } }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, color: C.text }}>Filters</Typography>
                    <IconButton onClick={() => setFilterDrawerOpen(false)} size="small" sx={{ bgcolor: C.surfaceAlt, borderRadius: '10px' }}>
                        <CloseIcon sx={{ fontSize: 16, color: C.textMuted }} />
                    </IconButton>
                </Box>
                <Divider sx={{ mb: 3, borderColor: C.borderLight }} />
                <FilterPanel
                    radius={radius}
                    setRadius={setRadius}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={categories}
                    clearFilters={clearFilters}
                    onApply={() => setFilterDrawerOpen(false)}
                />
            </Drawer>

            {/* ══ SHOP DETAILS (Full Screen on Mobile) ══ */}
            {detailsOpen && selectedShop && (
                <ShopDetailsDrawer
                    shop={selectedShop}
                    onClose={() => setDetailsOpen(false)}
                    onRoute={handleGetDirections}
                    onCall={handleCallShop}
                    userLocation={userLocation}
                />
            )}
        </Box>
    );
}