import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Chip, Skeleton, TextField, InputAdornment, IconButton } from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import BlockIcon from '@mui/icons-material/Block';
import { getAllShops } from '../../services/admin';

function AdminShops() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const data = await getAllShops();
                setShops(data);
            } catch (err) {
                console.error('Failed to fetch shops:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchShops();
    }, []);

    const filtered = shops.filter(s =>
        s.shopName?.toLowerCase().includes(search.toLowerCase()) ||
        s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.includes(search)
    );

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, pt: 1 }}>
                All Shops
            </Typography>
            <TextField fullWidth placeholder="Search by shop name, owner or phone..." value={search}
                onChange={e => setSearch(e.target.value)} size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#C00C0C' }} /></InputAdornment> }}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />

            {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={100} sx={{ mb: 1.5, borderRadius: 3 }} />)
            ) : filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <StoreIcon sx={{ fontSize: 50, opacity: 0.2, mb: 1 }} />
                    <Typography>No shops found</Typography>
                </Box>
            ) : (
                filtered.map((shop, i) => (
                    <Card key={i} sx={{ mb: 1.5, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: '#C00C0C', fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                {shop.shopName?.[0]}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                        {shop.shopName}
                                    </Typography>
                                    {shop.isVerified && <VerifiedIcon sx={{ color: '#C00C0C', fontSize: 16 }} />}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    Owner: {shop.fullName} • {shop.phone}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    {shop.category} • {shop.city}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {!shop.isVerified && <Chip label="Unverified" size="small" variant="outlined" />}
                                {shop.isBlocked && <Chip icon={<BlockIcon />} label="Blocked" size="small" color="error" />}
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
}

export default AdminShops;
