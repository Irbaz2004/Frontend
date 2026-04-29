// app/admin/VerifyHouses.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Snackbar,
    InputAdornment,
    Tooltip,
    Card,
    CardContent,
    Grid,
    Avatar,
    Checkbox,
    Stack,
    Slider
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Verified as VerifiedIcon,
    Pending as PendingIcon,
    Home as HomeIcon,
    LocationOn as LocationOnIcon,
    Phone as PhoneIcon,
    Close as CloseIcon,
    Bed as BedIcon,
    Bathtub as BathtubIcon,
    Kitchen as KitchenIcon,
    AttachMoney as MoneyIcon
} from '@mui/icons-material';
import {
    getAllHouses,
    verifyHouse,
    deleteHouse,
    getHouseStatistics,
    bulkVerifyHouses,
    getHouseCitiesList
} from '../../services/adminHouse';

export default function VerifyHouses() {
    const [loading, setLoading] = useState(false);
    const [houses, setHouses] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('');
    const [cities, setCities] = useState([]);
    const [rentRange, setRentRange] = useState([0, 100000]);
    const [stats, setStats] = useState(null);
    const [selectedHouses, setSelectedHouses] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [houseToDelete, setHouseToDelete] = useState(null);

    useEffect(() => {
        loadHouses();
        loadStats();
        loadCities();
    }, [page, rowsPerPage, statusFilter, cityFilter, rentRange]);

    const loadHouses = async () => {
        setLoading(true);
        try {
            const result = await getAllHouses({
                page: page + 1,
                limit: rowsPerPage,
                search,
                status: statusFilter,
                city: cityFilter,
                minRent: rentRange[0],
                maxRent: rentRange[1]
            });
            setHouses(result.houses || []);
            setTotal(result.total || 0);
        } catch (error) {
            showSnackbar('Failed to load houses', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const result = await getHouseStatistics();
            setStats(result.stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const loadCities = async () => {
        try {
            const result = await getHouseCitiesList();
            setCities(result.cities || []);
        } catch (error) {
            console.error('Failed to load cities:', error);
        }
    };

    const handleSearch = () => {
        setPage(0);
        loadHouses();
    };

    const handleVerify = async (id, isVerified) => {
        try {
            await verifyHouse(id, !isVerified);
            showSnackbar(`House ${!isVerified ? 'verified' : 'unverified'} successfully`);
            loadHouses();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleDelete = async () => {
        if (!houseToDelete) return;
        
        try {
            await deleteHouse(houseToDelete.id);
            showSnackbar('House deleted successfully');
            setOpenDeleteDialog(false);
            setHouseToDelete(null);
            loadHouses();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleBulkVerify = async () => {
        if (selectedHouses.length === 0) {
            showSnackbar('No houses selected', 'warning');
            return;
        }

        try {
            await bulkVerifyHouses(selectedHouses, true);
            showSnackbar(`${selectedHouses.length} houses verified successfully`);
            setSelectedHouses([]);
            loadHouses();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedHouses(houses.map(house => house.id));
        } else {
            setSelectedHouses([]);
        }
    };

    const handleSelectHouse = (event, id) => {
        if (event.target.checked) {
            setSelectedHouses([...selectedHouses, id]);
        } else {
            setSelectedHouses(selectedHouses.filter(houseId => houseId !== id));
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    const StatCard = ({ title, value, icon, color }) => (
        <Card sx={{ borderRadius: 2, border: '1px solid #e8ecef', boxShadow: 'none', height: '100%' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="caption" color="#5a6e8a" sx={{ fontFamily: '"Inter", sans-serif' }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: '"Alumni Sans", sans-serif', color: '#020402' }}>
                            {value || 0}
                        </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: `${color}10`, color: color }}>
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );

    const getStatusChip = (isVerified) => {
        if (isVerified) {
            return (
                <Chip
                    label="Verified"
                    size="small"
                    icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                    sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 600, borderRadius: 1 }}
                />
            );
        }
        return (
            <Chip
                label="Pending"
                size="small"
                icon={<PendingIcon sx={{ fontSize: 14 }} />}
                sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 600, borderRadius: 1 }}
            />
        );
    };

    const getFurnishedLabel = (furnished) => {
        switch(furnished) {
            case 'furnished': return 'Fully Furnished';
            case 'semi-furnished': return 'Semi Furnished';
            default: return 'Unfurnished';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header */}
            <Typography variant="h4" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600, mb: 3 }}>
                Verify Houses
            </Typography>

            {/* Statistics Cards */}
            {stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <StatCard title="Total Houses" value={stats.total} icon={<HomeIcon />} color="#3b82f6" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard title="Verified Houses" value={stats.verified} icon={<VerifiedIcon />} color="#10b981" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard title="Pending Verification" value={stats.unverified} icon={<PendingIcon />} color="#f59e0b" />
                    </Grid>
                </Grid>
            )}

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, border: '1px solid #e8ecef', boxShadow: 'none', borderRadius: 2 }}>
                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    {selectedHouses.length > 0 && (
                        <Button
                            variant="contained"
                            startIcon={<CheckCircleIcon />}
                            onClick={handleBulkVerify}
                            sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                        >
                            Verify Selected ({selectedHouses.length})
                        </Button>
                    )}
                    
                    <TextField
                        placeholder="Search by title, owner, city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        sx={{ flex: 1, minWidth: 200 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#9ca3af' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="verified">Verified</MenuItem>
                            <MenuItem value="unverified">Pending</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>City</InputLabel>
                        <Select
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            label="City"
                        >
                            <MenuItem value="">All Cities</MenuItem>
                            {cities.map((city) => (
                                <MenuItem key={city} value={city}>{city}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <Box sx={{ minWidth: 200 }}>
                        <Typography variant="caption" color="#5a6e8a">Rent Range (₹)</Typography>
                        <Slider
                            value={rentRange}
                            onChange={(e, val) => setRentRange(val)}
                            min={0}
                            max={100000}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
                        />
                    </Box>
                    
                    <Button
                        variant="contained"
                        onClick={handleSearch}
                        startIcon={<SearchIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Search
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setSearch('');
                            setStatusFilter('all');
                            setCityFilter('');
                            setRentRange([0, 100000]);
                            setPage(0);
                            loadHouses();
                        }}
                        startIcon={<RefreshIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Reset
                    </Button>
                </Box>
            </Paper>

            {/* Houses Table */}
            <Paper sx={{ border: '1px solid #e8ecef', boxShadow: 'none', borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)', overflow: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox" sx={{ bgcolor: '#f8f9fa' }}>
                                    <Checkbox
                                        checked={selectedHouses.length === houses.length && houses.length > 0}
                                        indeterminate={selectedHouses.length > 0 && selectedHouses.length < houses.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>House Details</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Owner</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Location</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Rent</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Posted Date</TableCell>
                                <TableCell align="center" sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <CircularProgress sx={{ color: '#325fec' }} />
                                    </TableCell>
                                </TableRow>
                            ) : houses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <Typography color="#6b7280">No houses found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                houses.map((house) => (
                                    <TableRow key={house.id} hover>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedHouses.includes(house.id)}
                                                onChange={(e) => handleSelectHouse(e, house.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                {house.house_image_base64 ? (
                                                    <Avatar
                                                        src={`data:image/jpeg;base64,${house.house_image_base64}`}
                                                        variant="rounded"
                                                        sx={{ width: 48, height: 48 }}
                                                    />
                                                ) : (
                                                    <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: '#e8f0fe' }}>
                                                        <HomeIcon sx={{ color: '#325fec' }} />
                                                    </Avatar>
                                                )}
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {house.title || `${house.rooms} BHK House`}
                                                    </Typography>
                                                    <Typography variant="caption" color="#6b7280">
                                                        {house.rooms} Bed • {house.bathrooms || 1} Bath • {house.kitchens} Kitchen
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{house.owner_name}</Typography>
                                            <Typography variant="caption" color="#6b7280">
                                                {house.owner_phone}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{house.area}</Typography>
                                            <Typography variant="caption" color="#6b7280">
                                                {house.city}, {house.state}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600} color="#325fec">
                                                {formatPrice(house.rent_per_month)}/month
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{getStatusChip(house.is_verified)}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(house.created_at).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" gap={1} justifyContent="center">
                                                <Tooltip title="View Details">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => {
                                                            setSelectedHouse(house);
                                                            setOpenViewDialog(true);
                                                        }}
                                                        sx={{ color: '#325fec' }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={house.is_verified ? "Unverify" : "Verify"}>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleVerify(house.id, house.is_verified)}
                                                        sx={{ color: house.is_verified ? '#f59e0b' : '#10b981' }}
                                                    >
                                                        {house.is_verified ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => {
                                                            setHouseToDelete(house);
                                                            setOpenDeleteDialog(true);
                                                        }}
                                                        sx={{ color: '#ef4444' }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>

            {/* View House Dialog */}
            <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    House Details
                    <IconButton onClick={() => setOpenViewDialog(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedHouse && (
                        <Box>
                            {/* House Image */}
                            {selectedHouse.house_image_base64 && (
                                <Box sx={{ mb: 3, textAlign: 'center' }}>
                                    <img 
                                        src={`data:image/jpeg;base64,${selectedHouse.house_image_base64}`}
                                        alt={selectedHouse.title || 'House'}
                                        style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, objectFit: 'cover' }}
                                    />
                                </Box>
                            )}
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="#6b7280">Title</Typography>
                                    <Typography variant="body1" fontWeight={600}>{selectedHouse.title || `${selectedHouse.rooms} BHK House`}</Typography>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="#6b7280">Property Details</Typography>
                                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                        <Chip icon={<BedIcon />} label={`${selectedHouse.rooms} Beds`} size="small" />
                                        <Chip icon={<BathtubIcon />} label={`${selectedHouse.bathrooms || 1} Baths`} size="small" />
                                        <Chip icon={<KitchenIcon />} label={`${selectedHouse.kitchens} Kitchens`} size="small" />
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="#6b7280">Furnishing</Typography>
                                    <Typography variant="body1">{getFurnishedLabel(selectedHouse.furnished)}</Typography>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="#6b7280">Floor</Typography>
                                    <Typography variant="body1">{selectedHouse.floor}</Typography>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="#6b7280">Status</Typography>
                                    <Box mt={0.5}>{getStatusChip(selectedHouse.is_verified)}</Box>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="#6b7280">Rent</Typography>
                                    <Typography variant="body1" fontWeight={600} color="#325fec">
                                        {formatPrice(selectedHouse.rent_per_month)}/month
                                    </Typography>
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="#6b7280">Deposit / Advance</Typography>
                                    <Typography variant="body1">
                                        {selectedHouse.deposit_amount ? formatPrice(selectedHouse.deposit_amount) : 'N/A'}
                                    </Typography>
                                </Grid>
                                
                                {selectedHouse.description && (
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="#6b7280">Description</Typography>
                                        <Typography variant="body2">{selectedHouse.description}</Typography>
                                    </Grid>
                                )}
                                
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="#6b7280">Location</Typography>
                                    <Typography variant="body1">{selectedHouse.area}, {selectedHouse.city}, {selectedHouse.state}</Typography>
                                    {selectedHouse.latitude && selectedHouse.longitude && (
                                        <Typography variant="caption" color="#6b7280">
                                            Lat: {selectedHouse.latitude}, Lng: {selectedHouse.longitude}
                                        </Typography>
                                    )}
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="#6b7280">Owner Information</Typography>
                                    <Typography variant="body1">{selectedHouse.owner_name}</Typography>
                                    <Typography variant="body2" color="#6b7280">{selectedHouse.owner_phone}</Typography>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="#6b7280">Posted Date</Typography>
                                    <Typography variant="body1">{new Date(selectedHouse.created_at).toLocaleString()}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
                    {selectedHouse && !selectedHouse.is_verified && (
                        <Button 
                            variant="contained" 
                            onClick={() => {
                                handleVerify(selectedHouse.id, selectedHouse.is_verified);
                                setOpenViewDialog(false);
                            }}
                            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                        >
                            Verify House
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{houseToDelete?.title || `${houseToDelete?.rooms} BHK House`}</strong>?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}