// Register.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Container, Paper, Typography, TextField, Button,
    InputAdornment, IconButton, Alert, CircularProgress, Link,
    Chip, Grid, MenuItem,
    FormControl, InputLabel, Select, FormHelperText,
    Autocomplete, useMediaQuery, useTheme, Fade
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
import logo from '../../assets/nearzologo.png';

function Register() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isVerySmall = useMediaQuery('(max-width:350px)');
    const [isVisible, setIsVisible] = useState(false);
    
    const [activeStep, setActiveStep] = useState(0);
    const [role, setRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsSuccess, setGpsSuccess] = useState(false);
    
    const [categories, setCategories] = useState([]);
    const [availableKeywords, setAvailableKeywords] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [customKeyword, setCustomKeyword] = useState('');
    const [loadingKeywords, setLoadingKeywords] = useState(false);

    const [form, setForm] = useState({
        phone: '',
        street: '',
        city: '',
        state: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        shopName: '',
        ownerName: '',
        category: '',
        latitude: null,
        longitude: null,
    });

    useEffect(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        loadCategories();
    }, []);

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
            const exists = selectedKeywords.some(k => 
                k.keyword.toLowerCase() === customKeyword.trim().toLowerCase()
            );
            
            if (!exists) {
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
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(form.phone)) {
            return 'Please enter a valid 10-digit Indian mobile number';
        }

        if (!form.phone) return 'Phone number is required';
        if (!form.city) return 'City is required';
        if (!form.state) return 'State is required';
        if (!form.password) return 'Password is required';
        if (form.password.length < 6) return 'Password must be at least 6 characters';
        if (form.password !== form.confirmPassword) return 'Passwords do not match';

        if (role === 'user') {
            if (!form.fullName) return 'Full name is required';
        }

        if (role === 'business') {
            if (!form.shopName) return 'Shop name is required';
            if (!form.ownerName) return 'Owner name is required';
            if (!form.category) return 'Category is required';
            if (!form.latitude || !form.longitude) return 'Shop location is required. Please click "Get Shop Location" button.';
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

            delete registrationData.confirmPassword;

            const result = await registerUser(role, registrationData);
            
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

    return (
        <Box sx={styles.container}>
            <Box sx={styles.backgroundWrapper}>
                <Box sx={styles.bgBase} />
                <Box sx={styles.diagonalSplit} />
                <Box sx={styles.shapeCircle1} />
                <Box sx={styles.shapeCircle2} />
                <Box sx={styles.shapeCircle3} />
                <Box sx={styles.shapeDots} />
                <Box sx={styles.gridPattern} />
                <Box sx={styles.gradientOverlay} />
            </Box>

            <Container maxWidth="md" sx={{ position: 'relative', px: isVerySmall ? 1 : 2, zIndex: 10 }}>
                <Fade in={isVisible} timeout={800}>
                    <Box>
                        <Paper elevation={0} sx={styles.paper}>
                            <Box sx={styles.logoWrapper}>
                                <Box
                                    component="img"
                                    src={logo}
                                    alt="NearZO"
                                    sx={{
                                        width: { xs: 'min(120px, 50vw)', sm: '140px', md: '160px' },
                                        height: 'auto',
                                        objectFit: 'contain',
                                    }}
                                />
                                <Box sx={styles.logoDivider} />
                            </Box>

                            {error && (
                                <Alert severity="error" sx={styles.alert}>
                                    {error}
                                </Alert>
                            )}

                            {gpsSuccess && (
                                <Alert severity="success" sx={{ ...styles.alert, bgcolor: '#e8f5e8' }}>
                                    Shop location captured successfully!
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
                                                    borderColor: role === opt.value ? '#325fec' : '#F5F5F5',
                                                    bgcolor: role === opt.value ? 'rgba(50, 95, 236, 0.02)' : 'white',
                                                    p: isVerySmall ? 2 : 3,
                                                }}
                                            >
                                                <Box sx={{ 
                                                    color: role === opt.value ? '#325fec' : '#bbb',
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
                                        sx={styles.primaryButton}
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

                                    {/* Row 1: Full Name (User) OR Shop Name (Business) & Phone Number */}
                                    <Box sx={styles.rowContainer}>
                                        <Box sx={styles.colHalf}>
                                            {role === 'user' ? (
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
                                            ) : (
                                                <TextField
                                                    fullWidth
                                                    name="shopName"
                                                    label="Shop / Business Name"
                                                    value={form.shopName}
                                                    onChange={handleChange}
                                                    required
                                                    size={isVerySmall ? 'small' : 'medium'}
                                                    sx={styles.input}
                                                />
                                            )}
                                        </Box>
                                        <Box sx={styles.colHalf}>
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
                                                            <PhoneIcon sx={{ color: '#325fec', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                                sx={styles.input}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Row 2: Street & City */}
                                    <Box sx={styles.rowContainer}>
                                        <Box sx={styles.colHalf}>
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
                                        <Box sx={styles.colHalf}>
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
                                    </Box>

                                    {/* Row 3: Owner Name (Business only) & State */}
                                    <Box sx={styles.rowContainer}>
                                        {role === 'business' && (
                                            <Box sx={styles.colHalf}>
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
                                        )}
                                        <Box sx={role === 'business' ? styles.colHalf : styles.colFull}>
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
                                    </Box>

                                    {/* Business Specific Fields */}
                                    {role === 'business' && (
                                        <>
                                            {/* Category */}
                                            <Box sx={{ ...styles.rowContainer, mb: 2 }}>
                                                <Box sx={styles.colFull}>
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
                                            </Box>

                                            {/* Keywords */}
                                            {form.category && (
                                                <Box sx={styles.rowContainer}>
                                                    <Box sx={styles.colFull}>
                                                        <Box sx={styles.keywordBox}>
                                                            <Typography variant="subtitle2" sx={{ mb: 2, color: '#5a6e8a', fontWeight: 600, textAlign: 'center' }}>
                                                                Select Keywords for your Business
                                                            </Typography>
                                                            
                                                            {loadingKeywords ? (
                                                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                                                    <CircularProgress size={30} sx={{ color: '#325fec' }} />
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
                                                                            sx={styles.addButton}
                                                                        >
                                                                            <AddIcon />
                                                                        </Button>
                                                                    </Box>

                                                                    {selectedKeywords.length > 0 && (
                                                                        <Box sx={{ mt: 2 }}>
                                                                            <Typography variant="caption" sx={{ color: '#5a6e8a', display: 'block', mb: 1, textAlign: 'center' }}>
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
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* Shop Location Button */}
                                            <Box sx={styles.rowContainer}>
                                                <Box sx={styles.colFull}>
                                                    <Box sx={styles.gpsBox}>
                                                        <Box sx={styles.gpsInfo}>
                                                            <LocationOnIcon sx={{ color: '#325fec', fontSize: isVerySmall ? '1.2rem' : '1.5rem' }} />
                                                            <Box>
                                                                <Typography sx={styles.gpsTitle}>
                                                                    Shop Location <span style={{ color: '#325fec' }}>*</span>
                                                                </Typography>
                                                                <Typography variant="caption" sx={styles.gpsSubtitle}>
                                                                    {form.latitude && form.longitude ? (
                                                                        <>
                                                                            ✓ Location captured: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                                                                        </>
                                                                    ) : (
                                                                        'Click the button to get your shop location automatically'
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
                                                                <CircularProgress size={isVerySmall ? 16 : 20} sx={{ color: form.latitude ? 'white' : '#325fec' }} />
                                                            ) : form.latitude ? (
                                                                'Location Captured ✓'
                                                            ) : (
                                                                'Get Shop Location'
                                                            )}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </>
                                    )}

                                    {/* Password & Confirm Password */}
                                    <Box sx={styles.rowContainer}>
                                        <Box sx={styles.colHalf}>
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
                                                            <LockIcon sx={{ color: '#325fec', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
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
                                        <Box sx={styles.colHalf}>
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
                                                            <LockIcon sx={{ color: '#325fec', fontSize: isVerySmall ? '1rem' : '1.2rem' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                                sx={styles.input}
                                            />
                                        </Box>
                                    </Box>

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
                                            sx={styles.primaryButton}
                                        >
                                            {loading ? <CircularProgress size={isVerySmall ? 20 : 24} sx={{ color: '#ffffff' }} /> : 'Create Account'}
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {/* Login Link */}
                            <Box sx={styles.loginLink}>
                                <Typography variant="body2" sx={{ color: '#5a6e8a', fontSize: isVerySmall ? '0.75rem' : '0.875rem' }}>
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
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, sm: 2 },
        py: { xs: 3, sm: 6 },
        position: 'relative',
        overflow: 'hidden',
    },
    backgroundWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
    },
    bgBase: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #325fec 100%, #325fec 100%)',
    },
    diagonalSplit: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '60%',
        height: '100%',
        background: '#ffffff',
        transform: 'skewX(-35deg)',
        transformOrigin: 'top right',
        '@media (max-width: 768px)': {
            width: '100%',
            transform: 'skewX(0deg)',
        },
    },

    shapeDots: {
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: '150px',
        height: '150px',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 2px, transparent 2px)',
        backgroundSize: '20px 20px',
        animation: 'float 30s ease-in-out infinite',
    },
    gridPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.04) 100%)',
    },
    logoWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 3,
    },
    logoDivider: {
        width: '50px',
        height: '3px',
        background: 'linear-gradient(90deg, #325fec, #325fec)',
        borderRadius: '3px',
        mt: 2,
    },
    paper: {
        p: { xs: 2.5, sm: 3.5, md: 4.5 },
        borderRadius: { xs: '28px', sm: '36px' },
        bgcolor: 'white',
        position: 'relative',
        zIndex: 1,
        maxWidth: '600px',
        margin: 'auto',
        marginRight: 'auto',
        maxHeight: '85vh',
        overflowY: 'auto',
        backdropFilter: 'blur(20px)',
        '@media (max-width: 600px)': {
            bgcolor:'transparent'
        }
    },
    alert: {
        mb: 3,
        borderRadius: '16px',
        fontSize: { xs: '0.75rem', sm: '0.85rem' },
        fontWeight: 500,
        '& .MuiAlert-icon': { color: '#325fec' }
    },
    title: {
        color: '#020402',
        fontFamily: '"Alumni Sans", sans-serif',
        fontWeight: 700,
        mb: 0.5,
        fontSize: { xs: '1.25rem', sm: '1.5rem' },
        textAlign: 'center',
        letterSpacing:'1px'
    },
    subtitle: {
        color: '#5a6e8a',
        mb: { xs: 2, sm: 3 },
        fontWeight: 400,
        fontFamily: '"Inter", sans-serif',
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
            borderColor: 'rgba(50, 95, 236, 0.3)',
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 20px rgba(50, 95, 236, 0.1)'
        },
    },
    roleLabel: {
        color: '#020402',
        fontFamily: '"Alumni Sans", sans-serif',
        fontWeight: 700,
        mb: 0.5,
        fontSize: { xs: '0.9rem', sm: '1.2rem' },
                letterSpacing:'1px'


    },
    roleDesc: {
        color: '#5a6e8a',
        fontWeight: 500,
        fontFamily: '"Inter", sans-serif',
        fontSize: { xs: '0.65rem', sm: '0.75rem' }
    },
    rowContainer: {
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.5, sm: 2.5 },
        mb: 2.5,
        width: '100%',
    },
    colHalf: {
        flex: 1,
        width: '100%',
    },
    colFull: {
        flex: '1 1 100%',
        width: '100%',
    },
    primaryButton: {
        py: { xs: 1.2, sm: 1.5 },
        borderRadius: '50px',
        bgcolor: '#325fec',
        color: 'white',
        fontFamily: '"Inter", sans-serif',
        fontWeight: 700,
        fontSize: { xs: '0.85rem', sm: '1rem' },
        textTransform: 'none',
        boxShadow: '0 8px 20px rgba(50, 95, 236, 0.25)',
        minWidth: '180px',
        '&:hover': {
            bgcolor: '#2548b0',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 28px rgba(50, 95, 236, 0.35)',
        },
        '&.Mui-disabled': {
            bgcolor: '#e0e0e0',
            color: '#999'
        }
    },
    secondaryButton: {
        flex: 1,
        py: { xs: 1.2, sm: 1.5 },
        borderRadius: '50px',
        borderColor: 'rgba(50, 95, 236, 0.3)',
        color: '#325fec',
        fontFamily: '"Inter", sans-serif',
        fontWeight: 600,
        textTransform: 'none',
        fontSize: { xs: '0.8rem', sm: '0.9rem' },
        minWidth: '180px',
        '&:hover': {
            borderColor: '#325fec',
            bgcolor: 'rgba(50, 95, 236, 0.04)',
            transform: 'translateY(-2px)',
        }
    },
    input: {
        '& .MuiOutlinedInput-root': {
            borderRadius: { xs: '14px', sm: '16px' },
            bgcolor: '#f8f9fa',
            color: '#020402',
            fontFamily: '"Inter", sans-serif',
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            '& fieldset': {
                borderColor: 'rgba(50, 95, 236, 0.15)',
                transition: 'all 0.2s ease'
            },
            '&:hover fieldset': { borderColor: 'rgba(50, 95, 236, 0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#325fec', borderWidth: '2px' },
        },
        '& .MuiInputLabel-root': {
            color: '#5a6e8a',
            fontFamily: '"Inter", sans-serif',
            fontSize: { xs: '0.8rem', sm: '0.95rem' },
            '&.Mui-focused': { color: '#325fec' },
        },
        '& .MuiSelect-icon': { color: '#999' },
    },
    gpsBox: {
        p: { xs: 2, sm: 2.5 },
        borderRadius: '20px',
        border: '1px solid rgba(50, 95, 236, 0.1)',
        bgcolor: '#f8f9fa',
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
        color: '#020402',
        fontFamily: '"Inter", sans-serif',
        fontWeight: 600,
        fontSize: { xs: '0.8rem', sm: '0.9rem' }
    },
    gpsSubtitle: {
        color: '#5a6e8a',
        fontWeight: 500,
        fontSize: { xs: '0.65rem', sm: '0.75rem' },
        display: 'block',
        mt: 0.5,
        fontFamily: '"Inter", sans-serif',
    },
    gpsButton: (hasLocation) => ({
        minWidth: { xs: '100%', sm: '180px' },
        py: { xs: 1, sm: 1.2 },
        px: { xs: 0, sm: 2 },
        borderRadius: '50px',
        bgcolor: hasLocation ? '#4CAF50' : 'transparent',
        borderColor: hasLocation ? '#4CAF50' : '#325fec',
        color: hasLocation ? 'white' : '#325fec',
        fontFamily: '"Inter", sans-serif',
        fontWeight: 600,
        fontSize: { xs: '0.75rem', sm: '0.85rem' },
        textTransform: 'none',
        '&:hover': {
            bgcolor: hasLocation ? '#45a049' : 'rgba(50, 95, 236, 0.04)',
            borderColor: hasLocation ? '#45a049' : '#325fec',
            transform: 'translateY(-2px)',
        }
    }),
    addButton: {
        minWidth: 56,
        borderRadius: '16px',
        borderColor: 'rgba(50, 95, 236, 0.3)',
        color: '#325fec',
        '&:hover': {
            borderColor: '#325fec',
            bgcolor: 'rgba(50, 95, 236, 0.04)',
            transform: 'translateY(-2px)',
        },
        '&.Mui-disabled': {
            borderColor: '#e0e0e0',
            color: '#ccc'
        }
    },
    keywordBox: {
        p: 2,
        borderRadius: '16px',
        border: '1px solid rgba(50, 95, 236, 0.1)',
        bgcolor: '#f8f9fa',
    },
    keywordChip: {
        bgcolor: 'rgba(50, 95, 236, 0.08)',
        color: '#325fec',
        fontWeight: 600,
        fontFamily: '"Inter", sans-serif',
        '& .MuiChip-deleteIcon': { color: '#325fec' },
        fontSize: { xs: '0.7rem', sm: '0.8125rem' },
        height: { xs: 28, sm: 32 },
        borderRadius: '12px',
    },
    customKeywordChip: {
        bgcolor: 'rgba(76, 175, 80, 0.1)',
        color: '#2e7d32',
        fontWeight: 600,
        fontFamily: '"Inter", sans-serif',
        '& .MuiChip-deleteIcon': { color: '#2e7d32' },
        fontSize: { xs: '0.7rem', sm: '0.8125rem' },
        height: { xs: 28, sm: 32 },
        borderRadius: '12px',
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
    link: {
        color: '#325fec',
        cursor: 'pointer',
        fontWeight: 700,
        textDecoration: 'none',
        fontFamily: '"Inter", sans-serif',
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        '&:hover': { 
            textDecoration: 'underline',
            color: '#2548b0' 
        }
    }
};

// Add keyframes to document
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(20px, -20px); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.05); opacity: 0.9; }
    }
`;
document.head.appendChild(style);

export default Register;