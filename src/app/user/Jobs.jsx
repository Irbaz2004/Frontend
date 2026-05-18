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
    Send as SendIcon,
    CheckCircle as CheckCircleIcon,
    KeyboardArrowDown as ArrowDownIcon,
    Description as DescriptionIcon,
    Visibility as VisibilityIcon,
    GpsFixed as GpsFixedIcon,
} from '@mui/icons-material';
import { getJobsByLocation, getJobById, getJobFilterOptions, applyForJob, incrementJobViewCount } from '../../services/jobs';
import { useAuth } from '../context/AuthContext';

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
    greenBg:     '#dcfce7',
    purple:      '#7c3aed',
    purpleBg:    '#ede9fe',
    radius:      '14px',
    cardRadius:  '16px',
    font:        '"Roboto", sans-serif',
};

/* ─── Logo placeholder colours ───────────────────────────────────────────── */
const LOGO_COLORS = [
    '#22863a', '#3730a3', '#78350f', '#c2410c',
    '#1e3a5f', '#7f1d1d', '#064e3b', '#4c1d95',
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const formatSalaryShort = (amount) => {
    if (!amount) return '';
    const n = Number(amount);
    return n >= 1000 ? `₹${Math.round(n / 1000)}K` : `₹${n}`;
};

const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

/* ─── Skeleton card ───────────────────────────────────────────────────────── */
const JobCardSkeleton = () => (
    <Box sx={{ background: T.surface, borderRadius: T.cardRadius, border: `1px solid ${T.border}`, p: 2, mb: 1.5, mx: { xs: 1.5, md: 2 } }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Skeleton variant="rounded" width={72} height={72} sx={{ borderRadius: '12px', flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={22} />
                <Skeleton variant="text" width="40%" height={18} />
                <Skeleton variant="text" width="35%" height={16} />
            </Box>
            <Skeleton variant="circular" width={26} height={26} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            <Skeleton variant="rounded" width={80}  height={24} sx={{ borderRadius: '6px' }} />
            <Skeleton variant="rounded" width={110} height={24} sx={{ borderRadius: '6px' }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
            <Skeleton variant="text" width="25%" height={16} />
            <Skeleton variant="rounded" width={72} height={34} sx={{ borderRadius: '10px' }} />
        </Box>
    </Box>
);

/* ─── Job Card ────────────────────────────────────────────────────────────── */
function JobCard({ job, index, onApply, onView }) {
    const isFullTime = job.job_type === 'full_time';
    const logoBg = LOGO_COLORS[index % LOGO_COLORS.length];

    const salaryText = job.salary
        ? `${formatSalaryShort(job.salary)} – ${formatSalaryShort(Math.round(Number(job.salary) * 1.3))}/${job.salary_type === 'month' ? 'month' : 'day'}`
        : null;

    return (
        <Box
            onClick={() => onView(job)}
            sx={{
                background: T.surface,
                borderRadius: T.cardRadius,
                border: `1px solid ${T.border}`,
                p: 2,
                mb: 1.5,
                mx: { xs: 1.5, md: 2 },
                cursor: 'pointer',
                transition: 'box-shadow 0.18s, border-color 0.18s',
                '&:hover': { boxShadow: '0 4px 20px rgba(26,110,245,0.10)', borderColor: '#c7d2fe' },
            }}
        >
            {/* Top: logo + info + bookmark */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                {/* Logo */}
                <Box
                    sx={{
                        width: 72, height: 72, borderRadius: '12px', flexShrink: 0,
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
                        <Typography sx={{ color: '#fff', fontFamily: T.font, fontWeight: 700, fontSize: 11, textAlign: 'center', lineHeight: 1.2, px: 0.5 }}>
                            {job.company_name || job.shop_name || 'Shop'}
                        </Typography>
                    )}
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="body2"
                        sx={{ fontFamily: T.font, fontWeight: 700, fontSize: 15, color: T.textPrimary, lineHeight: 1.3, mb: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                        {job.job_title}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: T.font, fontSize: 13, color: T.textMuted, display: 'block', mb: 0.4 }}>
                        {job.company_name || job.shop_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <LocationIcon sx={{ fontSize: 12, color: T.brand, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ fontFamily: T.font, fontSize: 12, color: T.textMuted }}>
                            {job.distance ? `${job.distance.toFixed(2)} km away` : `${job.area}, ${job.city}`}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Chips */}
            <Box sx={{ display: 'flex', gap: 0.75, mt: 1.25, flexWrap: 'wrap' }}>
                <Chip
                    icon={<WorkIcon sx={{ fontSize: '13px !important', color: `${isFullTime ? T.green : T.purple} !important` }} />}
                    label={isFullTime ? 'Full-time' : 'Part-time'}
                    size="small"
                    sx={{
                        height: 24, borderRadius: '6px',
                        bgcolor: isFullTime ? T.greenBg : T.purpleBg,
                        color: isFullTime ? T.green : T.purple,
                        fontFamily: T.font, fontWeight: 600, fontSize: 11,
                        '& .MuiChip-label': { px: '7px' },
                        '& .MuiChip-icon': { ml: '6px', mr: '-2px' },
                    }}
                />
                {salaryText && (
                    <Chip
                        label={salaryText}
                        size="small"
                        sx={{
                            height: 24, borderRadius: '6px',
                            bgcolor: T.brandLight, color: T.brand,
                            fontFamily: T.font, fontWeight: 600, fontSize: 11,
                            '& .MuiChip-label': { px: '7px' },
                        }}
                    />
                )}
            </Box>

            {/* Bottom: posted + apply */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                <Typography variant="caption" sx={{ fontFamily: T.font, fontSize: 11.5, color: T.textMuted }}>
                    Posted {timeAgo(job.created_at)}
                </Typography>
                <Button
                    variant="contained"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onApply(job); }}
                    sx={{
                        fontFamily: T.font, textTransform: 'none', borderRadius: '10px',
                        background: T.brand, fontWeight: 700, fontSize: 13,
                        px: 2.5, py: 0.6, boxShadow: 'none',
                        '&:hover': { boxShadow: '0 4px 12px rgba(26,110,245,0.3)', background: '#1558d6' },
                    }}
                >
                    Call
                </Button>
            </Box>
        </Box>
    );
}

/* ─── Filter panel ────────────────────────────────────────────────────────── */
function FilterPanel({ radius, setRadius, jobType, setJobType, salaryRange, setSalaryRange, filterOptions, clearFilters }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="subtitle1" sx={{ fontFamily: T.font, fontWeight: 700, color: T.textPrimary }}>
                Filters
            </Typography>

            {/* Distance */}
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: T.font, fontWeight: 500, color: T.textMuted }}>Distance Radius</Typography>
                    <Typography variant="body2" sx={{ fontFamily: T.font, fontWeight: 700, color: T.brand }}>{radius} km</Typography>
                </Box>
                <Slider
                    value={radius} onChange={(_, val) => setRadius(val)}
                    min={1} max={50} valueLabelDisplay="auto"
                    sx={{ color: T.brand, height: 4, '& .MuiSlider-thumb': { width: 16, height: 16 }, '& .MuiSlider-rail': { opacity: 0.2 } }}
                />
            </Box>

            {/* Job type */}
            <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: T.font }}>Job Type</InputLabel>
                <Select value={jobType} onChange={(e) => setJobType(e.target.value)} label="Job Type" sx={{ borderRadius: '8px', fontFamily: T.font, fontSize: 14 }}>
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="full_time">Full Time</MenuItem>
                    <MenuItem value="part_time">Part Time</MenuItem>
                </Select>
            </FormControl>

            {/* Salary range */}
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: T.font, fontWeight: 500, color: T.textMuted }}>Salary Range</Typography>
                    <Typography variant="body2" sx={{ fontFamily: T.font, fontWeight: 700, color: T.brand }}>
                        ₹{salaryRange[0].toLocaleString()} – ₹{salaryRange[1].toLocaleString()}
                    </Typography>
                </Box>
                <Slider
                    value={salaryRange} onChange={(_, val) => setSalaryRange(val)}
                    min={filterOptions.min_salary || 0} max={filterOptions.max_salary || 100000}
                    valueLabelDisplay="auto" valueLabelFormat={(v) => `₹${(v / 1000).toFixed(0)}K`}
                    sx={{ color: T.brand, height: 4, '& .MuiSlider-thumb': { width: 16, height: 16 }, '& .MuiSlider-rail': { opacity: 0.2 } }}
                />
            </Box>

            <Button
                fullWidth variant="outlined" startIcon={<ClearIcon />} onClick={clearFilters} size="small"
                sx={{ fontFamily: T.font, textTransform: 'none', borderRadius: '8px', borderColor: T.border, color: T.textMuted, fontSize: 13, '&:hover': { borderColor: T.brand, color: T.brand, background: T.brandLight } }}
            >
                Clear All Filters
            </Button>
        </Box>
    );
}

// ── Location Permission Dialog ────────────────────────────────────────────────
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
                    p: 1
                }
            }}
        >
            <DialogTitle sx={{ 
                fontFamily: '"Inter", sans-serif',
                fontWeight: 700,
                fontSize: '1.2rem',
                color: '#0a1628',
                pb: 1,
                pt: 2.5
            }}>
                Allow Location Access
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ 
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.85rem',
                    color: '#64748b',
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
                            background: '#325fec',
                            borderRadius: '14px',
                            py: 1.2,
                            textTransform: 'none',
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            '&:hover': {
                                background: '#254bc4'
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Allow Location'}
                    </Button>

                    <Typography sx={{ 
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: '0.75rem'
                    }}>
                        OR
                    </Typography>

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
                            borderColor: '#cbd5e1',
                            color: '#475569',
                            '&:hover': {
                                borderColor: '#325fec',
                                color: '#325fec'
                            }
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
                        color: '#94a3b8',
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
    const theme    = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const viewedJobsRef = useRef(new Set());

    const [loading,          setLoading]          = useState(true);
    const [jobs,             setJobs]             = useState([]);
    const [total,            setTotal]            = useState(0);
    const [totalPages,       setTotalPages]       = useState(1);
    const [currentPage,      setCurrentPage]      = useState(1);
    const [error,            setError]            = useState('');
    const [success,          setSuccess]          = useState('');
    const [userLocation,     setUserLocation]     = useState(null);
    const [gettingLocation,  setGettingLocation]  = useState(true);
    const [filterOptions,    setFilterOptions]    = useState({ job_types: [], min_salary: 0, max_salary: 100000, job_titles: [] });
    const [locationDialogOpen, setLocationDialogOpen] = useState(false);
    const [locationLoading,  setLocationLoading]  = useState(false);
    const [detectedCity,     setDetectedCity]     = useState('');
    const [showCitySnackbar, setShowCitySnackbar] = useState(false);

    const [radius,           setRadius]           = useState(10);
    const [salaryRange,      setSalaryRange]      = useState([0, 100000]);
    const [jobType,          setJobType]          = useState('');
    const [jobTitle,         setJobTitle]         = useState('');
    const [searchTerm,       setSearchTerm]       = useState('');
    const [sortBy,           setSortBy]           = useState('Recent');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [sortDrawerOpen,   setSortDrawerOpen]   = useState(false);
    const [bookmarks,        setBookmarks]        = useState([]);

    const [selectedJob,      setSelectedJob]      = useState(null);
    const [detailsOpen,      setDetailsOpen]      = useState(false);
    const [loadingDetails,   setLoadingDetails]   = useState(false);
    const [applying,         setApplying]         = useState(false);
    const [applyDialogOpen,  setApplyDialogOpen]  = useState(false);

    const scrollRef = useRef(null);

    /* ── Function to get city from coordinates ── */
    const getCityFromCoordinates = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'NearZO-App/1.0'
                    }
                }
            );
            const data = await response.json();
            
            if (data && data.address) {
                const city = data.address.city || 
                           data.address.town || 
                           data.address.village || 
                           data.address.municipality ||
                           data.address.county;
                
                if (city) {
                    return city;
                }
            }
            throw new Error('City not found');
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            throw error;
        }
    };

    /* ── Get current location city ── */
    const getCurrentLocationCity = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const city = await getCityFromCoordinates(latitude, longitude);
                        resolve({ city, latitude, longitude });
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => {
                    let errorMessage = 'Unable to get your location';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    /* ── Get current location coordinates only ── */
    const getCurrentLocationCoords = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    /* ── Handle location permission ── */
    const handleAllowLocation = async () => {
        setLocationLoading(true);
        try {
            const { city, latitude, longitude } = await getCurrentLocationCity();
            if (city) {
                setDetectedCity(city);
                setLocationDialogOpen(false);
                setUserLocation({ latitude, longitude });
                setShowCitySnackbar(true);
                // Load jobs will be triggered by useEffect
            } else {
                throw new Error('Could not detect your city');
            }
        } catch (err) {
            console.error('Location error:', err);
            setError(err.message);
            // Fallback to default location
            setUserLocation({ latitude: 12.9165, longitude: 79.1325 });
        } finally {
            setLocationLoading(false);
        }
    };

    /* ── Handle manual city entry ── */
    const handleManualCity = async (city) => {
        setLocationDialogOpen(false);
        setDetectedCity(city);
        setShowCitySnackbar(true);
        // For manual city, we still need coordinates for distance calculation
        // Use default coordinates for that city or skip distance filter
        setUserLocation({ latitude: 12.9165, longitude: 79.1325, manualCity: city });
    };

    /* ── Handle skip location ── */
    const handleSkipLocation = async () => {
        setLocationDialogOpen(false);
        setUserLocation({ latitude: 12.9165, longitude: 79.1325 });
    };

    /* ── Refresh location ── */
    const handleRefreshLocation = () => {
        setLocationDialogOpen(true);
    };

    /* ── Effects ── */
    useEffect(() => {
        // Initialize location on mount
        const initializeLocation = async () => {
            setGettingLocation(true);
            try {
                const coords = await getCurrentLocationCoords();
                setUserLocation(coords);
            } catch (err) {
                console.log('Could not get location automatically, showing dialog');
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
        if (userLocation) {
            loadJobs();
        }
    }, [userLocation, radius, salaryRange, jobType, jobTitle, searchTerm, sortBy, currentPage]);

    /* ── Handlers ── */
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
                job_title: jobTitle,
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

    const handleApplyIntent = (job) => {
        window.open(`tel:${job.employer_phone}`, '_self');
    };

    const handleApplyConfirm = async () => {
        if (!isAuthenticated) { setError('Please login to apply for this job'); return; }
        setApplying(true);
        try {
            await applyForJob(selectedJob.id);
            setSuccess('Application submitted successfully!');
            setApplyDialogOpen(false);
            setDetailsOpen(false);
            loadJobs();
        } catch (err) {
            setError(err.message);
        } finally {
            setApplying(false);
        }
    };

    const clearFilters = () => {
        setRadius(10);
        setSalaryRange([filterOptions.min_salary, filterOptions.max_salary]);
        setJobType('');
        setJobTitle('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    /* ── Location loading screen ── */
    if (gettingLocation && !locationDialogOpen) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
                <CircularProgress sx={{ color: T.brand }} size={36} />
                <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textMuted }}>Detecting your location…</Typography>
            </Box>
        );
    }

    const SORT_OPTIONS = ['Recent', 'Nearest', 'Salary: High to Low', 'Salary: Low to High'];

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
            <LocationPermissionDialog
                open={locationDialogOpen}
                onClose={handleSkipLocation}
                onAllow={handleAllowLocation}
                onManualCity={handleManualCity}
                loading={locationLoading}
            />

            {/* Snackbar for city change notification */}
            <Snackbar
                open={showCitySnackbar}
                autoHideDuration={5000}
                onClose={() => setShowCitySnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    severity="info" 
                    sx={{ 
                        borderRadius: '12px',
                        fontFamily: '"Inter", sans-serif',
                        alignItems: 'center',
                        bgcolor: '#325fec',
                        color: '#fff',
                        '& .MuiAlert-icon': { color: '#fff' }
                    }}
                    icon={<GpsFixedIcon />}
                >
                    Showing jobs near <strong>{detectedCity || 'your location'}</strong>
                </Alert>
            </Snackbar>

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
                {/* Title row + Filter */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.25 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontFamily: T.font, fontWeight: 700, fontSize: 18, color: T.textPrimary }}>
                            Nearby Jobs
                        </Typography>
                        {detectedCity && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                <LocationIcon sx={{ fontSize: 12, color: T.brand }} />
                                <Typography variant="caption" sx={{ fontFamily: T.font, fontSize: 11, color: T.textMuted }}>
                                    {detectedCity}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Button
                            onClick={handleRefreshLocation}
                            startIcon={<GpsFixedIcon sx={{ fontSize: '18px !important' }} />}
                            sx={{
                                minWidth: 0,
                                px: 1,
                                py: 0.5,
                                color: T.textMuted,
                                fontSize: 11,
                                fontFamily: T.font,
                                textTransform: 'none',
                                borderRadius: '8px',
                                '&:hover': { color: T.brand, background: T.brandLight },
                            }}
                        >
                            Refresh
                        </Button>
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
                    </Box>
                </Box>

                {/* Search bar */}
                <TextField
                    fullWidth
                    placeholder="Search jobs, role or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{
                        mb: 1.25,
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

            {/* Alerts */}
            {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mx: 2, mt: 1, borderRadius: '10px', fontFamily: T.font, flexShrink: 0 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" onClose={() => setSuccess('')} sx={{ mx: 2, mt: 1, borderRadius: '10px', fontFamily: T.font, flexShrink: 0 }}>
                    {success}
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
                {/* Results count + sort row */}
                {!loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: { xs: 2, md: 2.5 }, pt: 1.5, pb: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: T.font, fontWeight: 600, fontSize: 13.5, color: T.textPrimary }}>
                            {total} Job{total !== 1 ? 's' : ''} Found
                        </Typography>
                        <Box onClick={() => setSortDrawerOpen(true)} sx={{ display: 'flex', alignItems: 'center', gap: 0.4, cursor: 'pointer' }}>
                            <Typography variant="body2" sx={{ fontFamily: T.font, fontSize: 13, color: T.textMuted }}>Sort by:</Typography>
                            <Typography variant="body2" sx={{ fontFamily: T.font, fontSize: 13, fontWeight: 700, color: T.brand }}>{sortBy}</Typography>
                            <ArrowDownIcon sx={{ fontSize: 16, color: T.brand }} />
                        </Box>
                    </Box>
                )}

                {/* Job cards */}
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <JobCardSkeleton key={i} />)
                ) : jobs.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <WorkIcon sx={{ fontSize: 56, color: '#d1d5db', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontFamily: T.font, fontWeight: 600, color: T.textPrimary, mb: 1 }}>No jobs found near you</Typography>
                        <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textMuted, mb: 3 }}>
                            {detectedCity ? `No jobs found in ${detectedCity} within ${radius} km.` : 'Try expanding your radius or changing filters.'}
                        </Typography>
                        <Button variant="contained" onClick={clearFilters} sx={{ fontFamily: T.font, textTransform: 'none', borderRadius: '8px', background: T.brand, px: 3 }}>
                            Clear Filters
                        </Button>
                        <Button 
                            variant="outlined" 
                            onClick={handleRefreshLocation} 
                            sx={{ fontFamily: T.font, textTransform: 'none', borderRadius: '8px', ml: 2, borderColor: T.brand, color: T.brand }}
                        >
                            Change Location
                        </Button>
                    </Box>
                ) : (
                    jobs.map((job, idx) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            index={idx}
                            bookmarked={bookmarks.includes(job.id)}
                            onApply={handleApplyIntent}
                            onView={handleView}
                        />
                    ))
                )}

            </Box>
            {/* ══ END SCROLLABLE BODY ══ */}

            {/* ══ FILTER DRAWER ══ */}
            <Drawer
                anchor="bottom"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                PaperProps={{ sx: { borderRadius: '20px 20px 0 0', p: 3, maxHeight: '85vh' } }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontFamily: T.font, fontWeight: 700 }}>Filters</Typography>
                    <IconButton onClick={() => setFilterDrawerOpen(false)} size="small"><CloseIcon /></IconButton>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <FilterPanel
                    radius={radius} setRadius={setRadius}
                    jobType={jobType} setJobType={setJobType}
                    salaryRange={salaryRange} setSalaryRange={setSalaryRange}
                    filterOptions={filterOptions}
                    clearFilters={clearFilters}
                />
                <Button
                    fullWidth variant="contained"
                    onClick={() => { setFilterDrawerOpen(false); setCurrentPage(1); }}
                    sx={{ mt: 3, fontFamily: T.font, textTransform: 'none', borderRadius: '10px', background: T.brand, fontWeight: 600 }}
                >
                    Apply Filters
                </Button>
            </Drawer>

            {/* ══ SORT DRAWER ══ */}
            <Drawer
                anchor="bottom"
                open={sortDrawerOpen}
                onClose={() => setSortDrawerOpen(false)}
                PaperProps={{ sx: { borderRadius: '20px 20px 0 0', p: 3 } }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontFamily: T.font, fontWeight: 700 }}>Sort By</Typography>
                    <IconButton onClick={() => setSortDrawerOpen(false)} size="small"><CloseIcon /></IconButton>
                </Box>
                <Divider sx={{ mb: 1 }} />
                {SORT_OPTIONS.map((opt) => (
                    <Box
                        key={opt}
                        onClick={() => { setSortBy(opt); setSortDrawerOpen(false); }}
                        sx={{
                            py: 1.5, px: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            cursor: 'pointer', borderRadius: '10px', '&:hover': { background: T.brandLight },
                        }}
                    >
                        <Typography variant="body2" sx={{ fontFamily: T.font, fontWeight: sortBy === opt ? 700 : 400, color: sortBy === opt ? T.brand : T.textPrimary }}>
                            {opt}
                        </Typography>
                        {sortBy === opt && <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: T.brand }} />}
                    </Box>
                ))}
            </Drawer>

            {/* ══ JOB DETAILS DRAWER ══ */}
            <Drawer
                anchor={isMobile ? 'bottom' : 'right'}
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                PaperProps={{
                    sx: {
                        width: isMobile ? '100%' : 500,
                        borderRadius: isMobile ? '20px 20px 0 0' : '16px 0 0 16px',
                        maxHeight: isMobile ? '92vh' : '100vh',
                    },
                }}
            >
                {loadingDetails ? (
                    <Box sx={{ p: 3 }}>
                        <Skeleton variant="rectangular" height={140} sx={{ borderRadius: '12px' }} />
                        <Skeleton variant="text" height={40} sx={{ mt: 2, width: '70%' }} />
                        <Skeleton variant="text" height={20} width="50%" />
                        <Skeleton variant="rectangular" height={90} sx={{ mt: 3, borderRadius: '10px' }} />
                    </Box>
                ) : selectedJob ? (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Header band */}
                        <Box sx={{ p: 3, pb: 2.5, background: T.brand, color: 'white', flexShrink: 0, position: 'relative' }}>
                            <IconButton
                                onClick={() => setDetailsOpen(false)}
                                sx={{ position: 'absolute', top: 10, right: 10, color: 'white', bgcolor: 'rgba(255,255,255,0.15)', width: 34, height: 34, '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="h6" sx={{ fontFamily: T.font, fontWeight: 700, lineHeight: 1.3, pr: 4, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                {selectedJob.job_title}
                                {selectedJob.views_count !== undefined && (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 0.5, 
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        borderRadius: '20px',
                                        px: 1,
                                        py: 0.3,
                                    }}>
                                        <VisibilityIcon sx={{ fontSize: 12 }} />
                                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                            {selectedJob.views_count} views
                                        </Typography>
                                    </Box>
                                )}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.9 }}>
                                <BusinessIcon sx={{ fontSize: 15 }} />
                                <Typography variant="body2" sx={{ fontFamily: T.font, fontSize: 13 }}>
                                    {selectedJob.shop_name || selectedJob.company_name}
                                </Typography>
                                {selectedJob.shop_verified && (
                                    <Tooltip title="Verified Employer">
                                        <CheckCircleIcon sx={{ fontSize: 15, color: '#a7f3d0' }} />
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>

                        {/* Body */}
                        <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
                            {/* Salary highlight */}
                            <Box sx={{ background: T.brandLight, borderRadius: '12px', p: 2, mb: 2.5 }}>
                                <Typography variant="caption" sx={{ fontFamily: T.font, color: T.textMuted }}>Salary</Typography>
                                <Typography variant="h5" sx={{ fontFamily: T.font, fontWeight: 700, color: T.brand }}>
                                    {formatPrice(selectedJob.salary)}
                                    <span style={{ fontSize: '0.85rem', fontWeight: 400, color: T.textMuted }}>
                                        /{selectedJob.salary_type === 'month' ? 'month' : 'day'}
                                    </span>
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 2.5 }} />

                            {/* Details rows */}
                            <Typography variant="body2" sx={{ fontFamily: T.font, fontWeight: 700, color: T.textPrimary, mb: 1.5 }}>Job Details</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: T.brandLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <WorkIcon sx={{ fontSize: 16, color: T.brand }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textPrimary }}>
                                        {selectedJob.job_type === 'full_time' ? 'Full Time' : 'Part Time'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: T.brandLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <LocationIcon sx={{ fontSize: 16, color: T.brand }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textPrimary }}>
                                        {selectedJob.area}, {selectedJob.city}, {selectedJob.state}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: T.brandLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <PhoneIcon sx={{ fontSize: 16, color: T.brand }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textPrimary }}>
                                        {selectedJob.employer_phone || 'Not available'}
                                    </Typography>
                                </Box>
                            </Box>

                            {selectedJob.qualification && (
                                <>
                                    <Divider sx={{ mb: 2.5 }} />
                                    <Typography variant="body2" sx={{ fontFamily: T.font, fontWeight: 700, color: T.textPrimary, mb: 1 }}>
                                        Qualification Required
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: T.font, color: T.textMuted }}>
                                        {selectedJob.qualification}
                                    </Typography>
                                </>
                            )}

                            {selectedJob.distance && (
                                <Typography variant="caption" sx={{ fontFamily: T.font, color: T.textMuted, display: 'block', mt: 2 }}>
                                    📍 {selectedJob.distance.toFixed(1)} km from your location
                                </Typography>
                            )}

                            <Divider sx={{ my: 2.5 }} />

                            <Button
                                fullWidth variant="contained"
                                startIcon={<PhoneIcon />}
                                onClick={() => handleApplyIntent(selectedJob)}
                                sx={{ fontFamily: T.font, textTransform: 'none', borderRadius: '10px', background: T.brand, fontWeight: 600, py: 1.2 }}
                            >
                                Call Now
                            </Button>
                        </Box>
                    </Box>
                ) : null}
            </Drawer>

            {/* ══ APPLY CONFIRMATION DIALOG ══ */}
            <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: '16px', fontFamily: T.font } }}
            >
                <DialogTitle sx={{ fontFamily: T.font, fontWeight: 700 }}>Confirm Application</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontFamily: T.font, fontSize: 14 }}>
                        Are you sure you want to apply for <strong>{selectedJob?.job_title}</strong> at <strong>{selectedJob?.company_name || selectedJob?.shop_name}</strong>?
                    </Typography>
                    {!isAuthenticated && (
                        <Alert severity="warning" sx={{ mt: 2, borderRadius: '10px' }}>
                            Please login to apply for this job.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setApplyDialogOpen(false)} sx={{ fontFamily: T.font, textTransform: 'none', borderRadius: '8px' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleApplyConfirm}
                        variant="contained"
                        disabled={!isAuthenticated || applying}
                        sx={{ fontFamily: T.font, textTransform: 'none', borderRadius: '8px', background: T.brand }}
                    >
                        {applying ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Confirm Apply'}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}