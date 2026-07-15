// pages/Business/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Container, Grid, Paper, Typography,
    Button, IconButton, Avatar, Chip, Divider, TextField,
    useMediaQuery, useTheme, Alert, CircularProgress,
    FormControl, InputLabel, Select, MenuItem,
    InputAdornment, Tab, Tabs
} from '@mui/material';
import {
    Store as Store,
    Person as User,
    Phone as Phone,
    LocationOn as MapPin,
    Email as Mail,
    Edit as Pencil,
    CheckCircle as CheckCircle,
    ArrowBack as ArrowLeft,
    Save as SaveIcon,
    Refresh as Refresh,
    Public as Globe,
    AccessTime as Clock,
    CalendarToday as Calendar
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import { getToken, logoutUser } from '../../services/auth';

export default function BusinessProfile() {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editing, setEditing] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [categories, setCategories] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        shop_name: '',
        owner_name: '',
        category_id: '',
        description: '',
        street: '',
        city: '',
        state: '',
        latitude: '',
        longitude: '',
        opening_hours: '',
        website: '',
        established_year: '',
        employee_count: '',
        keywords: []
    });

    useEffect(() => {
        fetchProfile();
        fetchCategories();
    }, []);

    useEffect(() => {
        if (formData.category_id) {
            fetchKeywords(formData.category_id);
        }
    }, [formData.category_id]);

   const getAuthToken = () => {
        const token = getToken();
        if (!token) {
            setError('Authentication token not found. Please login again.');
            setTimeout(() => navigate('/app/login'), 2000);
            return null;
        }
        return token;
    };


    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                setError('Authentication token not found');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            const response = await fetch(`${API_BASE}/business/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const profileData = data.profile;
            setProfile(profileData);
            
            setFormData({
                full_name: profileData.full_name || '',
                phone: profileData.phone || '',
                email: profileData.email || '',
                shop_name: profileData.shop_name || '',
                owner_name: profileData.owner_name || '',
                category_id: profileData.category_id || '',
                description: profileData.description || '',
                street: profileData.street || '',
                city: profileData.city || '',
                state: profileData.state || '',
                latitude: profileData.latitude || '',
                longitude: profileData.longitude || '',
                opening_hours: profileData.opening_hours || '',
                website: profileData.website || '',
                established_year: profileData.established_year || '',
                employee_count: profileData.employee_count || '',
                keywords: profileData.keywords?.map(k => k.id) || []
            });

            setError('');
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${API_BASE}/business/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch categories');
            
            const data = await response.json();
            setCategories(data.categories || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchKeywords = async (categoryId) => {
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${API_BASE}/business/categories/${categoryId}/keywords`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch keywords');
            
            const data = await response.json();
            setKeywords(data.keywords || []);
        } catch (err) {
            console.error('Error fetching keywords:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleKeywordToggle = (keywordId) => {
        setFormData(prev => {
            const currentKeywords = prev.keywords || [];
            if (currentKeywords.includes(keywordId)) {
                return {
                    ...prev,
                    keywords: currentKeywords.filter(id => id !== keywordId)
                };
            } else {
                return {
                    ...prev,
                    keywords: [...currentKeywords, keywordId]
                };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${API_BASE}/business/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            setSuccess('Profile updated successfully');
            setEditing(false);
            fetchProfile();
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditing(false);
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                email: profile.email || '',
                shop_name: profile.shop_name || '',
                owner_name: profile.owner_name || '',
                category_id: profile.category_id || '',
                description: profile.description || '',
                street: profile.street || '',
                city: profile.city || '',
                state: profile.state || '',
                latitude: profile.latitude || '',
                longitude: profile.longitude || '',
                opening_hours: profile.opening_hours || '',
                website: profile.website || '',
                established_year: profile.established_year || '',
                employee_count: profile.employee_count || '',
                keywords: profile.keywords?.map(k => k.id) || []
            });
        }
        setError('');
    };

    const InfoField = ({ label, value, icon }) => (
        <Box sx={styles.infoField}>
            <Box sx={styles.infoIcon}>
                {icon}
            </Box>
            <Box>
                <Typography variant="caption" sx={styles.infoLabel}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={styles.infoValue}>
                    {value || 'Not provided'}
                </Typography>
            </Box>
        </Box>
    );

    if (loading) {
        return (
            <Box sx={styles.loadingContainer}>
                <CircularProgress size={60} sx={{ color: '#0003b1' }} />
                <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>Loading profile...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={styles.container}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={styles.header}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton 
                            onClick={() => navigate('/business/dashboard')}
                            sx={styles.backButton}
                        >
                            <ArrowLeft />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" sx={styles.title}>
                                Business Profile
                            </Typography>
                            <Typography variant="body2" sx={styles.subtitle}>
                                Manage your business information and settings
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={styles.headerActions}>
                        {!editing ? (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<Refresh />}
                                    onClick={fetchProfile}
                                    sx={styles.refreshButton}
                                >
                                    Refresh
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<Pencil />}
                                    onClick={() => setEditing(true)}
                                    sx={styles.editButton}
                                >
                                    Edit Profile
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={handleCancel}
                                    sx={styles.cancelButton}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    sx={styles.saveButton}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </>
                        )}
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
                {success && (
                    <Alert 
                        severity="success" 
                        sx={styles.alert}
                        onClose={() => setSuccess('')}
                    >
                        {success}
                    </Alert>
                )}

                {/* Profile Overview Card */}
                <Paper sx={styles.overviewCard}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
                            <Avatar sx={styles.profileAvatar}>
                                {profile?.shop_name?.charAt(0) || 'B'}
                            </Avatar>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" sx={styles.shopName}>
                                {profile?.shop_name || 'Business Name'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    size="small"
                                    icon={<CheckCircle />}
                                    label={profile?.is_verified ? 'Verified' : 'Pending Verification'}
                                    sx={{
                                        bgcolor: profile?.is_verified ? '#e8f5e8' : '#fff3e0',
                                        color: profile?.is_verified ? '#2e7d32' : '#e65100'
                                    }}
                                />
                                <Chip
                                    size="small"
                                    label={profile?.category?.name || 'Category'}
                                    sx={{
                                        bgcolor: '#0003b115',
                                        color: '#0003b1'
                                    }}
                                />
                                <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <User sx={{ fontSize: 16 }} />
                                    Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={styles.statsRow}>
                                <Box sx={styles.statItem}>
                                    <Typography variant="h6" sx={styles.statNumber}>
                                        {profile?.jobs_count || 0}
                                    </Typography>
                                    <Typography variant="caption" sx={styles.statLabel}>
                                        Total Jobs
                                    </Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                                <Box sx={styles.statItem}>
                                    <Typography variant="h6" sx={styles.statNumber}>
                                        {profile?.keywords?.length || 0}
                                    </Typography>
                                    <Typography variant="caption" sx={styles.statLabel}>
                                        Keywords
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Tabs */}
                <Box sx={styles.tabsContainer}>
                    <Tabs 
                        value={activeTab} 
                        onChange={(e, v) => setActiveTab(v)}
                        sx={styles.tabs}
                        TabIndicatorProps={{ style: { backgroundColor: '#0003b1' } }}
                    >
                        <Tab label="Business Information" />
                        <Tab label="Contact & Location" />
                        <Tab label="Additional Details" />
                        <Tab label="Keywords" />
                    </Tabs>
                </Box>

                {/* Tab Panels */}
                <Paper sx={styles.formPaper}>
                    {activeTab === 0 && (
                        <Box sx={styles.tabPanel}>
                            <Typography variant="h6" sx={styles.sectionTitle}>
                                Business Information
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            label="Shop Name"
                                            name="shop_name"
                                            value={formData.shop_name}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            required
                                            sx={styles.textField}
                                        />
                                    ) : (
                                        <InfoField 
                                            label="Shop Name"
                                            value={profile?.shop_name}
                                            icon={<Store />}
                                        />
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            label="Owner Name"
                                            name="owner_name"
                                            value={formData.owner_name}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            required
                                            sx={styles.textField}
                                        />
                                    ) : (
                                        <InfoField 
                                            label="Owner Name"
                                            value={profile?.owner_name}
                                            icon={<User />}
                                        />
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {editing ? (
                                        <FormControl fullWidth size="small" sx={styles.textField}>
                                            <InputLabel>Category</InputLabel>
                                            <Select
                                                name="category_id"
                                                value={formData.category_id}
                                                onChange={handleInputChange}
                                                label="Category"
                                                required
                                            >
                                                {categories.map(cat => (
                                                    <MenuItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        <InfoField 
                                            label="Category"
                                            value={profile?.category?.name}
                                            icon={<Store />}
                                        />
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            label="Full Name (Contact Person)"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            required
                                            sx={styles.textField}
                                        />
                                    ) : (
                                        <InfoField 
                                            label="Contact Person"
                                            value={profile?.full_name}
                                            icon={<User />}
                                        />
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            label="Business Description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            multiline
                                            rows={4}
                                            sx={styles.textField}
                                            placeholder="Describe your business, services, specialties..."
                                        />
                                    ) : (
                                        <Box sx={styles.descriptionBox}>
                                            <Typography variant="caption" sx={styles.infoLabel}>
                                                Description
                                            </Typography>
                                            <Typography variant="body2" sx={styles.description}>
                                                {profile?.description || 'No description provided'}
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {activeTab === 1 && (
                        <Box sx={styles.tabPanel}>
                            <Typography variant="h6" sx={styles.sectionTitle}>
                                Contact Information
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Phone sx={{ color: '#666' }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                            sx={styles.textField}
                                        />
                                    ) : (
                                        <InfoField 
                                            label="Phone"
                                            value={profile?.phone}
                                            icon={<Phone />}
                                        />
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Mail sx={{ color: '#666' }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                            sx={styles.textField}
                                        />
                                    ) : (
                                        <InfoField 
                                            label="Email"
                                            value={profile?.email}
                                            icon={<Mail />}
                                        />
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            label="Website"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Globe sx={{ color: '#666' }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                            sx={styles.textField}
                                            placeholder="https://example.com"
                                        />
                                    ) : (
                                        <InfoField 
                                            label="Website"
                                            value={profile?.website}
                                            icon={<Globe />}
                                        />
                                    )}
                                </Grid>
                            </Grid>

                            <Typography variant="h6" sx={{ ...styles.sectionTitle, mt: 4 }}>
                                Location Details
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            label="Street Address"
                                            name="street"
                                            value={formData.street}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            sx={styles.textField}
                                        />
                                    ) : (
                                        <InfoField 
                                            label="Street"
                                            value={profile?.street}
                                            icon={<MapPin />}
                                        />
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            label="City"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            required
                                            sx={styles.textField}
                                        />
                                    ) : (
                                        <InfoField 
                                            label="City"
                                            value={profile?.city}
                                            icon={<MapPin />}
                                        />
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            label="State"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            required
                                            sx={styles.textField}
                                        />
                                    ) : (
                                        <InfoField 
                                            label="State"
                                            value={profile?.state}
                                            icon={<MapPin />}
                                        />
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {activeTab === 2 && (
                        <Box sx={styles.tabPanel}>
                            <Typography variant="h6" sx={styles.sectionTitle}>
                                Additional Business Details
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            label="Opening Hours"
                                            name="opening_hours"
                                            value={formData.opening_hours}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            placeholder="e.g., Mon-Fri: 9AM-6PM"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Clock sx={{ color: '#666' }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                            sx={styles.textField}
                                        />
                                    ) : (
                                        <InfoField 
                                            label="Opening Hours"
                                            value={profile?.opening_hours}
                                            icon={<Clock />}
                                        />
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            label="Established Year"
                                            name="established_year"
                                            value={formData.established_year}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            type="number"
                                            placeholder="e.g., 2010"
                                            sx={styles.textField}
                                        />
                                    ) : (
                                        <InfoField 
                                            label="Established"
                                            value={profile?.established_year}
                                            icon={<Calendar />}
                                        />
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            label="Number of Employees"
                                            name="employee_count"
                                            value={formData.employee_count}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            size="small"
                                            type="number"
                                            sx={styles.textField}
                                        />
                                    ) : (
                                        <InfoField 
                                            label="Employees"
                                            value={profile?.employee_count ? `${profile.employee_count}+` : 'Not specified'}
                                            icon={<User />}
                                        />
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {activeTab === 3 && (
                        <Box sx={styles.tabPanel}>
                            <Typography variant="h6" sx={styles.sectionTitle}>
                                Business Keywords
                            </Typography>
                            <Typography variant="body2" sx={styles.keywordHelper}>
                                Select keywords that best describe your business. This helps customers find you in searches.
                            </Typography>
                            
                            {editing ? (
                                <Box sx={styles.keywordsContainer}>
                                    {keywords.length > 0 ? (
                                        <Grid container spacing={1}>
                                            {keywords.map(keyword => (
                                                <Grid item key={keyword.id}>
                                                    <Chip
                                                        label={keyword.keyword}
                                                        onClick={() => handleKeywordToggle(keyword.id)}
                                                        sx={{
                                                            ...styles.keywordChip,
                                                            bgcolor: formData.keywords?.includes(keyword.id) ? '#0003b1' : '#f0f0f0',
                                                            color: formData.keywords?.includes(keyword.id) ? '#fff' : '#666',
                                                            '&:hover': {
                                                                bgcolor: formData.keywords?.includes(keyword.id) ? '#000290' : '#e0e0e0'
                                                            }
                                                        }}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Alert severity="info" sx={{ borderRadius: '8px' }}>
                                            Select a category first to see available keywords
                                        </Alert>
                                    )}
                                </Box>
                            ) : (
                                <Box sx={styles.keywordsDisplay}>
                                    {profile?.keywords && profile.keywords.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {profile.keywords.map((keyword, index) => (
                                                <Chip
                                                    key={index}
                                                    label={keyword.keyword}
                                                    size="small"
                                                    sx={styles.displayKeywordChip}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                                            No keywords selected
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Box>
                    )}

                    {editing && (
                        <Box sx={styles.formActions}>
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                sx={styles.cancelButton}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={saving}
                                sx={styles.saveButton}
                            >
                                {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

// Styles object - copy from your existing styles
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
        alignItems: 'center',
        mb: 4
    },
    backButton: {
        bgcolor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        '&:hover': {
            bgcolor: '#f5f5f5'
        }
    },
    title: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 800,
        color: '#1a1a1a',
        fontSize: { xs: '1.5rem', sm: '2rem' }
    },
    subtitle: {
        color: '#666',
        fontSize: '0.95rem',
        mt: 0.5
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
    editButton: {
        borderRadius: '12px',
        bgcolor: '#0003b1',
        '&:hover': {
            bgcolor: '#000290'
        }
    },
    cancelButton: {
        borderRadius: '12px',
        borderColor: '#ddd',
        color: '#666',
        '&:hover': {
            borderColor: '#f44336',
            bgcolor: 'rgba(244, 67, 54, 0.04)'
        }
    },
    saveButton: {
        borderRadius: '12px',
        bgcolor: '#4CAF50',
        '&:hover': {
            bgcolor: '#43a047'
        }
    },
    alert: {
        mb: 3,
        borderRadius: '12px'
    },
    overviewCard: {
        p: 4,
        mb: 3,
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
    },
    profileAvatar: {
        width: 100,
        height: 100,
        bgcolor: '#0003b1',
        fontSize: '3rem',
        mx: 'auto'
    },
    shopName: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 700,
        color: '#1a1a1a'
    },
    statsRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    statItem: {
        textAlign: 'center'
    },
    statNumber: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 700,
        color: '#1a1a1a'
    },
    statLabel: {
        color: '#666'
    },
    tabsContainer: {
        mb: 2
    },
    tabs: {
        '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            color: '#666',
            '&.Mui-selected': {
                color: '#0003b1'
            }
        }
    },
    formPaper: {
        p: 4,
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
    },
    tabPanel: {
        minHeight: 400
    },
    sectionTitle: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 700,
        color: '#1a1a1a',
        mb: 3
    },
    textField: {
        '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&:hover fieldset': {
                borderColor: '#0003b1'
            },
            '&.Mui-focused fieldset': {
                borderColor: '#0003b1'
            }
        }
    },
    infoField: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        bgcolor: '#f5f5f5',
        borderRadius: '8px'
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: '8px',
        bgcolor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0003b1'
    },
    infoLabel: {
        color: '#666',
        display: 'block'
    },
    infoValue: {
        color: '#1a1a1a',
        fontWeight: 500
    },
    descriptionBox: {
        p: 2,
        bgcolor: '#f5f5f5',
        borderRadius: '8px'
    },
    description: {
        mt: 1,
        lineHeight: 1.6,
        color: '#1a1a1a'
    },
    keywordHelper: {
        color: '#666',
        mb: 3
    },
    keywordsContainer: {
        minHeight: 200
    },
    keywordChip: {
        borderRadius: '8px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    keywordsDisplay: {
        p: 2,
        bgcolor: '#f5f5f5',
        borderRadius: '8px',
        minHeight: 100
    },
    displayKeywordChip: {
        bgcolor: '#fff',
        color: '#0003b1',
        border: '1px solid #0003b115'
    },
    formActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 2,
        mt: 4,
        pt: 3,
        borderTop: '1px solid #eee'
    }
};