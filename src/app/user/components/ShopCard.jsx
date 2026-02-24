import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    Rating,
    IconButton,
    CardActionArea
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Share as ShareIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ShopCard({ shop, onClick, onSave, isSaved }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) onClick();
        else navigate(`/app/user/shops/${shop.id}`);
    };

    const handleSave = (e) => {
        e.stopPropagation();
        if (onSave) onSave(shop.id);
    };

    return (
        <Card 
            sx={{ 
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }
            }}
        >
            <CardActionArea onClick={handleClick} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                {/* Image */}
                <CardMedia
                    component="img"
                    height="140"
                    image={shop.image || '/images/shop-placeholder.jpg'}
                    alt={shop.name}
                    sx={{ objectFit: 'cover' }}
                />

                <CardContent sx={{ flex: 1 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                            {shop.name}
                        </Typography>
                        {shop.isVerified && (
                            <Chip label="Verified" size="small" color="success" sx={{ height: 20 }} />
                        )}
                    </Box>

                    {/* Category */}
                    <Chip
                        label={shop.category}
                        size="small"
                        sx={{ mb: 1, bgcolor: '#f0f0f0' }}
                    />

                    {/* Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating value={shop.rating} readOnly size="small" />
                        <Typography variant="caption" color="#666">
                            ({shop.reviewsCount || 0})
                        </Typography>
                    </Box>

                    {/* Distance */}
                    {shop.distance && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <LocationIcon sx={{ fontSize: 16, color: '#999' }} />
                            <Typography variant="caption" color="#666">
                                {shop.distance.text}
                            </Typography>
                        </Box>
                    )}

                    {/* Items/Services Preview */}
                    {shop.items?.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {shop.items.slice(0, 3).map((item, idx) => (
                                <Chip key={idx} label={item} size="small" variant="outlined" />
                            ))}
                            {shop.items.length > 3 && (
                                <Chip label={`+${shop.items.length - 3}`} size="small" variant="outlined" />
                            )}
                        </Box>
                    )}
                </CardContent>
            </CardActionArea>

            {/* Actions */}
            <Box sx={{ p: 1, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${shop.phone}`; }}>
                    <PhoneIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigator.share?.({ title: shop.name, url: window.location.href }); }}>
                    <ShareIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleSave}>
                    {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                </IconButton>
            </Box>
        </Card>
    );
}