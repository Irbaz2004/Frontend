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
    Divider,
    Rating
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Work as WorkIcon,
    Business as BusinessIcon,
    MoreVert as MoreVertIcon,
    Refresh as RefreshIcon,
    LocationOn as LocationIcon,
    AttachMoney as MoneyIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useAdmin } from '../../../hooks/useAdmin';
import { formatDate, timeAgo, formatNumber, formatCurrency } from '../../../utils/formatting';

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pageSize: 20 });
    const [filters, setFilters] = useState({ search: '', status: '', type: '' });
    const [selectedJob, setSelectedJob] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [applicationsOpen, setApplicationsOpen] = useState(false);
    const [applications, setApplications] = useState([]);

    const { fetchAllJobs, toggleJobStatus, deleteJob } = useAdmin();

    useEffect(() => {
        loadJobs();
    }, [pagination.page, filters]);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const result = await fetchAllJobs({
                page: pagination.page,
                limit: pagination.pageSize,
                ...filters
            });
            setJobs(result.jobs);
            setPagination(prev => ({ ...prev, total: result.pagination.total }));
        } catch (error) {
            console.error('Error loading jobs:', error);
            setError('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleMenuOpen = (event, job) => {
        setSelectedJob(job);
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
            if (dialogAction === 'activate') {
                await toggleJobStatus(selectedJob.id, true);
                setSuccess('Job activated successfully');
            } else if (dialogAction === 'deactivate') {
                await toggleJobStatus(selectedJob.id, false);
                setSuccess('Job deactivated');
            } else if (dialogAction === 'delete') {
                await deleteJob(selectedJob.id);
                setSuccess('Job deleted');
            }
            await loadJobs();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
            setSelectedJob(null);
        }
    };

    const handleViewDetails = () => {
        setDetailsOpen(true);
        handleMenuClose();
    };

    const handleViewApplications = async () => {
        try {
            // Fetch applications for this job
            // const data = await fetchJobApplications(selectedJob.id);
            // setApplications(data);
            setApplicationsOpen(true);
        } catch (error) {
            setError('Failed to load applications');
        }
        handleMenuClose();
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        {
            field: 'title',
            headerName: 'Job Title',
            width: 250,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: '#f4433620', color: '#f44336' }}>
                        <WorkIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {params.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            {params.row.business?.business_name}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: 'jobType',
            headerName: 'Type',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value?.replace('_', ' ')}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'salary',
            headerName: 'Salary',
            width: 120,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MoneyIcon sx={{ fontSize: 16, color: '#4caf50', mr: 0.5 }} />
                    <Typography variant="body2">
                        {params.row.salaryMin && params.row.salaryMax
                            ? `${formatCurrency(params.row.salaryMin)} - ${formatCurrency(params.row.salaryMax)}`
                            : 'Negotiable'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'applicationsCount',
            headerName: 'Applications',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value || 0}
                    size="small"
                    color={params.value > 0 ? 'primary' : 'default'}
                />
            )
        },
        {
            field: 'openings',
            headerName: 'Openings',
            width: 80,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.row.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={params.row.isActive ? 'success' : 'default'}
                />
            )
        },
        {
            field: 'createdAt',
            headerName: 'Posted',
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
                    Job Management
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadJobs}
                >
                    Refresh
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            placeholder="Search jobs..."
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
                            label="Job Type"
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            size="small"
                        >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="full_time">Full Time</MenuItem>
                            <MenuItem value="part_time">Part Time</MenuItem>
                            <MenuItem value="contract">Contract</MenuItem>
                            <MenuItem value="internship">Internship</MenuItem>
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
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={loadJobs}
                        >
                            Apply Filters
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

            {/* Jobs Table */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <DataGrid
                    rows={jobs}
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
                <MenuItem onClick={handleViewApplications}>
                    <BusinessIcon sx={{ mr: 1, fontSize: 20 }} />
                    View Applications
                </MenuItem>
                {selectedJob?.isActive ? (
                    <MenuItem onClick={() => handleAction('deactivate')}>
                        <CancelIcon sx={{ mr: 1, fontSize: 20, color: '#ff9800' }} />
                        Deactivate
                    </MenuItem>
                ) : (
                    <MenuItem onClick={() => handleAction('activate')}>
                        <CheckCircleIcon sx={{ mr: 1, fontSize: 20, color: '#4caf50' }} />
                        Activate
                    </MenuItem>
                )}
                <MenuItem onClick={() => handleAction('delete')} sx={{ color: '#f44336' }}>
                    <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>
                    {dialogAction === 'activate' && 'Activate Job'}
                    {dialogAction === 'deactivate' && 'Deactivate Job'}
                    {dialogAction === 'delete' && 'Delete Job'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to {dialogAction}{' '}
                        <strong>{selectedJob?.title}</strong>?
                        {dialogAction === 'delete' && (
                            <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                                This action cannot be undone. All applications will be lost.
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
                        <Avatar sx={{ bgcolor: '#f44336' }}>
                            <WorkIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6">{selectedJob?.title}</Typography>
                            <Typography variant="body2" color="#666">
                                {selectedJob?.business?.business_name}
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedJob && (
                        <Grid container spacing={3}>
                            {/* Basic Info */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                    Job Description
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    {selectedJob.description}
                                </Typography>
                            </Grid>

                            {/* Details */}
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                        Job Details
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="#666">Type:</Typography>
                                            <Chip
                                                label={selectedJob.jobType?.replace('_', ' ')}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="#666">Experience:</Typography>
                                            <Typography variant="body2">{selectedJob.experienceRequired || 'Fresher'}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="#666">Openings:</Typography>
                                            <Typography variant="body2">{selectedJob.openings}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="#666">Applications:</Typography>
                                            <Chip
                                                label={selectedJob.applicationsCount || 0}
                                                size="small"
                                                color={selectedJob.applicationsCount > 0 ? 'primary' : 'default'}
                                            />
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>

                            {/* Salary & Location */}
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                        Compensation
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MoneyIcon sx={{ color: '#4caf50' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {selectedJob.salaryMin && selectedJob.salaryMax
                                                    ? `${formatCurrency(selectedJob.salaryMin)} - ${formatCurrency(selectedJob.salaryMax)}`
                                                    : 'Negotiable'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationIcon sx={{ color: '#f44336' }} />
                                            <Typography variant="body2">
                                                {selectedJob.business?.city}, {selectedJob.business?.area}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ScheduleIcon sx={{ color: '#ff9800' }} />
                                            <Typography variant="body2">
                                                Posted {timeAgo(selectedJob.createdAt)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>

                            {/* Requirements */}
                            {selectedJob.requirements && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                        Requirements
                                    </Typography>
                                    <Typography variant="body2">{selectedJob.requirements}</Typography>
                                </Grid>
                            )}

                            {/* Skills */}
                            {selectedJob.skillsRequired?.length > 0 && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                        Required Skills
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {selectedJob.skillsRequired.map((skill, idx) => (
                                            <Chip key={idx} label={skill} variant="outlined" />
                                        ))}
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Applications Dialog */}
            <Dialog open={applicationsOpen} onClose={() => setApplicationsOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Applications for {selectedJob?.title}
                </DialogTitle>
                <DialogContent dividers>
                    {applications.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <WorkIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                            <Typography color="#666">No applications yet</Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {applications.map((app) => (
                                <Grid item xs={12} key={app.id}>
                                    <Card variant="outlined" sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="subtitle2">
                                                    {app.user?.fullName}
                                                </Typography>
                                                <Typography variant="caption" color="#666">
                                                    Applied {timeAgo(app.appliedAt)}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={app.status}
                                                size="small"
                                                color={
                                                    app.status === 'pending' ? 'warning' :
                                                    app.status === 'shortlisted' ? 'info' :
                                                    app.status === 'hired' ? 'success' : 'default'
                                                }
                                            />
                                        </Box>
                                        {app.coverLetter && (
                                            <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                                                {app.coverLetter}
                                            </Typography>
                                        )}
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApplicationsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}