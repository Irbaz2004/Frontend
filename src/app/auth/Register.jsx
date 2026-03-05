// Register.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Container, Paper, Typography, TextField, Button,
    InputAdornment, IconButton, Alert, CircularProgress, Link,
    Stepper, Step, StepLabel, Chip, Grid, MenuItem,
    FormControl, InputLabel, Select, FormHelperText,
    Autocomplete, useMediaQuery, useTheme
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { registerUser, fetchCategories, fetchKeywordsByCategory } from '../../services/auth';

const steps = ['Choose Role', 'Your Details'];

function Register() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isVerySmall = useMediaQuery('(max-width:350px)');
    
    const [activeStep, setActiveStep] = useState(0);
    const [role, setRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsSuccess, setGpsSuccess] = useState(false);
    
    // Data from Supabase
    const [categories, setCategories] = useState([]);
    const [availableKeywords, setAvailableKeywords] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [customKeyword, setCustomKeyword] = useState('');
    const [loadingKeywords, setLoadingKeywords] = useState(false);

    const [form, setForm] = useState({
        // Common fields for both roles
        phone: '',
        street: '',
        city: '',
        state: '',
        password: '',
        confirmPassword: '',
        
        // User specific
        fullName: '',
        
        // Business specific
        shopName: '',
        ownerName: '',
        category: '',
        latitude: null,
        longitude: null,
    });

    // Fetch categories on mount
    useEffect(() => {
        loadCategories();
    }, []);

    // Fetch keywords when category changes
    useEffect(() => {
        if (form.category) {
            loadKeywords(form.category);
        } else {
            setAvailableKeywords([]);
            setSelectedKeywords([]);
        }
    }, [form.category]);

    const loadCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    const loadKeywords = async (categoryId) => {
        setLoadingKeywords(true);
        try {
            const data = await fetchKeywordsByCategory(categoryId);
            setAvailableKeywords(data);
        } catch (err) {
            console.error('Error loading keywords:', err);
        } finally {
            setLoadingKeywords(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleGPSToggle = async () => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setGpsLoading(true);
        setError('');
        setGpsSuccess(false);

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });
            
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            setForm(prev => ({
                ...prev,
                latitude: lat,
                longitude: lng
            }));
            
            setGpsSuccess(true);
            
        } catch (error) {
            console.error('GPS Error:', error);
            
            let errorMessage = 'Could not get location. ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Please allow location access in your browser settings.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out. Please try again.';
                    break;
                default:
                    errorMessage += 'Please enable GPS or enter coordinates manually.';
            }
            
            setError(errorMessage);
            setForm(prev => ({ 
                ...prev, 
                latitude: null, 
                longitude: null 
            }));
        } finally {
            setGpsLoading(false);
        }
    };

    const handleAddCustomKeyword = () => {
        if (customKeyword.trim()) {
            // Check if keyword already exists in selected keywords
            const exists = selectedKeywords.some(k => 
                k.keyword.toLowerCase() === customKeyword.trim().toLowerCase()
            );
            
            if (!exists) {
                // Create a temporary custom keyword object
                const newKeyword = {
                    id: `custom_${Date.now()}`,
                    keyword: customKeyword.trim(),
                    is_custom: true
                };
                
                setSelectedKeywords(prev => [...prev, newKeyword]);
                setCustomKeyword('');
            } else {
                setError('This keyword is already added');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const handleRemoveKeyword = (keywordToRemove) => {
        setSelectedKeywords(prev => prev.filter(k => 
            k.id !== keywordToRemove.id && k.keyword !== keywordToRemove.keyword
        ));
    };

    const handleRoleNext = () => {
        if (!role) {
            setError('Please select a role.');
            return;
        }
        setError('');
        setActiveStep(1);
    };

    const validateForm = () => {
        // Phone validation (Indian format)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(form.phone)) {
            return 'Please enter a valid 10-digit Indian mobile number';
        }

        // Common validations
        if (!form.phone) return 'Phone number is required';
        if (!form.city) return 'City is required';
        if (!form.state) return 'State is required';
        if (!form.password) return 'Password is required';
        if (form.password.length < 6) return 'Password must be at least 6 characters';
        if (form.password !== form.confirmPassword) return 'Passwords do not match';

        // Role-specific validations
        if (role === 'user') {
            if (!form.fullName) return 'Full name is required';
        }

        if (role === 'business') {
            if (!form.shopName) return 'Shop name is required';
            if (!form.ownerName) return 'Owner name is required';
            if (!form.category) return 'Category is required';
            
            // Check if location is provided
            if (!form.latitude || !form.longitude) {
                return 'Location is required. Please click "Get Current Location" button or enter coordinates manually.';
            }
            
            // Validate coordinates
            if (form.latitude < -90 || form.latitude > 90) {
                return 'Latitude must be between -90 and 90';
            }
            if (form.longitude < -180 || form.longitude > 180) {
                return 'Longitude must be between -180 and 180';
            }
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            // Prepare keywords data - separate existing and custom keywords
            const existingKeywordIds = selectedKeywords
                .filter(k => !k.is_custom)
                .map(k => k.id);
            
            const customKeywords = selectedKeywords
                .filter(k => k.is_custom)
                .map(k => k.keyword);

            const registrationData = {
                ...form,
                role,
                keywords: existingKeywordIds,
                customKeywords: customKeywords,
            };

            // Remove confirmPassword from data sent to backend
            delete registrationData.confirmPassword;

            const result = await registerUser(role, registrationData);
            
            // Redirect based on role
            const roleRoutes = {
                user: '/app/user/home',
                business: '/app/business/dashboard',
            };
            
            navigate(roleRoutes[result.user.role] || '/app/user/home');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Style for form controls with minWidth
    const formControlStyle = {
        minWidth: '250px',
        width: '100%'
    };

    return (
        <Box sx={styles.container}>
            <Container maxWidth="sm" sx={{ position: 'relative', px: isVerySmall ? 1 : 2 }}>
                {/* Decorative background element */}
                <Box sx={styles.decorative} />

                {/* Logo & Header */}
                <Box sx={styles.logoContainer}>
                    <Typography 
                        variant={isVerySmall ? "h5" : "h4"} 
                        sx={styles.logo}
                    >
                        Near<span style={{ color: '#0003b1' }}>ZO</span>
                    </Typography>
                    <Typography variant="body2" sx={styles.logoSubtitle}>
                        Create your hyperlocal account
                    </Typography>
                </Box>

                {/* Stepper */}
                <Stepper 
                    activeStep={activeStep} 
                    sx={styles.stepper}
                    orientation={isMobile ? 'vertical' : 'horizontal'}
                >
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel sx={styles.stepLabel}>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Paper elevation={0} sx={styles.paper}>
                    {error && (
                        <Alert severity="error" sx={styles.alert}>
                            {error}
                        </Alert>
                    )}

                    {gpsSuccess && (
                        <Alert severity="success" sx={{ ...styles.alert, bgcolor: '#e8f5e8' }}>
                            ✓ Location captured successfully!
                        </Alert>
                    )}

                    {/* Step 1: Role Selection */}
                    {activeStep === 0 && (
                        <Box>
                            <Typography variant="h5" sx={styles.title}>
                                Who are you?
                            </Typography>
                            <Typography variant="body2" sx={styles.subtitle}>
                                Select your role to personalize your experience
                            </Typography>

                            <Box sx={styles.roleContainer}>
                                {[
                                    { 
                                        value: 'user', 
                                        label: 'User', 
                                        icon: <PersonIcon sx={{ fontSize: isVerySmall ? 24 : 32 }} />, 
                                        desc: 'Find local shops & services' 
                                    },
                                    { 
                                        value: 'business', 
                                        label: 'Business Owner', 
                                        icon: <StoreIcon sx={{ fontSize: isVerySmall ? 24 : 32 }} />, 
                                        desc: 'List your business & reach customers' 
                                    },
                                ].map((opt) => (
                                    <Box
                                        key={opt.value}
                                        onClick={() => { setRole(opt.value); setError(''); }}
                                        sx={{
                                            ...styles.roleCard,
                                            borderColor: role === opt.value ? '#0003b1' : '#F5F5F5',
                                            bgcolor: role === opt.value ? 'rgba(0, 3, 177, 0.02)' : 'white',
                                            p: isVerySmall ? 2 : 3,
                                        }}
                                    >
                                        <Box sx={{ 
                                            color: role === opt.value ? '#0003b1' : '#bbb',
                                            mb: 1.5 
                                        }}>
                                            {opt.icon}
                                        </Box>
                                        <Typography sx={styles.roleLabel}>
                                            {opt.label}
                                        </Typography>
                                        <Typography variant="caption" sx={styles.roleDesc}>
                                            {opt.desc}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleRoleNext}
                            >
                                Continue →
                            </Button>
                        </Box>
                    )}

                    {/* Step 2: Details Form */}
                    {activeStep === 1 && (
                        <Box component="form" onSubmit={handleSubmit}>
                            <Typography variant="h5" sx={styles.title}>
                                {role === 'business' ? 'Business Details' : 'Your Details'}
                            </Typography>
                            <Typography variant="body2" sx={styles.subtitle}>
                                Complete your profile to get started
                            </Typography>

                            <Grid container spacing={isVerySmall ? 1.5 : 2.5} justifyContent="center">
                                {/* Common Fields for Both Roles */}
                                {role === 'user' && (
                                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center',minWidth: {xs:'200px',md:'470px'} }}>
                                        <Box sx={formControlStyle}>
                                            <TextField
                                                fullWidth
                                                name="fullName"
                                                label="Full Name"
                                                value={form.fullName}
                                                onChange={handleChange}
                                                required
                                                size={isVerySmall ? 'small' : 'medium'}
                                                sx={styles.input}
                                            />
                                        </Box>
                                    </Grid>
                                )}

                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center',minWidth: {xs:'200px',md:'470px'} }}>
                                    <Box sx={formControlStyle}>
                                        <TextField
                                            fullWidth
                                            name="phone"
                                            label="Phone Number"
                                            value={form.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="9876543210"
                                            size={isVerySmall ? 'small' : 'medium'}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PhoneIcon sx={{ color: '#0003b1', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                            sx={styles.input}
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' ,minWidth: {xs:'200px',md:'470px'} }}>
                                    <Box sx={formControlStyle}>
                                        <TextField
                                            fullWidth
                                            name="street"
                                            label="Street / House No."
                                            value={form.street}
                                            onChange={handleChange}
                                            placeholder="123 Main Street"
                                            size={isVerySmall ? 'small' : 'medium'}
                                            sx={styles.input}
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center',minWidth: {xs:'200px',md:'470px'}  }}>
                                    <Box sx={formControlStyle}>
                                        <TextField
                                            fullWidth
                                            name="city"
                                            label="City"
                                            value={form.city}
                                            onChange={handleChange}
                                            required
                                            size={isVerySmall ? 'small' : 'medium'}
                                            sx={styles.input}
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center',minWidth: {xs:'200px',md:'470px'}  }}>
                                    <Box sx={formControlStyle}>
                                        <TextField
                                            fullWidth
                                            name="state"
                                            label="State"
                                            value={form.state}
                                            onChange={handleChange}
                                            required
                                            size={isVerySmall ? 'small' : 'medium'}
                                            sx={styles.input}
                                        />
                                    </Box>
                                </Grid>

                                {/* Business Specific Fields */}
                                {role === 'business' && (
                                    <>
                                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center',minWidth: {xs:'200px',md:'470px'}  }}>
                                            <Box sx={formControlStyle}>
                                                <TextField
                                                    fullWidth
                                                    name="shopName"
                                                    label="Shop/Business Name"
                                                    value={form.shopName}
                                                    onChange={handleChange}
                                                    required
                                                    size={isVerySmall ? 'small' : 'medium'}
                                                    sx={styles.input}
                                                />
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center',minWidth: {xs:'200px',md:'470px'}  }}>
                                            <Box sx={formControlStyle}>
                                                <TextField
                                                    fullWidth
                                                    name="ownerName"
                                                    label="Owner Name"
                                                    value={form.ownerName}
                                                    onChange={handleChange}
                                                    required
                                                    size={isVerySmall ? 'small' : 'medium'}
                                                    sx={styles.input}
                                                />
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center',minWidth: {xs:'200px',md:'470px'}  }}>
                                            <Box sx={formControlStyle}>
                                                <FormControl fullWidth required size={isVerySmall ? 'small' : 'medium'} sx={styles.input}>
                                                    <InputLabel>Category</InputLabel>
                                                    <Select
                                                        name="category"
                                                        value={form.category}
                                                        onChange={handleChange}
                                                        label="Category"
                                                    >
                                                        {categories.map((cat) => (
                                                            <MenuItem key={cat.id} value={cat.id}>
                                                                {cat.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {form.category && (
                                                        <FormHelperText>
                                                            {loadingKeywords ? 'Loading keywords...' : 'Select keywords below'}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Box>
                                        </Grid>

                                        {/* Keywords Section - Only show when category is selected */}
                                        {form.category && (
                                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <Box sx={formControlStyle}>
                                                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#666', fontWeight: 600, textAlign: 'center' }}>
                                                        Select Keywords for your Business
                                                    </Typography>
                                                    
                                                    {/* Existing Keywords Selection */}
                                                    {loadingKeywords ? (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                                            <CircularProgress size={30} sx={{ color: '#0003b1' }} />
                                                        </Box>
                                                    ) : (
                                                        <>
                                                            {availableKeywords.length > 0 && (
                                                                <Autocomplete
                                                                    multiple
                                                                    options={availableKeywords}
                                                                    getOptionLabel={(option) => option.keyword}
                                                                    value={selectedKeywords.filter(k => !k.is_custom)}
                                                                    onChange={(e, newValue) => {
                                                                        const customKeywords = selectedKeywords.filter(k => k.is_custom);
                                                                        setSelectedKeywords([...customKeywords, ...newValue]);
                                                                    }}
                                                                    size={isVerySmall ? 'small' : 'medium'}
                                                                    renderInput={(params) => (
                                                                        <TextField
                                                                            {...params}
                                                                            label="Select from existing keywords"
                                                                            placeholder="Choose keywords"
                                                                            size={isVerySmall ? 'small' : 'medium'}
                                                                            sx={{ ...styles.input, mb: 2 }}
                                                                        />
                                                                    )}
                                                                    renderTags={(value, getTagProps) =>
                                                                        value.map((option, index) => (
                                                                            <Chip
                                                                                label={option.keyword}
                                                                                {...getTagProps({ index })}
                                                                                onDelete={() => handleRemoveKeyword(option)}
                                                                                sx={styles.keywordChip}
                                                                                size={isVerySmall ? 'small' : 'medium'}
                                                                            />
                                                                        ))
                                                                    }
                                                                />
                                                            )}

                                                            {/* Custom Keyword Input */}
                                                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                                <TextField
                                                                    fullWidth
                                                                    size={isVerySmall ? 'small' : 'medium'}
                                                                    label="Add custom keyword"
                                                                    value={customKeyword}
                                                                    onChange={(e) => setCustomKeyword(e.target.value)}
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            handleAddCustomKeyword();
                                                                        }
                                                                    }}
                                                                    sx={styles.input}
                                                                />
                                                                <Button
                                                                    variant="outlined"
                                                                    onClick={handleAddCustomKeyword}
                                                                    disabled={!customKeyword.trim()}
                                                                    sx={{
                                                                        minWidth: 56,
                                                                        borderRadius: '16px',
                                                                        borderColor: 'rgba(0, 11, 49, 0.2)',
                                                                        color: '#0003b1',
                                                                        '&:hover': {
                                                                            borderColor: '#0003b1',
                                                                            bgcolor: 'rgba(0, 3, 177, 0.04)'
                                                                        },
                                                                        '&.Mui-disabled': {
                                                                            borderColor: '#eee',
                                                                            color: '#ccc'
                                                                        }
                                                                    }}
                                                                >
                                                                    <AddIcon />
                                                                </Button>
                                                            </Box>

                                                            {/* Display All Selected Keywords */}
                                                            {selectedKeywords.length > 0 && (
                                                                <Box sx={{ mt: 2 }}>
                                                                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1, textAlign: 'center' }}>
                                                                        Selected Keywords ({selectedKeywords.length}):
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                                                        {selectedKeywords.map((keyword, index) => (
                                                                            <Chip
                                                                                key={index}
                                                                                label={keyword.keyword}
                                                                                onDelete={() => handleRemoveKeyword(keyword)}
                                                                                sx={keyword.is_custom ? styles.customKeywordChip : styles.keywordChip}
                                                                                size={isVerySmall ? 'small' : 'medium'}
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </>
                                                    )}
                                                </Box>
                                            </Grid>
                                        )}

                                        {/* GPS Location */}
                                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <Box sx={formControlStyle}>
                                                <Box sx={styles.gpsBox}>
                                                    <Box sx={styles.gpsInfo}>
                                                        <LocationOnIcon sx={{ color: '#0003b1', fontSize: isVerySmall ? '1.2rem' : '1.5rem' }} />
                                                        <Box>
                                                            <Typography sx={styles.gpsTitle}>
                                                                Business Location <span style={{ color: '#0003b1' }}>*</span>
                                                            </Typography>
                                                            <Typography variant="caption" sx={styles.gpsSubtitle}>
                                                                {form.latitude && form.longitude ? (
                                                                    <>
                                                                        📍 Located: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                                                                    </>
                                                                ) : (
                                                                    'Click button to get your current location automatically'
                                                                )}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Button
                                                        variant={form.latitude ? "contained" : "outlined"}
                                                        onClick={handleGPSToggle}
                                                        disabled={gpsLoading}
                                                        size={isVerySmall ? 'small' : 'medium'}
                                                        sx={styles.gpsButton(!!form.latitude)}
                                                    >
                                                        {gpsLoading ? (
                                                            <CircularProgress size={isVerySmall ? 16 : 20} sx={{ color: form.latitude ? 'white' : '#0003b1' }} />
                                                        ) : form.latitude ? (
                                                            'Location Captured ✓'
                                                        ) : (
                                                            'Get Current Location'
                                                        )}
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        {/* Manual Location Input (fallback) */}
                                        {!form.latitude && (
                                            <>
                                                <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center',minWidth: {xs:'200px',md:'470px'} }}>
                                                    <Box sx={formControlStyle}>
                                                        <TextField
                                                            fullWidth
                                                            name="latitude"
                                                            label="Latitude (Manual)"
                                                            type="number"
                                                            value={form.latitude || ''}
                                                            onChange={handleChange}
                                                            size={isVerySmall ? 'small' : 'medium'}
                                                            inputProps={{ step: 'any' }}
                                                            sx={styles.input}
                                                        />
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center',minWidth: {xs:'200px',md:'470px'} }}>
                                                    <Box sx={formControlStyle}>
                                                        <TextField
                                                            fullWidth
                                                            name="longitude"
                                                            label="Longitude (Manual)"
                                                            type="number"
                                                            value={form.longitude || ''}
                                                            onChange={handleChange}
                                                            size={isVerySmall ? 'small' : 'medium'}
                                                            inputProps={{ step: 'any' }}
                                                            sx={styles.input}
                                                        />
                                                    </Box>
                                                </Grid>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Password Fields */}
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center',minWidth: {xs:'200px',md:'470px'} ,maxWidth: {xs:'200px'} }}>
                                    <Box sx={formControlStyle}>
                                        <TextField
                                            fullWidth
                                            name="password"
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                            size={isVerySmall ? 'small' : 'medium'}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon sx={{ color: '#0003b1', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            size={isVerySmall ? 'small' : 'medium'}
                                                            sx={{ color: '#999' }}
                                                        >
                                                            {showPassword ? <VisibilityOff fontSize={isVerySmall ? 'small' : 'medium'} /> : <Visibility fontSize={isVerySmall ? 'small' : 'medium'} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={styles.input}
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center',minWidth: {xs:'200px',md:'470px'} }}>
                                    <Box sx={formControlStyle}>
                                        <TextField
                                            fullWidth
                                            name="confirmPassword"
                                            label="Confirm Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            size={isVerySmall ? 'small' : 'medium'}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon sx={{ color: '#0003b1', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                            sx={styles.input}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box sx={styles.buttonContainer}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setActiveStep(0)}
                                    size={isVerySmall ? 'small' : 'medium'}
                                    sx={styles.secondaryButton}
                                >
                                    ← Back
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    size={isVerySmall ? 'small' : 'medium'}
                                >
                                    {loading ? <CircularProgress size={isVerySmall ? 16 : 24} /> : 'Create Account'}
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* Login Link */}
                    <Box sx={styles.loginLink}>
                        <Typography variant="body2" sx={{ color: '#777', fontSize: isVerySmall ? '0.75rem' : '0.875rem' }}>
                            Already have an account?{' '}
                            <Link
                                onClick={() => navigate('/app/login')}
                                sx={styles.link}
                            >
                                Sign In
                            </Link>
                        </Typography>
                    </Box>
                </Paper>

                {/* Back to Home */}
                <Box sx={styles.backLink}>
                    <Link
                        onClick={() => navigate('/')}
                        sx={styles.link}
                    >
                        ← Back to Home
                    </Link>
                </Box>
            </Container>
        </Box>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        bgcolor: '#F8F8F8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, sm: 2 },
        py: { xs: 3, sm: 6 },
    },
    decorative: {
        position: 'absolute',
        top: { xs: -100, sm: -150 },
        left: { xs: -100, sm: -150 },
        width: { xs: 300, sm: 400 },
        height: { xs: 300, sm: 400 },
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 11, 49, 0.02) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
    },
    logoContainer: {
        textAlign: 'center',
        mb: { xs: 2, sm: 4 },
        position: 'relative',
        zIndex: 1
    },
    logo: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 900,
        color: '#1a1a1a',
        letterSpacing: '-1.5px',
        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
    },
    logoSubtitle: {
        color: '#666',
        mt: 0.5,
        fontWeight: 500,
        fontSize: { xs: '0.7rem', sm: '0.875rem' }
    },
    stepper: {
        mb: { xs: 2, sm: 4 },
        position: 'relative',
        zIndex: 1,
        '& .MuiStepLabel-label': {
            color: '#999',
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 600,
            fontSize: { xs: '0.7rem', sm: '0.85rem' }
        },
        '& .MuiStepLabel-label.Mui-active': {
            color: '#1a1a1a'
        },
        '& .MuiStepLabel-label.Mui-completed': {
            color: '#0003b1'
        },
        '& .MuiStepIcon-root': {
            color: '#eee',
            fontSize: { xs: '1.2rem', sm: '1.5rem' }
        },
        '& .MuiStepIcon-root.Mui-active': {
            color: '#0003b1'
        },
        '& .MuiStepIcon-root.Mui-completed': {
            color: '#0003b1'
        }
    },
    paper: {
        p: { xs: 2, sm: 3, md: 5 },
        borderRadius: { xs: '24px', sm: '32px' },
        bgcolor: 'white',
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: '0 20px 40px rgba(0, 11, 49, 0.04)',
        position: 'relative',
        zIndex: 1
    },
    alert: {
        mb: 3,
        borderRadius: '16px',
        fontSize: { xs: '0.75rem', sm: '0.85rem' },
        fontWeight: 500,
        '& .MuiAlert-icon': { color: '#0003b1' }
    },
    title: {
        color: '#1a1a1a',
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 800,
        mb: 1,
        letterSpacing: '-0.5px',
        fontSize: { xs: '1.25rem', sm: '1.5rem' },
        textAlign: 'center'
    },
    subtitle: {
        color: '#777',
        mb: { xs: 2, sm: 4 },
        fontWeight: 500,
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        textAlign: 'center'
    },
    roleContainer: {
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.5, sm: 2 },
        mb: { xs: 2, sm: 4 },
        justifyContent: 'center'
    },
    roleCard: {
        flex: 1,
        maxWidth: { sm: '200px' },
        borderRadius: '24px',
        border: '2px solid',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            borderColor: 'rgba(0, 11, 49, 0.2)',
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 20px rgba(0, 11, 49, 0.1)'
        },
    },
    roleLabel: {
        color: '#1a1a1a',
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 800,
        mb: 0.5,
        fontSize: { xs: '0.9rem', sm: '1rem' }
    },
    roleDesc: {
        color: '#888',
        fontWeight: 500,
        fontSize: { xs: '0.65rem', sm: '0.75rem' }
    },
    primaryButton: {
        py: { xs: 1.5, sm: 2 },
        borderRadius: '18px',
        backgroundColor: '#0003b1',
        color: 'white',
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 800,
        fontSize: { xs: '0.85rem', sm: '1rem' },
        textTransform: 'none',
        boxShadow: '0 10px 20px rgba(0, 3, 177, 0.2)',
        minWidth: '180px',
        '&:hover': {
            backgroundColor: 'white',
            color: '#0003b1',
            border: '2px solid #0003b1',
            boxShadow: '0 12px 24px rgba(0, 3, 177, 0.3)',
        },
        '&.Mui-disabled': {
            bgcolor: '#eee',
            color: '#aaa'
        }
    },
    secondaryButton: {
        flex: 1,
        py: { xs: 1.5, sm: 2 },
        borderRadius: '18px',
        borderColor: '#eee',
        color: '#666',
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 700,
        textTransform: 'none',
        fontSize: { xs: '0.8rem', sm: '0.9rem' },
        minWidth: '180px',
        '&:hover': {
            borderColor: '#0003b1',
            bgcolor: 'rgba(0, 11, 49, 0.03)'
        }
    },
    input: {
        width: '100%',
        '& .MuiOutlinedInput-root': {
            borderRadius: { xs: '14px', sm: '16px' },
            bgcolor: '#FBFAFA',
            color: '#1a1a1a',
            fontFamily: '"Inter", sans-serif',
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            '& fieldset': {
                borderColor: 'rgba(0, 11, 49, 0.06)',
                transition: 'all 0.2s ease'
            },
            '&:hover fieldset': { borderColor: 'rgba(0, 11, 49, 0.2)' },
            '&.Mui-focused fieldset': { borderColor: '#0003b1' },
        },
        '& .MuiInputLabel-root': {
            color: '#888',
            fontFamily: '"Inter", sans-serif',
            fontSize: { xs: '0.8rem', sm: '0.95rem' },
            '&.Mui-focused': { color: '#0003b1' },
        },
        '& .MuiSelect-icon': { color: '#999' },
    },
    gpsBox: {
        p: { xs: 2, sm: 2.5 },
        borderRadius: '20px',
        border: '1px solid rgba(0, 11, 49, 0.04)',
        bgcolor: '#FBFAFA',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: { xs: 2, sm: 0 },
        justifyContent: 'space-between',
        width: '100%'
    },
    gpsInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
    },
    gpsTitle: {
        color: '#1a1a1a',
        fontFamily: '"Inter", sans-serif',
        fontWeight: 700,
        fontSize: { xs: '0.8rem', sm: '0.9rem' }
    },
    gpsSubtitle: {
        color: '#888',
        fontWeight: 500,
        fontSize: { xs: '0.65rem', sm: '0.75rem' },
        display: 'block',
        mt: 0.5
    },
    gpsButton: (hasLocation) => ({
        minWidth: { xs: '100%', sm: '160px' },
        py: { xs: 1, sm: 1.5 },
        px: { xs: 0, sm: 2 },
        ml:2,
        borderRadius: '16px',
        bgcolor: hasLocation ? '#4CAF50' : 'transparent',
        borderColor: hasLocation ? '#4CAF50' : '#0003b1',
        color: hasLocation ? 'white' : '#0003b1',
        fontSize: { xs: '0.75rem', sm: '0.85rem' },
        fontWeight: 600,
        '&:hover': {
            bgcolor: hasLocation ? '#45a049' : 'rgba(0, 3, 177, 0.04)',
            borderColor: hasLocation ? '#45a049' : '#0003b1',
        }
    }),
    keywordChip: {
        bgcolor: 'rgba(0, 3, 177, 0.06)',
        color: '#0003b1',
        fontWeight: 600,
        fontFamily: '"Inter", sans-serif',
        '& .MuiChip-deleteIcon': { color: '#0003b1' },
        fontSize: { xs: '0.7rem', sm: '0.8125rem' },
        height: { xs: 24, sm: 32 }
    },
    customKeywordChip: {
        bgcolor: 'rgba(76, 175, 80, 0.1)',
        color: '#2e7d32',
        fontWeight: 600,
        fontFamily: '"Inter", sans-serif',
        '& .MuiChip-deleteIcon': { color: '#2e7d32' },
        fontSize: { xs: '0.7rem', sm: '0.8125rem' },
        height: { xs: 24, sm: 32 },
        border: '1px dashed #2e7d32'
    },
    buttonContainer: {
        display: 'flex',
        gap: { xs: 1.5, sm: 2 },
        mt: { xs: 3, sm: 4 },
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'center'
    },
    loginLink: {
        textAlign: 'center',
        mt: { xs: 3, sm: 4 }
    },
    backLink: {
        textAlign: 'center',
        mt: { xs: 2, sm: 4 }
    },
    link: {
        color: '#0003b1',
        cursor: 'pointer',
        fontWeight: 700,
        textDecoration: 'none',
        fontSize: { xs: '0.8rem', sm: '0.9rem' },
        '&:hover': { 
            textDecoration: 'underline',
            color: '#000290' 
        }
    }
};

export default Register;