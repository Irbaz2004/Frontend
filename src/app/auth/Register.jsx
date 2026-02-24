import React, { useState, useEffect } from 'react';
import {
    Box, Container, Paper, Typography, TextField, Button,
    InputAdornment, IconButton, Alert, CircularProgress, Link,
    Stepper, Step, StepLabel, Chip, FormControlLabel, Switch,
    MenuItem, Grid, FormHelperText, FormControl, RadioGroup,
    Radio, FormLabel, Divider, Avatar
} from '@mui/material';
import {
    Person as PersonIcon,
    Store as StoreIcon,
    Church as ChurchIcon,
    LocalHospital as DoctorIcon,
    Phone as PhoneIcon,
    Lock as LockIcon,
    LocationOn as LocationIcon,
    Visibility,
    VisibilityOff,
    Add as AddIcon,
    Map as MapIcon,
    CheckCircle as CheckCircleIcon,
    Business as BusinessIcon,
    AccessTime as TimeIcon,
    AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { registerUser, checkPhoneAvailability, getRegistrationFields } from '../../services/auth';
import { getCurrentLocation } from '../../utils/location';

// Role definitions
const ROLES = [
    {
        value: 'user',
        label: 'Job Seeker',
        icon: <PersonIcon sx={{ fontSize: 32 }} />,
        desc: 'Find jobs, shops & services nearby',
        color: '#2196f3'
    },
    {
        value: 'business',
        label: 'Business Owner',
        icon: <StoreIcon sx={{ fontSize: 32 }} />,
        desc: 'Register your shop, clinic or business',
        color: '#4caf50'
    },
    {
        value: 'doctor',
        label: 'Doctor / Clinic',
        icon: <DoctorIcon sx={{ fontSize: 32 }} />,
        desc: 'Manage appointments & patients',
        color: '#f44336'
    },
    {
        value: 'worship',
        label: 'Place of Worship',
        icon: <ChurchIcon sx={{ fontSize: 32 }} />,
        desc: 'Share prayer times & events',
        color: '#9c27b0'
    }
];

// Business categories
const BUSINESS_CATEGORIES = [
    { value: 'stationery', label: 'Stationery Shop', icon: '📝' },
    { value: 'doctor', label: 'Doctor / Clinic', icon: '👨‍⚕️' },
    { value: 'grocery', label: 'Grocery Store', icon: '🛒' },
    { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
    { value: 'salon', label: 'Salon & Spa', icon: '💇' },
    { value: 'electronics', label: 'Electronics', icon: '📱' },
    { value: 'clothing', label: 'Clothing Store', icon: '👕' },
    { value: 'pharmacy', label: 'Pharmacy', icon: '💊' },
    { value: 'bakery', label: 'Bakery', icon: '🥐' },
    { value: 'other', label: 'Other', icon: '🏪' }
];

// Religion types
const RELIGION_TYPES = [
    { value: 'masjid', label: 'Masjid / Mosque', icon: '🕌' },
    { value: 'temple', label: 'Temple / Mandir', icon: '🛕' },
    { value: 'church', label: 'Church', icon: '⛪' },
    { value: 'gurudwara', label: 'Gurudwara', icon: '🛐' },
    { value: 'other', label: 'Other', icon: '📿' }
];

// Doctor specializations
const DOCTOR_SPECIALIZATIONS = [
    'Cardiologist', 'Dentist', 'Dermatologist', 'ENT Specialist',
    'General Physician', 'Gynecologist', 'Neurologist', 'Orthopedic',
    'Pediatrician', 'Psychiatrist', 'Radiologist', 'Surgeon'
];

// Job types
const JOB_TYPES = [
    'Full Time', 'Part Time', 'Contract', 'Internship'
];

const steps = ['Choose Role', 'Basic Info', 'Location', 'Additional Details'];

function Register() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [role, setRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [gpsLoading, setGpsLoading] = useState(false);
    const [phoneAvailable, setPhoneAvailable] = useState(true);
    const [checkingPhone, setCheckingPhone] = useState(false);
    const [keyItemInput, setKeyItemInput] = useState('');
    const [facilityInput, setFacilityInput] = useState('');

    const [form, setForm] = useState({
        // Common fields
        fullName: '',
        phone: '',
        password: '',
        confirmPassword: '',
        latitude: null,
        longitude: null,
        area: '',
        city: '',
        state: '',
        street: '',

        // User specific
        age: '',
        business: '',

        // Business specific
        businessName: '',
        businessCategory: '',
        items: [],
        specialization: '',
        coordinatorId: '',
        timings: '',
        consultationFee: '',
        hasJobVacancy: false,

        // Doctor specific
        doctorName: '',
        qualifications: '',
        experience: '',

        // Worship specific
        worshipName: '',
        religionType: '',
        prayerTimings: '',
        worshipCoordinatorId: '',

        // GPS consent
        allowGPS: false
    });

    // Check phone availability
    useEffect(() => {
        const checkPhone = async () => {
            if (form.phone && form.phone.length === 10) {
                setCheckingPhone(true);
                const result = await checkPhoneAvailability(form.phone);
                setPhoneAvailable(result.available);
                if (!result.available) {
                    setError('Phone number already registered');
                } else {
                    setError('');
                }
                setCheckingPhone(false);
            }
        };

        const timer = setTimeout(checkPhone, 500);
        return () => clearTimeout(timer);
    }, [form.phone]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setError('');
    };

    const handleGPSToggle = async (e) => {
        const enabled = e.target.checked;
        setForm(prev => ({ ...prev, allowGPS: enabled }));

        if (enabled) {
            setGpsLoading(true);
            try {
                const location = await getCurrentLocation();
                setForm(prev => ({
                    ...prev,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    area: location.area || prev.area,
                    city: location.city || prev.city,
                    state: location.state || prev.state
                }));
                setSuccess('Location captured successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Could not get location. Please enable GPS or enter manually.');
                setForm(prev => ({ ...prev, allowGPS: false }));
            } finally {
                setGpsLoading(false);
            }
        } else {
            setForm(prev => ({ ...prev, latitude: null, longitude: null }));
        }
    };

    // Items management
    const addKeyItem = () => {
        const trimmed = keyItemInput.trim();
        if (trimmed && !form.items.includes(trimmed)) {
            setForm(prev => ({
                ...prev,
                items: [...prev.items, trimmed]
            }));
        }
        setKeyItemInput('');
    };

    const removeKeyItem = (item) => {
        setForm(prev => ({
            ...prev,
            items: prev.items.filter(i => i !== item)
        }));
    };

    // Facilities management (for worship)
    const addFacility = () => {
        const trimmed = facilityInput.trim();
        if (trimmed && !form.facilities?.includes(trimmed)) {
            setForm(prev => ({
                ...prev,
                facilities: [...(prev.facilities || []), trimmed]
            }));
        }
        setFacilityInput('');
    };

    const removeFacility = (facility) => {
        setForm(prev => ({
            ...prev,
            facilities: prev.facilities?.filter(f => f !== facility)
        }));
    };

    const handleRoleNext = () => {
        if (!role) {
            setError('Please select a role to continue');
            return;
        }
        setError('');
        setActiveStep(1);
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
        setError('');
    };

    const validateStep = () => {
        switch (activeStep) {
            case 1: // Basic Info
                if (!form.fullName) return 'Full name is required';
                if (!form.phone || form.phone.length !== 10) return 'Valid 10-digit phone is required';
                if (!phoneAvailable) return 'Phone number already registered';
                if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters';
                if (form.password !== form.confirmPassword) return 'Passwords do not match';

                // Role specific validation
                if (role === 'business' && !form.businessName) return 'Business name is required';
                if (role === 'doctor' && !form.doctorName) return 'Doctor name is required';
                if (role === 'worship' && !form.worshipName) return 'Worship place name is required';
                break;

            case 2: // Location
                if (!form.allowGPS && (!form.latitude || !form.longitude)) {
                    return 'Please enable GPS or enter location manually';
                }
                if (!form.area || !form.city || !form.state) {
                    return 'Area, city and state are required';
                }
                break;

            case 3: // Additional Details
                if (role === 'business' && !form.businessCategory) {
                    return 'Business category is required';
                }
                if (role === 'doctor' && !form.specialization) {
                    return 'Specialization is required';
                }
                if (role === 'worship' && !form.religionType) {
                    return 'Religion type is required';
                }
                break;
        }
        return '';
    };

    const handleNext = () => {
        const validationError = validateStep();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError('');
        setActiveStep(prev => prev + 1);
    };

    const handleSubmit = async () => {
        const validationError = validateStep();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            const result = await registerUser(role, form);

            // Save to localStorage
            localStorage.setItem('nearzo_token', result.token);
            localStorage.setItem('nearzo_user', JSON.stringify(result.user));
            localStorage.setItem('nearzo_role', result.user.role);

            setSuccess('Registration successful! Redirecting...');

            // Redirect based on role
            setTimeout(() => {
                const routes = {
                    user: '/app/user/home',
                    business: '/app/business/dashboard',
                    doctor: '/app/doctor/dashboard',
                    worship: '/app/worship/dashboard'
                };
                navigate(routes[role] || '/app/user/home');
            }, 1500);

        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Render role selection step
    const renderRoleSelection = () => (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Join NearZO
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 4 }}>
                Select your account type to get started
            </Typography>

            <Grid container spacing={2}>
                {ROLES.map((opt) => (
                    <Grid item xs={12} sm={6} key={opt.value}>
                        <Paper
                            elevation={0}
                            onClick={() => { setRole(opt.value); setError(''); }}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '2px solid',
                                borderColor: role === opt.value ? opt.color : '#f0f0f0',
                                bgcolor: role === opt.value ? `${opt.color}08` : 'white',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    borderColor: opt.color,
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 12px 24px ${opt.color}20`
                                }
                            }}
                        >
                            <Box sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 3,
                                bgcolor: `${opt.color}15`,
                                color: opt.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}>
                                {opt.icon}
                            </Box>
                            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                                {opt.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                                {opt.desc}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Button
                fullWidth
                variant="contained"
                onClick={handleRoleNext}
                disabled={!role}
                sx={{ mt: 4, py: 1.5, borderRadius: 3 }}
            >
                Continue
            </Button>
        </Box>
    );

    // Render basic info step
    const renderBasicInfo = () => (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Basic Information
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 4 }}>
                Tell us about yourself
            </Typography>

            <Grid container spacing={2.5}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        name="fullName"
                        label="Full Name"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon sx={{ color: '#C00C0C' }} />
                                </InputAdornment>
                            )
                        }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        name="phone"
                        label="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        error={!phoneAvailable}
                        helperText={!phoneAvailable ? 'Phone already registered' : ''}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PhoneIcon sx={{ color: '#C00C0C' }} />
                                </InputAdornment>
                            ),
                            endAdornment: checkingPhone && (
                                <InputAdornment position="end">
                                    <CircularProgress size={20} />
                                </InputAdornment>
                            )
                        }}
                    />
                </Grid>

                {/* Role-specific fields */}
                {role === 'business' && (
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            name="businessName"
                            label="Business Name"
                            value={form.businessName}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <StoreIcon sx={{ color: '#C00C0C' }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                )}

                {role === 'doctor' && (
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            name="doctorName"
                            label="Doctor Name"
                            value={form.doctorName}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <DoctorIcon sx={{ color: '#C00C0C' }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                )}

                {role === 'worship' && (
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            name="worshipName"
                            label="Place of Worship Name"
                            value={form.worshipName}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <ChurchIcon sx={{ color: '#C00C0C' }} />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                )}

                {role === 'user' && (
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            name="age"
                            label="Age"
                            type="number"
                            value={form.age}
                            onChange={handleChange}
                        />
                    </Grid>
                )}

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon sx={{ color: '#C00C0C' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        error={form.password !== form.confirmPassword && form.confirmPassword !== ''}
                        helperText={form.password !== form.confirmPassword && form.confirmPassword !== '' ? 'Passwords do not match' : ''}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon sx={{ color: '#C00C0C' }} />
                                </InputAdornment>
                            )
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );

    // Render location step
    const renderLocation = () => (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Your Location
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 4 }}>
                Help people find you easily
            </Typography>

            <Grid container spacing={2.5}>
                <Grid item xs={12}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            bgcolor: '#f8f8f8',
                            border: '1px solid',
                            borderColor: form.allowGPS ? '#4caf50' : '#e0e0e0'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <LocationIcon sx={{ color: form.allowGPS ? '#4caf50' : '#999' }} />
                                <Box>
                                    <Typography sx={{ fontWeight: 600 }}>
                                        Enable GPS Location
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#666' }}>
                                        {form.latitude
                                            ? `📍 ${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}`
                                            : 'Allow access to your current location'}
                                    </Typography>
                                </Box>
                            </Box>
                            <Switch
                                checked={form.allowGPS}
                                onChange={handleGPSToggle}
                                disabled={gpsLoading}
                            />
                        </Box>
                        {gpsLoading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        name="street"
                        label="Street / House No."
                        value={form.street}
                        onChange={handleChange}
                        required
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        name="area"
                        label="Area / Locality"
                        value={form.area}
                        onChange={handleChange}
                        required
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        name="city"
                        label="City"
                        value={form.city}
                        onChange={handleChange}
                        required
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        name="state"
                        label="State"
                        value={form.state}
                        onChange={handleChange}
                        required
                    />
                </Grid>
            </Grid>
        </Box>
    );

    // Render additional details step
    const renderAdditionalDetails = () => (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Additional Details
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 4 }}>
                Help us know more about your {role}
            </Typography>

            <Grid container spacing={2.5}>
                {role === 'business' && (
                    <>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                name="businessCategory"
                                label="Business Category"
                                value={form.businessCategory}
                                onChange={handleChange}
                                required
                            >
                                {BUSINESS_CATEGORIES.map(cat => (
                                    <MenuItem key={cat.value} value={cat.value}>
                                        {cat.icon} {cat.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Add Items/Services"
                                    value={keyItemInput}
                                    onChange={e => setKeyItemInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyItem())}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={addKeyItem}
                                    sx={{ minWidth: 56, borderRadius: 2 }}
                                >
                                    <AddIcon />
                                </Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {form.items.map(item => (
                                    <Chip
                                        key={item}
                                        label={item}
                                        onDelete={() => removeKeyItem(item)}
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="specialization"
                                label="Specialization (if any)"
                                value={form.specialization}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="timings"
                                label="Business Hours"
                                placeholder="e.g., 9am-6pm Mon-Fri"
                                value={form.timings}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <TimeIcon sx={{ color: '#C00C0C' }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="coordinatorId"
                                label="Coordinator ID (if any)"
                                value={form.coordinatorId}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={form.hasJobVacancy}
                                        onChange={handleChange}
                                        name="hasJobVacancy"
                                    />
                                }
                                label="Currently hiring? (Post jobs)"
                            />
                        </Grid>
                    </>
                )}

                {role === 'doctor' && (
                    <>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                name="specialization"
                                label="Specialization"
                                value={form.specialization}
                                onChange={handleChange}
                                required
                            >
                                {DOCTOR_SPECIALIZATIONS.map(spec => (
                                    <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="qualifications"
                                label="Qualifications"
                                value={form.qualifications}
                                onChange={handleChange}
                                placeholder="e.g., MBBS, MD"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="experience"
                                label="Experience (years)"
                                type="number"
                                value={form.experience}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="consultationFee"
                                label="Consultation Fee (₹)"
                                type="number"
                                value={form.consultationFee}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MoneyIcon sx={{ color: '#C00C0C' }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="timings"
                                label="Clinic Hours"
                                placeholder="e.g., 9am-5pm Mon-Sat"
                                value={form.timings}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <TimeIcon sx={{ color: '#C00C0C' }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                    </>
                )}

                {role === 'worship' && (
                    <>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                name="religionType"
                                label="Religion Type"
                                value={form.religionType}
                                onChange={handleChange}
                                required
                            >
                                {RELIGION_TYPES.map(type => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.icon} {type.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Facilities (e.g., Parking, Wudu Area)"
                                    value={facilityInput}
                                    onChange={e => setFacilityInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={addFacility}
                                    sx={{ minWidth: 56, borderRadius: 2 }}
                                >
                                    <AddIcon />
                                </Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {form.facilities?.map(facility => (
                                    <Chip
                                        key={facility}
                                        label={facility}
                                        onDelete={() => removeFacility(facility)}
                                        color="secondary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="prayerTimings"
                                label="Prayer Timings (JSON format)"
                                placeholder='{"fajr": "05:00", "dhuhr": "12:30"}'
                                value={form.prayerTimings}
                                onChange={handleChange}
                                multiline
                                rows={3}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="worshipCoordinatorId"
                                label="Coordinator ID (if any)"
                                value={form.worshipCoordinatorId}
                                onChange={handleChange}
                            />
                        </Grid>
                    </>
                )}

                {role === 'user' && (
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            name="business"
                            label="Where do you work? (Optional)"
                            value={form.business}
                            onChange={handleChange}
                            placeholder="Company or Business name"
                        />
                    </Grid>
                )}
            </Grid>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', py: 4 }}>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#1a1a1a' }}>
                        Near<span style={{ color: '#C00C0C' }}>ZO</span>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
                        Create your account
                    </Typography>
                </Box>

                {/* Main Paper */}
                <Paper sx={{ p: 4, borderRadius: 4 }}>
                    {/* Stepper */}
                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map(label => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Messages */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            {success}
                        </Alert>
                    )}

                    {/* Step Content */}
                    {activeStep === 0 && renderRoleSelection()}
                    {activeStep === 1 && renderBasicInfo()}
                    {activeStep === 2 && renderLocation()}
                    {activeStep === 3 && renderAdditionalDetails()}

                    {/* Navigation Buttons */}
                    {activeStep > 0 && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                sx={{ flex: 1, py: 1.5, borderRadius: 3 }}
                                disabled={loading}
                            >
                                Back
                            </Button>

                            {activeStep < steps.length - 1 ? (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    sx={{ flex: 2, py: 1.5, borderRadius: 3 }}
                                    disabled={loading}
                                >
                                    Continue
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    sx={{ flex: 2, py: 1.5, borderRadius: 3 }}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Create Account'}
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* Login Link */}
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Already have an account?{' '}
                            <Link
                                onClick={() => navigate('/app/login')}
                                sx={{ color: '#C00C0C', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Sign In
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default Register;