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
    Avatar
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
    Star as StarIcon
} from '@mui/icons-material';
import { getShopsByLocation, getShopById, getShopCategoriesWithCount } from '../../services/shops';
import { useNavigate } from 'react-router-dom';

export default function Shops() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [loading, setLoading] = useState(true);
    const [shops, setShops] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(true);
    
    // Filters
    const [radius, setRadius] = useState(10);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    
    // Selected shop for details
    const [selectedShop, setSelectedShop] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    useEffect(() => {
        if (userLocation) {
            loadShops();
            loadCategories();
        }
    }, [userLocation, radius, selectedCategory, searchTerm, currentPage]);

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
                limit: 12
            });
            
            setShops(result.shops || []);
            setTotalPages(result.totalPages || 1);
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
        } catch (err) {
            console.error('Error loading categories:', err);
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
        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${shop.latitude},${shop.longitude}`;
        window.open(url, '_blank');
    };

    const handleCallShop = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    const clearFilters = () => {
        setRadius(10);
        setSelectedCategory('');
        setSearchTerm('');
        setCurrentPage(1);
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

    const ShopSkeleton = () => (
        <Card sx={{ borderRadius: 2, height: '100%' }}>
            <Skeleton variant="rectangular" height={180} />
            <CardContent>
                <Skeleton variant="text" width="80%" height={28} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Box sx={{ mt: 2 }}>
                    <Skeleton variant="rectangular" width={80} height={24} />
                </Box>
            </CardContent>
        </Card>
    );

    const FilterContent = () => (
        <Box sx={{ p: 2, width: isMobile ? '100%' : 300 }}>
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
            
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Category"
                >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat) => (
                        <MenuItem key={cat.category} value={cat.category}>
                            {cat.category} ({cat.count})
                        </MenuItem>
                    ))}
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
                    Shops Near You
                </Typography>
                {userLocation && (
                    <Typography variant="body2" color="#5a6e8a">
                        Showing shops within {radius} km radius
                    </Typography>
                )}
            </Box>

            {/* Search and Filter Bar */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e8ecef', boxShadow: 'none' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Search shops by name or items..."
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
                    Found {shops.length} shops
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
            </Box>

            {/* Shops Grid */}
            <Grid container spacing={3}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                            <ShopSkeleton />
                        </Grid>
                    ))
                ) : shops.length === 0 ? (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                            <StoreIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                No shops found
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
                    shops.map((shop) => {
                        const verification = getVerificationBadge(shop.is_verified);
                        return (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={shop.id}>
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
                                    onClick={() => handleShopClick(shop)}
                                >
                                    {shop.shop_image_base64 ? (
                                        <CardMedia
                                            component="img"
                                            height="160"
                                            image={`data:image/jpeg;base64,${shop.shop_image_base64}`}
                                            alt={shop.business_name}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Box sx={{ height: 160, bgcolor: '#f0f3f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <StoreIcon sx={{ fontSize: 48, color: '#9ca3af' }} />
                                        </Box>
                                    )}
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                            <Typography variant="h6" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>
                                                {shop.business_name}
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
                                        
                                        <Typography variant="body2" color="#5a6e8a" sx={{ mb: 0.5 }}>
                                            {shop.category}
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                            <LocationIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                                            <Typography variant="caption" color="#5a6e8a">
                                                {shop.area}, {shop.city}
                                            </Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            {shop.distance && (
                                                <Chip 
                                                    label={`${shop.distance.toFixed(1)} km`} 
                                                    size="small" 
                                                    sx={{ borderRadius: 1, bgcolor: '#e8f0fe', color: '#325fec', height: 22 }}
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

            {/* Shop Details Drawer */}
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
                ) : selectedShop && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Header with image and verification badge */}
                        <Box sx={{ position: 'relative' }}>
                            {selectedShop.shop_image_base64 ? (
                                <img 
                                    src={`data:image/jpeg;base64,${selectedShop.shop_image_base64}`}
                                    alt={selectedShop.business_name}
                                    style={{ width: '100%', height: 220, objectFit: 'cover' }}
                                />
                            ) : (
                                <Box sx={{ height: 220, bgcolor: '#f0f3f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <StoreIcon sx={{ fontSize: 64, color: '#9ca3af' }} />
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
                                    label={selectedShop.is_verified ? 'Verified Shop' : 'Not Verified'}
                                    icon={selectedShop.is_verified ? <VerifiedIcon /> : <PendingIcon />}
                                    sx={{ 
                                        bgcolor: selectedShop.is_verified ? '#16a34a' : '#d97706', 
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
                                {selectedShop.business_name}
                            </Typography>
                            
                            <Chip 
                                label={selectedShop.category} 
                                size="small" 
                                sx={{ mb: 2, bgcolor: '#e8f0fe', color: '#325fec', borderRadius: 1 }}
                            />
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Key Items */}
                            {selectedShop.keywords && selectedShop.keywords.length > 0 && (
                                <>
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        Key Items Available
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        {selectedShop.keywords.map((item, idx) => (
                                            <Chip key={idx} label={item} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                </>
                            )}
                            
                            {/* Contact Info */}
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Contact Information
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PhoneIcon sx={{ fontSize: 18, color: '#5a6e8a' }} />
                                <Typography variant="body2">
                                    {selectedShop.additional_phone || selectedShop.owner_phone || 'Not available'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <LocationIcon sx={{ fontSize: 18, color: '#5a6e8a' }} />
                                <Typography variant="body2">
                                    {selectedShop.area}, {selectedShop.city}, {selectedShop.state}
                                </Typography>
                            </Box>
                            
                            {/* Distance */}
                            {selectedShop.distance && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="#5a6e8a">
                                        Distance from you: {selectedShop.distance.toFixed(1)} km
                                    </Typography>
                                </Box>
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Action Buttons */}
                            <Stack direction="row" spacing={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<DirectionsIcon />}
                                    onClick={() => handleGetDirections(selectedShop)}
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    Get Directions
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<PhoneIcon />}
                                    onClick={() => handleCallShop(selectedShop.additional_phone || selectedShop.owner_phone)}
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    Call Shop
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Container>
    );
}