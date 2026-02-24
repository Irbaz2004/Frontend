import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Chip,
    Button,
    TextField,
    InputAdornment,
    Menu,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Pagination,
    Alert,
    Paper,
    Slider
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Sort as SortIcon,
    LocationOn as LocationIcon,
    Work as WorkIcon,
    AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useJobs } from '../../../hooks/useJobs';
import { useLocation } from '../../../hooks/useLocation';
import JobCard from '../components/JobCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { JOB_TYPES } from '../../../utils/constants';

export default function JobsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAnchor, setFilterAnchor] = useState(null);
    const [sortAnchor, setSortAnchor] = useState(null);
    const [salaryRange, setSalaryRange] = useState([0, 100000]);
    
    const { location } = useLocation();
    const {
        jobs,
        loading,
        error,
        pagination,
        filters,
        updateFilters,
        fetchJobs,
        hasMore
    } = useJobs();

    useEffect(() => {
        fetchJobs(1, {
            ...filters,
            search: searchTerm
        });
    }, [location, filters, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (key, value) => {
        updateFilters({ [key]: value });
        setFilterAnchor(null);
    };

    const handleSortChange = (value) => {
        updateFilters({ sort: value });
        setSortAnchor(null);
    };

    const handlePageChange = (event, value) => {
        fetchJobs(value);
    };

    const filterOptions = [
        { key: 'type', label: 'Job Type', options: JOB_TYPES },
        { key: 'experience', label: 'Experience', options: ['Fresher', '1-3 years', '3-5 years', '5+ years'] }
    ];

    return (
        <Box sx={{ bgcolor: '#f8f8f8', minHeight: '100vh', pb: 8 }}>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        Jobs Near You
                    </Typography>
                </Box>

                {/* Search and Filters */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Search jobs by title or company..."
                                value={searchTerm}
                                onChange={handleSearch}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchTerm && (
                                        <InputAdornment position="end">
                                            <Chip
                                                label="Clear"
                                                size="small"
                                                onDelete={() => setSearchTerm('')}
                                            />
                                        </InputAdornment>
                                    )
                                }}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<FilterIcon />}
                                onClick={(e) => setFilterAnchor(e.currentTarget)}
                                endIcon={<Chip label={Object.keys(filters).length} size="small" color="error" />}
                            >
                                Filters
                            </Button>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<SortIcon />}
                                onClick={(e) => setSortAnchor(e.currentTarget)}
                            >
                                Sort: {filters.sort || 'Recent'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Active Filters */}
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {filters.type && (
                        <Chip
                            label={`Type: ${filters.type}`}
                            onDelete={() => updateFilters({ type: '' })}
                        />
                    )}
                    {filters.experience && (
                        <Chip
                            label={`Exp: ${filters.experience}`}
                            onDelete={() => updateFilters({ experience: '' })}
                        />
                    )}
                    {filters.minSalary && (
                        <Chip
                            label={`Min: ₹${filters.minSalary}`}
                            onDelete={() => updateFilters({ minSalary: '' })}
                        />
                    )}
                </Box>

                {/* Results Count */}
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                    Found {pagination.total} jobs
                </Typography>

                {/* Error Message */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Jobs Grid */}
                {loading ? (
                    <LoadingSkeleton />
                ) : jobs.length === 0 ? (
                    <EmptyState
                        icon={<WorkIcon sx={{ fontSize: 64 }} />}
                        title="No jobs found"
                        description="Try adjusting your filters or search term"
                        action={
                            <Button variant="outlined" onClick={() => updateFilters({})}>
                                Clear Filters
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <Grid container spacing={2}>
                            {jobs.map((job) => (
                                <Grid item xs={12} key={job.id}>
                                    <JobCard job={job} />
                                </Grid>
                            ))}
                        </Grid>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination
                                    count={pagination.pages}
                                    page={pagination.page}
                                    onChange={handlePageChange}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </>
                )}

                {/* Filter Menu */}
                <Menu
                    anchorEl={filterAnchor}
                    open={Boolean(filterAnchor)}
                    onClose={() => setFilterAnchor(null)}
                >
                    {filterOptions.map((filter) => (
                        <div key={filter.key}>
                            <MenuItem disabled>
                                <Typography variant="subtitle2">{filter.label}</Typography>
                            </MenuItem>
                            {filter.options.map((option) => (
                                <MenuItem
                                    key={option}
                                    onClick={() => handleFilterChange(filter.key, option)}
                                    sx={{ pl: 4 }}
                                >
                                    {option}
                                </MenuItem>
                            ))}
                        </div>
                    ))}
                    <Divider />
                    <MenuItem onClick={() => handleFilterChange('minSalary', 10000)}>
                        <MoneyIcon sx={{ mr: 1, fontSize: 20 }} />
                        Min Salary: ₹10k+
                    </MenuItem>
                    <MenuItem onClick={() => handleFilterChange('minSalary', 25000)}>
                        <MoneyIcon sx={{ mr: 1, fontSize: 20 }} />
                        Min Salary: ₹25k+
                    </MenuItem>
                    <MenuItem onClick={() => handleFilterChange('minSalary', 50000)}>
                        <MoneyIcon sx={{ mr: 1, fontSize: 20 }} />
                        Min Salary: ₹50k+
                    </MenuItem>
                </Menu>

                {/* Sort Menu */}
                <Menu
                    anchorEl={sortAnchor}
                    open={Boolean(sortAnchor)}
                    onClose={() => setSortAnchor(null)}
                >
                    <MenuItem onClick={() => handleSortChange('recent')}>Most Recent</MenuItem>
                    <MenuItem onClick={() => handleSortChange('salary_high')}>Salary: High to Low</MenuItem>
                    <MenuItem onClick={() => handleSortChange('salary_low')}>Salary: Low to High</MenuItem>
                    <MenuItem onClick={() => handleSortChange('distance')}>Nearest First</MenuItem>
                </Menu>
            </Container>
        </Box>
    );
}