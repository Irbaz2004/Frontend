import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Chip,
    Box,
    Skeleton
} from '@mui/material';
import {
    Person as PersonIcon,
    Store as StoreIcon,
    Church as ChurchIcon,
    Work as WorkIcon,
    Verified as VerifiedIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import { timeAgo } from '../../../utils/formatting';

const activityIcons = {
    user: <PersonIcon />,
    business: <StoreIcon />,
    worship: <ChurchIcon />,
    job: <WorkIcon />,
    verification: <VerifiedIcon />
};

const activityColors = {
    user: '#2196f3',
    business: '#4caf50',
    worship: '#9c27b0',
    job: '#f44336',
    verification: '#ff9800'
};

export default function RecentActivity({
    activities = [],
    loading = false,
    maxItems = 5,
    onItemClick
}) {
    if (loading) {
        return (
            <Card sx={{ borderRadius: 3 }}>
                <CardHeader title="Recent Activity" />
                <CardContent>
                    {Array.from(new Array(3)).map((_, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="text" width="40%" />
                            </Box>
                        </Box>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ borderRadius: 3 }}>
            <CardHeader 
                title="Recent Activity"
                subheader={`${activities.length} new activities`}
            />
            <CardContent sx={{ pt: 0 }}>
                <List>
                    {activities.slice(0, maxItems).map((activity) => (
                        <ListItem
                            key={activity.id}
                            alignItems="flex-start"
                            sx={{
                                px: 0,
                                cursor: onItemClick ? 'pointer' : 'default',
                                '&:hover': onItemClick ? {
                                    bgcolor: '#f8f8f8'
                                } : {}
                            }}
                            onClick={() => onItemClick && onItemClick(activity)}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: `${activityColors[activity.type]}15` }}>
                                    {activityIcons[activity.type]}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {activity.title}
                                        </Typography>
                                        <Chip
                                            label={activity.type}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.7rem',
                                                bgcolor: `${activityColors[activity.type]}15`,
                                                color: activityColors[activity.type]
                                            }}
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Box>
                                        <Typography variant="caption" display="block" color="#666">
                                            {activity.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <ScheduleIcon sx={{ fontSize: 12, color: '#999' }} />
                                            <Typography variant="caption" color="#999">
                                                {timeAgo(activity.timestamp)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
}