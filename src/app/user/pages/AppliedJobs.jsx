import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Chip,
    Tabs,
    Tab,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Work as WorkIcon,
    CheckCircle as AcceptedIcon,
    Pending as PendingIcon,
    Cancel as RejectedIcon
} from '@mui/icons-material';
import { useJobs } from '../../../hooks/useJobs';
import JobCard from '../components/JobCard';
import EmptyState from '../components/EmptyState';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function AppliedJobs() {
    const [tabValue, setTabValue] = useState(0);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { fetchMyApplications } = useJobs();

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        setLoading(true);
        try {
            const data = await fetchMyApplications();
            setApplications(data);
        } catch (err) {
            setError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'shortlisted': return 'info';
            case 'rejected': return 'error';
            case 'hired': return 'success';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <PendingIcon />;
            case 'shortlisted': return <WorkIcon />;
            case 'rejected': return <RejectedIcon />;
            case 'hired': return <AcceptedIcon />;
            default: return null;
        }
    };

    const filteredApplications = applications.filter(app => {
        if (tabValue === 0) return true;
        if (tabValue === 1) return app.status === 'pending';
        if (tabValue === 2) return ['shortlisted', 'hired'].includes(app.status);
        if (tabValue === 3) return app.status === 'rejected';
        return true;
    });

    const counts = {
        all: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        active: applications.filter(a => ['shortlisted', 'hired'].includes(a.status)).length,
        rejected: applications.filter(a => a.status === 'rejected').length
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f8f8f8', minHeight: '100vh', pb: 8 }}>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                {/* Header */}
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                    My Applications
                </Typography>

                {/* Error Message */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Stats Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#C00C0C' }}>
                                {counts.all}
                            </Typography>
                            <Typography variant="body2" color="#666">
                                Total Applications
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#ff9800' }}>
                                {counts.pending}
                            </Typography>
                            <Typography variant="body2" color="#666">
                                Pending
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#4caf50' }}>
                                {counts.active}
                            </Typography>
                            <Typography variant="body2" color="#666">
                                Active
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f44336' }}>
                                {counts.rejected}
                            </Typography>
                            <Typography variant="body2" color="#666">
                                Rejected
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Tabs */}
                <Paper sx={{ borderRadius: 3 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(e, v) => setTabValue(v)}
                        sx={{
                            borderBottom: '1px solid #eee',
                            '& .MuiTab-root': { fontWeight: 600 },
                            '& .Mui-selected': { color: '#C00C0C !important' },
                            '& .MuiTabs-indicator': { bgcolor: '#C00C0C' }
                        }}
                    >
                        <Tab label={`All (${counts.all})`} />
                        <Tab label={`Pending (${counts.pending})`} />
                        <Tab label={`Active (${counts.active})`} />
                        <Tab label={`Rejected (${counts.rejected})`} />
                    </Tabs>

                    {/* All Applications */}
                    <TabPanel value={tabValue} index={0}>
                        {filteredApplications.length === 0 ? (
                            <EmptyState
                                icon={<WorkIcon sx={{ fontSize: 64 }} />}
                                title="No applications yet"
                                description="Apply to jobs to see them here"
                            />
                        ) : (
                            <Grid container spacing={2}>
                                {filteredApplications.map((app) => (
                                    <Grid item xs={12} key={app.id}>
                                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                        {app.job?.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="#666" sx={{ mb: 1 }}>
                                                        {app.job?.business?.business_name}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                        <Chip
                                                            icon={getStatusIcon(app.status)}
                                                            label={app.status}
                                                            size="small"
                                                            color={getStatusColor(app.status)}
                                                        />
                                                        <Typography variant="caption" color="#666">
                                                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                    {app.coverLetter && (
                                                        <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
                                                            {app.coverLetter}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Chip
                                                    label={`Expected: ₹${app.expectedSalary}`}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </TabPanel>

                    {/* Pending Applications */}
                    <TabPanel value={tabValue} index={1}>
                        {filteredApplications.length === 0 ? (
                            <EmptyState
                                icon={<PendingIcon sx={{ fontSize: 64 }} />}
                                title="No pending applications"
                                description="Your pending applications will appear here"
                            />
                        ) : (
                            <Grid container spacing={2}>
                                {filteredApplications.map((app) => (
                                    <Grid item xs={12} key={app.id}>
                                        <JobCard job={app.job} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </TabPanel>

                    {/* Active Applications */}
                    <TabPanel value={tabValue} index={2}>
                        {filteredApplications.length === 0 ? (
                            <EmptyState
                                icon={<AcceptedIcon sx={{ fontSize: 64 }} />}
                                title="No active applications"
                                description="Shortlisted and hired applications will appear here"
                            />
                        ) : (
                            <Grid container spacing={2}>
                                {filteredApplications.map((app) => (
                                    <Grid item xs={12} key={app.id}>
                                        <JobCard job={app.job} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </TabPanel>

                    {/* Rejected Applications */}
                    <TabPanel value={tabValue} index={3}>
                        {filteredApplications.length === 0 ? (
                            <EmptyState
                                icon={<RejectedIcon sx={{ fontSize: 64 }} />}
                                title="No rejected applications"
                                description="You're doing great! Keep applying"
                            />
                        ) : (
                            <Grid container spacing={2}>
                                {filteredApplications.map((app) => (
                                    <Grid item xs={12} key={app.id}>
                                        <JobCard job={app.job} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </TabPanel>
                </Paper>
            </Container>
        </Box>
    );
}