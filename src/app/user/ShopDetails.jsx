import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Chip, Avatar, Button,
    Skeleton, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedIcon from '@mui/icons-material/Verified';
import { getShopDetails } from '../../services/shops';
import { getNearbyJobs, applyJob } from '../../services/jobs';

function ShopDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [shopData, jobsData] = await Promise.all([
                    getShopDetails(id),
                    getNearbyJobs(null, null),
                ]);
                setShop(shopData);
                setJobs((jobsData || []).filter(j => j.shopId === id));
            } catch {
                setShop(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return (
        <Box sx={{ p: 2 }}>
            <Skeleton variant="rounded" height={200} sx={{ mb: 2, borderRadius: 3 }} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={30} />
        </Box>
    );

    if (!shop) return (
        <Box sx={{ p: 2, textAlign: 'center', pt: 8 }}>
            <Typography color="text.secondary">Shop not found.</Typography>
            <Button onClick={() => navigate(-1)} sx={{ mt: 2, color: '#C00C0C' }}>Go Back</Button>
        </Box>
    );

    return (
        <Box sx={{ pb: 4 }}>
            {/* Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
                p: 3, pt: 5, pb: 6, position: 'relative',
            }}>
                <Button onClick={() => navigate(-1)} sx={{ color: '#fff', mb: 2, p: 0, minWidth: 'auto' }}>
                    <ArrowBackIcon />
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)', fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.8rem' }}>
                        {shop.shopName?.[0]}
                    </Avatar>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: '#fff' }}>
                                {shop.shopName}
                            </Typography>
                            {shop.isVerified && <VerifiedIcon sx={{ color: '#fff', fontSize: 20 }} />}
                        </Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{shop.category}</Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ p: 2, mt: -3 }}>
                <Card sx={{ borderRadius: 3, mb: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocationOnIcon sx={{ color: '#C00C0C', fontSize: 18 }} />
                            <Typography variant="body2">{shop.street}, {shop.area}, {shop.city}</Typography>
                        </Box>
                        {shop.keyItems?.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                {shop.keyItems.map(item => (
                                    <Chip key={item} label={item} size="small" sx={{ bgcolor: 'rgba(192,12,12,0.08)', color: '#C00C0C' }} />
                                ))}
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Jobs from this shop */}
                <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon sx={{ color: '#C00C0C', fontSize: 20 }} /> Open Positions
                </Typography>
                {jobs.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        No open positions right now
                    </Typography>
                ) : (
                    jobs.map((job, i) => (
                        <Card key={i} sx={{ mb: 1.5, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent>
                                <Typography variant="subtitle1" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                    {job.title}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                    <Chip label={job.type || 'Full-time'} size="small" sx={{ bgcolor: 'rgba(192,12,12,0.08)', color: '#C00C0C', fontSize: '0.7rem' }} />
                                </Box>
                                <Button size="small" variant="contained" sx={{ mt: 1, borderRadius: 2, background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)', textTransform: 'none', fontFamily: '"Outfit", sans-serif' }}
                                    onClick={() => applyJob(job.id, JSON.parse(localStorage.getItem('nearzo_user') || '{}').id)}>
                                    Apply Now
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>
        </Box>
    );
}

export default ShopDetails;
