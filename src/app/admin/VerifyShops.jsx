import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Button, Chip, Skeleton } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

function VerifyShops() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: fetch pending shops from admin services
        setTimeout(() => { setShops([]); setLoading(false); }, 800);
    }, []);

    const handleVerify = (shopId, action) => {
        // TODO: call admin service to verify/reject shop
        setShops(prev => prev.filter(s => s.id !== shopId));
    };

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, pt: 1 }}>
                Verify Shops
            </Typography>

            {loading ? (
                [1, 2].map(i => <Skeleton key={i} variant="rounded" height={140} sx={{ mb: 1.5, borderRadius: 3 }} />)
            ) : shops.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <VerifiedIcon sx={{ fontSize: 50, opacity: 0.2, mb: 1 }} />
                    <Typography>No shops pending verification</Typography>
                </Box>
            ) : (
                shops.map((shop, i) => (
                    <Card key={i} sx={{ mb: 1.5, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
                                <Avatar sx={{ bgcolor: '#C00C0C', width: 48, height: 48, fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                    {shop.shopName?.[0]}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                        {shop.shopName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">{shop.category} • {shop.city}</Typography>
                                    <Typography variant="caption" color="text.secondary">Owner: {shop.fullName} • {shop.phone}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" variant="contained" startIcon={<CheckIcon />}
                                    onClick={() => handleVerify(shop.id, 'approve')}
                                    sx={{ borderRadius: 2, background: '#388e3c', textTransform: 'none', fontFamily: '"Outfit", sans-serif', flex: 1 }}>
                                    Approve
                                </Button>
                                <Button size="small" variant="outlined" startIcon={<CloseIcon />}
                                    onClick={() => handleVerify(shop.id, 'reject')}
                                    sx={{ borderRadius: 2, borderColor: '#C00C0C', color: '#C00C0C', textTransform: 'none', fontFamily: '"Outfit", sans-serif', flex: 1 }}>
                                    Reject
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
}

export default VerifyShops;
