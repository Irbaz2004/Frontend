import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Avatar, Card, CardContent, Button,
    List, ListItem, ListItemIcon, ListItemText, Chip,
} from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

function ShopProfile() {
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('nearzo_user');
        if (stored) setShop(JSON.parse(stored));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('nearzo_role');
        localStorage.removeItem('nearzo_token');
        localStorage.removeItem('nearzo_user');
        navigate('/app/login');
    };

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Box sx={{
                background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
                borderRadius: 4, p: 3, mb: 2, textAlign: 'center',
            }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', mx: 'auto', mb: 1.5 }}>
                    <StoreIcon sx={{ fontSize: 40, color: '#fff' }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#fff' }}>
                    {shop?.shopName || 'My Shop'}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                    {shop?.shopCategory || ''}
                </Typography>
                {!shop?.isVerified && (
                    <Chip label="Pending Verification" size="small" sx={{ mt: 1, bgcolor: 'rgba(255,152,0,0.2)', color: '#ffb74d' }} />
                )}
            </Box>

            <Card sx={{ borderRadius: 3, mb: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <CardContent>
                    <Typography variant="subtitle2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 1.5, color: '#C00C0C' }}>
                        Shop Info
                    </Typography>
                    <List dense disablePadding>
                        <ListItem disablePadding sx={{ mb: 1 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}><PhoneIcon sx={{ fontSize: 18, color: '#C00C0C' }} /></ListItemIcon>
                            <ListItemText primary={shop?.phone || 'Not set'} primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemIcon sx={{ minWidth: 36 }}><LocationOnIcon sx={{ fontSize: 18, color: '#C00C0C' }} /></ListItemIcon>
                            <ListItemText primary={`${shop?.area || ''}, ${shop?.city || ''}, ${shop?.state || ''}`} primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            <Button fullWidth variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}
                sx={{ borderRadius: 3, py: 1.5, borderColor: '#C00C0C', color: '#C00C0C', fontFamily: '"Outfit", sans-serif', fontWeight: 600, textTransform: 'none' }}>
                Sign Out
            </Button>
        </Box>
    );
}

export default ShopProfile;
