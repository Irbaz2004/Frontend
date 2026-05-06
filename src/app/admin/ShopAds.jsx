// app/admin/ShopAds.jsx
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
    Divider,
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
    FormControlLabel,
    Switch,
    Radio,
    RadioGroup,
    
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    TrendingUp as TrendingUpIcon,
    Schedule as ScheduleIcon,
    PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import {
    getAllShopAds,
    createShopAd,
    updateShopAd,
    deleteShopAd,
    toggleAdStatus,
    getShopsForAds,
    getAdsStatistics
} from '../../services/shopAd';

export default function ShopAds() {
    const [loading, setLoading] = useState(false);
    const [ads, setAds] = useState([]);
    const [shops, setShops] = useState([]);
    const [stats, setStats] = useState(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [selectedAd, setSelectedAd] = useState(null);
    const [adToDelete, setAdToDelete] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        shop_id: '',
        title: '',
        description: '',
        duration: '30days',
        priority: 'normal',
        image: null,
        image_preview: ''
    });
    
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        loadAds();
        loadShops();
        loadStats();
    }, [page, rowsPerPage, statusFilter, priorityFilter]);

    const loadAds = async () => {
        setLoading(true);
        try {
            const result = await getAllShopAds({
                page: page + 1,
                limit: rowsPerPage,
                search,
                status: statusFilter,
                priority: priorityFilter
            });
            setAds(result.ads || []);
            setTotal(result.total || 0);
        } catch (error) {
            showSnackbar('Failed to load ads', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadShops = async () => {
        try {
            const result = await getShopsForAds();
            setShops(result.shops || []);
        } catch (error) {
            console.error('Failed to load shops:', error);
        }
    };

    const loadStats = async () => {
        try {
            const result = await getAdsStatistics();
            setStats(result.stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const handleSearch = () => {
        setPage(0);
        loadAds();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setFormData({
                ...formData,
                image: file,
                image_preview: URL.createObjectURL(file)
            });
        }
    };

    const handleCreateAd = async () => {
        if (!formData.shop_id || !formData.title || !imageFile) {
            showSnackbar('Please fill all required fields and upload image', 'error');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('shop_id', formData.shop_id);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('duration', formData.duration);
        formDataToSend.append('priority', formData.priority);
        formDataToSend.append('image', imageFile);

        try {
            if (editingAd) {
                await updateShopAd(editingAd.id, formDataToSend);
                showSnackbar('Ad updated successfully');
            } else {
                await createShopAd(formDataToSend);
                showSnackbar('Ad created successfully');
            }
            handleCloseDialog();
            loadAds();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleDelete = async () => {
        if (!adToDelete) return;
        
        try {
            await deleteShopAd(adToDelete.id);
            showSnackbar('Ad deleted successfully');
            setOpenDeleteDialog(false);
            setAdToDelete(null);
            loadAds();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleToggleStatus = async (id, isActive) => {
        try {
            await toggleAdStatus(id, !isActive);
            showSnackbar(`Ad ${!isActive ? 'activated' : 'deactivated'} successfully`);
            loadAds();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleOpenDialog = (ad = null) => {
        if (ad) {
            setEditingAd(ad);
            setFormData({
                shop_id: ad.shop_id,
                title: ad.title,
                description: ad.description || '',
                duration: ad.duration,
                priority: ad.priority,
                image: null,
                image_preview: ad.image_url
            });
            setImageFile(null);
        } else {
            setEditingAd(null);
            setFormData({
                shop_id: '',
                title: '',
                description: '',
                duration: '30days',
                priority: 'normal',
                image: null,
                image_preview: ''
            });
            setImageFile(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingAd(null);
        setFormData({
            shop_id: '',
            title: '',
            description: '',
            duration: '30days',
            priority: 'normal',
            image: null,
            image_preview: ''
        });
        setImageFile(null);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const getPriorityChip = (priority) => {
        const config = {
            premium: { color: '#8b5cf6', bg: '#f3e8ff', label: 'Premium' },
            high: { color: '#ef4444', bg: '#fee2e2', label: 'High' },
            normal: { color: '#3b82f6', bg: '#dbeafe', label: 'Normal' },
            low: { color: '#6b7280', bg: '#f3f4f6', label: 'Low' }
        };
        const c = config[priority] || config.normal;
        return <Chip label={c.label} size="small" sx={{ bgcolor: c.bg, color: c.color, borderRadius: 1 }} />;
    };

    const getStatusChip = (ad) => {
        const isExpired = new Date(ad.end_date) < new Date();
        if (!ad.is_active || isExpired) {
            return <Chip label="Expired" size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', borderRadius: 1 }} />;
        }
        return <Chip label="Active" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', borderRadius: 1 }} />;
    };

    const StatCard = ({ title, value, icon, color }) => (
        <Card sx={{ borderRadius: 2, border: '1px solid #e8ecef', boxShadow: 'none', height: '100%' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="caption" color="#5a6e8a"> {title}</Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: '"Alumni Sans", sans-serif', color: '#020402' }}>
                            {value || 0}
                        </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: `${color}10`, color: color }}>{icon}</Avatar>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header */}
            <Typography variant="h4" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600, mb: 3 }}>
                Shop Ads Management
            </Typography>

            {/* Statistics Cards */}
            {stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <StatCard title="Total Ads" value={stats.total} icon={<TrendingUpIcon />} color="#3b82f6" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard title="Active Ads" value={stats.active} icon={<CheckCircleIcon />} color="#10b981" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard title="Expired Ads" value={stats.expired} icon={<ScheduleIcon />} color="#f59e0b" />
                    </Grid>
                </Grid>
            )}

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, border: '1px solid #e8ecef', boxShadow: 'none', borderRadius: 2 }}>
                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                        placeholder="Search by shop or title..."
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
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="expired">Expired</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} label="Priority">
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="premium">Premium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="normal">Normal</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <Button variant="contained" onClick={handleSearch} startIcon={<SearchIcon />} sx={{ textTransform: 'none', borderRadius: 2 }}>
                        Search
                    </Button>
                    
                    <Button variant="outlined" onClick={() => { setSearch(''); setStatusFilter('all'); setPriorityFilter(''); setPage(0); loadAds(); }} startIcon={<RefreshIcon />} sx={{ textTransform: 'none', borderRadius: 2 }}>
                        Reset
                    </Button>
                    
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#325fec' }}>
                        Create Ad
                    </Button>
                </Box>
            </Paper>

            {/* Ads Table */}
            <Paper sx={{ border: '1px solid #e8ecef', boxShadow: 'none', borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)', overflow: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Image</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Title / Shop</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Priority</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Duration</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Period</TableCell>
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
                            ) : ads.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="#6b7280">No ads found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ads.map((ad) => (
                                    <TableRow key={ad.id} hover>
                                        <TableCell>
                                            <Avatar src={ad.image_url} variant="rounded" sx={{ width: 50, height: 50 }} />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>{ad.title}</Typography>
                                            <Typography variant="caption" color="#6b7280">{ad.shop_name}</Typography>
                                        </TableCell>
                                        <TableCell>{getPriorityChip(ad.priority)}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{ad.duration === '30days' ? '30 Days' : '3 Months'}</Typography>
                                        </TableCell>
                                        <TableCell>{getStatusChip(ad)}</TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="#6b7280">
                                                {new Date(ad.start_date).toLocaleDateString()} - {new Date(ad.end_date).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" gap={1} justifyContent="center">
                                                <Tooltip title="View">
                                                    <IconButton size="small" onClick={() => { setSelectedAd(ad); setOpenViewDialog(true); }} sx={{ color: '#325fec' }}>
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" onClick={() => handleOpenDialog(ad)} sx={{ color: '#f59e0b' }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={ad.is_active && new Date(ad.end_date) > new Date() ? "Deactivate" : "Activate"}>
                                                    <IconButton size="small" onClick={() => handleToggleStatus(ad.id, ad.is_active)} sx={{ color: ad.is_active ? '#ef4444' : '#10b981' }}>
                                                        {ad.is_active && new Date(ad.end_date) > new Date() ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" onClick={() => { setAdToDelete(ad); setOpenDeleteDialog(true); }} sx={{ color: '#ef4444' }}>
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
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </Paper>

            {/* Create/Edit Ad Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingAd ? 'Edit Shop Ad' : 'Create New Shop Ad'}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                        <InputLabel>Select Shop *</InputLabel>
                        <Select value={formData.shop_id} onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })} label="Select Shop *">
                            {shops.map((shop) => (
                                <MenuItem key={shop.id} value={shop.id}>{shop.business_name} - {shop.city}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <TextField fullWidth label="Ad Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} sx={{ mb: 2 }} />
                    
                    <TextField fullWidth multiline rows={3} label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} sx={{ mb: 2 }} />
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Duration *</InputLabel>
                        <Select value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} label="Duration *">
                            <MenuItem value="30days">30 Days</MenuItem>
                            <MenuItem value="3months">3 Months</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} label="Priority">
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="normal">Normal</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="premium">Premium</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth sx={{ mb: 2, py: 1.5 }}>
                        Upload Ad Image *
                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </Button>
                    
                    {formData.image_preview && (
                        <Box sx={{ mt: 1, textAlign: 'center' }}>
                            <img src={formData.image_preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8 }} />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleCreateAd} variant="contained">{editingAd ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>

            {/* View Ad Dialog */}
            <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Ad Details
                    <IconButton onClick={() => setOpenViewDialog(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedAd && (
                        <Box>
                            <img src={selectedAd.image_url} alt={selectedAd.title} style={{ width: '100%', borderRadius: 8, marginBottom: 16 }} />
                            <Typography variant="h6" fontWeight={600}>{selectedAd.title}</Typography>
                            <Typography variant="body2" color="#5a6e8a" sx={{ mb: 1 }}>{selectedAd.shop_name}</Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>{selectedAd.description}</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Grid container spacing={1}>
                                <Grid item xs={6}><Typography variant="caption" color="#6b7280">Priority</Typography><Typography variant="body2">{selectedAd.priority}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="#6b7280">Duration</Typography><Typography variant="body2">{selectedAd.duration === '30days' ? '30 Days' : '3 Months'}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="#6b7280">Start Date</Typography><Typography variant="body2">{new Date(selectedAd.start_date).toLocaleDateString()}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="#6b7280">End Date</Typography><Typography variant="body2">{new Date(selectedAd.end_date).toLocaleDateString()}</Typography></Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete the ad "<strong>{adToDelete?.title}</strong>"? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
}