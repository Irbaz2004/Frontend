// app/admin/VerifyShops.jsx
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
    Stack
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
    Store as StoreIcon,
    Close as CloseIcon,
    Image as ImageIcon,
    Restore as RestoreIcon
} from '@mui/icons-material';
import {
    getAllShops,
    verifyShop,
    deleteShop,
    getShopStatistics,
    bulkVerifyShops,
    getShopCategoriesList,
    reactivateShop,
    hardDeleteShop
} from '../../services/adminShop';

export default function VerifyShops() {
    const [loading, setLoading] = useState(false);
    const [shops, setShops] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [verifiedFilter, setVerifiedFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedShops, setSelectedShops] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [selectedShop, setSelectedShop] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [shopToDelete, setShopToDelete] = useState(null);
    const [openReactivateDialog, setOpenReactivateDialog] = useState(false);
    const [shopToReactivate, setShopToReactivate] = useState(null);
    const [openHardDeleteDialog, setOpenHardDeleteDialog] = useState(false);
    const [shopToHardDelete, setShopToHardDelete] = useState(null);

    useEffect(() => {
        loadShops();
        loadStats();
        loadCategories();
    }, [page, rowsPerPage, verifiedFilter, statusFilter, categoryFilter]);

    const loadShops = async () => {
        setLoading(true);
        try {
            const result = await getAllShops({
                page: page + 1,
                limit: rowsPerPage,
                search,
                verified: verifiedFilter,
                status: statusFilter,
                category: categoryFilter
            });
            setShops(result.shops || []);
            setTotal(result.total || 0);
        } catch (error) {
            showSnackbar('Failed to load shops', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const result = await getShopStatistics();
            setStats(result.stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const loadCategories = async () => {
        try {
            const result = await getShopCategoriesList();
            setCategories(result.categories || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleSearch = () => {
        setPage(0);
        loadShops();
    };

    const handleVerify = async (id, isVerified) => {
        try {
            await verifyShop(id, !isVerified);
            showSnackbar(`Shop ${!isVerified ? 'verified' : 'unverified'} successfully`);
            loadShops();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleReactivate = async () => {
        if (!shopToReactivate) return;
        
        try {
            await reactivateShop(shopToReactivate.id);
            showSnackbar('Shop reactivated successfully');
            setOpenReactivateDialog(false);
            setShopToReactivate(null);
            loadShops();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleSoftDelete = async () => {
        if (!shopToDelete) return;
        
        try {
            await deleteShop(shopToDelete.id);
            showSnackbar('Shop deactivated successfully');
            setOpenDeleteDialog(false);
            setShopToDelete(null);
            loadShops();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleHardDelete = async () => {
        if (!shopToHardDelete) return;
        
        try {
            await hardDeleteShop(shopToHardDelete.id);
            showSnackbar('Shop permanently deleted');
            setOpenHardDeleteDialog(false);
            setShopToHardDelete(null);
            loadShops();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleBulkVerify = async () => {
        if (selectedShops.length === 0) {
            showSnackbar('No shops selected', 'warning');
            return;
        }

        try {
            await bulkVerifyShops(selectedShops, true);
            showSnackbar(`${selectedShops.length} shops verified successfully`);
            setSelectedShops([]);
            loadShops();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedShops(shops.map(shop => shop.id));
        } else {
            setSelectedShops([]);
        }
    };

    const handleSelectShop = (event, id) => {
        if (event.target.checked) {
            setSelectedShops([...selectedShops, id]);
        } else {
            setSelectedShops(selectedShops.filter(shopId => shopId !== id));
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
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

    const getActiveChip = (isActive) => {
        if (isActive) {
            return (
                <Chip
                    label="Active"
                    size="small"
                    icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                    sx={{ bgcolor: '#e0f2fe', color: '#0284c7', fontWeight: 600, borderRadius: 1 }}
                />
            );
        }
        return (
            <Chip
                label="Inactive"
                size="small"
                icon={<CancelIcon sx={{ fontSize: 14 }} />}
                sx={{ bgcolor: '#f3f4f6', color: '#6b7280', fontWeight: 600, borderRadius: 1 }}
            />
        );
    };

    const renderShopImage = (shop) => {
        if (shop.shop_image) {
            return (
                <Avatar
                    src={shop.shop_image}
                    variant="rounded"
                    sx={{ width: 48, height: 48 }}
                    imgProps={{ 
                        onError: (e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }
                    }}
                />
            );
        }
        return (
            <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: '#e8f0fe' }}>
                <StoreIcon sx={{ color: '#325fec' }} />
            </Avatar>
        );
    };

    const renderShopImageDialog = (shop) => {
        if (shop.shop_image) {
            return (
                <img 
                    src={shop.shop_image}
                    alt={shop.business_name}
                    style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, objectFit: 'cover' }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                    }}
                />
            );
        }
        return (
            <Box sx={{ 
                width: '100%', 
                height: 200, 
                bgcolor: '#f3f4f6', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 2
            }}>
                <ImageIcon sx={{ fontSize: 60, color: '#9ca3af' }} />
            </Box>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header */}
            <Typography variant="h4" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600, mb: 3 }}>
                Shop Management
            </Typography>

            {/* Statistics Cards */}
            {stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard title="Total Shops" value={stats.total} icon={<StoreIcon />} color="#3b82f6" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard title="Active" value={stats.active} icon={<CheckCircleIcon />} color="#10b981" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard title="Inactive" value={stats.inactive} icon={<CancelIcon />} color="#6b7280" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard title="Verified" value={stats.verified} icon={<VerifiedIcon />} color="#059669" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard title="Pending" value={stats.unverified} icon={<PendingIcon />} color="#f59e0b" />
                    </Grid>
                </Grid>
            )}

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, border: '1px solid #e8ecef', boxShadow: 'none', borderRadius: 2 }}>
                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    {selectedShops.length > 0 && (
                        <Button
                            variant="contained"
                            startIcon={<CheckCircleIcon />}
                            onClick={handleBulkVerify}
                            sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                        >
                            Verify Selected ({selectedShops.length})
                        </Button>
                    )}
                    
                    <TextField
                        placeholder="Search by shop name, owner, city..."
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
                    
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Verification</InputLabel>
                        <Select
                            value={verifiedFilter}
                            onChange={(e) => setVerifiedFilter(e.target.value)}
                            label="Verification"
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="verified">Verified</MenuItem>
                            <MenuItem value="unverified">Pending</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            label="Category"
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
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
                            setVerifiedFilter('all');
                            setStatusFilter('all');
                            setCategoryFilter('');
                            setPage(0);
                            loadShops();
                        }}
                        startIcon={<RefreshIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Reset
                    </Button>
                </Box>
            </Paper>

            {/* Shops Table */}
            <Paper sx={{ border: '1px solid #e8ecef', boxShadow: 'none', borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)', overflow: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox" sx={{ bgcolor: '#f8f9fa' }}>
                                    <Checkbox
                                        checked={selectedShops.length === shops.length && shops.length > 0}
                                        indeterminate={selectedShops.length > 0 && selectedShops.length < shops.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Shop Details</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Owner</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Location</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Posted Date</TableCell>
                                <TableCell align="center" sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress sx={{ color: '#325fec' }} />
                                    </TableCell>
                                </TableRow>
                            ) : shops.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="#6b7280">No shops found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                shops.map((shop) => (
                                    <TableRow key={shop.id} hover sx={{ opacity: shop.is_active ? 1 : 0.6 }}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedShops.includes(shop.id)}
                                                onChange={(e) => handleSelectShop(e, shop.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                {renderShopImage(shop)}
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {shop.business_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="#6b7280">
                                                        {shop.category}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{shop.owner_name}</Typography>
                                            <Typography variant="caption" color="#6b7280">
                                                {shop.owner_phone}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{shop.area}</Typography>
                                            <Typography variant="caption" color="#6b7280">
                                                {shop.city}, {shop.state}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="column" spacing={0.5} alignItems="flex-start">
                                                {getStatusChip(shop.is_verified)}
                                                {getActiveChip(shop.is_active)}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(shop.created_at).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" gap={0.5} justifyContent="center" flexWrap="wrap">
                                                <Tooltip title="View Details">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => {
                                                            setSelectedShop(shop);
                                                            setOpenViewDialog(true);
                                                        }}
                                                        sx={{ color: '#325fec' }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                
                                                {shop.is_active && (
                                                    <>
                                                        <Tooltip title={shop.is_verified ? "Unverify" : "Verify"}>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleVerify(shop.id, shop.is_verified)}
                                                                sx={{ color: shop.is_verified ? '#f59e0b' : '#10b981' }}
                                                            >
                                                                {shop.is_verified ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Deactivate">
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => {
                                                                    setShopToDelete(shop);
                                                                    setOpenDeleteDialog(true);
                                                                }}
                                                                sx={{ color: '#ef4444' }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                                
                                                {!shop.is_active && (
                                                    <>
                                                        <Tooltip title="Reactivate">
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => {
                                                                    setShopToReactivate(shop);
                                                                    setOpenReactivateDialog(true);
                                                                }}
                                                                sx={{ color: '#10b981' }}
                                                            >
                                                                <RestoreIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Permanently Delete">
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => {
                                                                    setShopToHardDelete(shop);
                                                                    setOpenHardDeleteDialog(true);
                                                                }}
                                                                sx={{ color: '#dc2626' }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
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

            {/* View Shop Dialog */}
            <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Shop Details
                    <IconButton onClick={() => setOpenViewDialog(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedShop && (
                        <Box>
                            <Box sx={{ mb: 3, textAlign: 'center' }}>
                                {renderShopImageDialog(selectedShop)}
                            </Box>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="#6b7280">Business Name</Typography>
                                    <Typography variant="body1" fontWeight={600}>{selectedShop.business_name}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="#6b7280">Category</Typography>
                                    <Typography variant="body1">{selectedShop.category}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="#6b7280">Additional Phone</Typography>
                                    <Typography variant="body1">{selectedShop.additional_phone || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="#6b7280">Status</Typography>
                                    <Box mt={0.5}>{getStatusChip(selectedShop.is_verified)}</Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="#6b7280">Active</Typography>
                                    <Box mt={0.5}>{getActiveChip(selectedShop.is_active)}</Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="#6b7280">Key Items</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                        {selectedShop.keywords && selectedShop.keywords.length > 0 ? (
                                            selectedShop.keywords.map((item, idx) => (
                                                <Chip key={idx} label={item} size="small" />
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="#6b7280">No key items listed</Typography>
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="#6b7280">Location</Typography>
                                    <Typography variant="body1">{selectedShop.area}, {selectedShop.city}, {selectedShop.state}</Typography>
                                    {selectedShop.latitude && selectedShop.longitude && (
                                        <Typography variant="caption" color="#6b7280">
                                            Lat: {selectedShop.latitude}, Lng: {selectedShop.longitude}
                                        </Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="#6b7280">Owner Information</Typography>
                                    <Typography variant="body1">{selectedShop.owner_name}</Typography>
                                    <Typography variant="body2" color="#6b7280">{selectedShop.owner_phone}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="#6b7280">Posted Date</Typography>
                                    <Typography variant="body1">{new Date(selectedShop.created_at).toLocaleString()}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
                    {selectedShop && selectedShop.is_active && !selectedShop.is_verified && (
                        <Button 
                            variant="contained" 
                            onClick={() => {
                                handleVerify(selectedShop.id, selectedShop.is_verified);
                                setOpenViewDialog(false);
                            }}
                            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                        >
                            Verify Shop
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Soft Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Deactivation</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to deactivate <strong>{shopToDelete?.business_name}</strong>?
                        This shop will be hidden from users but can be reactivated later.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleSoftDelete} variant="contained" color="warning">Deactivate</Button>
                </DialogActions>
            </Dialog>

            {/* Reactivate Confirmation Dialog */}
            <Dialog open={openReactivateDialog} onClose={() => setOpenReactivateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Reactivation</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to reactivate <strong>{shopToReactivate?.business_name}</strong>?
                        This shop will be visible to users again.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenReactivateDialog(false)}>Cancel</Button>
                    <Button onClick={handleReactivate} variant="contained" color="success">Reactivate</Button>
                </DialogActions>
            </Dialog>

            {/* Hard Delete Confirmation Dialog */}
            <Dialog open={openHardDeleteDialog} onClose={() => setOpenHardDeleteDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Permanent Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to permanently delete <strong>{shopToHardDelete?.business_name}</strong>?
                        This action cannot be undone and all associated data will be removed.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHardDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleHardDelete} variant="contained" color="error">Permanently Delete</Button>
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