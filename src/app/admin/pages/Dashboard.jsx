import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    IconButton,
    Button,
    Menu,
    MenuItem,
    LinearProgress,
    Chip,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Store as StoreIcon,
    Church as ChurchIcon,
    Work as WorkIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    MoreVert as MoreVertIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    CalendarToday as CalendarIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { useAdmin } from '../../../hooks/useAdmin';
import { useTheme } from '../../../hooks/useTheme';
import { formatNumber, formatDate, timeAgo } from '../../../utils/formatting';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [period, setPeriod] = useState('week');
    
    const { fetchStats, fetchReports } = useAdmin();
    const { theme } = useTheme();

    useEffect(() => {
        loadDashboard();
    }, [period]);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const [statsData, reportsData] = await Promise.all([
                fetchStats(),
                fetchReports(period)
            ]);
            setStats(statsData);
            setReports(reportsData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        handleMenuClose();
    };

    const handleExport = () => {
        // Export logic
        console.log('Exporting data...');
        handleMenuClose();
    };

    if (loading) {
        return (
            <Box sx={{ width: '100%', mt: 4 }}>
                <LinearProgress />
            </Box>
        );
    }

    // Chart data
    const registrationsChart = {
        labels: reports?.registrations?.map(r => r.date) || [],
        datasets: [
            {
                label: 'New Registrations',
                data: reports?.registrations?.map(r => r.count) || [],
                borderColor: '#C00C0C',
                backgroundColor: 'rgba(192, 12, 12, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const appointmentsChart = {
        labels: reports?.appointmentsByStatus?.map(a => a.status) || [],
        datasets: [
            {
                data: reports?.appointmentsByStatus?.map(a => a.count) || [],
                backgroundColor: [
                    '#FFA726', // pending - orange
                    '#4CAF50', // approved - green
                    '#F44336', // rejected - red
                    '#9E9E9E', // cancelled - gray
                    '#2196F3' // completed - blue
                ],
                borderWidth: 0
            }
        ]
    };

    const topBusinesses = reports?.topBusinesses || [];

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                        Admin Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                        Welcome back! Here's what's happening with NearZO
                    </Typography>
                </Box>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={loadDashboard}
                        sx={{ mr: 2 }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                        sx={{ bgcolor: '#C00C0C' }}
                    >
                        Export
                    </Button>
                    <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                        <MenuItem onClick={() => handlePeriodChange('week')}>Last 7 Days</MenuItem>
                        <MenuItem onClick={() => handlePeriodChange('month')}>Last 30 Days</MenuItem>
                        <MenuItem onClick={() => handlePeriodChange('year')}>Last 12 Months</MenuItem>
                        <Divider />
                        <MenuItem onClick={handleExport}>Export as CSV</MenuItem>
                    </Menu>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Users"
                        value={stats?.overview?.totalUsers || 0}
                        icon={<PeopleIcon />}
                        color="#2196f3"
                        trend={stats?.trends?.newUsersLastWeek}
                        trendLabel="new this week"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Businesses"
                        value={stats?.overview?.totalBusinesses || 0}
                        icon={<StoreIcon />}
                        color="#4caf50"
                        subValue={`${stats?.pending?.businesses || 0} pending`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Worship Places"
                        value={stats?.overview?.totalWorship || 0}
                        icon={<ChurchIcon />}
                        color="#9c27b0"
                        subValue={`${stats?.pending?.worship || 0} pending`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Active Jobs"
                        value={stats?.overview?.activeJobs || 0}
                        icon={<WorkIcon />}
                        color="#f44336"
                        subValue={`${stats?.today?.appointments || 0} appointments today`}
                    />
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                            User Registrations
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <Line
                                data={registrationsChart}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false }
                                    },
                                    scales: {
                                        y: { beginAtZero: true }
                                    }
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                            Appointments Status
                        </Typography>
                        <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
                            <Doughnut
                                data={appointmentsChart}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'bottom' }
                                    },
                                    cutout: '70%'
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Tables */}
            <Grid container spacing={3}>
                {/* Pending Verifications */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Pending Verifications
                            </Typography>
                            <Chip
                                icon={<PendingIcon />}
                                label={`${(stats?.pending?.businesses || 0) + (stats?.pending?.worship || 0)} pending`}
                                color="warning"
                                size="small"
                            />
                        </Box>
                        <List>
                            {topBusinesses.slice(0, 5).map((business, index) => (
                                <ListItem
                                    key={index}
                                    secondaryAction={
                                        <Chip
                                            label="Pending"
                                            size="small"
                                            color="warning"
                                            variant="outlined"
                                        />
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: '#ff9800' }}>
                                            <StoreIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={business.business_name}
                                        secondary={`Requested ${timeAgo(business.created_at)}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={() => navigate('/app/admin/verifications')}
                        >
                            View All Verifications
                        </Button>
                    </Paper>
                </Grid>

                {/* Top Businesses */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Top Performing Businesses
                            </Typography>
                            <Chip
                                icon={<TrendingUpIcon />}
                                label="By Views"
                                color="success"
                                size="small"
                            />
                        </Box>
                        <List>
                            {topBusinesses.map((business, index) => (
                                <ListItem key={index}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: '#4caf50' }}>
                                            {index + 1}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={business.business_name}
                                        secondary={`${formatNumber(business.view_count)} views`}
                                    />
                                    <Chip
                                        icon={<StarIcon />}
                                        label={business.rating_avg?.toFixed(1) || 'New'}
                                        size="small"
                                        color={business.rating_avg > 4 ? 'success' : 'default'}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Recent Users */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                            Recent Users
                        </Typography>
                        <DataTable
                            columns={[
                                { field: 'fullName', header: 'Name' },
                                { field: 'phone', header: 'Phone' },
                                { field: 'role', header: 'Role' },
                                { field: 'city', header: 'City' },
                                { 
                                    field: 'createdAt', 
                                    header: 'Joined',
                                    render: (row) => timeAgo(row.createdAt)
                                },
                                {
                                    field: 'status',
                                    header: 'Status',
                                    render: (row) => (
                                        <StatusChip
                                            status={row.isVerified ? 'verified' : 'pending'}
                                            type={row.isBlocked ? 'blocked' : 'active'}
                                        />
                                    )
                                }
                            ]}
                            data={[]} // Add your data here
                            onRowClick={(row) => navigate(`/app/admin/users/${row.id}`)}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

// Stats Card Component
function StatsCard({ title, value, icon, color, trend, trendLabel, subValue }) {
    return (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color }}>
                            {formatNumber(value)}
                        </Typography>
                        {trend !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50', mr: 0.5 }} />
                                <Typography variant="caption" sx={{ color: '#4caf50' }}>
                                    +{trend}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#999', ml: 1 }}>
                                    {trendLabel}
                                </Typography>
                            </Box>
                        )}
                        {subValue && (
                            <Typography variant="caption" sx={{ color: '#999', mt: 1, display: 'block' }}>
                                {subValue}
                            </Typography>
                        )}
                    </Box>
                    <Avatar sx={{ bgcolor: `${color}20`, color }}>
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );
}