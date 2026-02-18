import React, { useEffect, useState } from 'react';
import {
    Box, Typography, TextField, InputAdornment, Card, CardContent,
    Chip, Avatar, Skeleton, Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StoreIcon from '@mui/icons-material/Store';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';
import { getNearbyShops } from '../../services/shops';

function Shops() {
    const navigate = useNavigate();
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getNearbyShops(null, null);
                setShops(data || []);
            } catch {
                setShops([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = shops.filter(s =>
        s.shopName?.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, pt: 1 }}>
                Nearby Shops
            </Typography>

            <TextField
                fullWidth placeholder="Search shops or categories..."
                value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#C00C0C' }} /></InputAdornment> }}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                size="small"
            />

            {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={100} sx={{ mb: 1.5, borderRadius: 3 }} />)
            ) : filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <StoreIcon sx={{ fontSize: 50, opacity: 0.2, mb: 1 }} />
                    <Typography>No shops found nearby</Typography>
                </Box>
            ) : (
                filtered.map((shop, i) => (
                    <Card
                        key={i}
                        sx={{ mb: 1.5, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer' }}
                        onClick={() => navigate(`/app/user/shops/${shop.id}`)}
                    >
                        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: '#C00C0C', width: 50, height: 50, fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.2rem' }}>
                                {shop.shopName?.[0] || 'S'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                    {shop.shopName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">{shop.category}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                    <Chip icon={<LocationOnIcon sx={{ fontSize: '12px !important' }} />} label={`${shop.distance || '< 1'} km`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                    {shop.isVerified && <Chip label="Verified" size="small" sx={{ bgcolor: 'rgba(76,175,80,0.1)', color: '#4caf50', fontSize: '0.7rem' }} />}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
}

export default Shops;
