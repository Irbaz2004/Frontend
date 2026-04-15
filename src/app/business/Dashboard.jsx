// pages/Business/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Container, Grid, Paper, Typography, Card, CardContent,
    Button, IconButton, Avatar, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    useMediaQuery, useTheme, Alert, CircularProgress
} from '@mui/material';
import {
    Work as Briefcase,
    CheckCircle as CheckCircle,
    Cancel as XCircle,
    BarChart as ChartBar,
    Refresh as Refresh,
    Add as Plus,
    Edit as EditIcon,
    Visibility as ViewIcon,
    CalendarToday as Calendar,
    LocationOn as MapPin,
    AttachMoney as Currency
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getToken, logoutUser } from '../../services/auth';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const COLORS = ['#0003b1', '#4CAF50', '#FF9800', '#f44336', '#9C27B0'];

export default function BusinessDashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

   const getAuthToken = () => {
        const token = getToken();
        if (!token) {
            setError('Authentication token not found. Please login again.');
            setTimeout(() => navigate('/app/login'), 2000);
            return null;
        }
        return token;
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                setError('Authentication token not found');
                setTimeout(() => navigate('/app/login'), 2000);
                return;
            }

            const response = await fetch(`${API_BASE}/business/dashboard`, {
                method: 'GET',
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
            setDashboardData(data.dashboard);
            setError('');
        } catch (err) {
            console.error('Error fetching dashboard:', err);
            setError('Failed to load dashboard. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchDashboardData();
    };

    const StatCard = ({ title, value, icon, color, onClick }) => (
        <Card sx={styles.statCard} onClick={onClick}>
            <CardContent>
                <Box sx={styles.statHeader}>
                    <Box sx={styles.statIcon(color)}>
                        {icon}
                    </Box>
                </Box>
                <Typography variant="h3" sx={styles.statValue}>
                    {value?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2" sx={styles.statLabel}>
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box sx={styles.loadingContainer}>
                <CircularProgress size={60} sx={{ color: '#0003b1' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>Loading dashboard...</Typography>
            </Box>
        );
    }

    const businessInfo = dashboardData?.business_info || {};
    const stats = dashboardData?.stats || { total_jobs: 0, active_jobs: 0, inactive_jobs: 0 };
    const recentJobs = dashboardData?.recent_jobs || [];
    const charts = dashboardData?.charts || { jobs_by_type: [], jobs_over_time: [] };

    return (
        <Box sx={styles.container}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={styles.header}>
                    <Box>
                        <Typography variant="h4" sx={styles.title}>
                            Business Dashboard
                        </Typography>
                        <Typography variant="body2" sx={styles.subtitle}>
                            Welcome back, {businessInfo?.shop_name || 'Business Owner'}!
                        </Typography>
                    </Box>
                    <Box sx={styles.headerActions}>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={handleRefresh}
                            sx={styles.refreshButton}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Plus />}
                            onClick={() => navigate('/business/jobs/create')}
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

                {/* Verification Status Banner */}
                {!businessInfo?.is_verified && (
                    <Paper sx={styles.verificationBanner}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={styles.pendingIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="#FF9800" strokeWidth="2"/>
                                    <path d="M12 6V12L16 14" stroke="#FF9800" strokeWidth="2"/>
                                </svg>
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Account Pending Verification
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Your business account is awaiting verification. Some features may be limited until verified.
                                </Typography>
                            </Box>
                        </Box>
                        <Chip 
                            label="Pending Verification"
                            sx={styles.pendingChip}
                        />
                    </Paper>
                )}

                {/* Stats Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Jobs"
                            value={stats.total_jobs}
                            icon={<Briefcase sx={{ fontSize: 30 }} />}
                            color="#0003b1"
                            onClick={() => navigate('/business/jobs')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Active Jobs"
                            value={stats.active_jobs}
                            icon={<CheckCircle sx={{ fontSize: 30 }} />}
                            color="#4CAF50"
                            onClick={() => navigate('/business/jobs?status=active')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Inactive Jobs"
                            value={stats.inactive_jobs}
                            icon={<XCircle sx={{ fontSize: 30 }} />}
                            color="#f44336"
                            onClick={() => navigate('/business/jobs?status=inactive')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Profile Views"
                            value={stats.profile_views || 0}
                            icon={<ChartBar sx={{ fontSize: 30 }} />}
                            color="#FF9800"
                        />
                    </Grid>
                </Grid>

                {/* Charts and Recent Jobs */}
                <Grid container spacing={3}>
                    {/* Jobs Overview Chart */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={styles.chartPaper}>
                            <Box sx={styles.chartHeader}>
                                <Typography variant="h6" sx={styles.chartTitle}>
                                    Jobs Overview
                                </Typography>
                                <Chip 
                                    label={`${stats.active_jobs} Active`}
                                    size="small"
                                    sx={styles.activeChip}
                                />
                            </Box>
                            <Box sx={styles.chartContainer}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={charts.jobs_over_time}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar dataKey="jobs" fill="#0003b1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Jobs by Type Pie Chart */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={styles.chartPaper}>
                            <Typography variant="h6" sx={styles.chartTitle}>
                                Jobs by Type
                            </Typography>
                            <Box sx={styles.pieChartContainer}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.jobs_by_type}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="type"
                                            label={({ type, percent }) => 
                                                `${type || 'Other'} ${(percent * 100).toFixed(0)}%`
                                            }
                                        >
                                            {charts.jobs_by_type.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Recent Jobs List */}
                    <Grid item xs={12}>
                        <Paper sx={styles.tablePaper}>
                            <Box sx={styles.tableHeader}>
                                <Typography variant="h6" sx={styles.tableTitle}>
                                    Recent Job Postings
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Plus />}
                                    onClick={() => navigate('/business/jobs/create')}
                                    sx={styles.smallCreateButton}
                                >
                                    New Job
                                </Button>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Job Title</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Location</TableCell>
                                            <TableCell>Posted Date</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentJobs.length > 0 ? (
                                            recentJobs.map((job) => (
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
                                                                {job.salary && (
                                                                    <Typography variant="caption" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <Currency sx={{ fontSize: 14 }} /> {job.salary}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={job.type || 'Full Time'}
                                                            sx={styles.typeChip(job.type)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <MapPin sx={{ fontSize: 16, color: '#666' }} />
                                                            <Typography variant="body2">{job.location || 'Not specified'}</Typography>
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
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={job.is_active ? 'Active' : 'Inactive'}
                                                            sx={{
                                                                bgcolor: job.is_active ? '#e8f5e8' : '#ffebee',
                                                                color: job.is_active ? '#2e7d32' : '#c62828'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton 
                                                            size="small"
                                                            onClick={() => navigate(`/business/jobs/${job.id}`)}
                                                            sx={{ color: '#666' }}
                                                        >
                                                            <ViewIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton 
                                                            size="small"
                                                            onClick={() => navigate(`/business/jobs/edit/${job.id}`)}
                                                            sx={{ color: '#666' }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                    <Briefcase sx={{ fontSize: 48, color: '#ccc' }} />
                                                    <Typography variant="h6" sx={{ color: '#999', mt: 2, mb: 1 }}>
                                                        No Jobs Posted Yet
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
                                                        Start by creating your first job posting
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<Plus />}
                                                        onClick={() => navigate('/business/jobs/create')}
                                                        sx={styles.createButton}
                                                    >
                                                        Post Your First Job
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
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
    verificationBanner: {
        p: 3,
        mb: 4,
        borderRadius: '16px',
        bgcolor: '#fff3e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
    },
    pendingIcon: {
        width: 48,
        height: 48,
        borderRadius: '50%',
        bgcolor: '#fff3e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #FF9800'
    },
    pendingChip: {
        bgcolor: '#FF9800',
        color: '#fff',
        fontWeight: 600
    },
    statCard: {
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }
    },
    statHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 2
    },
    statIcon: (color) => ({
        width: 56,
        height: 56,
        borderRadius: '16px',
        bgcolor: `${color}15`,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }),
    statValue: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 800,
        fontSize: '2rem',
        color: '#1a1a1a',
        mb: 0.5
    },
    statLabel: {
        color: '#666',
        fontWeight: 500
    },
    chartPaper: {
        p: 3,
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        height: '100%',
        minHeight: 350
    },
    chartHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
    },
    chartTitle: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 700,
        color: '#1a1a1a'
    },
    activeChip: {
        bgcolor: '#e8f5e8',
        color: '#2e7d32',
        fontWeight: 600
    },
    chartContainer: {
        width: '100%',
        height: 250
    },
    pieChartContainer: {
        width: '100%',
        height: 250,
        mt: 2
    },
    tablePaper: {
        p: 3,
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
    },
    tableHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
    },
    smallCreateButton: {
        borderRadius: '8px',
        bgcolor: '#0003b1',
        '&:hover': {
            bgcolor: '#000290'
        }
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
    typeChip: (type) => ({
        bgcolor: type === 'full-time' ? '#e3f2fd' : 
                 type === 'part-time' ? '#fff3e0' : '#f3e5f5',
        color: type === 'full-time' ? '#1976d2' : 
               type === 'part-time' ? '#e65100' : '#7b1fa2'
    })
};