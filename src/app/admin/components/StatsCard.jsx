import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Avatar,
    Chip,
    Skeleton
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

export default function StatsCard({
    title,
    value,
    icon,
    color = '#C00C0C',
    trend,
    trendLabel,
    subValue,
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

    return (
        <Card 
            sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': onClick ? {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                } : {}
            }}
            onClick={onClick}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color, lineHeight: 1.2 }}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </Typography>
                        
                        {trend !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                {trend > 0 ? (
                                    <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50', mr: 0.5 }} />
                                ) : (
                                    <TrendingDownIcon sx={{ fontSize: 16, color: '#f44336', mr: 0.5 }} />
                                )}
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: trend > 0 ? '#4caf50' : '#f44336',
                                        fontWeight: 600 
                                    }}
                                >
                                    {Math.abs(trend)}%
                                </Typography>
                                {trendLabel && (
                                    <Typography variant="caption" sx={{ color: '#999', ml: 1 }}>
                                        {trendLabel}
                                    </Typography>
                                )}
                            </Box>
                        )}
                        
                        {subValue && (
                            <Typography variant="caption" sx={{ color: '#999', mt: 1, display: 'block' }}>
                                {subValue}
                            </Typography>
                        )}
                    </Box>
                    
                    <Avatar 
                        sx={{ 
                            bgcolor: `${color}15`, 
                            color,
                            width: 48,
                            height: 48
                        }}
                    >
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );
}