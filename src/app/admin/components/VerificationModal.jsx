import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Avatar,
    TextField,
    Divider,
    Grid,
    Chip,
    Alert,
    Rating
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Store as StoreIcon,
    Church as ChurchIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon
} from '@mui/icons-material';

export default function VerificationModal({
    open,
    onClose,
    item,
    type = 'business', // 'business' or 'worship'
    onApprove,
    onReject,
    loading = false
}) {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    const handleApprove = () => {
        onApprove(item);
        onClose();
    };

    const handleReject = () => {
        if (showRejectInput && rejectReason) {
            onReject(item, rejectReason);
            onClose();
            setShowRejectInput(false);
            setRejectReason('');
        } else {
            setShowRejectInput(true);
        }
    };

    if (!item) return null;

    const isBusiness = type === 'business';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: isBusiness ? '#4caf5020' : '#9c27b020' }}>
                        {isBusiness ? <StoreIcon /> : <ChurchIcon />}
                    </Avatar>
                    <Box>
                        <Typography variant="h6">
                            {isBusiness ? item.businessName : item.name}
                        </Typography>
                        <Typography variant="caption" color="#666">
                            {isBusiness ? item.category : item.religionType}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    {/* Basic Info */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                            Contact Information
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon sx={{ fontSize: 18, color: '#666' }} />
                                <Typography variant="body2">
                                    {item.owner?.name || item.contactPerson}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon sx={{ fontSize: 18, color: '#666' }} />
                                <Typography variant="body2">{item.phone}</Typography>
                            </Box>
                            {item.email && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon sx={{ fontSize: 18, color: '#666' }} />
                                    <Typography variant="body2">{item.email}</Typography>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationIcon sx={{ fontSize: 18, color: '#666' }} />
                                <Typography variant="body2">
                                    {item.owner?.area || item.area}, {item.owner?.city || item.city}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Stats */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                            Details
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {isBusiness && (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="#666">Category:</Typography>
                                        <Chip label={item.category} size="small" />
                                    </Box>
                                    {item.specialization && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption" color="#666">Specialization:</Typography>
                                            <Typography variant="body2">{item.specialization}</Typography>
                                        </Box>
                                    )}
                                    {item.items?.length > 0 && (
                                        <Box>
                                            <Typography variant="caption" color="#666" display="block" gutterBottom>
                                                Items:
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {item.items.slice(0, 5).map((it, idx) => (
                                                    <Chip key={idx} label={it} size="small" variant="outlined" />
                                                ))}
                                                {item.items.length > 5 && (
                                                    <Chip label={`+${item.items.length - 5}`} size="small" />
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                </>
                            )}

                            {!isBusiness && item.prayerTimings && (
                                <Box>
                                    <Typography variant="caption" color="#666" display="block" gutterBottom>
                                        Prayer Times:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {Object.entries(item.prayerTimings).map(([prayer, time]) => (
                                            <Chip
                                                key={prayer}
                                                label={`${prayer}: ${time}`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {item.facilities?.length > 0 && (
                                <Box>
                                    <Typography variant="caption" color="#666" display="block" gutterBottom>
                                        Facilities:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {item.facilities.map((fac, idx) => (
                                            <Chip key={idx} label={fac} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    {/* Timings */}
                    {item.timings && (
                        <Grid item xs={12}>
                            <Divider />
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TimeIcon sx={{ color: '#666' }} />
                                <Typography variant="body2">{item.timings}</Typography>
                            </Box>
                        </Grid>
                    )}

                    {/* Reject Reason Input */}
                    {showRejectInput && (
                        <Grid item xs={12}>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                Please provide a reason for rejection
                            </Alert>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Rejection Reason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Explain why this verification is being rejected..."
                                required
                            />
                        </Grid>
                    )}
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleReject}
                    color="error"
                    disabled={loading || (showRejectInput && !rejectReason)}
                    startIcon={<RejectIcon />}
                >
                    {showRejectInput ? 'Confirm Reject' : 'Reject'}
                </Button>
                <Button
                    onClick={handleApprove}
                    variant="contained"
                    color="success"
                    disabled={loading}
                    startIcon={<ApproveIcon />}
                >
                    Approve
                </Button>
            </DialogActions>
        </Dialog>
    );
}