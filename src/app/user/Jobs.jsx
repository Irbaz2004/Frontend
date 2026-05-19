// app/user/Jobs.jsx
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Snackbar,
    Grid,
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
} from '@mui/icons-material';
import { getJobsByLocation, getJobById, getJobFilterOptions, incrementJobViewCount } from '../../services/jobs';
import { useAuth } from '../context/AuthContext';

// ─── Design Tokens (matching Map.jsx) ─────────────────────────────────────────
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

// ─── Logo placeholder colours ─────────────────────────────────────────────
const LOGO_COLORS = [
    '#22863a', '#3730a3', '#78350f', '#c2410c',
    '#1e3a5f', '#7f1d1d', '#064e3b', '#4c1d95',
];

// ─── Helpers ───────────────────────────────────────────────────────────────
const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

// Clean phone number for calling
const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.toString().replace(/[^0-9+]/g, '');
};

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
    const logoBg = LOGO_COLORS[index % LOGO_COLORS.length];

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
                '&:hover': { boxShadow: `0 4px 16px ${C.shadow}`, borderColor: C.accentMid },
                '&:active': { transform: 'scale(0.98)' },
            }}
        >
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                {/* Logo */}
                <Box
                    sx={{
                        width: 56, height: 56, borderRadius: '12px', flexShrink: 0,
                        background: logoBg, overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    {job.shop_image ? (
                        <img
                            src={job.shop_image}
                            alt={job.company_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <Typography sx={{ color: '#fff', fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 11, textAlign: 'center', lineHeight: 1.2, px: 0.5 }}>
                            {job.company_name || job.shop_name || 'Job'}
                        </Typography>
                    )}
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 700,
                            fontSize: 15,
                            color: C.text,
                            lineHeight: 1.3,
                            mb: 0.25,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {job.job_title}
                    </Typography>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: C.textMuted, display: 'block', mb: 0.4 }}>
                        {job.company_name || job.shop_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <LocationIcon sx={{ fontSize: 11, color: C.accent, flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 11, color: C.textMuted }}>
                            {job.distance ? `${job.distance.toFixed(1)} km away` : `${job.area}, ${job.city}`}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Chips */}
            <Box sx={{ display: 'flex', gap: 0.75, mt: 1.25, flexWrap: 'wrap' }}>
                <Chip
                    icon={<WorkIcon sx={{ fontSize: '12px !important', color: isFullTime ? C.green : C.purple }} />}
                    label={isFullTime ? 'Full-time' : 'Part-time'}
                    size="small"
                    sx={{
                        height: 22, borderRadius: '6px',
                        bgcolor: isFullTime ? C.greenLight : C.purpleLight,
                        color: isFullTime ? C.green : C.purple,
                        fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 10.5,
                        '& .MuiChip-label': { px: '7px' },
                    }}
                />
                <Chip
                    icon={<RupeeIcon sx={{ fontSize: '11px !important', color: C.accent }} />}
                    label={`${job.salary.toLocaleString()}/${job.salary_type === 'month' ? 'mo' : 'day'}`}
                    size="small"
                    sx={{
                        height: 22, borderRadius: '6px',
                        bgcolor: C.accentLight, color: C.accent,
                        fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 10.5,
                        '& .MuiChip-label': { px: '7px' },
                    }}
                />
            </Box>

            {/* Bottom: posted + call button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 10.5, color: C.textMuted, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 10, color: C.textMuted }} />
                    Posted {timeAgo(job.created_at)}
                </Typography>
                <Button
                    variant="contained"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onApply(job); }}
                    sx={{
                        fontFamily: '"Inter", sans-serif', textTransform: 'none', borderRadius: '10px',
                        background: C.accent, fontWeight: 600, fontSize: 12,
                        px: 2, py: 0.6, boxShadow: 'none',
                        '&:hover': { background: C.accentDark },
                    }}
                >
                    Call
                </Button>
            </Box>
        </Box>
    );
}

// ─── Full Screen Job Details Drawer ─────────────────────────────────────────
function JobDetailsDrawer({ job, onClose, onCall, userLocation }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
    
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 600);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isFullTime = job?.job_type === 'full_time';

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
        border: `1px solid ${C.border}`,
        borderBottom: 'none',
    };

    if (!job) return null;

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
                        bgcolor: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '12px',
                        width: 36,
                        height: 36,
                        zIndex: 10,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 18, color: '#fff' }} />
                </IconButton>

                {/* Header Section - Text color white */}
                <Box sx={{
                    p: 3,
                    pb: 2,
                    background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDark} 100%)`,
                    color: '#ffffff',
                    flexShrink: 0,
                }}>
                    <Box sx={{ pr: 4 }}>
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 800,
                            fontSize: isMobile ? 20 : 22,
                            lineHeight: 1.25,
                            mb: 1,
                            letterSpacing: '-0.3px',
                            color: '#ffffff',
                        }}>
                            {job.job_title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <BusinessIcon sx={{ fontSize: 14, opacity: 0.9, color: '#ffffff' }} />
                            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13, opacity: 0.9, color: '#ffffff' }}>
                                {job.shop_name || job.company_name}
                            </Typography>
                            {job.shop_verified && (
                                <Tooltip title="Verified Employer">
                                    <CheckCircleIcon sx={{ fontSize: 14, color: C.greenLight }} />
                                </Tooltip>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                                icon={<WorkIcon sx={{ fontSize: '12px !important', color: '#ffffff' }} />}
                                label={isFullTime ? 'Full Time' : 'Part Time'}
                                size="small"
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#ffffff', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}
                            />
                            {job.views_count !== undefined && (
                                <Chip
                                    icon={<VisibilityIcon sx={{ fontSize: '12px !important', color: '#ffffff' }} />}
                                    label={`${job.views_count} views`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#ffffff', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}
                                />
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Scrollable Content */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                    {/* Salary Highlight */}
                    <Box sx={{
                        background: C.accentLight,
                        borderRadius: '16px',
                        p: 2,
                        mb: 2.5,
                        textAlign: 'center',
                    }}>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: C.textMuted, mb: 0.5 }}>
                            Salary
                        </Typography>
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 800,
                            fontSize: 28,
                            color: C.accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                        }}>
                            <RupeeIcon sx={{ fontSize: 26, color: C.accent }} />
                            {job.salary.toLocaleString()}
                            <span style={{ fontSize: 14, fontWeight: 400, color: C.textMuted }}>
                                /{job.salary_type === 'month' ? 'month' : 'day'}
                            </span>
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2.5, borderColor: C.borderLight }} />

                    {/* Job Details */}
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 14, mb: 1.5, color: C.text }}>
                        Job Details
                    </Typography>

                    <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: C.accentLight, borderRadius: '10px' }}>
                                <WorkIcon sx={{ fontSize: 16, color: C.accent }} />
                                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 600, color: C.text }}>
                                    {isFullTime ? 'Full Time' : 'Part Time'}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: C.accentLight, borderRadius: '10px' }}>
                                <PersonIcon sx={{ fontSize: 16, color: C.accent }} />
                                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 600, color: C.text }}>
                                    {job.employer_name || 'Company'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LocationIcon sx={{ fontSize: 16, color: C.accent }} />
                            </Box>
                            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: C.text }}>
                                {job.area}, {job.city}, {job.state}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PhoneIcon sx={{ fontSize: 16, color: C.accent }} />
                            </Box>
                            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: C.text }}>
                                {job.employer_phone || job.contact_phone || 'Not available'}
                            </Typography>
                        </Box>
                    </Box>

                    {job.qualification && (
                        <>
                            <Divider sx={{ mb: 2.5, borderColor: C.borderLight }} />
                            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 14, mb: 1, color: C.text }}>
                                Qualification Required
                            </Typography>
                            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: C.textMuted, lineHeight: 1.65 }}>
                                {job.qualification}
                            </Typography>
                        </>
                    )}

                    {job.distance && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2, mb: 2 }}>
                            <LocationIcon sx={{ fontSize: 12, color: C.accent }} />
                            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: C.textMuted }}>
                                {job.distance.toFixed(1)} km from your location
                            </Typography>
                        </Box>
                    )}

                    <Divider sx={{ my: 2.5, borderColor: C.borderLight }} />

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<PhoneIcon />}
                            onClick={() => onCall(job.employer_phone || job.contact_phone)}
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
                            Call Now
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<LocationIcon />}
                            onClick={() => {
                                if (job.latitude && job.longitude && userLocation) {
                                    window.open(
                                        `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${job.latitude},${job.longitude}`,
                                        '_blank'
                                    );
                                }
                            }}
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
                            Directions
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

// ─── Filter Panel ──────────────────────────────────────────────────────────
function FilterPanel({ radius, setRadius, jobType, setJobType, salaryRange, setSalaryRange, filterOptions, clearFilters, onApply }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="subtitle1" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, color: C.text }}>
                Filters
            </Typography>

            {/* Distance */}
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500, color: C.textMuted }}>
                        Distance Radius
                    </Typography>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 700, color: C.accent }}>
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

            {/* Job type */}
            <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: '"Inter", sans-serif' }}>Job Type</InputLabel>
                <Select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    label="Job Type"
                    sx={{ borderRadius: '8px', fontFamily: '"Inter", sans-serif', fontSize: 14 }}
                >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="full_time">Full Time</MenuItem>
                    <MenuItem value="part_time">Part Time</MenuItem>
                </Select>
            </FormControl>

            {/* Salary range */}
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500, color: C.textMuted }}>
                        Salary Range (₹/month)
                    </Typography>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 700, color: C.accent }}>
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
                    sx={{ color: C.accent, height: 4 }}
                />
            </Box>

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
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    maxWidth: '340px',
                    width: '90%',
                    p: 1,
                }
            }}
        >
            <DialogTitle sx={{ 
                fontFamily: '"Inter", sans-serif',
                fontWeight: 700,
                fontSize: '1.2rem',
                color: C.text,
                pb: 1,
                pt: 2.5
            }}>
                Allow Location Access
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ 
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.85rem',
                    color: C.textMuted,
                    mb: 2
                }}>
                    NearZO needs your location to show jobs near you. 
                    We don't store your precise location.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<GpsFixedIcon />}
                        onClick={onAllow}
                        disabled={loading}
                        sx={{
                            background: C.accent,
                            borderRadius: '14px',
                            py: 1.2,
                            textTransform: 'none',
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            '&:hover': { background: C.accentDark }
                        }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Allow Location'}
                    </Button>

                    <Typography sx={{ textAlign: 'center', color: C.textMuted, fontSize: '0.75rem' }}>OR</Typography>

                    <TextField
                        placeholder="Enter your city name"
                        value={manualCity}
                        onChange={(e) => setManualCity(e.target.value)}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '14px',
                                fontFamily: '"Inter", sans-serif'
                            }
                        }}
                    />
                    
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleManualSubmit}
                        disabled={!manualCity.trim() || loading}
                        sx={{
                            borderRadius: '14px',
                            py: 1,
                            textTransform: 'none',
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            borderColor: C.border,
                            color: C.textSub,
                            '&:hover': { borderColor: C.accent, color: C.accent }
                        }}
                    >
                        Use this city
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button 
                    onClick={onClose}
                    sx={{
                        color: C.textMuted,
                        textTransform: 'none',
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '0.8rem'
                    }}
                >
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

    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(true);
    const [filterOptions, setFilterOptions] = useState({ job_types: [], min_salary: 0, max_salary: 100000, job_titles: [] });
    const [locationDialogOpen, setLocationDialogOpen] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [detectedCity, setDetectedCity] = useState('');
    const [showCitySnackbar, setShowCitySnackbar] = useState(false);

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

    const scrollRef = useRef(null);

    // ── Helper Functions ──
    const getCityFromCoordinates = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                { headers: { 'User-Agent': 'NearZO-App/1.0' } }
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
                (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
                (error) => reject(error),
                { enableHighAccuracy: true, timeout: 10000 }
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
        }
    };

    // ── Effects ──
    useEffect(() => {
        const initializeLocation = async () => {
            setGettingLocation(true);
            try {
                const coords = await getCurrentLocationCoords();
                setUserLocation(coords);
            } catch (err) {
                console.log('Could not get location automatically');
                setLocationDialogOpen(true);
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
        if (viewedJobsRef.current.has(job.id)) {
            setLoadingDetails(true);
            setDetailsOpen(true);
            try {
                const result = await getJobById(job.id, userLocation);
                setSelectedJob(result.job);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoadingDetails(false);
            }
            return;
        }
        setLoadingDetails(true);
        setDetailsOpen(true);
        viewedJobsRef.current.add(job.id);
        incrementJobViewCount(job.id).catch(err => {
            console.log('View count error:', err);
            viewedJobsRef.current.delete(job.id);
        });
        try {
            const result = await getJobById(job.id, userLocation);
            setSelectedJob(result.job);
        } catch (err) {
            setError(err.message);
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

    const SORT_OPTIONS = ['Recent', 'Nearest', 'Salary: High to Low', 'Salary: Low to High'];

    if (gettingLocation && !locationDialogOpen) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2, bgcolor: C.bg }}>
                <CircularProgress sx={{ color: C.accent }} size={36} />
                <Typography sx={{ fontFamily: '"Inter", sans-serif', color: C.textMuted }}>Detecting your location…</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: C.bg, minHeight: '100vh', pb: `${BOTTOM_NAV_OFFSET + 20}px` }}>
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
                <Alert sx={{ borderRadius: '12px', fontFamily: '"Inter", sans-serif', bgcolor: C.accent, color: '#fff', '& .MuiAlert-icon': { color: '#fff' } }} icon={<GpsFixedIcon />}>
                    Showing jobs near <strong>{detectedCity || 'your location'}</strong>
                </Alert>
            </Snackbar>

            {/* ── STICKY HEADER ── */}
            <Box sx={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: C.surface,
                px: 2,
                pt: 1.5,
                pb: 1.5,
                borderBottom: `1px solid ${C.border}`,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 18, color: C.text, letterSpacing: '-0.3px' }}>
                            Nearby Jobs
                        </Typography>
                        {detectedCity && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                <LocationIcon sx={{ fontSize: 12, color: C.accent }} />
                                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 11, color: C.textMuted }}>{detectedCity}</Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={handleRefreshLocation} sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: C.surfaceAlt, color: C.textMuted, '&:hover': { bgcolor: C.accentLight, color: C.accent } }}>
                            <RefreshIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton onClick={() => setFilterDrawerOpen(true)} sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: filterDrawerOpen ? C.accentLight : C.surfaceAlt, color: filterDrawerOpen ? C.accent : C.textMuted, '&:hover': { bgcolor: C.accentLight, color: C.accent } }}>
                            <FilterIcon sx={{ fontSize: 18 }} />
                        </IconButton>
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
                        startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: C.textMuted }} /></InputAdornment>),
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
                        fontFamily: '"Inter", sans-serif', fontWeight: 500, fontSize: 13,
                        color: C.text, height: 32, cursor: 'pointer',
                        '&:hover': { background: C.accentLight },
                    }}
                />
            </Box>

            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mx: 2, mt: 1, borderRadius: '10px' }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mx: 2, mt: 1, borderRadius: '10px' }}>{success}</Alert>}

            {/* ── SCROLLABLE BODY ── */}
            <Box sx={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', px: { xs: 1.5, md: 2 }, mt: 1 }}>
                {!loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 13, color: C.text }}>
                            {total} Job{total !== 1 ? 's' : ''} Found
                        </Typography>
                        <Box onClick={() => setSortDrawerOpen(true)} sx={{ display: 'flex', alignItems: 'center', gap: 0.4, cursor: 'pointer' }}>
                            <Typography sx={{ fontSize: 12, color: C.textMuted }}>Sort by:</Typography>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.accent }}>{sortBy}</Typography>
                            <ArrowDownIcon sx={{ fontSize: 15, color: C.accent }} />
                        </Box>
                    </Box>
                )}

                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} />)
                ) : jobs.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <WorkIcon sx={{ fontSize: 56, color: '#d1d5db', mb: 2 }} />
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 16, color: C.text, mb: 1 }}>No jobs found near you</Typography>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: C.textMuted, mb: 3 }}>
                            {detectedCity ? `No jobs found in ${detectedCity} within ${radius} km.` : 'Try expanding your radius or changing filters.'}
                        </Typography>
                        <Button variant="contained" onClick={clearFilters} sx={{ fontFamily: '"Inter", sans-serif', textTransform: 'none', borderRadius: '10px', background: C.accent, px: 3 }}>Clear Filters</Button>
                        <Button variant="outlined" onClick={handleRefreshLocation} sx={{ fontFamily: '"Inter", sans-serif', textTransform: 'none', borderRadius: '10px', ml: 2, borderColor: C.accent, color: C.accent }}>Change Location</Button>
                    </Box>
                ) : (
                    jobs.map((job, idx) => (
                        <JobCard key={job.id} job={job} index={idx} onApply={handleCall} onView={handleView} />
                    ))
                )}
            </Box>

            {/* ── FILTER DRAWER ── */}
            <Drawer anchor="bottom" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} PaperProps={{ sx: { borderRadius: '20px 20px 0 0', p: 3, maxHeight: '85vh', background: C.surface } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 18, color: C.text }}>Filters</Typography>
                    <IconButton onClick={() => setFilterDrawerOpen(false)} size="small" sx={{ bgcolor: C.surfaceAlt, borderRadius: '10px' }}><CloseIcon sx={{ fontSize: 16, color: C.textMuted }} /></IconButton>
                </Box>
                <Divider sx={{ mb: 3, borderColor: C.borderLight }} />
                <FilterPanel radius={radius} setRadius={setRadius} jobType={jobType} setJobType={setJobType} salaryRange={salaryRange} setSalaryRange={setSalaryRange} filterOptions={filterOptions} clearFilters={clearFilters} onApply={() => setFilterDrawerOpen(false)} />
            </Drawer>

            {/* ── SORT DRAWER ── */}
            <Drawer anchor="bottom" open={sortDrawerOpen} onClose={() => setSortDrawerOpen(false)} PaperProps={{ sx: { borderRadius: '20px 20px 0 0', p: 3, background: C.surface } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 18, color: C.text }}>Sort By</Typography>
                    <IconButton onClick={() => setSortDrawerOpen(false)} size="small" sx={{ bgcolor: C.surfaceAlt, borderRadius: '10px' }}><CloseIcon sx={{ fontSize: 16, color: C.textMuted }} /></IconButton>
                </Box>
                <Divider sx={{ mb: 2, borderColor: C.borderLight }} />
                {SORT_OPTIONS.map((opt) => (
                    <Box key={opt} onClick={() => { setSortBy(opt); setSortDrawerOpen(false); }} sx={{ py: 1.5, px: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: '10px', '&:hover': { background: C.accentLight } }}>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: sortBy === opt ? 700 : 400, fontSize: 14, color: sortBy === opt ? C.accent : C.text }}>{opt}</Typography>
                        {sortBy === opt && <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: C.accent }} />}
                    </Box>
                ))}
            </Drawer>

            {/* ── JOB DETAILS DRAWER (Full Screen on Mobile) ── */}
            {detailsOpen && selectedJob && (
                <JobDetailsDrawer job={selectedJob} onClose={() => setDetailsOpen(false)} onCall={handleCall} userLocation={userLocation} />
            )}
        </Box>
    );
}