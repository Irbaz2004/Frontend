import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Refresh as RefreshIcon,
    ExpandMore as ExpandMoreIcon,
    MyLocation as MyLocationIcon
} from '@mui/icons-material';
import { RADIUS_OPTIONS } from '../../../utils/constants';

export default function LocationBar({ location, radius, onRadiusChange, onRefresh }) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (newRadius) => {
        setAnchorEl(null);
        if (newRadius) onRadiusChange(newRadius);
    };

    const radiusLabel = RADIUS_OPTIONS.find(r => r.value === radius)?.label || radius;

    return (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MyLocationIcon sx={{ color: '#C00C0C' }} />
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {location?.area || 'Location'}
                        </Typography>
                        <Typography variant="caption" color="#666">
                            {location?.city}, {location?.state}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Change radius">
                        <Chip
                            icon={<LocationIcon />}
                            label={radiusLabel}
                            onClick={handleClick}
                            deleteIcon={<ExpandMoreIcon />}
                            onDelete={handleClick}
                            sx={{
                                bgcolor: 'white',
                                '& .MuiChip-deleteIcon': { color: '#666' }
                            }}
                        />
                    </Tooltip>

                    <Tooltip title="Refresh">
                        <IconButton size="small" onClick={onRefresh}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleClose()}>
                {RADIUS_OPTIONS.map((option) => (
                    <MenuItem
                        key={option.value}
                        onClick={() => handleClose(option.value)}
                        selected={radius === option.value}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </Paper>
    );
}