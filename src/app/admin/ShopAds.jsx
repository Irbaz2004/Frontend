// app/admin/ShopAds.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    Skeleton
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
import { compressImageForUpload, formatFileSize } from '../../utils/imageUpload';

export default function ShopAds() {
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
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
    const [dialogLoading, setDialogLoading] = useState(false);
    
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
    const [imageChanged, setImageChanged] = useState(false);
    const [imageProcessing, setImageProcessing] = useState(false);
    const [imageMeta, setImageMeta] = useState(null);
    
    // Refs for abort controllers
    const abortControllerRef = useRef(null);

    // Load data with cleanup
    const loadAds = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        
        // Cancel previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        try {
            const result = await getAllShopAds({
                page: page + 1,
                limit: rowsPerPage,
                search,
                status: statusFilter,
                priority: priorityFilter
            }, { signal: abortControllerRef.current.signal });
            
            setAds(result.ads || []);
            setTotal(result.total || 0);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Failed to load ads:', error);
                if (!silent) showSnackbar('Failed to load ads', 'error');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [page, rowsPerPage, search, statusFilter, priorityFilter]);

    const loadShops = useCallback(async () => {
        try {
            const result = await getShopsForAds();
            setShops(result.shops || []);
        } catch (error) {
            console.error('Failed to load shops:', error);
        }
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const result = await getAdsStatistics();
            setStats(result.stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadAds();
        loadShops();
        loadStats();
        
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [loadAds, loadShops, loadStats]);

    // Reload when filters change
    useEffect(() => {
        loadAds(true);
    }, [page, rowsPerPage, statusFilter, priorityFilter, loadAds]);

    const handleSearch = useCallback(() => {
        setPage(0);
        loadAds();
    }, [loadAds]);

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size before browser-side compression.
            if (file.size > 15 * 1024 * 1024) {
                showSnackbar('Image size should be less than 15MB', 'error');
                e.target.value = '';
                return;
            }
            
            // Validate file type
            if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
                showSnackbar('Please upload a valid image (JPEG, PNG, WEBP, GIF)', 'error');
                e.target.value = '';
                return;
            }

            setImageProcessing(true);
            try {
                const compressedFile = await compressImageForUpload(file);
                const previewUrl = URL.createObjectURL(compressedFile);
                const meta = {
                    compressed: compressedFile !== file,
                    originalSize: file.size,
                    finalSize: compressedFile.size,
                };

                if (formData.image_preview && formData.image_preview.startsWith('blob:')) {
                    URL.revokeObjectURL(formData.image_preview);
                }

                setImageFile(compressedFile);
                setImageChanged(true);
                setImageMeta(meta);
                setFormData(prev => ({
                    ...prev,
                    image: compressedFile,
                    image_preview: previewUrl
                }));

                showSnackbar(
                    meta.compressed
                        ? `Image compressed to ${formatFileSize(meta.finalSize)}`
                        : `Image ready: ${formatFileSize(meta.finalSize)}`,
                    'success'
                );
            } catch (error) {
                showSnackbar(error.message || 'Failed to compress image', 'error');
            } finally {
                setImageProcessing(false);
                e.target.value = '';
            }
        }
    };

    const handleCreateAd = async () => {
        // Validate required fields
        if (!formData.shop_id) {
            showSnackbar('Please select a shop', 'error');
            return;
        }
        if (!formData.title.trim()) {
            showSnackbar('Please enter a title', 'error');
            return;
        }
        if (!imageFile && !editingAd) {
            showSnackbar('Please upload an image', 'error');
            return;
        }
        if (editingAd && !imageFile && !imageChanged && !formData.image_preview) {
            showSnackbar('Please upload an image', 'error');
            return;
        }
        if (imageProcessing) {
            showSnackbar('Please wait, image is still compressing', 'error');
            return;
        }

        setDialogLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append('shop_id', formData.shop_id);
        formDataToSend.append('title', formData.title.trim());
        formDataToSend.append('description', formData.description.trim() || '');
        formDataToSend.append('duration', formData.duration);
        formDataToSend.append('priority', formData.priority);
        
        if (imageFile) {
            formDataToSend.append('image', imageFile);
        }

        try {
            if (editingAd) {
                await updateShopAd(editingAd.id, formDataToSend);
                showSnackbar('Ad updated successfully');
            } else {
                await createShopAd(formDataToSend);
                showSnackbar('Ad created successfully');
            }
            handleCloseDialog();
            // Reload all data
            await Promise.all([loadAds(), loadStats()]);
        } catch (error) {
            showSnackbar(error.message || 'Failed to save ad', 'error');
        } finally {
            setDialogLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!adToDelete) return;
        
        setDialogLoading(true);
        try {
            await deleteShopAd(adToDelete.id);
            showSnackbar('Ad deleted successfully');
            setOpenDeleteDialog(false);
            setAdToDelete(null);
            await Promise.all([loadAds(), loadStats()]);
        } catch (error) {
            showSnackbar(error.message || 'Failed to delete ad', 'error');
        } finally {
            setDialogLoading(false);
        }
    };

    const handleToggleStatus = async (id, isActive) => {
        setLoadingAction(true);
        try {
            await toggleAdStatus(id, !isActive);
            showSnackbar(`Ad ${!isActive ? 'activated' : 'deactivated'} successfully`);
            await Promise.all([loadAds(true), loadStats()]);
        } catch (error) {
            showSnackbar(error.message || 'Failed to toggle status', 'error');
        } finally {
            setLoadingAction(false);
        }
    };

    const handleOpenDialog = (ad = null) => {
        if (ad) {
            setEditingAd(ad);
            setFormData({
                shop_id: ad.shop_id,
                title: ad.title,
                description: ad.description || '',
                duration: ad.duration || '30days',
                priority: ad.priority || 'normal',
                image: null,
                image_preview: ad.image_url
            });
            setImageFile(null);
            setImageChanged(false);
            setImageMeta(null);
            setImageProcessing(false);
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
            setImageChanged(false);
            setImageMeta(null);
            setImageProcessing(false);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        // Clean up object URLs
        if (formData.image_preview && formData.image_preview.startsWith('blob:')) {
            URL.revokeObjectURL(formData.image_preview);
        }
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
        setImageChanged(false);
        setImageMeta(null);
        setImageProcessing(false);
        setDialogLoading(false);
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
        return <Chip label={c.label} size="small" sx={{ bgcolor: c.bg, color: c.color, borderRadius: 1, fontWeight: 600 }} />;
    };

    const getStatusChip = (ad) => {
        const isExpired = new Date(ad.end_date) < new Date();
        if (!ad.is_active || isExpired) {
            return <Chip label="Expired" size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', borderRadius: 1, fontWeight: 600 }} />;
        }
        return <Chip label="Active" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', borderRadius: 1, fontWeight: 600 }} />;
    };

    const StatCard = ({ title, value, icon, color, loading: statLoading }) => (
        <Card sx={{ borderRadius: 2, border: '1px solid #e8ecef', boxShadow: 'none', height: '100%' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="caption" color="#5a6e8a"> {title}</Typography>
                        {statLoading ? (
                            <Skeleton width={60} height={40} />
                        ) : (
                            <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: '"Alumni Sans", sans-serif', color: '#020402' }}>
                                {value || 0}
                            </Typography>
                        )}
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
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                    
                    <Button 
                        variant="contained" 
                        onClick={handleSearch} 
                        startIcon={<SearchIcon />} 
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                        disabled={loading}
                    >
                        Search
                    </Button>
                    
                    <Button 
                        variant="outlined" 
                        onClick={() => { 
                            setSearch(''); 
                            setStatusFilter('all'); 
                            setPriorityFilter(''); 
                            setPage(0); 
                            loadAds(); 
                        }} 
                        startIcon={<RefreshIcon />} 
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                        disabled={loading}
                    >
                        Reset
                    </Button>
                    
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpenDialog()} 
                        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#325fec' }}
                    >
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
                                // Loading skeletons
                                Array.from({ length: rowsPerPage }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Skeleton variant="rounded" width={50} height={50} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={150} /><Skeleton variant="text" width={100} /></TableCell>
                                        <TableCell><Skeleton variant="rectangular" width={70} height={24} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={70} /></TableCell>
                                        <TableCell><Skeleton variant="rectangular" width={70} height={24} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={120} /></TableCell>
                                        <TableCell><Skeleton variant="rectangular" width={120} height={36} /></TableCell>
                                    </TableRow>
                                ))
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
                                            <Avatar 
                                                src={ad.image_url} 
                                                variant="rounded" 
                                                sx={{ width: 50, height: 50 }}
                                                imgProps={{ 
                                                    onError: (e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '';
                                                    }
                                                }}
                                            />
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
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => { setSelectedAd(ad); setOpenViewDialog(true); }} 
                                                        sx={{ color: '#325fec' }}
                                                        disabled={loadingAction}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleOpenDialog(ad)} 
                                                        sx={{ color: '#f59e0b' }}
                                                        disabled={loadingAction}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={ad.is_active && new Date(ad.end_date) > new Date() ? "Deactivate" : "Activate"}>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleToggleStatus(ad.id, ad.is_active)} 
                                                        sx={{ color: ad.is_active && new Date(ad.end_date) > new Date() ? '#ef4444' : '#10b981' }}
                                                        disabled={loadingAction}
                                                    >
                                                        {loadingAction ? 
                                                            <CircularProgress size={20} /> :
                                                            (ad.is_active && new Date(ad.end_date) > new Date() ? 
                                                                <CancelIcon fontSize="small" /> : 
                                                                <CheckCircleIcon fontSize="small" />
                                                            )
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => { setAdToDelete(ad); setOpenDeleteDialog(true); }} 
                                                        sx={{ color: '#ef4444' }}
                                                        disabled={loadingAction}
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

            {/* Create/Edit Ad Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingAd ? 'Edit Shop Ad' : 'Create New Shop Ad'}
                    {dialogLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                        <InputLabel>Select Shop *</InputLabel>
                        <Select 
                            value={formData.shop_id} 
                            onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })} 
                            label="Select Shop *"
                            disabled={dialogLoading || imageProcessing}
                        >
                            {shops.map((shop) => (
                                <MenuItem key={shop.id} value={shop.id}>
                                    {shop.business_name} - {shop.city}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <TextField 
                        fullWidth 
                        label="Ad Title *" 
                        value={formData.title} 
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                        sx={{ mb: 2 }}
                        disabled={dialogLoading || imageProcessing}
                        required
                    />
                    
                    <TextField 
                        fullWidth 
                        multiline 
                        rows={3} 
                        label="Description" 
                        value={formData.description} 
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                        sx={{ mb: 2 }}
                        disabled={dialogLoading || imageProcessing}
                    />
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Duration *</InputLabel>
                        <Select 
                            value={formData.duration} 
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })} 
                            label="Duration *"
                            disabled={dialogLoading || imageProcessing}
                        >
                            <MenuItem value="30days">30 Days</MenuItem>
                            <MenuItem value="3months">3 Months</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select 
                            value={formData.priority} 
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })} 
                            label="Priority"
                            disabled={dialogLoading || imageProcessing}
                        >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="normal">Normal</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="premium">Premium</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <Button 
                        variant="outlined" 
                        component="label" 
                        startIcon={<CloudUploadIcon />} 
                        fullWidth 
                        sx={{ mb: 2, py: 1.5 }}
                        disabled={dialogLoading || imageProcessing}
                    >
                        {imageProcessing ? 'Compressing image...' : (editingAd && !imageFile ? 'Change Ad Image' : 'Upload Ad Image *')}
                        <input 
                            type="file" 
                            hidden 
                            accept="image/*" 
                            onChange={handleImageChange} 
                        />
                    </Button>
                    
                    {formData.image_preview && (
                        <Box sx={{ mt: 1, textAlign: 'center' }}>
                            <img 
                                src={formData.image_preview} 
                                alt="Preview" 
                                style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8, objectFit: 'cover' }} 
                            />
                            {imageFile && (
                                <Typography variant="caption" display="block" color="#6b7280">
                                    New image selected: {imageFile.name}
                                    {imageMeta ? ` (${formatFileSize(imageMeta.finalSize)})` : ''}
                                </Typography>
                            )}
                            {imageMeta?.compressed && (
                                <Typography variant="caption" display="block" color="#16a34a">
                                    Compressed from {formatFileSize(imageMeta.originalSize)} to {formatFileSize(imageMeta.finalSize)}
                                </Typography>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={dialogLoading || imageProcessing}>Cancel</Button>
                    <Button 
                        onClick={handleCreateAd} 
                        variant="contained" 
                        disabled={dialogLoading || imageProcessing}
                        startIcon={dialogLoading && <CircularProgress size={20} />}
                    >
                        {imageProcessing ? 'Compressing...' : dialogLoading ? 'Saving...' : (editingAd ? 'Update' : 'Create')}
                    </Button>
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
                            <img 
                                src={selectedAd.image_url} 
                                alt={selectedAd.title} 
                                style={{ width: '100%', borderRadius: 8, marginBottom: 16, maxHeight: 300, objectFit: 'cover' }} 
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                }}
                            />
                            <Typography variant="h6" fontWeight={600}>{selectedAd.title}</Typography>
                            <Typography variant="body2" color="#5a6e8a" sx={{ mb: 1 }}>{selectedAd.shop_name}</Typography>
                            {selectedAd.description && (
                                <Typography variant="body2" sx={{ mb: 2 }}>{selectedAd.description}</Typography>
                            )}
                            <Divider sx={{ my: 1 }} />
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="#6b7280">Priority</Typography>
                                    <Typography variant="body2">{selectedAd.priority}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="#6b7280">Duration</Typography>
                                    <Typography variant="body2">{selectedAd.duration === '30days' ? '30 Days' : '3 Months'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="#6b7280">Start Date</Typography>
                                    <Typography variant="body2">{new Date(selectedAd.start_date).toLocaleDateString()}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="#6b7280">End Date</Typography>
                                    <Typography variant="body2">{new Date(selectedAd.end_date).toLocaleDateString()}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="#6b7280">Status</Typography>
                                    <Box mt={0.5}>{getStatusChip(selectedAd)}</Box>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the ad "<strong>{adToDelete?.title}</strong>"? 
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} disabled={dialogLoading}>Cancel</Button>
                    <Button 
                        onClick={handleDelete} 
                        variant="contained" 
                        color="error"
                        disabled={dialogLoading}
                        startIcon={dialogLoading && <CircularProgress size={20} />}
                    >
                        {dialogLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })} 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
