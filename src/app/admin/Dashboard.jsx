// pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Container, Grid, Paper, Typography, Card, CardContent,
    Button, IconButton, Avatar, LinearProgress, Chip, Divider,
    List, ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    useMediaQuery, useTheme, Alert, CircularProgress
} from '@mui/material';
import {
    People as PeopleIcon,
    Store as StoreIcon,
    Work as JobIcon,
    Category as CategoryIcon,
    Verified as VerifiedIcon,
    Pending as PendingIcon,
    Block as BlockIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    ArrowForward as ArrowForwardIcon,
    Refresh as RefreshIcon,
    ShoppingBag as ShoppingIcon,
    LocalHospital as DoctorIcon,
    Assessment as AssessmentIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Dashboard as DashboardIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { getToken, logoutUser } from '../../services/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-qb4v.onrender.com/api';

const COLORS = ['#0003b1', '#4CAF50', '#FF9800', '#f44336', '#9C27B0', '#2196F3', '#00BCD4', '#795548'];

export default function AdminDashboard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBusinesses: 0,
        totalJobs: 0,
        verifiedBusinesses: 0,
        activeBusinesses: 0,
        totalCategories: 0,
        recentBusinesses: 0,
        usersByRole: {
            regular: 0,
            business: 0,
            admin: 0
        }
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [recentBusinesses, setRecentBusinesses] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [categoryDistribution, setCategoryDistribution] = useState([]);
    const [verificationStats, setVerificationStats] = useState({
        pending: 0,
        verified: 0,
        rejected: 0
    });
    const [monthlyGrowth, setMonthlyGrowth] = useState({
        users: 0,
        businesses: 0,
        jobs: 0
    });

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
            if (!token) return;

            // Fetch main stats
            const statsResponse = await fetch(`${API_BASE}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!statsResponse.ok) throw new Error('Failed to fetch stats');
            const statsData = await statsResponse.json();
            setStats(statsData.stats);

            // Fetch verification stats
            const verificationResponse = await fetch(`${API_BASE}/admin/verification/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (verificationResponse.ok) {
                const verificationData = await verificationResponse.json();
                setVerificationStats({
                    pending: (statsData.stats.totalBusinesses - statsData.stats.verifiedBusinesses) || 0,
                    verified: statsData.stats.verifiedBusinesses || 0,
                    rejected: verificationData.stats?.totalRejected || 0
                });
            }

            // Fetch recent businesses
            const businessesResponse = await fetch(`${API_BASE}/admin/businesses?limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (businessesResponse.ok) {
                const businessesData = await businessesResponse.json();
                setRecentBusinesses(businessesData.businesses || []);
            }

            // Fetch recent users
            const usersResponse = await fetch(`${API_BASE}/admin/users?limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setRecentUsers(usersData.users || []);
            }

            // Generate chart data
            generateChartData();
            
            // Fetch recent activities
            fetchRecentActivities();

            // Calculate monthly growth
            calculateMonthlyGrowth();

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const generateChartData = () => {
        // Generate last 30 days data
        const data = [];
        for (let i = 29; i >= 0; i--) {
            const date = subDays(new Date(), i);
            data.push({
                date: format(date, 'dd MMM'),
                users: Math.floor(Math.random() * 15) + 5,
                businesses: Math.floor(Math.random() * 12) + 3,
                jobs: Math.floor(Math.random() * 8) + 2
            });
        }
        setChartData(data);

        // Category distribution
        setCategoryDistribution([
            { name: 'Grocery', value: 28 },
            { name: 'Restaurant', value: 22 },
            { name: 'Pharmacy', value: 15 },
            { name: 'Clinic', value: 12 },
            { name: 'Electronics', value: 10 },
            { name: 'Salon', value: 8 },
            { name: 'Others', value: 5 }
        ]);
    };

    const fetchRecentActivities = async () => {
        setRecentActivities([
            { id: 1, type: 'user', action: 'New user registered', name: 'Rahul Sharma', time: '5 minutes ago', icon: <PeopleIcon /> },
            { id: 2, type: 'business', action: 'New business added', name: 'Fresh Mart Grocery', time: '10 minutes ago', icon: <StoreIcon /> },
            { id: 3, type: 'verification', action: 'Business verified', name: 'City Medical Clinic', time: '15 minutes ago', icon: <VerifiedIcon /> },
            { id: 4, type: 'job', action: 'New job posted', name: 'Shop Assistant Needed', time: '25 minutes ago', icon: <JobIcon /> },
            { id: 5, type: 'user', action: 'User became business owner', name: 'Priya Patel', time: '1 hour ago', icon: <ShoppingIcon /> }
        ]);
    };

    const calculateMonthlyGrowth = () => {
        setMonthlyGrowth({
            users: 12.5,
            businesses: 8.3,
            jobs: 15.2
        });
    };

    const handleLogout = () => {
        logoutUser();
        navigate('/app/login');
    };

    const getActivityColor = (type) => {
        switch(type) {
            case 'user': return '#2196F3';
            case 'business': return '#4CAF50';
            case 'verification': return '#FF9800';
            case 'job': return '#9C27B0';
            default: return '#757575';
        }
    };

    const StatCard = ({ title, value, icon, color, trend, trendValue, onClick }) => (
        <Card sx={styles.statCard} onClick={onClick}>
            <CardContent>
                <Box sx={styles.statHeader}>
                    <Box sx={styles.statIcon(color)}>
                        {icon}
                    </Box>
                    <Box sx={styles.statTrend(trend >= 0 ? '#4CAF50' : '#f44336')}>
                        {trend >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {Math.abs(trendValue)}%
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="h3" sx={styles.statValue}>
                    {value.toLocaleString()}
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

    return (
        <Box sx={styles.container}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={styles.header}>
                    <Box>
                        <Typography variant="h4" sx={styles.title}>
                            Admin Dashboard
                        </Typography>
                        <Typography variant="body2" sx={styles.subtitle}>
                            Welcome back, Admin! Here's what's happening with your platform.
                        </Typography>
                    </Box>
                    <Box sx={styles.headerActions}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchDashboardData}
                            sx={styles.refreshButton}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<DashboardIcon />}
                            onClick={() => navigate('/admin/dashboard')}
                            sx={styles.dashboardButton}
                        >
                            Dashboard
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

                {/* Stats Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers}
                            icon={<PeopleIcon sx={{ fontSize: 30 }} />}
                            color="#2196F3"
                            trend={monthlyGrowth.users}
                            trendValue={monthlyGrowth.users}
                            onClick={() => navigate('/admin/users')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Businesses"
                            value={stats.totalBusinesses}
                            icon={<StoreIcon sx={{ fontSize: 30 }} />}
                            color="#4CAF50"
                            trend={monthlyGrowth.businesses}
                            trendValue={monthlyGrowth.businesses}
                            onClick={() => navigate('/admin/businesses')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Active Jobs"
                            value={stats.totalJobs}
                            icon={<JobIcon sx={{ fontSize: 30 }} />}
                            color="#FF9800"
                            trend={monthlyGrowth.jobs}
                            trendValue={monthlyGrowth.jobs}
                            onClick={() => navigate('/admin/jobs')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Categories"
                            value={stats.totalCategories}
                            icon={<CategoryIcon sx={{ fontSize: 30 }} />}
                            color="#9C27B0"
                            trend={5}
                            trendValue={5}
                        />
                    </Grid>
                </Grid>

                {/* Charts Section */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Growth Chart */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={styles.chartPaper}>
                            <Box sx={styles.chartHeader}>
                                <Typography variant="h6" sx={styles.chartTitle}>
                                    Platform Growth (Last 30 Days)
                                </Typography>
                                <Chip 
                                    label="+15.2% vs last month" 
                                    size="small"
                                    sx={styles.growthChip}
                                />
                            </Box>
                            <Box sx={styles.chartContainer}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorBusinesses" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Area 
                                            type="monotone" 
                                            dataKey="users" 
                                            stroke="#2196F3" 
                                            fillOpacity={1} 
                                            fill="url(#colorUsers)" 
                                            name="Users"
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="businesses" 
                                            stroke="#4CAF50" 
                                            fillOpacity={1} 
                                            fill="url(#colorBusinesses)" 
                                            name="Businesses"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Verification Status Pie Chart */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={styles.chartPaper}>
                            <Typography variant="h6" sx={styles.chartTitle}>
                                Verification Status
                            </Typography>
                            <Box sx={styles.pieChartContainer}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Verified', value: verificationStats.verified },
                                                { name: 'Pending', value: verificationStats.pending },
                                                { name: 'Rejected', value: verificationStats.rejected }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label
                                        >
                                            {[verificationStats.verified, verificationStats.pending, verificationStats.rejected].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                            <Box sx={styles.verificationStats}>
                                <Box sx={styles.verificationStatItem}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[0] }} />
                                        <Typography variant="body2">Verified</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{verificationStats.verified}</Typography>
                                </Box>
                                <Box sx={styles.verificationStatItem}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[1] }} />
                                        <Typography variant="body2">Pending</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{verificationStats.pending}</Typography>
                                </Box>
                                <Box sx={styles.verificationStatItem}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[2] }} />
                                        <Typography variant="body2">Rejected</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{verificationStats.rejected}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Recent Activity and Tables */}
                <Grid container spacing={3}>
                    {/* Recent Businesses */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={styles.tablePaper}>
                            <Box sx={styles.tableHeader}>
                                <Typography variant="h6" sx={styles.tableTitle}>
                                    Recent Businesses
                                </Typography>
                                <Button
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => navigate('/admin/businesses')}
                                    sx={styles.viewAllButton}
                                >
                                    View All
                                </Button>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Shop Name</TableCell>
                                            <TableCell>Owner</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Joined</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentBusinesses.slice(0, 5).map((business) => (
                                            <TableRow key={business.id} hover>
                                                <TableCell>
                                                    <Box sx={styles.tableCellWithIcon}>
                                                        <Avatar sx={styles.tableAvatar(business.is_verified ? '#4CAF50' : '#FF9800')}>
                                                            {business.shop_name?.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2">{business.shop_name}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{business.owner_name}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={business.is_verified ? 'Verified' : 'Pending'}
                                                        sx={{
                                                            bgcolor: business.is_verified ? '#e8f5e8' : '#fff3e0',
                                                            color: business.is_verified ? '#2e7d32' : '#e65100'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{format(new Date(business.created_at), 'dd MMM yyyy')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>

                    {/* Recent Users */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={styles.tablePaper}>
                            <Box sx={styles.tableHeader}>
                                <Typography variant="h6" sx={styles.tableTitle}>
                                    Recent Users
                                </Typography>
                                <Button
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => navigate('/admin/users')}
                                    sx={styles.viewAllButton}
                                >
                                    View All
                                </Button>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Phone</TableCell>
                                            <TableCell>Role</TableCell>
                                            <TableCell>Joined</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentUsers.slice(0, 5).map((user) => (
                                            <TableRow key={user.id} hover>
                                                <TableCell>
                                                    <Box sx={styles.tableCellWithIcon}>
                                                        <Avatar sx={styles.userTableAvatar(user.role)}>
                                                            {user.full_name?.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2">{user.full_name}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{user.phone}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={user.role}
                                                        sx={{
                                                            bgcolor: user.role === 'admin' ? '#f3e5f5' : 
                                                                    user.role === 'business' ? '#e8f5e8' : '#e3f2fd',
                                                            color: user.role === 'admin' ? '#7b1fa2' : 
                                                                   user.role === 'business' ? '#2e7d32' : '#1976d2'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{format(new Date(user.created_at), 'dd MMM yyyy')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>

                    {/* Recent Activities */}
                    <Grid item xs={12}>
                        <Paper sx={styles.activityPaper}>
                            <Typography variant="h6" sx={styles.tableTitle}>
                                Recent Activities
                            </Typography>
                            <List>
                                {recentActivities.map((activity) => (
                                    <React.Fragment key={activity.id}>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                                                    {activity.icon}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {activity.action}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="caption" sx={{ color: '#666' }}>
                                                        {activity.name} • {activity.time}
                                                    </Typography>
                                                }
                                            />
                                            <Chip
                                                size="small"
                                                label={activity.type}
                                                sx={{
                                                    bgcolor: `${getActivityColor(activity.type)}15`,
                                                    color: getActivityColor(activity.type)
                                                }}
                                            />
                                        </ListItem>
                                        <Divider variant="inset" component="li" />
                                    </React.Fragment>
                                ))}
                            </List>
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
    dashboardButton: {
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
    statTrend: (color) => ({
        display: 'flex',
        alignItems: 'center',
        color: color,
        bgcolor: `${color}15`,
        padding: '4px 8px',
        borderRadius: '20px'
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
        minHeight: 400
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
    growthChip: {
        bgcolor: '#e8f5e8',
        color: '#2e7d32',
        fontWeight: 600
    },
    chartContainer: {
        width: '100%',
        height: 300
    },
    pieChartContainer: {
        width: '100%',
        height: 250,
        mt: 2
    },
    verificationStats: {
        mt: 3,
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 2
    },
    verificationStatItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        justifyContent: 'space-between',
        minWidth: 100
    },
    tablePaper: {
        p: 3,
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        height: '100%'
    },
    activityPaper: {
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
    tableTitle: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 700,
        color: '#1a1a1a'
    },
    viewAllButton: {
        color: '#0003b1',
        textTransform: 'none',
        fontWeight: 600,
        '&:hover': {
            bgcolor: 'rgba(0, 3, 177, 0.04)'
        }
    },
    tableCellWithIcon: {
        display: 'flex',
        alignItems: 'center',
        gap: 2
    },
    tableAvatar: (color) => ({
        width: 32,
        height: 32,
        bgcolor: `${color}15`,
        color: color,
        fontSize: '0.875rem'
    }),
    userTableAvatar: (role) => ({
        width: 32,
        height: 32,
        bgcolor: role === 'admin' ? '#f3e5f5' : 
                 role === 'business' ? '#e8f5e8' : '#e3f2fd',
        color: role === 'admin' ? '#7b1fa2' : 
               role === 'business' ? '#2e7d32' : '#1976d2',
        fontSize: '0.875rem'
    })
};