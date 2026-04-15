// pages/admin/Doctor.jsx
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
    Switch, FormControlLabel, Badge, Rating
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
    LocalHospital as DoctorIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    CheckCircle as VerifiedIcon,
    Warning as WarningIcon,
    Close as CloseIcon,
    Star as StarIcon,
    MedicalServices as MedicalIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { getToken } from '../../services/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

export default function Doctor() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
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
    const [verifiedFilter, setVerifiedFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [specialization, setSpecialization] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Selected doctor for dialogs
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        shop_name: '',
        owner_name: '',
        phone: '',
        specialization: '',
        consultation_fee: '',
        street: '',
        city: '',
        state: '',
        is_verified: false,
        is_active: true
    });

    useEffect(() => {
        fetchDoctors();
        fetchCategories();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [doctors, searchTerm, verifiedFilter, statusFilter, specialization]);

    const getAuthToken = () => {
        const token = getToken();
        if (!token) {
            setError('Authentication token not found. Please login again.');
            setTimeout(() => navigate('/app/login'), 2000);
            return null;
        }
        return token;
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

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${API_BASE}/admin/doctors`, {
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

            if (!response.ok) throw new Error('Failed to fetch doctors');

            const data = await response.json();
            setDoctors(data.doctors || []);
            setFilteredDoctors(data.doctors || []);
        } catch (err) {
            console.error('Error fetching doctors:', err);
            setError('Failed to load doctors. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...doctors];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(d => 
                d.shop_name?.toLowerCase().includes(term) ||
                d.owner_name?.toLowerCase().includes(term) ||
                d.phone?.includes(term) ||
                d.specialization?.toLowerCase().includes(term)
            );
        }

        // Verified filter
        if (verifiedFilter !== 'all') {
            filtered = filtered.filter(d => d.is_verified === (verifiedFilter === 'verified'));
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(d => d.is_active === (statusFilter === 'active'));
        }

        // Specialization filter
        if (specialization !== 'all') {
            filtered = filtered.filter(d => d.specialization === specialization);
        }

        setFilteredDoctors(filtered);
    };

    const handleViewDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setViewDialogOpen(true);
    };

    const handleEditDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setEditForm({
            shop_name: doctor.shop_name || '',
            owner_name: doctor.owner_name || '',
            phone: doctor.phone || '',
            specialization: doctor.specialization || '',
            consultation_fee: doctor.consultation_fee || '',
            street: doctor.street || '',
            city: doctor.city || '',
            state: doctor.state || '',
            is_verified: doctor.is_verified || false,
            is_active: doctor.is_active !== false
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
            const response = await fetch(`${API_BASE}/admin/doctors/${selectedDoctor.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (!response.ok) throw new Error('Failed to update doctor');

            setSuccess('Doctor updated successfully!');
            setEditDialogOpen(false);
            fetchDoctors();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating doctor:', err);
            setError(err.message || 'Failed to update doctor');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const token = getAuthToken();
            if (!token) return;

            setLoading(true);
            const response = await fetch(`${API_BASE}/admin/doctors/${selectedDoctor.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete doctor');

            setSuccess('Doctor deleted successfully!');
            setDeleteDialogOpen(false);
            fetchDoctors();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting doctor:', err);
            setError(err.message || 'Failed to delete doctor');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setVerifiedFilter('all');
        setStatusFilter('all');
        setSpecialization('all');
    };

    const exportToExcel = () => {
        try {
            const exportData = filteredDoctors.map(d => ({
                'Clinic Name': d.shop_name,
                'Doctor Name': d.owner_name,
                'Phone': d.phone,
                'Specialization': d.specialization || 'General',
                'Consultation Fee': d.consultation_fee || 'N/A',
                'City': d.city,
                'State': d.state,
                'Verified': d.is_verified ? 'Yes' : 'No',
                'Status': d.is_active ? 'Active' : 'Inactive',
                'Created Date': format(new Date(d.created_at), 'dd/MM/yyyy HH:mm')
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Doctors');
            XLSX.writeFile(wb, `doctors_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
        } catch (err) {
            console.error('Export error:', err);
            setError('Failed to export data');
        }
    };

    const getSpecializations = () => {
        const specs = new Set(doctors.map(d => d.specialization).filter(Boolean));
        return Array.from(specs);
    };

    const paginatedDoctors = filteredDoctors.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (loading && doctors.length === 0) {
        return (
            <Box sx={styles.loadingContainer}>
                <CircularProgress size={60} sx={{ color: '#0003b1' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>Loading doctors...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={styles.container}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={styles.header}>
                    <Box>
                        <Typography variant="h4" sx={styles.title}>Doctor Management</Typography>
                        <Breadcrumbs sx={{ mt: 1 }}>
                            <MuiLink color="inherit" onClick={() => navigate('/admin/dashboard')} sx={{ cursor: 'pointer' }}>
                                Dashboard
                            </MuiLink>
                            <Typography color="text.primary">Doctors</Typography>
                        </Breadcrumbs>
                    </Box>
                    <Box sx={styles.headerActions}>
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchDoctors} sx={styles.refreshButton}>
                            Refresh
                        </Button>
                        <Button variant="contained" startIcon={<ExportIcon />} onClick={exportToExcel} sx={styles.exportButton}>
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
                                <Typography variant="h4" sx={styles.statNumber}>{doctors.length}</Typography>
                                <Typography variant="body2" sx={styles.statLabel}>Total Clinics</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statCard}>
                            <CardContent>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {doctors.filter(d => d.is_verified).length}
                                </Typography>
                                <Typography variant="body2" sx={styles.statLabel}>Verified</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statCard}>
                            <CardContent>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {getSpecializations().length}
                                </Typography>
                                <Typography variant="body2" sx={styles.statLabel}>Specializations</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={styles.statCard}>
                            <CardContent>
                                <Typography variant="h4" sx={styles.statNumber}>
                                    {new Set(doctors.map(d => d.city)).size}
                                </Typography>
                                <Typography variant="body2" sx={styles.statLabel}>Cities</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper sx={styles.filterPaper}>
                    <Box sx={styles.filterBar}>
                        <TextField
                            placeholder="Search by clinic, doctor, phone..."
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
                        {(searchTerm || verifiedFilter !== 'all' || statusFilter !== 'all' || specialization !== 'all') && (
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
                                        <InputLabel>Specialization</InputLabel>
                                        <Select
                                            value={specialization}
                                            onChange={(e) => setSpecialization(e.target.value)}
                                            label="Specialization"
                                        >
                                            <MenuItem value="all">All Specializations</MenuItem>
                                            {getSpecializations().map(spec => (
                                                <MenuItem key={spec} value={spec}>{spec}</MenuItem>
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
                            </Grid>
                        </Box>
                    )}
                </Paper>

                {/* Results Info */}
                <Box sx={styles.resultsInfo}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        Showing {paginatedDoctors.length} of {filteredDoctors.length} clinics
                    </Typography>
                </Box>

                {/* Doctors Table */}
                <TableContainer component={Paper} sx={styles.tableContainer}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={styles.tableHeader}>S.No</TableCell>
                                <TableCell sx={styles.tableHeader}>Clinic/Doctor</TableCell>
                                <TableCell sx={styles.tableHeader}>Specialization</TableCell>
                                <TableCell sx={styles.tableHeader}>Phone</TableCell>
                                <TableCell sx={styles.tableHeader}>Location</TableCell>
                                <TableCell sx={styles.tableHeader}>Fee</TableCell>
                                <TableCell sx={styles.tableHeader}>Status</TableCell>
                                <TableCell sx={styles.tableHeader} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedDoctors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <Box sx={styles.emptyState}>
                                            <DoctorIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                                            <Typography variant="h6" sx={{ color: '#999' }}>No doctors found</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedDoctors.map((doctor, index) => (
                                    <TableRow key={doctor.id} hover>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>
                                            <Box sx={styles.doctorCell}>
                                                <Avatar sx={{ bgcolor: '#4CAF50', width: 40, height: 40 }}>
                                                    <MedicalIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {doctor.shop_name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#666' }}>
                                                        Dr. {doctor.owner_name}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={doctor.specialization || 'General'}
                                                size="small"
                                                sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={styles.phoneCell}>
                                                <PhoneIcon fontSize="small" sx={{ color: '#999', mr: 1 }} />
                                                {doctor.phone}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={styles.locationCell}>
                                                <LocationIcon fontSize="small" sx={{ color: '#999', mr: 1 }} />
                                                {doctor.city}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {doctor.consultation_fee ? (
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4CAF50' }}>
                                                    ₹{doctor.consultation_fee}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" sx={{ color: '#999' }}>N/A</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={styles.statusCell}>
                                                {doctor.is_verified && (
                                                    <Tooltip title="Verified">
                                                        <VerifiedIcon sx={{ color: '#4CAF50', fontSize: 18 }} />
                                                    </Tooltip>
                                                )}
                                                <Chip
                                                    label={doctor.is_active ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: doctor.is_active ? '#e8f5e8' : '#ffebee',
                                                        color: doctor.is_active ? '#2e7d32' : '#c62828'
                                                    }}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View">
                                                <IconButton size="small" onClick={() => handleViewDoctor(doctor)} sx={styles.actionButton}>
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => handleEditDoctor(doctor)} sx={styles.actionButton}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => handleDeleteDoctor(doctor)} sx={styles.actionButton}>
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
                    count={filteredDoctors.length}
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
                        <Typography variant="h6">Doctor Details</Typography>
                        <IconButton onClick={() => setViewDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedDoctor && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: '#4CAF50', mx: 'auto', mb: 1 }}>
                                    <MedicalIcon sx={{ fontSize: 40 }} />
                                </Avatar>
                                <Typography variant="h6">{selectedDoctor.shop_name}</Typography>
                                <Typography variant="body1" sx={{ color: '#666' }}>Dr. {selectedDoctor.owner_name}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={styles.detailLabel}>Specialization</Typography>
                                <Typography variant="body1">{selectedDoctor.specialization || 'General'}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={styles.detailLabel}>Consultation Fee</Typography>
                                <Typography variant="body1">
                                    {selectedDoctor.consultation_fee ? `₹${selectedDoctor.consultation_fee}` : 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={styles.detailLabel}>Phone</Typography>
                                <Typography variant="body1">{selectedDoctor.phone}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={styles.detailLabel}>Location</Typography>
                                <Typography variant="body1">{selectedDoctor.city}, {selectedDoctor.state}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" sx={styles.detailLabel}>Address</Typography>
                                <Typography variant="body1">{selectedDoctor.street || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={styles.detailLabel}>Verified</Typography>
                                <Chip
                                    label={selectedDoctor.is_verified ? 'Yes' : 'No'}
                                    size="small"
                                    sx={{ bgcolor: selectedDoctor.is_verified ? '#e8f5e8' : '#ffebee' }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" sx={styles.detailLabel}>Status</Typography>
                                <Chip
                                    label={selectedDoctor.is_active ? 'Active' : 'Inactive'}
                                    size="small"
                                    sx={{ bgcolor: selectedDoctor.is_active ? '#e8f5e8' : '#ffebee' }}
                                />
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
                        <Typography variant="h6">Edit Doctor</Typography>
                        <IconButton onClick={() => setEditDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Clinic Name" name="shop_name" value={editForm.shop_name} onChange={handleEditChange} size="small" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Doctor Name" name="owner_name" value={editForm.owner_name} onChange={handleEditChange} size="small" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Phone" name="phone" value={editForm.phone} onChange={handleEditChange} size="small" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Specialization" name="specialization" value={editForm.specialization} onChange={handleEditChange} size="small" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Consultation Fee" name="consultation_fee" type="number" value={editForm.consultation_fee} onChange={handleEditChange} size="small" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Street" name="street" value={editForm.street} onChange={handleEditChange} size="small" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="City" name="city" value={editForm.city} onChange={handleEditChange} size="small" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="State" name="state" value={editForm.state} onChange={handleEditChange} size="small" />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel control={<Switch checked={editForm.is_verified} onChange={handleEditChange} name="is_verified" />} label="Verified" />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel control={<Switch checked={editForm.is_active} onChange={handleEditChange} name="is_active" />} label="Active" />
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
                        <IconButton onClick={() => setDeleteDialogOpen(false)} size="small"><CloseIcon /></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={styles.deleteContent}>
                        <WarningIcon sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>Are you sure?</Typography>
                        <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                            You are about to delete {selectedDoctor?.shop_name}. This action cannot be undone.
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
    },
    doctorCell: {
        display: 'flex',
        alignItems: 'center',
        gap: 2
    }
};