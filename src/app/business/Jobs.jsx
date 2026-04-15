// pages/Business/Jobs.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Container, Grid, Paper, Typography, Card, CardContent,
    Button, IconButton, Avatar, Chip, Divider, TextField,
    useMediaQuery, useTheme, Alert, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem,
    InputAdornment, Tooltip
} from '@mui/material';
import {
    Work as Briefcase,
    Add as Plus,
    Edit as Pencil,
    Delete as Trash,
    Visibility as Eye,
    CalendarToday as Calendar,
    LocationOn as MapPin,
    AttachMoney as Currency,
    AccessTime as Clock,
    CheckCircle as CheckCircle,
    Cancel as XCircle,
    Search as SearchIcon,
    Refresh as Refresh,
    Description as FileText
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import { getToken, logoutUser } from '../../services/auth';

export default function BusinessJobs() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [jobs, setJobs] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        status: 'all',
        sort: 'created_at',
        order: 'desc'
    });

    // Delete dialog
    const [deleteDialog, setDeleteDialog] = useState({ open: false, job: null, permanent: false });

    // View job dialog
    const [viewDialog, setViewDialog] = useState({ open: false, job: null });

    // Create/Edit form
    const [formOpen, setFormOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'full-time',
        salary: '',
        location: '',
        is_active: true
    });

    useEffect(() => {
        fetchJobs();
    }, [filters.page, filters.type, filters.status, filters.sort, filters.order]);

   const getAuthToken = () => {
        const token = getToken();
        if (!token) {
            setError('Authentication token not found. Please login again.');
            setTimeout(() => navigate('/app/login'), 2000);
            return null;
        }
        return token;
    };


    const fetchJobs = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                setError('Authentication token not found');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            const params = new URLSearchParams({
                page: filters.page,
                limit: filters.limit,
                ...(filters.search && { search: filters.search }),
                ...(filters.type !== 'all' && { type: filters.type }),
                ...(filters.status !== 'all' && { status: filters.status }),
                sort: filters.sort,
                order: filters.order
            });

            const response = await fetch(`${API_BASE}/business/jobs?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched jobs:', data);
            setJobs(data.jobs || []);
            setPagination(data.pagination);
            setError('');
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchJobs();
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateJob = () => {
        setEditingJob(null);
        setFormData({
            title: '',
            description: '',
            type: 'full-time',
            salary: '',
            location: '',
            is_active: true
        });
        setFormOpen(true);
    };

    const handleEditJob = (job) => {
        setEditingJob(job);
        setFormData({
            title: job.title || '',
            description: job.description || '',
            type: job.type || 'full-time',
            salary: job.salary || '',
            location: job.location || '',
            is_active: job.is_active
        });
        setFormOpen(true);
    };

    const handleSubmitJob = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = getAuthToken();
            if (!token) return;

            const url = editingJob 
                ? `${API_BASE}/business/jobs/${editingJob.id}`
                : `${API_BASE}/business/jobs`;
            
            const method = editingJob ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to save job');
            }

            setSuccess(editingJob ? 'Job updated successfully' : 'Job created successfully');
            setFormOpen(false);
            fetchJobs();
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving job:', err);
            setError('Failed to save job');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (job) => {
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${API_BASE}/business/jobs/${job.id}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_active: !job.is_active })
            });

            if (!response.ok) {
                throw new Error('Failed to toggle job status');
            }

            setSuccess(`Job ${job.is_active ? 'deactivated' : 'activated'} successfully`);
            fetchJobs();
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error toggling job status:', err);
            setError('Failed to update job status');
        }
    };

    const handleDeleteClick = (job, permanent = false) => {
        setDeleteDialog({ open: true, job, permanent });
    };

    const handleDeleteConfirm = async () => {
        const { job, permanent } = deleteDialog;
        try {
            const token = getAuthToken();
            if (!token) return;

            const url = permanent 
                ? `${API_BASE}/business/jobs/${job.id}/permanent`
                : `${API_BASE}/business/jobs/${job.id}`;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete job');
            }

            setSuccess(permanent ? 'Job permanently deleted' : 'Job deactivated successfully');
            setDeleteDialog({ open: false, job: null, permanent: false });
            fetchJobs();
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting job:', err);
            setError('Failed to delete job');
        }
    };

    const handleViewClick = (job) => {
        setViewDialog({ open: true, job });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            type: 'all',
            status: 'all',
            sort: 'created_at',
            order: 'desc',
            page: 1
        });
    };

    const getStatusChip = (isActive) => (
        <Chip
            size="small"
            icon={isActive ? <CheckCircle sx={{ fontSize: 16 }} /> : <XCircle sx={{ fontSize: 16 }} />}
            label={isActive ? 'Active' : 'Inactive'}
            sx={{
                bgcolor: isActive ? '#e8f5e8' : '#ffebee',
                color: isActive ? '#2e7d32' : '#c62828',
                '& .MuiChip-icon': {
                    color: isActive ? '#2e7d32' : '#c62828'
                }
            }}
        />
    );

    const getTypeChip = (type) => {
        const typeColors = {
            'full-time': { bg: '#e3f2fd', color: '#1976d2' },
            'part-time': { bg: '#fff3e0', color: '#e65100' },
            'contract': { bg: '#f3e5f5', color: '#7b1fa2' },
            'internship': { bg: '#e0f2f1', color: '#00796b' },
            'remote': { bg: '#e8eaf6', color: '#3f51b5' }
        };
        const colors = typeColors[type] || { bg: '#f5f5f5', color: '#666' };
        
        return (
            <Chip
                size="small"
                label={type?.replace('-', ' ') || 'Full Time'}
                sx={{
                    bgcolor: colors.bg,
                    color: colors.color,
                    textTransform: 'capitalize'
                }}
            />
        );
    };

    if (loading && jobs.length === 0) {
        return (
            <Box sx={styles.loadingContainer}>
                <CircularProgress size={60} sx={{ color: '#0003b1' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>Loading jobs...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={styles.container}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={styles.header}>
                    <Box>
                        <Typography variant="h4" sx={styles.title}>
                            Job Management
                        </Typography>
                        <Typography variant="body2" sx={styles.subtitle}>
                            Create and manage your job postings
                        </Typography>
                    </Box>
                    <Box sx={styles.headerActions}>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={fetchJobs}
                            sx={styles.refreshButton}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Plus />}
                            onClick={handleCreateJob}
                            sx={styles.createButton}
                        >
                            Post New Job
                        </Button>
                    </Box>
                </Box>

                {/* Error/Success Messages */}
                {error && (
                    <Alert 
                        severity="error" 
                        sx={styles.alert}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert 
                        severity="success" 
                        sx={styles.alert}
                        onClose={() => setSuccess('')}
                    >
                        {success}
                    </Alert>
                )}

                {/* Filters */}
                <Paper sx={styles.filtersPaper}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <form onSubmit={handleSearch}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search jobs by title, description, location..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: '#999' }} />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={styles.searchField}
                                />
                            </form>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Job Type</InputLabel>
                                <Select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    label="Job Type"
                                >
                                    <MenuItem value="all">All Types</MenuItem>
                                    <MenuItem value="full-time">Full Time</MenuItem>
                                    <MenuItem value="part-time">Part Time</MenuItem>
                                    <MenuItem value="contract">Contract</MenuItem>
                                    <MenuItem value="internship">Internship</MenuItem>
                                    <MenuItem value="remote">Remote</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    label="Status"
                                >
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Sort By</InputLabel>
                                <Select
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                    label="Sort By"
                                >
                                    <MenuItem value="created_at">Date Posted</MenuItem>
                                    <MenuItem value="title">Title</MenuItem>
                                    <MenuItem value="type">Job Type</MenuItem>
                                    <MenuItem value="location">Location</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => handleFilterChange('order', filters.order === 'asc' ? 'desc' : 'asc')}
                                    sx={styles.orderButton}
                                >
                                    {filters.order === 'asc' ? '↑ Asc' : '↓ Desc'}
                                </Button>
                                {(filters.search || filters.type !== 'all' || filters.status !== 'all') && (
                                    <Button
                                        variant="text"
                                        onClick={clearFilters}
                                        sx={styles.clearButton}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Jobs Table */}
                <Paper sx={styles.tablePaper}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Job Title</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Salary</TableCell>
                                    <TableCell>Posted Date</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {jobs.length > 0 ? (
                                    jobs.map((job) => (
                                        <TableRow key={job.id} hover>
                                            <TableCell>
                                                <Box sx={styles.tableCellWithIcon}>
                                                    <Avatar sx={styles.jobAvatar}>
                                                        {job.title?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {job.title}
                                                        </Typography>
                                                        {job.description && (
                                                            <Typography variant="caption" sx={{ color: '#666' }}>
                                                                {job.description.substring(0, 50)}...
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{getTypeChip(job.type)}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <MapPin sx={{ fontSize: 16, color: '#666' }} />
                                                    <Typography variant="body2">{job.location || 'Not specified'}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Currency sx={{ fontSize: 16, color: '#666' }} />
                                                    <Typography variant="body2">{job.salary || 'Not specified'}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Calendar sx={{ fontSize: 16, color: '#666' }} />
                                                    <Typography variant="body2">
                                                        {format(new Date(job.created_at), 'dd MMM yyyy')}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{getStatusChip(job.is_active)}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="View Details">
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => handleViewClick(job)}
                                                        sx={{ color: '#666' }}
                                                    >
                                                        <Eye fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => handleEditJob(job)}
                                                        sx={{ color: '#666' }}
                                                    >
                                                        <Pencil fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={job.is_active ? "Deactivate" : "Activate"}>
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => handleToggleStatus(job)}
                                                        sx={{ color: job.is_active ? '#f44336' : '#4CAF50' }}
                                                    >
                                                        {job.is_active ? 
                                                            <XCircle fontSize="small" /> : 
                                                            <CheckCircle fontSize="small" />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => handleDeleteClick(job, false)}
                                                        sx={{ color: '#f44336' }}
                                                    >
                                                        <Trash fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                            <Briefcase sx={{ fontSize: 48, color: '#ccc' }} />
                                            <Typography variant="h6" sx={{ color: '#999', mt: 2, mb: 1 }}>
                                                No Jobs Found
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
                                                {filters.search || filters.type !== 'all' || filters.status !== 'all' 
                                                    ? 'Try adjusting your filters' 
                                                    : 'Start by creating your first job posting'}
                                            </Typography>
                                            {(filters.search || filters.type !== 'all' || filters.status !== 'all') ? (
                                                <Button
                                                    variant="outlined"
                                                    onClick={clearFilters}
                                                    sx={styles.clearFiltersButton}
                                                >
                                                    Clear Filters
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Plus />}
                                                    onClick={handleCreateJob}
                                                    sx={styles.createButton}
                                                >
                                                    Post New Job
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <Box sx={styles.pagination}>
                            <Button
                                disabled={filters.page === 1}
                                onClick={() => handlePageChange(filters.page - 1)}
                                sx={styles.pageButton}
                            >
                                Previous
                            </Button>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Page {filters.page} of {pagination.pages}
                            </Typography>
                            <Button
                                disabled={filters.page === pagination.pages}
                                onClick={() => handlePageChange(filters.page + 1)}
                                sx={styles.pageButton}
                            >
                                Next
                            </Button>
                        </Box>
                    )}
                </Paper>

                {/* Stats Summary */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statsCard}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h4" sx={styles.statsNumber}>
                                            {pagination.total}
                                        </Typography>
                                        <Typography variant="body2" sx={styles.statsLabel}>
                                            Total Jobs
                                        </Typography>
                                    </Box>
                                    <Box sx={{ ...styles.statsIcon, bgcolor: '#0003b115', color: '#0003b1' }}>
                                        <Briefcase />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statsCard}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h4" sx={styles.statsNumber}>
                                            {jobs.filter(j => j.is_active).length}
                                        </Typography>
                                        <Typography variant="body2" sx={styles.statsLabel}>
                                            Active Jobs
                                        </Typography>
                                    </Box>
                                    <Box sx={{ ...styles.statsIcon, bgcolor: '#e8f5e8', color: '#2e7d32' }}>
                                        <CheckCircle />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statsCard}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h4" sx={styles.statsNumber}>
                                            {jobs.filter(j => !j.is_active).length}
                                        </Typography>
                                        <Typography variant="body2" sx={styles.statsLabel}>
                                            Inactive Jobs
                                        </Typography>
                                    </Box>
                                    <Box sx={{ ...styles.statsIcon, bgcolor: '#ffebee', color: '#c62828' }}>
                                        <XCircle />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statsCard}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h4" sx={styles.statsNumber}>
                                            {new Set(jobs.map(j => j.type)).size}
                                        </Typography>
                                        <Typography variant="body2" sx={styles.statsLabel}>
                                            Job Types
                                        </Typography>
                                    </Box>
                                    <Box sx={{ ...styles.statsIcon, bgcolor: '#f3e5f5', color: '#7b1fa2' }}>
                                        <FileText />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Create/Edit Job Dialog */}
            <Dialog 
                open={formOpen} 
                onClose={() => setFormOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: styles.dialog }}
            >
                <form onSubmit={handleSubmitJob}>
                    <DialogTitle sx={styles.dialogTitle}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {editingJob ? 'Edit Job' : 'Create New Job'}
                        </Typography>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Job Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    variant="outlined"
                                    size="small"
                                    sx={styles.formField}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth size="small" sx={styles.formField}>
                                    <InputLabel>Job Type</InputLabel>
                                    <Select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        label="Job Type"
                                        required
                                    >
                                        <MenuItem value="full-time">Full Time</MenuItem>
                                        <MenuItem value="part-time">Part Time</MenuItem>
                                        <MenuItem value="contract">Contract</MenuItem>
                                        <MenuItem value="internship">Internship</MenuItem>
                                        <MenuItem value="remote">Remote</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Salary"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="small"
                                    placeholder="e.g., $50,000 - $70,000"
                                    sx={styles.formField}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    size="small"
                                    placeholder="e.g., New York, NY or Remote"
                                    sx={styles.formField}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Job Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    multiline
                                    rows={6}
                                    placeholder="Describe the job responsibilities, requirements, benefits..."
                                    sx={styles.formField}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={styles.dialogActions}>
                        <Button 
                            onClick={() => setFormOpen(false)}
                            sx={styles.dialogCancelButton}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={styles.dialogSaveButton}
                        >
                            {loading ? <CircularProgress size={24} /> : (editingJob ? 'Update Job' : 'Create Job')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* View Job Dialog */}
            <Dialog 
                open={viewDialog.open} 
                onClose={() => setViewDialog({ open: false, job: null })}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: styles.dialog }}
            >
                {viewDialog.job && (
                    <>
                        <DialogTitle sx={styles.dialogTitle}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={styles.dialogAvatar}>
                                    {viewDialog.job.title?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {viewDialog.job.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                        {getTypeChip(viewDialog.job.type)}
                                        {getStatusChip(viewDialog.job.is_active)}
                                    </Box>
                                </Box>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                                        Location
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <MapPin sx={{ color: '#0003b1' }} />
                                        <Typography>{viewDialog.job.location || 'Not specified'}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                                        Salary
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Currency sx={{ color: '#0003b1' }} />
                                        <Typography>{viewDialog.job.salary || 'Not specified'}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                                        Posted Date
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Calendar sx={{ color: '#0003b1' }} />
                                        <Typography>
                                            {format(new Date(viewDialog.job.created_at), 'dd MMMM yyyy')}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                                        Last Updated
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Clock sx={{ color: '#0003b1' }} />
                                        <Typography>
                                            {viewDialog.job.updated_at 
                                                ? format(new Date(viewDialog.job.updated_at), 'dd MMMM yyyy')
                                                : 'Not updated'}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                                        Job Description
                                    </Typography>
                                    <Paper sx={styles.descriptionPaper}>
                                        <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                                            {viewDialog.job.description || 'No description provided'}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={styles.dialogActions}>
                            <Button 
                                onClick={() => setViewDialog({ open: false, job: null })}
                                sx={styles.dialogCancelButton}
                            >
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Pencil />}
                                onClick={() => {
                                    setViewDialog({ open: false, job: null });
                                    handleEditJob(viewDialog.job);
                                }}
                                sx={styles.dialogEditButton}
                            >
                                Edit Job
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog 
                open={deleteDialog.open} 
                onClose={() => setDeleteDialog({ open: false, job: null, permanent: false })}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: styles.dialog }}
            >
                <DialogTitle sx={styles.dialogTitle}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {deleteDialog.permanent ? 'Permanently Delete Job?' : 'Deactivate Job?'}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#666' }}>
                        {deleteDialog.permanent 
                            ? `Are you sure you want to permanently delete "${deleteDialog.job?.title}"? This action cannot be undone.`
                            : `Are you sure you want to deactivate "${deleteDialog.job?.title}"? The job will no longer be visible to users.`
                        }
                    </Typography>
                    {!deleteDialog.permanent && (
                        <Alert severity="info" sx={{ mt: 2, borderRadius: '8px' }}>
                            You can always activate the job again later.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button 
                        onClick={() => setDeleteDialog({ open: false, job: null, permanent: false })}
                        sx={styles.dialogCancelButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteConfirm}
                        sx={styles.dialogDeleteButton}
                    >
                        {deleteDialog.permanent ? 'Permanently Delete' : 'Deactivate'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        bgcolor: '#F8F8F8',
        py: { xs: 3, sm: 4, md: 5 }
    },
    loadingContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F8F8F8'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        mb: 4
    },
    title: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 800,
        color: '#1a1a1a',
        fontSize: { xs: '1.5rem', sm: '2rem' },
        mb: 1
    },
    subtitle: {
        color: '#666',
        fontSize: '0.95rem'
    },
    headerActions: {
        display: 'flex',
        gap: 2
    },
    refreshButton: {
        borderRadius: '12px',
        borderColor: '#ddd',
        color: '#666',
        '&:hover': {
            borderColor: '#0003b1',
            bgcolor: 'rgba(0, 3, 177, 0.04)'
        }
    },
    createButton: {
        borderRadius: '12px',
        bgcolor: '#0003b1',
        '&:hover': {
            bgcolor: '#000290'
        }
    },
    alert: {
        mb: 3,
        borderRadius: '12px'
    },
    filtersPaper: {
        p: 3,
        mb: 3,
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
    },
    searchField: {
        '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&:hover fieldset': {
                borderColor: '#0003b1'
            },
            '&.Mui-focused fieldset': {
                borderColor: '#0003b1'
            }
        }
    },
    orderButton: {
        borderRadius: '8px',
        borderColor: '#ddd',
        color: '#666',
        '&:hover': {
            borderColor: '#0003b1',
            bgcolor: 'rgba(0, 3, 177, 0.04)'
        }
    },
    clearButton: {
        borderRadius: '8px',
        color: '#f44336',
        minWidth: 'auto',
        '&:hover': {
            bgcolor: 'rgba(244, 67, 54, 0.04)'
        }
    },
    tablePaper: {
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        overflow: 'hidden'
    },
    tableCellWithIcon: {
        display: 'flex',
        alignItems: 'center',
        gap: 2
    },
    jobAvatar: {
        width: 40,
        height: 40,
        bgcolor: '#0003b115',
        color: '#0003b1',
        fontSize: '1rem'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        p: 3,
        borderTop: '1px solid #eee'
    },
    pageButton: {
        color: '#666',
        '&:hover': {
            bgcolor: 'rgba(0, 3, 177, 0.04)'
        },
        '&:disabled': {
            color: '#ccc'
        }
    },
    clearFiltersButton: {
        borderRadius: '8px',
        borderColor: '#f44336',
        color: '#f44336',
        '&:hover': {
            borderColor: '#d32f2f',
            bgcolor: 'rgba(244, 67, 54, 0.04)'
        }
    },
    statsCard: {
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
    },
    statsNumber: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 800,
        color: '#1a1a1a'
    },
    statsLabel: {
        color: '#666',
        mt: 0.5
    },
    statsIcon: {
        width: 48,
        height: 48,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dialog: {
        borderRadius: '16px'
    },
    dialogTitle: {
        p: 3,
        borderBottom: '1px solid #eee'
    },
    dialogAvatar: {
        width: 56,
        height: 56,
        bgcolor: '#0003b1',
        fontSize: '1.5rem'
    },
    formField: {
        '& .MuiOutlinedInput-root': {
            borderRadius: '8px'
        }
    },
    descriptionPaper: {
        p: 2,
        bgcolor: '#f5f5f5',
        borderRadius: '8px',
        maxHeight: 200,
        overflow: 'auto'
    },
    dialogActions: {
        p: 3,
        borderTop: '1px solid #eee',
        gap: 2
    },
    dialogCancelButton: {
        borderRadius: '8px',
        color: '#666',
        '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.04)'
        }
    },
    dialogSaveButton: {
        borderRadius: '8px',
        bgcolor: '#4CAF50',
        '&:hover': {
            bgcolor: '#43a047'
        }
    },
    dialogEditButton: {
        borderRadius: '8px',
        bgcolor: '#0003b1',
        '&:hover': {
            bgcolor: '#000290'
        }
    },
    dialogDeleteButton: {
        borderRadius: '8px',
        bgcolor: '#f44336',
        '&:hover': {
            bgcolor: '#d32f2f'
        }
    }
};