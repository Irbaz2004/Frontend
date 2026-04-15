// pages/admin/Business.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Container, Paper, Typography, Button, IconButton,
    TextField, InputAdornment, Chip, MenuItem, Select,
    FormControl, InputLabel, Grid, Dialog, DialogTitle,
    DialogContent, DialogActions, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow,
    TablePagination, TableSortLabel, Tooltip, Avatar,
    CircularProgress, Alert, Breadcrumbs, Link as MuiLink,
    useMediaQuery, useTheme, Divider, Card, CardContent,
    Stack, Switch, FormControlLabel, Toolbar, InputBase,
    Badge, Menu, ListItemIcon, ListItemText, Checkbox,
    FormGroup, Rating, LinearProgress, Tab, Tabs
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    FileDownload as ExportIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    Add as AddIcon,
    Close as CloseIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Refresh as RefreshIcon,
    Category as CategoryIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Store as StoreIcon,
    Person as PersonIcon,
    CheckCircle as VerifiedIcon,
    Block as BlockIcon,
    Warning as WarningIcon,
    ArrowBack as ArrowBackIcon,
    MoreVert as MoreVertIcon,
    KeyboardArrowDown as ArrowDownIcon,
    DateRange as DateIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { getToken } from '../../services/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`business-tabpanel-${index}`}
            aria-labelledby={`business-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function BusinessManagement() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // State
    const [businesses, setBusinesses] = useState([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [categories, setCategories] = useState([]);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Sorting
    const [orderBy, setOrderBy] = useState('created_at');
    const [order, setOrder] = useState('desc');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [verifiedFilter, setVerifiedFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Selected business for dialogs
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        shop_name: '',
        owner_name: '',
        phone: '',
        category_id: '',
        street: '',
        city: '',
        state: '',
        latitude: '',
        longitude: '',
        is_verified: false,
        is_active: true
    });

    // Export menu
    const [exportAnchorEl, setExportAnchorEl] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);

    // Selected tab
    const [tabValue, setTabValue] = useState(0);

    // Fetch businesses on component mount
    useEffect(() => {
        fetchBusinesses();
        fetchCategories();
    }, []);

    // Apply filters whenever filter criteria change
    useEffect(() => {
        applyFilters();
    }, [businesses, searchTerm, selectedCategory, startDate, endDate, verifiedFilter, statusFilter]);


const getAuthToken = () => {
    const token = localStorage.getItem('nearzo_token');
    if (!token) {
        setError('Authentication token not found. Please login again.');
        // Redirect to login after 2 seconds
        setTimeout(() => navigate('/app/login'), 2000);
        return null;
    }
    return token;
};



 const fetchBusinesses = async () => {
    setLoading(true);
    try {
        const token = getAuthToken();
        if (!token) return;

        const response = await fetch(`${API_BASE}/admin/businesses`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('nearzo_token');
            localStorage.removeItem('nearzo_user');
            localStorage.removeItem('nearzo_role');
            setError('Session expired. Please login again.');
            setTimeout(() => navigate('/app/login'), 2000);
            return;
        }

        if (!response.ok) throw new Error('Failed to fetch businesses');

        const data = await response.json();
        setBusinesses(data.businesses || []);
        setFilteredBusinesses(data.businesses || []);
    } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Failed to load businesses. Please try again.');
    } finally {
        setLoading(false);
    }
};

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE}/auth/categories`);
            const data = await response.json();
            setCategories(data.categories || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
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

        // Date range filter
        if (startDate) {
            filtered = filtered.filter(b => 
                new Date(b.created_at) >= new Date(startDate)
            );
        }
        if (endDate) {
            filtered = filtered.filter(b => 
                new Date(b.created_at) <= new Date(endDate)
            );
        }

        // Verified filter
        if (verifiedFilter !== 'all') {
            filtered = filtered.filter(b => 
                b.is_verified === (verifiedFilter === 'verified')
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(b => 
                b.is_active === (statusFilter === 'active')
            );
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
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
        
        setFilteredBusinesses(sorted);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setStartDate(null);
        setEndDate(null);
        setVerifiedFilter('all');
        setStatusFilter('all');
    };

    // View Business
    const handleViewBusiness = (business) => {
        setSelectedBusiness(business);
        setViewDialogOpen(true);
    };

    // Edit Business
    const handleEditBusiness = (business) => {
        setSelectedBusiness(business);
        setEditForm({
            shop_name: business.shop_name || '',
            owner_name: business.owner_name || '',
            phone: business.phone || '',
            category_id: business.category_id || '',
            street: business.street || '',
            city: business.city || '',
            state: business.state || '',
            latitude: business.latitude || '',
            longitude: business.longitude || '',
            is_verified: business.is_verified || false,
            is_active: business.is_active !== false
        });
        setEditDialogOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

 const handleEditSubmit = async () => {
    try {
        const token = getAuthToken();
        if (!token) return;

        setLoading(true);
        const response = await fetch(`${API_BASE}/admin/businesses/${selectedBusiness.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(editForm)
        });

        if (response.status === 401) {
            localStorage.removeItem('nearzo_token');
            localStorage.removeItem('nearzo_user');
            localStorage.removeItem('nearzo_role');
            setError('Session expired. Please login again.');
            setEditDialogOpen(false);
            setTimeout(() => navigate('/app/login'), 2000);
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update business');
        }

        setSuccess('Business updated successfully!');
        setEditDialogOpen(false);
        fetchBusinesses();
        
        setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
        console.error('Error updating business:', err);
        setError(err.message || 'Failed to update business. Please try again.');
        setTimeout(() => setError(''), 3000);
    } finally {
        setLoading(false);
    }
};

    // Delete Business
    const handleDeleteBusiness = (business) => {
        setSelectedBusiness(business);
        setDeleteDialogOpen(true);
    };

  const handleDeleteConfirm = async () => {
    try {
        const token = getAuthToken();
        if (!token) return;

        setLoading(true);
        const response = await fetch(`${API_BASE}/admin/businesses/${selectedBusiness.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('nearzo_token');
            localStorage.removeItem('nearzo_user');
            localStorage.removeItem('nearzo_role');
            setError('Session expired. Please login again.');
            setDeleteDialogOpen(false);
            setTimeout(() => navigate('/app/login'), 2000);
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete business');
        }

        setSuccess('Business deleted successfully!');
        setDeleteDialogOpen(false);
        fetchBusinesses();
        
        setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
        console.error('Error deleting business:', err);
        setError(err.message || 'Failed to delete business. Please try again.');
        setTimeout(() => setError(''), 3000);
    } finally {
        setLoading(false);
    }
};

    // Export to Excel
    const handleExportClick = (event) => {
        setExportAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setExportAnchorEl(null);
    };

    const exportToExcel = (type = 'all') => {
        setExportLoading(true);
        setExportAnchorEl(null);

        try {
            let dataToExport = type === 'filtered' ? filteredBusinesses : businesses;

            // Prepare data for export
            const exportData = dataToExport.map(b => ({
                'Shop Name': b.shop_name,
                'Owner Name': b.owner_name,
                'Phone': b.phone,
                'Category': categories.find(c => c.id === b.category_id)?.name || 'N/A',
                'Street': b.street || '',
                'City': b.city,
                'State': b.state,
                'Latitude': b.latitude,
                'Longitude': b.longitude,
                'Verified': b.is_verified ? 'Yes' : 'No',
                'Status': b.is_active ? 'Active' : 'Inactive',
                'Created Date': format(new Date(b.created_at), 'dd/MM/yyyy HH:mm'),
                'Keywords': b.keywords?.map(k => k.keyword).join(', ') || ''
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Businesses');

            // Generate filename
            const filename = `businesses_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;

            // Save file
            XLSX.writeFile(wb, filename);
        } catch (err) {
            console.error('Export error:', err);
            setError('Failed to export data');
            setTimeout(() => setError(''), 3000);
        } finally {
            setExportLoading(false);
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'N/A';
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'dd MMM yyyy');
        } catch {
            return 'N/A';
        }
    };

    // Pagination
    const paginatedBusinesses = filteredBusinesses.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (loading) {
        return (
            <Box sx={styles.loadingContainer}>
                <CircularProgress size={60} sx={{ color: '#0003b1' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
                    Loading businesses...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={styles.container}>
            {/* Header */}
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
                <Box sx={styles.header}>
                    <Box>
                        <Typography variant="h4" sx={styles.title}>
                            Business Management
                        </Typography>
                        <Breadcrumbs sx={{ mt: 1 }}>
                            <MuiLink 
                                color="inherit" 
                                href="/admin/dashboard"
                                sx={{ cursor: 'pointer', textDecoration: 'none' }}
                                onClick={(e) => { e.preventDefault(); navigate('/admin/dashboard'); }}
                            >
                                Dashboard
                            </MuiLink>
                            <Typography color="text.primary">Businesses</Typography>
                        </Breadcrumbs>
                    </Box>
                    <Box sx={styles.headerActions}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchBusinesses}
                            sx={styles.refreshButton}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<ExportIcon />}
                            onClick={handleExportClick}
                            disabled={exportLoading}
                            sx={styles.exportButton}
                        >
                            {exportLoading ? 'Exporting...' : 'Export'}
                        </Button>
                        <Menu
                            anchorEl={exportAnchorEl}
                            open={Boolean(exportAnchorEl)}
                            onClose={handleExportClose}
                            PaperProps={{
                                sx: styles.exportMenu
                            }}
                        >
                            <MenuItem onClick={() => exportToExcel('all')}>
                                <ListItemText>Export All Businesses</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => exportToExcel('filtered')}>
                                <ListItemText>Export Filtered Results</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {/* Success/Error Messages */}
                {success && (
                    <Alert severity="success" sx={styles.alert} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={styles.alert} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statCard}>
                            <CardContent>
                                <Box sx={styles.statIcon}>
                                    <StoreIcon sx={{ color: '#0003b1' }} />
                                </Box>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {businesses.length}
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
                                    <VerifiedIcon sx={{ color: '#4CAF50' }} />
                                </Box>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {businesses.filter(b => b.is_verified).length}
                                </Typography>
                                <Typography variant="body2" sx={styles.statLabel}>
                                    Verified
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statCard}>
                            <CardContent>
                                <Box sx={styles.statIcon}>
                                    <CategoryIcon sx={{ color: '#FF9800' }} />
                                </Box>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {categories.length}
                                </Typography>
                                <Typography variant="body2" sx={styles.statLabel}>
                                    Categories
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statCard}>
                            <CardContent>
                                <Box sx={styles.statIcon}>
                                    <PersonIcon sx={{ color: '#9C27B0' }} />
                                </Box>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {new Set(businesses.map(b => b.city)).size}
                                </Typography>
                                <Typography variant="body2" sx={styles.statLabel}>
                                    Cities Covered
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs */}
                <Box sx={styles.tabsContainer}>
                    <Tabs 
                        value={tabValue} 
                        onChange={(e, v) => setTabValue(v)}
                        sx={styles.tabs}
                        TabIndicatorProps={{ style: { backgroundColor: '#0003b1' } }}
                    >
                        <Tab label="All Businesses" />
                        <Tab label="Pending Verification" />
                        <Tab label="Active" />
                        <Tab label="Inactive" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    {/* Filter Bar */}
                    <Paper sx={styles.filterPaper}>
                        <Box sx={styles.filterBar}>
                            <TextField
                                placeholder="Search by name, owner, phone, city..."
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
                                {Object.keys({
                                    selectedCategory,
                                    startDate,
                                    endDate,
                                    verifiedFilter,
                                    statusFilter
                                }).filter(key => {
                                    const value = {
                                        selectedCategory,
                                        startDate,
                                        endDate,
                                        verifiedFilter,
                                        statusFilter
                                    }[key];
                                    return key === 'verifiedFilter' || key === 'statusFilter' 
                                        ? value !== 'all' 
                                        : value;
                                }).length > 0 && (
                                    <Badge 
                                        badgeContent="•" 
                                        color="primary" 
                                        sx={{ ml: 1 }}
                                    />
                                )}
                            </Button>
                            {(searchTerm || selectedCategory || startDate || endDate || 
                              verifiedFilter !== 'all' || statusFilter !== 'all') && (
                                <Button
                                    variant="text"
                                    onClick={clearFilters}
                                    sx={styles.clearButton}
                                >
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
                                                    <MenuItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Verified</InputLabel>
                                            <Select
                                                value={verifiedFilter}
                                                onChange={(e) => setVerifiedFilter(e.target.value)}
                                                label="Verified"
                                            >
                                                <MenuItem value="all">All</MenuItem>
                                                <MenuItem value="verified">Verified</MenuItem>
                                                <MenuItem value="unverified">Unverified</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl fullWidth size="small">
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
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <Box sx={styles.dateRange}>
                                                <DatePicker
                                                    label="From Date"
                                                    value={startDate}
                                                    onChange={setStartDate}
                                                    slotProps={{ 
                                                        textField: { 
                                                            size: 'small',
                                                            sx: { flex: 1 }
                                                        } 
                                                    }}
                                                />
                                                <DatePicker
                                                    label="To Date"
                                                    value={endDate}
                                                    onChange={setEndDate}
                                                    slotProps={{ 
                                                        textField: { 
                                                            size: 'small',
                                                            sx: { flex: 1 }
                                                        } 
                                                    }}
                                                />
                                            </Box>
                                        </LocalizationProvider>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </Paper>

                    {/* Results Info */}
                    <Box sx={styles.resultsInfo}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Showing {paginatedBusinesses.length} of {filteredBusinesses.length} businesses
                        </Typography>
                    </Box>

                    {/* Business Table */}
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
                                            Shop Name
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={styles.tableHeader}>Owner</TableCell>
                                    <TableCell sx={styles.tableHeader}>Category</TableCell>
                                    <TableCell sx={styles.tableHeader}>Phone</TableCell>
                                    <TableCell sx={styles.tableHeader}>Location</TableCell>
                                    <TableCell sx={styles.tableHeader}>
                                        <TableSortLabel
                                            active={orderBy === 'created_at'}
                                            direction={orderBy === 'created_at' ? order : 'asc'}
                                            onClick={() => handleSort('created_at')}
                                        >
                                            Created
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={styles.tableHeader}>Status</TableCell>
                                    <TableCell sx={styles.tableHeader} align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedBusinesses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                                            <Box sx={styles.emptyState}>
                                                <StoreIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                                                <Typography variant="h6" sx={{ color: '#999' }}>
                                                    No businesses found
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#aaa' }}>
                                                    Try adjusting your filters
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedBusinesses.map((business, index) => (
                                        <TableRow 
                                            key={business.id} 
                                            hover
                                            sx={styles.tableRow}
                                        >
                                            <TableCell>
                                                {page * rowsPerPage + index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={styles.shopCell}>
                                                    <Avatar 
                                                        sx={styles.shopAvatar}
                                                    >
                                                        {business.shop_name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {business.shop_name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#999' }}>
                                                            ID: {business.id.slice(0, 8)}...
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{business.owner_name}</TableCell>
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
                                                    {business.city}, {business.state}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(business.created_at)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={styles.statusCell}>
                                                    {business.is_verified && (
                                                        <Tooltip title="Verified">
                                                            <VerifiedIcon sx={{ color: '#4CAF50', fontSize: 18 }} />
                                                        </Tooltip>
                                                    )}
                                                    <Chip
                                                        label={business.is_active ? 'Active' : 'Inactive'}
                                                        size="small"
                                                        sx={{
                                                            ...styles.statusChip,
                                                            bgcolor: business.is_active ? '#e8f5e8' : '#ffebee',
                                                            color: business.is_active ? '#2e7d32' : '#c62828'
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
                                                    <Tooltip title="Edit">
                                                        <IconButton 
                                                            size="small"
                                                            onClick={() => handleEditBusiness(business)}
                                                            sx={styles.actionButton}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton 
                                                            size="small"
                                                            onClick={() => handleDeleteBusiness(business)}
                                                            sx={styles.actionButton}
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

                    {/* Pagination */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={filteredBusinesses.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={styles.pagination}
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    {/* Pending Verification Tab */}
                    <BusinessList 
                        businesses={businesses.filter(b => !b.is_verified)}
                        categories={categories}
                        onView={handleViewBusiness}
                        onEdit={handleEditBusiness}
                        onDelete={handleDeleteBusiness}
                        emptyMessage="No pending verification businesses"
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    {/* Active Tab */}
                    <BusinessList 
                        businesses={businesses.filter(b => b.is_active)}
                        categories={categories}
                        onView={handleViewBusiness}
                        onEdit={handleEditBusiness}
                        onDelete={handleDeleteBusiness}
                        emptyMessage="No active businesses"
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    {/* Inactive Tab */}
                    <BusinessList 
                        businesses={businesses.filter(b => !b.is_active)}
                        categories={categories}
                        onView={handleViewBusiness}
                        onEdit={handleEditBusiness}
                        onDelete={handleDeleteBusiness}
                        emptyMessage="No inactive businesses"
                    />
                </TabPanel>
            </Container>

            {/* View Dialog */}
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
                            <Grid item xs={12} md={4}>
                                <Card sx={styles.detailCard}>
                                    <CardContent>
                                        <Box sx={styles.detailHeader}>
                                            <Avatar sx={styles.detailAvatar}>
                                                {selectedBusiness.shop_name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6">
                                                    {selectedBusiness.shop_name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    ID: {selectedBusiness.id}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Divider sx={{ my: 2 }} />
                                        <Box sx={styles.detailInfo}>
                                            <Typography variant="body2" sx={styles.detailLabel}>
                                                <StoreIcon fontSize="small" /> Shop Name
                                            </Typography>
                                            <Typography variant="body1" sx={styles.detailValue}>
                                                {selectedBusiness.shop_name}
                                            </Typography>
                                            
                                            <Typography variant="body2" sx={styles.detailLabel}>
                                                <PersonIcon fontSize="small" /> Owner Name
                                            </Typography>
                                            <Typography variant="body1" sx={styles.detailValue}>
                                                {selectedBusiness.owner_name}
                                            </Typography>
                                            
                                            <Typography variant="body2" sx={styles.detailLabel}>
                                                <PhoneIcon fontSize="small" /> Phone
                                            </Typography>
                                            <Typography variant="body1" sx={styles.detailValue}>
                                                {selectedBusiness.phone}
                                            </Typography>
                                            
                                            <Typography variant="body2" sx={styles.detailLabel}>
                                                <CategoryIcon fontSize="small" /> Category
                                            </Typography>
                                            <Typography variant="body1" sx={styles.detailValue}>
                                                {getCategoryName(selectedBusiness.category_id)}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Card sx={styles.detailCard}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, color: '#0003b1' }}>
                                            Location Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="body2" sx={styles.detailLabel}>
                                                    Street
                                                </Typography>
                                                <Typography variant="body1" sx={styles.detailValue}>
                                                    {selectedBusiness.street || 'N/A'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={styles.detailLabel}>
                                                    City
                                                </Typography>
                                                <Typography variant="body1" sx={styles.detailValue}>
                                                    {selectedBusiness.city}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={styles.detailLabel}>
                                                    State
                                                </Typography>
                                                <Typography variant="body1" sx={styles.detailValue}>
                                                    {selectedBusiness.state}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={styles.detailLabel}>
                                                    Latitude
                                                </Typography>
                                                <Typography variant="body1" sx={styles.detailValue}>
                                                    {selectedBusiness.latitude}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={styles.detailLabel}>
                                                    Longitude
                                                </Typography>
                                                <Typography variant="body1" sx={styles.detailValue}>
                                                    {selectedBusiness.longitude}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="h6" sx={{ mb: 2, color: '#0003b1' }}>
                                            Keywords
                                        </Typography>
                                        <Box sx={styles.keywordsContainer}>
                                            {selectedBusiness.keywords?.map((kw, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={kw.keyword}
                                                    sx={styles.keywordChip}
                                                />
                                            )) || (
                                                <Typography variant="body2" sx={{ color: '#999' }}>
                                                    No keywords added
                                                </Typography>
                                            )}
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="h6" sx={{ mb: 2, color: '#0003b1' }}>
                                            Status & Dates
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={styles.detailLabel}>
                                                    Verified
                                                </Typography>
                                                <Chip
                                                    label={selectedBusiness.is_verified ? 'Yes' : 'No'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: selectedBusiness.is_verified ? '#e8f5e8' : '#ffebee',
                                                        color: selectedBusiness.is_verified ? '#2e7d32' : '#c62828'
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={styles.detailLabel}>
                                                    Status
                                                </Typography>
                                                <Chip
                                                    label={selectedBusiness.is_active ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: selectedBusiness.is_active ? '#e8f5e8' : '#ffebee',
                                                        color: selectedBusiness.is_active ? '#2e7d32' : '#c62828'
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={styles.detailLabel}>
                                                    Created
                                                </Typography>
                                                <Typography variant="body1" sx={styles.detailValue}>
                                                    {formatDate(selectedBusiness.created_at)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={styles.detailLabel}>
                                                    Last Updated
                                                </Typography>
                                                <Typography variant="body1" sx={styles.detailValue}>
                                                    {formatDate(selectedBusiness.updated_at)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button 
                        onClick={() => setViewDialogOpen(false)}
                        variant="outlined"
                        sx={styles.dialogButton}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog 
                open={editDialogOpen} 
                onClose={() => setEditDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: styles.dialog }}
            >
                <DialogTitle sx={styles.dialogTitle}>
                    <Box sx={styles.dialogTitleContent}>
                        <Typography variant="h6">Edit Business</Typography>
                        <IconButton onClick={() => setEditDialogOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Shop Name"
                                name="shop_name"
                                value={editForm.shop_name}
                                onChange={handleEditChange}
                                size="small"
                                sx={styles.input}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Owner Name"
                                name="owner_name"
                                value={editForm.owner_name}
                                onChange={handleEditChange}
                                size="small"
                                sx={styles.input}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={editForm.phone}
                                onChange={handleEditChange}
                                size="small"
                                sx={styles.input}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small" sx={styles.input}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name="category_id"
                                    value={editForm.category_id}
                                    onChange={handleEditChange}
                                    label="Category"
                                >
                                    {categories.map(cat => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Street"
                                name="street"
                                value={editForm.street}
                                onChange={handleEditChange}
                                size="small"
                                sx={styles.input}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="City"
                                name="city"
                                value={editForm.city}
                                onChange={handleEditChange}
                                size="small"
                                sx={styles.input}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="State"
                                name="state"
                                value={editForm.state}
                                onChange={handleEditChange}
                                size="small"
                                sx={styles.input}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Latitude"
                                name="latitude"
                                value={editForm.latitude}
                                onChange={handleEditChange}
                                size="small"
                                type="number"
                                inputProps={{ step: 'any' }}
                                sx={styles.input}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Longitude"
                                name="longitude"
                                value={editForm.longitude}
                                onChange={handleEditChange}
                                size="small"
                                type="number"
                                inputProps={{ step: 'any' }}
                                sx={styles.input}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editForm.is_verified}
                                        onChange={handleEditChange}
                                        name="is_verified"
                                        sx={styles.switch}
                                    />
                                }
                                label="Verified"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editForm.is_active}
                                        onChange={handleEditChange}
                                        name="is_active"
                                        sx={styles.switch}
                                    />
                                }
                                label="Active"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button 
                        onClick={() => setEditDialogOpen(false)}
                        variant="outlined"
                        sx={styles.dialogButton}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleEditSubmit}
                        variant="contained"
                        sx={styles.dialogButton}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog 
                open={deleteDialogOpen} 
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: styles.dialog }}
            >
                <DialogTitle sx={styles.dialogTitle}>
                    <Box sx={styles.dialogTitleContent}>
                        <Typography variant="h6">Confirm Delete</Typography>
                        <IconButton onClick={() => setDeleteDialogOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={styles.deleteContent}>
                        <WarningIcon sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Are you sure?
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                            You are about to delete "{selectedBusiness?.shop_name}". 
                            This action cannot be undone.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)}
                        variant="outlined"
                        sx={styles.dialogButton}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        sx={styles.dialogButton}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// Business List Component for Tabs
function BusinessList({ businesses, categories, onView, onEdit, onDelete, emptyMessage }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (businesses.length === 0) {
        return (
            <Paper sx={styles.emptyStatePaper}>
                <Box sx={styles.emptyState}>
                    <StoreIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>
                        {emptyMessage}
                    </Typography>
                </Box>
            </Paper>
        );
    }

    return (
        <Grid container spacing={3}>
            {businesses.map((business) => (
                <Grid item xs={12} sm={6} md={4} key={business.id}>
                    <Card sx={styles.businessCard}>
                        <CardContent>
                            <Box sx={styles.cardHeader}>
                                <Avatar sx={styles.cardAvatar}>
                                    {business.shop_name?.charAt(0)}
                                </Avatar>
                                <Box sx={styles.cardTitle}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {business.shop_name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                        {business.owner_name}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={styles.cardDetails}>
                                <Box sx={styles.cardDetail}>
                                    <PhoneIcon fontSize="small" sx={{ color: '#999', mr: 1 }} />
                                    <Typography variant="body2">{business.phone}</Typography>
                                </Box>
                                <Box sx={styles.cardDetail}>
                                    <LocationIcon fontSize="small" sx={{ color: '#999', mr: 1 }} />
                                    <Typography variant="body2">{business.city}</Typography>
                                </Box>
                                <Box sx={styles.cardDetail}>
                                    <CategoryIcon fontSize="small" sx={{ color: '#999', mr: 1 }} />
                                    <Typography variant="body2">
                                        {categories.find(c => c.id === business.category_id)?.name || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={styles.cardFooter}>
                                <Chip
                                    label={business.is_verified ? 'Verified' : 'Unverified'}
                                    size="small"
                                    sx={{
                                        ...styles.statusChip,
                                        bgcolor: business.is_verified ? '#e8f5e8' : '#ffebee',
                                        color: business.is_verified ? '#2e7d32' : '#c62828'
                                    }}
                                />
                                <Box>
                                    <IconButton size="small" onClick={() => onView(business)}>
                                        <ViewIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => onEdit(business)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => onDelete(business)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
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
    exportMenu: {
        borderRadius: '12px',
        mt: 1,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
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
    tabsContainer: {
        borderBottom: 1,
        borderColor: 'divider',
        mb: 3
    },
    tabs: {
        '& .MuiTab-root': {
            textTransform: 'none',
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 600,
            fontSize: '0.95rem'
        }
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
    dateRange: {
        display: 'flex',
        gap: 1
    },
    resultsInfo: {
        mb: 2,
        px: 1
    },
    tableContainer: {
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        maxHeight: 'calc(100vh - 400px)',
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
    phoneCell: {
        display: 'flex',
        alignItems: 'center'
    },
    locationCell: {
        display: 'flex',
        alignItems: 'center'
    },
    categoryChip: {
        bgcolor: 'rgba(0, 3, 177, 0.1)',
        color: '#0003b1',
        fontWeight: 500
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
    emptyStatePaper: {
        p: 5,
        borderRadius: '16px',
        textAlign: 'center'
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
    detailCard: {
        borderRadius: '16px',
        boxShadow: 'none',
        border: '1px solid #eee',
        height: '100%'
    },
    detailHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 2
    },
    detailAvatar: {
        width: 60,
        height: 60,
        bgcolor: 'rgba(0, 3, 177, 0.1)',
        color: '#0003b1',
        fontSize: '1.5rem'
    },
    detailInfo: {
        '& > *': {
            mb: 1.5
        }
    },
    detailLabel: {
        color: '#666',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        mb: 0.5
    },
    detailValue: {
        color: '#1a1a1a',
        fontWeight: 500,
        mb: 2
    },
    keywordsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        mb: 2
    },
    keywordChip: {
        bgcolor: 'rgba(0, 3, 177, 0.06)',
        color: '#0003b1',
        fontWeight: 500
    },
    dialogActions: {
        p: 3,
        gap: 2
    },
    dialogButton: {
        borderRadius: '12px',
        px: 4,
        py: 1,
        textTransform: 'none',
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 600
    },
    input: {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            bgcolor: '#FBFAFA'
        }
    },
    switch: {
        '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#0003b1'
        },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            bgcolor: '#0003b1'
        }
    },
    deleteContent: {
        textAlign: 'center',
        py: 3
    },
    businessCard: {
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 2
    },
    cardAvatar: {
        width: 48,
        height: 48,
        bgcolor: 'rgba(0, 3, 177, 0.1)',
        color: '#0003b1'
    },
    cardTitle: {
        flex: 1
    },
    cardDetails: {
        mb: 2
    },
    cardDetail: {
        display: 'flex',
        alignItems: 'center',
        mb: 1
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 2,
        pt: 2,
        borderTop: '1px solid #eee'
    }
};