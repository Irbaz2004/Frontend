// app/user/Jobs.jsx — First-class UI/UX pass: same design language as Shops.jsx / Houses.jsx
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Snackbar,
    Fade,
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Close as CloseIcon,
    Phone as PhoneIcon,
    Work as WorkIcon,
    Clear as ClearIcon,
    Business as BusinessIcon,
    CheckCircle as CheckCircleIcon,
    KeyboardArrowDown as ArrowDownIcon,
    Visibility as VisibilityIcon,
    GpsFixed as GpsFixedIcon,
    Refresh as RefreshIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    CurrencyRupee as RupeeIcon,
    ArrowBackIosNew as ArrowBackIcon,
    School as SchoolIcon,
    CalendarToday as CalendarIcon,
    BookmarkBorder as BookmarkIcon,
    WorkspacePremium as QualificationBadgeIcon,
} from '@mui/icons-material';
import { getJobsByLocation, getJobById, getJobFilterOptions, incrementJobViewCount } from '../../services/jobs';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_USER_LOCATION, getCachedUserLocation, saveCachedUserLocation } from '../../utils/userLocation';

// ─── Design Tokens (same theme as Shops / Houses) ──────────────────────────
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

const RADIUS_PRESETS = [2, 5, 10, 25, 50];

// ─── Logo placeholder colours ───────────────────────────────────────────────
const LOGO_COLORS = [
    '#22863a', '#3730a3', '#78350f', '#c2410c',
    '#1e3a5f', '#7f1d1d', '#064e3b', '#4c1d95',
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.toString().replace(/[^0-9+]/g, '');
};

/**
 * Build a Google Maps search URL from job location data
 * Uses address components if available, falls back to coordinates
 */
const buildGoogleMapsUrl = (job, userLocation) => {
    // If we have latitude and longitude, use them for precise directions
    if (job.latitude && job.longitude) {
        if (userLocation) {
            return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${job.latitude},${job.longitude}`;
        }
        return `https://www.google.com/maps/search/?api=1&query=${job.latitude},${job.longitude}`;
    }
    
    // Build address from available fields
    const addressParts = [];
    if (job.area) addressParts.push(job.area);
    if (job.city) addressParts.push(job.city);
    if (job.state) addressParts.push(job.state);
    
    // If we have a full address, use it
    if (addressParts.length > 0) {
        const address = addressParts.join(', ');
        if (userLocation) {
            return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${encodeURIComponent(address)}`;
        }
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
    
    // Fallback: search by company name and city
    const searchQuery = `${job.company_name || job.shop_name || 'Job'} ${job.city || ''}`.trim();
    if (searchQuery) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
    }
    
    // Ultimate fallback: just open Google Maps
    return 'https://www.google.com/maps';
};

/* ─── Logo with graceful, state-based fallback (initials, no DOM hacking) ──── */
function CompanyLogo({ src, name, size = 56, radius = 12, fontSize = 11, colorIndex = 0 }) {
    const [failed, setFailed] = useState(false);
    const showFallback = !src || failed;
    const bg = LOGO_COLORS[colorIndex % LOGO_COLORS.length];

    return (
        <Box sx={{
            width: size, height: size, borderRadius: `${radius}px`, flexShrink: 0,
            background: bg, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            {showFallback ? (
                <Typography sx={{ color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize, textAlign: 'center', lineHeight: 1.2, px: 0.5 }}>
                    {name || 'Job'}
                </Typography>
            ) : (
                <img
                    src={src}
                    alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={() => setFailed(true)}
                />
            )}
        </Box>
    );
}

/* ─── Skeleton card ───────────────────────────────────────────────────────── */
const JobCardSkeleton = () => (
    <Box sx={{ background: C.surface, borderRadius: '16px', border: `1px solid ${C.border}`, p: 2, mb: 1.5, mx: { xs: 0, md: 2 } }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: '12px', flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={16} />
                <Skeleton variant="text" width="35%" height={14} />
            </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            <Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: '6px' }} />
            <Skeleton variant="rounded" width={90} height={22} sx={{ borderRadius: '6px' }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
            <Skeleton variant="text" width="25%" height={14} />
            <Skeleton variant="rounded" width={72} height={32} sx={{ borderRadius: '10px' }} />
        </Box>
    </Box>
);

/* ─── Job Card ────────────────────────────────────────────────────────────── */
function JobCard({ job, index, onApply, onView }) {
    const isFullTime = job.job_type === 'full_time';

    return (
        <Box
            onClick={() => onView(job)}
            sx={{
                background: C.surface,
                borderRadius: '16px',
                border: `1px solid ${C.border}`,
                p: 2,
                mb: 1.5,
                mx: { xs: 0, md: 2 },
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { boxShadow: `0 6px 20px ${C.shadow}`, borderColor: C.accentMid },
                '&:active': { transform: 'scale(0.98)' },
            }}
        >
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <CompanyLogo src={job.shop_image} name={job.company_name || job.shop_name} colorIndex={index} />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontFamily: FONT, fontWeight: 700, fontSize: 15, color: C.text,
                            lineHeight: 1.3, mb: 0.25,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                    >
                        {job.job_title}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: 12, color: C.textMuted, display: 'block', mb: 0.4 }}>
                        {job.company_name || job.shop_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <LocationIcon sx={{ fontSize: 11, color: C.accent, flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: FONT, fontSize: 11, color: C.textMuted }}>
                            {job.distance != null ? `${job.distance.toFixed(1)} km away` : `${job.area}, ${job.city}`}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.75, mt: 1.25, flexWrap: 'wrap' }}>
                <Chip
                    icon={<WorkIcon sx={{ fontSize: '12px !important', color: isFullTime ? C.green : C.purple }} />}
                    label={isFullTime ? 'Full-time' : 'Part-time'}
                    size="small"
                    sx={{
                        height: 22, borderRadius: '6px',
                        bgcolor: isFullTime ? C.greenLight : C.purpleLight,
                        color: isFullTime ? C.green : C.purple,
                        fontFamily: FONT, fontWeight: 700, fontSize: 10.5,
                        '& .MuiChip-label': { px: '7px' },
                    }}
                />
                <Chip
                    icon={<RupeeIcon sx={{ fontSize: '11px !important', color: C.accent }} />}
                    label={`₹${(job.salary || 0).toLocaleString()}/${job.salary_type === 'month' ? 'mo' : 'day'}`}
                    size="small"
                    sx={{
                        height: 22, borderRadius: '6px',
                        bgcolor: C.accentLight, color: C.accent,
                        fontFamily: FONT, fontWeight: 700, fontSize: 10.5,
                        '& .MuiChip-label': { px: '7px' },
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                <Typography sx={{ fontFamily: FONT, fontSize: 10.5, color: C.textMuted, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 10, color: C.textMuted }} />
                    Posted {timeAgo(job.created_at)}
                </Typography>
                <Tooltip title="Call employer" arrow>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onApply(job); }}
                        disableElevation
                        sx={{
                            fontFamily: FONT, textTransform: 'none', borderRadius: '10px',
                            background: C.accent, fontWeight: 700, fontSize: 12,
                            px: 2, py: 0.6,
                            '&:hover': { background: C.accentDark },
                        }}
                    >
                        Call
                    </Button>
                </Tooltip>
            </Box>
        </Box>
    );
}

const SectionLabel = ({ children, icon = null, withBar = false }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.8 }}>
        {withBar && <Box sx={{ width: 5, height: 26, borderRadius: '6px', bgcolor: C.accent, flexShrink: 0 }} />}
        {icon && (
            <Box sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                bgcolor: C.accentLight,
                color: C.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                {icon}
            </Box>
        )}
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: C.text, lineHeight: 1.2 }}>
            {children}
        </Typography>
    </Box>
);

const IconTile = ({ children, bg = C.accentLight, size = 36, radius = 10 }) => (
    <Box sx={{ width: size, height: size, borderRadius: typeof radius === 'number' ? `${radius}px` : radius, bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {children}
    </Box>
);

const StatItem = ({ icon, title, value }) => (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, minWidth: 0 }}>
        <Box sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: C.accentLight,
            color: C.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        }}>
            {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: 10.5, fontWeight: 600, color: C.textMuted, lineHeight: 1.2 }}>
                {title}
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 11.5, fontWeight: 700, color: C.text, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                {value}
            </Typography>
        </Box>
    </Box>
);

const DetailInfoCard = ({ icon, bg, label, value }) => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.2,
        p: 1.3,
        minHeight: 64,
        borderRadius: '12px',
        bgcolor: 'rgba(255,255,255,0.88)',
        border: `1px solid ${C.border}`,
        boxShadow: '0 14px 32px rgba(50,95,236,0.06)',
    }}>
        <IconTile bg={bg}>{icon}</IconTile>
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: 10.5, color: C.textMuted, fontWeight: 600, lineHeight: 1.2 }}>
                {label}
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 13, color: C.text, fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {value}
            </Typography>
        </Box>
    </Box>
);

const SoftPanel = ({ children, sx = {} }) => (
    <Box sx={{
        bgcolor: 'rgba(255,255,255,0.88)',
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        boxShadow: '0 14px 32px rgba(50,95,236,0.06)',
        ...sx,
    }}>
        {children}
    </Box>
);

/* ─── Job Details content (skeleton-aware) ────────────────────────────────── */
function JobDetailsContent({ job, isMobile, onClose }) {
    if (!job) {
        return (
            <Box sx={{ px: 3, pt: isMobile ? 2 : 4, pb: 3 }}>
                <Skeleton variant="rounded" width="100%" height={210} sx={{ borderRadius: '28px', mb: 2.8 }} />
                <Skeleton variant="rounded" width="100%" height={92} sx={{ borderRadius: '22px', mb: 3.8 }} />
                <Skeleton variant="text" width="45%" height={32} sx={{ mb: 1.5 }} />
                <Skeleton variant="rounded" width="100%" height={116} sx={{ borderRadius: '20px', mb: 3 }} />
                <Skeleton variant="rounded" width="100%" height={92} sx={{ borderRadius: '20px' }} />
            </Box>
        );
    }

    const isFullTime = job.job_type === 'full_time';
    const distanceLabel = job.distance != null ? `${job.distance.toFixed(1)} km away` : '';

    const stats = [
        { icon: <CalendarIcon sx={{ fontSize: 22 }} />, title: 'Posted', value: timeAgo(job.created_at) || 'Recent' },
        { icon: <VisibilityIcon sx={{ fontSize: 24 }} />, title: 'Views', value: `${job.views_count || 0} views` },
    ];

    const detailRows = [
        { icon: <PersonIcon sx={{ fontSize: 17, color: C.accent }} />, bg: C.accentLight, label: 'Employer', value: job.employer_name || job.shop_name || 'Company' },
        { icon: <WorkIcon sx={{ fontSize: 17, color: isFullTime ? C.green : C.purple }} />, bg: isFullTime ? C.greenLight : C.purpleLight, label: 'Job Type', value: isFullTime ? 'Full Time' : 'Part Time' },
    ];

    return (
        <Box sx={{ px: { xs: 1.5, sm: 3 }, pt: isMobile ? 1.5 : 3, pb: 3 }}>
            <Box sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.2, sm: 1.8 },
                minHeight: { xs: 146, sm: 178 },
                p: { xs: 1.5, sm: 3 },
                pt: { xs: 5.5, sm: 6.5 },
                mb: 2.8,
                borderRadius: { xs: '20px', sm: '28px' },
                bgcolor: C.surface,
                border: `1px solid ${C.borderLight}`,
                boxShadow: '0 24px 54px rgba(50,95,236,0.09)',
                overflow: 'hidden',
            }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: { xs: 10, sm: 16 },
                        left: { xs: 10, sm: 16 },
                        bgcolor: C.surface,
                        borderRadius: { xs: '12px', sm: '16px' },
                        width: { xs: 34, sm: 46 },
                        height: { xs: 34, sm: 46 },
                        zIndex: 3,
                        border: `1px solid ${C.borderLight}`,
                        boxShadow: '0 10px 24px rgba(50,95,236,0.08)',
                        '&:hover': { bgcolor: C.accentLight },
                    }}
                >
                    <ArrowBackIcon sx={{ fontSize: { xs: 15, sm: 19 }, color: C.textSub }} />
                </IconButton>
                <Box sx={{
                    width: { xs: 68, sm: 78 },
                    height: { xs: 68, sm: 78 },
                    borderRadius: { xs: '16px', sm: '22px' },
                    border: `1px solid ${C.borderLight}`,
                    boxShadow: '0 16px 34px rgba(15,23,42,0.08)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1,
                }}>
                    <CompanyLogo src={job.shop_image} name={job.company_name || job.shop_name} size={isMobile ? 68 : 78} radius={isMobile ? 16 : 20} fontSize={12} colorIndex={(job.id || 0)} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, minWidth: 0 }}>
                        <Typography noWrap sx={{ fontFamily: FONT, color: C.textMuted, fontSize: 13, fontWeight: 600, minWidth: 0 }}>
                            {job.shop_name || job.company_name}
                        </Typography>
                        {job.shop_verified && (
                            <Tooltip title="Verified Employer" arrow>
                                <CheckCircleIcon sx={{ fontSize: 15, color: C.green, flexShrink: 0 }} />
                            </Tooltip>
                        )}
                        <Chip
                            label={isFullTime ? 'Full Time' : 'Part Time'}
                            size="small"
                            sx={{
                                ml: 'auto',
                                bgcolor: isFullTime ? C.greenLight : C.purpleLight,
                                color: isFullTime ? C.green : C.purple,
                                fontFamily: FONT,
                                fontWeight: 800,
                                fontSize: 11.5,
                                height: 24,
                                borderRadius: '8px',
                                '& .MuiChip-label': { px: 1 },
                            }}
                        />
                    </Box>

                    <Typography noWrap sx={{ fontFamily: FONT, fontWeight: 800, fontSize: 21, color: C.text, mb: 0.6, lineHeight: 1.15, letterSpacing: '-0.3px' }}>
                        {job.job_title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.4 }}>
                        <LocationIcon sx={{ fontSize: 15, color: C.textMuted, mt: '1px', flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: FONT, color: C.textMuted, fontSize: 13, lineHeight: 1.25 }}>
                            {job.area}, {job.city}, {job.state}
                            {distanceLabel && (
                                <Typography component="span" sx={{ fontFamily: FONT, color: C.textMuted, fontSize: 'inherit', fontWeight: 700 }}>
                                    {` • ${distanceLabel}`}
                                </Typography>
                            )}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <SoftPanel sx={{ display: 'flex', alignItems: 'center', minHeight: 64, mb: 2.5, overflow: 'hidden' }}>
                {stats.map((s, i) => (
                    <React.Fragment key={s.title}>
                        <Box sx={{ flex: 1, px: 1, minWidth: 0 }}>
                            <StatItem icon={s.icon} title={s.title} value={s.value} />
                        </Box>
                        {i < stats.length - 1 && <Box sx={{ width: '1px', height: 32, bgcolor: C.border, flexShrink: 0 }} />}
                    </React.Fragment>
                ))}
            </SoftPanel>

            <SectionLabel withBar>Job Details</SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.2, mb: 2.5 }}>
                {detailRows.map((item, i) => (
                    <Box key={i} sx={{ minWidth: 0 }}>
                        <DetailInfoCard icon={item.icon} bg={item.bg} label={item.label} value={item.value} />
                    </Box>
                ))}
            </Box>

            {job.qualification && (
                <>
                    <SectionLabel icon={<SchoolIcon sx={{ fontSize: 20 }} />}>Qualification Required</SectionLabel>
                    <SoftPanel sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.6, minHeight: 78, mb: 2.5 }}>
                        <QualificationBadgeIcon sx={{ fontSize: 24, color: C.accent, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontFamily: FONT, color: C.textSub, fontSize: 13, lineHeight: 1.65 }}>
                            {job.qualification}
                        </Typography>
                    </SoftPanel>
                </>
            )}

            <SectionLabel icon={<PhoneIcon sx={{ fontSize: 20 }} />}>Contact</SectionLabel>
            <SoftPanel sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, minHeight: 78 }}>
                <IconTile><PhoneIcon sx={{ fontSize: 17, color: C.accent }} /></IconTile>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontFamily: FONT, color: C.text, fontSize: 13, fontWeight: 700 }}>
                        {job.employer_phone || job.contact_phone || 'Not available'}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, color: C.textMuted, fontSize: 12, mt: 0.3 }}>
                        Call for more details
                    </Typography>
                </Box>
                <IconButton
                    onClick={() => window.location.href = `tel:${cleanPhoneNumber(job.employer_phone || job.contact_phone)}`}
                    sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: C.accent, color: '#fff', '&:hover': { bgcolor: C.accentDark } }}
                >
                    <PhoneIcon sx={{ fontSize: 24 }} />
                </IconButton>
            </SoftPanel>
        </Box>
    );
}

/* ─── Full Screen / Bottom-sheet Job Details Drawer ─────────────────────────
   Stays mounted via the `open` prop so closing always plays the smooth
   slide-down animation instead of disappearing abruptly. */
function JobDetailsDrawer({ open, job, onClose, onCall }) {
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
                    ? { width: '100%', height: '100%', maxHeight: '100%', borderRadius: 0, m: 0, background: '#F7FAFF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }
                    : {
                          maxWidth: 620,
                          width: 'calc(100% - 32px)',
                          mx: 'auto',
                          maxHeight: '88vh',
                          borderRadius: '24px 24px 0 0',
                          background: '#F7FAFF',
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
                <Box sx={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '10px auto 0', flexShrink: 0, position: 'relative', zIndex: 5 }} />
            )}

            <Box sx={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <JobDetailsContent job={job} isMobile={isMobile} onClose={onClose} />
            </Box>

            {/* Sticky footer — salary on the left, actions on the right */}
            {job && (
                <Box
                    sx={{
                        flexShrink: 0,
                        p: 2,
                        pb: isMobile ? 'calc(16px + env(safe-area-inset-bottom))' : 2,
                        background: '#F7FAFF',
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: { xs: 1.2, sm: 2 },
                        borderRadius: { xs: '16px', sm: '24px' },
                        background: C.surface,
                        border: `1px solid ${C.borderLight}`,
                        boxShadow: '0 -10px 34px rgba(50,95,236,0.08)',
                    }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: 13, color: C.textMuted, fontWeight: 600, lineHeight: 1.2, mb: 0.5 }}>
                            Salary
                        </Typography>
                            <Typography sx={{ fontFamily: FONT, fontSize: { xs: 20, sm: 29 }, color: C.accent, fontWeight: 800, lineHeight: 1.15, whiteSpace: 'nowrap' }}>
                            ₹{Number(job.salary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <Typography component="span" sx={{ fontFamily: FONT, fontSize: 14, color: C.textMuted, fontWeight: 600 }}>
                                /{job.salary_type === 'month' ? 'mo' : 'day'}
                            </Typography>
                        </Typography>
                    </Box>

                        <Box sx={{ width: '1px', height: { xs: 42, sm: 58 }, bgcolor: C.border, flexShrink: 0 }} />
                  
                    <Button
                        variant="contained"
                        startIcon={<PhoneIcon sx={{ fontSize: 23 }} />}
                        onClick={() => onCall(job.employer_phone || job.contact_phone)}
                        disableElevation
                        sx={{
                            fontFamily: FONT,
                            textTransform: 'none',
                                borderRadius: { xs: '14px', sm: '18px' },
                            background: C.accent,
                            fontWeight: 800,
                                fontSize: { xs: 12, sm: 17 },
                                px: { xs: 1.4, sm: 3 },
                                height: { xs: 48, sm: 64 },
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                            boxShadow: `0 12px 24px ${C.shadow}`,
                            '&:hover': { background: C.accentDark },
                        }}
                    >
                        Call Now
                    </Button>
                    </Box>
                </Box>
            )}
        </Drawer>
    );
}

/* ─── Filter Panel ──────────────────────────────────────────────────────── */
function FilterPanel({ radius, setRadius, jobType, setJobType, salaryRange, setSalaryRange, filterOptions, clearFilters, onApply }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text }}>Distance Radius</Typography>
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
                    value={radius}
                    onChange={(_, val) => setRadius(val)}
                    min={1}
                    max={50}
                    valueLabelDisplay="auto"
                    sx={{
                        color: C.accent,
                        height: 4,
                        '& .MuiSlider-thumb': { width: 18, height: 18, boxShadow: `0 2px 6px ${C.shadow}`, '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px ${C.accent}1f` } },
                        '& .MuiSlider-rail': { opacity: 0.2 },
                    }}
                />
            </Box>

            <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: FONT }}>Job Type</InputLabel>
                <Select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    label="Job Type"
                    sx={{ borderRadius: '10px', fontFamily: FONT, fontSize: 14 }}
                >
                    <MenuItem value="" sx={{ fontFamily: FONT, fontSize: 14 }}>All Types</MenuItem>
                    <MenuItem value="full_time" sx={{ fontFamily: FONT, fontSize: 14 }}>Full Time</MenuItem>
                    <MenuItem value="part_time" sx={{ fontFamily: FONT, fontSize: 14 }}>Part Time</MenuItem>
                </Select>
            </FormControl>

            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: C.text }}>Salary Range (₹/month)</Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: C.accent }}>
                        ₹{salaryRange[0].toLocaleString()} – ₹{salaryRange[1].toLocaleString()}
                    </Typography>
                </Box>
                <Slider
                    value={salaryRange}
                    onChange={(_, val) => setSalaryRange(val)}
                    min={filterOptions.min_salary || 0}
                    max={filterOptions.max_salary || 100000}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `₹${(v / 1000).toFixed(0)}K`}
                    sx={{
                        color: C.accent, height: 4,
                        '& .MuiSlider-thumb': { width: 18, height: 18, boxShadow: `0 2px 6px ${C.shadow}` },
                        '& .MuiSlider-rail': { opacity: 0.2 },
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 1.2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ClearIcon sx={{ fontSize: 16 }} />}
                    onClick={clearFilters}
                    sx={{
                        fontFamily: FONT, textTransform: 'none', borderRadius: '10px', borderColor: C.border,
                        color: C.textMuted, fontWeight: 600, fontSize: 13.5,
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
}

// ── Location Permission Dialog ─────────────────────────────────────────────
const LocationPermissionDialog = ({ open, onClose, onAllow, onManualCity, loading }) => {
    const [manualCity, setManualCity] = useState('');

    const handleManualSubmit = () => {
        if (manualCity.trim()) {
            onManualCity(manualCity.trim());
            setManualCity('');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            transitionDuration={{ enter: 280, exit: 200 }}
            PaperProps={{ sx: { borderRadius: '24px', maxWidth: '340px', width: '90%', p: 1 } }}
        >
            <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1.2rem', color: C.text, pb: 1, pt: 2.5 }}>
                Allow Location Access
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', color: C.textMuted, mb: 2 }}>
                    HeloZO needs your location to show jobs near you.
                    We don't store your precise location.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={loading ? null : <GpsFixedIcon />}
                        onClick={onAllow}
                        disabled={loading}
                        disableElevation
                        sx={{
                            background: C.accent, borderRadius: '14px', py: 1.2, textTransform: 'none',
                            fontFamily: FONT, fontWeight: 700, fontSize: '0.85rem',
                            '&:hover': { background: C.accentDark },
                        }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Allow Location'}
                    </Button>

                    <Typography sx={{ textAlign: 'center', color: C.textMuted, fontSize: '0.75rem', fontFamily: FONT }}>OR</Typography>

                    <TextField
                        placeholder="Enter your city name"
                        value={manualCity}
                        onChange={(e) => setManualCity(e.target.value)}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', fontFamily: FONT } }}
                    />

                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleManualSubmit}
                        disabled={!manualCity.trim() || loading}
                        sx={{
                            borderRadius: '14px', py: 1, textTransform: 'none', fontFamily: FONT, fontWeight: 700, fontSize: '0.85rem',
                            borderColor: C.border, color: C.textSub,
                            '&:hover': { borderColor: C.accent, color: C.accent },
                        }}
                    >
                        Use this city
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button onClick={onClose} sx={{ color: C.textMuted, textTransform: 'none', fontFamily: FONT, fontSize: '0.8rem' }}>
                    Skip for now
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════════════ */
export default function Jobs() {
    const { isAuthenticated, user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const viewedJobsRef = useRef(new Set());
    const headerRef = useRef(null);
    const initialLocation = useMemo(() => getCachedUserLocation(), []);

    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userLocation, setUserLocation] = useState(initialLocation);
    const [gettingLocation, setGettingLocation] = useState(!initialLocation);
    const [filterOptions, setFilterOptions] = useState({ job_types: [], min_salary: 0, max_salary: 100000, job_titles: [] });
    const [locationDialogOpen, setLocationDialogOpen] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [detectedCity, setDetectedCity] = useState('');
    const [showCitySnackbar, setShowCitySnackbar] = useState(false);
    const [callSnackbar, setCallSnackbar] = useState({ open: false, message: '' });

    const [radius, setRadius] = useState(10);
    const [salaryRange, setSalaryRange] = useState([0, 100000]);
    const [jobType, setJobType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('Recent');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [sortDrawerOpen, setSortDrawerOpen] = useState(false);

    const [selectedJob, setSelectedJob] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(180);

    const scrollRef = useRef(null);

    useEffect(() => {
        const measure = () => {
            if (!headerRef.current) return;
            const h = headerRef.current.getBoundingClientRect().height;
            if (h > 0) setHeaderHeight(h);
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

    // ── Helper Functions ──
    const getCityFromCoordinates = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                { headers: { 'User-Agent': 'HeloZO-App/1.0' } }
            );
            const data = await response.json();
            if (data && data.address) {
                return data.address.city || data.address.town || data.address.village || data.address.municipality || data.address.county;
            }
            throw new Error('City not found');
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            throw error;
        }
    };

    const getCurrentLocationCity = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const city = await getCityFromCoordinates(position.coords.latitude, position.coords.longitude);
                        resolve({ city, latitude: position.coords.latitude, longitude: position.coords.longitude });
                    } catch (error) { reject(error); }
                },
                (error) => reject(error),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    };

    const getCurrentLocationCoords = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const nextLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
                    saveCachedUserLocation(nextLocation);
                    resolve(nextLocation);
                },
                (error) => reject(error),
                { enableHighAccuracy: true, timeout: 6000, maximumAge: 300000 }
            );
        });
    };

    const handleAllowLocation = async () => {
        setLocationLoading(true);
        try {
            const { city, latitude, longitude } = await getCurrentLocationCity();
            if (city) {
                setDetectedCity(city);
                setLocationDialogOpen(false);
                setUserLocation({ latitude, longitude });
                setShowCitySnackbar(true);
            } else {
                throw new Error('Could not detect your city');
            }
        } catch (err) {
            console.error('Location error:', err);
            setError(err.message);
            setUserLocation({ latitude: 12.9165, longitude: 79.1325 });
        } finally {
            setLocationLoading(false);
        }
    };

    const handleManualCity = async (city) => {
        setLocationDialogOpen(false);
        setDetectedCity(city);
        setShowCitySnackbar(true);
        setUserLocation({ latitude: 12.9165, longitude: 79.1325 });
    };

    const handleSkipLocation = async () => {
        setLocationDialogOpen(false);
        setUserLocation({ latitude: 12.9165, longitude: 79.1325 });
    };

    const handleRefreshLocation = () => {
        setLocationDialogOpen(true);
    };

    const handleCall = (phone) => {
        if (phone) {
            const cleanNumber = cleanPhoneNumber(phone);
            window.location.href = `tel:${cleanNumber}`;
        } else {
            setCallSnackbar({ open: true, message: 'No phone number available for this job' });
        }
    };

    // ── Effects ──
    useEffect(() => {
        const initializeLocation = async () => {
            setGettingLocation(!initialLocation);
            try {
                const coords = await getCurrentLocationCoords();
                setUserLocation(coords);
            } catch (err) {
                console.log('Could not get location automatically');
                if (!initialLocation) {
                    setLocationDialogOpen(true);
                    setUserLocation(DEFAULT_USER_LOCATION);
                }
                setGettingLocation(false);
            } finally {
                setGettingLocation(false);
            }
        };
        initializeLocation();
        loadFilterOptions();
    }, []);

    useEffect(() => {
        if (userLocation) loadJobs();
    }, [userLocation, radius, salaryRange, jobType, searchTerm, sortBy, currentPage]);

    const loadFilterOptions = async () => {
        try {
            const result = await getJobFilterOptions();
            setFilterOptions(result.filters);
            setSalaryRange([result.filters.min_salary, result.filters.max_salary]);
        } catch { /* silent */ }
    };

    const loadJobs = async () => {
        if (!userLocation) return;
        setLoading(true);
        setError('');
        try {
            const result = await getJobsByLocation({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                radius,
                min_salary: salaryRange[0],
                max_salary: salaryRange[1],
                job_type: jobType,
                search: searchTerm,
                sort: sortBy.toLowerCase(),
                page: currentPage,
                limit: 20,
            });
            setJobs(result.jobs || []);
            setTotal(result.total || 0);
            setTotalPages(result.totalPages || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (job) => {
        setSelectedJob(null);
        setSelectedJob(job);
        setLoadingDetails(true);
        setDetailsOpen(true);

        if (!viewedJobsRef.current.has(job.id)) {
            viewedJobsRef.current.add(job.id);
            incrementJobViewCount(job.id).catch((err) => {
                console.log('View count error:', err);
                viewedJobsRef.current.delete(job.id);
            });
        }

        try {
            const result = await getJobById(job.id, userLocation);
            setSelectedJob(result.job);
        } catch (err) {
            setError(err.message);
            setDetailsOpen(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    const clearFilters = () => {
        setRadius(10);
        setSalaryRange([filterOptions.min_salary, filterOptions.max_salary]);
        setJobType('');
        setSearchTerm('');
        setCurrentPage(1);
        setFilterDrawerOpen(false);
    };

    const activeFilterCount = useMemo(
        () => (jobType ? 1 : 0) + (radius !== 10 ? 1 : 0),
        [jobType, radius]
    );

    const SORT_OPTIONS = ['Recent', 'Nearest', 'Salary: High to Low', 'Salary: Low to High'];

    if (gettingLocation && !locationDialogOpen) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2, bgcolor: C.bg }}>
                <CircularProgress sx={{ color: C.accent }} size={36} thickness={4} />
                <Typography sx={{ fontFamily: FONT, color: C.textMuted, fontWeight: 500 }}>Detecting your location…</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: C.bg, minHeight: '100vh', pb: `${BOTTOM_NAV_OFFSET + 20}px`, fontFamily: FONT }}>
            <LocationPermissionDialog
                open={locationDialogOpen}
                onClose={handleSkipLocation}
                onAllow={handleAllowLocation}
                onManualCity={handleManualCity}
                loading={locationLoading}
            />

            <Snackbar
                open={showCitySnackbar}
                autoHideDuration={5000}
                onClose={() => setShowCitySnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert sx={{ borderRadius: '12px', fontFamily: FONT, bgcolor: C.accent, color: '#fff', '& .MuiAlert-icon': { color: '#fff' } }} icon={<GpsFixedIcon />}>
                    Showing jobs near <strong>{detectedCity || 'your location'}</strong>
                </Alert>
            </Snackbar>

            <Snackbar
                open={callSnackbar.open}
                autoHideDuration={2500}
                onClose={() => setCallSnackbar({ open: false, message: '' })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ mb: { xs: `${BOTTOM_NAV_OFFSET}px`, md: 0 } }}
            >
                <Alert severity="info" onClose={() => setCallSnackbar({ open: false, message: '' })} sx={{ fontFamily: FONT, borderRadius: '10px' }}>
                    {callSnackbar.message}
                </Alert>
            </Snackbar>

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
                px: 2, pt: 1.5, pb: 1.5, borderBottom: `1px solid ${C.border}`,
                boxShadow: isMobile ? `0 8px 24px ${C.shadowMd}` : 'none',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box>
                        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: C.text, letterSpacing: '-0.3px' }}>
                            Nearby Jobs
                        </Typography>
                        {detectedCity && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                <LocationIcon sx={{ fontSize: 12, color: C.accent }} />
                                <Typography sx={{ fontFamily: FONT, fontSize: 11, color: C.textMuted }}>{detectedCity}</Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        
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
                    placeholder="Search jobs, role or company..."
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
                        startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: C.textMuted }} /></InputAdornment>),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchTerm('')}>
                                    <ClearIcon sx={{ fontSize: 16, color: C.textMuted }} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Chip
                    icon={<LocationIcon sx={{ fontSize: '14px !important', color: `${C.accent} !important` }} />}
                    label={`Within ${radius} km`}
                    deleteIcon={<ClearIcon sx={{ fontSize: '16px !important', color: `${C.textMuted} !important` }} />}
                    onDelete={() => setFilterDrawerOpen(true)}
                    onClick={() => setFilterDrawerOpen(true)}
                    size="small"
                    sx={{
                        borderRadius: '20px', border: `1px solid ${C.border}`, background: C.surface,
                        fontFamily: FONT, fontWeight: 600, fontSize: 12.5,
                        color: C.text, height: 30, cursor: 'pointer',
                        '&:hover': { background: C.accentLight },
                    }}
                />
            </Box>

            {isMobile && <Box sx={{ height: headerHeight }} />}

            {error && (
                <Fade in={!!error}>
                    <Alert severity="error" onClose={() => setError('')} sx={{ mx: 2, mt: 1, borderRadius: '10px', fontFamily: FONT }}>{error}</Alert>
                </Fade>
            )}
            {success && (
                <Fade in={!!success}>
                    <Alert severity="success" onClose={() => setSuccess('')} sx={{ mx: 2, mt: 1, borderRadius: '10px', fontFamily: FONT }}>{success}</Alert>
                </Fade>
            )}

            {/* ── SCROLLABLE BODY ── */}
            <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', px: { xs: 1.5, md: 2 }, mt: 1 }}>
                {!loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 13, color: C.text }}>
                            {total} Job{total !== 1 ? 's' : ''} Found
                        </Typography>
                        <Box onClick={() => setSortDrawerOpen(true)} sx={{ display: 'flex', alignItems: 'center', gap: 0.4, cursor: 'pointer' }}>
                            <Typography sx={{ fontFamily: FONT, fontSize: 12, color: C.textMuted }}>Sort by:</Typography>
                            <Typography sx={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.accent }}>{sortBy}</Typography>
                            <ArrowDownIcon sx={{ fontSize: 15, color: C.accent }} />
                        </Box>
                    </Box>
                )}

                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} />)
                ) : jobs.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <WorkIcon sx={{ fontSize: 56, color: '#d1d5db', mb: 2 }} />
                        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: C.text, mb: 1 }}>No jobs found near you</Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: 13, color: C.textMuted, mb: 3 }}>
                            {detectedCity ? `No jobs found in ${detectedCity} within ${radius} km.` : 'Try expanding your radius or changing filters.'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            <Button variant="contained" onClick={clearFilters} disableElevation sx={{ fontFamily: FONT, textTransform: 'none', borderRadius: '10px', background: C.accent, px: 3, fontWeight: 700 }}>
                                Clear Filters
                            </Button>
                            <Button variant="outlined" onClick={handleRefreshLocation} sx={{ fontFamily: FONT, textTransform: 'none', borderRadius: '10px', borderColor: C.accent, color: C.accent, fontWeight: 700 }}>
                                Change Location
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    jobs.map((job, idx) => (
                        <JobCard key={job.id} job={job} index={idx} onApply={handleCall} onView={handleView} />
                    ))
                )}
            </Box>

            {/* ── FILTER DRAWER ── */}
            <Drawer
                anchor="bottom"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                transitionDuration={{ enter: 360, exit: 280 }}
                SlideProps={{ easing: { enter: SHEET_EASE_ENTER, exit: SHEET_EASE_EXIT } }}
                PaperProps={{
                    sx: {
                        borderRadius: '20px 20px 0 0', p: 3, pb: 'calc(24px + env(safe-area-inset-bottom))',
                        maxHeight: '85vh', background: C.surface,
                        maxWidth: 560, width: { xs: '100%', sm: 'calc(100% - 32px)' }, mx: { sm: 'auto' },
                        boxShadow: `0 -12px 50px ${C.shadowLg}`, border: `1.5px solid ${C.border}`, borderBottom: 'none',
                    },
                }}
            >
                <Box sx={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 16px' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: C.text }}>Filters</Typography>
                    <IconButton onClick={() => setFilterDrawerOpen(false)} size="small" sx={{ bgcolor: C.surfaceAlt, borderRadius: '10px' }}><CloseIcon sx={{ fontSize: 16, color: C.textMuted }} /></IconButton>
                </Box>
                <Divider sx={{ mb: 3, borderColor: C.borderLight }} />
                <FilterPanel radius={radius} setRadius={setRadius} jobType={jobType} setJobType={setJobType} salaryRange={salaryRange} setSalaryRange={setSalaryRange} filterOptions={filterOptions} clearFilters={clearFilters} onApply={() => setFilterDrawerOpen(false)} />
            </Drawer>

            {/* ── SORT DRAWER ── */}
            <Drawer
                anchor="bottom"
                open={sortDrawerOpen}
                onClose={() => setSortDrawerOpen(false)}
                transitionDuration={{ enter: 320, exit: 260 }}
                SlideProps={{ easing: { enter: SHEET_EASE_ENTER, exit: SHEET_EASE_EXIT } }}
                PaperProps={{
                    sx: {
                        borderRadius: '20px 20px 0 0', p: 3, background: C.surface,
                        maxWidth: 560, width: { xs: '100%', sm: 'calc(100% - 32px)' }, mx: { sm: 'auto' },
                        boxShadow: `0 -12px 50px ${C.shadowLg}`, border: `1.5px solid ${C.border}`, borderBottom: 'none',
                    },
                }}
            >
                <Box sx={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: '0 auto 16px' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: C.text }}>Sort By</Typography>
                    <IconButton onClick={() => setSortDrawerOpen(false)} size="small" sx={{ bgcolor: C.surfaceAlt, borderRadius: '10px' }}><CloseIcon sx={{ fontSize: 16, color: C.textMuted }} /></IconButton>
                </Box>
                <Divider sx={{ mb: 2, borderColor: C.borderLight }} />
                {SORT_OPTIONS.map((opt) => {
                    const active = sortBy === opt;
                    return (
                        <Box
                            key={opt}
                            onClick={() => { setSortBy(opt); setSortDrawerOpen(false); }}
                            sx={{
                                py: 1.5, px: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                cursor: 'pointer', borderRadius: '12px', mb: 0.5,
                                bgcolor: active ? C.accentLight : 'transparent',
                                '&:hover': { background: C.accentLight },
                            }}
                        >
                            <Typography sx={{ fontFamily: FONT, fontWeight: active ? 700 : 500, fontSize: 14, color: active ? C.accent : C.text }}>{opt}</Typography>
                            {active && <CheckCircleIcon sx={{ fontSize: 18, color: C.accent }} />}
                        </Box>
                    );
                })}
            </Drawer>

            {/* ── JOB DETAILS SHEET ── */}
            <JobDetailsDrawer
                open={detailsOpen}
                job={selectedJob}
                onClose={() => setDetailsOpen(false)}
                onCall={handleCall}
            />
        </Box>
    );
}
