import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    InputAdornment,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    MenuItem,
    Avatar,
    Tooltip,
    Alert,
    Grid,
    Card,
    CardContent,
    Rating,
    Divider,
    Tab,
    Tabs
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Store as StoreIcon,
    LocalHospital as DoctorIcon,
    MoreVert as MoreVertIcon,
    Refresh as RefreshIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Verified as VerifiedIcon,
    Block as BlockIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useAdmin } from '../../../hooks/useAdmin';
import { formatDate, timeAgo, formatNumber } from '../../../utils/formatting';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function Businesses() {
    const [tabValue, setTabValue] = useState(0);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pageSize: 20 });
    const [filters, setFilters] = useState({ search: '', category: '', status: '' });
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [detailsOpen, setDetailsOpen] = useState(false);

    const { fetchAllBusinesses, verifyBusiness, blockUser, deleteUser } = useAdmin();

    useEffect(() => {
        loadBusinesses();
    }, [tabValue, pagination.page, filters]);

    const loadBusinesses = async () => {
        setLoading(true);
        try {
            const result = await fetchAllBusinesses({
                page: pagination.page,
                limit: pagination.pageSize,
                category: tabValue === 1 ? 'doctor' : tabValue === 0 ? '' : null,
                ...filters
            });
            setBusinesses(result.businesses);
            setPagination(prev => ({ ...prev, total: result.pagination.total }));
        } catch (error) {
            console.error('Error loading businesses:', error);
            setError('Failed to load businesses');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleMenuOpen = (event, business) => {
        setSelectedBusiness(business);
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action) => {
        setDialogAction(action);
        setDialogOpen(true);
        handleMenuClose();
    };

    const handleConfirm = async () => {
        setDialogOpen(false);
        setLoading(true);

        try {
            if (dialogAction === 'verify') {
                await verifyBusiness(selectedBusiness.id, 'approve');
                setSuccess('Business verified successfully');
            } else if (dialogAction === 'reject') {
                await verifyBusiness(selectedBusiness.id, 'reject', 'Rejected by admin');
                setSuccess('Business rejected');
            } else if (dialogAction === 'block') {
                await blockUser(selectedBusiness.id, true);
                setSuccess('Business blocked');
            } else if (dialogAction === 'unblock') {
                await blockUser(selectedBusiness.id, false);
                setSuccess('Business unblocked');
            } else if (dialogAction === 'delete') {
                await deleteUser(selectedBusiness.id);
                setSuccess('Business deleted');
            }
            await loadBusinesses();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
            setSelectedBusiness(null);
        }
    };

    const handleViewDetails = () => {
        setDetailsOpen(true);
        handleMenuClose();
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        {
            field: 'businessName',
            headerName: 'Business',
            width: 250,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: params.row.category === 'doctor' ? '#f4433620' : '#4caf5020' }}>
                        {params.row.category === 'doctor' ? <DoctorIcon /> : <StoreIcon />}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {params.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            {params.row.category}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        { field: 'ownerName', headerName: 'Owner', width: 150 },
        { field: 'phone', headerName: 'Phone', width: 130 },
        { field: 'city', headerName: 'City', width: 120 },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 100,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={params.value || 0} readOnly size="small" />
                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                        ({params.row.reviewsCount || 0})
                    </Typography>
                </Box>
            )
        },
        {
            field: 'views',
            headerName: 'Views',
            width: 80,
            valueFormatter: (params) => formatNumber(params.value)
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {params.row.isVerified && (
                        <Tooltip title="Verified">
                            <VerifiedIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                        </Tooltip>
                    )}
                    {params.row.isBlocked && (
                        <Tooltip title="Blocked">
                            <BlockIcon sx={{ color: '#f44336', fontSize: 20 }} />
                        </Tooltip>
                    )}
                    {!params.row.isVerified && !params.row.isBlocked && (
                        <Chip label="Pending" size="small" color="warning" />
                    )}
                    {params.row.hasJobVacancy && (
                        <Chip label="Hiring" size="small" color="success" variant="outlined" />
                    )}
                </Box>
            )
        },
        {
            field: 'createdAt',
            headerName: 'Joined',
            width: 120,
            valueFormatter: (params) => timeAgo(params.value)
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params) => (
                <IconButton onClick={(e) => handleMenuOpen(e, params.row)}>
                    <MoreVertIcon />
                </IconButton>
            )
        }
    ];

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Business Management
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadBusinesses}
                >
                    Refresh
                </Button>
            </Box>

            {/* Tabs */}
            <Paper sx={{ mb: 3, borderRadius: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    sx={{
                        '& .MuiTab-root': { fontWeight: 600 },
                        '& .Mui-selected': { color: '#C00C0C !important' },
                        '& .MuiTabs-indicator': { bgcolor: '#C00C0C' }
                    }}
                >
                    <Tab label="All Businesses" />
                    <Tab label="Doctors & Clinics" />
                    <Tab label="Pending Verification" />
                </Tabs>
            </Paper>

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search businesses..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Category"
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            size="small"
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            <MenuItem value="stationery">Stationery</MenuItem>
                            <MenuItem value="doctor">Doctor</MenuItem>
                            <MenuItem value="grocery">Grocery</MenuItem>
                            <MenuItem value="restaurant">Restaurant</MenuItem>
                            <MenuItem value="salon">Salon</MenuItem>
                            <MenuItem value="pharmacy">Pharmacy</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            size="small"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="verified">Verified</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="blocked">Blocked</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={loadBusinesses}
                        >
                            Apply
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Messages */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {/* Businesses Table */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <DataGrid
                    rows={businesses}
                    columns={columns}
                    loading={loading}
                    pageSize={pagination.pageSize}
                    rowsPerPageOptions={[10, 20, 50]}
                    pagination
                    paginationMode="server"
                    rowCount={pagination.total}
                    onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage + 1 }))}
                    onPageSizeChange={(newSize) => setPagination(prev => ({ ...prev, pageSize: newSize, page: 1 }))}
                    disableSelectionOnClick
                    autoHeight
                    sx={{
                        '& .MuiDataGrid-cell:focus': { outline: 'none' },
                        border: 'none'
                    }}
                />
            </Paper>

            {/* Action Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleViewDetails}>
                    <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
                    View Details
                </MenuItem>
                {!selectedBusiness?.isVerified && (
                    <MenuItem onClick={() => handleAction('verify')}>
                        <VerifiedIcon sx={{ mr: 1, fontSize: 20, color: '#4caf50' }} />
                        Verify Business
                    </MenuItem>
                )}
                {selectedBusiness?.isVerified && (
                    <MenuItem onClick={() => handleAction('reject')}>
                        <BlockIcon sx={{ mr: 1, fontSize: 20, color: '#ff9800' }} />
                        Remove Verification
                    </MenuItem>
                )}
                <MenuItem onClick={() => handleAction(selectedBusiness?.isBlocked ? 'unblock' : 'block')}>
                    <BlockIcon sx={{ mr: 1, fontSize: 20, color: selectedBusiness?.isBlocked ? '#4caf50' : '#f44336' }} />
                    {selectedBusiness?.isBlocked ? 'Unblock' : 'Block'}
                </MenuItem>
                <MenuItem onClick={() => handleAction('delete')} sx={{ color: '#f44336' }}>
                    <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>
                    {dialogAction === 'verify' && 'Verify Business'}
                    {dialogAction === 'reject' && 'Remove Verification'}
                    {dialogAction === 'block' && 'Block Business'}
                    {dialogAction === 'unblock' && 'Unblock Business'}
                    {dialogAction === 'delete' && 'Delete Business'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to {dialogAction}{' '}
                        <strong>{selectedBusiness?.businessName}</strong>?
                        {dialogAction === 'delete' && (
                            <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                                This action cannot be undone. All jobs and data will be permanently deleted.
                            </Typography>
                        )}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleConfirm} 
                        color={dialogAction === 'delete' ? 'error' : 'primary'}
                        variant="contained"
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: selectedBusiness?.category === 'doctor' ? '#f44336' : '#4caf50' }}>
                            {selectedBusiness?.category === 'doctor' ? <DoctorIcon /> : <StoreIcon />}
                        </Avatar>
                        <Box>
                            <Typography variant="h6">{selectedBusiness?.businessName}</Typography>
                            <Typography variant="body2" color="#666">
                                {selectedBusiness?.category}
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedBusiness && (
                        <Grid container spacing={3}>
                            {/* Basic Info */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                    Basic Information
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PhoneIcon sx={{ fontSize: 18, color: '#666' }} />
                                        <Typography variant="body2">{selectedBusiness.phone}</Typography>
                                    </Box>
                                    {selectedBusiness.email && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon sx={{ fontSize: 18, color: '#666' }} />
                                            <Typography variant="body2">{selectedBusiness.email}</Typography>
                                        </Box>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationIcon sx={{ fontSize: 18, color: '#666' }} />
                                        <Typography variant="body2">
                                            {selectedBusiness.area}, {selectedBusiness.city}, {selectedBusiness.state}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Stats */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Statistics
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                                {formatNumber(selectedBusiness.views)}
                                            </Typography>
                                            <Typography variant="caption">Total Views</Typography>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                                {selectedBusiness.reviewsCount || 0}
                                            </Typography>
                                            <Typography variant="caption">Reviews</Typography>
                                        </Card>
                                    </Grid>
                                </Grid>
                                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Rating value={selectedBusiness.rating || 0} readOnly />
                                    <Typography variant="body2">({selectedBusiness.rating?.toFixed(1) || 0})</Typography>
                                </Box>
                            </Grid>

                            {/* Items/Services */}
                            {selectedBusiness.items?.length > 0 && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                        Items & Services
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {selectedBusiness.items.map((item, idx) => (
                                            <Chip key={idx} label={item} variant="outlined" />
                                        ))}
                                    </Box>
                                </Grid>
                            )}

                            {/* Doctor Specific */}
                            {selectedBusiness.category === 'doctor' && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                        Doctor Details
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="#666">
                                                Doctor Name
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {selectedBusiness.doctorName}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="#666">
                                                Specialization
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {selectedBusiness.specialization}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="#666">
                                                Consultation Fee
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                ₹{selectedBusiness.consultationFee}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="#666">
                                                Experience
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {selectedBusiness.experience || 'Not specified'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            )}

                            {/* Timings */}
                            {selectedBusiness.timings && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                        Business Hours
                                    </Typography>
                                    <Typography variant="body2">{selectedBusiness.timings}</Typography>
                                </Grid>
                            )}

                            {/* Jobs */}
                            {selectedBusiness.jobs?.length > 0 && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                        Active Jobs
                                    </Typography>
                                    {selectedBusiness.jobs.map((job) => (
                                        <Paper key={job.id} variant="outlined" sx={{ p: 2, mb: 1 }}>
                                            <Typography variant="subtitle2">{job.title}</Typography>
                                            <Typography variant="caption" color="#666">
                                                {job.applicationsCount} applications • Posted {timeAgo(job.createdAt)}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}