import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Badge } from '@mui/material';
import {
    Home as HomeIcon,
    Search as SearchIcon,
    Work as WorkIcon,
    LocalHospital as DoctorIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../../../hooks/useNotifications';

export default function UserBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { unreadCount } = useNotifications();

    const getActiveTab = () => {
        const path = location.pathname;
        if (path.includes('/home')) return 0;
        if (path.includes('/search')) return 1;
        if (path.includes('/jobs')) return 2;
        if (path.includes('/doctors')) return 3;
        if (path.includes('/profile')) return 4;
        return 0;
    };

    const handleChange = (event, newValue) => {
        switch (newValue) {
            case 0:
                navigate('/app/user/home');
                break;
            case 1:
                navigate('/app/user/search');
                break;
            case 2:
                navigate('/app/user/jobs');
                break;
            case 3:
                navigate('/app/user/doctors');
                break;
            case 4:
                navigate('/app/user/profile');
                break;
        }
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius: 0,
                borderTop: '1px solid #eee',
                zIndex: 1000
            }}
            elevation={3}
        >
            <BottomNavigation
                value={getActiveTab()}
                onChange={handleChange}
                showLabels
                sx={{
                    '& .Mui-selected': {
                        color: '#C00C0C !important'
                    }
                }}
            >
                <BottomNavigationAction label="Home" icon={<HomeIcon />} />
                <BottomNavigationAction label="Search" icon={<SearchIcon />} />
                <BottomNavigationAction label="Jobs" icon={<WorkIcon />} />
                <BottomNavigationAction label="Doctors" icon={<DoctorIcon />} />
                <BottomNavigationAction
                    label="Profile"
                    icon={
                        <Badge badgeContent={unreadCount} color="error">
                            <PersonIcon />
                        </Badge>
                    }
                />
            </BottomNavigation>
        </Paper>
    );
}