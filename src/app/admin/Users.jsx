// pages/admin/Users.jsx
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
    Switch, FormControlLabel, Badge
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    FileDownload as ExportIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    CheckCircle as VerifiedIcon,
    Block as BlockIcon,
    Warning as WarningIcon,
    AdminPanelSettings as AdminIcon,
    Store as StoreIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { getToken } from '../../services/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

export default function Users() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Sorting
    const [orderBy, setOrderBy] = useState('created_at');
    const [order, setOrder] = useState('desc');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [verifiedFilter, setVerifiedFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Selected user for dialogs
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        full_name: '',
        phone: '',
        role: '',
        street: '',
        city: '',
        state: '',
        is_verified: false,
        is_active: true
    });

    // Export menu
    const [exportAnchorEl, setExportAnchorEl] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [users, searchTerm, roleFilter, verifiedFilter, statusFilter, startDate, endDate]);

    const getAuthToken = () => {
        const token = getToken();
        if (!token) {
            setError('Authentication token not found. Please login again.');
            setTimeout(() => navigate('/app/login'), 2000);
            return null;
        }
        return token;
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${API_BASE}/admin/users`, {
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

            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            setUsers(data.users || []);
            setFilteredUsers(data.users || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...users];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(u => 
                u.full_name?.toLowerCase().includes(term) ||
                u.phone?.includes(term) ||
                u.city?.toLowerCase().includes(term) ||
                u.role?.toLowerCase().includes(term)
            );
        }

        // Role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        // Verified filter
        if (verifiedFilter !== 'all') {
            filtered = filtered.filter(u => u.is_verified === (verifiedFilter === 'verified'));
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(u => u.is_active === (statusFilter === 'active'));
        }

        // Date range filter
        if (startDate) {
            filtered = filtered.filter(u => new Date(u.created_at) >= new Date(startDate));
        }
        if (endDate) {
            filtered = filtered.filter(u => new Date(u.created_at) <= new Date(endDate));
        }

        setFilteredUsers(filtered);
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);

        const sorted = [...filteredUsers].sort((a, b) => {
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
        
        setFilteredUsers(sorted);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setViewDialogOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditForm({
            full_name: user.full_name || '',
            phone: user.phone || '',
            role: user.role || '',
            street: user.street || '',
            city: user.city || '',
            state: user.state || '',
            is_verified: user.is_verified || false,
            is_active: user.is_active !== false
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
            const response = await fetch(`${API_BASE}/admin/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (!response.ok) throw new Error('Failed to update user');

            setSuccess('User updated successfully!');
            setEditDialogOpen(false);
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating user:', err);
            setError(err.message || 'Failed to update user');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const token = getAuthToken();
            if (!token) return;

            setLoading(true);
            const response = await fetch(`${API_BASE}/admin/users/${selectedUser.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete user');

            setSuccess('User deleted successfully!');
            setDeleteDialogOpen(false);
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(err.message || 'Failed to delete user');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('all');
        setVerifiedFilter('all');
        setStatusFilter('all');
        setStartDate(null);
        setEndDate(null);
    };

    const exportToExcel = () => {
        try {
            const exportData = filteredUsers.map(u => ({
                'Full Name': u.full_name,
                'Phone': u.phone,
                'Role': u.role,
                'City': u.city,
                'State': u.state,
                'Verified': u.is_verified ? 'Yes' : 'No',
                'Status': u.is_active ? 'Active' : 'Inactive',
                'Created Date': format(new Date(u.created_at), 'dd/MM/yyyy HH:mm')
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Users');
            XLSX.writeFile(wb, `users_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
        } catch (err) {
            console.error('Export error:', err);
            setError('Failed to export data');
        }
    };

    const getRoleIcon = (role) => {
        switch(role) {
            case 'admin': return <AdminIcon sx={{ color: '#f44336' }} />;
            case 'business': return <StoreIcon sx={{ color: '#4CAF50' }} />;
            default: return <PersonIcon sx={{ color: '#2196F3' }} />;
        }
    };

    const getRoleColor = (role) => {
        switch(role) {
            case 'admin': return '#f44336';
            case 'business': return '#4CAF50';
            default: return '#2196F3';
        }
    };

    const paginatedUsers = filteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (loading && users.length === 0) {
        return (
            <Box sx={styles.loadingContainer}>
                <CircularProgress size={60} sx={{ color: '#0003b1' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>Loading users...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={styles.container}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={styles.header}>
                    <Box>
                        <Typography variant="h4" sx={styles.title}>User Management</Typography>
                        <Breadcrumbs sx={{ mt: 1 }}>
                            <MuiLink color="inherit" onClick={() => navigate('/admin/dashboard')} sx={{ cursor: 'pointer' }}>
                                Dashboard
                            </MuiLink>
                            <Typography color="text.primary">Users</Typography>
                        </Breadcrumbs>
                    </Box>
                    <Box sx={styles.headerActions}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchUsers}
                            sx={styles.refreshButton}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<ExportIcon />}
                            onClick={exportToExcel}
                            sx={styles.exportButton}
                        >
                            Export
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
                                <Typography variant="h4" sx={styles.statNumber}>{users.length}</Typography>
                                <Typography variant="body2" sx={styles.statLabel}>Total Users</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statCard}>
                            <CardContent>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {users.filter(u => u.role === 'user').length}
                                </Typography>
                                <Typography variant="body2" sx={styles.statLabel}>Regular Users</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statCard}>
                            <CardContent>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {users.filter(u => u.role === 'business').length}
                                </Typography>
                                <Typography variant="body2" sx={styles.statLabel}>Business Owners</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statCard}>
                            <CardContent>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {users.filter(u => u.role === 'admin').length}
                                </Typography>
                                <Typography variant="body2" sx={styles.statLabel}>Admins</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper sx={styles.filterPaper}>
                    <Box sx={styles.filterBar}>
                        <TextField
                            placeholder="Search by name, phone, city..."
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
                        </Button>
                        {(searchTerm || roleFilter !== 'all' || verifiedFilter !== 'all' || statusFilter !== 'all' || startDate || endDate) && (
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
                                        <InputLabel>Role</InputLabel>
                                        <Select
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value)}
                                            label="Role"
                                        >
                                            <MenuItem value="all">All Roles</MenuItem>
                                            <MenuItem value="user">User</MenuItem>
                                            <MenuItem value="business">Business</MenuItem>
                                            <MenuItem value="admin">Admin</MenuItem>
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
                                                label="From"
                                                value={startDate}
                                                onChange={setStartDate}
                                                slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
                                            />
                                            <DatePicker
                                                label="To"
                                                value={endDate}
                                                onChange={setEndDate}
                                                slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
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
                        Showing {paginatedUsers.length} of {filteredUsers.length} users
                    </Typography>
                </Box>

                {/* Users Table */}
                <TableContainer component={Paper} sx={styles.tableContainer}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={styles.tableHeader}>S.No</TableCell>
                                <TableCell sx={styles.tableHeader}>
                                    <TableSortLabel
                                        active={orderBy === 'full_name'}
                                        direction={orderBy === 'full_name' ? order : 'asc'}
                                        onClick={() => handleSort('full_name')}
                                    >
                                        User
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={styles.tableHeader}>Role</TableCell>
                                <TableCell sx={styles.tableHeader}>Phone</TableCell>
                                <TableCell sx={styles.tableHeader}>Location</TableCell>
                                <TableCell sx={styles.tableHeader}>
                                    <TableSortLabel
                                        active={orderBy === 'created_at'}
                                        direction={orderBy === 'created_at' ? order : 'asc'}
                                        onClick={() => handleSort('created_at')}
                                    >
                                        Joined
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={styles.tableHeader}>Status</TableCell>
                                <TableCell sx={styles.tableHeader} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <Box sx={styles.emptyState}>
                                            <PersonIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                                            <Typography variant="h6" sx={{ color: '#999' }}>No users found</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedUsers.map((user, index) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>
                                            <Box sx={styles.userCell}>
                                                <Avatar sx={{ bgcolor: getRoleColor(user.role), width: 40, height: 40 }}>
                                                    {user.full_name?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {user.full_name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                                        ID: {user.id.slice(0, 8)}...
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getRoleIcon(user.role)}
                                                label={user.role}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${getRoleColor(user.role)}15`,
                                                    color: getRoleColor(user.role),
                                                    fontWeight: 600
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={styles.phoneCell}>
                                                <PhoneIcon fontSize="small" sx={{ color: '#999', mr: 1 }} />
                                                {user.phone}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={styles.locationCell}>
                                                <LocationIcon fontSize="small" sx={{ color: '#999', mr: 1 }} />
                                                {user.city}, {user.state}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{format(new Date(user.created_at), 'dd MMM yyyy')}</TableCell>
                                        <TableCell>
                                            <Box sx={styles.statusCell}>
                                                {user.is_verified && (
                                                    <Tooltip title="Verified">
                                                        <VerifiedIcon sx={{ color: '#4CAF50', fontSize: 18 }} />
                                                    </Tooltip>
                                                )}
                                                <Chip
                                                    label={user.is_active ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: user.is_active ? '#e8f5e8' : '#ffebee',
                                                        color: user.is_active ? '#2e7d32' : '#c62828'
                                                    }}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View">
                                                <IconButton size="small" onClick={() => handleViewUser(user)} sx={styles.actionButton}>
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => handleEditUser(user)} sx={styles.actionButton}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => handleDeleteUser(user)} sx={styles.actionButton}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
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
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={setPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    sx={styles.pagination}
                />
            </Container>

            {/* View Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={styles.dialogTitle}>
                    <Box sx={styles.dialogTitleContent}>
                        <Typography variant="h6">User Details</Typography>
                        <IconButton onClick={() => setViewDialogOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedUser && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: getRoleColor(selectedUser.role), mx: 'auto', mb: 1 }}>
                                    {selectedUser.full_name?.charAt(0)}
                                </Avatar>
                                <Typography variant="h6">{selectedUser.full_name}</Typography>
                                <Chip
                                    label={selectedUser.role}
                                    size="small"
                                    sx={{ bgcolor: `${getRoleColor(selectedUser.role)}15`, color: getRoleColor(selectedUser.role) }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={styles.detailLabel}>Phone</Typography>
                                <Typography variant="body1">{selectedUser.phone}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={styles.detailLabel}>Email</Typography>
                                <Typography variant="body1">{selectedUser.email || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" sx={styles.detailLabel}>Address</Typography>
                                <Typography variant="body1">
                                    {selectedUser.street ? `${selectedUser.street}, ` : ''}{selectedUser.city}, {selectedUser.state}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={styles.detailLabel}>Verified</Typography>
                                <Chip
                                    label={selectedUser.is_verified ? 'Yes' : 'No'}
                                    size="small"
                                    sx={{ bgcolor: selectedUser.is_verified ? '#e8f5e8' : '#ffebee' }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={styles.detailLabel}>Status</Typography>
                                <Chip
                                    label={selectedUser.is_active ? 'Active' : 'Inactive'}
                                    size="small"
                                    sx={{ bgcolor: selectedUser.is_active ? '#e8f5e8' : '#ffebee' }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={styles.detailLabel}>Joined</Typography>
                                <Typography variant="body1">{format(new Date(selectedUser.created_at), 'dd MMM yyyy')}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={styles.detailLabel}>Last Updated</Typography>
                                <Typography variant="body1">{format(new Date(selectedUser.updated_at), 'dd MMM yyyy')}</Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)} variant="outlined">Close</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={styles.dialogTitle}>
                    <Box sx={styles.dialogTitleContent}>
                        <Typography variant="h6">Edit User</Typography>
                        <IconButton onClick={() => setEditDialogOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="full_name"
                                value={editForm.full_name}
                                onChange={handleEditChange}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={editForm.phone}
                                onChange={handleEditChange}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="role"
                                    value={editForm.role}
                                    onChange={handleEditChange}
                                    label="Role"
                                >
                                    <MenuItem value="user">User</MenuItem>
                                    <MenuItem value="business">Business</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
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
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="City"
                                name="city"
                                value={editForm.city}
                                onChange={handleEditChange}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="State"
                                name="state"
                                value={editForm.state}
                                onChange={handleEditChange}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editForm.is_verified}
                                        onChange={handleEditChange}
                                        name="is_verified"
                                    />
                                }
                                label="Verified"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editForm.is_active}
                                        onChange={handleEditChange}
                                        name="is_active"
                                    />
                                }
                                label="Active"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} variant="outlined">Cancel</Button>
                    <Button onClick={handleEditSubmit} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
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
                        <Typography variant="h6" sx={{ mb: 1 }}>Are you sure?</Typography>
                        <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                            You are about to delete user "{selectedUser?.full_name}". This action cannot be undone.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">Cancel</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Delete'}
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
        '&:hover': { borderColor: '#0003b1' }
    },
    exportButton: {
        borderRadius: '12px',
        bgcolor: '#0003b1',
        '&:hover': { bgcolor: '#000290' }
    },
    alert: {
        mb: 3,
        borderRadius: '12px'
    },
    statCard: {
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
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
        '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#FBFAFA' }
    },
    filterToggle: {
        borderRadius: '12px',
        borderColor: '#ddd',
        color: '#666',
        minWidth: 100
    },
    clearButton: {
        color: '#0003b1',
        '&:hover': { bgcolor: 'rgba(0, 3, 177, 0.04)' }
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
    userCell: {
        display: 'flex',
        alignItems: 'center',
        gap: 2
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
    actionButton: {
        color: '#666',
        '&:hover': { color: '#0003b1', bgcolor: 'rgba(0, 3, 177, 0.04)' }
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
    dialogTitle: {
        borderBottom: '1px solid #eee'
    },
    dialogTitleContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    detailLabel: {
        color: '#666',
        fontWeight: 600,
        mb: 0.5
    },
    deleteContent: {
        textAlign: 'center',
        py: 3
    }
};