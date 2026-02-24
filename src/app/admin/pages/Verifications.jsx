import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    Grid,
    Button,
    Chip,
    Avatar,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Rating,
    Divider
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Store as StoreIcon,
    Church as ChurchIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    AccessTime as TimeIcon,
    Verified as VerifiedIcon,
    Pending as PendingIcon
} from '@mui/icons-material';
import { useAdmin } from '../../../hooks/useAdmin';
import { formatDate } from '../../../utils/formatting';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function Verifications() {
    const [tabValue, setTabValue] = useState(0);
    const [businesses, setBusinesses] = useState([]);
    const [worship, setWorship] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { fetchPendingBusinesses, fetchPendingWorship, approveBusiness, rejectBusiness, approveWorship, rejectWorship } = useAdmin();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [bizData, worshipData] = await Promise.all([
                fetchPendingBusinesses(),
                fetchPendingWorship()
            ]);
            setBusinesses(bizData);
            setWorship(worshipData);
        } catch (error) {
            console.error('Error loading verifications:', error);
            setError('Failed to load verifications');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            if (tabValue === 0) {
                await approveBusiness(selectedItem.id);
            } else {
                await approveWorship(selectedItem.id);
            }
            setSuccess('Item approved successfully');
            setDialogOpen(false);
            loadData();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleReject = async () => {
        try {
            if (tabValue === 0) {
                await rejectBusiness(selectedItem.id, rejectReason);
            } else {
                await rejectWorship(selectedItem.id, rejectReason);
            }
            setSuccess('Item rejected');
            setDialogOpen(false);
            setRejectReason('');
            loadData();
        } catch (error) {
            setError(error.message);
        }
    };

    const openDialog = (item, action) => {
        setSelectedItem(item);
        setDialogOpen(true);
    };

    return (
        <Box>
            {/* Header */}
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
                Pending Verifications
            </Typography>

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
                    <Tab 
                        icon={<StoreIcon />} 
                        label={`Businesses (${businesses.length})`} 
                        iconPosition="start"
                    />
                    <Tab 
                        icon={<ChurchIcon />} 
                        label={`Worship Places (${worship.length})`} 
                        iconPosition="start"
                    />
                </Tabs>

                {/* Businesses Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        {businesses.map((business) => (
                            <Grid item xs={12} key={business.id}>
                                <VerificationCard
                                    item={business}
                                    type="business"
                                    onApprove={() => openDialog(business, 'approve')}
                                    onReject={() => openDialog(business, 'reject')}
                                />
                            </Grid>
                        ))}
                        {businesses.length === 0 && (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 4, textAlign: 'center' }}>
                                    <PendingIcon sx={{ fontSize: 48, color: '#999', mb: 2 }} />
                                    <Typography color="#666">
                                        No pending business verifications
                                    </Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </TabPanel>

                {/* Worship Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3}>
                        {worship.map((place) => (
                            <Grid item xs={12} key={place.id}>
                                <VerificationCard
                                    item={place}
                                    type="worship"
                                    onApprove={() => openDialog(place, 'approve')}
                                    onReject={() => openDialog(place, 'reject')}
                                />
                            </Grid>
                        ))}
                        {worship.length === 0 && (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 4, textAlign: 'center' }}>
                                    <PendingIcon sx={{ fontSize: 48, color: '#999', mb: 2 }} />
                                    <Typography color="#666">
                                        No pending worship place verifications
                                    </Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </TabPanel>
            </Paper>

            {/* Approval/Rejection Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedItem?.businessName || selectedItem?.name}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                        Please confirm your decision for this verification request.
                    </Typography>
                    
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Rejection Reason (required for reject)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Provide reason for rejection..."
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleReject}
                        color="error"
                        disabled={!rejectReason}
                        startIcon={<RejectIcon />}
                    >
                        Reject
                    </Button>
                    <Button
                        onClick={handleApprove}
                        color="success"
                        variant="contained"
                        startIcon={<ApproveIcon />}
                    >
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

// Verification Card Component
function VerificationCard({ item, type, onApprove, onReject }) {
    const isBusiness = type === 'business';

    return (
        <Card sx={{ borderRadius: 3 }}>
            <CardContent>
                <Grid container spacing={3}>
                    {/* Left: Image/Icon */}
                    <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                            variant="rounded"
                            sx={{
                                width: 100,
                                height: 100,
                                bgcolor: isBusiness ? '#4caf5020' : '#9c27b020',
                                color: isBusiness ? '#4caf50' : '#9c27b0'
                            }}
                        >
                            {isBusiness ? <StoreIcon sx={{ fontSize: 48 }} /> : <ChurchIcon sx={{ fontSize: 48 }} />}
                        </Avatar>
                    </Grid>

                    {/* Center: Details */}
                    <Grid item xs={12} md={7}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {isBusiness ? item.businessName : item.name}
                            </Typography>
                            <Chip
                                icon={<PendingIcon />}
                                label="Pending"
                                size="small"
                                color="warning"
                            />
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <PhoneIcon sx={{ fontSize: 16, color: '#666' }} />
                                    <Typography variant="body2">{item.phone}</Typography>
                                </Box>
                                {item.email && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <EmailIcon sx={{ fontSize: 16, color: '#666' }} />
                                        <Typography variant="body2">{item.email}</Typography>
                                    </Box>
                                )}
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <LocationIcon sx={{ fontSize: 16, color: '#666' }} />
                                    <Typography variant="body2">
                                        {item.owner?.area}, {item.owner?.city}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TimeIcon sx={{ fontSize: 16, color: '#666' }} />
                                    <Typography variant="body2">
                                        Requested {formatDate(item.createdAt)}
                                    </Typography>
                                </Box>
                            </Grid>

                            {isBusiness && (
                                <>
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                            Category: {item.category}
                                        </Typography>
                                        {item.specialization && (
                                            <Chip
                                                label={item.specialization}
                                                size="small"
                                                sx={{ mr: 1, mb: 1 }}
                                            />
                                        )}
                                        {item.items?.map((it, idx) => (
                                            <Chip
                                                key={idx}
                                                label={it}
                                                size="small"
                                                variant="outlined"
                                                sx={{ mr: 1, mb: 1 }}
                                            />
                                        ))}
                                    </Grid>
                                    {item.timings && (
                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="#666">
                                                Hours: {item.timings}
                                            </Typography>
                                        </Grid>
                                    )}
                                </>
                            )}

                            {!isBusiness && item.religionType && (
                                <Grid item xs={12}>
                                    <Chip
                                        label={item.religionType}
                                        size="small"
                                        sx={{ bgcolor: '#9c27b015', color: '#9c27b0' }}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Grid>

                    {/* Right: Actions */}
                    <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            startIcon={<ApproveIcon />}
                            onClick={onApprove}
                        >
                            Approve
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            startIcon={<RejectIcon />}
                            onClick={onReject}
                        >
                            Reject
                        </Button>
                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => {/* View details */}}
                        >
                            View Details
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}