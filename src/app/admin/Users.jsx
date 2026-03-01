import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Chip, Skeleton, TextField, InputAdornment } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';

import { getAllUsers } from '../../services/admin';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data);
            } catch (err) {
                console.error('Failed to fetch users:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filtered = users.filter(u =>
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search)
    );

    return (
        <Box sx={{ p: 2, pb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, pt: 1 }}>
                Users
            </Typography>
            <TextField fullWidth placeholder="Search by name or phone..." value={search}
                onChange={e => setSearch(e.target.value)} size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#C00C0C' }} /></InputAdornment> }}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />

            {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 1.5, borderRadius: 3 }} />)
            ) : filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <PeopleIcon sx={{ fontSize: 50, opacity: 0.2, mb: 1 }} />
                    <Typography>No users found</Typography>
                </Box>
            ) : (
                filtered.map((user, i) => (
                    <Card key={i} sx={{ mb: 1.5, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: '#C00C0C', fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                {user.fullName?.[0]}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                                        {user.fullName}
                                    </Typography>
                                    <Chip label={user.role} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', textTransform: 'capitalize' }} />
                                </Box>
                                <Typography variant="caption" color="text.secondary">{user.phone} {user.city && `• ${user.city}`}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                                {user.role === 'shop' && (
                                    <Chip
                                        label={user.isVerified ? 'Verified' : 'Unverified'}
                                        size="small"
                                        color={user.isVerified ? 'success' : 'warning'}
                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                    />
                                )}
                                {user.isBlocked && <Chip icon={<BlockIcon />} label="Blocked" size="small" color="error" sx={{ height: 20, fontSize: '0.65rem' }} />}
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
}

export default AdminUsers;
