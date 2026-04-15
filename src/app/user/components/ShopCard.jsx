import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    IconButton,
    CardActionArea,
    Stack
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Verified as VerifiedIcon,
    Star as StarIcon,
    ArrowForwardIos as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ShopCard({ shop, onClick, onSave, isSaved }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) onClick();
        else navigate(`/app/user/shops/${shop.id}`);
    };

    return (
        <Card
            sx={{
                borderRadius: '32px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.04)',
                bgcolor: 'white',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
                    '& .arrow-icon': { transform: 'translateX(4px)', color: '#1D416B' }
                }
            }}
        >
            <CardActionArea onClick={handleClick}>
                <Box sx={{ position: 'relative' }}>
                    <CardMedia
                        component="img"
                        height="180"
                        image={shop.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400'}
                        alt={shop.name}
                        sx={{ objectFit: 'cover' }}
                    />
                    <Box sx={{
                        position: 'absolute', top: 16, left: 16,
                        bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
                        px: 1.5, py: 0.6, borderRadius: '12px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#1D416B', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                            {shop.category || 'Local Business'}
                        </Typography>
                    </Box>
                    {shop.isVerified && (
                        <Box sx={{
                            position: 'absolute', top: 16, right: 16,
                            bgcolor: '#4CAF50', color: 'white',
                            p: 0.6, borderRadius: '10px', display: 'flex',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}>
                            <VerifiedIcon sx={{ fontSize: 16 }} />
                        </Box>
                    )}
                </Box>

                <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{
                            fontWeight: 900,
                            fontFamily: '"Outfit", sans-serif',
                            color: '#1D416B',
                            lineHeight: 1.2,
                            flex: 1,
                            mr: 1
                        }}>
                            {shop.name}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ bgcolor: '#FFF9C4', px: 1, py: 0.2, borderRadius: '8px' }}>
                            <StarIcon sx={{ fontSize: 14, color: '#FBC02D' }} />
                            <Typography variant="caption" sx={{ fontWeight: 900, color: '#F57F17' }}>{shop.rating || '4.5'}</Typography>
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 2, color: '#666' }}>
                        <LocationIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {shop.distance?.text || 'Nearby'} • {shop.address}
                        </Typography>
                    </Stack>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.03)' }}>
                        <Typography variant="caption" sx={{ color: '#1D416B', fontWeight: 900 }}>
                            VIEW DISCOUNTS
                        </Typography>
                        <ArrowIcon className="arrow-icon" sx={{ fontSize: 14, color: '#ccc', transition: '0.3s' }} />
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}