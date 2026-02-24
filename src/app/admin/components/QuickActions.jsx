import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    Button,
    Box,
    Typography,
    Avatar,
    Skeleton
} from '@mui/material';

export default function QuickActions({
    actions = [],
    loading = false,
    onAction
}) {
    if (loading) {
        return (
            <Card sx={{ borderRadius: 3 }}>
                <CardHeader title="Quick Actions" />
                <CardContent>
                    <Grid container spacing={2}>
                        {Array.from(new Array(4)).map((_, i) => (
                            <Grid item xs={6} key={i}>
                                <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ borderRadius: 3 }}>
            <CardHeader title="Quick Actions" />
            <CardContent>
                <Grid container spacing={2}>
                    {actions.map((action) => (
                        <Grid item xs={6} key={action.key}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => onAction(action.key)}
                                sx={{
                                    p: 2,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 1,
                                    borderColor: '#eee',
                                    color: 'text.primary',
                                    '&:hover': {
                                        borderColor: action.color || '#C00C0C',
                                        bgcolor: `${action.color || '#C00C0C'}08`
                                    }
                                }}
                            >
                                <Avatar 
                                    sx={{ 
                                        width: 40, 
                                        height: 40, 
                                        bgcolor: `${action.color || '#C00C0C'}15`,
                                        color: action.color || '#C00C0C'
                                    }}
                                >
                                    {action.icon}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {action.label}
                                    </Typography>
                                    {action.count !== undefined && (
                                        <Typography variant="caption" color="#666">
                                            {action.count} pending
                                        </Typography>
                                    )}
                                </Box>
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
}