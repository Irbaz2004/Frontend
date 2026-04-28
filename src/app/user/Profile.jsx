// app/user/Profile.jsx
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
    Tooltip
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
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { 
    getProfile, 
    updateProfile, 
    changePassword, 
    deleteAccount,
    createShop,
    createHouse,
    createJob
} from '../../services/profile';
import { getAllCities, getAreasByCity, verifyLocation, getShopCategories } from '../../services/location';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user: authUser, updateUser, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [profile, setProfile] = useState(null);
    const [shops, setShops] = useState([]);
    const [houses, setHouses] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Location data
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
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
        house_image: null,
        house_image_base64: null,
        house_image_preview: ''
    });
    
    const [jobForm, setJobForm] = useState({
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
        longitude: ''
    });
    
    const [formData, setFormData] = useState({
        full_name: '',
        area: '',
        city: '',
        state: ''
    });

    useEffect(() => {
        loadProfile();
        loadCities();
        loadCategories();
    }, []);

    useEffect(() => {
        if (shopForm.city) {
            loadAreas(shopForm.city);
        }
    }, [shopForm.city]);

    useEffect(() => {
        if (houseForm.city) {
            loadAreas(houseForm.city);
        }
    }, [houseForm.city]);

    useEffect(() => {
        if (jobForm.city) {
            loadAreas(jobForm.city);
        }
    }, [jobForm.city]);

    useEffect(() => {
        if (shopForm.category) {
            const category = shopCategories.find(c => c.name === shopForm.category);
            if (category && category.key_items) {
                setSelectedCategoryItems(category.key_items);
            } else {
                setSelectedCategoryItems([]);
            }
        }
    }, [shopForm.category, shopCategories]);

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

    const loadAreas = async (cityName) => {
        try {
            const result = await getAreasByCity(cityName);
            setAreas(result.areas || []);
        } catch (err) {
            console.error('Error loading areas:', err);
        }
    };

    const loadCategories = async () => {
        try {
            const result = await getShopCategories();
            if (result && result.categories && result.categories.length > 0) {
                setShopCategories(result.categories);
            } else {
                setShopCategories([]);
            }
        } catch (err) {
            console.error('Error loading categories:', err);
            setShopCategories([]);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

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
                shopForm.latitude, 
                shopForm.longitude, 
                shopForm.city, 
                shopForm.area
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
                houseForm.latitude, 
                houseForm.longitude, 
                houseForm.city, 
                houseForm.area
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

    const getCurrentLocation = async (setter) => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported');
            return;
        }

        setError('');
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                setter(prev => ({ ...prev, latitude: lat, longitude: lng }));
                
                // Reverse geocoding using OpenStreetMap
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                        { headers: { 'User-Agent': 'NearZO-App/1.0' } }
                    );
                    const data = await response.json();
                    
                    if (data.address) {
                        const detectedCity = data.address.city || data.address.town || data.address.village;
                        const detectedArea = data.address.suburb || data.address.neighbourhood || data.address.hamlet;
                        const detectedState = data.address.state;
                        
                        if (detectedCity) {
                            setter(prev => ({ ...prev, city: detectedCity }));
                        }
                        if (detectedArea) {
                            setter(prev => ({ ...prev, area: detectedArea }));
                        }
                        if (detectedState) {
                            setter(prev => ({ ...prev, state: detectedState }));
                        }
                    }
                } catch (err) {
                    console.error('Reverse geocoding error:', err);
                }
            },
            (error) => {
                let errorMessage = 'Unable to get location. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please allow location access.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'Please try again.';
                }
                setError(errorMessage);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleShopImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const base64 = await convertToBase64(file);
            setShopForm({ 
                ...shopForm, 
                shop_image: file, 
                shop_image_base64: base64, 
                shop_image_preview: URL.createObjectURL(file) 
            });
        }
    };

    const handleHouseImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const base64 = await convertToBase64(file);
            setHouseForm({ 
                ...houseForm, 
                house_image: file, 
                house_image_base64: base64, 
                house_image_preview: URL.createObjectURL(file) 
            });
        }
    };

    const handleAddCustomKeyword = () => {
        if (shopForm.custom_keyword.trim()) {
            const exists = shopForm.keywords.some(k => k.toLowerCase() === shopForm.custom_keyword.toLowerCase());
            if (!exists) {
                setShopForm({
                    ...shopForm,
                    keywords: [...shopForm.keywords, shopForm.custom_keyword],
                    custom_keyword: ''
                });
            } else {
                setError('Keyword already added');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const handleRemoveKeyword = (keywordToRemove) => {
        setShopForm({
            ...shopForm,
            keywords: shopForm.keywords.filter(k => k !== keywordToRemove)
        });
    };

    const handleEdit = () => {
        setEditMode(true);
        setError('');
        setSuccess('');
    };

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
        if (!formData.full_name.trim()) {
            setError('Full name is required');
            return;
        }

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
            setTimeout(() => {
                logout();
            }, 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateShop = async () => {
        if (!shopForm.business_name || !shopForm.category || !shopForm.city || !shopForm.state) {
            setError('Please fill all required fields');
            return;
        }
        
        if (!shopLocationVerified) {
            const verified = await verifyShopLocation();
            if (!verified) return;
        }
        
        const payload = {
            business_name: shopForm.business_name,
            category: shopForm.category,
            additional_phone: shopForm.additional_phone,
            keywords: shopForm.keywords,
            latitude: parseFloat(shopForm.latitude),
            longitude: parseFloat(shopForm.longitude),
            area: shopForm.area,
            city: shopForm.city,
            state: shopForm.state,
            shop_image_base64: shopForm.shop_image_base64 || null
        };
        
        try {
            const result = await createShop(payload);
            if (result.success) {
                setSuccess('Shop created successfully');
                setOpenShopDialog(false);
                loadProfile();
                setShopForm({
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
                    shop_image: null,
                    shop_image_base64: null,
                    shop_image_preview: ''
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
            const verified = await verifyHouseLocation();
            if (!verified) return;
        }
        
        const payload = {
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
            house_image_base64: houseForm.house_image_base64 || null
        };
        
        try {
            const result = await createHouse(payload);
            if (result.success) {
                setSuccess('House created successfully');
                setOpenHouseDialog(false);
                loadProfile();
                setHouseForm({
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
                    house_image: null,
                    house_image_base64: null,
                    house_image_preview: ''
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
        
        const payload = {
            company_name: jobForm.company_name,
            job_title: jobForm.job_title,
            salary: parseFloat(jobForm.salary),
            salary_type: jobForm.salary_type,
            qualification: jobForm.qualification,
            job_type: jobForm.job_type,
            area: jobForm.area,
            city: jobForm.city,
            state: jobForm.state,
            latitude: jobForm.latitude ? parseFloat(jobForm.latitude) : null,
            longitude: jobForm.longitude ? parseFloat(jobForm.longitude) : null
        };
        
        try {
            const result = await createJob(payload);
            if (result.success) {
                setSuccess('Job posted successfully');
                setOpenJobDialog(false);
                loadProfile();
                setJobForm({
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
                    longitude: ''
                });
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

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
                                    <TextField
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        size="small"
                                        sx={{ mb: 1, width: '100%' }}
                                    />
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
                                <Button variant="contained" onClick={handleSave} startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />} sx={{ bgcolor: '#325fec', '&:hover': { bgcolor: '#254bbd' } }}>Save</Button>
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
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                    <Button variant="contained" startIcon={<StoreIcon />} onClick={() => setOpenShopDialog(true)} sx={{ bgcolor: '#325fec', '&:hover': { bgcolor: '#254bbd' } }}>Add Shop</Button>
                    <Button variant="contained" startIcon={<HomeIcon />} onClick={() => setOpenHouseDialog(true)} sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>Add House</Button>
                    <Button variant="contained" startIcon={<WorkIcon />} onClick={() => setOpenJobDialog(true)} sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>Post Job</Button>
                </Stack>
            </Paper>

            {/* Tabs */}
            <Paper sx={{ borderRadius: 2, border: '1px solid #e8ecef', boxShadow: 'none' }}>
                <Tabs 
                    value={tabValue} 
                    onChange={(e, v) => setTabValue(v)} 
                    sx={{ borderBottom: '1px solid #e8ecef', px: 2 }}
                    TabIndicatorProps={{ sx: { bgcolor: '#325fec' } }}
                >
                    <Tab label={`Shops (${shops.length})`} icon={<StoreIcon />} iconPosition="start" sx={{ '&.Mui-selected': { color: '#325fec' } }} />
                    <Tab label={`Houses (${houses.length})`} icon={<HomeIcon />} iconPosition="start" sx={{ '&.Mui-selected': { color: '#325fec' } }} />
                    <Tab label={`Jobs (${jobs.length})`} icon={<WorkIcon />} iconPosition="start" sx={{ '&.Mui-selected': { color: '#325fec' } }} />
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
                                                    <img 
                                                        src={`data:image/jpeg;base64,${shop.shop_image}`} 
                                                        alt={shop.business_name} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </Box>
                                            )}
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>{shop.business_name}</Typography>
                                                <Typography variant="body2" color="#5a6e8a">Category: {shop.category}</Typography>
                                                <Typography variant="body2" color="#5a6e8a">{shop.area}, {shop.city}</Typography>
                                                <Typography variant="caption" color="#9ca3af">Added on {new Date(shop.created_at).toLocaleDateString()}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                {/* Houses Tab */}
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
                                                    <img 
                                                        src={`data:image/jpeg;base64,${house.house_image}`} 
                                                        alt="House" 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </Box>
                                            )}
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>{house.rooms} BHK</Typography>
                                                <Typography variant="body2" color="#5a6e8a">Rooms: {house.rooms}, Halls: {house.halls}, Kitchen: {house.kitchens}</Typography>
                                                <Typography variant="body2" color="#5a6e8a">Floor: {house.floor}</Typography>
                                                <Typography variant="body1" fontWeight={600} sx={{ color: '#325fec' }}>₹{house.rent_per_month}/month</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                {/* Jobs Tab */}
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
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" sx={{ fontFamily: '"Alumni Sans", sans-serif', fontWeight: 600 }}>{job.job_title}</Typography>
                                                <Typography variant="body2" color="#5a6e8a">{job.company_name}</Typography>
                                                <Typography variant="body2" fontWeight={600} sx={{ color: '#325fec' }}>₹{job.salary}/{job.salary_type === 'month' ? 'month' : 'day'}</Typography>
                                                <Chip label={job.job_type === 'full_time' ? 'Full Time' : 'Part Time'} size="small" sx={{ mt: 1 }} />
                                                <Typography variant="caption" color="#9ca3af" sx={{ display: 'block', mt: 1 }}>{job.area}, {job.city}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}
            </Paper>

            {/* Add Shop Dialog */}
            <Dialog open={openShopDialog} onClose={() => setOpenShopDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New Shop</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                label="Business Name" 
                                value={shopForm.business_name} 
                                onChange={(e) => setShopForm({ ...shopForm, business_name: e.target.value })} 
                                required 
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select 
                                    value={shopForm.category} 
                                    onChange={(e) => setShopForm({ ...shopForm, category: e.target.value, keywords: [] })} 
                                    label="Category"
                                >
                                    {shopCategories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        {/* Key Items Selection */}
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
                                                    setShopForm({ ...shopForm, keywords: [...shopForm.keywords, item.item_name] });
                                                }
                                            }}
                                            sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#325fec', color: '#fff' } }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}
                        
                        {/* Selected Keywords */}
                        {shopForm.keywords.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 1, color: '#5a6e8a' }}>Selected Items</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {shopForm.keywords.map((keyword) => (
                                        <Chip 
                                            key={keyword} 
                                            label={keyword} 
                                            onDelete={() => handleRemoveKeyword(keyword)} 
                                            color="primary" 
                                            size="small" 
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}
                        
                        {/* Custom Keyword */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField 
                                    fullWidth 
                                    label="Add Custom Item" 
                                    value={shopForm.custom_keyword} 
                                    onChange={(e) => setShopForm({ ...shopForm, custom_keyword: e.target.value })} 
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomKeyword()} 
                                />
                                <Button variant="outlined" onClick={handleAddCustomKeyword}><AddIcon /></Button>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="Additional Phone" 
                                value={shopForm.additional_phone} 
                                onChange={(e) => setShopForm({ ...shopForm, additional_phone: e.target.value })} 
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>Location Details</Divider>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Button 
                                variant="outlined" 
                                startIcon={<MyLocationIcon />} 
                                onClick={() => getCurrentLocation(setShopForm)} 
                                fullWidth
                                sx={{ borderColor: '#325fec', color: '#325fec' }}
                            >
                                Get Current Location
                            </Button>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="Latitude" 
                                value={shopForm.latitude} 
                                onChange={(e) => setShopForm({ ...shopForm, latitude: e.target.value })}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="Longitude" 
                                value={shopForm.longitude} 
                                onChange={(e) => setShopForm({ ...shopForm, longitude: e.target.value })}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>City</InputLabel>
                                <Select 
                                    value={shopForm.city} 
                                    onChange={(e) => setShopForm({ ...shopForm, city: e.target.value, area: '' })} 
                                    label="City"
                                >
                                    {cities.map((city) => (
                                        <MenuItem key={city.id} value={city.name}>{city.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Area</InputLabel>
                                <Select 
                                    value={shopForm.area} 
                                    onChange={(e) => setShopForm({ ...shopForm, area: e.target.value })} 
                                    label="Area" 
                                    disabled={!shopForm.city}
                                >
                                    {areas.map((area) => (
                                        <MenuItem key={area.id} value={area.area}>{area.area}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="State" 
                                value={shopForm.state} 
                                onChange={(e) => setShopForm({ ...shopForm, state: e.target.value })} 
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Button 
                                    variant="contained" 
                                    color={shopLocationVerified ? "success" : "primary"}
                                    startIcon={shopLocationVerified ? <CheckCircleIcon /> : <MyLocationIcon />}
                                    onClick={verifyShopLocation}
                                    disabled={shopVerifying || !shopForm.city || !shopForm.area || !shopForm.latitude}
                                    fullWidth
                                    sx={{ bgcolor: shopLocationVerified ? '#4caf50' : '#325fec', '&:hover': { bgcolor: shopLocationVerified ? '#45a049' : '#254bbd' } }}
                                >
                                    {shopVerifying ? <CircularProgress size={20} /> : shopLocationVerified ? 'Verified ✓' : 'Verify Location'}
                                </Button>
                                {shopLocationVerified && (
                                    <Tooltip title="Location Verified">
                                        <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                    </Tooltip>
                                )}
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>Shop Image</Divider>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} fullWidth sx={{ bgcolor: '#325fec', '&:hover': { bgcolor: '#254bbd' } }}>
                                Upload Shop Image
                                <input type="file" hidden accept="image/*" onChange={handleShopImageChange} />
                            </Button>
                            {shopForm.shop_image_preview && (
                                <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                                    <img src={shopForm.shop_image_preview} alt="Preview" style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8 }} />
                                    <IconButton size="small" sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }} onClick={() => setShopForm({ ...shopForm, shop_image: null, shop_image_base64: null, shop_image_preview: '' })}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenShopDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateShop} variant="contained" disabled={!shopLocationVerified} sx={{ bgcolor: '#325fec', '&:hover': { bgcolor: '#254bbd' } }}>Create Shop</Button>
                </DialogActions>
            </Dialog>

            {/* Add House Dialog */}
            <Dialog open={openHouseDialog} onClose={() => setOpenHouseDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New House</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Rooms" value={houseForm.rooms} onChange={(e) => setHouseForm({ ...houseForm, rooms: e.target.value })} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Halls" value={houseForm.halls} onChange={(e) => setHouseForm({ ...houseForm, halls: e.target.value })} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Kitchens" value={houseForm.kitchens} onChange={(e) => setHouseForm({ ...houseForm, kitchens: e.target.value })} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Floor" value={houseForm.floor} onChange={(e) => setHouseForm({ ...houseForm, floor: e.target.value })} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Rent per Month" value={houseForm.rent_per_month} onChange={(e) => setHouseForm({ ...houseForm, rent_per_month: e.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Advance Amount" value={houseForm.advance_amount} onChange={(e) => setHouseForm({ ...houseForm, advance_amount: e.target.value })} />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>Location Details</Divider>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Button variant="outlined" startIcon={<MyLocationIcon />} onClick={() => getCurrentLocation(setHouseForm)} fullWidth sx={{ borderColor: '#325fec', color: '#325fec' }}>
                                Get Current Location
                            </Button>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Latitude" value={houseForm.latitude} onChange={(e) => setHouseForm({ ...houseForm, latitude: e.target.value })} InputProps={{ readOnly: true }} />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Longitude" value={houseForm.longitude} onChange={(e) => setHouseForm({ ...houseForm, longitude: e.target.value })} InputProps={{ readOnly: true }} />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>City</InputLabel>
                                <Select value={houseForm.city} onChange={(e) => setHouseForm({ ...houseForm, city: e.target.value, area: '' })} label="City">
                                    {cities.map((city) => (
                                        <MenuItem key={city.id} value={city.name}>{city.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Area</InputLabel>
                                <Select value={houseForm.area} onChange={(e) => setHouseForm({ ...houseForm, area: e.target.value })} label="Area" disabled={!houseForm.city}>
                                    {areas.map((area) => (
                                        <MenuItem key={area.id} value={area.area}>{area.area}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="State" value={houseForm.state} onChange={(e) => setHouseForm({ ...houseForm, state: e.target.value })} />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Button 
                                    variant="contained" 
                                    color={houseLocationVerified ? "success" : "primary"}
                                    startIcon={houseLocationVerified ? <CheckCircleIcon /> : <MyLocationIcon />}
                                    onClick={verifyHouseLocation}
                                    disabled={houseVerifying || !houseForm.city || !houseForm.area || !houseForm.latitude}
                                    fullWidth
                                    sx={{ bgcolor: houseLocationVerified ? '#4caf50' : '#325fec', '&:hover': { bgcolor: houseLocationVerified ? '#45a049' : '#254bbd' } }}
                                >
                                    {houseVerifying ? <CircularProgress size={20} /> : houseLocationVerified ? 'Verified ✓' : 'Verify Location'}
                                </Button>
                                {houseLocationVerified && (
                                    <Tooltip title="Location Verified">
                                        <CheckCircleIcon sx={{ color: '#4caf50' }} />
                                    </Tooltip>
                                )}
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>House Image</Divider>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} fullWidth sx={{ bgcolor: '#325fec', '&:hover': { bgcolor: '#254bbd' } }}>
                                Upload House Image
                                <input type="file" hidden accept="image/*" onChange={handleHouseImageChange} />
                            </Button>
                            {houseForm.house_image_preview && (
                                <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                                    <img src={houseForm.house_image_preview} alt="Preview" style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 8 }} />
                                    <IconButton size="small" sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }} onClick={() => setHouseForm({ ...houseForm, house_image: null, house_image_base64: null, house_image_preview: '' })}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHouseDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateHouse} variant="contained" disabled={!houseLocationVerified} sx={{ bgcolor: '#325fec', '&:hover': { bgcolor: '#254bbd' } }}>Create House</Button>
                </DialogActions>
            </Dialog>

            {/* Post Job Dialog */}
            <Dialog open={openJobDialog} onClose={() => setOpenJobDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Post a Job</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Company Name" value={jobForm.company_name} onChange={(e) => setJobForm({ ...jobForm, company_name: e.target.value })} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Job Title" value={jobForm.job_title} onChange={(e) => setJobForm({ ...jobForm, job_title: e.target.value })} required />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth type="number" label="Salary" value={jobForm.salary} onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })} required />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Salary Type</InputLabel>
                                <Select value={jobForm.salary_type} onChange={(e) => setJobForm({ ...jobForm, salary_type: e.target.value })} label="Salary Type">
                                    <MenuItem value="month">Per Month</MenuItem>
                                    <MenuItem value="day">Per Day</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Job Type</InputLabel>
                                <Select value={jobForm.job_type} onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })} label="Job Type">
                                    <MenuItem value="full_time">Full Time</MenuItem>
                                    <MenuItem value="part_time">Part Time</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Qualification Required" value={jobForm.qualification} onChange={(e) => setJobForm({ ...jobForm, qualification: e.target.value })} />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>Location Details</Divider>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Button variant="outlined" startIcon={<MyLocationIcon />} onClick={() => getCurrentLocation(setJobForm)} fullWidth sx={{ borderColor: '#325fec', color: '#325fec' }}>
                                Get Current Location
                            </Button>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Latitude" value={jobForm.latitude} onChange={(e) => setJobForm({ ...jobForm, latitude: e.target.value })} />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Longitude" value={jobForm.longitude} onChange={(e) => setJobForm({ ...jobForm, longitude: e.target.value })} />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>City</InputLabel>
                                <Select value={jobForm.city} onChange={(e) => setJobForm({ ...jobForm, city: e.target.value, area: '' })} label="City">
                                    {cities.map((city) => (
                                        <MenuItem key={city.id} value={city.name}>{city.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Area</InputLabel>
                                <Select value={jobForm.area} onChange={(e) => setJobForm({ ...jobForm, area: e.target.value })} label="Area" disabled={!jobForm.city}>
                                    {areas.map((area) => (
                                        <MenuItem key={area.id} value={area.area}>{area.area}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="State" value={jobForm.state} onChange={(e) => setJobForm({ ...jobForm, state: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenJobDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateJob} variant="contained" sx={{ bgcolor: '#325fec', '&:hover': { bgcolor: '#254bbd' } }}>Post Job</Button>
                </DialogActions>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Current Password" type="password" value={passwordData.current_password} onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} margin="normal" />
                    <TextField fullWidth label="New Password" type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} margin="normal" />
                    <TextField fullWidth label="Confirm New Password" type="password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} margin="normal" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
                    <Button onClick={handleChangePassword} variant="contained" sx={{ bgcolor: '#325fec', '&:hover': { bgcolor: '#254bbd' } }}>Change Password</Button>
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