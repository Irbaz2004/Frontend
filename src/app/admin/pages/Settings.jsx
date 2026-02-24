import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    Switch,
    FormControlLabel,
    Button,
    Divider,
    Alert,
    Card,
    CardContent,
    Slider,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Save as SaveIcon,
    Refresh as RefreshIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    LocationOn as LocationIcon,
    Storage as StorageIcon
} from '@mui/icons-material';
import { useAdmin } from '../../../hooks/useAdmin';

export default function Settings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { fetchSettings, updateSettings } = useAdmin();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await fetchSettings();
            setSettings(data);
        } catch (error) {
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await updateSettings(settings);
            setSuccess('Settings updated successfully');
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <RefreshIcon sx={{ animation: 'spin 2s linear infinite' }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    System Settings
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ bgcolor: '#C00C0C' }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </Box>

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

            <Grid container spacing={3}>
                {/* General Settings */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <StorageIcon sx={{ color: '#C00C0C' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    General Settings
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="App Name"
                                        value={settings?.appName || 'NearZO'}
                                        onChange={(e) => handleChange('appName', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        label="App Description"
                                        value={settings?.appDescription || ''}
                                        onChange={(e) => handleChange('appDescription', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Contact Email"
                                        type="email"
                                        value={settings?.contactEmail || ''}
                                        onChange={(e) => handleChange('contactEmail', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Support Phone"
                                        value={settings?.supportPhone || ''}
                                        onChange={(e) => handleChange('supportPhone', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Verification Settings */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <SecurityIcon sx={{ color: '#C00C0C' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Verification Settings
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings?.requireBusinessVerification}
                                                onChange={(e) => handleChange('requireBusinessVerification', e.target.checked)}
                                            />
                                        }
                                        label="Require Business Verification"
                                    />
                                    <Typography variant="caption" display="block" sx={{ color: '#666', ml: 4 }}>
                                        Businesses must be verified by admin before appearing in searches
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings?.requireWorshipVerification}
                                                onChange={(e) => handleChange('requireWorshipVerification', e.target.checked)}
                                            />
                                        }
                                        label="Require Worship Place Verification"
                                    />
                                    <Typography variant="caption" display="block" sx={{ color: '#666', ml: 4 }}>
                                        Worship places must be verified before appearing in searches
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings?.autoApproveDoctors}
                                                onChange={(e) => handleChange('autoApproveDoctors', e.target.checked)}
                                            />
                                        }
                                        label="Auto-Approve Doctors"
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Search & Discovery */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <LocationIcon sx={{ color: '#C00C0C' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Search & Discovery
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography gutterBottom>Default Search Radius (km)</Typography>
                                    <Slider
                                        value={settings?.defaultSearchRadius || 5}
                                        onChange={(e, val) => handleChange('defaultSearchRadius', val)}
                                        step={1}
                                        marks
                                        min={1}
                                        max={20}
                                        valueLabelDisplay="auto"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Sort By Default</InputLabel>
                                        <Select
                                            value={settings?.defaultSort || 'relevance'}
                                            onChange={(e) => handleChange('defaultSort', e.target.value)}
                                            label="Sort By Default"
                                        >
                                            <MenuItem value="relevance">Relevance</MenuItem>
                                            <MenuItem value="distance">Distance</MenuItem>
                                            <MenuItem value="rating">Rating</MenuItem>
                                            <MenuItem value="recent">Most Recent</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings?.showDistance}
                                                onChange={(e) => handleChange('showDistance', e.target.checked)}
                                            />
                                        }
                                        label="Show Distance in Search Results"
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Notification Settings */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <NotificationsIcon sx={{ color: '#C00C0C' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Notification Settings
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings?.emailNotifications}
                                                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                                            />
                                        }
                                        label="Enable Email Notifications"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings?.pushNotifications}
                                                onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                                            />
                                        }
                                        label="Enable Push Notifications"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings?.smsNotifications}
                                                onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                                            />
                                        }
                                        label="Enable SMS Notifications"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" gutterBottom>
                                        Notification Types
                                    </Typography>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings?.notifyAppointments}
                                                onChange={(e) => handleChange('notifyAppointments', e.target.checked)}
                                            />
                                        }
                                        label="Appointment Updates"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings?.notifyJobs}
                                                onChange={(e) => handleChange('notifyJobs', e.target.checked)}
                                            />
                                        }
                                        label="Job Alerts"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings?.notifyVerifications}
                                                onChange={(e) => handleChange('notifyVerifications', e.target.checked)}
                                            />
                                        }
                                        label="Verification Requests"
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Maintenance Mode */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, bgcolor: '#fff3e0' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#ed6c02' }}>
                                        Maintenance Mode
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#ed6c02' }}>
                                        When enabled, only admins can access the app. Users will see maintenance page.
                                    </Typography>
                                </Box>
                                <Switch
                                    checked={settings?.maintenanceMode}
                                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                    color="warning"
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}