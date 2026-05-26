// app/user/Houses.jsx
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
    Grid,
    Pagination,
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
    AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { getHousesByLocation, getHouseById, getHouseFilterOptions, incrementHouseViewCount } from '../../services/house';
import { useNavigate } from 'react-router-dom';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
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

const BOTTOM_NAV_OFFSET = 150;

// ─── Tenant Type Config ────────────────────────────────────────────────────────
const TENANT_TYPES = [
    { value: 'bachelor', label: 'Bachelor', color: '#4f9ef8', bg: '#eaf3ff', Icon: PersonIcon },
    { value: 'family',   label: 'Family',   color: '#3bbf7e', bg: '#e8faf2', Icon: FamilyIcon },
    { value: 'couple',   label: 'Couple',   color: '#f06292', bg: '#fce4ec', Icon: CoupleIcon },
];

// ─── Price Range Config ────────────────────────────────────────────────────────
const PRICE_RANGES = [
    { label: 'Any',         min: 0,     max: Infinity },
    { label: '₹0 – ₹5K',   min: 0,     max: 5000     },
    { label: '₹5K – ₹10K', min: 5000,  max: 10000    },
    { label: '₹10K – ₹15K',min: 10000, max: 15000    },
    { label: '₹15K+',      min: 15000, max: Infinity  },
];

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
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="70%" height={20} sx={{ mt: 0.5 }} />
            <Skeleton variant="text" width="50%" height={16} />
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1, mb: 1.5 }}>
                <Skeleton variant="text" width={50} height={18} />
                <Skeleton variant="text" width={50} height={18} />
            </Box>
            <Skeleton variant="rounded" width="100%" height={36} sx={{ borderRadius: '10px' }} />
        </Box>
    </Box>
);

/* ─── House Card ─────────────────────────────────────────────────────────── */
function HouseCard({ house, onClick, onCall }) {
    const verification = house.is_verified ? 'Verified' : 'Not Verified';
    const verificationColor = house.is_verified ? C.green : C.amber;
    const verificationBg = house.is_verified ? C.greenLight : C.amberLight;

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
                '&:hover': { borderColor: C.accentMid, boxShadow: `0 4px 16px ${C.shadow}` },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minWidth: { xs: '180px', sm: '250px' },
                maxWidth: { xs: '195px', sm: '100%' },
            }}
        >
            {/* ── Image Section ── */}
            <Box sx={{ position: 'relative', height: 160, overflow: 'hidden', flexShrink: 0 }}>
                {house.house_image ? (
                    <img
                        src={house.house_image}
                        alt={house.title || `${house.rooms} BHK`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;background:${C.surfaceAlt};display:flex;align-items:center;justify-content:center"><svg class="MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" style="font-size:48px;color:#c0c8d8"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg></div>`;
                        }}
                    />
                ) : (
                    <Box sx={{ width: '100%', height: '100%', bgcolor: C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HomeIcon sx={{ fontSize: 48, color: '#c0c8d8' }} />
                    </Box>
                )}

                {/* Verification Badge — LEFT side */}
                <Box sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: verificationBg,
                    borderRadius: '6px',
                    px: 0.8,
                    py: 0.3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.3,
                }}>
                    {house.is_verified ? (
                        <VerifiedIcon sx={{ fontSize: 10, color: verificationColor }} />
                    ) : (
                        <PendingIcon sx={{ fontSize: 10, color: verificationColor }} />
                    )}
                    <Typography sx={{ fontSize: 9, fontWeight: 600, color: verificationColor }}>
                        {verification}
                    </Typography>
                </Box>
            </Box>

            {/* ── Content Section ── */}
            <Box sx={{ p: '10px 12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Title */}
                <Typography sx={{
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

                {/* Location */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mb: 0.8 }}>
                    <LocationIcon sx={{ fontSize: 11, color: C.accent }} />
                    <Typography sx={{ fontSize: 11, color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {house.area}, {house.city}
                    </Typography>
                </Box>

                {/* Price + Distance row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    {/* Price */}
                    <Box sx={{
                        background: C.accent,
                        borderRadius: '7px',
                        px: 0.9,
                        py: 0.35,
                    }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                            ₹{(house.rent_per_month || 0).toLocaleString('en-IN')}
                        </Typography>
                    </Box>

                    {/* Distance */}
                    {house.distance && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.3,
                            px: 0.7,
                            py: 0.35,
                            borderRadius: '6px',
                            bgcolor: C.accentLight,
                        }}>
                            <LocationIcon sx={{ fontSize: 10, color: C.accent }} />
                            <Typography sx={{ fontSize: 10.5, fontWeight: 500, color: C.accent }}>
                                {house.distance.toFixed(1)} km
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Specs Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <BedIcon sx={{ fontSize: 12, color: C.textMuted }} />
                        <Typography sx={{ fontSize: 11, color: C.textMuted }}>{house.rooms} Beds</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 10, color: C.border }}>•</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <BathtubIcon sx={{ fontSize: 12, color: C.textMuted }} />
                        <Typography sx={{ fontSize: 11, color: C.textMuted }}>{house.bathrooms || 1} Bath</Typography>
                    </Box>
                    {house.area_sqft && (
                        <>
                            <Typography sx={{ fontSize: 10, color: C.border }}>•</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                <SqftIcon sx={{ fontSize: 12, color: C.textMuted }} />
                                <Typography sx={{ fontSize: 11, color: C.textMuted }}>{house.area_sqft} sq.ft</Typography>
                            </Box>
                        </>
                    )}
                </Box>

                {/* Call Button */}
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PhoneIcon sx={{ fontSize: 13 }} />}
                    onClick={(e) => {
                        e.stopPropagation();
                        onCall(house.phone || house.owner_phone);
                    }}
                    sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.accent,
                        borderColor: C.border,
                        py: 0.7,
                        mt: 'auto',
                        '&:hover': { bgcolor: C.accentLight, borderColor: C.accent },
                    }}
                >
                    Call
                </Button>
            </Box>
        </Box>
    );
}

// ─── House Details Drawer ──────────────────────────────────────────────────────
function HouseDetailsDrawer({ house, onClose, onRoute, onCall, userLocation, headerHeight }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 600);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const verification = house.is_verified ? 'Verified Property' : 'Not Verified';
    const verificationColor = house.is_verified ? C.green : C.amber;
    const verificationBg = house.is_verified ? C.greenLight : C.amberLight;

    const drawerStyle = isMobile ? {
        position: 'fixed',
        top: 64,                   // AppLayout TOP_BAR_HEIGHT = 64px — NearZO header stays visible above
        left: 0,
        right: 0,
        bottom: 0,
        height: 'calc(100% - 64px)',
        borderRadius: '20px 20px 0 0',
        zIndex: 1299,
        background: C.surface,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'hidden',
        boxShadow: `0 -8px 40px ${C.shadowLg}`,
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
        zIndex: 1299,
        background: C.surface,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: `0 -12px 50px ${C.shadowLg}`,
        border: `1px solid ${C.border}`,
        borderBottom: 'none',
    };

    if (!house) return null;

    return (
        <>
            {/* Backdrop — covers content below AppLayout top bar */}
            {!isMobile && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 1298,
                        background: 'rgba(15,23,42,0.35)',
                        backdropFilter: 'blur(2px)',
                    }}
                    onClick={onClose}
                />
            )}
            {isMobile && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 64,             // below NearZO top bar
                        left: 0, right: 0, bottom: 0,
                        zIndex: 1298,
                        background: 'rgba(15,23,42,0.25)',
                        backdropFilter: 'blur(2px)',
                    }}
                    onClick={onClose}
                />
            )}

            <Box sx={drawerStyle}>
                {/* ── Top Bar (replaces sticky header on mobile) ── */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5,
                    borderBottom: `1px solid ${C.borderLight}`,
                    flexShrink: 0,
                    background: C.surface,
                    zIndex: 1,
                }}>
                    <Typography sx={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: C.text,
                        letterSpacing: '-0.2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        mr: 1,
                    }}>
                        {house.title || `${house.rooms} BHK House`}
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            bgcolor: C.surfaceAlt,
                            border: `1px solid ${C.border}`,
                            borderRadius: '12px',
                            width: 36, height: 36,
                            flexShrink: 0,
                            '&:hover': { bgcolor: C.accentLight, borderColor: C.accent },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 18, color: C.text }} />
                    </IconButton>
                </Box>

                {/* Image */}
                <Box sx={{ position: 'relative', flexShrink: 0, height: isMobile ? 200 : 220 }}>
                    {house.house_image ? (
                        <img
                            src={house.house_image}
                            alt={house.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `<div style="height:100%;background:${C.surfaceAlt};display:flex;align-items:center;justify-content:center"><svg class="MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" style="font-size:72px;color:#c0c8d8"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg></div>`;
                            }}
                        />
                    ) : (
                        <Box sx={{ height: '100%', bgcolor: C.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HomeIcon sx={{ fontSize: 72, color: '#c0c8d8' }} />
                        </Box>
                    )}

                    {/* Price Badge */}
                    <Box sx={{
                        position: 'absolute', bottom: 12, left: 12,
                        background: C.accent, borderRadius: '10px', px: 1.5, py: 0.8,
                    }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
                            ₹{(house.rent_per_month || 0).toLocaleString('en-IN')}
                            <Typography component="span" sx={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.8)' }}>/mo</Typography>
                        </Typography>
                    </Box>

                    {/* Verification Badge */}
                    <Box sx={{
                        position: 'absolute', top: 12, right: 12,
                        background: verificationBg, borderRadius: '8px',
                        px: 1, py: 0.6,
                        display: 'flex', alignItems: 'center', gap: 0.5,
                    }}>
                        {house.is_verified ? (
                            <VerifiedIcon sx={{ fontSize: 12, color: verificationColor }} />
                        ) : (
                            <PendingIcon sx={{ fontSize: 12, color: verificationColor }} />
                        )}
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: verificationColor }}>
                            {verification}
                        </Typography>
                    </Box>

                    {/* Views Badge */}
                    {house.views_count !== undefined && (
                        <Box sx={{
                            position: 'absolute', bottom: 12, right: 12,
                            display: 'flex', alignItems: 'center', gap: 0.8,
                            bgcolor: 'rgba(255,255,255,0.95)', borderRadius: '20px',
                            px: 1.2, py: 0.5,
                            boxShadow: `0 2px 8px ${C.shadowMd}`,
                        }}>
                            <VisibilityIcon sx={{ fontSize: 12, color: C.accent }} />
                            <Typography sx={{ fontSize: 11, fontWeight: 600, color: C.accent }}>
                                {house.views_count} views
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Scrollable Content */}
                <Box sx={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', p: 3, pb: `${BOTTOM_NAV_OFFSET + 16}px` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                        <LocationIcon sx={{ fontSize: 14, color: C.textMuted }} />
                        <Typography sx={{ fontSize: 13, color: C.textMuted }}>
                            {house.area}, {house.city}, {house.state}
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2, borderColor: C.borderLight }} />

                    <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5, color: C.text }}>
                        Property Details
                    </Typography>
                    <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                        {[
                            { icon: <BedIcon sx={{ fontSize: 16, color: C.accent }} />, label: `${house.rooms} Bedrooms`, bg: C.accentLight },
                            { icon: <BathtubIcon sx={{ fontSize: 16, color: C.green }} />, label: `${house.bathrooms || 1} Bathrooms`, bg: C.greenLight },
                            { icon: <KitchenIcon sx={{ fontSize: 16, color: '#f06292' }} />, label: `${house.kitchens || 1} Kitchen`, bg: '#fce4ec' },
                            { icon: <HomeIcon sx={{ fontSize: 16, color: '#fb923c' }} />, label: `Floor ${house.floor || 'Ground'}`, bg: '#fff7ed' },
                        ].map((item, i) => (
                            <Grid item xs={6} key={i}>
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', gap: 1,
                                    p: 1.2, borderRadius: '10px', bgcolor: item.bg,
                                }}>
                                    {item.icon}
                                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                                        {item.label}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    <Typography variant="body2" sx={{ mb: 1, color: C.textSub }}>
                        <strong style={{ color: C.text }}>Furnishing:</strong>{' '}
                        {house.furnished === 'furnished' ? 'Fully Furnished'
                            : house.furnished === 'semi-furnished' ? 'Semi Furnished' : 'Unfurnished'}
                    </Typography>
                    {house.deposit_amount && (
                        <Typography variant="body2" sx={{ mb: 1, color: C.textSub }}>
                            <strong style={{ color: C.text }}>Deposit:</strong> ₹{house.deposit_amount.toLocaleString('en-IN')}
                        </Typography>
                    )}
                    {house.maintenance_amount && (
                        <Typography variant="body2" sx={{ mb: 1.5, color: C.textSub }}>
                            <strong style={{ color: C.text }}>Maintenance:</strong> ₹{house.maintenance_amount.toLocaleString('en-IN')}/month
                        </Typography>
                    )}
                    {house.distance && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                            <LocationIcon sx={{ fontSize: 14, color: C.accent }} />
                            <Typography variant="body2" sx={{ color: C.textSub }}>
                                {house.distance.toFixed(1)} km from your location
                            </Typography>
                        </Box>
                    )}

                    {house.description && (
                        <>
                            <Divider sx={{ my: 2, borderColor: C.borderLight }} />
                            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1, color: C.text }}>
                                Description
                            </Typography>
                            <Typography variant="body2" sx={{ color: C.textSub, lineHeight: 1.65 }}>
                                {house.description}
                            </Typography>
                        </>
                    )}

                    <Divider sx={{ my: 2.5, borderColor: C.borderLight }} />

                    <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5, color: C.text }}>
                        Contact
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                        <Box sx={{
                            width: 32, height: 32, borderRadius: '8px',
                            bgcolor: C.accentLight,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <PhoneIcon sx={{ fontSize: 16, color: C.accent }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: C.text }}>
                            {house.phone || house.owner_phone || 'Not available'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            fullWidth variant="contained"
                            startIcon={<DirectionsIcon />}
                            onClick={() => onRoute(house)}
                            sx={{
                                textTransform: 'none', borderRadius: '12px',
                                background: C.accent, fontWeight: 600, py: 1.2,
                                '&:hover': { background: C.accentDark },
                            }}
                        >
                            Directions
                        </Button>
                        <Button
                            fullWidth variant="outlined"
                            startIcon={<PhoneIcon />}
                            onClick={() => onCall(house.phone || house.owner_phone)}
                            sx={{
                                textTransform: 'none', borderRadius: '12px',
                                borderColor: C.accent, color: C.accent, fontWeight: 600, py: 1.2,
                                '&:hover': { bgcolor: C.accentLight },
                            }}
                        >
                            Call Owner
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
const FilterPanel = ({ radius, setRadius, rentRange, setRentRange, rooms, setRooms, furnished, setFurnished, filterOptions, clearFilters, onApply }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: C.text }}>Filters</Typography>

        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: C.textMuted }}>Distance Radius</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: C.accent }}>{radius} km</Typography>
            </Box>
            <Slider
                value={radius} onChange={(_, val) => setRadius(val)}
                min={1} max={50} valueLabelDisplay="auto"
                sx={{
                    color: C.accent, height: 4,
                    '& .MuiSlider-thumb': { width: 16, height: 16, '&:hover': { boxShadow: `0 0 0 6px ${C.accent}22` } },
                    '& .MuiSlider-rail': { opacity: 0.2 },
                }}
            />
        </Box>

        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: C.textMuted }}>Rent Range (₹/month)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: C.accent }}>
                    ₹{rentRange[0].toLocaleString()} – ₹{rentRange[1].toLocaleString()}
                </Typography>
            </Box>
            <Slider
                value={rentRange} onChange={(_, val) => setRentRange(val)}
                min={filterOptions.min_rent || 0} max={filterOptions.max_rent || 100000}
                valueLabelDisplay="auto" valueLabelFormat={(v) => `₹${(v / 1000).toFixed(0)}K`}
                sx={{ color: C.accent, height: 4 }}
            />
        </Box>

        <FormControl fullWidth size="small">
            <InputLabel>Minimum Rooms</InputLabel>
            <Select value={rooms} onChange={(e) => setRooms(e.target.value)} label="Minimum Rooms" sx={{ borderRadius: '8px', fontSize: 14 }}>
                <MenuItem value={0}>Any</MenuItem>
                {filterOptions.rooms?.map((r) => <MenuItem key={r} value={r}>{r} BHK</MenuItem>)}
            </Select>
        </FormControl>

        <FormControl fullWidth size="small">
            <InputLabel>Furnishing Status</InputLabel>
            <Select value={furnished} onChange={(e) => setFurnished(e.target.value)} label="Furnishing Status" sx={{ borderRadius: '8px', fontSize: 14 }}>
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="furnished">Fully Furnished</MenuItem>
                <MenuItem value="semi-furnished">Semi Furnished</MenuItem>
                <MenuItem value="unfurnished">Unfurnished</MenuItem>
            </Select>
        </FormControl>

        <Button fullWidth variant="outlined" startIcon={<ClearIcon />} onClick={clearFilters} size="small"
            sx={{
                textTransform: 'none', borderRadius: '8px', borderColor: C.border,
                color: C.textMuted, fontSize: 13,
                '&:hover': { borderColor: C.accent, color: C.accent, background: C.accentLight },
            }}>
            Clear All Filters
        </Button>

        <Button fullWidth variant="contained" onClick={onApply}
            sx={{
                textTransform: 'none', borderRadius: '10px',
                background: C.accent, fontWeight: 600,
                '&:hover': { background: C.accentDark },
            }}>
            Apply Filters
        </Button>
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
    const [headerHeight, setHeaderHeight] = useState(200); // safe fallback

    // Measure real header height on mount + any resize
    useEffect(() => {
        const measure = () => {
            if (headerRef.current) {
                const h = headerRef.current.getBoundingClientRect().height;
                if (h > 0) setHeaderHeight(h);
            }
        };
        // Slight delay to let layout settle on first paint
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
    const [houses, setHouses] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(true);
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

    useEffect(() => {
        getCurrentLocation();
        loadFilterOptions();
    }, []);

    useEffect(() => {
        if (userLocation) loadHouses();
    }, [userLocation, radius, rentRange, rooms, furnished, searchTerm, currentPage, selectedTenantType, selectedPriceRange]);

    const getCurrentLocation = () => {
        setGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
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
        if (phone) window.location.href = `tel:${phone}`;
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

    if (gettingLocation) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2, bgcolor: C.bg }}>
                <CircularProgress sx={{ color: C.accent }} size={36} />
                <Typography variant="body2" sx={{ color: C.textMuted }}>Detecting your location…</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: C.bg, minHeight: '100vh', pb: `${BOTTOM_NAV_OFFSET + 20}px` }}>

            {/* ── STICKY HEADER ── */}
            <Box ref={headerRef} sx={{
                position: 'sticky', top: 0, zIndex: 1300,
                background: C.surface,
                px: 2, pt: 2, pb: 1.5,
                borderBottom: `1px solid ${C.border}`,
                display: (detailsOpen && selectedHouse) ? 'none' : 'block',
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 18, color: C.text, letterSpacing: '-0.3px' }}>
                            Rental Homes
                        </Typography>
                        {userLocation && (
                            <Typography variant="caption" sx={{ color: C.textMuted, fontSize: 11 }}>
                                Houses near your location
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            onClick={getCurrentLocation}
                            sx={{
                                width: 34, height: 34, borderRadius: '10px',
                                bgcolor: C.surfaceAlt, color: C.textMuted,
                                '&:hover': { bgcolor: C.accentLight, color: C.accent },
                            }}
                        >
                            <RefreshIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                            onClick={() => setFilterDrawerOpen(true)}
                            sx={{
                                width: 34, height: 34, borderRadius: '10px',
                                bgcolor: filterDrawerOpen ? C.accentLight : C.surfaceAlt,
                                color: filterDrawerOpen ? C.accent : C.textMuted,
                                '&:hover': { bgcolor: C.accentLight, color: C.accent },
                            }}
                        >
                            <FilterIcon sx={{ fontSize: 18 }} />
                        </IconButton>
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
                            borderRadius: '28px', fontSize: 14,
                            background: '#f1f3f4',
                            '& fieldset': { border: 'none' },
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

                {/* Tenant Type Pills */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    overflowX: 'auto', pb: 1, mb: 1,
                    '&::-webkit-scrollbar': { display: 'none' },
                }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', mr: 0.5 }}>
                        Type
                    </Typography>
                    {TENANT_TYPES.map((t) => {
                        const active = selectedTenantType === t.value;
                        return (
                            <Box
                                key={t.value}
                                onClick={() => { setSelectedTenantType(active ? '' : t.value); setCurrentPage(1); }}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 0.6,
                                    px: 1.5, py: 0.6, borderRadius: '20px',
                                    border: `1.5px solid ${t.color}`,
                                    bgcolor: active ? t.color : t.bg,
                                    cursor: 'pointer', whiteSpace: 'nowrap',
                                    transition: 'all 0.15s', userSelect: 'none', flexShrink: 0,
                                }}
                            >
                                <t.Icon sx={{ fontSize: 14, color: active ? '#fff' : t.color }} />
                                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: active ? '#fff' : t.color }}>
                                    {t.label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                {/* Price Range Pills */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    overflowX: 'auto', pb: 0.5,
                    '&::-webkit-scrollbar': { display: 'none' },
                }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', mr: 0.5 }}>
                        Price Range
                    </Typography>
                    {PRICE_RANGES.map((pr, idx) => {
                        const active = selectedPriceRange === idx;
                        return (
                            <Box
                                key={idx}
                                onClick={() => { setSelectedPriceRange(idx); setCurrentPage(1); }}
                                sx={{
                                    px: 1.4, py: 0.55, borderRadius: '20px',
                                    border: `1.5px solid ${active ? C.accent : C.accentMid}`,
                                    bgcolor: active ? C.accent : C.accentLight,
                                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                                    transition: 'all 0.15s',
                                }}
                            >
                                <Typography sx={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? '#fff' : C.accent }}>
                                    {pr.label}
                                </Typography>
                            </Box>
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
                        background: C.surface, fontWeight: 500, fontSize: 12,
                        color: C.text, height: 32, cursor: 'pointer',
                        '&:hover': { background: C.accentLight },
                    }}
                />
            </Box>

            {/* Results count */}
            <Box sx={{ px: 2, pt: 1.5, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: C.textMuted }}>
                    {houses.length} houses found
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <Typography sx={{ fontSize: 12, color: C.textMuted }}>Sort by:</Typography>
                    <Typography sx={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>Relevance</Typography>
                    <SortIcon sx={{ fontSize: 15, color: C.accent }} />
                </Box>
            </Box>

            {error && (
                <Box sx={{ px: 2, mb: 1 }}>
                    <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2, fontSize: 13 }}>
                        {error}
                    </Alert>
                </Box>
            )}

            {/* ── GRID ── */}
            <Box sx={{ px: 1.5 }}>
                <Grid container spacing={1.5}>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Grid item xs={6} sm={4} md={3} key={i}>
                                <HouseCardSkeleton />
                            </Grid>
                        ))
                    ) : houses.length === 0 ? (
                        <Grid item xs={12}>
                            <Box sx={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                textAlign: 'center', minHeight: '50vh', py: 6,
                            }}>
                                <Box sx={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    bgcolor: C.surfaceAlt,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
                                }}>
                                    <HomeIcon sx={{ fontSize: 40, color: C.textMuted }} />
                                </Box>
                                <Typography sx={{ fontWeight: 700, fontSize: 16, color: C.text, mb: 0.6 }}>
                                    No houses found
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: C.textMuted, mb: 2.5, maxWidth: 260 }}>
                                    Try adjusting your filters or search term
                                </Typography>
                                <Button
                                    variant="contained" onClick={clearFilters}
                                    sx={{
                                        textTransform: 'none', borderRadius: '10px',
                                        bgcolor: C.accent, fontWeight: 600, px: 3, py: 1,
                                        '&:hover': { bgcolor: C.accentDark },
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </Box>
                        </Grid>
                    ) : (
                        houses.map((house) => (
                            <Grid item xs={6} sm={4} md={3} key={house.id}>
                                <HouseCard
                                    house={house}
                                    onClick={() => handleHouseClick(house)}
                                    onCall={handleCallOwner}
                                />
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
                            '& .MuiPaginationItem-root': { borderRadius: '8px' },
                            '& .Mui-selected': { bgcolor: `${C.accent} !important`, color: '#fff' },
                        }}
                    />
                </Box>
            )}

            {/* ── FILTER DRAWER ── */}
            <Drawer
                anchor="right"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        width: isMobile ? '90%' : 320,
                        borderRadius: '16px 0 0 16px',
                        background: C.surface,
                    },
                }}
            >
                <Box sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 18, color: C.text }}>Filters</Typography>
                        <IconButton size="small" onClick={() => setFilterDrawerOpen(false)} sx={{ bgcolor: C.surfaceAlt, borderRadius: '10px' }}>
                            <CloseIcon sx={{ fontSize: 16, color: C.textMuted }} />
                        </IconButton>
                    </Box>
                    <Divider sx={{ mb: 2.5, borderColor: C.borderLight }} />
                    <FilterPanel
                        radius={radius} setRadius={setRadius}
                        rentRange={rentRange} setRentRange={setRentRange}
                        rooms={rooms} setRooms={setRooms}
                        furnished={furnished} setFurnished={setFurnished}
                        filterOptions={filterOptions}
                        clearFilters={clearFilters}
                        onApply={() => setFilterDrawerOpen(false)}
                    />
                </Box>
            </Drawer>

            {/* ── HOUSE DETAIL DRAWER ── */}
            {detailsOpen && selectedHouse && (
                <HouseDetailsDrawer
                    house={selectedHouse}
                    onClose={() => setDetailsOpen(false)}
                    onRoute={handleGetDirections}
                    onCall={handleCallOwner}
                    userLocation={userLocation}
                    headerHeight={headerHeight}
                />
            )}
        </Box>
    );
}