import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    Menu,
    MenuItem,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Download as DownloadIcon,
    CalendarToday as CalendarIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { useAdmin } from '../../../hooks/useAdmin';
import { formatNumber, formatCurrency, formatDate } from '../../../utils/formatting';
import { Line, Bar } from 'react-chartjs-2';

export default function Reports() {
    const [reports, setReports] = useState(null);
    const [period, setPeriod] = useState('month');
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { fetchReports } = useAdmin();

    useEffect(() => {
        loadReports();
    }, [period]);

    const loadReports = async () => {
        try {
            const data = await fetchReports(period);
            setReports(data);
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        setAnchorEl(null);
    };

    const handleExport = (format) => {
        console.log(`Exporting as ${format}...`);
        setAnchorEl(null);
    };

    // Chart data
    const registrationsChart = {
        labels: reports?.registrations?.map(r => r.date) || [],
        datasets: [
            {
                label: 'Registrations',
                data: reports?.registrations?.map(r => r.count) || [],
                backgroundColor: '#C00C0C',
                borderRadius: 8
            }
        ]
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Analytics & Reports
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<CalendarIcon />}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{ mr: 2 }}
                    >
                        {period === 'week' ? 'Last 7 Days' : 
                         period === 'month' ? 'Last 30 Days' : 'Last 12 Months'}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExport('csv')}
                        sx={{ bgcolor: '#C00C0C' }}
                    >
                        Export
                    </Button>
                </Box>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    <MenuItem onClick={() => handlePeriodChange('week')}>Last 7 Days</MenuItem>
                    <MenuItem onClick={() => handlePeriodChange('month')}>Last 30 Days</MenuItem>
                    <MenuItem onClick={() => handlePeriodChange('year')}>Last 12 Months</MenuItem>
                    <MenuItem onClick={() => handlePeriodChange('custom')}>Custom Range</MenuItem>
                </Menu>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <SummaryCard
                        title="Total Registrations"
                        value={reports?.registrations?.reduce((sum, r) => sum + r.count, 0) || 0}
                        trend="+12.5%"
                        trendUp={true}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <SummaryCard
                        title="Active Users"
                        value="1,234"
                        trend="+5.2%"
                        trendUp={true}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <SummaryCard
                        title="Total Appointments"
                        value={reports?.appointmentsByStatus?.reduce((sum, a) => sum + a.count, 0) || 0}
                        trend="-2.1%"
                        trendUp={false}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <SummaryCard
                        title="Avg. Rating"
                        value="4.2"
                        suffix="/5"
                        trend="+0.3"
                        trendUp={true}
                    />
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                            User Registrations Over Time
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <Bar
                                data={registrationsChart}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false }
                                    }
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                            Popular Search Terms
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Term</TableCell>
                                        <TableCell align="right">Searches</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reports?.popularSearches?.slice(0, 8).map((term) => (
                                        <TableRow key={term.query}>
                                            <TableCell>{term.query}</TableCell>
                                            <TableCell align="right">{formatNumber(term.count)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Top Businesses Table */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Top Performing Businesses
                    </Typography>
                    <TextField
                        placeholder="Search businesses..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Business Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Views</TableCell>
                                <TableCell align="right">Searches</TableCell>
                                <TableCell align="right">Rating</TableCell>
                                <TableCell align="right">Jobs</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reports?.topBusinesses?.map((business) => (
                                <TableRow key={business.id}>
                                    <TableCell sx={{ fontWeight: 600 }}>{business.business_name}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={business.business_category}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">{formatNumber(business.view_count)}</TableCell>
                                    <TableCell align="right">{formatNumber(business.search_count)}</TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            {business.rating_avg?.toFixed(1)}
                                            <span style={{ color: '#FFB800', marginLeft: 4 }}>⭐</span>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">{business.jobs_count || 0}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}

// Summary Card Component
function SummaryCard({ title, value, trend, trendUp, suffix = '' }) {
    return (
        <Card sx={{ borderRadius: 3 }}>
            <CardContent>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                    {formatNumber(value)}{suffix}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {trendUp ? (
                        <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 16, mr: 0.5 }} />
                    ) : (
                        <TrendingDownIcon sx={{ color: '#f44336', fontSize: 16, mr: 0.5 }} />
                    )}
                    <Typography
                        variant="caption"
                        sx={{ color: trendUp ? '#4caf50' : '#f44336', fontWeight: 600 }}
                    >
                        {trend}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999', ml: 1 }}>
                        vs previous period
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}