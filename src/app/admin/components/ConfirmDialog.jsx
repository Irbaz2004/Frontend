import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import {
    Warning as WarningIcon,
    Info as InfoIcon,
    Error as ErrorIcon,
    CheckCircle as SuccessIcon
} from '@mui/icons-material';

const iconMap = {
    warning: <WarningIcon sx={{ fontSize: 48, color: '#ff9800' }} />,
    error: <ErrorIcon sx={{ fontSize: 48, color: '#f44336' }} />,
    info: <InfoIcon sx={{ fontSize: 48, color: '#2196f3' }} />,
    success: <SuccessIcon sx={{ fontSize: 48, color: '#4caf50' }} />
};

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning',
    loading = false,
    confirmColor = 'primary'
}) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {iconMap[type]}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
            </DialogTitle>
            
            <DialogContent>
                <DialogContentText sx={{ textAlign: 'center', color: '#666' }}>
                    {message}
                </DialogContentText>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={onClose}
                    disabled={loading}
                >
                    {cancelText}
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={onConfirm}
                    color={confirmColor}
                    disabled={loading}
                    sx={{ ml: 2 }}
                >
                    {loading ? <CircularProgress size={24} /> : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}