// pages/admin/VerifyShops.jsx (Fixed version)
import React, { useState, useEffect } from 'react';
import {
    Box, Container, Paper, Typography, Button, IconButton,
    TextField, InputAdornment, Chip, MenuItem, Select,
    FormControl, InputLabel, Grid, Dialog, DialogTitle,
    DialogContent, DialogActions, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    TablePagination, TableSortLabel, Tooltip, Avatar,
    CircularProgress, Alert, Breadcrumbs, Link as MuiLink,
    useMediaQuery, useTheme, Card, CardContent,
    Switch, FormControlLabel, Badge, Divider
} from '@mui/material';
import {
    CheckCircle as VerifyIcon,
    Cancel as RejectIcon,
    Visibility as ViewIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    Refresh as RefreshIcon,
    Store as StoreIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Warning as WarningIcon,
    Close as CloseIcon,
    Verified as VerifiedIcon,
    Block as BlockIcon,
    Category as CategoryIcon,
    Person as PersonIcon,
    CheckCircleOutline as PendingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, isValid, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';
import { getToken } from '../../services/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

// Safe date formatting function
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
        if (!isValid(date)) return 'Invalid date';
        return format(date, 'dd MMM yyyy');
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid date';
    }
};

// Safe days calculation
const getDaysPending = (dateString) => {
    if (!dateString) return 0;
    try {
        const created = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
        if (!isValid(created)) return 0;
        const now = new Date();
        const diffTime = Math.abs(now - created);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    } catch (error) {
        console.error('Days calculation error:', error);
        return 0;
    }
};

export default function VerifyShops() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State
    const [businesses, setBusinesses] = useState([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        unverified: 0,
        pending: 0
    });

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Sorting
    const [orderBy, setOrderBy] = useState('created_at');
    const [order, setOrder] = useState('desc');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('unverified');
    const [dateRange, setDateRange] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Selected business for dialogs
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    // Verification stats
    const [verificationStats, setVerificationStats] = useState({
        totalVerified: 0,
        totalRejected: 0,
        averageResponseTime: '0 days'
    });

    useEffect(() => {
        fetchUnverifiedBusinesses();
        fetchCategories();
        fetchVerificationStats();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [businesses, searchTerm, selectedCategory, verificationStatus, dateRange]);

    const getAuthToken = () => {
        const token = getToken();
        if (!token) {
            setError('Authentication token not found. Please login again.');
            setTimeout(() => navigate('/app/login'), 2000);
            return null;
        }
        return token;
    };

    const fetchUnverifiedBusinesses = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${API_BASE}/admin/businesses/unverified`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                localStorage.clear();
                setError('Session expired. Please login again.');
                setTimeout(() => navigate('/app/login'), 2000);
                return;
            }

            if (!response.ok) throw new Error('Failed to fetch businesses');

            const data = await response.json();
            setBusinesses(data.businesses || []);
            setFilteredBusinesses(data.businesses || []);
            
            setStats({
                total: data.stats?.total || 0,
                verified: data.stats?.verified || 0,
                unverified: data.stats?.unverified || 0,
                pending: data.stats?.pending || 0
            });
        } catch (err) {
            console.error('Error fetching businesses:', err);
            setError('Failed to load businesses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE}/admin/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setCategories(data.categories || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchVerificationStats = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE}/admin/verification/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setVerificationStats(data.stats || {
                totalVerified: 0,
                totalRejected: 0,
                averageResponseTime: '0 days'
            });
        } catch (err) {
            console.error('Error fetching verification stats:', err);
        }
    };

    const applyFilters = () => {
        let filtered = [...businesses];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(b => 
                b.shop_name?.toLowerCase().includes(term) ||
                b.owner_name?.toLowerCase().includes(term) ||
                b.phone?.includes(term) ||
                b.city?.toLowerCase().includes(term)
            );
        }

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(b => b.category_id === selectedCategory);
        }

        // Verification status filter
        if (verificationStatus !== 'all') {
            filtered = filtered.filter(b => {
                if (verificationStatus === 'verified') return b.is_verified === true;
                if (verificationStatus === 'unverified') return b.is_verified === false;
                if (verificationStatus === 'rejected') return b.verification_status === 'rejected';
                return true;
            });
        }

        // Date range filter
        const now = new Date();
        if (dateRange === 'today') {
            const today = new Date(now.setHours(0, 0, 0, 0));
            filtered = filtered.filter(b => {
                if (!b.created_at) return false;
                const created = new Date(b.created_at);
                return created >= today;
            });
        } else if (dateRange === 'week') {
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            filtered = filtered.filter(b => {
                if (!b.created_at) return false;
                const created = new Date(b.created_at);
                return created >= weekAgo;
            });
        } else if (dateRange === 'month') {
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            filtered = filtered.filter(b => {
                if (!b.created_at) return false;
                const created = new Date(b.created_at);
                return created >= monthAgo;
            });
        }

        setFilteredBusinesses(filtered);
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);

        const sorted = [...filteredBusinesses].sort((a, b) => {
            let aVal = a[property];
            let bVal = b[property];
            
            if (property === 'created_at') {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            }
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
        
        setFilteredBusinesses(sorted);
    };

    const handleViewBusiness = (business) => {
        setSelectedBusiness(business);
        setViewDialogOpen(true);
    };

    const handleVerifyBusiness = (business) => {
        setSelectedBusiness(business);
        setVerifyDialogOpen(true);
    };

    const handleRejectBusiness = (business) => {
        setSelectedBusiness(business);
        setRejectReason('');
        setRejectDialogOpen(true);
    };

// pages/admin/VerifyShops.jsx - Update handleVerifyConfirm function

const handleVerifyConfirm = async () => {
    try {
        const token = getAuthToken();
        if (!token) return;

        setLoading(true);
        const response = await fetch(`${API_BASE}/admin/businesses/${selectedBusiness.id}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                verified: true
                // Remove verified_by and verification_date - they'll be set on server
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to verify business');
        }

        setSuccess('Business verified successfully!');
        setVerifyDialogOpen(false);
        fetchUnverifiedBusinesses();
        fetchVerificationStats();
        setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
        console.error('Error verifying business:', err);
        setError(err.message || 'Failed to verify business');
        setTimeout(() => setError(''), 3000);
    } finally {
        setLoading(false);
    }
};

// Update handleRejectConfirm function
const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
        setError('Please provide a reason for rejection');
        return;
    }

    try {
        const token = getAuthToken();
        if (!token) return;

        setLoading(true);
        const response = await fetch(`${API_BASE}/admin/businesses/${selectedBusiness.id}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                rejection_reason: rejectReason
                // rejected_by will be set on server from token
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to reject business');
        }

        setSuccess('Business rejected successfully!');
        setRejectDialogOpen(false);
        fetchUnverifiedBusinesses();
        fetchVerificationStats();
        setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
        console.error('Error rejecting business:', err);
        setError(err.message || 'Failed to reject business');
        setTimeout(() => setError(''), 3000);
    } finally {
        setLoading(false);
    }
};



    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setVerificationStatus('unverified');
        setDateRange('all');
    };

    const exportToExcel = () => {
        try {
            const exportData = filteredBusinesses.map(b => ({
                'Shop Name': b.shop_name,
                'Owner Name': b.owner_name,
                'Phone': b.phone,
                'Category': categories.find(c => c.id === b.category_id)?.name || 'N/A',
                'City': b.city,
                'State': b.state,
                'Status': b.is_verified ? 'Verified' : (b.verification_status === 'rejected' ? 'Rejected' : 'Pending'),
                'Registered Date': formatDate(b.created_at),
                'Days Pending': getDaysPending(b.created_at)
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'PendingVerification');
            XLSX.writeFile(wb, `pending_verification_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
        } catch (err) {
            console.error('Export error:', err);
            setError('Failed to export data');
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'N/A';
    };

    const getStatusColor = (business) => {
        if (business.is_verified) return '#4CAF50';
        if (business.verification_status === 'rejected') return '#f44336';
        return '#FF9800';
    };

    const getStatusIcon = (business) => {
        if (business.is_verified) return <VerifiedIcon sx={{ color: '#4CAF50' }} />;
        if (business.verification_status === 'rejected') return <BlockIcon sx={{ color: '#f44336' }} />;
        return <PendingIcon sx={{ color: '#FF9800' }} />;
    };

    const paginatedBusinesses = filteredBusinesses.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (loading && businesses.length === 0) {
        return (
            <Box sx={styles.loadingContainer}>
                <CircularProgress size={60} sx={{ color: '#0003b1' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>Loading verification requests...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={styles.container}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={styles.header}>
                    <Box>
                        <Typography variant="h4" sx={styles.title}>Verify Shops & Clinics</Typography>
                        <Breadcrumbs sx={{ mt: 1 }}>
                            <MuiLink color="inherit" onClick={() => navigate('/admin/dashboard')} sx={{ cursor: 'pointer' }}>
                                Dashboard
                            </MuiLink>
                            <Typography color="text.primary">Verification</Typography>
                        </Breadcrumbs>
                    </Box>
                    <Box sx={styles.headerActions}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchUnverifiedBusinesses}
                            sx={styles.refreshButton}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<VerifyIcon />}
                            onClick={exportToExcel}
                            sx={styles.exportButton}
                        >
                            Export List
                        </Button>
                    </Box>
                </Box>

                {/* Messages */}
                {success && <Alert severity="success" sx={styles.alert}>{success}</Alert>}
                {error && <Alert severity="error" sx={styles.alert}>{error}</Alert>}

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statCard}>
                            <CardContent>
                                <Box sx={styles.statIcon}>
                                    <StoreIcon sx={{ color: '#0003b1' }} />
                                </Box>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {stats.total}
                                </Typography>
                                <Typography variant="body2" sx={styles.statLabel}>
                                    Total Businesses
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statCard}>
                            <CardContent>
                                <Box sx={styles.statIcon}>
                                    <PendingIcon sx={{ color: '#FF9800' }} />
                                </Box>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {stats.unverified}
                                </Typography>
                                <Typography variant="body2" sx={styles.statLabel}>
                                    Pending Verification
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statCard}>
                            <CardContent>
                                <Box sx={styles.statIcon}>
                                    <VerifiedIcon sx={{ color: '#4CAF50' }} />
                                </Box>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {verificationStats.totalVerified}
                                </Typography>
                                <Typography variant="body2" sx={styles.statLabel}>
                                    Verified This Month
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statCard}>
                            <CardContent>
                                <Box sx={styles.statIcon}>
                                    <PendingIcon sx={{ color: '#9C27B0' }} />
                                </Box>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {verificationStats.averageResponseTime}
                                </Typography>
                                <Typography variant="body2" sx={styles.statLabel}>
                                    Avg. Response Time
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper sx={styles.filterPaper}>
                    <Box sx={styles.filterBar}>
                        <TextField
                            placeholder="Search by shop, owner, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            sx={styles.searchField}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#999' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={() => setShowFilters(!showFilters)}
                            sx={styles.filterToggle}
                        >
                            Filters
                            {(searchTerm || selectedCategory || verificationStatus !== 'unverified' || dateRange !== 'all') && (
                                <Badge color="primary" variant="dot" sx={{ ml: 1 }} />
                            )}
                        </Button>
                        {(searchTerm || selectedCategory || verificationStatus !== 'unverified' || dateRange !== 'all') && (
                            <Button variant="text" onClick={clearFilters} sx={styles.clearButton}>
                                Clear All
                            </Button>
                        )}
                    </Box>

                    {showFilters && (
                        <Box sx={styles.filterExpanded}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            label="Category"
                                        >
                                            <MenuItem value="">All Categories</MenuItem>
                                            {categories.map(cat => (
                                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={verificationStatus}
                                            onChange={(e) => setVerificationStatus(e.target.value)}
                                            label="Status"
                                        >
                                            <MenuItem value="all">All</MenuItem>
                                            <MenuItem value="unverified">Pending</MenuItem>
                                            <MenuItem value="verified">Verified</MenuItem>
                                            <MenuItem value="rejected">Rejected</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Registered</InputLabel>
                                        <Select
                                            value={dateRange}
                                            onChange={(e) => setDateRange(e.target.value)}
                                            label="Registered"
                                        >
                                            <MenuItem value="all">All Time</MenuItem>
                                            <MenuItem value="today">Today</MenuItem>
                                            <MenuItem value="week">Last 7 Days</MenuItem>
                                            <MenuItem value="month">Last 30 Days</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Paper>

                {/* Results Info */}
                <Box sx={styles.resultsInfo}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        Showing {paginatedBusinesses.length} of {filteredBusinesses.length} pending verifications
                    </Typography>
                </Box>

                {/* Businesses Table */}
                <TableContainer component={Paper} sx={styles.tableContainer}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={styles.tableHeader}>S.No</TableCell>
                                <TableCell sx={styles.tableHeader}>
                                    <TableSortLabel
                                        active={orderBy === 'shop_name'}
                                        direction={orderBy === 'shop_name' ? order : 'asc'}
                                        onClick={() => handleSort('shop_name')}
                                    >
                                        Shop Details
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={styles.tableHeader}>Category</TableCell>
                                <TableCell sx={styles.tableHeader}>Contact</TableCell>
                                <TableCell sx={styles.tableHeader}>Location</TableCell>
                                <TableCell sx={styles.tableHeader}>
                                    <TableSortLabel
                                        active={orderBy === 'created_at'}
                                        direction={orderBy === 'created_at' ? order : 'asc'}
                                        onClick={() => handleSort('created_at')}
                                    >
                                        Registered
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={styles.tableHeader}>Status</TableCell>
                                <TableCell sx={styles.tableHeader} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedBusinesses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <Box sx={styles.emptyState}>
                                            <VerifiedIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                                            <Typography variant="h6" sx={{ color: '#999' }}>
                                                No pending verifications
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#aaa' }}>
                                                All businesses have been verified
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedBusinesses.map((business, index) => (
                                    <TableRow key={business.id} hover sx={styles.tableRow}>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>
                                            <Box sx={styles.shopCell}>
                                                <Avatar sx={styles.shopAvatar}>
                                                    {business.shop_name?.charAt(0) || '?'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {business.shop_name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#666' }}>
                                                        {business.owner_name}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getCategoryName(business.category_id)}
                                                size="small"
                                                sx={styles.categoryChip}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={styles.phoneCell}>
                                                <PhoneIcon fontSize="small" sx={{ color: '#999', mr: 1 }} />
                                                {business.phone}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={styles.locationCell}>
                                                <LocationIcon fontSize="small" sx={{ color: '#999', mr: 1 }} />
                                                {business.city}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2">
                                                    {formatDate(business.created_at)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#FF9800' }}>
                                                    {getDaysPending(business.created_at)} days ago
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={styles.statusCell}>
                                                {getStatusIcon(business)}
                                                <Chip
                                                    label={business.is_verified ? 'Verified' : 'Pending'}
                                                    size="small"
                                                    sx={{
                                                        ...styles.statusChip,
                                                        bgcolor: business.is_verified ? '#e8f5e8' : '#fff3e0',
                                                        color: business.is_verified ? '#2e7d32' : '#e65100'
                                                    }}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={styles.actionButtons}>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleViewBusiness(business)}
                                                        sx={styles.actionButton}
                                                    >
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Verify">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleVerifyBusiness(business)}
                                                        sx={{ ...styles.actionButton, color: '#4CAF50' }}
                                                    >
                                                        <VerifyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reject">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRejectBusiness(business)}
                                                        sx={{ ...styles.actionButton, color: '#f44336' }}
                                                    >
                                                        <RejectIcon fontSize="small" />
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

                {/* Pagination */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredBusinesses.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    sx={styles.pagination}
                />
            </Container>

            {/* View Details Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: styles.dialog }}
            >
                <DialogTitle sx={styles.dialogTitle}>
                    <Box sx={styles.dialogTitleContent}>
                        <Typography variant="h6">Business Details</Typography>
                        <IconButton onClick={() => setViewDialogOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedBusiness && (
                        <Grid container spacing={3}>
                            {/* Header Section */}
                            <Grid item xs={12}>
                                <Box sx={styles.detailHeader}>
                                    <Avatar sx={styles.detailAvatar}>
                                        {selectedBusiness.shop_name?.charAt(0) || '?'}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                            {selectedBusiness.shop_name}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#666' }}>
                                            {selectedBusiness.owner_name}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        icon={getStatusIcon(selectedBusiness)}
                                        label={selectedBusiness.is_verified ? 'Verified' : 'Pending Verification'}
                                        sx={{
                                            ml: 'auto',
                                            bgcolor: selectedBusiness.is_verified ? '#e8f5e8' : '#fff3e0',
                                            color: selectedBusiness.is_verified ? '#2e7d32' : '#e65100'
                                        }}
                                    />
                                </Box>
                            </Grid>

                            <Divider sx={{ width: '100%' }} />

                            {/* Business Information */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0003b1', mb: 2 }}>
                                    Business Information
                                </Typography>
                                <Box sx={styles.infoSection}>
                                    <Box sx={styles.infoRow}>
                                        <PersonIcon sx={styles.infoIcon} />
                                        <Box>
                                            <Typography variant="caption" sx={styles.infoLabel}>Owner Name</Typography>
                                            <Typography variant="body2" sx={styles.infoValue}>{selectedBusiness.owner_name}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={styles.infoRow}>
                                        <StoreIcon sx={styles.infoIcon} />
                                        <Box>
                                            <Typography variant="caption" sx={styles.infoLabel}>Shop Name</Typography>
                                            <Typography variant="body2" sx={styles.infoValue}>{selectedBusiness.shop_name}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={styles.infoRow}>
                                        <CategoryIcon sx={styles.infoIcon} />
                                        <Box>
                                            <Typography variant="caption" sx={styles.infoLabel}>Category</Typography>
                                            <Typography variant="body2" sx={styles.infoValue}>
                                                {getCategoryName(selectedBusiness.category_id)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={styles.infoRow}>
                                        <PhoneIcon sx={styles.infoIcon} />
                                        <Box>
                                            <Typography variant="caption" sx={styles.infoLabel}>Phone</Typography>
                                            <Typography variant="body2" sx={styles.infoValue}>{selectedBusiness.phone}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Location Information */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0003b1', mb: 2 }}>
                                    Location Details
                                </Typography>
                                <Box sx={styles.infoSection}>
                                    <Box sx={styles.infoRow}>
                                        <LocationIcon sx={styles.infoIcon} />
                                        <Box>
                                            <Typography variant="caption" sx={styles.infoLabel}>Street</Typography>
                                            <Typography variant="body2" sx={styles.infoValue}>{selectedBusiness.street || 'N/A'}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={styles.infoRow}>
                                        <LocationIcon sx={styles.infoIcon} />
                                        <Box>
                                            <Typography variant="caption" sx={styles.infoLabel}>City</Typography>
                                            <Typography variant="body2" sx={styles.infoValue}>{selectedBusiness.city}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={styles.infoRow}>
                                        <LocationIcon sx={styles.infoIcon} />
                                        <Box>
                                            <Typography variant="caption" sx={styles.infoLabel}>State</Typography>
                                            <Typography variant="body2" sx={styles.infoValue}>{selectedBusiness.state}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={styles.infoRow}>
                                        <LocationIcon sx={styles.infoIcon} />
                                        <Box>
                                            <Typography variant="caption" sx={styles.infoLabel}>Coordinates</Typography>
                                            <Typography variant="body2" sx={styles.infoValue}>
                                                {selectedBusiness.latitude?.toFixed(6)}, {selectedBusiness.longitude?.toFixed(6)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Keywords Section */}
                            {selectedBusiness.keywords && selectedBusiness.keywords.length > 0 && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0003b1', mb: 2 }}>
                                        Keywords
                                    </Typography>
                                    <Box sx={styles.keywordsContainer}>
                                        {selectedBusiness.keywords.map((kw, idx) => (
                                            <Chip
                                                key={idx}
                                                label={kw.keyword}
                                                sx={styles.keywordChip}
                                                size="small"
                                            />
                                        ))}
                                    </Box>
                                </Grid>
                            )}

                            {/* Registration Timeline */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0003b1', mb: 2 }}>
                                    Registration Timeline
                                </Typography>
                                <Box sx={styles.timelineBox}>
                                    <Box sx={styles.timelineItem}>
                                        <Box sx={styles.timelineDot} />
                                        <Box sx={styles.timelineContent}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                Registered
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#666' }}>
                                                {formatDate(selectedBusiness.created_at)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={styles.timelineItem}>
                                        <Box sx={{ ...styles.timelineDot, bgcolor: selectedBusiness.is_verified ? '#4CAF50' : '#FF9800' }} />
                                        <Box sx={styles.timelineContent}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {selectedBusiness.is_verified ? 'Verified' : 'Pending Verification'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#666' }}>
                                                {selectedBusiness.is_verified 
                                                    ? formatDate(selectedBusiness.updated_at)
                                                    : `Waiting for ${getDaysPending(selectedBusiness.created_at)} days`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button
                        variant="outlined"
                        onClick={() => setViewDialogOpen(false)}
                        sx={styles.dialogButton}
                    >
                        Close
                    </Button>
                    {selectedBusiness && !selectedBusiness.is_verified && (
                        <>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    setViewDialogOpen(false);
                                    handleRejectBusiness(selectedBusiness);
                                }}
                                sx={styles.dialogButton}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setViewDialogOpen(false);
                                    handleVerifyBusiness(selectedBusiness);
                                }}
                                sx={{ ...styles.dialogButton, bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
                            >
                                Verify
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Verify Confirmation Dialog */}
            <Dialog
                open={verifyDialogOpen}
                onClose={() => setVerifyDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: styles.dialog }}
            >
                <DialogTitle sx={styles.dialogTitle}>
                    <Box sx={styles.dialogTitleContent}>
                        <Typography variant="h6">Confirm Verification</Typography>
                        <IconButton onClick={() => setVerifyDialogOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={styles.verifyContent}>
                        <VerifiedIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 2, color: '#1a1a1a' }}>
                            Verify this business?
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', mb: 3 }}>
                            You are about to verify "{selectedBusiness?.shop_name}". 
                            This will mark the business as verified and it will appear in search results.
                        </Typography>
                        <Paper sx={styles.verifySummary}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Verification Summary
                            </Typography>
                            <Box sx={styles.summaryRow}>
                                <Typography variant="body2">Business Name:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedBusiness?.shop_name}</Typography>
                            </Box>
                            <Box sx={styles.summaryRow}>
                                <Typography variant="body2">Owner:</Typography>
                                <Typography variant="body2">{selectedBusiness?.owner_name}</Typography>
                            </Box>
                            <Box sx={styles.summaryRow}>
                                <Typography variant="body2">Category:</Typography>
                                <Typography variant="body2">{getCategoryName(selectedBusiness?.category_id)}</Typography>
                            </Box>
                            <Box sx={styles.summaryRow}>
                                <Typography variant="body2">Registered:</Typography>
                                <Typography variant="body2">
                                    {formatDate(selectedBusiness?.created_at)}
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button
                        onClick={() => setVerifyDialogOpen(false)}
                        variant="outlined"
                        sx={styles.dialogButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleVerifyConfirm}
                        variant="contained"
                        disabled={loading}
                        sx={{ ...styles.dialogButton, bgcolor: '#4CAF50', '&:hover': { bgcolor: '#45a049' } }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Confirm Verification'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog
                open={rejectDialogOpen}
                onClose={() => setRejectDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: styles.dialog }}
            >
                <DialogTitle sx={styles.dialogTitle}>
                    <Box sx={styles.dialogTitleContent}>
                        <Typography variant="h6">Reject Business</Typography>
                        <IconButton onClick={() => setRejectDialogOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={styles.rejectContent}>
                        <WarningIcon sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1, color: '#1a1a1a' }}>
                            Reject "{selectedBusiness?.shop_name}"?
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                            Please provide a reason for rejection. This will be sent to the business owner.
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Rejection Reason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g., Invalid documents, incomplete information, etc."
                            sx={styles.rejectInput}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button
                        onClick={() => setRejectDialogOpen(false)}
                        variant="outlined"
                        sx={styles.dialogButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRejectConfirm}
                        variant="contained"
                        color="error"
                        disabled={loading || !rejectReason.trim()}
                        sx={styles.dialogButton}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Confirm Rejection'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// Styles
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
        fontSize: { xs: '1.5rem', sm: '2rem' }
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
    exportButton: {
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
    statCard: {
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: '12px',
        bgcolor: 'rgba(0, 3, 177, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2
    },
    statNumber: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 800,
        fontSize: '1.8rem',
        color: '#1a1a1a'
    },
    statLabel: {
        color: '#666',
        fontWeight: 500
    },
    filterPaper: {
        p: 2,
        mb: 3,
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
    },
    filterBar: {
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    searchField: {
        flex: { xs: 1, sm: 2, md: 3 },
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            bgcolor: '#FBFAFA'
        }
    },
    filterToggle: {
        borderRadius: '12px',
        borderColor: '#ddd',
        color: '#666',
        minWidth: 100
    },
    clearButton: {
        color: '#0003b1',
        '&:hover': {
            bgcolor: 'rgba(0, 3, 177, 0.04)'
        }
    },
    filterExpanded: {
        mt: 2,
        pt: 2,
        borderTop: '1px solid #eee'
    },
    resultsInfo: {
        mb: 2,
        px: 1
    },
    tableContainer: {
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        maxHeight: 'calc(100vh - 500px)',
        overflow: 'auto'
    },
    tableHeader: {
        bgcolor: '#F5F5F5',
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 700,
        color: '#1a1a1a'
    },
    tableRow: {
        '&:hover': {
            bgcolor: 'rgba(0, 3, 177, 0.02)'
        }
    },
    shopCell: {
        display: 'flex',
        alignItems: 'center',
        gap: 2
    },
    shopAvatar: {
        width: 40,
        height: 40,
        borderRadius: '10px',
        bgcolor: 'rgba(0, 3, 177, 0.1)',
        color: '#0003b1',
        fontWeight: 600
    },
    categoryChip: {
        bgcolor: 'rgba(0, 3, 177, 0.1)',
        color: '#0003b1',
        fontWeight: 500
    },
    phoneCell: {
        display: 'flex',
        alignItems: 'center'
    },
    locationCell: {
        display: 'flex',
        alignItems: 'center'
    },
    statusCell: {
        display: 'flex',
        alignItems: 'center',
        gap: 1
    },
    statusChip: {
        fontWeight: 600,
        fontSize: '0.7rem'
    },
    actionButtons: {
        display: 'flex',
        gap: 0.5,
        justifyContent: 'center'
    },
    actionButton: {
        color: '#666',
        '&:hover': {
            color: '#0003b1',
            bgcolor: 'rgba(0, 3, 177, 0.04)'
        }
    },
    pagination: {
        mt: 3,
        borderRadius: '16px',
        bgcolor: 'white',
        p: 2
    },
    emptyState: {
        textAlign: 'center',
        py: 5
    },
    dialog: {
        borderRadius: '24px'
    },
    dialogTitle: {
        borderBottom: '1px solid #eee'
    },
    dialogTitleContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    detailHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap'
    },
    detailAvatar: {
        width: 64,
        height: 64,
        bgcolor: 'rgba(0, 3, 177, 0.1)',
        color: '#0003b1',
        fontSize: '1.5rem'
    },
    infoSection: {
        bgcolor: '#F8F8F8',
        borderRadius: '12px',
        p: 2
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 2,
        '&:last-child': {
            mb: 0
        }
    },
    infoIcon: {
        color: '#0003b1',
        fontSize: '1.2rem'
    },
    infoLabel: {
        color: '#666',
        fontSize: '0.7rem',
        display: 'block',
        mb: 0.5
    },
    infoValue: {
        color: '#1a1a1a',
        fontWeight: 500
    },
    keywordsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        p: 2,
        bgcolor: '#F8F8F8',
        borderRadius: '12px'
    },
    keywordChip: {
        bgcolor: 'rgba(0, 3, 177, 0.06)',
        color: '#0003b1',
        fontWeight: 500
    },
    timelineBox: {
        position: 'relative',
        pl: 3,
        '&::before': {
            content: '""',
            position: 'absolute',
            left: 11,
            top: 10,
            bottom: 10,
            width: 2,
            bgcolor: '#ddd'
        }
    },
    timelineItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        mb: 3,
        position: 'relative'
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: '50%',
        bgcolor: '#0003b1',
        mt: 1,
        zIndex: 1
    },
    timelineContent: {
        flex: 1
    },
    dialogActions: {
        p: 3,
        gap: 2
    },
    dialogButton: {
        borderRadius: '12px',
        px: 3,
        py: 1,
        textTransform: 'none',
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 600
    },
    verifyContent: {
        textAlign: 'center',
        py: 2
    },
    verifySummary: {
        p: 2,
        bgcolor: '#F8F8F8',
        borderRadius: '12px',
        mt: 2
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        mb: 1,
        '&:last-child': {
            mb: 0
        }
    },
    rejectContent: {
        textAlign: 'center',
        py: 2
    },
    rejectInput: {
        mt: 2,
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            bgcolor: '#FBFAFA'
        }
    }
};