import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { CheckCircleOutline, AutoAwesome } from '@mui/icons-material';

const BLUE = '#325fec';

export default function ListingEnhancements({ items, label = 'Key items available' }) {
    const values = Array.isArray(items)
        ? items.filter(Boolean)
        : typeof items === 'string'
            ? items.split(',').map((item) => item.trim()).filter(Boolean)
            : [];

    if (!values.length) return null;

    return (
        <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
            <Box sx={{
                p: { xs: 2, sm: 2.5 }, borderRadius: '22px',
                background: 'linear-gradient(145deg, #F8FAFF 0%, #EEF4FF 100%)',
                border: '1px solid #DDE7FF', boxShadow: '0 12px 32px rgba(50,95,236,.08)',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2 }}>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>{label}</Typography>
                        <Typography sx={{ fontWeight: 500, fontSize: 11.5, color: '#64748B', mt: .25 }}>
                            Confirmed for this listing
                        </Typography>
                    </Box>
                    <Box sx={{ width: 38, height: 38, borderRadius: '12px', bgcolor: '#fff', display: 'grid', placeItems: 'center', color: BLUE, boxShadow: '0 6px 18px rgba(50,95,236,.12)' }}>
                        <AutoAwesome sx={{ fontSize: 19 }} />
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {values.map((item, index) => (
                        <Chip key={`${item}-${index}`} icon={<CheckCircleOutline />}
                            label={item} sx={{
                                height: 34, bgcolor: '#fff', color: '#334155', fontWeight: 700,
                                border: '1px solid #E2E8F5', borderRadius: '11px',
                                '& .MuiChip-icon': { color: '#16A34A', fontSize: 17 },
                                '&:hover': { borderColor: BLUE, transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(50,95,236,.1)' },
                                transition: 'all .18s ease',
                            }} />
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
