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
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    Store as StoreIcon,
    Church as ChurchIcon,
    LocalHospital as DoctorIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useAdmin } from '../../../hooks/useAdmin';
import { formatDate, timeAgo } from '../../../utils/formatting';

const roleIcons = {
    user: <PersonIcon />,
    business: <StoreIcon />,
    doctor: <DoctorIcon />,
    worship: <ChurchIcon />,
    admin: <AdminIcon />
};

const roleColors = {
    user: '#2196f3',
    business: '#4caf50',
    doctor: '#f44336',
    worship: '#9c27b0',
    admin: '#ff9800'
};

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pageSize: 20 });
    const [filters, setFilters] = useState({ search: '', role: '', status: '' });
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { fetchUsers, blockUser, removeUser } = useAdmin();

    useEffect(() => {
        loadUsers();
    }, [pagination.page, filters]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const result = await fetchUsers({
                page: pagination.page,
                limit: pagination.pageSize,
                ...filters
            });
            setUsers(result.users);
            setPagination(prev => ({ ...prev, total: result.pagination.total }));
        } catch (error) {
            console.error('Error loading users:', error);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleMenuOpen = (event, user) => {
        setSelectedUser(user);
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
            if (dialogAction === 'block') {
                await blockUser(selectedUser.id, !selectedUser.isBlocked);
                setSuccess(`User ${selectedUser.isBlocked ? 'unblocked' : 'blocked'} successfully`);
            } else if (dialogAction === 'delete') {
                await removeUser(selectedUser.id);
                setSuccess('User deleted successfully');
            }
            await loadUsers();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
            setSelectedUser(null);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        {
            field: 'fullName',
            headerName: 'Name',
            width: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: roleColors[params.row.role] + '20' }}>
                        {roleIcons[params.row.role]}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {params.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            {params.row.phone}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 130,
            renderCell: (params) => (
                <Chip
                    icon={roleIcons[params.value]}
                    label={params.value}
                    size="small"
                    sx={{
                        bgcolor: roleColors[params.value] + '15',
                        color: roleColors[params.value],
                        textTransform: 'capitalize'
                    }}
                />
            )
        },
        { field: 'city', headerName: 'City', width: 120 },
        {
            field: 'createdAt',
            headerName: 'Joined',
            width: 120,
            valueFormatter: (params) => timeAgo(params.value)
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {params.row.isVerified && (
                        <Tooltip title="Verified">
                            <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                        </Tooltip>
                    )}
                    {params.row.isBlocked && (
                        <Tooltip title="Blocked">
                            <BlockIcon sx={{ color: '#f44336', fontSize: 20 }} />
                        </Tooltip>
                    )}
                    {!params.row.isVerified && !params.row.isBlocked && (
                        <Chip label="Active" size="small" color="default" />
                    )}
                </Box>
            )
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
                    User Management
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadUsers}
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
                            placeholder="Search users..."
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
                            label="Role"
                            value={filters.role}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            size="small"
                        >
                            <MenuItem value="">All Roles</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="business">Business</MenuItem>
                            <MenuItem value="doctor">Doctor</MenuItem>
                            <MenuItem value="worship">Worship</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
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
                            onClick={loadUsers}
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

            {/* Users Table */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <DataGrid
                    rows={users}
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
                <MenuItem onClick={() => handleAction('block')}>
                    <BlockIcon sx={{ mr: 1, fontSize: 20 }} />
                    {selectedUser?.isBlocked ? 'Unblock User' : 'Block User'}
                </MenuItem>
                <MenuItem onClick={() => handleAction('delete')} sx={{ color: '#f44336' }}>
                    <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                    Delete User
                </MenuItem>
            </Menu>

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>
                    {dialogAction === 'block' 
                        ? `${selectedUser?.isBlocked ? 'Unblock' : 'Block'} User`
                        : 'Delete User'
                    }
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to {dialogAction}{' '}
                        <strong>{selectedUser?.fullName}</strong>?
                        {dialogAction === 'delete' && (
                            <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                                This action cannot be undone.
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
        </Box>
    );
}