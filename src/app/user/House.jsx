// app/user/Houses.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
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
    Rating
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
    AttachMoney as MoneyIcon,
    Clear as ClearIcon,
    Verified as VerifiedIcon,
    Pending as PendingIcon
} from '@mui/icons-material';
import { getHousesByLocation, getHouseById, getHouseFilterOptions } from '../../services/house';
import { useNavigate } from 'react-router-dom';

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
    
    // Selected house for details
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        getCurrentLocation();
        loadFilterOptions();
    }, []);

    useEffect(() => {
        if (userLocation) {
            loadHouses();
        }
    }, [userLocation, radius, rentRange, rooms, furnished, searchTerm, currentPage]);

    const getCurrentLocation = () => {
        setGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setGettingLocation(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setError('Unable to get your location. Please enable location access.');
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
        try {
            const result = await getHousesByLocation({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                radius,
                minRent: rentRange[0],
                maxRent: rentRange[1],
                rooms,
                furnished,
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
        setCurrentPage(1);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    // Helper function to get verification badge
    const getVerificationBadge = (isVerified) => {
        if (isVerified) {
            return {
                label: 'Verified',
                icon: <VerifiedIcon sx={{ fontSize: 12 }} />,
                color: '#16a34a',
                bgColor: '#dcfce7'
            };
        }
        return {
            label: 'Not Verified',
            icon: <PendingIcon sx={{ fontSize: 12 }} />,
            color: '#d97706',
            bgColor: '#fef3c7'
        };
    };

    const HouseSkeleton = () => (
        <Card sx={{ borderRadius: 2, height: '100%' }}>
            <Skeleton variant="rectangular" height={180} />
            <CardContent>
                <Skeleton variant="text" width="80%" height={28} />
                <Skeleton variant="text" width="60%" />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={60} height={24} />
                </Box>
                <Skeleton variant="text" width="40%" sx={{ mt: 1 }} />
            </CardContent>
        </Card>
    );

    const FilterContent = () => (
        <Box sx={{ p: 2, width: isMobile ? '100%' : 320 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>
                    Filters
                </Typography>
                <IconButton onClick={() => setFilterDrawerOpen(false)}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
                Distance Radius (km)
            </Typography>
            <Slider
                value={radius}
                onChange={(e, val) => setRadius(val)}
                min={1}
                max={50}
                valueLabelDisplay="auto"
                sx={{ mb: 3 }}
            />
            
            <Typography variant="subtitle2" gutterBottom>
                Rent Range (₹ per month)
            </Typography>
            <Slider
                value={rentRange}
                onChange={(e, val) => setRentRange(val)}
                min={filterOptions.min_rent}
                max={filterOptions.max_rent}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
                sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="caption">₹{rentRange[0].toLocaleString()}</Typography>
                <Typography variant="caption">₹{rentRange[1].toLocaleString()}</Typography>
            </Box>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Minimum Rooms</InputLabel>
                <Select
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    label="Minimum Rooms"
                >
                    <MenuItem value={0}>Any</MenuItem>
                    {filterOptions.rooms?.map((r) => (
                        <MenuItem key={r} value={r}>{r} BHK</MenuItem>
                    ))}
                </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Furnishing Status</InputLabel>
                <Select
                    value={furnished}
                    onChange={(e) => setFurnished(e.target.value)}
                    label="Furnishing Status"
                >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="furnished">Fully Furnished</MenuItem>
                    <MenuItem value="semi-furnished">Semi Furnished</MenuItem>
                    <MenuItem value="unfurnished">Unfurnished</MenuItem>
                </Select>
            </FormControl>
            
            <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                sx={{ mb: 2 }}
            >
                Clear All Filters
            </Button>
        </Box>
    );

    if (gettingLocation) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress sx={{ color: '#325fec' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 700, mb: 1 }}>
                    Houses for Rent Near You
                </Typography>
                {userLocation && (
                    <Typography variant="body2" color="#5a6e8a">
                        Showing houses within {radius} km radius
                    </Typography>
                )}
            </Box>

            {/* Search and Filter Bar */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e8ecef', boxShadow: 'none' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Search by title, area, city or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#9ca3af' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={() => setCurrentPage(1)}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                            Search
                        </Button>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={() => setFilterDrawerOpen(true)}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                            Filters
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Results Count */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body2" color="#5a6e8a">
                    Found {houses.length} houses
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
            </Box>

            {/* Houses Grid */}
            <Grid container spacing={3}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                            <HouseSkeleton />
                        </Grid>
                    ))
                ) : houses.length === 0 ? (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                            <HomeIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                No houses found
                            </Typography>
                            <Typography variant="body2" color="#5a6e8a">
                                Try adjusting your filters or search term
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={clearFilters}
                                sx={{ mt: 2, textTransform: 'none', borderRadius: 2 }}
                            >
                                Clear Filters
                            </Button>
                        </Paper>
                    </Grid>
                ) : (
                    houses.map((house) => {
                        const verification = getVerificationBadge(house.is_verified);
                        return (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={house.id}>
                                <Card 
                                    sx={{ 
                                        borderRadius: 2, 
                                        border: '1px solid #e8ecef', 
                                        boxShadow: 'none',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                    onClick={() => handleHouseClick(house)}
                                >
                                    {house.house_image_base64 ? (
                                        <Box sx={{ height: 160, overflow: 'hidden' }}>
                                            <img 
                                                src={`data:image/jpeg;base64,${house.house_image_base64}`}
                                                alt={house.title || `${house.rooms} BHK House`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </Box>
                                    ) : (
                                        <Box sx={{ height: 160, bgcolor: '#f0f3f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <HomeIcon sx={{ fontSize: 48, color: '#9ca3af' }} />
                                        </Box>
                                    )}
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                            <Typography variant="h6" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>
                                                {house.title || `${house.rooms} BHK House`}
                                            </Typography>
                                            <Chip 
                                                label={verification.label}
                                                icon={verification.icon}
                                                size="small"
                                                sx={{ 
                                                    borderRadius: 1, 
                                                    bgcolor: verification.bgColor, 
                                                    color: verification.color,
                                                    height: 22,
                                                    '& .MuiChip-label': { fontSize: '0.65rem', fontWeight: 600 }
                                                }}
                                            />
                                        </Box>
                                        
                                        <Typography variant="h6" sx={{ color: '#325fec', fontWeight: 700, mb: 1 }}>
                                            {formatPrice(house.rent_per_month)}<span style={{ fontSize: '0.75rem', fontWeight: 400 }}>/month</span>
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                            <Chip 
                                                icon={<BedIcon sx={{ fontSize: 14 }} />} 
                                                label={`${house.rooms} BHK`} 
                                                size="small" 
                                                sx={{ borderRadius: 1 }}
                                            />
                                            <Chip 
                                                icon={<BathtubIcon sx={{ fontSize: 14 }} />} 
                                                label={`${house.bathrooms || 1} Bath`} 
                                                size="small" 
                                                sx={{ borderRadius: 1 }}
                                            />
                                            {house.furnished && (
                                                <Chip 
                                                    label={house.furnished === 'furnished' ? 'Fully Furnished' : house.furnished === 'semi-furnished' ? 'Semi Furnished' : 'Unfurnished'} 
                                                    size="small" 
                                                    sx={{ borderRadius: 1 }}
                                                />
                                            )}
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                            <LocationIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                                            <Typography variant="caption" color="#5a6e8a">
                                                {house.area}, {house.city}
                                            </Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            {house.distance && (
                                                <Chip 
                                                    label={`${house.distance.toFixed(1)} km away`} 
                                                    size="small" 
                                                    sx={{ borderRadius: 1, bgcolor: '#e8f0fe', color: '#325fec' }}
                                                />
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })
                )}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(e, val) => setCurrentPage(val)}
                        color="primary"
                        sx={{ '& .MuiPaginationItem-root': { borderRadius: 2 } }}
                    />
                </Box>
            )}

            {/* Filter Drawer */}
            <Drawer
                anchor="right"
                open={filterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                PaperProps={{ sx: { width: isMobile ? '100%' : 320, borderRadius: { xs: 0, md: '16px 0 0 16px' } } }}
            >
                <FilterContent />
            </Drawer>

            {/* House Details Drawer */}
            <Drawer
                anchor="right"
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                PaperProps={{ sx: { width: isMobile ? '100%' : 500, borderRadius: { xs: 0, md: '16px 0 0 16px' } } }}
            >
                {loadingDetails ? (
                    <Box sx={{ p: 3 }}>
                        <Skeleton variant="rectangular" height={200} />
                        <Skeleton variant="text" height={40} sx={{ mt: 2 }} />
                        <Skeleton variant="text" height={20} />
                        <Skeleton variant="text" height={20} />
                        <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
                    </Box>
                ) : selectedHouse && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Header with image and verification badge */}
                        <Box sx={{ position: 'relative' }}>
                            {selectedHouse.house_image_base64 ? (
                                <img 
                                    src={`data:image/jpeg;base64,${selectedHouse.house_image_base64}`}
                                    alt={selectedHouse.title || `${selectedHouse.rooms} BHK House`}
                                    style={{ width: '100%', height: 220, objectFit: 'cover' }}
                                />
                            ) : (
                                <Box sx={{ height: 220, bgcolor: '#f0f3f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HomeIcon sx={{ fontSize: 64, color: '#9ca3af' }} />
                                </Box>
                            )}
                            <IconButton
                                onClick={() => setDetailsOpen(false)}
                                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' } }}
                            >
                                <CloseIcon />
                            </IconButton>
                            <Box sx={{ position: 'absolute', bottom: 8, left: 8 }}>
                                <Chip 
                                    label={selectedHouse.is_verified ? 'Verified Property' : 'Not Verified'}
                                    icon={selectedHouse.is_verified ? <VerifiedIcon /> : <PendingIcon />}
                                    sx={{ 
                                        bgcolor: selectedHouse.is_verified ? '#16a34a' : '#d97706', 
                                        color: 'white',
                                        fontWeight: 600,
                                        '& .MuiChip-icon': { color: 'white' }
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Content */}
                        <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
                            <Typography variant="h5" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 700, mb: 1 }}>
                                {selectedHouse.title || `${selectedHouse.rooms} BHK House`}
                            </Typography>
                            
                            <Typography variant="h4" sx={{ color: '#325fec', fontWeight: 700, mb: 2 }}>
                                {formatPrice(selectedHouse.rent_per_month)}<span style={{ fontSize: '1rem', fontWeight: 400 }}>/month</span>
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Property Details */}
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Property Details
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BedIcon sx={{ fontSize: 18, color: '#5a6e8a' }} />
                                        <Typography variant="body2">{selectedHouse.rooms} Bedrooms</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BathtubIcon sx={{ fontSize: 18, color: '#5a6e8a' }} />
                                        <Typography variant="body2">{selectedHouse.bathrooms || 1} Bathrooms</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <KitchenIcon sx={{ fontSize: 18, color: '#5a6e8a' }} />
                                        <Typography variant="body2">{selectedHouse.kitchens} Kitchens</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <HomeIcon sx={{ fontSize: 18, color: '#5a6e8a' }} />
                                        <Typography variant="body2">Floor: {selectedHouse.floor}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                            
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Furnishing:</strong> {
                                    selectedHouse.furnished === 'furnished' ? 'Fully Furnished' : 
                                    selectedHouse.furnished === 'semi-furnished' ? 'Semi Furnished' : 'Unfurnished'
                                }
                            </Typography>
                            
                            {selectedHouse.description && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        Description
                                    </Typography>
                                    <Typography variant="body2" color="#5a6e8a" sx={{ mb: 2 }}>
                                        {selectedHouse.description}
                                    </Typography>
                                </>
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Contact Info */}
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Contact Information
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PhoneIcon sx={{ fontSize: 18, color: '#5a6e8a' }} />
                                <Typography variant="body2">
                                    {selectedHouse.phone || selectedHouse.owner_phone || 'Not available'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <LocationIcon sx={{ fontSize: 18, color: '#5a6e8a' }} />
                                <Typography variant="body2">
                                    {selectedHouse.area}, {selectedHouse.city}, {selectedHouse.state}
                                </Typography>
                            </Box>
                            
                            {/* Distance */}
                            {selectedHouse.distance && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="#5a6e8a">
                                        Distance from you: {selectedHouse.distance.toFixed(1)} km
                                    </Typography>
                                </Box>
                            )}
                            
                            {selectedHouse.deposit_amount && (
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Deposit:</strong> {formatPrice(selectedHouse.deposit_amount)}
                                </Typography>
                            )}
                            
                            {selectedHouse.maintenance_amount && (
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    <strong>Maintenance:</strong> {formatPrice(selectedHouse.maintenance_amount)}/month
                                </Typography>
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Action Buttons */}
                            <Stack direction="row" spacing={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<DirectionsIcon />}
                                    onClick={() => handleGetDirections(selectedHouse)}
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    Get Directions
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<PhoneIcon />}
                                    onClick={() => handleCallOwner(selectedHouse.phone || selectedHouse.owner_phone)}
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    Call Owner
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Container>
    );
}