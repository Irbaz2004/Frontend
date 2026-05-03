// app/user/Shops.jsx
import React, { useState, useEffect, useRef } from 'react';
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
    Sort as SortIcon,
    KeyboardArrowDown as ArrowDownIcon,
    ChevronRight as ChevronRightIcon,
    ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { getShopsByLocation, getShopById, getShopCategoriesWithCount } from '../../services/shops';

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const T = {
    brand:       '#1a6ef5',
    brandLight:  '#e8f0fe',
    bg:          '#f5f7fa',
    surface:     '#ffffff',
    border:      '#e8eaed',
    textPrimary: '#111827',
    textMuted:   '#6b7280',
    green:       '#16a34a',
    greenDot:    '#22c55e',
    amber:       '#d97706',
    radius:      '14px',
    font:        '"Roboto", sans-serif',
};

/* ─── Skeleton row ───────────────────────────────────────────────────────── */
const ShopRowSkeleton = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
        <Skeleton variant="rounded" width={78} height={78} sx={{ borderRadius: '10px', flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={22} />
            <Skeleton variant="text" width="40%" height={18} />
            <Skeleton variant="text" width="50%" height={16} />
        </Box>
        <Skeleton variant="circular" width={40} height={40} />
    </Box>
);

/* ─── Shop Row ───────────────────────────────────────────────────────────── */
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
                transition: 'background 0.15s',
                '&:hover': { background: '#f8faff' },
            }}
        >
            {/* Thumbnail */}
            <Box
                sx={{
                    width: 78,
                    height: 78,
                    borderRadius: '10px',
                    flexShrink: 0,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #f0f3f8 0%, #e4e8ef 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {shop.shop_image_base64 ? (
                    <img
                        src={`data:image/jpeg;base64,${shop.shop_image_base64}`}
                        alt={shop.business_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                        fontFamily: T.font,
                        fontWeight: 700,
                        fontSize: 14,
                        color: T.textPrimary,
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
                    <LocationIcon sx={{ fontSize: 12, color: T.brand, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ fontFamily: T.font, fontSize: 12, color: T.textMuted, fontWeight: 500 }}>
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
                            bgcolor: T.brandLight,
                            color: T.brand,
                            fontFamily: T.font,
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
                            background: isOpen ? T.greenDot : '#ef4444',
                            flexShrink: 0,
                        }}
                    />
                    <Typography
                        variant="caption"
                        sx={{ fontFamily: T.font, fontSize: 11.5, fontWeight: 600, color: isOpen ? T.green : '#ef4444' }}
                    >
                        {isOpen ? 'Open' : 'Closed'}
                    </Typography>
                    {isOpen && closingTime && (
                        <>
                            <Typography variant="caption" sx={{ color: T.textMuted, fontSize: 11 }}>·</Typography>
                            <Typography variant="caption" sx={{ fontFamily: T.font, fontSize: 11, color: T.textMuted }}>
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
                        borderRadius: '50%',
                        background: T.brandLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        '&:hover': { background: '#c7d9fd' },
                    }}
                >
                    <PhoneIcon sx={{ fontSize: 18, color: T.brand }} />
                </Box>
                <ChevronRightIcon sx={{ fontSize: 20, color: '#9ca3af' }} />
            </Box>
        </Box>
    );
}

/* ─── Sidebar filter panel ───────────────────────────────────────────────── */
const SidebarFilters = ({ radius, setRadius, selectedCategory, setSelectedCategory, categories, clearFilters }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="subtitle1" sx={{ fontFamily: T.font, fontWeight: 700, color: T.textPrimary }}>
            Filters
        </Typography>

        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: T.font, fontWeight: 500, color: T.textMuted }}>
                    Distance Radius
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: T.font, fontWeight: 700, color: T.brand }}>
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
                    color: T.brand,
                    height: 4,
                    '& .MuiSlider-thumb': { width: 16, height: 16 },
                    '& .MuiSlider-rail': { opacity: 0.2 },
                }}
            />
        </Box>

        <FormControl fullWidth size="small">
            <InputLabel sx={{ fontFamily: T.font }}>Category</InputLabel>
            <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
                sx={{ borderRadius: '8px', fontFamily: T.font, fontSize: 14 }}
            >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                    <MenuItem key={cat.category} value={cat.category} sx={{ fontFamily: T.font, fontSize: 14 }}>
                        {cat.category}
                        <Typography component="span" variant="caption" sx={{ ml: 'auto', pl: 1, color: T.textMuted }}>
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
                fontFamily: T.font,
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: T.border,
                color: T.textMuted,
                fontSize: 13,
                '&:hover': { borderColor: T.brand, color: T.brand, background: T.brandLight },
            }}
        >
            Clear All Filters
        </Button>
    </Box>
);

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════════════ */
export default function Shops() {
    const theme    = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
                limit: 20,
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

    const handleShopClick = async (shop) => {
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
    };

    const handleGetDirections = (shop) => {
        window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${shop.latitude},${shop.longitude}`,
            '_blank'
        );
    };

    const handleCallShop = (e, phone) => {
        e.stopPropagation();
        window.location.href = `tel:${phone}`;
    };

    const clearFilters = () => {
        setRadius(10);
        setSelectedCategory('');
        setSearchTerm('');
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
                }}
            >
                <CircularProgress sx={{ color: T.brand }} size={36} />
                <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textMuted }}>
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
                background: T.bg,
                fontFamily: T.font,
            }}
        >

            {/* ══ STICKY HEADER ══ */}
            <Box
                sx={{
                    flexShrink: 0,
                    background: T.surface,
                    px: 2,
                    pt: 1.5,
                    pb: 1.5,
                    borderBottom: `1px solid ${T.border}`,
                    zIndex: 100,
                }}
            >
                {/* Title + Filter/Sort */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography
                        variant="h6"
                        sx={{ fontFamily: T.font, fontWeight: 700, fontSize: 18, color: T.textPrimary }}
                    >
                        Nearby Shops
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Button
                            onClick={() => setFilterDrawerOpen(true)}
                            startIcon={<FilterIcon sx={{ fontSize: '18px !important' }} />}
                            sx={{
                                minWidth: 0,
                                flexDirection: 'column',
                                gap: 0,
                                px: 1,
                                py: 0.5,
                                color: T.textMuted,
                                fontSize: 11,
                                fontFamily: T.font,
                                textTransform: 'none',
                                lineHeight: 1.3,
                                borderRadius: '8px',
                                '&:hover': { color: T.brand, background: T.brandLight },
                            }}
                        >
                            Filter
                        </Button>

                        <Button
                            startIcon={<SortIcon sx={{ fontSize: '18px !important' }} />}
                            sx={{
                                minWidth: 0,
                                flexDirection: 'column',
                                gap: 0,
                                px: 1,
                                py: 0.5,
                                color: T.textMuted,
                                fontSize: 11,
                                fontFamily: T.font,
                                textTransform: 'none',
                                lineHeight: 1.3,
                                borderRadius: '8px',
                                '&:hover': { color: T.brand, background: T.brandLight },
                            }}
                        >
                            Sort
                        </Button>
                    </Box>
                </Box>

                {/* Search bar */}
                <TextField
                    fullWidth
                    placeholder="Search items... (e.g. milk, rice, vegetables)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{
                        mb: 1.5,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '28px',
                            fontFamily: T.font,
                            fontSize: 14,
                            background: '#f1f3f4',
                            '& fieldset': { border: 'none' },
                            '&:hover fieldset': { border: 'none' },
                            '&.Mui-focused fieldset': { border: `2px solid ${T.brand}` },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 20, color: T.textMuted }} />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Radius pill */}
                <Chip
                    icon={<LocationIcon sx={{ fontSize: '14px !important', color: `${T.brand} !important` }} />}
                    label={`Within ${radius} km`}
                    deleteIcon={<ArrowDownIcon sx={{ fontSize: '16px !important', color: `${T.textMuted} !important` }} />}
                    onDelete={() => setFilterDrawerOpen(true)}
                    onClick={() => setFilterDrawerOpen(true)}
                    size="small"
                    sx={{
                        borderRadius: '20px',
                        border: `1px solid ${T.border}`,
                        background: T.surface,
                        fontFamily: T.font,
                        fontWeight: 500,
                        fontSize: 13,
                        color: T.textPrimary,
                        height: 32,
                        cursor: 'pointer',
                        '& .MuiChip-label': { px: '8px' },
                        '&:hover': { background: T.brandLight },
                    }}
                />
            </Box>
            {/* ══ END HEADER ══ */}

            {/* Error alert — outside scroll so it doesn't jump layout */}
            {error && (
                <Alert
                    severity="warning"
                    onClose={() => setError('')}
                    sx={{ mx: 2, mt: 1, borderRadius: '10px', fontFamily: T.font, flexShrink: 0 }}
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
                    pb: { xs: '80px', md: '16px' },
                }}
            >
                {/* Shop list card */}
                <Box
                    sx={{
                        background: T.surface,
                        mt: 1.5,
                        mx: { xs: 0, md: 2 },
                        borderRadius: { md: T.radius },
                        overflow: 'hidden',
                        border: { md: `1px solid ${T.border}` },
                    }}
                >
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <React.Fragment key={i}>
                                <ShopRowSkeleton />
                                {i < 5 && <Divider sx={{ mx: 2 }} />}
                            </React.Fragment>
                        ))
                    ) : shops.length === 0 ? (
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                            <StoreIcon sx={{ fontSize: 56, color: '#d1d5db', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontFamily: T.font, fontWeight: 600, color: T.textPrimary, mb: 1 }}>
                                No shops found
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textMuted, mb: 3 }}>
                                Try expanding your radius or changing filters.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={clearFilters}
                                sx={{ fontFamily: T.font, textTransform: 'none', borderRadius: '8px', background: T.brand, px: 3 }}
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
                                {idx < shops.length - 1 && <Divider sx={{ mx: 2 }} />}
                            </React.Fragment>
                        ))
                    )}
                </Box>

                {/* Can't find banner */}
                {!loading && (
                    <Box
                        sx={{
                            mx: { xs: 1.5, md: 2 },
                            mt: 1.5,
                            mb: 2,
                            px: 2.5,
                            py: 1.5,
                            background: '#eef2ff',
                            borderRadius: T.radius,
                            border: '1px solid #c7d2fe',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '10px',
                                background: T.brand,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <ShoppingBagIcon sx={{ color: 'white', fontSize: 22 }} />
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="body2"
                                sx={{ fontFamily: T.font, fontWeight: 700, color: T.textPrimary, fontSize: 13, lineHeight: 1.3 }}
                            >
                                Can't find what you need?
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: T.font, color: T.textMuted, fontSize: 11 }}>
                                Tell us the item, we'll help you find it near you!
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            size="small"
                            sx={{
                                fontFamily: T.font,
                                textTransform: 'none',
                                borderRadius: '20px',
                                background: T.brand,
                                fontWeight: 600,
                                fontSize: 12,
                                px: 2,
                                py: 0.7,
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                                boxShadow: 'none',
                            }}
                        >
                            Request Item
                        </Button>
                    </Box>
                )}
            </Box>
            {/* ══ END SCROLLABLE BODY ══ */}

            {/* ══ FILTER DRAWER ══ */}
            <Drawer
                anchor="bottom"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                PaperProps={{ sx: { borderRadius: '20px 20px 0 0', p: 3, maxHeight: '80vh' } }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontFamily: T.font, fontWeight: 700 }}>Filters</Typography>
                    <IconButton onClick={() => setFilterDrawerOpen(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <SidebarFilters
                    radius={radius}
                    setRadius={setRadius}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={categories}
                    clearFilters={clearFilters}
                />
                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setFilterDrawerOpen(false)}
                    sx={{
                        mt: 3,
                        fontFamily: T.font,
                        textTransform: 'none',
                        borderRadius: '10px',
                        background: T.brand,
                        fontWeight: 600,
                    }}
                >
                    Apply Filters
                </Button>
            </Drawer>

            {/* ══ SHOP DETAILS DRAWER ══ */}
            <Drawer
                anchor={isMobile ? 'bottom' : 'right'}
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                PaperProps={{
                    sx: {
                        width: isMobile ? '100%' : 460,
                        borderRadius: isMobile ? '20px 20px 0 0' : '16px 0 0 16px',
                        maxHeight: isMobile ? '92vh' : '100vh',
                    },
                }}
            >
                {loadingDetails ? (
                    <Box sx={{ p: 3 }}>
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="text" height={40} sx={{ mt: 2, width: '70%' }} />
                        <Skeleton variant="text" height={20} width="50%" />
                        <Skeleton variant="rectangular" height={90} sx={{ mt: 3, borderRadius: '10px' }} />
                    </Box>
                ) : selectedShop ? (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

                        {/* Shop image header */}
                        <Box sx={{ position: 'relative', flexShrink: 0 }}>
                            {selectedShop.shop_image_base64 ? (
                                <img
                                    src={`data:image/jpeg;base64,${selectedShop.shop_image_base64}`}
                                    alt={selectedShop.business_name}
                                    style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        height: 210,
                                        background: 'linear-gradient(135deg, #f0f3f8 0%, #e4e8ef 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <StoreIcon sx={{ fontSize: 72, color: '#c4c9d4' }} />
                                </Box>
                            )}

                            <IconButton
                                onClick={() => setDetailsOpen(false)}
                                sx={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    bgcolor: 'rgba(255,255,255,0.92)',
                                    backdropFilter: 'blur(6px)',
                                    width: 36,
                                    height: 36,
                                    '&:hover': { bgcolor: 'white' },
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>

                            <Box sx={{ position: 'absolute', bottom: 12, left: 12 }}>
                                <Chip
                                    label={selectedShop.is_verified ? 'Verified Shop' : 'Not Verified'}
                                    icon={
                                        selectedShop.is_verified
                                            ? <VerifiedIcon sx={{ fontSize: '14px !important' }} />
                                            : <PendingIcon sx={{ fontSize: '14px !important' }} />
                                    }
                                    sx={{
                                        bgcolor: selectedShop.is_verified ? T.green : T.amber,
                                        color: 'white',
                                        fontFamily: T.font,
                                        fontWeight: 700,
                                        fontSize: 12,
                                        '& .MuiChip-icon': { color: 'white' },
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Details body */}
                        <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
                            <Typography
                                variant="h6"
                                sx={{ fontFamily: T.font, fontWeight: 700, color: T.textPrimary, mb: 0.5, lineHeight: 1.3 }}
                            >
                                {selectedShop.business_name}
                            </Typography>

                            <Chip
                                label={selectedShop.category}
                                size="small"
                                sx={{
                                    mb: 2.5,
                                    borderRadius: '6px',
                                    bgcolor: T.brandLight,
                                    color: T.brand,
                                    fontFamily: T.font,
                                    fontWeight: 600,
                                    fontSize: 12,
                                }}
                            />

                            <Divider sx={{ mb: 2.5 }} />

                            {selectedShop.keywords?.length > 0 && (
                                <>
                                    <Typography variant="body2" sx={{ fontFamily: T.font, fontWeight: 700, color: T.textPrimary, mb: 1.5 }}>
                                        Key Items Available
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
                                        {selectedShop.keywords.map((item, idx) => (
                                            <Chip
                                                key={idx}
                                                label={item}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: '6px',
                                                    fontFamily: T.font,
                                                    fontSize: 12,
                                                    borderColor: T.border,
                                                    color: T.textMuted,
                                                }}
                                            />
                                        ))}
                                    </Box>
                                    <Divider sx={{ mb: 2.5 }} />
                                </>
                            )}

                            <Typography variant="body2" sx={{ fontFamily: T.font, fontWeight: 700, color: T.textPrimary, mb: 1.5 }}>
                                Contact
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '8px',
                                            bgcolor: T.brandLight,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <PhoneIcon sx={{ fontSize: 16, color: T.brand }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textPrimary }}>
                                        {selectedShop.additional_phone || selectedShop.owner_phone || 'Not available'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '8px',
                                            bgcolor: T.brandLight,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <LocationIcon sx={{ fontSize: 16, color: T.brand }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textPrimary }}>
                                        {selectedShop.area}, {selectedShop.city}, {selectedShop.state}
                                    </Typography>
                                </Box>
                            </Box>

                            {selectedShop.distance && (
                                <Typography variant="caption" sx={{ fontFamily: T.font, color: T.textMuted, display: 'block', mb: 2.5 }}>
                                    📍 {selectedShop.distance.toFixed(1)} km from your location
                                </Typography>
                            )}

                            <Divider sx={{ mb: 2.5 }} />

                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<DirectionsIcon />}
                                    onClick={() => handleGetDirections(selectedShop)}
                                    sx={{
                                        fontFamily: T.font,
                                        textTransform: 'none',
                                        borderRadius: '10px',
                                        background: T.brand,
                                        fontWeight: 600,
                                        py: 1.2,
                                    }}
                                >
                                    Directions
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<PhoneIcon />}
                                    onClick={(e) => handleCallShop(e, selectedShop.additional_phone || selectedShop.owner_phone)}
                                    sx={{
                                        fontFamily: T.font,
                                        textTransform: 'none',
                                        borderRadius: '10px',
                                        borderColor: T.brand,
                                        color: T.brand,
                                        fontWeight: 600,
                                        py: 1.2,
                                        '&:hover': { bgcolor: T.brandLight },
                                    }}
                                >
                                    Call
                                </Button>
                            </Box>
                        </Box>

                    </Box>
                ) : null}
            </Drawer>

        </Box>
    );
}