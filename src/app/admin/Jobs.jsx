// app/admin/Jobs.jsx
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
    Slider,
    Switch,
    FormControlLabel,
    Tab,
    Tabs
} from '@mui/material';
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Work as WorkIcon,
    LocationOn as LocationOnIcon,
    Phone as PhoneIcon,
    Close as CloseIcon,
    Edit as EditIcon,
    Block as BlockIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import {
    getAllJobs,
    getJobByIdForAdmin,
    toggleJobStatus,
    toggleJobOpen,
    deleteJob,
    getJobStatistics,
    bulkAction,
    getJobTypesList,
    updateJob
} from '../../services/adminJob';

export default function AdminJobs() {
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [jobTypeFilter, setJobTypeFilter] = useState('');
    const [jobTypes, setJobTypes] = useState([]);
    const [salaryRange, setSalaryRange] = useState([0, 100000]);
    const [stats, setStats] = useState(null);
    const [selectedJobs, setSelectedJobs] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);
    const [editForm, setEditForm] = useState({
        job_title: '',
        company_name: '',
        salary: '',
        salary_type: 'month',
        qualification: '',
        job_type: 'full_time',
        area: '',
        city: '',
        state: '',
        is_open: true
    });

    useEffect(() => {
        loadJobs();
        loadStats();
        loadJobTypes();
    }, [page, rowsPerPage, statusFilter, jobTypeFilter, salaryRange]);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const result = await getAllJobs({
                page: page + 1,
                limit: rowsPerPage,
                search,
                status: statusFilter,
                job_type: jobTypeFilter,
                min_salary: salaryRange[0],
                max_salary: salaryRange[1]
            });
            setJobs(result.jobs || []);
            setTotal(result.total || 0);
        } catch (error) {
            showSnackbar('Failed to load jobs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const result = await getJobStatistics();
            setStats(result.stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const loadJobTypes = async () => {
        try {
            const result = await getJobTypesList();
            setJobTypes(result.job_types || []);
        } catch (error) {
            console.error('Failed to load job types:', error);
        }
    };

    const handleSearch = () => {
        setPage(0);
        loadJobs();
    };

    const handleToggleStatus = async (id, isActive) => {
        try {
            await toggleJobStatus(id, !isActive);
            showSnackbar(`Job ${!isActive ? 'activated' : 'deactivated'} successfully`);
            loadJobs();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleToggleOpen = async (id, isOpen) => {
        try {
            await toggleJobOpen(id, !isOpen);
            showSnackbar(`Job is now ${!isOpen ? 'open' : 'closed'} for applications`);
            loadJobs();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleDelete = async () => {
        if (!jobToDelete) return;
        
        try {
            await deleteJob(jobToDelete.id);
            showSnackbar('Job deleted successfully');
            setOpenDeleteDialog(false);
            setJobToDelete(null);
            loadJobs();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedJobs.length === 0) {
            showSnackbar('No jobs selected', 'warning');
            return;
        }

        try {
            await bulkAction(selectedJobs, action);
            showSnackbar(`${selectedJobs.length} jobs ${action}d successfully`);
            setSelectedJobs([]);
            loadJobs();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleUpdateJob = async () => {
        if (!editForm.job_title || !editForm.company_name || !editForm.salary) {
            showSnackbar('Please fill required fields', 'error');
            return;
        }

        try {
            await updateJob(selectedJob.id, editForm);
            showSnackbar('Job updated successfully');
            setOpenEditDialog(false);
            loadJobs();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedJobs(jobs.map(job => job.id));
        } else {
            setSelectedJobs([]);
        }
    };

    const handleSelectJob = (event, id) => {
        if (event.target.checked) {
            setSelectedJobs([...selectedJobs, id]);
        } else {
            setSelectedJobs(selectedJobs.filter(jobId => jobId !== id));
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const openEditDialogHandler = (job) => {
        setSelectedJob(job);
        setEditForm({
            job_title: job.job_title || '',
            company_name: job.company_name || '',
            salary: job.salary || '',
            salary_type: job.salary_type || 'month',
            qualification: job.qualification || '',
            job_type: job.job_type || 'full_time',
            area: job.area || '',
            city: job.city || '',
            state: job.state || '',
            is_open: job.is_open || true
        });
        setOpenEditDialog(true);
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

    const getStatusChip = (isActive, isOpen) => {
        if (!isActive) {
            return <Chip label="Inactive" size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', borderRadius: 1 }} />;
        }
        if (isOpen) {
            return <Chip label="Open" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', borderRadius: 1 }} />;
        }
        return <Chip label="Closed" size="small" sx={{ bgcolor: '#fef3c7', color: '#d97706', borderRadius: 1 }} />;
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header */}
            <Typography variant="h4" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600, mb: 3 }}>
                Manage Jobs
            </Typography>

            {/* Statistics Cards */}
            {stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Total Jobs" value={stats.total} icon={<WorkIcon />} color="#3b82f6" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Active Jobs" value={stats.active} icon={<CheckCircleIcon />} color="#10b981" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Open Positions" value={stats.open} icon={<CheckIcon />} color="#8b5cf6" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Closed Positions" value={stats.closed} icon={<BlockIcon />} color="#f59e0b" />
                    </Grid>
                </Grid>
            )}

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, border: '1px solid #e8ecef', boxShadow: 'none', borderRadius: 2 }}>
                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    {selectedJobs.length > 0 && (
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleBulkAction('activate')}
                                sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#10b981' }}
                            >
                                Activate Selected
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleBulkAction('deactivate')}
                                sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#ef4444' }}
                            >
                                Deactivate Selected
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleBulkAction('open')}
                                sx={{ textTransform: 'none', borderRadius: 2 }}
                            >
                                Open Selected
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleBulkAction('close')}
                                sx={{ textTransform: 'none', borderRadius: 2 }}
                            >
                                Close Selected
                            </Button>
                        </Stack>
                    )}
                    
                    <TextField
                        placeholder="Search by title, company, employer..."
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
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Job Type</InputLabel>
                        <Select
                            value={jobTypeFilter}
                            onChange={(e) => setJobTypeFilter(e.target.value)}
                            label="Job Type"
                        >
                            <MenuItem value="">All Types</MenuItem>
                            {jobTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type === 'full_time' ? 'Full Time' : 'Part Time'}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <Box sx={{ minWidth: 200 }}>
                        <Typography variant="caption" color="#5a6e8a">Salary Range (₹)</Typography>
                        <Slider
                            value={salaryRange}
                            onChange={(e, val) => setSalaryRange(val)}
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
                            setJobTypeFilter('');
                            setSalaryRange([0, 100000]);
                            setPage(0);
                            loadJobs();
                        }}
                        startIcon={<RefreshIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Reset
                    </Button>
                </Box>
            </Paper>

            {/* Jobs Table */}
            <Paper sx={{ border: '1px solid #e8ecef', boxShadow: 'none', borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)', overflow: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox" sx={{ bgcolor: '#f8f9fa' }}>
                                    <Checkbox
                                        checked={selectedJobs.length === jobs.length && jobs.length > 0}
                                        indeterminate={selectedJobs.length > 0 && selectedJobs.length < jobs.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Job Details</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Employer</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Location</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Salary</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Job Type</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Posted Date</TableCell>
                                <TableCell align="center" sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                        <CircularProgress sx={{ color: '#325fec' }} />
                                    </TableCell>
                                </TableRow>
                            ) : jobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                        <Typography color="#6b7280">No jobs found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                jobs.map((job) => (
                                    <TableRow key={job.id} hover>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedJobs.includes(job.id)}
                                                onChange={(e) => handleSelectJob(e, job.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {job.job_title}
                                                </Typography>
                                                <Typography variant="caption" color="#6b7280">
                                                    {job.company_name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{job.employer_name}</Typography>
                                            <Typography variant="caption" color="#6b7280">
                                                {job.employer_phone}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{job.area}</Typography>
                                            <Typography variant="caption" color="#6b7280">
                                                {job.city}, {job.state}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600} color="#325fec">
                                                {formatPrice(job.salary)}/{job.salary_type === 'month' ? 'month' : 'day'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={job.job_type === 'full_time' ? 'Full Time' : 'Part Time'} 
                                                size="small" 
                                                sx={{ borderRadius: 1 }}
                                            />
                                        </TableCell>
                                        <TableCell>{getStatusChip(job.is_active, job.is_open)}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" gap={1} justifyContent="center">
                                                <Tooltip title="View Details">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={async () => {
                                                            const result = await getJobByIdForAdmin(job.id);
                                                            setSelectedJob(result.job);
                                                            setOpenViewDialog(true);
                                                        }}
                                                        sx={{ color: '#325fec' }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => openEditDialogHandler(job)}
                                                        sx={{ color: '#f59e0b' }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={job.is_active ? "Deactivate" : "Activate"}>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleToggleStatus(job.id, job.is_active)}
                                                        sx={{ color: job.is_active ? '#ef4444' : '#10b981' }}
                                                    >
                                                        {job.is_active ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={job.is_open ? "Close Position" : "Open Position"}>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleToggleOpen(job.id, job.is_open)}
                                                        sx={{ color: job.is_open ? '#f59e0b' : '#10b981' }}
                                                    >
                                                        {job.is_open ? <BlockIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => {
                                                            setJobToDelete(job);
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

            {/* View Job Dialog */}
            <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Job Details
                    <IconButton onClick={() => setOpenViewDialog(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedJob && (
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                {selectedJob.job_title}
                            </Typography>
                            <Typography variant="body2" color="#5a6e8a" sx={{ mb: 2 }}>
                                {selectedJob.shop_name || selectedJob.company_name}
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="#6b7280">Salary</Typography>
                                    <Typography variant="body1" fontWeight={600} color="#325fec">
                                        {formatPrice(selectedJob.salary)}/{selectedJob.salary_type === 'month' ? 'month' : 'day'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="#6b7280">Job Type</Typography>
                                    <Typography variant="body1">{selectedJob.job_type === 'full_time' ? 'Full Time' : 'Part Time'}</Typography>
                                </Grid>
                                {selectedJob.qualification && (
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="#6b7280">Qualification Required</Typography>
                                        <Typography variant="body2">{selectedJob.qualification}</Typography>
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="#6b7280">Location</Typography>
                                    <Typography variant="body1">{selectedJob.area}, {selectedJob.city}, {selectedJob.state}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="#6b7280">Employer</Typography>
                                    <Typography variant="body1">{selectedJob.employer_name}</Typography>
                                    <Typography variant="body2" color="#6b7280">{selectedJob.employer_phone}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="#6b7280">Posted Date</Typography>
                                    <Typography variant="body1">{new Date(selectedJob.created_at).toLocaleString()}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="#6b7280">Applications Received</Typography>
                                    <Typography variant="body1">{selectedJob.application_count || 0}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Job Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Job</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Job Title" value={editForm.job_title} onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Company Name" value={editForm.company_name} onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Salary" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Salary Type</InputLabel>
                                <Select value={editForm.salary_type} onChange={(e) => setEditForm({ ...editForm, salary_type: e.target.value })} label="Salary Type">
                                    <MenuItem value="month">Per Month</MenuItem>
                                    <MenuItem value="day">Per Day</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Qualification Required" value={editForm.qualification} onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Job Type</InputLabel>
                                <Select value={editForm.job_type} onChange={(e) => setEditForm({ ...editForm, job_type: e.target.value })} label="Job Type">
                                    <MenuItem value="full_time">Full Time</MenuItem>
                                    <MenuItem value="part_time">Part Time</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Area" value={editForm.area} onChange={(e) => setEditForm({ ...editForm, area: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="City" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="State" value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={editForm.is_open} onChange={(e) => setEditForm({ ...editForm, is_open: e.target.checked })} />}
                                label="Position is Open"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleUpdateJob} variant="contained">Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the job posting for <strong>{jobToDelete?.job_title}</strong> at <strong>{jobToDelete?.company_name}</strong>?
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