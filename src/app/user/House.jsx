// app/user/Houses.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    IconButton,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
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
    SquareFoot as SqftIcon
} from '@mui/icons-material';
import { getHousesByLocation, getHouseById, getHouseFilterOptions } from '../../services/house';
import { useNavigate } from 'react-router-dom';

// ─── Tenant Type Config ────────────────────────────────────────────────────────
const TENANT_TYPES = [
    { value: 'bachelor', label: 'Bachelor', color: '#4f9ef8', bg: '#eaf3ff', Icon: PersonIcon },
    { value: 'family',   label: 'Family',   color: '#3bbf7e', bg: '#e8faf2', Icon: FamilyIcon },
    { value: 'couple',   label: 'Couple',   color: '#f06292', bg: '#fce4ec', Icon: CoupleIcon },
];

// ─── Price Range Config ────────────────────────────────────────────────────────
const PRICE_RANGES = [
    { label: 'Any Price', min: 0,     max: Infinity },
    { label: '₹0 – ₹5K',  min: 0,     max: 5000     },
    { label: '₹5K – ₹10K',min: 5000,  max: 10000    },
    { label: '₹10K – ₹15K',min:10000, max: 15000    },
    { label: '₹15K+',     min: 15000, max: Infinity  },
];

export default function Houses() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [loading, setLoading] = useState(true);
    const [houses, setHouses] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(true);
    const [filterOptions, setFilterOptions] = useState({ min_rent: 0, max_rent: 100000, rooms: [], furnished: [] });

    // Filters
    const [radius, setRadius] = useState(10);
    const [rentRange, setRentRange] = useState([0, 50000]);
    const [rooms, setRooms] = useState(0);
    const [furnished, setFurnished] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [selectedTenantType, setSelectedTenantType] = useState('');
    const [selectedPriceRange, setSelectedPriceRange] = useState(0); // index into PRICE_RANGES

    // Selected house for details
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
                    setError('Unable to get your location. Using default location.');
                    setGettingLocation(false);
                    setUserLocation({ latitude: 12.9165, longitude: 79.1325 });
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setError('Geolocation is not supported by your browser');
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
                limit: 12
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
        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${house.latitude},${house.longitude}`;
        window.open(url, '_blank');
    };

    const handleCallOwner = (phone) => {
        window.location.href = `tel:${phone}`;
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
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

    const getVerificationBadge = (isVerified) => isVerified
        ? { label: 'Verified',     icon: <VerifiedIcon sx={{ fontSize: 12 }} />, color: '#16a34a', bgColor: '#dcfce7' }
        : { label: 'Not Verified', icon: <PendingIcon  sx={{ fontSize: 12 }} />, color: '#d97706', bgColor: '#fef3c7' };

    const getTenantBadge = (type) => TENANT_TYPES.find(t => t.value === type) || null;

    // ── Skeleton ────────────────────────────────────────────────────────────────
    const HouseSkeleton = () => (
        <Card sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: 'none', border: '1px solid #f0f0f0' }}>
            <Skeleton variant="rectangular" height={200} />
            <CardContent sx={{ p: '12px 14px 14px' }}>
                <Skeleton variant="text" width="40%" height={26} />
                <Skeleton variant="text" width="65%" height={22} sx={{ mt: 0.5 }} />
                <Skeleton variant="text" width="50%" height={18} />
                <Box sx={{ display: 'flex', gap: 1.5, mt: 1, mb: 1.5 }}>
                    <Skeleton variant="text" width={60} height={18} />
                    <Skeleton variant="text" width={60} height={18} />
                    <Skeleton variant="text" width={70} height={18} />
                </Box>
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '10px' }} />
            </CardContent>
        </Card>
    );

    // ── Filter Drawer Content ────────────────────────────────────────────────────
    const FilterContent = () => (
        <Box sx={{ p: 2.5, width: isMobile ? '100%' : 320 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Filters</Typography>
                <IconButton size="small" onClick={() => setFilterDrawerOpen(false)}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider sx={{ mb: 2.5 }} />

            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: '#333' }}>
                Distance Radius: {radius} km
            </Typography>
            <Slider value={radius} onChange={(_, v) => setRadius(v)} min={1} max={50}
                valueLabelDisplay="auto" sx={{ mb: 3, color: '#325fec' }} />

            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: '#333' }}>
                Rent Range (₹/month)
            </Typography>
            <Slider
                value={rentRange}
                onChange={(_, v) => setRentRange(v)}
                min={filterOptions.min_rent} max={filterOptions.max_rent}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `₹${v.toLocaleString()}`}
                sx={{ mb: 1, color: '#325fec' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="caption" color="text.secondary">₹{rentRange[0].toLocaleString()}</Typography>
                <Typography variant="caption" color="text.secondary">₹{rentRange[1].toLocaleString()}</Typography>
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Minimum Rooms</InputLabel>
                <Select value={rooms} onChange={(e) => setRooms(e.target.value)} label="Minimum Rooms"
                    sx={{ borderRadius: 2 }}>
                    <MenuItem value={0}>Any</MenuItem>
                    {filterOptions.rooms?.map((r) => <MenuItem key={r} value={r}>{r} BHK</MenuItem>)}
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Furnishing Status</InputLabel>
                <Select value={furnished} onChange={(e) => setFurnished(e.target.value)}
                    label="Furnishing Status" sx={{ borderRadius: 2 }}>
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="furnished">Fully Furnished</MenuItem>
                    <MenuItem value="semi-furnished">Semi Furnished</MenuItem>
                    <MenuItem value="unfurnished">Unfurnished</MenuItem>
                </Select>
            </FormControl>

            <Button fullWidth variant="outlined" startIcon={<ClearIcon />} onClick={clearFilters}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#325fec', color: '#325fec' }}>
                Clear All Filters
            </Button>
        </Box>
    );

    // ── Loading Screen ───────────────────────────────────────────────────────────
    if (gettingLocation) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 2 }}>
                <CircularProgress sx={{ color: '#325fec' }} />
                <Typography variant="body2" color="text.secondary">Getting your location...</Typography>
            </Box>
        );
    }

    // ── Main Render ──────────────────────────────────────────────────────────────
    return (
        <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', pb: 10 }}>
            {/* ── App Header ── */}
            <Box sx={{
                px: 2, pt: 2.5, pb: 1.5,
                position: 'sticky', top: 0, zIndex: 100,
                bgcolor: '#ffffff',
                borderBottom: '1px solid #f0f0f0'
            }}>
                {/* Title Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box>
                        <Typography sx={{ fontFamily: '"Roboto", sans-serif', fontWeight: 700, fontSize: 18,color:'#111827'}}>
                            Rental Homes
                        </Typography>
                    </Box>
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
                                                 color: '#6b7280',
                                                 fontSize: 11,
                                                 fontFamily:'"Roboto", sans-serif',
                                                 textTransform: 'none',
                                                 lineHeight: 1.3,
                                                 borderRadius: '8px',
                                                 '&:hover': { color: '#1a6ef5', background: '#e8f0fe' },
                                             }}
                                         >
                                             Filter
                                         </Button>
                 
                                       
                                     </Box>
                </Box>

                {/* Tenant Type Filter */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', pb: 0.5,
                    '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#444', whiteSpace: 'nowrap', mr: 0.5 }}>
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
                                    px: 1.5, py: 0.6,
                                    borderRadius: '20px',
                                    border: `1.5px solid ${t.color}`,
                                    bgcolor: active ? t.color : t.bg,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s',
                                    userSelect: 'none',
                                    flexShrink: 0,
                                }}
                            >
                                <t.Icon sx={{ fontSize: 15, color: active ? '#fff' : t.color }} />
                                <Typography sx={{
                                    fontSize: 13, fontWeight: 600,
                                    color: active ? '#fff' : t.color
                                }}>
                                    {t.label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                {/* Price Range Filter */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.2, overflowX: 'auto', pb: 0.5,
                    '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#444', whiteSpace: 'nowrap', mr: 0.5 }}>
                        Price Range
                    </Typography>
                    {PRICE_RANGES.map((pr, idx) => {
                        const active = selectedPriceRange === idx;
                        return (
                            <Box
                                key={idx}
                                onClick={() => { setSelectedPriceRange(idx); setCurrentPage(1); }}
                                sx={{
                                    px: 1.4, py: 0.55,
                                    borderRadius: '20px',
                                    border: `1.5px solid ${active ? '#1a6ef5' : '#c7d2fe'}`,
                                    bgcolor: active ? '#1a6ef5' : '#eef2ff',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    transition: 'all 0.15s',
                                    userSelect: 'none',
                                }}
                            >
                                <Typography sx={{
                                    fontSize: 12.5, fontWeight: active ? 700 : 500,
                                    color: active ? '#fff' : '#1a6ef5'
                                }}>
                                    {pr.label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {/* ── Results Count + Sort ── */}
            <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {houses.length > 0 ? `${houses.length}+ Rental Homes Found` : 'No homes found'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <Typography sx={{ fontSize: 13, color: '#6b7280' }}>Sort by:</Typography>
                    <Typography sx={{ fontSize: 13, color: '#1a6ef5', fontWeight: 600 }}>Relevance</Typography>
                    <SortIcon sx={{ fontSize: 16, color: '#1a6ef5' }} />
                </Box>
            </Box>

            {error && (
                <Box sx={{ px: 2, mb: 1 }}>
                    <Alert severity="warning" onClose={() => setError('')} sx={{ borderRadius: 2, fontSize: 13 }}>
                        {error}
                    </Alert>
                </Box>
            )}

            {/* ── Houses Grid ── */}
            <Box sx={{ px: 1.5 }}>
                <Grid container spacing={1.5}>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Grid item xs={12} key={i}>
                                <HouseSkeleton />
                            </Grid>
                        ))
                    ) : houses.length === 0 ? (
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <HomeIcon sx={{ fontSize: 56, color: '#d0d0d0', mb: 1.5 }} />
                                <Typography sx={{ fontWeight: 600, color: '#555', mb: 0.5 }}>No houses found</Typography>
                                <Typography sx={{ fontSize: 13, color: '#999', mb: 2 }}>
                                    Try adjusting your filters or search term
                                </Typography>
                                <Button variant="contained" onClick={clearFilters}
                                    sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#325fec' }}>
                                    Clear Filters
                                </Button>
                            </Box>
                        </Grid>
                    ) : (
                        houses.map((house) => {
                            const verification = getVerificationBadge(house.is_verified);
                            const tenantBadge = getTenantBadge(house.tenant_type);
                            return (
                                <Grid item xs={12} key={house.id}>
                                    <Card
                                        onClick={() => handleHouseClick(house)}
                                        sx={{
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            boxShadow: 'none',
                                            border: '1px solid #f0f0f0',
                                            cursor: 'pointer',
                                            transition: 'box-shadow 0.2s',
                                            '&:active': { boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }
                                        }}
                                    >
                                        {/* Image */}
                                        <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                                            {house.house_image_base64 ? (
                                                <img
                                                    src={`data:image/jpeg;base64,${house.house_image_base64}`}
                                                    alt={house.title || `${house.rooms} BHK`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                />
                                            ) : (
                                                <Box sx={{ width: '100%', height: '100%', bgcolor: '#f0f3f8',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <HomeIcon sx={{ fontSize: 48, color: '#c0c8d8' }} />
                                                </Box>
                                            )}

                                            {/* Bottom overlay: type badge + distance */}
                                            <Box sx={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                                                px: 1.2, pb: 1,
                                            }}>
                                                {tenantBadge && (
                                                    <Box sx={{
                                                        display: 'flex', alignItems: 'center', gap: 0.4,
                                                        px: 1.2, py: 0.4,
                                                        borderRadius: '8px',
                                                        bgcolor: tenantBadge.bg,
                                                        border: `1px solid ${tenantBadge.color}33`
                                                    }}>
                                                        <tenantBadge.Icon sx={{ fontSize: 12, color: tenantBadge.color }} />
                                                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: tenantBadge.color }}>
                                                            {tenantBadge.label}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {house.distance && (
                                                    <Box sx={{
                                                        display: 'flex', alignItems: 'center', gap: 0.3,
                                                        px: 1, py: 0.4,
                                                        borderRadius: '8px',
                                                        bgcolor: 'rgba(255,255,255,0.92)',
                                                        ml: 'auto'
                                                    }}>
                                                        <LocationIcon sx={{ fontSize: 12, color: '#325fec', flexShrink: 0 }} />
                                                        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#555' }}>
                                                            {house.distance.toFixed(2)} km away
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Card Content */}
                                        <CardContent sx={{ p: '12px 14px 14px', '&:last-child': { pb: '14px' } }}>
                                            {/* Price */}
                                            <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#325fec', lineHeight: 1.2 }}>
                                                ₹{(house.rent_per_month || 0).toLocaleString('en-IN')}
                                                <Typography component="span" sx={{ fontWeight: 400, fontSize: 12, color: '#6b7280' }}>
                                                    {' '}/month
                                                </Typography>
                                            </Typography>

                                            {/* Title */}
                                            <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#111827', mt: 0.4, lineHeight: 1.3,
                                                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                {house.title || `${house.rooms} BHK House`}
                                            </Typography>

                                            {/* Location */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.4, mb: 0.6 }}>
                                                <LocationIcon sx={{ fontSize: 12, color: '#325fec', flexShrink: 0 }} />
                                                <Typography sx={{ fontSize: 12, color: '#6b7280', fontWeight: 500,
                                                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                    {house.area}, {house.city}
                                                </Typography>
                                            </Box>

                                            {/* Specs Row */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5, flexWrap: 'nowrap', overflow: 'hidden' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                                    <BedIcon sx={{ fontSize: 13, color: '#6b7280' }} />
                                                    <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{house.rooms} Bed</Typography>
                                                </Box>
                                                <Typography sx={{ fontSize: 11, color: '#d1d5db' }}>·</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                                    <BathtubIcon sx={{ fontSize: 13, color: '#6b7280' }} />
                                                    <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{house.bathrooms || 1} Bath</Typography>
                                                </Box>
                                                {house.area_sqft && (
                                                    <>
                                                        <Typography sx={{ fontSize: 11, color: '#d1d5db' }}>·</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                                            <SqftIcon sx={{ fontSize: 13, color: '#6b7280' }} />
                                                            <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{house.area_sqft} sq.ft</Typography>
                                                        </Box>
                                                    </>
                                                )}
                                            </Box>

                                            {/* Call Button */}
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                startIcon={<PhoneIcon sx={{ fontSize: 14 }} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCallOwner(house.phone || house.owner_phone);
                                                }}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: '10px',
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: '#325fec',
                                                    borderColor: '#d0daf5',
                                                    py: 0.7,
                                                    bgcolor: '#e8f0fe',
                                                    '&:hover': { bgcolor: '#c7d9fd', borderColor: '#325fec' }
                                                }}
                                            >
                                                Call
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })
                    )}
                </Grid>
            </Box>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, val) => setCurrentPage(val)}
                        color="primary"
                        size="small"
                        sx={{ '& .MuiPaginationItem-root': { borderRadius: 2 } }}
                    />
                </Box>
            )}

            {/* ── Filter Drawer ── */}
            <Drawer
                anchor="right"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                PaperProps={{ sx: { width: isMobile ? '88%' : 320, borderRadius: '16px 0 0 16px' } }}
            >
                <FilterContent />
            </Drawer>

            {/* ── House Detail Drawer ── */}
            <Drawer
                anchor="bottom"
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                PaperProps={{ sx: { borderRadius: '20px 20px 0 0', maxHeight: '92vh' } }}
            >
                {loadingDetails ? (
                    <Box sx={{ p: 3 }}>
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                        <Skeleton variant="text" height={40} sx={{ mt: 2 }} />
                        <Skeleton variant="text" height={20} />
                        <Skeleton variant="text" height={20} />
                        <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 2 }} />
                    </Box>
                ) : selectedHouse && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Drag Handle */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
                            <Box sx={{ width: 40, height: 4, bgcolor: '#e0e0e0', borderRadius: 2 }} />
                        </Box>

                        {/* Image */}
                        <Box sx={{ position: 'relative', mx: 2, borderRadius: '14px', overflow: 'hidden', mb: 2 }}>
                            {selectedHouse.house_image_base64 ? (
                                <img
                                    src={`data:image/jpeg;base64,${selectedHouse.house_image_base64}`}
                                    alt={selectedHouse.title}
                                    style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
                                />
                            ) : (
                                <Box sx={{ height: 220, bgcolor: '#f0f3f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HomeIcon sx={{ fontSize: 64, color: '#c0c8d8' }} />
                                </Box>
                            )}
                            <IconButton
                                onClick={() => setDetailsOpen(false)}
                                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', width: 32, height: 32,
                                    '&:hover': { bgcolor: 'white' } }}>
                                <CloseIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <Box sx={{ position: 'absolute', bottom: 10, left: 10 }}>
                                <Chip
                                    label={selectedHouse.is_verified ? 'Verified Property' : 'Not Verified'}
                                    icon={selectedHouse.is_verified ? <VerifiedIcon sx={{ fontSize: 14 }} /> : <PendingIcon sx={{ fontSize: 14 }} />}
                                    size="small"
                                    sx={{
                                        bgcolor: selectedHouse.is_verified ? '#16a34a' : '#d97706',
                                        color: 'white', fontWeight: 700, fontSize: 11,
                                        '& .MuiChip-icon': { color: 'white' }
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Scrollable content */}
                        <Box sx={{ px: 2, flex: 1, overflowY: 'auto', pb: 3 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: 20, color: '#111', mb: 0.5 }}>
                                {selectedHouse.title || `${selectedHouse.rooms} BHK House`}
                            </Typography>
                            <Typography sx={{ fontWeight: 800, fontSize: 24, color: '#325fec', mb: 0.5 }}>
                                {formatPrice(selectedHouse.rent_per_month)}
                                <Typography component="span" sx={{ fontSize: 14, fontWeight: 400, color: '#888' }}> /month</Typography>
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                                <LocationIcon sx={{ fontSize: 14, color: '#888' }} />
                                <Typography sx={{ fontSize: 13, color: '#888' }}>
                                    {selectedHouse.area}, {selectedHouse.city}, {selectedHouse.state}
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {/* Property Details Grid */}
                            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5 }}>Property Details</Typography>
                            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                {[
                                    { icon: <BedIcon sx={{ fontSize: 18, color: '#325fec' }} />, label: `${selectedHouse.rooms} Bedrooms`, bg: '#eaf3ff' },
                                    { icon: <BathtubIcon sx={{ fontSize: 18, color: '#3bbf7e' }} />, label: `${selectedHouse.bathrooms || 1} Bathrooms`, bg: '#e8faf2' },
                                    { icon: <KitchenIcon sx={{ fontSize: 18, color: '#f06292' }} />, label: `${selectedHouse.kitchens || 1} Kitchen`, bg: '#fce4ec' },
                                    { icon: <HomeIcon sx={{ fontSize: 18, color: '#fb923c' }} />, label: `Floor ${selectedHouse.floor || 'G'}`, bg: '#fff7ed' },
                                ].map((item, i) => (
                                    <Grid item xs={6} key={i}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.2,
                                            borderRadius: '10px', bgcolor: item.bg }}>
                                            {item.icon}
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#333' }}>
                                                {item.label}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>

                            <Typography variant="body2" sx={{ mb: 0.8 }}>
                                <strong>Furnishing:</strong>{' '}
                                {selectedHouse.furnished === 'furnished' ? 'Fully Furnished'
                                    : selectedHouse.furnished === 'semi-furnished' ? 'Semi Furnished' : 'Unfurnished'}
                            </Typography>
                            {selectedHouse.deposit_amount && (
                                <Typography variant="body2" sx={{ mb: 0.8 }}>
                                    <strong>Deposit:</strong> {formatPrice(selectedHouse.deposit_amount)}
                                </Typography>
                            )}
                            {selectedHouse.maintenance_amount && (
                                <Typography variant="body2" sx={{ mb: 1.5 }}>
                                    <strong>Maintenance:</strong> {formatPrice(selectedHouse.maintenance_amount)}/month
                                </Typography>
                            )}
                            {selectedHouse.distance && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                                    <LocationIcon sx={{ fontSize: 15, color: '#888' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedHouse.distance.toFixed(1)} km from your location
                                    </Typography>
                                </Box>
                            )}

                            {selectedHouse.description && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>Description</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        {selectedHouse.description}
                                    </Typography>
                                </>
                            )}

                            <Divider sx={{ my: 2 }} />

                            {/* Contact */}
                            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>Contact</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <PhoneIcon sx={{ fontSize: 16, color: '#888' }} />
                                <Typography variant="body2">
                                    {selectedHouse.phone || selectedHouse.owner_phone || 'Not available'}
                                </Typography>
                            </Box>

                            {/* CTA Buttons */}
                            <Stack direction="row" spacing={1.5}>
                                <Button
                                    fullWidth variant="contained"
                                    startIcon={<DirectionsIcon />}
                                    onClick={() => handleGetDirections(selectedHouse)}
                                    sx={{
                                        textTransform: 'none', borderRadius: '12px',
                                        fontWeight: 700, py: 1.2,
                                        bgcolor: '#325fec',
                                        '&:hover': { bgcolor: '#2349cc' }
                                    }}
                                >
                                    Directions
                                </Button>
                                <Button
                                    fullWidth variant="outlined"
                                    startIcon={<PhoneIcon />}
                                    onClick={() => handleCallOwner(selectedHouse.phone || selectedHouse.owner_phone)}
                                    sx={{
                                        textTransform: 'none', borderRadius: '12px',
                                        fontWeight: 700, py: 1.2,
                                        color: '#325fec', borderColor: '#325fec',
                                        '&:hover': { bgcolor: '#eaf0ff' }
                                    }}
                                >
                                    Call Owner
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
}