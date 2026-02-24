import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Chip,
    Button,
    Grid,
    Divider,
    Avatar,
    Rating,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    IconButton,
    Snackbar
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Work as WorkIcon,
    AttachMoney as MoneyIcon,
    AccessTime as TimeIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarIcon,
    Share as ShareIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../../../hooks/useJobs';
import { useAuth } from '../../../hooks/useAuth';
import { formatSalary, timeAgo } from '../../../utils/formatting';
import ActionButtons from '../components/ActionButtons';

export default function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getJob, apply, toggleSave, getSavedJobs } = useJobs();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [applyDialog, setApplyDialog] = useState(false);
    const [applicationData, setApplicationData] = useState({
        coverLetter: '',
        expectedSalary: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [similarJobs, setSimilarJobs] = useState([]);

    useEffect(() => {
        loadJobDetails();
        checkIfSaved();
    }, [id]);

    const loadJobDetails = async () => {
        setLoading(true);
        try {
            const data = await getJob(id);
            setJob(data);
            setSimilarJobs(data.similarJobs || []);
        } catch (err) {
            setError('Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    const checkIfSaved = async () => {
        try {
            const saved = await getSavedJobs();
            setIsSaved(saved.some(j => j.id === id));
        } catch (err) {
            console.error('Error checking saved status:', err);
        }
    };

    const handleApply = async () => {
        setSubmitting(true);
        try {
            await apply(id, applicationData);
            setSuccess('Application submitted successfully!');
            setApplyDialog(false);
            setApplicationData({ coverLetter: '', expectedSalary: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSave = async () => {
        try {
            const saved = await toggleSave(id);
            setIsSaved(saved);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: job.title,
                text: `Check out this job at ${job.business.name}`,
                url: window.location.href
            });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !job) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">{error || 'Job not found'}</Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f8f8f8', minHeight: '100vh', pb: 8 }}>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                {/* Back Button */}
                <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                    <ArrowBackIcon />
                </IconButton>

                {/* Main Content */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        {/* Job Header */}
                        <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                                        {job.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Avatar src={job.business.logo} sx={{ width: 32, height: 32 }}>
                                            <BusinessIcon />
                                        </Avatar>
                                        <Typography variant="h6" color="#666">
                                            {job.business.name}
                                        </Typography>
                                    </Box>
                                </Box>
                                <ActionButtons
                                    onCall={() => window.location.href = `tel:${job.business.phone}`}
                                    onShare={handleShare}
                                    onSave={handleSave}
                                    isSaved={isSaved}
                                />
                            </Box>

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6} sm={3}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <LocationIcon sx={{ color: '#C00C0C', mb: 1 }} />
                                        <Typography variant="body2" color="#666">
                                            Location
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {job.business.city}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <WorkIcon sx={{ color: '#C00C0C', mb: 1 }} />
                                        <Typography variant="body2" color="#666">
                                            Job Type
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {job.jobType?.replace('_', ' ')}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <MoneyIcon sx={{ color: '#C00C0C', mb: 1 }} />
                                        <Typography variant="body2" color="#666">
                                            Salary
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {formatSalary(job)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                        <TimeIcon sx={{ color: '#C00C0C', mb: 1 }} />
                                        <Typography variant="body2" color="#666">
                                            Posted
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {timeAgo(job.createdAt)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* Job Description */}
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Job Description
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
                                {job.description}
                            </Typography>

                            {/* Requirements */}
                            {job.requirements && (
                                <>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Requirements
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
                                        {job.requirements}
                                    </Typography>
                                </>
                            )}

                            {/* Skills */}
                            {job.skillsRequired?.length > 0 && (
                                <>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Required Skills
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                                        {job.skillsRequired.map((skill) => (
                                            <Chip key={skill} label={skill} variant="outlined" />
                                        ))}
                                    </Box>
                                </>
                            )}

                            {/* Apply Button */}
                            {user?.role === 'user' && (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={() => setApplyDialog(true)}
                                    disabled={job.hasApplied}
                                    sx={{
                                        py: 2,
                                        bgcolor: '#C00C0C',
                                        '&:hover': { bgcolor: '#8A0909' }
                                    }}
                                >
                                    {job.hasApplied ? 'Already Applied' : 'Apply Now'}
                                </Button>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        {/* Company Info */}
                        <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                About {job.business.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Rating value={job.business.rating} readOnly size="small" />
                                <Typography variant="body2" color="#666">
                                    {job.business.reviewsCount} reviews
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="#666" sx={{ mb: 2 }}>
                                <LocationIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                {job.business.address}
                            </Typography>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => navigate(`/app/user/shops/${job.business.id}`)}
                            >
                                View Company Profile
                            </Button>
                        </Paper>

                        {/* Similar Jobs */}
                        {similarJobs.length > 0 && (
                            <Paper sx={{ p: 3, borderRadius: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                    Similar Jobs
                                </Typography>
                                {similarJobs.map((similar) => (
                                    <Box
                                        key={similar.id}
                                        sx={{
                                            p: 2,
                                            mb: 1,
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: '#f5f5f5' }
                                        }}
                                        onClick={() => navigate(`/app/user/jobs/${similar.id}`)}
                                    >
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {similar.title}
                                        </Typography>
                                        <Typography variant="caption" color="#666">
                                            {similar.businessName}
                                        </Typography>
                                    </Box>
                                ))}
                            </Paper>
                        )}
                    </Grid>
                </Grid>

                {/* Apply Dialog */}
                <Dialog open={applyDialog} onClose={() => setApplyDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Apply for {job.title}</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Cover Letter"
                            value={applicationData.coverLetter}
                            onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                            placeholder="Tell us why you're a good fit for this position..."
                            sx={{ mt: 2, mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Expected Salary"
                            type="number"
                            value={applicationData.expectedSalary}
                            onChange={(e) => setApplicationData({ ...applicationData, expectedSalary: e.target.value })}
                            placeholder="Your expected monthly salary"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setApplyDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleApply}
                            variant="contained"
                            disabled={submitting}
                            sx={{ bgcolor: '#C00C0C' }}
                        >
                            {submitting ? <CircularProgress size={24} /> : 'Submit Application'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Success Snackbar */}
                <Snackbar
                    open={!!success}
                    autoHideDuration={3000}
                    onClose={() => setSuccess('')}
                    message={success}
                />
            </Container>
        </Box>
    );
}