// app/user/Shops.jsx - First-class UI/UX pass: advanced MUI, smooth bottom-sheet drawer, same theme tokens, Inter only

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
    Snackbar,
    Tooltip,
    Fade,
    Backdrop,
    ToggleButton,
    ToggleButtonGroup,
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
    Refresh as RefreshIcon,
    AccessTime as AccessTimeIcon,
    ArrowBackIosNew as ArrowBackIcon,
} from '@mui/icons-material';
import { getShopsByLocation, getShopById, getShopCategoriesWithCount, incrementShopViewCount } from '../../services/shops';
import { DEFAULT_USER_LOCATION, getCachedUserLocation, saveCachedUserLocation } from '../../utils/userLocation';

// ─── Design tokens (unchanged — same theme) ──────────────────────────────────
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

// Bottom nav height — must match AppLayout.jsx BOTTOM_NAV_HEIGHT
const BOTTOM_NAV_OFFSET = 150;

// Smooth sheet motion
const SHEET_EASE_ENTER = 'cubic-bezier(0.16, 1, 0.3, 1)';
const SHEET_EASE_EXIT  = 'cubic-bezier(0.7, 0, 0.84, 0)';

// ─── Google search helper (used by "Key Items Available" chips) ─────────────
function searchOnGoogle(term) {
    if (!term) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(term)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

// ─── Time utilities ───────────────────────────────────────────────────────────

/**
 * Convert a time string to total minutes since midnight.
 * Accepts both 24h ("14:30", "09:00") and 12h ("2:30 PM", "9:00 AM") formats.
 * Returns null if unparseable.
 */
function timeToMinutes(timeStr) {
    if (!timeStr) return null;
    // Strip seconds if DB sends "HH:MM:SS" → "HH:MM"
    let str = timeStr.trim().replace(/^(\d{1,2}:\d{2}):\d{2}$/, '$1');

    // 12-hour format: "9:00 AM", "12:30 PM", "2:30 PM"
    const match12 = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match12) {
        let h = parseInt(match12[1], 10);
        const m = parseInt(match12[2], 10);
        const period = match12[3].toUpperCase();
        if (period === 'AM') {
            if (h === 12) h = 0;
        } else {
            if (h !== 12) h += 12;
        }
        return h * 60 + m;
    }

    // 24-hour format: "14:30", "09:00", "18:00"
    const match24 = str.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
        const h = parseInt(match24[1], 10);
        const m = parseInt(match24[2], 10);
        return h * 60 + m;
    }

    return null;
}

/**
 * Format a time string to "h:mm AM/PM".
 * Accepts both 24h and 12h input.
 */
function formatTimeTo12h(timeStr) {
    const mins = timeToMinutes(timeStr);
    if (mins === null) return timeStr; // fallback to raw

    const h24 = Math.floor(mins / 60);
    const m   = mins % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Determine if a shop is currently open based on opening_time and closing_time.
 * Returns true/false. Falls back to the DB `is_open` field if times are missing.
 */
function computeIsOpen(shop) {
    const openMins  = timeToMinutes(shop.opening_time);
    const closeMins = timeToMinutes(shop.closing_time);

    if (openMins === null || closeMins === null) {
        // Can't compute — fall back to whatever the DB says
        return shop.is_open ?? true;
    }

    const now  = new Date();
    const curr = now.getHours() * 60 + now.getMinutes();

    if (closeMins > openMins) {
        // Normal day: open 09:00 → close 22:00
        return curr >= openMins && curr < closeMins;
    } else {
        // Overnight: open 22:00 → close 06:00
        return curr >= openMins || curr < closeMins;
    }
}

/* ─── Image with graceful fallback (state-based, no DOM hacking) ───────────── */
function ShopImage({ src, alt, size = 78, radius = 12, iconSize = 36 }) {
    const [failed, setFailed] = useState(false);
    const showFallback = !src || failed;

    return (
        <Box
            sx={{
                width: size,
                height: size,
                borderRadius: `${radius}px`,
                flexShrink: 0,
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${C.surfaceAlt} 0%, ${C.borderLight} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {showFallback ? (
                <StoreIcon sx={{ fontSize: iconSize, color: '#c4c9d4' }} />
            ) : (
                <img
                    src={src}
                    alt={alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={() => setFailed(true)}
                />
            )}
        </Box>
    );
}

/* ─── Skeleton row ───────────────────────────────────────────────────────── */
const ShopRowSkeleton = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
        <Skeleton variant="rounded" width={78} height={78} sx={{ borderRadius: '12px', flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={22} />
            <Skeleton variant="text" width="40%" height={18} />
            <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: '6px', mt: 0.5, mb: 0.6 }} />
            <Skeleton variant="text" width="50%" height={16} />
        </Box>
        <Skeleton variant="circular" width={40} height={40} />
    </Box>
);

/* ─── Shop Row ────────────────────────────────────────────────────────────── */
function ShopRow({ shop, onClick, onCall }) {
    // ✅ Compute open/closed from actual shop timing
    const isOpen      = computeIsOpen(shop);
    const closingTime = shop.closing_time ? formatTimeTo12h(shop.closing_time) : null;

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
                transition: 'background 0.18s ease, transform 0.12s ease',
                '&:hover': { background: '#f8faff' },
                '&:active': { transform: 'scale(0.985)' },
            }}
        >
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <ShopImage src={shop.shop_image} alt={shop.business_name} />
                {shop.is_verified && (
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: C.green,
                            border: `2px solid ${C.surface}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <VerifiedIcon sx={{ fontSize: 12, color: 'white' }} />
                    </Box>
                )}
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontFamily: FONT,
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

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mb: 0.6 }}>
                    <LocationIcon sx={{ fontSize: 12, color: C.accent, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ fontFamily: FONT, fontSize: 12, color: C.textMuted, fontWeight: 500 }}>
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
                            fontFamily: FONT,
                            fontWeight: 600,
                            fontSize: 11,
                            '& .MuiChip-label': { px: '8px' },
                        }}
                    />
                </Box>

                {/* ✅ Open/Closed badge with real-time computed status */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Box
                        sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: isOpen ? C.green : C.red,
                            flexShrink: 0,
                        }}
                    />
                    <Typography
                        variant="caption"
                        sx={{ fontFamily: FONT, fontSize: 11.5, fontWeight: 600, color: isOpen ? C.green : C.red }}
                    >
                        {isOpen ? 'Open' : 'Closed'}
                    </Typography>
                    {closingTime && (
                        <>
                            <Typography variant="caption" sx={{ color: C.textMuted, fontSize: 11 }}>·</Typography>
                            <Typography variant="caption" sx={{ fontFamily: FONT, fontSize: 11, color: C.textMuted }}>
                                {isOpen ? `Closes ${closingTime}` : `Opens ${shop.opening_time ? formatTimeTo12h(shop.opening_time) : ''}`}
                            </Typography>
                        </>
                    )}
                </Box>
            </Box>

            {/* Call + Arrow */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <Tooltip title="Call shop" arrow>
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
                            '&:hover': { background: C.accentMid, transform: 'scale(1.06)' },
                            '&:active': { transform: 'scale(0.94)' },
                        }}
                    >
                        <PhoneIcon sx={{ fontSize: 18, color: C.accent }} />
                    </Box>
                </Tooltip>
                <ChevronRightIcon sx={{ fontSize: 20, color: C.textMuted }} />
            </Box>
        </Box>
    );
}

/* ─── Quick radius presets ───────────────────────────────────────────────── */
const RADIUS_PRESETS = [2, 5, 10, 25, 50];

/* ─── Filter panel ───────────────────────────────────────────────────────── */
const FilterPanel = ({ radius, setRadius, selectedCategory, setSelectedCategory, categories, clearFilters, onApply }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
                <Typography variant="body2" sx={{ fontFamily: FONT, fontWeight: 600, color: C.text }}>
                    Distance Radius
                </Typography>
                <Chip
                    label={`${radius} km`}
                    size="small"
                    sx={{
                        bgcolor: C.accent,
                        color: 'white',
                        fontFamily: FONT,
                        fontWeight: 700,
                        fontSize: 12,
                        height: 24,
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 0.8, mb: 2, flexWrap: 'wrap' }}>
                {RADIUS_PRESETS.map((r) => (
                    <Chip
                        key={r}
                        label={`${r} km`}
                        onClick={() => setRadius(r)}
                        size="small"
                        variant={radius === r ? 'filled' : 'outlined'}
                        sx={{
                            fontFamily: FONT,
                            fontWeight: 600,
                            fontSize: 12,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            bgcolor: radius === r ? C.accentLight : 'transparent',
                            color: radius === r ? C.accent : C.textMuted,
                            borderColor: radius === r ? C.accentMid : C.border,
                            '&:hover': { bgcolor: C.accentLight, color: C.accent, borderColor: C.accentMid },
                        }}
                    />
                ))}
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
                    '& .MuiSlider-thumb': {
                        width: 18,
                        height: 18,
                        boxShadow: `0 2px 6px ${C.shadow}`,
                        '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px ${C.accent}1f` },
                    },
                    '& .MuiSlider-rail': { opacity: 0.2 },
                }}
            />
        </Box>

        <FormControl fullWidth size="small">
            <InputLabel sx={{ fontFamily: FONT }}>Category</InputLabel>
            <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
                sx={{ borderRadius: '10px', fontFamily: FONT, fontSize: 14 }}
                MenuProps={{ PaperProps: { sx: { borderRadius: '12px', maxHeight: 320 } } }}
            >
                <MenuItem value="" sx={{ fontFamily: FONT, fontSize: 14 }}>All Categories</MenuItem>
                {categories.map((cat) => (
                    <MenuItem key={cat.category} value={cat.category} sx={{ fontFamily: FONT, fontSize: 14, justifyContent: 'space-between' }}>
                        {cat.category}
                        <Typography component="span" variant="caption" sx={{ pl: 1.5, color: C.textMuted, fontFamily: FONT }}>
                            {cat.count}
                        </Typography>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1.2 }}>
            <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon sx={{ fontSize: 16 }} />}
                onClick={clearFilters}
                size="medium"
                sx={{
                    fontFamily: FONT,
                    textTransform: 'none',
                    borderRadius: '10px',
                    borderColor: C.border,
                    color: C.textMuted,
                    fontWeight: 600,
                    fontSize: 13.5,
                    '&:hover': { borderColor: C.accent, color: C.accent, background: C.accentLight },
                }}
            >
                Clear All
            </Button>
            <Button
                fullWidth
                variant="contained"
                onClick={onApply}
                disableElevation
                sx={{
                    fontFamily: FONT,
                    textTransform: 'none',
                    borderRadius: '10px',
                    background: C.accent,
                    fontWeight: 700,
                    fontSize: 13.5,
                    '&:hover': { background: C.accentDark },
                }}
            >
                Apply Filters
            </Button>
        </Box>
    </Box>
);

/* ─── Quick category chip scroller (under the search bar) ──────────────────── */
function CategoryQuickFilter({ categories, selectedCategory, setSelectedCategory }) {
    if (!categories?.length) return null;

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 0.8,
                overflowX: 'auto',
                pb: 0.5,
                mt: 1.2,
                '&::-webkit-scrollbar': { display: 'none' },
            }}
        >
            <Chip
                label="All"
                onClick={() => setSelectedCategory('')}
                size="small"
                sx={{
                    fontFamily: FONT,
                    fontWeight: 600,
                    fontSize: 12.5,
                    borderRadius: '8px',
                    flexShrink: 0,
                    bgcolor: !selectedCategory ? C.accent : C.surfaceAlt,
                    color: !selectedCategory ? 'white' : C.textSub,
                    '&:hover': { bgcolor: !selectedCategory ? C.accentDark : C.borderLight },
                }}
            />
            {categories.map((cat) => {
                const active = selectedCategory === cat.category;
                return (
                    <Chip
                        key={cat.category}
                        label={cat.category}
                        onClick={() => setSelectedCategory(active ? '' : cat.category)}
                        size="small"
                        sx={{
                            fontFamily: FONT,
                            fontWeight: 600,
                            fontSize: 12.5,
                            borderRadius: '8px',
                            flexShrink: 0,
                            bgcolor: active ? C.accent : C.surfaceAlt,
                            color: active ? 'white' : C.textSub,
                            '&:hover': { bgcolor: active ? C.accentDark : C.borderLight },
                        }}
                    />
                );
            })}
        </Box>
    );
}

/* ─── Shop Details content (skeleton-aware) ─────────────────────────────────*/
function ShopDetailsContent({ shop, isMobile }) {
    const heroHeight = isMobile ? 280 : 340;

    if (!shop) {
        return (
            <Box sx={{ p: 0 }}>
                <Skeleton variant="rectangular" width="100%" height={heroHeight} />
                <Box sx={{ px: 3, pt: 3 }}>
                    <Skeleton variant="rounded" width={90} height={22} sx={{ borderRadius: '6px', mb: 1.5 }} />
                    <Skeleton variant="text" width="70%" height={34} />
                    <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2.5 }} />
                    <Skeleton variant="rounded" width="100%" height={64} sx={{ borderRadius: '16px', mb: 2.5 }} />
                    <Skeleton variant="text" width="100%" height={18} />
                    <Skeleton variant="text" width="90%" height={18} />
                    <Skeleton variant="text" width="60%" height={18} sx={{ mb: 2.5 }} />
                    <Skeleton variant="rounded" width="100%" height={48} sx={{ borderRadius: '12px' }} />
                </Box>
            </Box>
        );
    }

    // ✅ Compute real open/closed status from timing
    const isOpen      = computeIsOpen(shop);
    const closingTime = shop.closing_time ? formatTimeTo12h(shop.closing_time) : '10:00 PM';
    const openingTime = shop.opening_time ? formatTimeTo12h(shop.opening_time) : '9:00 AM';

    const stats = [
        {
            icon: <AccessTimeIcon sx={{ fontSize: 18, color: C.accent }} />,
            label: `${openingTime} – ${closingTime}`,
        },
        {
            icon: <LocationIcon sx={{ fontSize: 18, color: C.accent }} />,
            label: shop.distance != null ? `${shop.distance.toFixed(1)} km away` : shop.area,
        },
    ];
    if (shop.views_count !== undefined) {
        stats.push({ icon: <VisibilityIcon sx={{ fontSize: 18, color: C.accent }} />, label: `${shop.views_count} views` });
    }

    return (
        <>
            {/* Hero image */}
            <Box
                sx={{
                    position: 'relative',
                    flexShrink: 0,
                    height: heroHeight,
                    width: '100%',
                    overflow: 'hidden',
                    backgroundColor: C.surfaceAlt,
                }}
            >
                <ShopImageHero src={shop.shop_image} alt={shop.business_name} />

                {/* ✅ Open/Closed pill — computed from timing */}
                <Chip
                    label={isOpen ? 'Open Now' : 'Closed'}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 3,
                        bgcolor: isOpen ? C.green : C.red,
                        color: 'white',
                        fontFamily: FONT,
                        fontWeight: 700,
                        fontSize: 11.5,
                        boxShadow: `0 4px 12px ${C.shadowMd}`,
                    }}
                />

                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '55%',
                        background: 'linear-gradient(to top, rgba(15,23,42,0.5) 0%, transparent 100%)',
                        zIndex: 1,
                        pointerEvents: 'none',
                    }}
                />
            </Box>

            {/* Content card */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 2,
                    mt: '-28px',
                    borderRadius: '28px 28px 0 0',
                    background: C.surface,
                    px: 3,
                    pt: 3,
                    pb: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2, flexWrap: 'wrap' }}>
                    <Chip
                        label={shop.category}
                        size="small"
                        sx={{ borderRadius: '6px', bgcolor: C.accentLight, color: C.accent, fontFamily: FONT, fontWeight: 700, fontSize: 12 }}
                    />
                    <Chip
                        label={shop.is_verified ? 'Verified' : 'Pending Verification'}
                        icon={shop.is_verified ? <VerifiedIcon sx={{ fontSize: '13px !important' }} /> : <PendingIcon sx={{ fontSize: '13px !important' }} />}
                        size="small"
                        sx={{
                            borderRadius: '6px',
                            bgcolor: shop.is_verified ? C.greenLight : C.amberLight,
                            color: shop.is_verified ? C.green : C.amber,
                            fontFamily: FONT,
                            fontWeight: 700,
                            fontSize: 11.5,
                            '& .MuiChip-icon': { color: shop.is_verified ? C.green : C.amber },
                        }}
                    />
                </Box>

                <Typography variant="h5" sx={{ fontFamily: FONT, fontWeight: 800, color: C.text, mb: 0.6, letterSpacing: '-0.3px' }}>
                    {shop.business_name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2.5 }}>
                    <LocationIcon sx={{ fontSize: 15, color: C.textMuted }} />
                    <Typography variant="body2" sx={{ fontFamily: FONT, color: C.textMuted, fontSize: 13 }}>
                        {shop.area}, {shop.city}, {shop.state}
                    </Typography>
                </Box>

                {/* Stat strip */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        background: C.surfaceAlt,
                        borderRadius: '16px',
                        py: 1.6,
                        mb: 2.5,
                    }}
                >
                    {stats.map((s, i) => (
                        <React.Fragment key={i}>
                            <StatItem icon={s.icon} label={s.label} />
                            {i < stats.length - 1 && <Box sx={{ width: '1px', height: 28, background: C.border, flexShrink: 0 }} />}
                        </React.Fragment>
                    ))}
                </Box>

                {shop.description && (
                    <>
                        <SectionLabel>About</SectionLabel>
                        <Typography variant="body2" sx={{ fontFamily: FONT, color: C.textSub, lineHeight: 1.65, mb: 2.5 }}>
                            {shop.description}
                        </Typography>
                        <Divider sx={{ mb: 2.5, borderColor: C.borderLight }} />
                    </>
                )}

                {/* ── Key Items Available — click any item to search it on Google ── */}
                {shop.keywords?.length > 0 && (
                    <>
                        <SectionLabel>Key Items Available</SectionLabel>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                            {shop.keywords.map((item, idx) => (
                                <Chip
                                    key={idx}
                                    label={item}
                                    icon={<SearchIcon sx={{ fontSize: '12px !important' }} />}
                                    size="small"
                                    variant="outlined"
                                    clickable
                                    onClick={() => searchOnGoogle(item)}
                                    title={`Search "${item}" on Google`}
                                    sx={{
                                        borderRadius: '6px',
                                        fontFamily: FONT,
                                        fontSize: 12,
                                        borderColor: C.border,
                                        color: C.textSub,
                                        cursor: 'pointer',
                                        transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease',
                                        '& .MuiChip-icon': { color: C.textMuted, ml: '6px' },
                                        '&:hover': {
                                            background: C.accentLight,
                                            borderColor: C.accentMid,
                                            color: C.accentDark,
                                            transform: 'translateY(-1px)',
                                        },
                                        '&:hover .MuiChip-icon': { color: C.accent },
                                        '&:active': { transform: 'scale(0.95)' },
                                    }}
                                />
                            ))}
                        </Box>
                        <Divider sx={{ mb: 2.5, borderColor: C.borderLight }} />
                    </>
                )}

                <SectionLabel>Contact</SectionLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <IconTile><PhoneIcon sx={{ fontSize: 16, color: C.accent }} /></IconTile>
                    <Typography variant="body2" sx={{ fontFamily: FONT, color: C.text, fontWeight: 500 }}>
                        {shop.additional_phone || shop.owner_phone || 'Not available'}
                    </Typography>
                </Box>
            </Box>
        </>
    );
}

const StatItem = ({ icon, label }) => (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6, px: 0.5, minWidth: 0 }}>
        {icon}
        <Typography
            sx={{
                fontFamily: FONT,
                fontSize: 11.5,
                fontWeight: 700,
                color: C.text,
                textAlign: 'center',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
            }}
        >
            {label}
        </Typography>
    </Box>
);

const SectionLabel = ({ children }) => (
    <Typography variant="body2" sx={{ fontFamily: FONT, fontWeight: 700, color: C.text, mb: 1.5 }}>
        {children}
    </Typography>
);

const IconTile = ({ children }) => (
    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {children}
    </Box>
);

function ShopImageHero({ src, alt }) {
    const [failed, setFailed] = useState(false);
    const showFallback = !src || failed;
    return showFallback ? (
        <Box sx={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${C.surfaceAlt} 0%, ${C.borderLight} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <StoreIcon sx={{ fontSize: 72, color: '#c4c9d4' }} />
        </Box>
    ) : (
        <img
            src={src}
            alt={alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            onError={() => setFailed(true)}
        />
    );
}

/* ─── Shop Details Drawer ────────────────────────────────────────────────── */
function ShopDetailsDrawer({ open, shop, loading, onClose, onRoute, onCall }) {
    const theme    = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            transitionDuration={{ enter: 380, exit: 300 }}
            SlideProps={{ easing: { enter: SHEET_EASE_ENTER, exit: SHEET_EASE_EXIT } }}
            ModalProps={{ keepMounted: false }}
            PaperProps={{
                sx: isMobile
                    ? {
                          width: '100%',
                          height: '100%',
                          maxHeight: '100%',
                          borderRadius: 0,
                          m: 0,
                          background: C.surface,
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                      }
                    : {
                          maxWidth: 560,
                          width: 'calc(100% - 32px)',
                          mx: 'auto',
                          maxHeight: '88vh',
                          borderRadius: '24px 24px 0 0',
                          background: C.surface,
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          boxShadow: `0 -16px 60px ${C.shadowLg}`,
                          border: `1.5px solid ${C.border}`,
                          borderBottom: 'none',
                      },
            }}
        >
            {!isMobile && (
                <Box sx={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '10px auto 0', flexShrink: 0 }} />
            )}

            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    borderRadius: '50%',
                    width: 38,
                    height: 38,
                    zIndex: 10,
                    '&:hover': { bgcolor: C.white },
                    boxShadow: `0 4px 14px ${C.shadowMd}`,
                }}
            >
                <ArrowBackIcon sx={{ fontSize: 16, color: C.text }} />
            </IconButton>

            <Box sx={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <ShopDetailsContent shop={shop} isMobile={isMobile} />
            </Box>

            {shop && (
                <Box
                    sx={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 2,
                        pb: isMobile ? 'calc(16px + env(safe-area-inset-bottom))' : 2,
                        borderTop: `1px solid ${C.borderLight}`,
                        background: C.surface,
                        boxShadow: `0 -8px 24px ${C.shadowMd}`,
                    }}
                >
                    <Tooltip title="Call shop" arrow>
                        <IconButton
                            onClick={() => onCall(shop.additional_phone || shop.owner_phone)}
                            sx={{
                                width: 54,
                                height: 54,
                                borderRadius: '16px',
                                border: `1.5px solid ${C.accent}`,
                                color: C.accent,
                                flexShrink: 0,
                                '&:hover': { bgcolor: C.accentLight },
                            }}
                        >
                            <PhoneIcon sx={{ fontSize: 22 }} />
                        </IconButton>
                    </Tooltip>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<DirectionsIcon />}
                        onClick={() => onRoute(shop)}
                        disableElevation
                        sx={{
                            fontFamily: FONT,
                            textTransform: 'none',
                            borderRadius: '16px',
                            background: C.accent,
                            fontWeight: 700,
                            fontSize: 15,
                            py: 1.5,
                            boxShadow: `0 8px 20px ${C.shadow}`,
                            '&:hover': { background: C.accentDark },
                        }}
                    >
                        Get Directions
                    </Button>
                </Box>
            )}
        </Drawer>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════════════ */
export default function Shops() {
    const theme    = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const viewedShopsRef = useRef(new Set());
    const initialLocation = useMemo(() => getCachedUserLocation(), []);

    const [loading,          setLoading]          = useState(true);
    const [shops,            setShops]            = useState([]);
    const [categories,       setCategories]       = useState([]);
    const [error,            setError]            = useState('');
    const [userLocation,     setUserLocation]     = useState(initialLocation);
    const [gettingLocation,  setGettingLocation]  = useState(!initialLocation);
    const [radius,           setRadius]           = useState(10);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm,       setSearchTerm]       = useState('');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [selectedShop,     setSelectedShop]     = useState(null);
    const [detailsOpen,      setDetailsOpen]      = useState(false);
    const [loadingDetails,   setLoadingDetails]   = useState(false);
    const [snackbar,         setSnackbar]         = useState({ open: false, message: '' });

    const scrollRef = useRef(null);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    useEffect(() => {
        if (userLocation) {
            loadShops();
            loadCategories();
        }
    }, [userLocation, radius, selectedCategory, searchTerm]);

    const getCurrentLocation = () => {
        setGettingLocation(!userLocation);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const nextLocation = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                    saveCachedUserLocation(nextLocation);
                    setUserLocation(nextLocation);
                    setGettingLocation(false);
                },
                () => {
                    setError('Unable to get your location.');
                    setGettingLocation(false);
                    if (!userLocation) setUserLocation(DEFAULT_USER_LOCATION);
                },
                { enableHighAccuracy: true, timeout: 6000, maximumAge: 300000 }
            );
        } else {
            setError('Geolocation not supported.');
            setGettingLocation(false);
            if (!userLocation) setUserLocation(DEFAULT_USER_LOCATION);
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
        setSelectedShop(null);
        setSelectedShop(shop);
        setLoadingDetails(true);
        setDetailsOpen(true);

        const alreadyViewed = viewedShopsRef.current.has(shop.id);
        if (!alreadyViewed) {
            viewedShopsRef.current.add(shop.id);
            incrementShopViewCount(shop.id).catch((err) => {
                console.log('View count error:', err);
                viewedShopsRef.current.delete(shop.id);
            });
        }

        try {
            const result = await getShopById(shop.id, userLocation);
            setSelectedShop(result.shop);
        } catch (err) {
            setError(err.message);
            setDetailsOpen(false);
        } finally {
            setLoadingDetails(false);
        }
    }, [userLocation]);

    const handleCloseDetails = () => {
        setDetailsOpen(false);
    };

    const handleGetDirections = (shop) => {
        if (!userLocation) return;
        window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${shop.latitude},${shop.longitude}`,
            '_blank'
        );
        setDetailsOpen(false);
    };

    const handleCallShop = (eOrPhone, maybePhone) => {
        let phone = maybePhone;
        if (typeof eOrPhone === 'string' || eOrPhone === undefined) {
            phone = eOrPhone;
        } else {
            eOrPhone.stopPropagation?.();
        }
        if (phone) {
            window.location.href = `tel:${phone}`;
        } else {
            setSnackbar({ open: true, message: 'No phone number available for this shop' });
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

    const activeFilterCount = useMemo(
        () => (selectedCategory ? 1 : 0) + (radius !== 10 ? 1 : 0),
        [selectedCategory, radius]
    );

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
                <CircularProgress sx={{ color: C.accent }} size={36} thickness={4} />
                <Typography variant="body2" sx={{ fontFamily: FONT, color: C.textMuted, fontWeight: 500 }}>
                    Detecting your location…
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                height: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: C.bg,
                fontFamily: FONT,
            }}
        >
            {/* ══ STICKY HEADER ══ */}
            <Box
                sx={{
                    flexShrink: 0,
                    background: C.surface,
                    px: 2,
                    pt: 1.5,
                    pb: 1.2,
                    borderBottom: `1px solid ${C.border}`,
                    zIndex: 100,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: C.text, letterSpacing: '-0.3px' }}>
                            Nearby Shops
                        </Typography>
                        {userLocation && (
                            <Typography variant="caption" sx={{ fontFamily: FONT, color: C.textMuted, fontSize: 11 }}>
                                {loading ? 'Searching nearby…' : `${shops.length} shop${shops.length === 1 ? '' : 's'} found near you`}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Refresh location" arrow>
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
                        </Tooltip>
                        <Tooltip title="Filters" arrow>
                            <Box sx={{ position: 'relative' }}>
                                <IconButton
                                    onClick={() => setFilterDrawerOpen(true)}
                                    sx={{
                                        width: 34, height: 34,
                                        borderRadius: '10px',
                                        bgcolor: filterDrawerOpen || activeFilterCount ? C.accentLight : C.surfaceAlt,
                                        color: filterDrawerOpen || activeFilterCount ? C.accent : C.textMuted,
                                        '&:hover': { bgcolor: C.accentLight, color: C.accent },
                                    }}
                                >
                                    <FilterIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                                {activeFilterCount > 0 && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: -3,
                                            right: -3,
                                            width: 15,
                                            height: 15,
                                            borderRadius: '50%',
                                            bgcolor: C.accent,
                                            border: `2px solid ${C.surface}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Typography sx={{ fontSize: 9, fontWeight: 800, color: 'white', fontFamily: FONT, lineHeight: 1 }}>
                                            {activeFilterCount}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Tooltip>
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
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '14px',
                            fontFamily: FONT,
                            fontSize: 14,
                            background: C.surfaceAlt,
                            transition: 'background 0.15s ease',
                            '& fieldset': { border: 'none' },
                            '&:hover': { background: C.borderLight },
                            '&.Mui-focused': {
                                background: C.surface,
                                boxShadow: `0 0 0 2px ${C.accent}33`,
                            },
                            '&.Mui-focused fieldset': { border: 'none' },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 20, color: C.textMuted }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchTerm('')}>
                                    <ClearIcon sx={{ fontSize: 16, color: C.textMuted }} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Radius chip */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1.2 }}>
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
                            fontFamily: FONT,
                            fontWeight: 600,
                            fontSize: 12.5,
                            color: C.text,
                            height: 30,
                            flexShrink: 0,
                            cursor: 'pointer',
                            '& .MuiChip-label': { px: '8px' },
                            '&:hover': { background: C.accentLight },
                        }}
                    />
                </Box>

                <CategoryQuickFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />
            </Box>

            {error && (
                <Fade in={!!error}>
                    <Alert
                        severity="error"
                        onClose={() => setError('')}
                        sx={{ mx: 2, mt: 1, borderRadius: '10px', fontFamily: FONT, flexShrink: 0 }}
                    >
                        {error}
                    </Alert>
                </Fade>
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
                            <Typography variant="h6" sx={{ fontFamily: FONT, fontWeight: 700, color: C.text, mb: 1 }}>
                                No shops found
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: FONT, color: C.textMuted, mb: 3 }}>
                                Try expanding your radius or changing filters.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={clearFilters}
                                disableElevation
                                sx={{ fontFamily: FONT, textTransform: 'none', borderRadius: '10px', background: C.accent, px: 3, fontWeight: 600 }}
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
                            <Typography variant="body2" sx={{ fontFamily: FONT, fontWeight: 700, color: C.text, fontSize: 13, lineHeight: 1.3 }}>
                                Can't find what you need?
                            </Typography>
                            <Typography variant="caption" sx={{ fontFamily: FONT, color: C.textMuted, fontSize: 11 }}>
                                Tell us the item, we'll help you find it near you!
                            </Typography>
                        </Box>

                    </Box>
                )}
            </Box>

            {/* ══ FILTER DRAWER ══ */}
            <Drawer
                anchor="bottom"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                transitionDuration={{ enter: 360, exit: 280 }}
                SlideProps={{ easing: { enter: SHEET_EASE_ENTER, exit: SHEET_EASE_EXIT } }}
                PaperProps={{
                    sx: {
                        borderRadius: '20px 20px 0 0',
                        p: 3,
                        pb: 'calc(24px + env(safe-area-inset-bottom))',
                        maxHeight: '85vh',
                        background: C.surface,
                        maxWidth: 560,
                        width: { xs: '100%', sm: 'calc(100% - 32px)' },
                        mx: { sm: 'auto' },
                    },
                }}
            >
                <Box sx={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 16px' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontFamily: FONT, fontWeight: 700, color: C.text }}>Filters</Typography>
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

            {/* ══ SHOP DETAILS DRAWER ══ */}
            <ShopDetailsDrawer
                open={detailsOpen}
                shop={selectedShop}
                loading={loadingDetails}
                onClose={handleCloseDetails}
                onRoute={handleGetDirections}
                onCall={handleCallShop}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={2500}
                onClose={() => setSnackbar({ open: false, message: '' })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ mb: { xs: `${BOTTOM_NAV_OFFSET}px`, md: 0 } }}
            >
                <Alert
                    severity="info"
                    onClose={() => setSnackbar({ open: false, message: '' })}
                    sx={{ fontFamily: FONT, borderRadius: '10px' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
