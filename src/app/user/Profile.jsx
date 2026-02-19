import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Avatar, Card, CardContent, Button,
    List, ListItem, ListItemIcon, Skeleton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import LogoutIcon from '@mui/icons-material/Logout';
import WorkIcon from '@mui/icons-material/Work';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('nearzo_user');
        if (stored) setUser(JSON.parse(stored));

        // Simulating data fetch for loading state
        setTimeout(() => {
            setLoading(false);

            // GSAP Animations
            setTimeout(() => {
                gsap.from(".profile-animate", {
                    y: 30,
                    opacity: 0,
                    duration: 0.7,
                    stagger: 0.15,
                    ease: "power2.out"
                });
            }, 100);
        }, 1000);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('nearzo_role');
        localStorage.removeItem('nearzo_token');
        localStorage.removeItem('nearzo_user');
        navigate('/app/login');
    };

    if (loading) return (
        <Box sx={{ p: 3, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            <Skeleton variant="rounded" height={240} sx={{ mb: 3, borderRadius: '32px' }} />
            <Skeleton variant="rounded" height={200} sx={{ mb: 3, borderRadius: '24px' }} />
            <Skeleton variant="rounded" height={60} sx={{ borderRadius: '18px' }} />
        </Box>
    );

    return (
        <Box sx={{ p: 3, pb: 4, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            {/* Profile Header */}
            <Box className="profile-animate" sx={{
                background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
                borderRadius: '32px',
                p: 4,
                mb: 3,
                textAlign: 'center',
                boxShadow: '0 12px 24px rgba(192,12,12,0.15)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: -30,
                    left: -30,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                }} />

                <Avatar sx={{
                    width: 90,
                    height: 90,
                    bgcolor: 'white',
                    color: '#C00C0C',
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: 900,
                    fontSize: '2.5rem',
                    mx: 'auto',
                    mb: 2,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    border: '4px solid rgba(255,255,255,0.2)'
                }}>
                    {user?.fullName?.[0] || 'U'}
                </Avatar>
                <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, color: '#fff', mb: 0.5 }}>
                    {user?.fullName || 'User'}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>
                    {user?.city || 'Location'}
                </Typography>
            </Box>

            {/* Account Details Card */}
            <Card className="profile-animate" sx={{
                borderRadius: '24px',
                mb: 4,
                border: '1px solid rgba(0,0,0,0.03)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                bgcolor: 'white'
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, mb: 2, color: '#1a1a1a' }}>
                        Account Information
                    </Typography>
                    <List disablePadding>
                        {[
                            { icon: <PhoneIcon />, label: 'Phone', value: user?.phone || 'Not set' },
                            { icon: <LocationOnIcon />, label: 'Address', value: `${user?.area || ''}, ${user?.city || ''}` },
                            { icon: <WorkIcon />, label: 'Member Type', value: 'Job Seeker' },
                        ].map((item, idx) => (
                            <ListItem key={idx} sx={{ px: 0, py: 1.5, borderBottom: idx < 2 ? '1px solid #f5f5f5' : 'none' }}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Box sx={{ color: '#C00C0C', display: 'flex' }}>
                                        {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
                                    </Box>
                                </ListItemIcon>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#999', fontWeight: 600, display: 'block', mb: -0.5 }}>
                                        {item.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, color: '#333' }}>
                                        {item.value}
                                    </Typography>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>

            {/* Logout Section */}
            <Box className="profile-animate" sx={{ px: 1 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                        borderRadius: '18px',
                        py: 2,
                        borderColor: 'rgba(192,12,12,0.2)',
                        color: '#C00C0C',
                        fontFamily: '"Outfit", sans-serif',
                        fontWeight: 800,
                        textTransform: 'none',
                        fontSize: '1rem',
                        bgcolor: 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            bgcolor: '#FFF5F5',
                            borderColor: '#C00C0C',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    Sign Out
                </Button>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: '#aaa', fontWeight: 500 }}>
                    NearZO Hyperlocal v1.0.0
                </Typography>
            </Box>
        </Box>
    );
}

export default Profile;
