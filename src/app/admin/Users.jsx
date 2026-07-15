// app/admin/Users.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Button,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    CircularProgress,
    Alert,
    Snackbar,
    InputAdornment,
    Tooltip,
    Avatar,
    TableSortLabel
} from '@mui/material';
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    PersonAdd as PersonAddIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Visibility as VisibilityIcon,
    Block as BlockIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import {
    getUsers,
    updateUser,
    deleteUser,
    activateUser,
    getUserStats
} from '../../services/user';

export default function Users() {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [orderBy, setOrderBy] = useState('created_at');
    const [order, setOrder] = useState('desc');

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        area: '',
        city: '',
        state: '',
        role: 'user',
        is_active: true,
        is_verified: false,
        password: ''
    });

    useEffect(() => {
        loadUsers();
        loadStats();
    }, [page, rowsPerPage, roleFilter, statusFilter]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const result = await getUsers({
                page: page + 1,
                limit: rowsPerPage,
                search,
                role: roleFilter,
                status: statusFilter
            });
            setUsers(result.users || []);
            setTotal(result.total || 0);
        } catch (error) {
            showSnackbar('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const result = await getUserStats();
            setStats(result.stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const handleSearch = () => {
        setPage(0);
        loadUsers();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            full_name: user.full_name || '',
            area: user.area || '',
            city: user.city || '',
            state: user.state || '',
            role: user.role || 'user',
            is_active: user.is_active,
            is_verified: user.is_verified,
            password: ''
        });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!formData.full_name) {
            showSnackbar('Full name is required', 'error');
            return;
        }

        try {
            const updateData = {
                full_name: formData.full_name,
                area: formData.area,
                city: formData.city,
                state: formData.state,
                role: formData.role,
                is_active: formData.is_active,
                is_verified: formData.is_verified
            };
            
            if (formData.password) {
                updateData.password = formData.password;
            }
            
            await updateUser(editingUser.id, updateData);
            showSnackbar('User updated successfully');
            setOpenDialog(false);
            loadUsers();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const handleDelete = async (user) => {
        if (window.confirm(`Are you sure you want to delete user "${user.full_name}"?`)) {
            try {
                await deleteUser(user.id);
                showSnackbar('User deleted successfully');
                loadUsers();
                loadStats();
            } catch (error) {
                showSnackbar(error.message, 'error');
            }
        }
    };

    const handleActivate = async (user) => {
        try {
            await activateUser(user.id);
            showSnackbar(user.is_active ? 'User deactivated' : 'User activated successfully');
            loadUsers();
            loadStats();
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
        
        const sortedUsers = [...users].sort((a, b) => {
            let aValue = a[property] || '';
            let bValue = b[property] || '';
            
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (order === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        setUsers(sortedUsers);
    };

    const StatCard = ({ title, value, color, icon }) => (
        <Paper sx={{ p: 2, border: '1px solid #e8ecef', boxShadow: 'none', borderRadius: 2 }}>
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
        </Paper>
    );

    const getRoleChip = (role) => {
        const colors = {
            admin: { bg: '#fee2e2', color: '#dc2626' },
            user: { bg: '#dbeafe', color: '#3b82f6' }
        };
        const style = colors[role] || colors.user;
        return (
            <Chip
                label={role.toUpperCase()}
                size="small"
                sx={{
                    bgcolor: style.bg,
                    color: style.color,
                    fontWeight: 600,
                    borderRadius: 1,
                    fontSize: '0.7rem'
                }}
            />
        );
    };

    const getStatusChip = (isActive, isVerified) => {
        if (!isActive) {
            return (
                <Chip
                    label="INACTIVE"
                    size="small"
                    sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 600, borderRadius: 1, fontSize: '0.7rem' }}
                />
            );
        }
        if (isVerified) {
            return (
                <Chip
                    label="VERIFIED"
                    size="small"
                    sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 600, borderRadius: 1, fontSize: '0.7rem' }}
                />
            );
        }
        return (
            <Chip
                label="UNVERIFIED"
                size="small"
                sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 600, borderRadius: 1, fontSize: '0.7rem' }}
            />
        );
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: '"Alumni Sans", sans-serif' }}>
                    User Management
                </Typography>
            </Box>

            {/* Stats Cards */}
            {stats && (
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={2} mb={3}>
                    <StatCard title="Total Users" value={stats.total} color="#3b82f6" icon={<PersonAddIcon />} />
                    <StatCard title="Active Users" value={stats.active} color="#10b981" icon={<CheckCircleIcon />} />
                    <StatCard title="Verified Users" value={stats.verified} color="#8b5cf6" icon={<CheckIcon />} />
                    <StatCard title="Admin Users" value={stats.admins} color="#ef4444" icon={<VisibilityIcon />} />
                </Box>
            )}

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, border: '1px solid #e8ecef', boxShadow: 'none', borderRadius: 2 }}>
                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={handleKeyPress}
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
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            label="Role"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                            <MenuItem value="verified">Verified</MenuItem>
                            <MenuItem value="unverified">Unverified</MenuItem>
                        </Select>
                    </FormControl>
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
                            setRoleFilter('');
                            setStatusFilter('');
                            setPage(0);
                            loadUsers();
                        }}
                        startIcon={<RefreshIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Reset
                    </Button>
                </Box>
            </Paper>

            {/* Users Table */}
            <Paper sx={{ border: '1px solid #e8ecef', boxShadow: 'none', borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)', overflow: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>User</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Phone</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Location</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Role</TableCell>
                                <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Status</TableCell>
                                <TableCell 
                                    sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}
                                    sortDirection={orderBy === 'created_at' ? order : false}
                                >
                                    <TableSortLabel
                                        active={orderBy === 'created_at'}
                                        direction={orderBy === 'created_at' ? order : 'asc'}
                                        onClick={() => handleRequestSort('created_at')}
                                    >
                                        Joined
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="center" sx={{ bgcolor: '#f8f9fa', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress sx={{ color: '#3b82f6' }} />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="#6b7280">No users found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar sx={{ bgcolor: '#3b82f6', width: 32, height: 32, fontSize: '0.8rem' }}>
                                                    {user.full_name?.charAt(0) || 'U'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {user.full_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="#6b7280">
                                                        ID: {user.id?.slice(0, 8)}...
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{user.phone}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {user.area ? `${user.area}, ` : ''}{user.city}, {user.state}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{getRoleChip(user.role)}</TableCell>
                                        <TableCell>{getStatusChip(user.is_active, user.is_verified)}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box display="flex" gap={1} justifyContent="center">
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" onClick={() => handleEdit(user)} sx={{ color: '#3b82f6' }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={user.is_active ? 'Deactivate' : 'Activate'}>
                                                    <IconButton size="small" onClick={() => handleActivate(user)} sx={{ color: user.is_active ? '#ef4444' : '#10b981' }}>
                                                        {user.is_active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" onClick={() => handleDelete(user)} sx={{ color: '#ef4444' }}>
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

            {/* Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>
                    Edit User
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Full Name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        margin="normal"
                        size="small"
                    />
                    <TextField
                        fullWidth
                        label="Area"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        margin="normal"
                        size="small"
                    />
                    <TextField
                        fullWidth
                        label="City"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        margin="normal"
                        size="small"
                    />
                    <TextField
                        fullWidth
                        label="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        margin="normal"
                        size="small"
                    />
                    <FormControl fullWidth margin="normal" size="small">
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            label="Role"
                        >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="New Password (leave blank to keep current)"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        margin="normal"
                        size="small"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                        }
                        label="Active"
                        sx={{ mt: 1 }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.is_verified}
                                onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                            />
                        }
                        label="Verified"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save Changes</Button>
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