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
    Divider
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Church as ChurchIcon,
    MoreVert as MoreVertIcon,
    Refresh as RefreshIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Verified as VerifiedIcon,
    Block as BlockIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    AccessTime as TimeIcon,
    Event as EventIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useAdmin } from '../../../hooks/useAdmin';
import { formatDate, timeAgo, formatNumber } from '../../../utils/formatting';

export default function Worship() {
    const [worship, setWorship] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pageSize: 20 });
    const [filters, setFilters] = useState({ search: '', religion: '', status: '' });
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [detailsOpen, setDetailsOpen] = useState(false);

    const { fetchAllWorship, verifyWorship, blockUser, deleteUser } = useAdmin();

    useEffect(() => {
        loadWorship();
    }, [pagination.page, filters]);

    const loadWorship = async () => {
        setLoading(true);
        try {
            const result = await fetchAllWorship({
                page: pagination.page,
                limit: pagination.pageSize,
                ...filters
            });
            setWorship(result.worship);
            setPagination(prev => ({ ...prev, total: result.pagination.total }));
        } catch (error) {
            console.error('Error loading worship places:', error);
            setError('Failed to load worship places');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleMenuOpen = (event, place) => {
        setSelectedPlace(place);
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
                await verifyWorship(selectedPlace.id, 'approve');
                setSuccess('Worship place verified successfully');
            } else if (dialogAction === 'reject') {
                await verifyWorship(selectedPlace.id, 'reject', 'Rejected by admin');
                setSuccess('Worship place rejected');
            } else if (dialogAction === 'block') {
                await blockUser(selectedPlace.id, true);
                setSuccess('Worship place blocked');
            } else if (dialogAction === 'unblock') {
                await blockUser(selectedPlace.id, false);
                setSuccess('Worship place unblocked');
            } else if (dialogAction === 'delete') {
                await deleteUser(selectedPlace.id);
                setSuccess('Worship place deleted');
            }
            await loadWorship();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
            setSelectedPlace(null);
        }
    };

    const handleViewDetails = () => {
        setDetailsOpen(true);
        handleMenuClose();
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        {
            field: 'name',
            headerName: 'Place of Worship',
            width: 250,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: '#9c27b020', color: '#9c27b0' }}>
                        <ChurchIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {params.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            {params.row.religionType}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        { field: 'ownerName', headerName: 'Coordinator', width: 150 },
        { field: 'phone', headerName: 'Phone', width: 130 },
        { field: 'city', headerName: 'City', width: 120 },
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
                <Box sx={{ display: 'flex', gap: 0.5 }}>
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
                    Worship Places Management
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadWorship}
                >
                    Refresh
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search worship places..."
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
                            label="Religion Type"
                            value={filters.religion}
                            onChange={(e) => handleFilterChange('religion', e.target.value)}
                            size="small"
                        >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="masjid">Masjid</MenuItem>
                            <MenuItem value="temple">Temple</MenuItem>
                            <MenuItem value="church">Church</MenuItem>
                            <MenuItem value="gurudwara">Gurudwara</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
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
                            onClick={loadWorship}
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

            {/* Worship Table */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <DataGrid
                    rows={worship}
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
                {!selectedPlace?.isVerified && (
                    <MenuItem onClick={() => handleAction('verify')}>
                        <VerifiedIcon sx={{ mr: 1, fontSize: 20, color: '#4caf50' }} />
                        Verify
                    </MenuItem>
                )}
                {selectedPlace?.isVerified && (
                    <MenuItem onClick={() => handleAction('reject')}>
                        <BlockIcon sx={{ mr: 1, fontSize: 20, color: '#ff9800' }} />
                        Remove Verification
                    </MenuItem>
                )}
                <MenuItem onClick={() => handleAction(selectedPlace?.isBlocked ? 'unblock' : 'block')}>
                    <BlockIcon sx={{ mr: 1, fontSize: 20, color: selectedPlace?.isBlocked ? '#4caf50' : '#f44336' }} />
                    {selectedPlace?.isBlocked ? 'Unblock' : 'Block'}
                </MenuItem>
                <MenuItem onClick={() => handleAction('delete')} sx={{ color: '#f44336' }}>
                    <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>
                    {dialogAction === 'verify' && 'Verify Worship Place'}
                    {dialogAction === 'reject' && 'Remove Verification'}
                    {dialogAction === 'block' && 'Block Place'}
                    {dialogAction === 'unblock' && 'Unblock Place'}
                    {dialogAction === 'delete' && 'Delete Place'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to {dialogAction}{' '}
                        <strong>{selectedPlace?.name}</strong>?
                        {dialogAction === 'delete' && (
                            <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                                This action cannot be undone. All events and data will be permanently deleted.
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
                        <Avatar sx={{ bgcolor: '#9c27b0' }}>
                            <ChurchIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6">{selectedPlace?.name}</Typography>
                            <Typography variant="body2" color="#666">
                                {selectedPlace?.religionType}
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedPlace && (
                        <Grid container spacing={3}>
                            {/* Basic Info */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                    Contact Information
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PhoneIcon sx={{ fontSize: 18, color: '#666' }} />
                                        <Typography variant="body2">{selectedPlace.phone}</Typography>
                                    </Box>
                                    {selectedPlace.email && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon sx={{ fontSize: 18, color: '#666' }} />
                                            <Typography variant="body2">{selectedPlace.email}</Typography>
                                        </Box>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationIcon sx={{ fontSize: 18, color: '#666' }} />
                                        <Typography variant="body2">
                                            {selectedPlace.area}, {selectedPlace.city}, {selectedPlace.state}
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
                                                {formatNumber(selectedPlace.views)}
                                            </Typography>
                                            <Typography variant="caption">Total Views</Typography>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                                {selectedPlace.eventsCount || 0}
                                            </Typography>
                                            <Typography variant="caption">Events</Typography>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Prayer Timings */}
                            {selectedPlace.prayerTimings && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                        Prayer Timings
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Grid container spacing={2}>
                                            {Object.entries(selectedPlace.prayerTimings).map(([prayer, time]) => (
                                                <Grid item xs={6} sm={4} key={prayer}>
                                                    <Typography variant="caption" color="#666">
                                                        {prayer.charAt(0).toUpperCase() + prayer.slice(1)}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {time}
                                                    </Typography>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Paper>
                                </Grid>
                            )}

                            {/* Facilities */}
                            {selectedPlace.facilities?.length > 0 && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                        Facilities
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {selectedPlace.facilities.map((facility, idx) => (
                                            <Chip key={idx} label={facility} variant="outlined" />
                                        ))}
                                    </Box>
                                </Grid>
                            )}

                            {/* Upcoming Events */}
                            {selectedPlace.events?.length > 0 && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                        Upcoming Events
                                    </Typography>
                                    {selectedPlace.events.map((event) => (
                                        <Paper key={event.id} variant="outlined" sx={{ p: 2, mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <EventIcon sx={{ color: '#9c27b0' }} />
                                                <Box>
                                                    <Typography variant="subtitle2">{event.title}</Typography>
                                                    <Typography variant="caption" color="#666">
                                                        {formatDate(event.eventDate)} at {event.startTime}
                                                    </Typography>
                                                </Box>
                                            </Box>
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