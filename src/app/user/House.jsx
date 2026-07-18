// app/user/Houses.jsx — First-class UI/UX pass: same design language as Shops.jsx
// (Inter only, same theme tokens, advanced MUI, smooth pulled-up-card detail sheet)

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    Grid,
    Pagination,
    Tooltip,
    Fade,
    Snackbar,
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Close as CloseIcon,
    Phone as PhoneIcon,
    Directions as DirectionsIcon,
    Home as HomeIcon,
    Bed as BedIcon,
    Bathtub as BathtubIcon,
    Kitchen as KitchenIcon,
    Clear as ClearIcon,
    Verified as VerifiedIcon,
    Pending as PendingIcon,
    SortOutlined as SortIcon,
    Person as PersonIcon,
    FamilyRestroom as FamilyIcon,
    Favorite as CoupleIcon,
    SquareFoot as SqftIcon,
    Visibility as VisibilityIcon,
    Refresh as RefreshIcon,
    Layers as FloorIcon,
    Weekend as FurnishingIcon,
    ArrowBackIosNew as ArrowBackIcon,
} from '@mui/icons-material';
import { getHousesByLocation, getHouseById, getHouseFilterOptions, incrementHouseViewCount } from '../../services/house';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_USER_LOCATION, getCachedUserLocation, saveCachedUserLocation } from '../../utils/userLocation';

// ─── Design Tokens (same theme, unchanged) ─────────────────────────────────
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
const BOTTOM_NAV_OFFSET = 150;
const APP_HEADER_OFFSET = 64;

// Smooth sheet motion — expo-out on the way in, quick ease-in on the way out
const SHEET_EASE_ENTER = 'cubic-bezier(0.16, 1, 0.3, 1)';
const SHEET_EASE_EXIT  = 'cubic-bezier(0.7, 0, 0.84, 0)';

// ─── Tenant Type Config ────────────────────────────────────────────────────


// ─── Price Range Config ────────────────────────────────────────────────────
const PRICE_RANGES = [
    { label: 'Any',          min: 0,     max: Infinity },
    { label: '₹0 – ₹5K',    min: 0,     max: 5000     },
    { label: '₹5K – ₹10K',  min: 5000,  max: 10000    },
    { label: '₹10K – ₹15K', min: 10000, max: 15000    },
    { label: '₹15K+',       min: 15000, max: Infinity  },
];

const RADIUS_PRESETS = [2, 5, 10, 25, 50];

/* ─── Image with graceful, state-based fallback (no DOM hacking) ───────────── */
function HouseImage({ src, alt, height = '100%', iconSize = 48 }) {
    const [failed, setFailed] = useState(false);
    const showFallback = !src || failed;

    return showFallback ? (
        <Box sx={{ width: '100%', height, background: `linear-gradient(135deg, ${C.surfaceAlt} 0%, ${C.borderLight} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HomeIcon sx={{ fontSize: iconSize, color: '#c0c8d8' }} />
        </Box>
    ) : (
        <img
            src={src}
            alt={alt}
            style={{ width: '100%', height, objectFit: 'cover', display: 'block' }}
            onError={() => setFailed(true)}
        />
    );
}

/* ─── Skeleton Card ───────────────────────────────────────────────────────── */
const HouseCardSkeleton = () => (
    <Box sx={{
        background: C.surface,
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${C.border}`,
        minWidth: { xs: '180px', sm: '250px' },
        maxWidth: { xs: '195px', sm: '100%' },
    }}>
        <Skeleton variant="rounded" width="100%" height={160} sx={{ borderRadius: 0 }} />
        <Box sx={{ p: '10px 12px 14px' }}>
            <Skeleton variant="text" width="70%" height={22} />
            <Skeleton variant="text" width="50%" height={16} sx={{ mt: 0.3 }} />
            <Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: '7px', mt: 1, mb: 1 }} />
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                <Skeleton variant="text" width={50} height={18} />
                <Skeleton variant="text" width={50} height={18} />
            </Box>
            <Skeleton variant="rounded" width="100%" height={36} sx={{ borderRadius: '10px' }} />
        </Box>
    </Box>
);

/* ─── House Card ─────────────────────────────────────────────────────────── */
function HouseCard({ house, onClick, onCall }) {
    const isVerified = !!house.is_verified;

    return (
        <Box
            onClick={onClick}
            sx={{
                background: C.surface,
                borderRadius: '16px',
                overflow: 'hidden',
                border: `1px solid ${C.border}`,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:active': { transform: 'scale(0.98)' },
                '&:hover': { borderColor: C.accentMid, boxShadow: `0 6px 20px ${C.shadow}` },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minWidth: { xs: '180px', sm: '250px' },
                maxWidth: { xs: '195px', sm: '100%' },
            }}
        >
            {/* ── Image ── */}
            <Box sx={{ position: 'relative', height: 160, overflow: 'hidden', flexShrink: 0, bgcolor: C.surfaceAlt }}>
                <HouseImage src={house.house_image} alt={house.title || `${house.rooms} BHK`} />

                <Chip
                    label={isVerified ? 'Verified' : 'Not Verified'}
                    icon={isVerified ? <VerifiedIcon sx={{ fontSize: '11px !important' }} /> : <PendingIcon sx={{ fontSize: '11px !important' }} />}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        height: 20,
                        bgcolor: isVerified ? C.greenLight : C.amberLight,
                        color: isVerified ? C.green : C.amber,
                        fontFamily: FONT,
                        fontWeight: 700,
                        fontSize: 9.5,
                        '& .MuiChip-icon': { color: isVerified ? C.green : C.amber, ml: '4px' },
                        '& .MuiChip-label': { px: '6px' },
                    }}
                />
            </Box>

            {/* ── Content ── */}
            <Box sx={{ p: '10px 12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 14,
                    color: C.text,
                    lineHeight: 1.3,
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                }}>
                    {house.title || `${house.rooms} BHK House`}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mb: 0.9 }}>
                    <LocationIcon sx={{ fontSize: 11, color: C.accent, flexShrink: 0 }} />
                    <Typography sx={{ fontFamily: FONT, fontSize: 11, color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {house.area}, {house.city}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ background: C.accent, borderRadius: '7px', px: 0.9, py: 0.35 }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                            ₹{(house.rent_per_month || 0).toLocaleString('en-IN')}
                        </Typography>
                    </Box>

                    {house.distance != null && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, px: 0.7, py: 0.35, borderRadius: '6px', bgcolor: C.accentLight }}>
                            <LocationIcon sx={{ fontSize: 10, color: C.accent }} />
                            <Typography sx={{ fontFamily: FONT, fontSize: 10.5, fontWeight: 600, color: C.accent }}>
                                {house.distance.toFixed(1)} km
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <BedIcon sx={{ fontSize: 12, color: C.textMuted }} />
                        <Typography sx={{ fontFamily: FONT, fontSize: 11, color: C.textMuted }}>{house.rooms} Beds</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 10, color: C.border }}>•</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <BathtubIcon sx={{ fontSize: 12, color: C.textMuted }} />
                        <Typography sx={{ fontFamily: FONT, fontSize: 11, color: C.textMuted }}>{house.bathrooms || 1} Bath</Typography>
                    </Box>
                    {house.area_sqft && (
                        <>
                            <Typography sx={{ fontSize: 10, color: C.border }}>•</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                <SqftIcon sx={{ fontSize: 12, color: C.textMuted }} />
                                <Typography sx={{ fontFamily: FONT, fontSize: 11, color: C.textMuted }}>{house.area_sqft} sq.ft</Typography>
                            </Box>
                        </>
                    )}
                </Box>

                <Tooltip title="Call owner" arrow>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<PhoneIcon sx={{ fontSize: 13 }} />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onCall(house.phone || house.owner_phone);
                        }}
                        sx={{
                            fontFamily: FONT,
                            textTransform: 'none',
                            borderRadius: '10px',
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.accent,
                            borderColor: C.border,
                            py: 0.7,
                            mt: 'auto',
                            '&:hover': { bgcolor: C.accentLight, borderColor: C.accent },
                        }}
                    >
                        Call
                    </Button>
                </Tooltip>
            </Box>
        </Box>
    );
}

const SectionLabel = ({ children }) => (
    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: C.text, mb: 1.5 }}>
        {children}
    </Typography>
);

const IconTile = ({ children, bg = C.accentLight }) => (
    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {children}
    </Box>
);

const StatItem = ({ icon, label }) => (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6, px: 0.5, minWidth: 0 }}>
        {icon}
        <Typography sx={{ fontFamily: FONT, fontSize: 11.5, fontWeight: 700, color: C.text, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
            {label}
        </Typography>
    </Box>
);

/* ─── House Details content (skeleton-aware) ─────────────────────────────────
   Same visual language as the Shop details sheet: a clean hero (no share /
   heart / gallery), a white card pulled up over its bottom edge, a quick
   bed/bath/sqft stat strip, then property details, description, contact. */
function HouseDetailsContent({ house, isMobile }) {
    const heroHeight = isMobile ? 280 : 340;

    if (!house) {
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

    const isVerified = !!house.is_verified;
    const furnishingLabel =
        house.furnished === 'furnished' ? 'Fully Furnished'
            : house.furnished === 'semi-furnished' ? 'Semi Furnished'
            : 'Unfurnished';

    const stats = [
        { icon: <BedIcon sx={{ fontSize: 18, color: C.accent }} />, label: `${house.rooms} Beds` },
        { icon: <BathtubIcon sx={{ fontSize: 18, color: C.accent }} />, label: `${house.bathrooms || 1} Baths` },
    ];
    if (house.area_sqft) {
        stats.push({ icon: <SqftIcon sx={{ fontSize: 18, color: C.accent }} />, label: `${house.area_sqft} sq.ft` });
    } else {
        stats.push({ icon: <KitchenIcon sx={{ fontSize: 18, color: C.accent }} />, label: `${house.kitchens || 1} Kitchen` });
    }

    const detailRows = [
        { icon: <FloorIcon sx={{ fontSize: 17, color: '#fb923c' }} />, bg: '#fff7ed', label: 'Floor', value: house.floor || 'Ground' },
        house.deposit_amount && { icon: <HomeIcon sx={{ fontSize: 17, color: C.green }} />, bg: C.greenLight, label: 'Deposit', value: `₹${house.deposit_amount.toLocaleString('en-IN')}` },
        house.maintenance_amount && { icon: <HomeIcon sx={{ fontSize: 17, color: C.amber }} />, bg: C.amberLight, label: 'Maintenance', value: `₹${house.maintenance_amount.toLocaleString('en-IN')}/mo` },
    ].filter(Boolean);

    return (
        <>
            {/* Hero image — clean photo + a single verification pill, nothing else */}
            <Box sx={{ position: 'relative', flexShrink: 0, height: heroHeight, width: '100%', overflow: 'hidden', backgroundColor: C.surfaceAlt }}>
                <HouseImage src={house.house_image} alt={house.title} height={heroHeight} iconSize={72} />

                <Chip
                    label={isVerified ? 'Verified' : 'Pending Verification'}
                    icon={isVerified ? <VerifiedIcon sx={{ fontSize: '13px !important' }} /> : <PendingIcon sx={{ fontSize: '13px !important' }} />}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 3,
                        bgcolor: isVerified ? C.green : C.amber,
                        color: 'white',
                        fontFamily: FONT,
                        fontWeight: 700,
                        fontSize: 11.5,
                        boxShadow: `0 4px 12px ${C.shadowMd}`,
                        '& .MuiChip-icon': { color: 'white' },
                    }}
                />

                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, rgba(15,23,42,0.5) 0%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }} />
            </Box>

            {/* Content card — pulled up over the hero's bottom edge */}
            <Box sx={{ position: 'relative', zIndex: 2, mt: '-28px', borderRadius: '28px 28px 0 0', background: C.surface, px: 3, pt: 3, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2, flexWrap: 'wrap' }}>
                    <Chip
                        label={`${house.rooms} BHK`}
                        size="small"
                        sx={{ borderRadius: '6px', bgcolor: C.accentLight, color: C.accent, fontFamily: FONT, fontWeight: 700, fontSize: 12 }}
                    />
                    <Chip
                        label={furnishingLabel}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '6px', borderColor: C.border, color: C.textSub, fontFamily: FONT, fontWeight: 600, fontSize: 11.5 }}
                    />
                </Box>

                <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: 21, color: C.text, mb: 0.6, letterSpacing: '-0.3px' }}>
                    {house.title || `${house.rooms} BHK House`}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2.5 }}>
                    <LocationIcon sx={{ fontSize: 15, color: C.textMuted }} />
                    <Typography sx={{ fontFamily: FONT, color: C.textMuted, fontSize: 13 }}>
                        {house.area}, {house.city}, {house.state}
                        {house.distance != null && ` · ${house.distance.toFixed(1)} km away`}
                    </Typography>
                </Box>

                {/* Stat strip — bed / bath / sqft (or kitchen) at a glance */}
                <Box sx={{ display: 'flex', alignItems: 'center', background: C.surfaceAlt, borderRadius: '16px', py: 1.6, mb: 2.5 }}>
                    {stats.map((s, i) => (
                        <React.Fragment key={i}>
                            <StatItem icon={s.icon} label={s.label} />
                            {i < stats.length - 1 && <Box sx={{ width: '1px', height: 28, background: C.border, flexShrink: 0 }} />}
                        </React.Fragment>
                    ))}
                </Box>

                {detailRows.length > 0 && (
                    <>
                        <SectionLabel>Property Details</SectionLabel>
                        <Grid container spacing={1.2} sx={{ mb: 2.5 }}>
                            {detailRows.map((item, i) => (
                                <Grid item xs={6} key={i}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.3, borderRadius: '12px', bgcolor: C.surfaceAlt }}>
                                        <IconTile bg={item.bg}>{item.icon}</IconTile>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontFamily: FONT, fontSize: 10.5, color: C.textMuted, fontWeight: 600, lineHeight: 1.2 }}>
                                                {item.label}
                                            </Typography>
                                            <Typography sx={{ fontFamily: FONT, fontSize: 13, color: C.text, fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.value}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                        <Divider sx={{ mb: 2.5, borderColor: C.borderLight }} />
                    </>
                )}

                {house.description && (
                    <>
                        <SectionLabel>About this place</SectionLabel>
                        <Typography variant="body2" sx={{ fontFamily: FONT, color: C.textSub, lineHeight: 1.65, mb: 2.5 }}>
                            {house.description}
                        </Typography>
                        <Divider sx={{ mb: 2.5, borderColor: C.borderLight }} />
                    </>
                )}

                <SectionLabel>Contact</SectionLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <IconTile><PhoneIcon sx={{ fontSize: 17, color: C.accent }} /></IconTile>
                    <Typography variant="body2" sx={{ fontFamily: FONT, color: C.text, fontWeight: 600 }}>
                        {house.phone || house.owner_phone || 'Not available'}
                    </Typography>
                </Box>
            </Box>
        </>
    );
}

/* ─── Full Screen / Bottom-sheet House Details Drawer ───────────────────────
   Stays mounted via the `open` prop so closing always plays the smooth
   slide-down animation instead of disappearing abruptly. */
function HouseDetailsDrawer({ open, house, onClose, onRoute, onCall }) {
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
                    ? { width: '100%', height: '100%', maxHeight: '100%', borderRadius: 0, m: 0, background: C.surface, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
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

            {/* Back / close — top-left, on the photo */}
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
                <HouseDetailsContent house={house} isMobile={isMobile} />
            </Box>

            {/* Sticky footer — rent on the left, actions on the right */}
            {house && (
                <Box
                    sx={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.2,
                        p: 2,
                        pb: isMobile ? 'calc(16px + env(safe-area-inset-bottom))' : 2,
                        borderTop: `1px solid ${C.borderLight}`,
                        background: C.surface,
                        boxShadow: `0 -8px 24px ${C.shadowMd}`,
                    }}
                >
                    <Box sx={{ flexShrink: 0, minWidth: 0 }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: 10.5, color: C.textMuted, fontWeight: 700, lineHeight: 1.2 }}>
                            Rent
                        </Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: 17, color: C.text, fontWeight: 800, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                            ₹{(house.rent_per_month || 0).toLocaleString('en-IN')}
                            <Typography component="span" sx={{ fontFamily: FONT, fontSize: 11, color: C.textMuted, fontWeight: 600 }}>/mo</Typography>
                        </Typography>
                    </Box>

                    <Tooltip title="Call owner" arrow>
                        <IconButton
                            onClick={() => onCall(house.phone || house.owner_phone)}
                            sx={{ width: 48, height: 48, borderRadius: '14px', border: `1.5px solid ${C.accent}`, color: C.accent, flexShrink: 0, ml: 'auto', '&:hover': { bgcolor: C.accentLight } }}
                        >
                            <PhoneIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<DirectionsIcon sx={{ fontSize: 18 }} />}
                        onClick={() => onRoute(house)}
                        disableElevation
                        sx={{
                            fontFamily: FONT,
                            textTransform: 'none',
                            borderRadius: '14px',
                            background: C.accent,
                            fontWeight: 700,
                            fontSize: 14,
                            px: 2.2,
                            py: 1.3,
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                            boxShadow: `0 8px 20px ${C.shadow}`,
                            '&:hover': { background: C.accentDark },
                        }}
                    >
                        Directions
                    </Button>
                </Box>
            )}
        </Drawer>
    );
}

/* ─── Filter Panel ──────────────────────────────────────────────────────── */
const FilterPanel = ({ radius, setRadius, rentRange, setRentRange, rooms, setRooms, furnished, setFurnished, filterOptions, clearFilters, onApply }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
                <Typography variant="body2" sx={{ fontFamily: FONT, fontWeight: 600, color: C.text }}>Distance Radius</Typography>
                <Chip label={`${radius} km`} size="small" sx={{ bgcolor: C.accent, color: 'white', fontFamily: FONT, fontWeight: 700, fontSize: 12, height: 24 }} />
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
                            fontFamily: FONT, fontWeight: 600, fontSize: 12, borderRadius: '8px', cursor: 'pointer',
                            bgcolor: radius === r ? C.accentLight : 'transparent',
                            color: radius === r ? C.accent : C.textMuted,
                            borderColor: radius === r ? C.accentMid : C.border,
                            '&:hover': { bgcolor: C.accentLight, color: C.accent, borderColor: C.accentMid },
                        }}
                    />
                ))}
            </Box>

            <Slider
                value={radius} onChange={(_, val) => setRadius(val)}
                min={1} max={50} valueLabelDisplay="auto"
                sx={{
                    color: C.accent, height: 4,
                    '& .MuiSlider-thumb': { width: 18, height: 18, boxShadow: `0 2px 6px ${C.shadow}`, '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px ${C.accent}1f` } },
                    '& .MuiSlider-rail': { opacity: 0.2 },
                }}
            />
        </Box>

        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
                <Typography variant="body2" sx={{ fontFamily: FONT, fontWeight: 600, color: C.text }}>Rent Range (₹/month)</Typography>
                <Typography variant="body2" sx={{ fontFamily: FONT, fontWeight: 700, color: C.accent, fontSize: 12.5 }}>
                    ₹{rentRange[0].toLocaleString()} – ₹{rentRange[1].toLocaleString()}
                </Typography>
            </Box>
            <Slider
                value={rentRange} onChange={(_, val) => setRentRange(val)}
                min={filterOptions.min_rent || 0} max={filterOptions.max_rent || 100000}
                valueLabelDisplay="auto" valueLabelFormat={(v) => `₹${(v / 1000).toFixed(0)}K`}
                sx={{
                    color: C.accent, height: 4,
                    '& .MuiSlider-thumb': { width: 18, height: 18, boxShadow: `0 2px 6px ${C.shadow}` },
                    '& .MuiSlider-rail': { opacity: 0.2 },
                }}
            />
        </Box>

        <FormControl fullWidth size="small">
            <InputLabel sx={{ fontFamily: FONT }}>Minimum Rooms</InputLabel>
            <Select value={rooms} onChange={(e) => setRooms(e.target.value)} label="Minimum Rooms" sx={{ borderRadius: '10px', fontFamily: FONT, fontSize: 14 }}>
                <MenuItem value={0} sx={{ fontFamily: FONT, fontSize: 14 }}>Any</MenuItem>
                {filterOptions.rooms?.map((r) => <MenuItem key={r} value={r} sx={{ fontFamily: FONT, fontSize: 14 }}>{r} BHK</MenuItem>)}
            </Select>
        </FormControl>


        <Box sx={{ display: 'flex', gap: 1.2 }}>
            <Button
                fullWidth variant="outlined" startIcon={<ClearIcon sx={{ fontSize: 16 }} />} onClick={clearFilters}
                sx={{
                    fontFamily: FONT, textTransform: 'none', borderRadius: '10px', borderColor: C.border,
                    color: C.textMuted, fontWeight: 600, fontSize: 13.5,
                    '&:hover': { borderColor: C.accent, color: C.accent, background: C.accentLight },
                }}
            >
                Clear All
            </Button>
            <Button
                fullWidth variant="contained" onClick={onApply} disableElevation
                sx={{
                    fontFamily: FONT, textTransform: 'none', borderRadius: '10px', background: C.accent,
                    fontWeight: 700, fontSize: 13.5,
                    '&:hover': { background: C.accentDark },
                }}
            >
                Apply Filters
            </Button>
        </Box>
    </Box>
);

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════════════ */
export default function Houses() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const viewedHousesRef = useRef(new Set());
    const headerRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(200);

    useEffect(() => {
        const measure = () => {
            if (headerRef.current) {
                const h = headerRef.current.getBoundingClientRect().height;
                if (h > 0) setHeaderHeight(h);
            }
        };
        const t = setTimeout(measure, 50);
        const ro = new ResizeObserver(measure);
        if (headerRef.current) ro.observe(headerRef.current);
        window.addEventListener('resize', measure);
        return () => {
            clearTimeout(t);
            ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, []);

    const [loading, setLoading] = useState(true);
    const initialLocation = useMemo(() => getCachedUserLocation(), []);
    const [houses, setHouses] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [userLocation, setUserLocation] = useState(initialLocation);
    const [gettingLocation, setGettingLocation] = useState(!initialLocation);
    const [filterOptions, setFilterOptions] = useState({ min_rent: 0, max_rent: 100000, rooms: [], furnished: [] });

    const [radius, setRadius] = useState(10);
    const [rentRange, setRentRange] = useState([0, 50000]);
    const [rooms, setRooms] = useState(0);
    const [furnished, setFurnished] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [selectedTenantType, setSelectedTenantType] = useState('');
    const [selectedPriceRange, setSelectedPriceRange] = useState(0);

    const [selectedHouse, setSelectedHouse] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    useEffect(() => {
        getCurrentLocation();
        loadFilterOptions();
    }, []);

    useEffect(() => {
        if (userLocation) loadHouses();
    }, [userLocation, radius, rentRange, rooms, furnished, searchTerm, currentPage, selectedTenantType, selectedPriceRange]);

    const getCurrentLocation = () => {
        setGettingLocation(!userLocation);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const nextLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
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

    const loadFilterOptions = async () => {
        try {
            const result = await getHouseFilterOptions();
            setFilterOptions(result.filters);
            setRentRange([result.filters.min_rent, result.filters.max_rent]);
        } catch (err) {
            console.error('Error loading filter options:', err);
        }
    };

    const loadHouses = async () => {
        if (!userLocation) return;
        setLoading(true);
        const pr = PRICE_RANGES[selectedPriceRange];
        try {
            const result = await getHousesByLocation({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                radius,
                minRent: pr.min === 0 ? rentRange[0] : pr.min,
                maxRent: pr.max === Infinity ? rentRange[1] : pr.max,
                rooms,
                furnished,
                tenantType: selectedTenantType,
                search: searchTerm,
                page: currentPage,
                limit: 12,
            });
            setHouses(result.houses || []);
            setTotalPages(result.totalPages || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleHouseClick = async (house) => {
        setSelectedHouse(null);
        setSelectedHouse(house);
        setLoadingDetails(true);
        setDetailsOpen(true);

        if (!viewedHousesRef.current.has(house.id)) {
            viewedHousesRef.current.add(house.id);
            incrementHouseViewCount(house.id).catch(() => viewedHousesRef.current.delete(house.id));
        }

        try {
            const result = await getHouseById(house.id, userLocation);
            setSelectedHouse(result.house);
        } catch (err) {
            setError(err.message);
            setDetailsOpen(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleGetDirections = (house) => {
        if (!userLocation) return;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${house.latitude},${house.longitude}`;
        window.open(url, '_blank');
        setDetailsOpen(false);
    };

    const handleCallOwner = (phone) => {
        if (phone) {
            window.location.href = `tel:${phone}`;
        } else {
            setSnackbar({ open: true, message: 'No phone number available for this listing' });
        }
    };

    const clearFilters = () => {
        setRadius(10);
        setRentRange([filterOptions.min_rent, filterOptions.max_rent]);
        setRooms(0);
        setFurnished('');
        setSearchTerm('');
        setSelectedTenantType('');
        setSelectedPriceRange(0);
        setCurrentPage(1);
        setFilterDrawerOpen(false);
    };

    const activeFilterCount = useMemo(
        () => (rooms !== 0 ? 1 : 0) + (furnished ? 1 : 0) + (radius !== 10 ? 1 : 0),
        [rooms, furnished, radius]
    );

    if (gettingLocation) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2, bgcolor: C.bg }}>
                <CircularProgress sx={{ color: C.accent }} size={36} thickness={4} />
                <Typography variant="body2" sx={{ fontFamily: FONT, color: C.textMuted, fontWeight: 500 }}>Detecting your location…</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: C.bg, minHeight: '100vh', pb: `${BOTTOM_NAV_OFFSET + 20}px`, fontFamily: FONT }}>

            {/* ── STICKY HEADER ── */}
            <Box ref={headerRef} sx={{
                position: isMobile ? 'fixed' : 'sticky',
                top: isMobile ? `${APP_HEADER_OFFSET}px` : 0,
                left: 0,
                right: 0,
                width: '100%',
                maxWidth: '100vw',
                zIndex: 1000,
                background: C.surface,
                px: 2, pt: 2, pb: 1.5,
                borderBottom: `1px solid ${C.border}`,
                boxShadow: isMobile ? `0 8px 24px ${C.shadowMd}` : 'none',
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box>
                        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: C.text, letterSpacing: '-0.3px' }}>
                            Rental Homes
                        </Typography>
                        {userLocation && (
                            <Typography variant="caption" sx={{ fontFamily: FONT, color: C.textMuted, fontSize: 11 }}>
                                {loading ? 'Searching nearby…' : `${houses.length} house${houses.length === 1 ? '' : 's'} found near you`}
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Refresh location" arrow>
                            <IconButton
                                onClick={getCurrentLocation}
                                sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: C.surfaceAlt, color: C.textMuted, '&:hover': { bgcolor: C.accentLight, color: C.accent } }}
                            >
                                <RefreshIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Filters" arrow>
                            <Box sx={{ position: 'relative' }}>
                                <IconButton
                                    onClick={() => setFilterDrawerOpen(true)}
                                    sx={{
                                        width: 34, height: 34, borderRadius: '10px',
                                        bgcolor: filterDrawerOpen || activeFilterCount ? C.accentLight : C.surfaceAlt,
                                        color: filterDrawerOpen || activeFilterCount ? C.accent : C.textMuted,
                                        '&:hover': { bgcolor: C.accentLight, color: C.accent },
                                    }}
                                >
                                    <FilterIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                                {activeFilterCount > 0 && (
                                    <Box sx={{
                                        position: 'absolute', top: -3, right: -3, width: 15, height: 15, borderRadius: '50%',
                                        bgcolor: C.accent, border: `2px solid ${C.surface}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Typography sx={{ fontSize: 9, fontWeight: 800, color: 'white', fontFamily: FONT, lineHeight: 1 }}>
                                            {activeFilterCount}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Tooltip>
                    </Box>
                </Box>

                <TextField
                    fullWidth
                    placeholder="Search houses by area or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{
                        mb: 1.5,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '14px', fontFamily: FONT, fontSize: 14,
                            background: C.surfaceAlt,
                            transition: 'background 0.15s ease',
                            '& fieldset': { border: 'none' },
                            '&:hover': { background: C.borderLight },
                            '&.Mui-focused': { background: C.surface, boxShadow: `0 0 0 2px ${C.accent}33` },
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

              
                {/* Price Range Pills */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.text, whiteSpace: 'nowrap', mr: 0.5 }}>
                        Price
                    </Typography>
                    {PRICE_RANGES.map((pr, idx) => {
                        const active = selectedPriceRange === idx;
                        return (
                            <Chip
                                key={idx}
                                label={pr.label}
                                onClick={() => { setSelectedPriceRange(idx); setCurrentPage(1); }}
                                sx={{
                                    fontFamily: FONT, fontWeight: active ? 700 : 600, fontSize: 12, flexShrink: 0,
                                    border: `1.5px solid ${active ? C.accent : C.accentMid}`,
                                    bgcolor: active ? C.accent : C.accentLight,
                                    color: active ? '#fff' : C.accent,
                                }}
                            />
                        );
                    })}
                </Box>

                <Chip
                    icon={<LocationIcon sx={{ fontSize: '14px !important', color: `${C.accent} !important` }} />}
                    label={`Within ${radius} km`}
                    deleteIcon={<ClearIcon sx={{ fontSize: '16px !important', color: `${C.textMuted} !important` }} />}
                    onDelete={() => setFilterDrawerOpen(true)}
                    onClick={() => setFilterDrawerOpen(true)}
                    size="small"
                    sx={{
                        mt: 1, borderRadius: '20px', border: `1px solid ${C.border}`,
                        background: C.surface, fontFamily: FONT, fontWeight: 600, fontSize: 12.5,
                        color: C.text, height: 30, cursor: 'pointer',
                        '&:hover': { background: C.accentLight },
                    }}
                />
            </Box>

            {isMobile && <Box sx={{ height: headerHeight }} />}

            {/* Results count + sort */}
            <Box sx={{ px: 2, pt: 1.5, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: C.textMuted }}>
                    {houses.length} house{houses.length === 1 ? '' : 's'} found
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: 12, color: C.textMuted }}>Sort by:</Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: 12, color: C.accent, fontWeight: 700 }}>Relevance</Typography>
                    <SortIcon sx={{ fontSize: 15, color: C.accent }} />
                </Box>
            </Box>

            {error && (
                <Fade in={!!error}>
                    <Box sx={{ px: 2, mb: 1 }}>
                        <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2, fontFamily: FONT, fontSize: 13 }}>
                            {error}
                        </Alert>
                    </Box>
                </Fade>
            )}

            {/* ── GRID ── */}
            <Box sx={{ px: 1.5, width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
                <Grid container spacing={1.5}>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Grid item xs={6} sm={4} md={3} key={i}>
                                <HouseCardSkeleton />
                            </Grid>
                        ))
                    ) : houses.length === 0 ? (
                        <Grid item xs={12} sx={{ width: '100%' }}>
                            <Box sx={{
                                width: '100%',
                                minHeight: { xs: 'calc(100dvh - 260px)', sm: '50vh' },
                                py: 6,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                mx: 'auto',
                            }}>
                                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                    <HomeIcon sx={{ fontSize: 40, color: C.textMuted }} />
                                </Box>
                                <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: C.text, mb: 0.6 }}>
                                    No houses found
                                </Typography>
                                <Typography sx={{ fontFamily: FONT, fontSize: 13, color: C.textMuted, mb: 2.5, maxWidth: 260 }}>
                                    Try adjusting your filters or search term
                                </Typography>
                                <Button
                                    variant="contained" onClick={clearFilters} disableElevation
                                    sx={{ fontFamily: FONT, textTransform: 'none', borderRadius: '10px', bgcolor: C.accent, fontWeight: 700, px: 3, py: 1, '&:hover': { bgcolor: C.accentDark } }}
                                >
                                    Clear Filters
                                </Button>
                            </Box>
                        </Grid>
                    ) : (
                        houses.map((house) => (
                            <Grid item xs={6} sm={4} md={3} key={house.id}>
                                <HouseCard house={house} onClick={() => handleHouseClick(house)} onCall={handleCallOwner} />
                            </Grid>
                        ))
                    )}
                </Grid>
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                    <Pagination
                        count={totalPages} page={currentPage}
                        onChange={(_, val) => setCurrentPage(val)}
                        sx={{
                            '& .MuiPaginationItem-root': { borderRadius: '8px', fontFamily: FONT },
                            '& .Mui-selected': { bgcolor: `${C.accent} !important`, color: '#fff' },
                        }}
                    />
                </Box>
            )}

            {/* ── FILTER BOTTOM SHEET ── */}
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
                        boxShadow: `0 -12px 50px ${C.shadowLg}`,
                        border: `1.5px solid ${C.border}`,
                        borderBottom: 'none',
                    },
                }}
            >
                <Box sx={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 16px' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: C.text }}>Filters</Typography>
                    <IconButton onClick={() => setFilterDrawerOpen(false)} size="small" sx={{ bgcolor: C.surfaceAlt, borderRadius: '10px' }}>
                        <CloseIcon sx={{ fontSize: 16, color: C.textMuted }} />
                    </IconButton>
                </Box>
                <Divider sx={{ mb: 3, borderColor: C.borderLight }} />
                <FilterPanel
                    radius={radius} setRadius={setRadius}
                    rentRange={rentRange} setRentRange={setRentRange}
                    rooms={rooms} setRooms={setRooms}
                    furnished={furnished} setFurnished={setFurnished}
                    filterOptions={filterOptions}
                    clearFilters={clearFilters}
                    onApply={() => setFilterDrawerOpen(false)}
                />
            </Drawer>

            {/* ── HOUSE DETAIL SHEET ── */}
            <HouseDetailsDrawer
                open={detailsOpen}
                house={selectedHouse}
                onClose={() => setDetailsOpen(false)}
                onRoute={handleGetDirections}
                onCall={handleCallOwner}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={2500}
                onClose={() => setSnackbar({ open: false, message: '' })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ mb: { xs: `${BOTTOM_NAV_OFFSET}px`, md: 0 } }}
            >
                <Alert severity="info" onClose={() => setSnackbar({ open: false, message: '' })} sx={{ fontFamily: FONT, borderRadius: '10px' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
