import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import {
    CheckCircle as VerifiedIcon,
    Pending as PendingIcon,
    Block as BlockedIcon,
    Cancel as RejectedIcon,
    Schedule as PendingIcon,
    Warning as WarningIcon
} from '@mui/icons-material';

const statusConfig = {
    verified: {
        label: 'Verified',
        color: 'success',
        icon: <VerifiedIcon />,
        tooltip: 'This item has been verified'
    },
    pending: {
        label: 'Pending',
        color: 'warning',
        icon: <PendingIcon />,
        tooltip: 'Awaiting verification'
    },
    rejected: {
        label: 'Rejected',
        color: 'error',
        icon: <RejectedIcon />,
        tooltip: 'Verification rejected'
    },
    blocked: {
        label: 'Blocked',
        color: 'error',
        icon: <BlockedIcon />,
        tooltip: 'Account blocked'
    },
    active: {
        label: 'Active',
        color: 'success',
        icon: <VerifiedIcon />,
        tooltip: 'Active and running'
    },
    inactive: {
        label: 'Inactive',
        color: 'default',
        icon: <WarningIcon />,
        tooltip: 'Currently inactive'
    },
    hiring: {
        label: 'Hiring',
        color: 'info',
        icon: <PendingIcon />,
        tooltip: 'Currently hiring'
    },
    full: {
        label: 'Full',
        color: 'default',
        icon: <BlockedIcon />,
        tooltip: 'No vacancies'
    }
};

export default function StatusChip({ status, type, showIcon = true, size = 'small' }) {
    const config = statusConfig[status] || statusConfig[type] || {
        label: status || 'Unknown',
        color: 'default',
        icon: null,
        tooltip: ''
    };

    const chip = (
        <Chip
            label={config.label}
            color={config.color}
            size={size}
            icon={showIcon ? config.icon : undefined}
            sx={{
                fontWeight: 600,
                '& .MuiChip-icon': { fontSize: 16 }
            }}
        />
    );

    return config.tooltip ? (
        <Tooltip title={config.tooltip}>
            {chip}
        </Tooltip>
    ) : chip;
}