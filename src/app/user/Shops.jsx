// app/user/Shops.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
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
    Pagination,
    Divider,
    Skeleton,
    Stack,
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
} from '@mui/icons-material';
import { getShopsByLocation, getShopById, getShopCategoriesWithCount } from '../../services/shops';
import { useNavigate } from 'react-router-dom';

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const T = {
    brand:      '#325fec',
    brandLight: '#e8f0fe',
    bg:         '#f5f7fa',
    surface:    '#ffffff',
    border:     '#e4e8ef',
    textPrimary:'#111827',
    textMuted:  '#6b7280',
    green:      '#16a34a',
    greenBg:    '#dcfce7',
    amber:      '#d97706',
    amberBg:    '#fef3c7',
    radius:     '12px',
    font:       '"Roboto", "Inter", sans-serif',
};

const cardSx = {
    borderRadius: T.radius,
    border: `1px solid ${T.border}`,
    boxShadow: 'none',
    background: T.surface,
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 10px 28px rgba(50,95,236,0.10)',
        borderColor: T.brand,
    },
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const getVerificationBadge = (isVerified) =>
    isVerified
        ? { label: 'Verified',     icon: <VerifiedIcon sx={{ fontSize: 11 }} />, color: T.green,  bgColor: T.greenBg }
        : { label: 'Not Verified', icon: <PendingIcon  sx={{ fontSize: 11 }} />, color: T.amber,  bgColor: T.amberBg };

/* ─── Skeletons ──────────────────────────────────────────────────────────── */
const ShopSkeleton = () => (
    <Card sx={{ ...cardSx, cursor: 'default', '&:hover': {} }}>
        <Skeleton variant="rectangular" height={160} />
        <CardContent>
            <Skeleton variant="text" width="75%" height={26} />
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="40%" />
        </CardContent>
    </Card>
);

/* ─── Sidebar filter panel ───────────────────────────────────────────────── */
const SidebarFilters = ({ radius, setRadius, selectedCategory, setSelectedCategory, categories, clearFilters }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography
            variant="subtitle1"
            sx={{ fontFamily: T.font, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.2px' }}
        >
            Filters
        </Typography>

        {/* Distance */}
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

        {/* Category */}
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
    const navigate    = useNavigate();
    const theme       = useTheme();
    const isMobile    = useMediaQuery(theme.breakpoints.down('md'));

    const [loading,        setLoading]        = useState(true);
    const [shops,          setShops]          = useState([]);
    const [categories,     setCategories]     = useState([]);
    const [totalPages,     setTotalPages]     = useState(1);
    const [currentPage,    setCurrentPage]    = useState(1);
    const [error,          setError]          = useState('');
    const [userLocation,   setUserLocation]   = useState(null);
    const [gettingLocation,setGettingLocation]= useState(true);

    const [radius,          setRadius]          = useState(10);
    const [selectedCategory,setSelectedCategory]= useState('');
    const [searchTerm,      setSearchTerm]      = useState('');
    const [filterDrawerOpen,setFilterDrawerOpen]= useState(false);

    const [selectedShop,   setSelectedShop]   = useState(null);
    const [detailsOpen,    setDetailsOpen]    = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    /* ── Location ── */
    useEffect(() => { getCurrentLocation(); }, []);

    useEffect(() => {
        if (userLocation) { loadShops(); loadCategories(); }
    }, [userLocation, radius, selectedCategory, searchTerm, currentPage]);

    const getCurrentLocation = () => {
        setGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                    setGettingLocation(false);
                },
                () => {
                    setError('Unable to get your location. Showing default area.');
                    setGettingLocation(false);
                    setUserLocation({ latitude: 12.9165, longitude: 79.1325 });
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setError('Geolocation is not supported by your browser.');
            setGettingLocation(false);
            setUserLocation({ latitude: 12.9165, longitude: 79.1325 });
        }
    };

    /* ── Data ── */
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
                page: currentPage,
                limit: 12,
            });
            setShops(result.shops || []);
            setTotalPages(result.totalPages || 1);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const loadCategories = async () => {
        try {
            const result = await getShopCategoriesWithCount();
            setCategories(result.categories || []);
        } catch { /* silent */ }
    };

    const handleShopClick = async (shop) => {
        setLoadingDetails(true);
        setDetailsOpen(true);
        try {
            const result = await getShopById(shop.id, userLocation);
            setSelectedShop(result.shop);
        } catch (err) { setError(err.message); }
        finally { setLoadingDetails(false); }
    };

    const handleGetDirections = (shop) => {
        window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${shop.latitude},${shop.longitude}`,
            '_blank'
        );
    };

    const handleCallShop = (phone) => { window.location.href = `tel:${phone}`; };

    const clearFilters = () => {
        setRadius(10); setSelectedCategory(''); setSearchTerm(''); setCurrentPage(1);
    };

    /* ── Loading screen ── */
    if (gettingLocation) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
                <CircularProgress sx={{ color: T.brand }} size={40} />
                <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textMuted }}>
                    Detecting your location…
                </Typography>
            </Box>
        );
    }

    /* ═══════════════════════════════════════════════════════════════════════
       RENDER
    ═══════════════════════════════════════════════════════════════════════ */
    return (
        <Box sx={{ minHeight: '100vh', background: T.bg, fontFamily: T.font }}>
            <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>

                {/* ── Page header ── */}
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                    <Typography
                        variant="h5"
                        sx={{ fontFamily: T.font, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.3px' }}
                    >
                        Shops Near You
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textMuted, mt: 0.5 }}>
                        Within {radius} km radius · {shops.length} result{shops.length !== 1 ? 's' : ''} found
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="warning" onClose={() => setError('')} sx={{ mb: 2, borderRadius: '10px', fontFamily: T.font }}>
                        {error}
                    </Alert>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    DESKTOP: sidebar + content
                    MOBILE:  stacked search/filter + cards
                ───────────────────────────────────────────────────────────── */}
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>

                    {/* ── Desktop Sidebar ── */}
                    {!isMobile && (
                        <Paper
                            elevation={0}
                            sx={{
                                width: 256,
                                flexShrink: 0,
                                borderRadius: T.radius,
                                border: `1px solid ${T.border}`,
                                background: T.surface,
                                p: 3,
                                position: 'sticky',
                                top: 80,
                            }}
                        >
                            {/* Desktop search inside sidebar */}
                            <TextField
                                fullWidth
                                placeholder="Search shops…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
                                size="small"
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        fontFamily: T.font,
                                        fontSize: 14,
                                    }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 18, color: T.textMuted }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <SidebarFilters
                                radius={radius}
                                setRadius={setRadius}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                categories={categories}
                                clearFilters={clearFilters}
                            />
                        </Paper>
                    )}

                    {/* ── Main content area ── */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>

                        {/* Mobile search + filter row */}
                        {isMobile && (
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Search shops…"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            fontFamily: T.font,
                                            fontSize: 14,
                                            background: T.surface,
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ fontSize: 18, color: T.textMuted }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={() => setFilterDrawerOpen(true)}
                                    sx={{
                                        minWidth: 48,
                                        px: 1.5,
                                        borderRadius: '10px',
                                        border: `1px solid ${T.border}`,
                                        color: T.textMuted,
                                        background: T.surface,
                                        '&:hover': { borderColor: T.brand, color: T.brand },
                                    }}
                                >
                                    <FilterIcon fontSize="small" />
                                </Button>
                            </Box>
                        )}

                        {/* ── Shop grid ── */}
                        <Grid container spacing={{ xs: 1.5, md: 2 }}>
                            {loading ? (
                                /* Skeleton placeholders */
                                Array.from({ length: 8 }).map((_, i) => (
                                    <Grid item xs={6} md={3} key={i}>
                                        <ShopSkeleton />
                                    </Grid>
                                ))
                            ) : shops.length === 0 ? (
                                <Grid item xs={12}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 6,
                                            textAlign: 'center',
                                            borderRadius: T.radius,
                                            border: `1px solid ${T.border}`,
                                            background: T.surface,
                                        }}
                                    >
                                        <StoreIcon sx={{ fontSize: 56, color: '#d1d5db', mb: 2 }} />
                                        <Typography
                                            variant="h6"
                                            sx={{ fontFamily: T.font, fontWeight: 600, color: T.textPrimary, mb: 1 }}
                                        >
                                            No shops found
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textMuted, mb: 3 }}>
                                            Try expanding your radius or changing the filters.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={clearFilters}
                                            sx={{
                                                fontFamily: T.font,
                                                textTransform: 'none',
                                                borderRadius: '8px',
                                                background: T.brand,
                                                px: 3,
                                            }}
                                        >
                                            Clear Filters
                                        </Button>
                                    </Paper>
                                </Grid>
                            ) : (
                                shops.map((shop) => {
                                    const v = getVerificationBadge(shop.is_verified);
                                    return (
                                        <Grid item xs={6} md={3} key={shop.id}>
                                            <Card sx={cardSx} onClick={() => handleShopClick(shop)}>
                                                {/* Shop image */}
                                                {shop.shop_image_base64 ? (
                                                    <CardMedia
                                                        component="img"
                                                        height={isMobile ? 110 : 150}
                                                        image={`data:image/jpeg;base64,${shop.shop_image_base64}`}
                                                        alt={shop.business_name}
                                                        sx={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            height: isMobile ? 110 : 150,
                                                            background: 'linear-gradient(135deg, #f0f3f8 0%, #e4e8ef 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <StoreIcon sx={{ fontSize: isMobile ? 36 : 44, color: '#c4c9d4' }} />
                                                    </Box>
                                                )}

                                                <CardContent
                                                    sx={{
                                                        p: { xs: 1.25, md: 2 },
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        '&:last-child': { pb: { xs: 1.25, md: 2 } },
                                                    }}
                                                >
                                                    {/* Name + badge row */}
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontFamily: T.font,
                                                                fontWeight: 700,
                                                                fontSize: { xs: 12, md: 14 },
                                                                color: T.textPrimary,
                                                                lineHeight: 1.3,
                                                                flex: 1,
                                                            }}
                                                        >
                                                            {shop.business_name}
                                                        </Typography>
                                                        <Chip
                                                            label={v.label}
                                                            icon={v.icon}
                                                            size="small"
                                                            sx={{
                                                                flexShrink: 0,
                                                                height: 18,
                                                                borderRadius: '4px',
                                                                bgcolor: v.bgColor,
                                                                color: v.color,
                                                                '& .MuiChip-label': { fontSize: '0.58rem', fontWeight: 700, px: '5px' },
                                                                '& .MuiChip-icon': { ml: '4px', mr: '-2px' },
                                                            }}
                                                        />
                                                    </Box>

                                                    {/* Category */}
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ fontFamily: T.font, color: T.brand, fontWeight: 600, fontSize: { xs: 10, md: 11 }, mb: 0.5 }}
                                                    >
                                                        {shop.category}
                                                    </Typography>

                                                    {/* Location */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 'auto' }}>
                                                        <LocationIcon sx={{ fontSize: 11, color: T.textMuted, flexShrink: 0 }} />
                                                        <Typography
                                                            variant="caption"
                                                            sx={{ fontFamily: T.font, color: T.textMuted, fontSize: { xs: 10, md: 11 }, lineHeight: 1.2 }}
                                                            noWrap
                                                        >
                                                            {shop.area}, {shop.city}
                                                        </Typography>
                                                    </Box>

                                                    {/* Distance pill */}
                                                    {shop.distance && (
                                                        <Box sx={{ mt: 1 }}>
                                                            <Chip
                                                                label={`${shop.distance.toFixed(1)} km away`}
                                                                size="small"
                                                                sx={{
                                                                    height: 20,
                                                                    borderRadius: '6px',
                                                                    bgcolor: T.brandLight,
                                                                    color: T.brand,
                                                                    '& .MuiChip-label': { fontSize: '0.65rem', fontWeight: 600, px: '7px' },
                                                                }}
                                                            />
                                                        </Box>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })
                            )}
                        </Grid>

                        {/* Pagination */}
                        {totalPages > 1 && !loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={(_, val) => setCurrentPage(val)}
                                    color="primary"
                                    shape="rounded"
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            fontFamily: T.font,
                                            borderRadius: '8px',
                                            fontSize: 13,
                                        },
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Container>

            {/* ── Mobile Filter Drawer ── */}
            <Drawer
                anchor="bottom"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '20px 20px 0 0',
                        p: 3,
                        maxHeight: '80vh',
                    }
                }}
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
                    onClick={() => { setFilterDrawerOpen(false); setCurrentPage(1); }}
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

            {/* ── Shop Details Drawer ── */}
            <Drawer
                anchor={isMobile ? 'bottom' : 'right'}
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                PaperProps={{
                    sx: {
                        width: isMobile ? '100%' : 460,
                        borderRadius: isMobile ? '20px 20px 0 0' : '16px 0 0 16px',
                        maxHeight: isMobile ? '92vh' : '100vh',
                    }
                }}
            >
                {loadingDetails ? (
                    <Box sx={{ p: 3 }}>
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="text" height={40} sx={{ mt: 2, width: '70%' }} />
                        <Skeleton variant="text" height={20} width="50%" />
                        <Skeleton variant="text" height={20} width="60%" />
                        <Skeleton variant="rectangular" height={90} sx={{ mt: 3, borderRadius: '10px' }} />
                    </Box>
                ) : selectedShop && (
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

                            {/* Close button */}
                            <IconButton
                                onClick={() => setDetailsOpen(false)}
                                sx={{
                                    position: 'absolute', top: 12, right: 12,
                                    bgcolor: 'rgba(255,255,255,0.92)',
                                    backdropFilter: 'blur(6px)',
                                    width: 36, height: 36,
                                    '&:hover': { bgcolor: 'white' },
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>

                            {/* Verified badge overlay */}
                            <Box sx={{ position: 'absolute', bottom: 12, left: 12 }}>
                                <Chip
                                    label={selectedShop.is_verified ? 'Verified Shop' : 'Not Verified'}
                                    icon={selectedShop.is_verified ? <VerifiedIcon sx={{ fontSize: '14px !important' }} /> : <PendingIcon sx={{ fontSize: '14px !important' }} />}
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

                        {/* Details content */}
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

                            {/* Keywords */}
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

                            {/* Contact */}
                            <Typography variant="body2" sx={{ fontFamily: T.font, fontWeight: 700, color: T.textPrimary, mb: 1.5 }}>
                                Contact
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: T.brandLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <PhoneIcon sx={{ fontSize: 16, color: T.brand }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textPrimary }}>
                                        {selectedShop.additional_phone || selectedShop.owner_phone || 'Not available'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: T.brandLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

                            {/* Action buttons */}
                            <Stack direction="row" spacing={1.5}>
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
                                    onClick={() => handleCallShop(selectedShop.additional_phone || selectedShop.owner_phone)}
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
                            </Stack>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
}