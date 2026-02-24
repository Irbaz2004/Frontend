import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    IconButton,
    Chip,
    Button,
    Divider,
    Alert,
    Skeleton,
    useTheme
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Refresh as RefreshIcon,
    Store as StoreIcon,
    Work as WorkIcon,
    Church as ChurchIcon,
    LocalHospital as DoctorIcon,
    ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../../hooks/useLocation';
import { useNearby } from '../../../hooks/useNearby';
import { useAuth } from '../../../hooks/useAuth';
import ShopCard from '../components/ShopCard';
import JobCard from '../components/JobCard';
import DoctorCard from '../components/DoctorCard';
import LocationBar from '../components/LocationBar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function UserHome() {
    const navigate = useNavigate();
    const theme = useTheme();
    const { user } = useAuth();
    const { location, radius, changeRadius } = useLocation(true);
    const { data, loading, error, refresh } = useNearby(true);

    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    const quickActions = [
        { icon: <StoreIcon />, label: 'Shops', path: '/app/user/shops', color: '#4caf50' },
        { icon: <WorkIcon />, label: 'Jobs', path: '/app/user/jobs', color: '#f44336' },
        { icon: <DoctorIcon />, label: 'Doctors', path: '/app/user/doctors', color: '#2196f3' },
        { icon: <ChurchIcon />, label: 'Worship', path: '/app/user/search?type=worship', color: '#9c27b0' }
    ];

    if (!location) {
        return (
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
                    <LocationIcon sx={{ fontSize: 48, color: '#999', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Enable Location Access
                    </Typography>
                    <Typography color="#666" sx={{ mb: 3 }}>
                        We need your location to show nearby places
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.location.reload()}
                        sx={{ bgcolor: '#C00C0C' }}
                    >
                        Retry
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f8f8f8', minHeight: '100vh', pb: 8 }}>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {greeting}, {user?.fullName?.split(' ')[0]}!
                    </Typography>
                    <Typography color="#666">
                        Find everything near you
                    </Typography>
                </Box>

                {/* Location Bar */}
                <LocationBar
                    location={location}
                    radius={radius}
                    onRadiusChange={changeRadius}
                    onRefresh={refresh}
                />

                {/* Error Message */}
                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: 2 }}
                        action={
                            <Button color="inherit" size="small" onClick={refresh}>
                                Retry
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                )}

                {/* Quick Actions */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                        {quickActions.map((action) => (
                            <Grid item xs={6} sm={3} key={action.label}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => navigate(action.path)}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1,
                                        borderColor: '#eee',
                                        '&:hover': {
                                            borderColor: action.color,
                                            bgcolor: `${action.color}08`
                                        }
                                    }}
                                >
                                    <Box sx={{ color: action.color }}>
                                        {action.icon}
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {action.label}
                                    </Typography>
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>

                {/* Nearby Sections */}
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <>
                        {/* Nearby Shops */}
                        {data?.businesses?.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        Nearby Shops
                                    </Typography>
                                    <Button
                                        endIcon={<ArrowIcon />}
                                        onClick={() => navigate('/app/user/shops')}
                                        sx={{ color: '#C00C0C' }}
                                    >
                                        View All
                                    </Button>
                                </Box>
                                <Grid container spacing={2}>
                                    {data.businesses.slice(0, 4).map((shop) => (
                                        <Grid item xs={12} sm={6} md={3} key={shop.id}>
                                            <ShopCard shop={shop} onClick={() => navigate(`/app/user/shops/${shop.id}`)} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Nearby Jobs */}
                        {data?.jobs?.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        Jobs Near You
                                    </Typography>
                                    <Button
                                        endIcon={<ArrowIcon />}
                                        onClick={() => navigate('/app/user/jobs')}
                                        sx={{ color: '#C00C0C' }}
                                    >
                                        View All
                                    </Button>
                                </Box>
                                <Grid container spacing={2}>
                                    {data.jobs.slice(0, 3).map((job) => (
                                        <Grid item xs={12} md={4} key={job.id}>
                                            <JobCard job={job} onClick={() => navigate(`/app/user/jobs/${job.id}`)} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Nearby Doctors */}
                        {data?.doctors?.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        Doctors Near You
                                    </Typography>
                                    <Button
                                        endIcon={<ArrowIcon />}
                                        onClick={() => navigate('/app/user/doctors')}
                                        sx={{ color: '#C00C0C' }}
                                    >
                                        View All
                                    </Button>
                                </Box>
                                <Grid container spacing={2}>
                                    {data.doctors?.slice(0, 4).map((doctor) => (
                                        <Grid item xs={12} sm={6} md={3} key={doctor.id}>
                                            <DoctorCard doctor={doctor} onClick={() => navigate(`/app/user/doctors/${doctor.id}`)} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* Empty State */}
                        {data?.businesses?.length === 0 && 
                         data?.jobs?.length === 0 && 
                         data?.doctors?.length === 0 && (
                            <EmptyState
                                icon={<LocationIcon sx={{ fontSize: 64 }} />}
                                title="No places found nearby"
                                description="Try increasing the radius or change your location"
                                action={
                                    <Button 
                                        variant="contained" 
                                        onClick={() => changeRadius('5km')}
                                        sx={{ bgcolor: '#C00C0C' }}
                                    >
                                        Increase Radius
                                    </Button>
                                }
                            />
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
}