// app/user/Profile.jsx - Updated with edit options for house and job status
import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Avatar,
    TextField,
    Button,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardActions,
    Tab,
    Tabs,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Stack,
    IconButton,
    Divider,
    Tooltip,
    Switch,
    FormControlLabel,
    AlertTitle
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    LocationOn as LocationOnIcon,
    Store as StoreIcon,
    Home as HomeIcon,
    Work as WorkIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Lock as LockIcon,
    Warning as WarningIcon,
    MyLocation as MyLocationIcon,
    CloudUpload as CloudUploadIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    AccessTime as AccessTimeIcon,
    Business as BusinessIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import { 
    getProfile, 
    updateProfile, 
    changePassword, 
    deleteAccount,
    createShop,
    createHouse,
    createJob,
    getUserShopsForJob,
    updateHouse,
    updateJob
} from '../../services/profile';
import { getAllCities, getAreasByCity, verifyLocation, getShopCategories } from '../../services/location';
import { useAuth } from '../context/AuthContext';

// Location Service for reverse geocoding
class LocationService {
    constructor() {
        this.providers = [
            this.nominatimGeocode.bind(this),
            this.bigDataCloudGeocode.bind(this)
        ];
    }

    async reverseGeocode(lat, lng) {
        for (const provider of this.providers) {
            try {
                const result = await provider(lat, lng);
                if (result && result.city) return result;
            } catch (err) {
                console.warn('Geocoding provider failed:', err);
            }
        }
        return null;
    }

    async nominatimGeocode(lat, lng) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
                {
                    headers: { 'User-Agent': 'NearZO-App/1.0' },
                    signal: controller.signal
                }
            );

            if (!response.ok) throw new Error('Nominatim request failed');

            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                return {
                    city: addr.city || addr.town || addr.village || null,
                    area: addr.suburb || addr.neighbourhood || addr.hamlet || addr.city_district || addr.district || null,
                    state: addr.state || addr.region || null,
                    country: addr.country || null,
                    postcode: addr.postcode || null,
                    full_address: data.display_name || null
                };
            }
            return null;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async bigDataCloudGeocode(lat, lng) {
        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );
        if (!response.ok) throw new Error('BigDataCloud request failed');
        const data = await response.json();
        return {
            city: data.city || data.locality || null,
            area: data.locality || null,
            state: data.principalSubdivision || null,
            country: data.countryName || null,
            postcode: data.postcode || null
        };
    }
}

const locationService = new LocationService();

export default function Profile() {
    const { user: authUser, updateUser, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [locating, setLocating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [profile, setProfile] = useState(null);
    const [shops, setShops] = useState([]);
    const [houses, setHouses] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [userShopsForJob, setUserShopsForJob] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Edit dialogs
    const [openEditHouseDialog, setOpenEditHouseDialog] = useState(false);
    const [openEditJobDialog, setOpenEditJobDialog] = useState(false);
    const [editingHouse, setEditingHouse] = useState(null);
    const [editingJob, setEditingJob] = useState(null);
    
    // Location data
    const [cities, setCities] = useState([]);
    const [shopAreas, setShopAreas] = useState([]);
    const [houseAreas, setHouseAreas] = useState([]);
    const [jobAreas, setJobAreas] = useState([]);
    const [shopCategories, setShopCategories] = useState([]);
    const [selectedCategoryItems, setSelectedCategoryItems] = useState([]);
    
    // Dialogs
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openShopDialog, setOpenShopDialog] = useState(false);
    const [openHouseDialog, setOpenHouseDialog] = useState(false);
    const [openJobDialog, setOpenJobDialog] = useState(false);
    
    // Location verification states
    const [shopLocationVerified, setShopLocationVerified] = useState(false);
    const [houseLocationVerified, setHouseLocationVerified] = useState(false);
    const [shopVerifying, setShopVerifying] = useState(false);
    const [houseVerifying, setHouseVerifying] = useState(false);
    
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    
    const [deletePassword, setDeletePassword] = useState('');
    
    const [shopForm, setShopForm] = useState({
        business_name: '',
        category: '',
        additional_phone: '',
        keywords: [],
        custom_keyword: '',
        latitude: '',
        longitude: '',
        area: '',
        city: '',
        state: '',
        description: '',
        opening_time: '',
        closing_time: '',
        shop_image: null,
        shop_image_base64: null,
        shop_image_preview: ''
    });
    
    const [houseForm, setHouseForm] = useState({
        rooms: '',
        halls: '',
        kitchens: '',
        floor: '',
        rent_per_month: '',
        advance_amount: '',
        latitude: '',
        longitude: '',
        area: '',
        city: '',
        state: '',
        description: '',
        is_available: true,
        house_image: null,
        house_image_base64: null,
        house_image_preview: ''
    });
    
    const [jobForm, setJobForm] = useState({
        shop_id: '',
        company_name: '',
        job_title: '',
        salary: '',
        salary_type: 'month',
        qualification: '',
        job_type: 'full_time',
        area: '',
        city: '',
        state: '',
        latitude: '',
        longitude: '',
        is_open: true
    });
    
    const [formData, setFormData] = useState({
        full_name: '',
        area: '',
        city: '',
        state: ''
    });

    // Load data on mount
    useEffect(() => {
        loadProfile();
        loadCities();
        loadCategories();
        loadUserShopsForJob();
    }, []);

    // Load areas when city changes for shop and house
    useEffect(() => {
        if (shopForm.city) loadAreasFor(shopForm.city, setShopAreas);
        else setShopAreas([]);
    }, [shopForm.city]);

    useEffect(() => {
        if (houseForm.city) loadAreasFor(houseForm.city, setHouseAreas);
        else setHouseAreas([]);
    }, [houseForm.city]);

    useEffect(() => {
        if (shopForm.category) {
            const cat = shopCategories.find(c => c.name === shopForm.category);
            setSelectedCategoryItems(cat?.key_items || []);
        } else {
            setSelectedCategoryItems([]);
        }
    }, [shopForm.category, shopCategories]);

    // Handle shop selection for job
    const handleShopSelection = (shopId) => {
        const selectedShop = userShopsForJob.find(shop => shop.id === shopId);
        if (selectedShop) {
            setJobForm(prev => ({
                ...prev,
                shop_id: shopId,
                company_name: selectedShop.business_name,
                area: selectedShop.area || '',
                city: selectedShop.city || '',
                state: selectedShop.state || ''
            }));
        } else {
            setJobForm(prev => ({
                ...prev,
                shop_id: '',
                company_name: '',
                area: '',
                city: '',
                state: ''
            }));
        }
    };

    // Data loading functions
    const loadProfile = async () => {
        setLoading(true);
        try {
            const result = await getProfile();
            setProfile(result.user);
            setShops(result.shops || []);
            setHouses(result.houses || []);
            setJobs(result.jobs || []);
            setFormData({
                full_name: result.user.full_name || '',
                area: result.user.area || '',
                city: result.user.city || '',
                state: result.user.state || ''
            });
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const loadCities = async () => {
        try {
            const result = await getAllCities();
            setCities(result.cities || []);
        } catch (err) {
            console.error('Error loading cities:', err);
        }
    };

    const loadAreasFor = async (cityName, setter) => {
        try {
            const result = await getAreasByCity(cityName);
            setter(result.areas || []);
        } catch (err) {
            console.error('Error loading areas:', err);
            setter([]);
        }
    };

    const loadCategories = async () => {
        try {
            const result = await getShopCategories();
            setShopCategories(result?.categories?.length ? result.categories : []);
        } catch (err) {
            console.error('Error loading categories:', err);
            setShopCategories([]);
        }
    };

    const loadUserShopsForJob = async () => {
        try {
            const result = await getUserShopsForJob();
            setUserShopsForJob(result.shops || []);
        } catch (err) {
            console.error('Error loading shops for job:', err);
            setUserShopsForJob([]);
        }
    };

    // Utility functions
    const convertToBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(err);
        });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    const formatTime = (time) => {
        if (!time) return 'Not set';
        return time.slice(0, 5);
    };

    // Location verification functions
    const verifyShopLocation = async () => {
        if (!shopForm.city || !shopForm.area) {
            setError('Please select city and area first');
            return false;
        }
        if (!shopForm.latitude || !shopForm.longitude) {
            setError('Please get current location first');
            return false;
        }
        
        setShopVerifying(true);
        try {
            const verification = await verifyLocation(
                shopForm.latitude, shopForm.longitude, shopForm.city, shopForm.area
            );
            if (verification.verified) {
                setShopLocationVerified(true);
                setError('');
                return true;
            } else {
                setShopLocationVerified(false);
                setError(`Location verification failed: ${verification.message}`);
                return false;
            }
        } catch (err) {
            setError('Failed to verify location');
            return false;
        } finally {
            setShopVerifying(false);
        }
    };

    const verifyHouseLocation = async () => {
        if (!houseForm.city || !houseForm.area) {
            setError('Please select city and area first');
            return false;
        }
        if (!houseForm.latitude || !houseForm.longitude) {
            setError('Please get current location first');
            return false;
        }
        
        setHouseVerifying(true);
        try {
            const verification = await verifyLocation(
                houseForm.latitude, houseForm.longitude, houseForm.city, houseForm.area
            );
            if (verification.verified) {
                setHouseLocationVerified(true);
                setError('');
                return true;
            } else {
                setHouseLocationVerified(false);
                setError(`Location verification failed: ${verification.message}`);
                return false;
            }
        } catch (err) {
            setError('Failed to verify location');
            return false;
        } finally {
            setHouseVerifying(false);
        }
    };

    // Get current location
    const getCurrentLocation = (setter) => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setError('');
        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                try {
                    const locationInfo = await locationService.reverseGeocode(lat, lng);

                    if (locationInfo && (locationInfo.city || locationInfo.area)) {
                        const matchedCity = cities.find(
                            c => c.name.toLowerCase() === (locationInfo.city || '').toLowerCase()
                        );

                        setter(prev => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                            city: matchedCity ? matchedCity.name : (locationInfo.city || ''),
                            area: locationInfo.area || '',
                            state: locationInfo.state || prev.state || ''
                        }));

                        setSuccess(
                            `Location detected: ${locationInfo.area ? locationInfo.area + ', ' : ''}${locationInfo.city || 'Location found'}`
                        );

                        if (!matchedCity && locationInfo.city) {
                            setTimeout(() => {
                                setError(`Note: "${locationInfo.city}" may not be in our city list. You can select it manually.`);
                            }, 3000);
                        }
                    } else {
                        setter(prev => ({ ...prev, latitude: lat, longitude: lng }));
                        setError('Could not detect city/area automatically. Please select from the dropdown.');
                    }
                } catch (err) {
                    console.error('Geocoding error:', err);
                    setter(prev => ({ ...prev, latitude: lat, longitude: lng }));
                    setError('Could not get location details. Please select city/area manually.');
                } finally {
                    setLocating(false);
                }
            },
            (geoError) => {
                setLocating(false);
                const messages = {
                    [geoError.PERMISSION_DENIED]: 'Location permission denied. Please allow access.',
                    [geoError.POSITION_UNAVAILABLE]: 'Location information is currently unavailable.',
                    [geoError.TIMEOUT]: 'Location request timed out. Please try again.'
                };
                setError(messages[geoError.code] || 'Unable to get your location.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Image handlers
    const handleShopImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const base64 = await convertToBase64(file);
        setShopForm(prev => ({
            ...prev,
            shop_image: file,
            shop_image_base64: base64,
            shop_image_preview: URL.createObjectURL(file)
        }));
    };

    const handleHouseImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const base64 = await convertToBase64(file);
        setHouseForm(prev => ({
            ...prev,
            house_image: file,
            house_image_base64: base64,
            house_image_preview: URL.createObjectURL(file)
        }));
    };

    // Keyword handlers
    const handleAddCustomKeyword = () => {
        const kw = shopForm.custom_keyword.trim();
        if (!kw) return;
        if (shopForm.keywords.some(k => k.toLowerCase() === kw.toLowerCase())) {
            setError('Keyword already added');
            setTimeout(() => setError(''), 3000);
            return;
        }
        setShopForm(prev => ({ ...prev, keywords: [...prev.keywords, kw], custom_keyword: '' }));
    };

    const handleRemoveKeyword = (keywordToRemove) => {
        setShopForm(prev => ({
            ...prev,
            keywords: prev.keywords.filter(k => k !== keywordToRemove)
        }));
    };

    // Profile handlers
    const handleEdit = () => { setEditMode(true); setError(''); setSuccess(''); };
    const handleCancel = () => {
        setEditMode(false);
        setFormData({
            full_name: profile?.full_name || '',
            area: profile?.area || '',
            city: profile?.city || '',
            state: profile?.state || ''
        });
        setError('');
    };

    const handleSave = async () => {
        if (!formData.full_name.trim()) { setError('Full name is required'); return; }
        setSaving(true);
        try {
            const result = await updateProfile(formData);
            setProfile(result.user);
            updateUser(result.user);
            setSuccess('Profile updated successfully');
            setEditMode(false);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    // Password handlers
    const handleChangePassword = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) {
            setError('New passwords do not match');
            return;
        }
        if (passwordData.new_password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        try {
            await changePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            setSuccess('Password changed successfully');
            setOpenPasswordDialog(false);
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount(deletePassword);
            setSuccess('Account deleted successfully');
            setTimeout(() => logout(), 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    // House update handlers
    const handleOpenEditHouseDialog = (house) => {
        setEditingHouse(house);
        setHouseForm({
            rooms: house.rooms,
            halls: house.halls,
            kitchens: house.kitchens,
            floor: house.floor,
            rent_per_month: house.rent_per_month,
            advance_amount: house.advance_amount || '',
            latitude: house.latitude || '',
            longitude: house.longitude || '',
            area: house.area || '',
            city: house.city || '',
            state: house.state || '',
            description: house.description || '',
            is_available: house.is_available,
            house_image: null,
            house_image_base64: null,
            house_image_preview: ''
        });
        setOpenEditHouseDialog(true);
    };

    const handleUpdateHouse = async () => {
        try {
            const updateData = {
                rooms: parseInt(houseForm.rooms),
                halls: parseInt(houseForm.halls),
                kitchens: parseInt(houseForm.kitchens),
                floor: parseInt(houseForm.floor),
                rent_per_month: parseFloat(houseForm.rent_per_month),
                advance_amount: houseForm.advance_amount ? parseFloat(houseForm.advance_amount) : null,
                area: houseForm.area,
                city: houseForm.city,
                state: houseForm.state,
                description: houseForm.description,
                is_available: houseForm.is_available,
                house_image_base64: houseForm.house_image_base64 || null
            };
            
            await updateHouse(editingHouse.id, updateData);
            setSuccess('House updated successfully');
            setOpenEditHouseDialog(false);
            loadProfile();
        } catch (err) {
            setError(err.message);
        }
    };

    // Job update handlers
    const handleOpenEditJobDialog = (job) => {
        setEditingJob(job);
        setJobForm({
            shop_id: job.shop_id || '',
            company_name: job.company_name,
            job_title: job.job_title,
            salary: job.salary,
            salary_type: job.salary_type,
            qualification: job.qualification || '',
            job_type: job.job_type,
            area: job.area || '',
            city: job.city || '',
            state: job.state || '',
            is_open: job.is_open
        });
        setOpenEditJobDialog(true);
    };

    const handleUpdateJob = async () => {
        try {
            const updateData = {
                job_title: jobForm.job_title,
                company_name: jobForm.company_name,
                salary: parseFloat(jobForm.salary),
                salary_type: jobForm.salary_type,
                qualification: jobForm.qualification,
                job_type: jobForm.job_type,
                area: jobForm.area,
                city: jobForm.city,
                state: jobForm.state,
                is_open: jobForm.is_open
            };
            
            await updateJob(editingJob.id, updateData);
            setSuccess('Job updated successfully');
            setOpenEditJobDialog(false);
            loadProfile();
        } catch (err) {
            setError(err.message);
        }
    };

    // Create Handlers
    const handleCreateShop = async () => {
        if (!shopForm.business_name || !shopForm.category || !shopForm.city || !shopForm.state) {
            setError('Please fill all required fields');
            return;
        }
        if (!shopLocationVerified) {
            const ok = await verifyShopLocation();
            if (!ok) return;
        }
        try {
            const result = await createShop({
                business_name: shopForm.business_name,
                category: shopForm.category,
                additional_phone: shopForm.additional_phone,
                keywords: shopForm.keywords,
                latitude: parseFloat(shopForm.latitude),
                longitude: parseFloat(shopForm.longitude),
                area: shopForm.area,
                city: shopForm.city,
                state: shopForm.state,
                description: shopForm.description,
                opening_time: shopForm.opening_time,
                closing_time: shopForm.closing_time,
                shop_image_base64: shopForm.shop_image_base64 || null
            });
            if (result.success) {
                setSuccess('Shop created successfully');
                setOpenShopDialog(false);
                loadProfile();
                loadUserShopsForJob();
                setShopForm({
                    business_name: '', category: '', additional_phone: '',
                    keywords: [], custom_keyword: '', latitude: '', longitude: '',
                    area: '', city: '', state: '', description: '', opening_time: '', closing_time: '',
                    shop_image: null, shop_image_base64: null, shop_image_preview: ''
                });
                setShopLocationVerified(false);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateHouse = async () => {
        if (!houseForm.rooms || !houseForm.halls || !houseForm.kitchens || !houseForm.floor || !houseForm.rent_per_month) {
            setError('Please fill all required fields');
            return;
        }
        if (!houseLocationVerified) {
            const ok = await verifyHouseLocation();
            if (!ok) return;
        }
        try {
            const result = await createHouse({
                rooms: parseInt(houseForm.rooms),
                halls: parseInt(houseForm.halls),
                kitchens: parseInt(houseForm.kitchens),
                floor: parseInt(houseForm.floor),
                rent_per_month: parseFloat(houseForm.rent_per_month),
                advance_amount: houseForm.advance_amount ? parseFloat(houseForm.advance_amount) : null,
                latitude: parseFloat(houseForm.latitude),
                longitude: parseFloat(houseForm.longitude),
                area: houseForm.area,
                city: houseForm.city,
                state: houseForm.state,
                description: houseForm.description,
                is_available: houseForm.is_available,
                house_image_base64: houseForm.house_image_base64 || null
            });
            if (result.success) {
                setSuccess('House created successfully');
                setOpenHouseDialog(false);
                loadProfile();
                setHouseForm({
                    rooms: '', halls: '', kitchens: '', floor: '',
                    rent_per_month: '', advance_amount: '',
                    latitude: '', longitude: '', area: '', city: '', state: '',
                    description: '', is_available: true,
                    house_image: null, house_image_base64: null, house_image_preview: ''
                });
                setHouseLocationVerified(false);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateJob = async () => {
        if (!jobForm.company_name || !jobForm.job_title || !jobForm.salary || !jobForm.city || !jobForm.state) {
            setError('Please fill all required fields');
            return;
        }
        
        try {
            const result = await createJob({
                shop_id: jobForm.shop_id || null,
                company_name: jobForm.company_name,
                job_title: jobForm.job_title,
                salary: parseFloat(jobForm.salary),
                salary_type: jobForm.salary_type,
                qualification: jobForm.qualification,
                job_type: jobForm.job_type,
                area: jobForm.area,
                city: jobForm.city,
                state: jobForm.state,
                latitude: null,
                longitude: null,
                is_open: jobForm.is_open
            });
            if (result.success) {
                setSuccess('Job posted successfully');
                setOpenJobDialog(false);
                loadProfile();
                setJobForm({
                    shop_id: '',
                    company_name: '', job_title: '', salary: '',
                    salary_type: 'month', qualification: '', job_type: 'full_time',
                    area: '', city: '', state: '', latitude: '', longitude: '',
                    is_open: true
                });
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const GetLocationButton = ({ setter }) => (
        <Button
            variant="outlined"
            startIcon={locating ? <CircularProgress size={16} /> : <MyLocationIcon />}
            onClick={() => getCurrentLocation(setter)}
            disabled={locating}
            fullWidth
            sx={{ borderColor: '#325fec', color: '#325fec' }}
        >
            {locating ? 'Detecting Location…' : 'Get Current Location'}
        </Button>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ color: '#325fec' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
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

            {/* Profile Header */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e8ecef', boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: '#e8f0fe', color: '#325fec', fontSize: '2rem', fontWeight: 600 }}>
                            {profile?.full_name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                            {editMode ? (
                                <>
                                    <TextField name="full_name" value={formData.full_name} onChange={handleChange} size="small" sx={{ mb: 1, width: '100%' }} />
                                    <Typography variant="body2" color="#5a6e8a">{profile?.phone}</Typography>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h5" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>
                                        {profile?.full_name}
                                    </Typography>
                                    <Typography variant="body2" color="#5a6e8a">{profile?.phone}</Typography>
                                </>
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {editMode ? (
                            <>
                                <Button variant="outlined" onClick={handleCancel} startIcon={<CancelIcon />}>Cancel</Button>
                                <Button variant="contained" onClick={handleSave} startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} sx={{ bgcolor: '#325fec' }}>Save</Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outlined" onClick={handleEdit} startIcon={<EditIcon />} sx={{ borderColor: '#325fec', color: '#325fec' }}>Edit Profile</Button>
                                <Button variant="outlined" onClick={() => setOpenPasswordDialog(true)} startIcon={<LockIcon />} sx={{ borderColor: '#325fec', color: '#325fec' }}>Change Password</Button>
                                <Button variant="outlined" color="error" onClick={() => setOpenDeleteDialog(true)} startIcon={<WarningIcon />}>Delete Account</Button>
                            </>
                        )}
                    </Box>
                </Box>
                
                {!editMode && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                        <Chip icon={<LocationOnIcon />} label={`${profile?.area ? profile.area + ', ' : ''}${profile?.city}, ${profile?.state}`} size="small" />
                        <Chip label={profile?.role} size="small" sx={{ bgcolor: '#e8f0fe', color: '#325fec' }} />
                    </Box>
                )}
            </Paper>

            {/* Add Business Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e8ecef', boxShadow: 'none' }}>
                <Typography variant="h6" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600, mb: 2 }}>Add Business</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button variant="contained" startIcon={<StoreIcon />} onClick={() => setOpenShopDialog(true)} sx={{ bgcolor: '#325fec' }}>Add Shop</Button>
                    <Button variant="contained" startIcon={<HomeIcon />} onClick={() => setOpenHouseDialog(true)} sx={{ bgcolor: '#10b981' }}>Add House</Button>
                    <Button variant="contained" startIcon={<WorkIcon />} onClick={() => setOpenJobDialog(true)} sx={{ bgcolor: '#8b5cf6' }}>Post Job</Button>
                </Stack>
            </Paper>

            {/* Tabs with Edit Options */}
            <Paper sx={{ borderRadius: 2, border: '1px solid #e8ecef', boxShadow: 'none' }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: '1px solid #e8ecef', px: 2 }}>
                    <Tab label={`Shops (${shops.length})`} icon={<StoreIcon />} iconPosition="start" />
                    <Tab label={`Houses (${houses.length})`} icon={<HomeIcon />} iconPosition="start" />
                    <Tab label={`Jobs (${jobs.length})`} icon={<WorkIcon />} iconPosition="start" />
                </Tabs>

                {/* Shops Tab */}
                {tabValue === 0 && (
                    <Box sx={{ p: 2 }}>
                        {shops.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="#5a6e8a">No shops added yet</Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {shops.map((shop) => (
                                    <Grid item xs={12} sm={6} md={4} key={shop.id}>
                                        <Card sx={{ borderRadius: 2, border: '1px solid #e8ecef', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            {shop.shop_image && (
                                                <Box sx={{ height: 160, overflow: 'hidden' }}>
                                                    <img src={`data:image/jpeg;base64,${shop.shop_image}`} alt={shop.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </Box>
                                            )}
                                            <CardContent>
                                                <Typography variant="h6" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>{shop.business_name}</Typography>
                                                <Typography variant="body2" color="#5a6e8a" sx={{ mb: 0.5 }}>Category: {shop.category}</Typography>
                                                {shop.opening_time && shop.closing_time && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                        <AccessTimeIcon sx={{ fontSize: 12, color: '#9ca3af' }} />
                                                        <Typography variant="caption" color="#5a6e8a">
                                                            {formatTime(shop.opening_time)} - {formatTime(shop.closing_time)}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                <Typography variant="body2" color="#5a6e8a">{shop.area}, {shop.city}</Typography>
                                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                                    {shop.is_verified && (
                                                        <Chip label="Verified" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a' }} />
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                {/* Houses Tab - With Edit Button */}
                {tabValue === 1 && (
                    <Box sx={{ p: 2 }}>
                        {houses.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="#5a6e8a">No houses added yet</Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {houses.map((house) => (
                                    <Grid item xs={12} sm={6} md={4} key={house.id}>
                                        <Card sx={{ borderRadius: 2, border: '1px solid #e8ecef', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            {house.house_image && (
                                                <Box sx={{ height: 160, overflow: 'hidden' }}>
                                                    <img src={`data:image/jpeg;base64,${house.house_image}`} alt="House" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </Box>
                                            )}
                                            <CardContent>
                                                <Typography variant="h6" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>{house.rooms} BHK House</Typography>
                                                <Typography variant="body2" color="#5a6e8a">Rent: {formatPrice(house.rent_per_month)}/month</Typography>
                                                <Typography variant="body2" color="#5a6e8a">{house.area}, {house.city}</Typography>
                                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                                    <Chip 
                                                        label={house.is_available ? 'Available' : 'Booked'} 
                                                        size="small" 
                                                        sx={{ bgcolor: house.is_available ? '#dcfce7' : '#fee2e2', color: house.is_available ? '#16a34a' : '#dc2626' }}
                                                    />
                                                    <Button 
                                                        size="small" 
                                                        startIcon={<EditIcon />}
                                                        onClick={() => handleOpenEditHouseDialog(house)}
                                                        sx={{ textTransform: 'none' }}
                                                    >
                                                        Edit
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                {/* Jobs Tab - With Edit Button */}
                {tabValue === 2 && (
                    <Box sx={{ p: 2 }}>
                        {jobs.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="#5a6e8a">No jobs posted yet</Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {jobs.map((job) => (
                                    <Grid item xs={12} sm={6} md={4} key={job.id}>
                                        <Card sx={{ borderRadius: 2, border: '1px solid #e8ecef', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>{job.job_title}</Typography>
                                                <Typography variant="body2" color="#5a6e8a">
                                                    {job.shop_name || job.company_name}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={600} sx={{ color: '#325fec' }}>
                                                    {formatPrice(job.salary)}/{job.salary_type === 'month' ? 'month' : 'day'}
                                                </Typography>
                                                <Typography variant="caption" color="#9ca3af" sx={{ display: 'block', mt: 1 }}>{job.area}, {job.city}</Typography>
                                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                                    <Chip 
                                                        label={job.is_open ? 'Open' : 'Closed'} 
                                                        size="small" 
                                                        sx={{ bgcolor: job.is_open ? '#dcfce7' : '#fee2e2', color: job.is_open ? '#16a34a' : '#dc2626' }}
                                                    />
                                                    <Chip label={job.job_type === 'full_time' ? 'Full Time' : 'Part Time'} size="small" />
                                                    <Button 
                                                        size="small" 
                                                        startIcon={<EditIcon />}
                                                        onClick={() => handleOpenEditJobDialog(job)}
                                                        sx={{ textTransform: 'none' }}
                                                    >
                                                        Edit
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}
            </Paper>

            {/* Edit House Dialog */}
            <Dialog open={openEditHouseDialog} onClose={() => setOpenEditHouseDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit House</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Rooms" value={houseForm.rooms} onChange={(e) => setHouseForm(p => ({ ...p, rooms: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Halls" value={houseForm.halls} onChange={(e) => setHouseForm(p => ({ ...p, halls: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Kitchens" value={houseForm.kitchens} onChange={(e) => setHouseForm(p => ({ ...p, kitchens: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Floor" value={houseForm.floor} onChange={(e) => setHouseForm(p => ({ ...p, floor: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Rent per Month" value={houseForm.rent_per_month} onChange={(e) => setHouseForm(p => ({ ...p, rent_per_month: e.target.value }))} required InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Advance Amount" value={houseForm.advance_amount} onChange={(e) => setHouseForm(p => ({ ...p, advance_amount: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Description" value={houseForm.description} onChange={(e) => setHouseForm(p => ({ ...p, description: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={houseForm.is_available} onChange={(e) => setHouseForm(p => ({ ...p, is_available: e.target.checked }))} />}
                                label="Available for Rent"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="#6b7280">Location: {houseForm.area}, {houseForm.city}, {houseForm.state}</Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditHouseDialog(false)}>Cancel</Button>
                    <Button onClick={handleUpdateHouse} variant="contained">Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Job Dialog */}
            <Dialog open={openEditJobDialog} onClose={() => setOpenEditJobDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Job</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Job Title" value={jobForm.job_title} onChange={(e) => setJobForm(p => ({ ...p, job_title: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Company Name" value={jobForm.company_name} onChange={(e) => setJobForm(p => ({ ...p, company_name: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth type="number" label="Salary" value={jobForm.salary} onChange={(e) => setJobForm(p => ({ ...p, salary: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Salary Type</InputLabel>
                                <Select value={jobForm.salary_type} onChange={(e) => setJobForm(p => ({ ...p, salary_type: e.target.value }))} label="Salary Type">
                                    <MenuItem value="month">Per Month</MenuItem>
                                    <MenuItem value="day">Per Day</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Job Type</InputLabel>
                                <Select value={jobForm.job_type} onChange={(e) => setJobForm(p => ({ ...p, job_type: e.target.value }))} label="Job Type">
                                    <MenuItem value="full_time">Full Time</MenuItem>
                                    <MenuItem value="part_time">Part Time</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Qualification Required" value={jobForm.qualification} onChange={(e) => setJobForm(p => ({ ...p, qualification: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Area" value={jobForm.area} onChange={(e) => setJobForm(p => ({ ...p, area: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="City" value={jobForm.city} onChange={(e) => setJobForm(p => ({ ...p, city: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="State" value={jobForm.state} onChange={(e) => setJobForm(p => ({ ...p, state: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={jobForm.is_open} onChange={(e) => setJobForm(p => ({ ...p, is_open: e.target.checked }))} />}
                                label="Job Position is Open"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditJobDialog(false)}>Cancel</Button>
                    <Button onClick={handleUpdateJob} variant="contained">Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Add Shop Dialog */}
            <Dialog open={openShopDialog} onClose={() => setOpenShopDialog(false)} maxWidth="md" fullWidth>
                {/* Same as before */}
                <DialogTitle>Add New Shop</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Business Name" value={shopForm.business_name} onChange={(e) => setShopForm(p => ({ ...p, business_name: e.target.value }))} required />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select value={shopForm.category} onChange={(e) => setShopForm(p => ({ ...p, category: e.target.value, keywords: [] }))} label="Category">
                                    {shopCategories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {selectedCategoryItems.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 1, color: '#5a6e8a' }}>Select Key Items</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {selectedCategoryItems.map((item) => (
                                        <Chip
                                            key={item.id}
                                            label={item.item_name}
                                            onClick={() => {
                                                if (!shopForm.keywords.includes(item.item_name)) {
                                                    setShopForm(p => ({ ...p, keywords: [...p.keywords, item.item_name] }));
                                                }
                                            }}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}

                        {shopForm.keywords.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 1, color: '#5a6e8a' }}>Selected Items</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {shopForm.keywords.map((keyword) => (
                                        <Chip key={keyword} label={keyword} onDelete={() => handleRemoveKeyword(keyword)} color="primary" size="small" />
                                    ))}
                                </Box>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField fullWidth label="Add Custom Item" value={shopForm.custom_keyword} onChange={(e) => setShopForm(p => ({ ...p, custom_keyword: e.target.value }))} onKeyPress={(e) => e.key === 'Enter' && handleAddCustomKeyword()} />
                                <Button variant="outlined" onClick={handleAddCustomKeyword}><AddIcon /></Button>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Additional Phone" value={shopForm.additional_phone} onChange={(e) => setShopForm(p => ({ ...p, additional_phone: e.target.value }))} />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Description" value={shopForm.description} onChange={(e) => setShopForm(p => ({ ...p, description: e.target.value }))} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="time" label="Opening Time" value={shopForm.opening_time} onChange={(e) => setShopForm(p => ({ ...p, opening_time: e.target.value }))} InputLabelProps={{ shrink: true }} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="time" label="Closing Time" value={shopForm.closing_time} onChange={(e) => setShopForm(p => ({ ...p, closing_time: e.target.value }))} InputLabelProps={{ shrink: true }} />
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 1 }}>Location Details</Divider></Grid>

                        <Grid item xs={12}>
                            <GetLocationButton setter={setShopForm} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Latitude" value={shopForm.latitude} InputProps={{ readOnly: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Longitude" value={shopForm.longitude} InputProps={{ readOnly: true }} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>City</InputLabel>
                                <Select value={shopForm.city} onChange={(e) => setShopForm(p => ({ ...p, city: e.target.value, area: '' }))} label="City">
                                    {cities.map((city) => <MenuItem key={city.id} value={city.name}>{city.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Area</InputLabel>
                                <Select value={shopForm.area} onChange={(e) => setShopForm(p => ({ ...p, area: e.target.value }))} label="Area" disabled={!shopForm.city}>
                                    {shopAreas.map((area) => <MenuItem key={area.id} value={area.area}>{area.area}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="State" value={shopForm.state} onChange={(e) => setShopForm(p => ({ ...p, state: e.target.value }))} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Button
                                variant="contained"
                                color={shopLocationVerified ? 'success' : 'primary'}
                                startIcon={shopVerifying ? <CircularProgress size={16} /> : <MyLocationIcon />}
                                onClick={verifyShopLocation}
                                disabled={shopVerifying || !shopForm.city || !shopForm.area || !shopForm.latitude}
                                fullWidth
                            >
                                {shopVerifying ? 'Verifying…' : shopLocationVerified ? 'Verified ✓' : 'Verify Location'}
                            </Button>
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 1 }}>Shop Image</Divider></Grid>

                        <Grid item xs={12}>
                            <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} fullWidth>
                                Upload Shop Image
                                <input type="file" hidden accept="image/*" onChange={handleShopImageChange} />
                            </Button>
                            {shopForm.shop_image_preview && (
                                <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                                    <img src={shopForm.shop_image_preview} alt="Preview" style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8 }} />
                                    <IconButton size="small" sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }} onClick={() => setShopForm(p => ({ ...p, shop_image: null, shop_image_base64: null, shop_image_preview: '' }))}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenShopDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateShop} variant="contained" disabled={!shopLocationVerified}>Create Shop</Button>
                </DialogActions>
            </Dialog>

            {/* Add House Dialog */}
            <Dialog open={openHouseDialog} onClose={() => setOpenHouseDialog(false)} maxWidth="md" fullWidth>
                {/* Same as before */}
                <DialogTitle>Add New House</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Rooms" value={houseForm.rooms} onChange={(e) => setHouseForm(p => ({ ...p, rooms: e.target.value }))} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Halls" value={houseForm.halls} onChange={(e) => setHouseForm(p => ({ ...p, halls: e.target.value }))} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Kitchens" value={houseForm.kitchens} onChange={(e) => setHouseForm(p => ({ ...p, kitchens: e.target.value }))} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Floor" value={houseForm.floor} onChange={(e) => setHouseForm(p => ({ ...p, floor: e.target.value }))} required /></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Rent per Month" value={houseForm.rent_per_month} onChange={(e) => setHouseForm(p => ({ ...p, rent_per_month: e.target.value }))} required InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Advance Amount" value={houseForm.advance_amount} onChange={(e) => setHouseForm(p => ({ ...p, advance_amount: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Description" value={houseForm.description} onChange={(e) => setHouseForm(p => ({ ...p, description: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={houseForm.is_available} onChange={(e) => setHouseForm(p => ({ ...p, is_available: e.target.checked }))} />}
                                label="Available for Rent"
                            />
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 1 }}>Location Details</Divider></Grid>

                        <Grid item xs={12}>
                            <GetLocationButton setter={setHouseForm} />
                        </Grid>

                        <Grid item xs={12} sm={6}><TextField fullWidth label="Latitude" value={houseForm.latitude} InputProps={{ readOnly: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Longitude" value={houseForm.longitude} InputProps={{ readOnly: true }} /></Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>City</InputLabel>
                                <Select value={houseForm.city} onChange={(e) => setHouseForm(p => ({ ...p, city: e.target.value, area: '' }))} label="City">
                                    {cities.map((city) => <MenuItem key={city.id} value={city.name}>{city.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Area</InputLabel>
                                <Select value={houseForm.area} onChange={(e) => setHouseForm(p => ({ ...p, area: e.target.value }))} label="Area" disabled={!houseForm.city}>
                                    {houseAreas.map((area) => <MenuItem key={area.id} value={area.area}>{area.area}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}><TextField fullWidth label="State" value={houseForm.state} onChange={(e) => setHouseForm(p => ({ ...p, state: e.target.value }))} /></Grid>

                        <Grid item xs={12} sm={6}>
                            <Button
                                variant="contained"
                                color={houseLocationVerified ? 'success' : 'primary'}
                                startIcon={houseVerifying ? <CircularProgress size={16} /> : <MyLocationIcon />}
                                onClick={verifyHouseLocation}
                                disabled={houseVerifying || !houseForm.city || !houseForm.area || !houseForm.latitude}
                                fullWidth
                            >
                                {houseVerifying ? 'Verifying…' : houseLocationVerified ? 'Verified ✓' : 'Verify Location'}
                            </Button>
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 1 }}>House Image</Divider></Grid>

                        <Grid item xs={12}>
                            <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} fullWidth>
                                Upload House Image
                                <input type="file" hidden accept="image/*" onChange={handleHouseImageChange} />
                            </Button>
                            {houseForm.house_image_preview && (
                                <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                                    <img src={houseForm.house_image_preview} alt="Preview" style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8 }} />
                                    <IconButton size="small" sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }} onClick={() => setHouseForm(p => ({ ...p, house_image: null, house_image_base64: null, house_image_preview: '' }))}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHouseDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateHouse} variant="contained" disabled={!houseLocationVerified}>Create House</Button>
                </DialogActions>
            </Dialog>

            {/* Post Job Dialog */}
            <Dialog open={openJobDialog} onClose={() => setOpenJobDialog(false)} maxWidth="md" fullWidth>
                {/* Same as before */}
                <DialogTitle>Post a Job</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Select Shop (Optional)</InputLabel>
                                <Select
                                    value={jobForm.shop_id}
                                    onChange={(e) => handleShopSelection(e.target.value)}
                                    label="Select Shop (Optional)"
                                >
                                    <MenuItem value="">-- Post as Company (No Shop) --</MenuItem>
                                    {userShopsForJob.map((shop) => (
                                        <MenuItem key={shop.id} value={shop.id}>
                                            {shop.business_name} - {shop.city}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {userShopsForJob.length === 0 && (
                                <Alert severity="info" sx={{ mt: 1 }}>
                                    <AlertTitle>No shops found</AlertTitle>
                                    You need to <Button size="small" onClick={() => { setOpenJobDialog(false); setOpenShopDialog(true); }} sx={{ textTransform: 'none' }}>create a shop</Button> first to link jobs to your shop.
                                </Alert>
                            )}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="Company Name" 
                                value={jobForm.company_name} 
                                onChange={(e) => setJobForm(p => ({ ...p, company_name: e.target.value }))} 
                                required 
                                helperText={jobForm.shop_id ? "Auto-filled from selected shop" : ""}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Job Title" value={jobForm.job_title} onChange={(e) => setJobForm(p => ({ ...p, job_title: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth type="number" label="Salary" value={jobForm.salary} onChange={(e) => setJobForm(p => ({ ...p, salary: e.target.value }))} required />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Salary Type</InputLabel>
                                <Select value={jobForm.salary_type} onChange={(e) => setJobForm(p => ({ ...p, salary_type: e.target.value }))} label="Salary Type">
                                    <MenuItem value="month">Per Month</MenuItem>
                                    <MenuItem value="day">Per Day</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Job Type</InputLabel>
                                <Select value={jobForm.job_type} onChange={(e) => setJobForm(p => ({ ...p, job_type: e.target.value }))} label="Job Type">
                                    <MenuItem value="full_time">Full Time</MenuItem>
                                    <MenuItem value="part_time">Part Time</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Qualification Required" value={jobForm.qualification} onChange={(e) => setJobForm(p => ({ ...p, qualification: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch checked={jobForm.is_open} onChange={(e) => setJobForm(p => ({ ...p, is_open: e.target.checked }))} />}
                                label="Job Position is Open"
                            />
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 1 }}>Location Details</Divider></Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>City</InputLabel>
                                <Select 
                                    value={jobForm.city} 
                                    onChange={(e) => setJobForm(p => ({ ...p, city: e.target.value, area: '' }))} 
                                    label="City"
                                    disabled={!!jobForm.shop_id}
                                >
                                    {cities.map((city) => <MenuItem key={city.id} value={city.name}>{city.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Area</InputLabel>
                                <Select 
                                    value={jobForm.area} 
                                    onChange={(e) => setJobForm(p => ({ ...p, area: e.target.value }))} 
                                    label="Area" 
                                    disabled={!jobForm.city || !!jobForm.shop_id}
                                >
                                    {jobAreas.map((area) => <MenuItem key={area.id} value={area.area}>{area.area}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="State" 
                                value={jobForm.state} 
                                onChange={(e) => setJobForm(p => ({ ...p, state: e.target.value }))} 
                                disabled={!!jobForm.shop_id}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenJobDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateJob} variant="contained">Post Job</Button>
                </DialogActions>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Current Password" type="password" value={passwordData.current_password} onChange={(e) => setPasswordData(p => ({ ...p, current_password: e.target.value }))} margin="normal" />
                    <TextField fullWidth label="New Password" type="password" value={passwordData.new_password} onChange={(e) => setPasswordData(p => ({ ...p, new_password: e.target.value }))} margin="normal" />
                    <TextField fullWidth label="Confirm New Password" type="password" value={passwordData.confirm_password} onChange={(e) => setPasswordData(p => ({ ...p, confirm_password: e.target.value }))} margin="normal" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
                    <Button onClick={handleChangePassword} variant="contained">Change Password</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogContent>
                    <Alert severity="error" sx={{ mb: 2 }}>Warning: This action is irreversible. All your data will be permanently deleted.</Alert>
                    <TextField fullWidth label="Enter your password to confirm" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} margin="normal" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleDeleteAccount} variant="contained" color="error">Delete Account</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}