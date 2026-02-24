import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Skeleton
} from '@mui/material';
import {
    MoreVert as MoreIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import {
    Line,
    Bar,
    Pie,
    Doughnut
} from 'react-chartjs-2';

const chartComponents = {
    line: Line,
    bar: Bar,
    pie: Pie,
    doughnut: Doughnut
};

export default function ChartCard({
    title,
    subtitle,
    data,
    options = {},
    type = 'line',
    height = 300,
    loading = false,
    onRefresh,
    onDownload,
    actions = []
}) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const ChartComponent = chartComponents[type] || Line;

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action) => {
        if (action.handler) action.handler();
        handleMenuClose();
    };

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { boxWidth: 12 }
            }
        }
    };

    return (
        <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardHeader
                title={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {title}
                    </Typography>
                }
                subheader={subtitle}
                action={
                    <Box>
                        {onRefresh && (
                            <IconButton onClick={onRefresh} size="small">
                                <RefreshIcon />
                            </IconButton>
                        )}
                        {(actions.length > 0 || onDownload) && (
                            <>
                                <IconButton onClick={handleMenuOpen} size="small">
                                    <MoreIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    {onDownload && (
                                        <MenuItem onClick={onDownload}>
                                            <DownloadIcon sx={{ mr: 1, fontSize: 20 }} />
                                            Download
                                        </MenuItem>
                                    )}
                                    {actions.map((action) => (
                                        <MenuItem
                                            key={action.key}
                                            onClick={() => handleAction(action)}
                                        >
                                            {action.icon && (
                                                <Box component="span" sx={{ mr: 1 }}>
                                                    {action.icon}
                                                </Box>
                                            )}
                                            {action.label}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </>
                        )}
                    </Box>
                }
                sx={{
                    '& .MuiCardHeader-content': { overflow: 'hidden' }
                }}
            />
            <CardContent>
                <Box sx={{ height }}>
                    {loading ? (
                        <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 2 }} />
                    ) : (
                        <ChartComponent
                            data={data}
                            options={{ ...defaultOptions, ...options }}
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}