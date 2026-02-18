import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Avatar, Card, CardContent, Button,
    Divider, List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import LogoutIcon from '@mui/icons-material/Logout';
import WorkIcon from '@mui/icons-material/Work';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('nearzo_user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('nearzo_role');
        localStorage.removeItem('nearzo_token');
        localStorage.removeItem('nearzo_user');
        navigate('/app/login');
    };

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            {/* Profile Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
                borderRadius: 4, p: 3, mb: 2, textAlign: 'center',
            }}>
                <Avatar sx={{
                    width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)',
                    fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '2rem',
                    mx: 'auto', mb: 1.5,
                }}>
                    {user?.fullName?.[0] || 'U'}
                </Avatar>
                <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#fff' }}>
                    {user?.fullName || 'User'}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                    {user?.city || ''}
                </Typography>
            </Box>

            {/* Info Card */}
            <Card sx={{ borderRadius: 3, mb: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <CardContent>
                    <Typography variant="subtitle2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 1.5, color: '#C00C0C' }}>
                        Personal Info
                    </Typography>
                    <List dense disablePadding>
                        <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}><PhoneIcon sx={{ fontSize: 18, color: '#C00C0C' }} /></ListItemIcon>
                            <ListItemText primary={user?.phone || 'Not set'} primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItem>
                        <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}><LocationOnIcon sx={{ fontSize: 18, color: '#C00C0C' }} /></ListItemIcon>
                            <ListItemText primary={`${user?.area || ''}, ${user?.city || ''}, ${user?.state || ''}`} primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemIcon sx={{ minWidth: 36 }}><WorkIcon sx={{ fontSize: 18, color: '#C00C0C' }} /></ListItemIcon>
                            <ListItemText primary="View Applied Jobs" primaryTypographyProps={{ variant: 'body2', sx: { color: '#C00C0C', cursor: 'pointer' } }}
                                onClick={() => navigate('/app/user/applied-jobs')} />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            {/* Logout */}
            <Button
                fullWidth variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                    borderRadius: 3, py: 1.5, borderColor: '#C00C0C', color: '#C00C0C',
                    fontFamily: '"Outfit", sans-serif', fontWeight: 600, textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(192,12,12,0.05)' },
                }}
            >
                Sign Out
            </Button>
        </Box>
    );
}

export default Profile;
