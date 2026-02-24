import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Rating,
    Avatar,
    Button,
    CardActionArea
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    AttachMoney as MoneyIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function DoctorCard({ doctor, onClick }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) onClick();
        else navigate(`/app/user/doctors/${doctor.id}`);
    };

    return (
        <Card 
            sx={{ 
                borderRadius: 3,
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }
            }}
        >
            <CardActionArea onClick={handleClick}>
                <CardContent>
                    {/* Doctor Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: '#2196f3' }}>
                            {doctor.doctorName?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {doctor.doctorName}
                            </Typography>
                            <Typography variant="body2" color="#666">
                                {doctor.specialization}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Clinic/Hospital */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        {doctor.businessName}
                    </Typography>

                    {/* Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Rating value={doctor.rating} readOnly size="small" />
                        <Typography variant="caption" color="#666">
                            ({doctor.reviewsCount || 0})
                        </Typography>
                    </Box>

                    {/* Details Grid */}
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationIcon sx={{ fontSize: 16, color: '#999' }} />
                                <Typography variant="caption">
                                    {doctor.distance?.text || 'Location'}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <MoneyIcon sx={{ fontSize: 16, color: '#999' }} />
                                <Typography variant="caption">
                                    ₹{doctor.consultationFee}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TimeIcon sx={{ fontSize: 16, color: '#999' }} />
                                <Typography variant="caption">
                                    {doctor.timings || 'Hours not specified'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Next Available (if any) */}
                    {doctor.nextAvailable && (
                        <Chip
                            label={`Next available: ${doctor.nextAvailable}`}
                            size="small"
                            color="success"
                            variant="outlined"
                        />
                    )}

                    {/* Book Button */}
                    <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        sx={{
                            mt: 2,
                            bgcolor: '#2196f3',
                            '&:hover': { bgcolor: '#1976d2' }
                        }}
                    >
                        Book Appointment
                    </Button>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}