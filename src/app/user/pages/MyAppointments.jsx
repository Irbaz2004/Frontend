import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Chip,
    Button,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Rating,
    Divider
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    LocationOn as LocationIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Cancel as CancelIcon,
    Star as StarIcon,
    Event as EventIcon
} from '@mui/icons-material';
import { useAppointments } from '../../../hooks/useAppointments';
import { formatDate, formatTime } from '../../../utils/formatting';

export default function MyAppointments() {
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [cancelDialog, setCancelDialog] = useState(false);
    const [reviewDialog, setReviewDialog] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    
    const {
        appointments,
        upcoming,
        loading,
        error,
        cancel,
        addReview
    } = useAppointments();

    const handleCancel = async () => {
        try {
            await cancel(selectedAppointment.id);
            setCancelDialog(false);
            setSelectedAppointment(null);
        } catch (err) {
            console.error('Error cancelling:', err);
        }
    };

    const handleSubmitReview = async () => {
        try {
            await addReview(selectedAppointment.doctor.id, reviewData);
            setReviewDialog(false);
            setSelectedAppointment(null);
            setReviewData({ rating: 5, comment: '' });
        } catch (err) {
            console.error('Error submitting review:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'pending': return 'warning';
            case 'rejected': return 'error';
            case 'cancelled': return 'default';
            case 'completed': return 'info';
            default: return 'default';
        }
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
                    My Appointments
                </Typography>

                {/* Error Message */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Upcoming Appointments */}
                {upcoming.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Upcoming Appointments
                        </Typography>
                        <Grid container spacing={2}>
                            {upcoming.map((app) => (
                                <Grid item xs={12} key={app.id}>
                                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={8}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <CalendarIcon sx={{ color: '#C00C0C' }} />
                                                    <Typography variant="h6">
                                                        {formatDate(app.date)} at {formatTime(app.time)}
                                                    </Typography>
                                                    <Chip
                                                        label={app.status}
                                                        size="small"
                                                        color={getStatusColor(app.status)}
                                                    />
                                                </Box>

                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                    Dr. {app.doctor?.doctorName}
                                                </Typography>
                                                <Typography variant="body2" color="#666" sx={{ mb: 2 }}>
                                                    {app.doctor?.specialization}
                                                </Typography>

                                                {app.reason && (
                                                    <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
                                                        Reason: {app.reason}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<LocationIcon />}
                                                        onClick={() => window.open(`https://maps.google.com/?q=${app.doctor?.location}`)}
                                                    >
                                                        Directions
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<PhoneIcon />}
                                                        onClick={() => window.location.href = `tel:${app.doctor?.phone}`}
                                                    >
                                                        Call Clinic
                                                    </Button>
                                                    {app.status === 'approved' && (
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            startIcon={<CancelIcon />}
                                                            onClick={() => {
                                                                setSelectedAppointment(app);
                                                                setCancelDialog(true);
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Past Appointments */}
                {appointments.filter(a => new Date(a.date) < new Date()).length > 0 && (
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Past Appointments
                        </Typography>
                        <Grid container spacing={2}>
                            {appointments
                                .filter(a => new Date(a.date) < new Date())
                                .map((app) => (
                                    <Grid item xs={12} key={app.id}>
                                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                        Dr. {app.doctor?.doctorName}
                                                    </Typography>
                                                    <Typography variant="body2" color="#666" sx={{ mb: 1 }}>
                                                        {app.doctor?.specialization}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Chip
                                                            icon={<CalendarIcon />}
                                                            label={formatDate(app.date)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                        <Chip
                                                            icon={<TimeIcon />}
                                                            label={formatTime(app.time)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                        <Chip
                                                            label={app.status}
                                                            size="small"
                                                            color={getStatusColor(app.status)}
                                                        />
                                                    </Box>
                                                </Box>

                                                {app.status === 'completed' && !app.reviewed && (
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<StarIcon />}
                                                        onClick={() => {
                                                            setSelectedAppointment(app);
                                                            setReviewDialog(true);
                                                        }}
                                                        sx={{ bgcolor: '#C00C0C' }}
                                                    >
                                                        Leave Review
                                                    </Button>
                                                )}
                                            </Box>

                                            {app.doctorNotes && (
                                                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                                    <Typography variant="caption" color="#666">
                                                        Doctor's Notes:
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {app.doctorNotes}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Paper>
                                    </Grid>
                                ))}
                        </Grid>
                    </Box>
                )}

                {/* Empty State */}
                {appointments.length === 0 && (
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
                        <EventIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            No Appointments Yet
                        </Typography>
                        <Typography color="#666" sx={{ mb: 3 }}>
                            Book your first appointment with a doctor
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/app/user/doctors')}
                            sx={{ bgcolor: '#C00C0C' }}
                        >
                            Find Doctors
                        </Button>
                    </Paper>
                )}

                {/* Cancel Dialog */}
                <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
                    <DialogTitle>Cancel Appointment</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to cancel your appointment with{' '}
                            <strong>Dr. {selectedAppointment?.doctor?.doctorName}</strong>?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCancelDialog(false)}>No, Keep It</Button>
                        <Button onClick={handleCancel} color="error" variant="contained">
                            Yes, Cancel
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Review Dialog */}
                <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Review Dr. {selectedAppointment?.doctor?.doctorName}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography>Rating:</Typography>
                                <Rating
                                    value={reviewData.rating}
                                    onChange={(e, val) => setReviewData({ ...reviewData, rating: val })}
                                    size="large"
                                />
                            </Box>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Your Review"
                                value={reviewData.comment}
                                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                placeholder="Share your experience..."
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
                        <Button onClick={handleSubmitReview} variant="contained" sx={{ bgcolor: '#C00C0C' }}>
                            Submit Review
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}