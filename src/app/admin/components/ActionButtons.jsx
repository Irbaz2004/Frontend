import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    Button,
    Divider
} from '@mui/material';
import {
    MoreVert as MoreIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Block as BlockIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Email as EmailIcon
} from '@mui/icons-material';

export default function ActionButtons({
    actions = [],
    onAction,
    size = 'small',
    iconButtonProps = {}
}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState({});

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAction = async (action) => {
        if (action.handler) {
            setLoading(prev => ({ ...prev, [action.key]: true }));
            try {
                await action.handler();
            } finally {
                setLoading(prev => ({ ...prev, [action.key]: false }));
            }
        } else if (onAction) {
            onAction(action.key);
        }
        handleClose();
    };

    const iconMap = {
        view: <ViewIcon />,
        edit: <EditIcon />,
        delete: <DeleteIcon />,
        approve: <ApproveIcon />,
        reject: <RejectIcon />,
        block: <BlockIcon />,
        refresh: <RefreshIcon />,
        download: <DownloadIcon />,
        email: <EmailIcon />
    };

    // If less than 3 actions, show as buttons
    if (actions.length <= 3) {
        return (
            <Box sx={{ display: 'flex', gap: 1 }}>
                {actions.map((action) => (
                    <Tooltip key={action.key} title={action.label}>
                        <IconButton
                            size={size}
                            onClick={() => handleAction(action)}
                            disabled={loading[action.key]}
                            sx={{ color: action.color }}
                            {...iconButtonProps}
                        >
                            {iconMap[action.key] || action.icon}
                        </IconButton>
                    </Tooltip>
                ))}
            </Box>
        );
    }

    // More than 3 actions, show in menu
    return (
        <>
            <IconButton
                size={size}
                onClick={handleClick}
                {...iconButtonProps}
            >
                <MoreIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
            >
                {actions.map((action, index) => (
                    <React.Fragment key={action.key}>
                        {index > 0 && action.divider && <Divider />}
                        <MenuItem
                            onClick={() => handleAction(action)}
                            disabled={loading[action.key]}
                            sx={{ color: action.color }}
                        >
                            <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                                {iconMap[action.key] || action.icon}
                            </Box>
                            {action.label}
                        </MenuItem>
                    </React.Fragment>
                ))}
            </Menu>
        </>
    );
}