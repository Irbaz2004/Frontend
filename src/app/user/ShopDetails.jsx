import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Chip, Avatar, Button,
    Skeleton, Divider, IconButton, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedIcon from '@mui/icons-material/Verified';
import PhoneIcon from '@mui/icons-material/Phone';
import DirectionsIcon from '@mui/icons-material/Directions';
import ShareIcon from '@mui/icons-material/Share';
import gsap from 'gsap';
import { getShopDetails } from '../../services/shops';
import { getNearbyJobs, applyJob } from '../../services/jobs';

function ShopDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const headerRef = useRef(null);
    const cardRef = useRef(null);
    const jobsRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [shopData, jobsData] = await Promise.all([
                    getShopDetails(id),
                    getNearbyJobs(null, null),
                ]);
                setShop(shopData);
                setJobs((jobsData || []).filter(j => j.shopId === id));

                // Animation after data is loaded
                setTimeout(() => {
                    gsap.from(".shop-animate", {
                        y: 30,
                        opacity: 0,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: "power2.out"
                    });
                }, 100);

            } catch (err) {
                console.error(err);
                setShop(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleCall = () => {
        if (shop?.phone) window.open(`tel:${shop.phone}`);
    };

    const handleDirections = () => {
        if (shop) {
            const query = encodeURIComponent(`${shop.shopName} ${shop.street} ${shop.area} ${shop.city}`);
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`);
        }
    };

    if (loading) return (
        <Box sx={{ p: 3, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            <Skeleton variant="rounded" height={220} sx={{ mb: 3, borderRadius: '24px' }} />
            <Skeleton variant="rounded" height={100} sx={{ mb: 3, borderRadius: '20px' }} />
            <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={80} sx={{ mb: 2, borderRadius: '16px' }} />
            <Skeleton variant="rounded" height={80} sx={{ mb: 2, borderRadius: '16px' }} />
        </Box>
    );

    if (!shop) return (
        <Box sx={{ p: 4, textAlign: 'center', pt: 12, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', color: '#666' }}>Shop not found</Typography>
            <Button
                onClick={() => navigate(-1)}
                variant="outlined"
                sx={{ mt: 3, borderRadius: '12px', borderColor: '#C00C0C', color: '#C00C0C' }}
            >
                Return to Search
            </Button>
        </Box>
    );

    return (
        <Box sx={{ pb: 6, bgcolor: '#F8F8F8', minHeight: '100vh' }}>
            {/* Header / Cover Area */}
            <Box sx={{
                background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
                p: 3, pt: 4, pb: 8,
                position: 'relative',
                borderRadius: '0 0 40px 40px',
                boxShadow: '0 10px 30px rgba(192,12,12,0.15)'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.15)' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <IconButton sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.15)' }}>
                        <ShareIcon />
                    </IconButton>
                </Box>

                <Box className="shop-animate" sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Avatar sx={{
                        width: 72, height: 72,
                        bgcolor: 'white', color: '#C00C0C',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                        border: '3px solid rgba(255,255,255,0.3)',
                        fontSize: '2rem', fontWeight: 900, fontFamily: '"Outfit", sans-serif'
                    }}>
                        {shop.shopName?.[0]}
                    </Avatar>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
                                {shop.shopName}
                            </Typography>
                            {shop.isVerified && <VerifiedIcon sx={{ color: '#fff', fontSize: 24 }} />}
                        </Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>
                            {shop.category} • {shop.city}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ p: 3, mt: -5 }}>
                {/* Action Buttons */}
                <Stack direction="row" spacing={2} sx={{ mb: 4 }} className="shop-animate">
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PhoneIcon />}
                        onClick={handleCall}
                        sx={{
                            borderRadius: '16px', py: 2,
                            bgcolor: 'white', color: '#C00C0C',
                            fontFamily: '"Outfit", sans-serif', fontWeight: 800,
                            textTransform: 'none',
                            boxShadow: '0 8px 15px rgba(0,0,0,0.05)',
                            '&:hover': { bgcolor: '#fefefe', transform: 'translateY(-2px)' },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Call Shop
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<DirectionsIcon />}
                        onClick={handleDirections}
                        sx={{
                            borderRadius: '16px', py: 2,
                            bgcolor: '#1a1a1a', color: 'white',
                            fontFamily: '"Outfit", sans-serif', fontWeight: 800,
                            textTransform: 'none',
                            boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
                            '&:hover': { bgcolor: '#333', transform: 'translateY(-2px)' },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Directions
                    </Button>
                </Stack>

                {/* Details Card */}
                <Card className="shop-animate" sx={{
                    borderRadius: '24px', mb: 4,
                    border: '1px solid rgba(0,0,0,0.03)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    bgcolor: 'white'
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, mb: 2, color: '#1a1a1a' }}>
                            Business Information
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                            <LocationOnIcon sx={{ color: '#C00C0C', mt: 0.3 }} />
                            <Box>
                                <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif', color: '#1a1a1a', fontWeight: 600 }}>
                                    {shop.street}, {shop.area}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#888', fontWeight: 500 }}>
                                    {shop.city}, {shop.state}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2, opacity: 0.5 }} />

                        <Typography variant="caption" sx={{ color: '#999', fontWeight: 800, display: 'block', mb: 1, textTransform: 'uppercase' }}>
                            About this Shop
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {shop.keyItems?.map((item, idx) => (
                                <Chip
                                    key={idx}
                                    label={item}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(192,12,12,0.04)',
                                        color: '#C00C0C',
                                        fontFamily: '"Inter", sans-serif',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(192,12,12,0.1)'
                                    }}
                                />
                            )) || <Typography variant="caption" sx={{ color: '#888' }}>No tags provided</Typography>}
                        </Box>
                    </CardContent>
                </Card>

                {/* Jobs Section */}
                <Typography variant="h6" className="shop-animate" sx={{
                    fontFamily: '"Outfit", sans-serif', fontWeight: 900, mb: 2.5,
                    display: 'flex', alignItems: 'center', gap: 1.5, color: '#1a1a1a'
                }}>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: '8px',
                        bgcolor: 'rgba(192,12,12,0.1)', color: '#C00C0C',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <WorkIcon sx={{ fontSize: 18 }} />
                    </Box>
                    Open Vacancies
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {jobs.length === 0 ? (
                        <Box className="shop-animate" sx={{ textAlign: 'center', py: 6, bgcolor: 'white', borderRadius: '24px', border: '1px dashed #ddd' }}>
                            <Typography variant="body2" sx={{ color: '#999', fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>
                                This shop hasn't posted any jobs yet.
                            </Typography>
                        </Box>
                    ) : (
                        jobs.map((job, i) => (
                            <Card
                                key={i}
                                className="shop-animate"
                                sx={{
                                    borderRadius: '20px',
                                    border: '1px solid rgba(0,0,0,0.03)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': { transform: 'scale(1.02)' }
                                }}
                            >
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#1a1a1a' }}>
                                            {job.title}
                                        </Typography>
                                        <Chip
                                            label={job.type || 'Full-time'}
                                            size="small"
                                            sx={{
                                                bgcolor: '#F5F5F5',
                                                color: '#666',
                                                fontWeight: 700,
                                                fontSize: '0.65rem',
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ color: '#888', mt: 0.5, mb: 2, fontSize: '0.85rem' }}>
                                        {job.salary || 'Salary as per work'}
                                    </Typography>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => applyJob(job.id, JSON.parse(localStorage.getItem('nearzo_user') || '{}').id)}
                                        sx={{
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
                                            textTransform: 'none',
                                            fontFamily: '"Outfit", sans-serif',
                                            fontWeight: 800,
                                            py: 1.2
                                        }}
                                    >
                                        Apply Now
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default ShopDetails;
