// app/user/Jobs.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
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
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Close as CloseIcon,
    Phone as PhoneIcon,
    Work as WorkIcon,
    AttachMoney as MoneyIcon,
    Clear as ClearIcon,
    Business as BusinessIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { getJobsByLocation, getJobById, getJobFilterOptions, applyForJob } from '../../services/jobs';
import { useAuth } from '../context/AuthContext';

export default function Jobs() {
    const { isAuthenticated, user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(true);
    const [filterOptions, setFilterOptions] = useState({ job_types: [], min_salary: 0, max_salary: 100000, job_titles: [] });
    
    // Filters
    const [radius, setRadius] = useState(10);
    const [salaryRange, setSalaryRange] = useState([0, 100000]);
    const [jobType, setJobType] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    
    // Selected job for details
    const [selectedJob, setSelectedJob] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [applying, setApplying] = useState(false);
    const [applyDialogOpen, setApplyDialogOpen] = useState(false);

    useEffect(() => {
        getCurrentLocation();
        loadFilterOptions();
    }, []);

    useEffect(() => {
        if (userLocation) {
            loadJobs();
        }
    }, [userLocation, radius, salaryRange, jobType, jobTitle, searchTerm, currentPage]);

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
                    setError('Unable to get your location. Showing all jobs.');
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

    const loadFilterOptions = async () => {
        try {
            const result = await getJobFilterOptions();
            setFilterOptions(result.filters);
            setSalaryRange([result.filters.min_salary, result.filters.max_salary]);
        } catch (err) {
            console.error('Error loading filter options:', err);
        }
    };

    const loadJobs = async () => {
        if (!userLocation) return;
        
        setLoading(true);
        try {
            const result = await getJobsByLocation({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                radius,
                min_salary: salaryRange[0],
                max_salary: salaryRange[1],
                job_type: jobType,
                job_title: jobTitle,
                search: searchTerm,
                page: currentPage,
                limit: 12
            });
            
            setJobs(result.jobs || []);
            setTotalPages(result.totalPages || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJobClick = async (job) => {
        setLoadingDetails(true);
        setDetailsOpen(true);
        try {
            const result = await getJobById(job.id, userLocation);
            setSelectedJob(result.job);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleApply = async () => {
        if (!isAuthenticated) {
            setError('Please login to apply for this job');
            return;
        }
        
        setApplying(true);
        try {
            await applyForJob(selectedJob.id);
            setSuccess('Application submitted successfully!');
            setApplyDialogOpen(false);
            setDetailsOpen(false);
            loadJobs();
        } catch (err) {
            setError(err.message);
        } finally {
            setApplying(false);
        }
    };

    const clearFilters = () => {
        setRadius(10);
        setSalaryRange([filterOptions.min_salary, filterOptions.max_salary]);
        setJobType('');
        setJobTitle('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    const getJobTypeChip = (type) => {
        if (type === 'full_time') {
            return <Chip label="Full Time" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', borderRadius: 1 }} />;
        }
        return <Chip label="Part Time" size="small" sx={{ bgcolor: '#fef3c7', color: '#d97706', borderRadius: 1 }} />;
    };

    const JobSkeleton = () => (
        <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
                <Skeleton variant="text" width="80%" height={28} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rectangular" width={80} height={24} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                </Box>
            </CardContent>
        </Card>
    );

    const FilterContent = () => (
        <Box sx={{ p: 2, width: isMobile ? '100%' : 320 }}>
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
            
            <Typography variant="subtitle2" gutterBottom>
                Salary Range (per month)
            </Typography>
            <Slider
                value={salaryRange}
                onChange={(e, val) => setSalaryRange(val)}
                min={filterOptions.min_salary}
                max={filterOptions.max_salary}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
                sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="caption">₹{salaryRange[0].toLocaleString()}</Typography>
                <Typography variant="caption">₹{salaryRange[1].toLocaleString()}</Typography>
            </Box>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Job Type</InputLabel>
                <Select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    label="Job Type"
                >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="full_time">Full Time</MenuItem>
                    <MenuItem value="part_time">Part Time</MenuItem>
                </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Job Title</InputLabel>
                <Select
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    label="Job Title"
                >
                    <MenuItem value="">All Titles</MenuItem>
                    {filterOptions.job_titles?.map((title) => (
                        <MenuItem key={title} value={title}>{title}</MenuItem>
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
                    Jobs Near You
                </Typography>
                {userLocation && (
                    <Typography variant="body2" color="#5a6e8a">
                        Showing jobs within {radius} km radius
                    </Typography>
                )}
            </Box>

            {/* Search and Filter Bar */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e8ecef', boxShadow: 'none' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Search by job title, company, or location..."
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
                    Found {jobs.length} jobs
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ borderRadius: 2 }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}
            </Box>

            {/* Jobs Grid */}
            <Grid container spacing={3}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                            <JobSkeleton />
                        </Grid>
                    ))
                ) : jobs.length === 0 ? (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                            <WorkIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                No jobs found
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
                    jobs.map((job) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={job.id}>
                            <Card 
                                sx={{ 
                                    borderRadius: 2, 
                                    border: '1px solid #e8ecef', 
                                    boxShadow: 'none',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                                    }
                                }}
                                onClick={() => handleJobClick(job)}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>
                                            {job.job_title}
                                        </Typography>
                                        {job.shop_verified && (
                                            <Tooltip title="Verified Employer">
                                                <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                                            </Tooltip>
                                        )}
                                    </Box>
                                    
                                    <Typography variant="body2" color="#5a6e8a" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <BusinessIcon sx={{ fontSize: 14 }} />
                                        {job.company_name}
                                    </Typography>
                                    
                                    <Typography variant="h6" sx={{ color: '#325fec', fontWeight: 700, mb: 1 }}>
                                        {formatPrice(job.salary)}<span style={{ fontSize: '0.75rem', fontWeight: 400 }}>/{job.salary_type === 'month' ? 'month' : 'day'}</span>
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <LocationIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                                        <Typography variant="caption" color="#5a6e8a">
                                            {job.area}, {job.city}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                        {getJobTypeChip(job.job_type)}
                                        {job.distance && (
                                            <Chip 
                                                label={`${job.distance.toFixed(1)} km away`} 
                                                size="small" 
                                                sx={{ borderRadius: 1, bgcolor: '#e8f0fe', color: '#325fec' }}
                                            />
                                        )}
                                        {job.is_open && (
                                            <Chip 
                                                label="Open" 
                                                size="small" 
                                                sx={{ borderRadius: 1, bgcolor: '#dcfce7', color: '#16a34a' }}
                                            />
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
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

            {/* Job Details Drawer */}
            <Drawer
                anchor="right"
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                PaperProps={{ sx: { width: isMobile ? '100%' : 500, borderRadius: { xs: 0, md: '16px 0 0 16px' } } }}
            >
                {loadingDetails ? (
                    <Box sx={{ p: 3 }}>
                        <Skeleton variant="text" height={40} />
                        <Skeleton variant="text" height={30} />
                        <Skeleton variant="text" height={20} />
                        <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
                        <Skeleton variant="rectangular" height={50} sx={{ mt: 2 }} />
                    </Box>
                ) : selectedJob && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <Box sx={{ p: 3, bgcolor: '#325fec', color: 'white' }}>
                            <IconButton
                                onClick={() => setDetailsOpen(false)}
                                sx={{ position: 'absolute', top: 8, right: 8, color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
                            >
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h5" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 700, mb: 1, pr: 4 }}>
                                {selectedJob.job_title}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <BusinessIcon sx={{ fontSize: 16 }} />
                                {selectedJob.shop_name || selectedJob.company_name}
                            </Typography>
                        </Box>

                        {/* Content */}
                        <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
                            {/* Salary */}
                            <Paper sx={{ p: 2, mb: 3, bgcolor: '#e8f0fe', borderRadius: 2 }}>
                                <Typography variant="caption" color="#5a6e8a">Salary</Typography>
                                <Typography variant="h4" sx={{ color: '#325fec', fontWeight: 700 }}>
                                    {formatPrice(selectedJob.salary)}<span style={{ fontSize: '1rem', fontWeight: 400 }}>/{selectedJob.salary_type === 'month' ? 'month' : 'day'}</span>
                                </Typography>
                            </Paper>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Job Details */}
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Job Details
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <WorkIcon sx={{ fontSize: 18, color: '#5a6e8a' }} />
                                        <Typography variant="body2">
                                            {selectedJob.job_type === 'full_time' ? 'Full Time' : 'Part Time'}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationIcon sx={{ fontSize: 18, color: '#5a6e8a' }} />
                                        <Typography variant="body2">
                                            {selectedJob.area}, {selectedJob.city}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                            
                            {selectedJob.qualification && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        Qualification Required
                                    </Typography>
                                    <Typography variant="body2" color="#5a6e8a" sx={{ mb: 2 }}>
                                        {selectedJob.qualification}
                                    </Typography>
                                </>
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Contact Info */}
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Contact Information
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PhoneIcon sx={{ fontSize: 18, color: '#5a6e8a' }} />
                                <Typography variant="body2">
                                    {selectedJob.employer_phone || 'Not available'}
                                </Typography>
                            </Box>
                            
                            {/* Distance */}
                            {selectedJob.distance && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="#5a6e8a">
                                        Distance from you: {selectedJob.distance.toFixed(1)} km
                                    </Typography>
                                </Box>
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Action Buttons */}
                            <Stack direction="row" spacing={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<SendIcon />}
                                    onClick={() => setApplyDialogOpen(true)}
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    Apply Now
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                )}
            </Drawer>

            {/* Apply Confirmation Dialog */}
            <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Application</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to apply for the position of <strong>{selectedJob?.job_title}</strong> at <strong>{selectedJob?.company_name}</strong>?
                    </Typography>
                    {!isAuthenticated && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Please login to apply for this job.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleApply} 
                        variant="contained" 
                        disabled={!isAuthenticated || applying}
                    >
                        {applying ? <CircularProgress size={20} /> : 'Confirm Apply'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}