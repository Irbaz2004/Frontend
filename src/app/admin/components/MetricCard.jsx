import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    LinearProgress,
    Chip,
    Skeleton
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

export default function MetricCard({
    title,
    value,
    total,
    icon,
    color = '#C00C0C',
    trend,
    trendLabel,
    progress,
    loading = false,
    onClick
}) {
    if (loading) {
        return (
            <Card sx={{ borderRadius: 3, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
                <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" height={40} />
                    <Skeleton variant="text" width="80%" />
                </CardContent>
            </Card>
        );
    }

    const percentage = total ? (value / total) * 100 : 0;

    return (
        <Card 
            sx={{ 
                borderRadius: 3,
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                '&:hover': onClick ? {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                } : {}
            }}
            onClick={onClick}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                            {title}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color, mt: 1 }}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                            {total && (
                                <Typography component="span" variant="body2" sx={{ color: '#999', ml: 1 }}>
                                    / {total.toLocaleString()}
                                </Typography>
                            )}
                        </Typography>
                    </Box>
                    {icon && (
                        <Box sx={{ color, bgcolor: `${color}15`, borderRadius: 2, p: 1 }}>
                            {icon}
                        </Box>
                    )}
                </Box>

                {progress && (
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                                Progress
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {percentage.toFixed(1)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#f0f0f0',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: color
                                }
                            }}
                        />
                    </Box>
                )}

                {trend !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {trend > 0 ? (
                            <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50', mr: 0.5 }} />
                        ) : (
                            <TrendingDownIcon sx={{ fontSize: 16, color: '#f44336', mr: 0.5 }} />
                        )}
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: trend > 0 ? '#4caf50' : '#f44336',
                                fontWeight: 600,
                                mr: 1
                            }}
                        >
                            {Math.abs(trend)}%
                        </Typography>
                        {trendLabel && (
                            <Typography variant="caption" sx={{ color: '#999' }}>
                                {trendLabel}
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}