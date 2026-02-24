import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    CardActionArea,
    Avatar,
    Divider
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Work as WorkIcon,
    AttachMoney as MoneyIcon,
    Business as BusinessIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatSalary, timeAgo } from '../../../utils/formatting';

export default function JobCard({ job, onClick, onSave, isSaved, featured = false }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) onClick();
        else navigate(`/app/user/jobs/${job.id}`);
    };

    const handleSave = (e) => {
        e.stopPropagation();
        if (onSave) onSave(job.id);
    };

    return (
        <Card 
            sx={{ 
                borderRadius: 3,
                position: 'relative',
                border: featured ? '2px solid #C00C0C' : 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }
            }}
        >
            {featured && (
                <Chip
                    label="Featured"
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: '#C00C0C',
                        color: 'white',
                        zIndex: 1
                    }}
                />
            )}

            <CardActionArea onClick={handleClick}>
                <CardContent>
                    {/* Header */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: '#f0f0f0' }}>
                            {job.business?.logo ? (
                                <img src={job.business.logo} alt={job.business.name} />
                            ) : (
                                <BusinessIcon />
                            )}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {job.title}
                            </Typography>
                            <Typography variant="body2" color="#666">
                                {job.business?.name}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Details */}
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <WorkIcon sx={{ fontSize: 16, color: '#999' }} />
                                <Typography variant="caption">
                                    {job.jobType?.replace('_', ' ')}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <MoneyIcon sx={{ fontSize: 16, color: '#999' }} />
                                <Typography variant="caption">
                                    {formatSalary(job)}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationIcon sx={{ fontSize: 16, color: '#999' }} />
                                <Typography variant="caption">
                                    {job.business?.city}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeIcon sx={{ fontSize: 16, color: '#999' }} />
                                <Typography variant="caption">
                                    {timeAgo(job.createdAt)}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Skills/Tags */}
                    {job.skillsRequired?.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                            {job.skillsRequired.slice(0, 3).map((skill) => (
                                <Chip key={skill} label={skill} size="small" variant="outlined" />
                            ))}
                            {job.skillsRequired.length > 3 && (
                                <Chip label={`+${job.skillsRequired.length - 3}`} size="small" variant="outlined" />
                            )}
                        </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Footer */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            {job.isUrgent && (
                                <Chip label="Urgent" size="small" color="error" sx={{ mr: 1 }} />
                            )}
                            {job.isRemote && (
                                <Chip label="Remote" size="small" color="info" />
                            )}
                        </Box>
                        <Button
                            size="small"
                            variant={job.hasApplied ? "outlined" : "contained"}
                            disabled={job.hasApplied}
                            sx={{
                                bgcolor: job.hasApplied ? 'transparent' : '#C00C0C',
                                '&:hover': { bgcolor: job.hasApplied ? 'transparent' : '#8A0909' }
                            }}
                        >
                            {job.hasApplied ? 'Applied' : 'Apply'}
                        </Button>
                    </Box>
                </CardContent>
            </CardActionArea>

            {/* Save Button */}
            <IconButton
                size="small"
                onClick={handleSave}
                sx={{ position: 'absolute', bottom: 8, right: 8 }}
            >
                {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
        </Card>
    );
}