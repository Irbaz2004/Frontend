// app/user/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Chip,
    Button,
    Alert,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Store as StoreIcon,
    Home as HomeIcon,
    Work as WorkIcon,
    Verified as VerifiedIcon,
    ChevronRight as ChevronRightIcon,
    Rocket as RocketIcon,
    TrendingUp as TrendingUpIcon,
    ArrowForward as ArrowForwardIcon,
    AutoAwesome as SparkleIcon,
    Map as MapIcon,
    Search as SearchIcon,
    Business as BusinessIcon,
    MyLocation as MyLocationIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getHomeData, getUserCity, updateUserCity } from '../../services/homeUser';
import { useAuth } from '../context/AuthContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(price);

// ── Glass card styles ─────────────────────────────────────────────────────────
const glassCard = {
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.55)',
    boxShadow: '0 4px 24px rgba(50,95,236,0.08), 0 1px 0 rgba(255,255,255,0.8) inset',
};

const glassCardHover = {
    background: 'rgba(255,255,255,0.82)',
    boxShadow: '0 8px 32px rgba(50,95,236,0.13), 0 1px 0 rgba(255,255,255,0.9) inset',
};

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, onSeeAll }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#0a1628',
            letterSpacing: '-0.02em',
        }}>
            {title}
        </Typography>
        <Button
            onClick={onSeeAll}
            endIcon={<ChevronRightIcon sx={{ fontSize: '0.85rem !important', ml: -0.5 }} />}
            sx={{
                textTransform: 'none',
                color: '#325fec',
                fontFamily: '"Inter", sans-serif',
                fontWeight: 600,
                fontSize: '0.73rem',
                px: 1.4, py: 0.45,
                borderRadius: '20px',
                background: 'rgba(50,95,236,0.08)',
                border: '1px solid rgba(50,95,236,0.15)',
                minWidth: 0,
                lineHeight: 1,
                '&:hover': {
                    background: 'rgba(50,95,236,0.14)',
                    border: '1px solid rgba(50,95,236,0.25)',
                },
            }}
        >
            See all
        </Button>
    </Box>
);

// ── Horizontal Scroll Rail ────────────────────────────────────────────────────
const ScrollRail = ({ children }) => (
    <Box sx={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        pb: 1.5,
        mx: -2,
        px: 2,
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
    }}>
        {children}
    </Box>
);

// ── Shop Card ─────────────────────────────────────────────────────────────────
const ShopCard = ({ shop, onClick, index = 0 }) => (
    <Box
        onClick={onClick}
        sx={{
            minWidth: 185, maxWidth: 185, flexShrink: 0,
            borderRadius: '20px', overflow: 'hidden',
            ...glassCard, cursor: 'pointer',
            transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease',
            animation: `slideInLeft 0.5s ease both`,
            animationDelay: `${index * 0.07}s`,
            '&:active': { transform: 'scale(0.96)', boxShadow: '0 2px 8px rgba(50,95,236,0.1)' },
            '&:hover': { transform: 'translateY(-3px)', ...glassCardHover },
        }}
    >
        <Box sx={{ width: '100%', height: 120, bgcolor: 'rgba(50,95,236,0.05)', overflow: 'hidden', position: 'relative' }}>
            {shop.shop_image ? (
                <img
                    src={shop.shop_image}
                    alt={shop.business_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            ) : (
                <div style={{ width: '100%', height: '100%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StoreIcon sx={{ fontSize: 32, color: '#BFDBFE' }} />
                </div>
            )}
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30, background: 'linear-gradient(to top, rgba(255,255,255,0.25), transparent)' }} />
            {shop.is_verified && (
                <Box sx={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(22,163,74,0.85)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px', px: 0.8, py: 0.3,
                    display: 'flex', alignItems: 'center', gap: 0.4,
                    border: '1px solid rgba(255,255,255,0.4)',
                }}>
                    <VerifiedIcon sx={{ fontSize: '0.6rem', color: '#fff' }} />
                    <Typography sx={{ fontSize: '0.58rem', color: '#fff', fontWeight: 700, fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                        Verified
                    </Typography>
                </Box>
            )}
        </Box>
        <Box sx={{ p: '10px 12px 12px' }}>
            <Typography sx={{
                fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#0a1628',
                lineHeight: 1.3, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
                {shop.business_name}
            </Typography>
            <Chip label={shop.category} size="small" sx={{
                height: 18, fontSize: '0.6rem', fontFamily: '"Inter", sans-serif', fontWeight: 600,
                background: 'rgba(50,95,236,0.1)', color: '#325fec', borderRadius: '6px', mb: 0.7,
                border: '1px solid rgba(50,95,236,0.15)', '& .MuiChip-label': { px: 0.7 },
            }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <LocationIcon sx={{ fontSize: '0.65rem', color: '#94a3b8' }} />
                <Typography sx={{ fontSize: '0.67rem', color: '#94a3b8', fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                    {shop.area}, {shop.city}
                </Typography>
            </Box>
        </Box>
    </Box>
);

// ── House Card ────────────────────────────────────────────────────────────────
const HouseCard = ({ house, onClick, index = 0 }) => (
    <Box
        onClick={onClick}
        sx={{
            minWidth: 185, maxWidth: 185, flexShrink: 0,
            borderRadius: '20px', overflow: 'hidden',
            ...glassCard, cursor: 'pointer',
            transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease',
            animation: `slideInLeft 0.5s ease both`,
            animationDelay: `${index * 0.07}s`,
            '&:active': { transform: 'scale(0.96)' },
            '&:hover': { transform: 'translateY(-3px)', ...glassCardHover },
        }}
    >
        <Box sx={{ width: '100%', height: 120, bgcolor: 'rgba(50,95,236,0.05)', overflow: 'hidden', position: 'relative' }}>
            {house.house_image ? (
                <img
                    src={house.house_image}
                    alt="House"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            ) : (
                <div style={{ width: '100%', height: '100%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HomeIcon sx={{ fontSize: 32, color: '#BBF7D0' }} />
                </div>
            )}
            <Box sx={{
                position: 'absolute', bottom: 8, left: 8,
                background: 'rgba(50,95,236,0.88)',
                backdropFilter: 'blur(12px)',
                borderRadius: '8px', px: 1, py: 0.35,
                border: '1px solid rgba(255,255,255,0.25)',
            }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#fff', fontWeight: 700, fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                    {formatPrice(house.rent_per_month)}<span style={{ fontWeight: 400, fontSize: '0.58rem', opacity: 0.8 }}>/mo</span>
                </Typography>
            </Box>
        </Box>
        <Box sx={{ p: '10px 12px 12px' }}>
            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#0a1628', mb: 0.6 }}>
                {house.rooms} BHK House
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <LocationIcon sx={{ fontSize: '0.65rem', color: '#94a3b8' }} />
                <Typography sx={{ fontSize: '0.67rem', color: '#94a3b8', fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                    {house.area}, {house.city}
                </Typography>
            </Box>
        </Box>
    </Box>
);

// ── Job Card ──────────────────────────────────────────────────────────────────
const JobCard = ({ job, onClick, index = 0 }) => (
    <Box
        onClick={onClick}
        sx={{
            minWidth: 205, maxWidth: 205, flexShrink: 0,
            borderRadius: '20px', ...glassCard, cursor: 'pointer', p: '14px',
            transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease',
            animation: `slideInLeft 0.5s ease both`,
            animationDelay: `${index * 0.07}s`,
            '&:active': { transform: 'scale(0.96)' },
            '&:hover': { transform: 'translateY(-3px)', ...glassCardHover },
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
            <Box sx={{
                width: 38, height: 38, borderRadius: '12px',
                background: 'rgba(50,95,236,0.1)',
                border: '1px solid rgba(50,95,236,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <WorkIcon sx={{ fontSize: '1.05rem', color: '#325fec' }} />
            </Box>
            <Chip
                label={job.job_type === 'full_time' ? 'Full Time' : 'Part Time'}
                size="small"
                sx={{
                    height: 19, fontSize: '0.6rem', fontFamily: '"Inter", sans-serif', fontWeight: 700,
                    bgcolor: job.job_type === 'full_time' ? 'rgba(21,128,61,0.12)' : 'rgba(146,64,14,0.1)',
                    color: job.job_type === 'full_time' ? '#15803d' : '#92400e',
                    borderRadius: '7px',
                    border: job.job_type === 'full_time' ? '1px solid rgba(21,128,61,0.2)' : '1px solid rgba(146,64,14,0.15)',
                    '& .MuiChip-label': { px: 0.8 },
                }}
            />
        </Box>
        <Typography sx={{
            fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '0.84rem', color: '#0a1628',
            lineHeight: 1.3, mb: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
            {job.job_title}
        </Typography>
        <Typography sx={{
            fontSize: '0.7rem', color: '#64748b', fontFamily: '"Inter", sans-serif', mb: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
            {job.shop_name || job.company_name}
        </Typography>
        <Box sx={{
            display: 'flex', alignItems: 'baseline', gap: 0.4,
            background: 'rgba(50,95,236,0.07)',
            border: '1px solid rgba(50,95,236,0.12)',
            borderRadius: '10px', px: 1, py: 0.6, mb: 0.9,
        }}>
            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#325fec' }}>
                {formatPrice(job.salary)}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: '"Inter", sans-serif' }}>
                /{job.salary_type === 'month' ? 'month' : 'day'}
            </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <LocationIcon sx={{ fontSize: '0.65rem', color: '#94a3b8' }} />
            <Typography sx={{ fontSize: '0.67rem', color: '#94a3b8', fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                {job.area}, {job.city}
            </Typography>
        </Box>
    </Box>
);

// ── Boost Banner ──────────────────────────────────────────────────────────────
const BoostBanner = ({ onLearnMore }) => (
    <Box
        sx={{
            mx: 0, mb: 3, borderRadius: '22px', overflow: 'hidden',
            position: 'relative', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1a3aad 0%, #325fec 45%, #4f78f5 100%)',
            boxShadow: '0 8px 32px rgba(50,95,236,0.35)',
            animation: 'fadeInUp 0.6s ease both', animationDelay: '0.2s',
            '&:active': { transform: 'scale(0.985)' },
            transition: 'transform 0.18s ease',
        }}
        onClick={onLearnMore}
    >
        <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), transparent)',
            pointerEvents: 'none', borderRadius: '22px 22px 0 0',
        }} />
        <Box sx={{
            position: 'absolute', right: -20, top: -20,
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
        }} />
        <Box sx={{
            position: 'absolute', right: 30, bottom: -30,
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        }} />
        <Box sx={{ p: '16px 18px', position: 'relative', zIndex: 1 }}>
            <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.28)',
                borderRadius: '20px', px: 1, py: 0.3, mb: 1.2,
            }}>
                <SparkleIcon sx={{ fontSize: '0.65rem', color: '#ffd700' }} />
                <Typography sx={{
                    fontFamily: '"Inter", sans-serif', fontSize: '0.6rem', fontWeight: 700,
                    color: 'rgba(255,255,255,0.95)', letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                    Coming Soon
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1, pr: 1 }}>
                    <Typography sx={{
                        fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '1.05rem',
                        color: '#fff', lineHeight: 1.25, mb: 0.5, letterSpacing: '-0.02em',
                    }}>
                        Nearzo Boost
                    </Typography>
                    <Typography sx={{
                        fontFamily: '"Inter", sans-serif', fontSize: '0.73rem',
                        color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, mb: 1.4,
                    }}>
                        Get your listing seen by 10x more customers. Premium placement, priority search & analytics.
                    </Typography>
                    <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.6,
                        background: 'rgba(255,255,255,0.22)',
                        border: '1px solid rgba(255,255,255,0.35)',
                        borderRadius: '12px', px: 1.4, py: 0.7,
                    }}>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.73rem', fontWeight: 700, color: '#fff' }}>
                            Learn more
                        </Typography>
                        <ArrowForwardIcon sx={{ fontSize: '0.75rem', color: '#fff' }} />
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8, mt: 0.5 }}>
                    <Box sx={{
                        width: 46, height: 46, borderRadius: '14px',
                        background: 'rgba(255,255,255,0.18)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <RocketIcon sx={{ fontSize: '1.3rem', color: '#fff' }} />
                    </Box>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: '10px',
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <TrendingUpIcon sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }} />
                    </Box>
                </Box>
            </Box>
        </Box>
    </Box>
);

// ── NearZO Promo Banner (replaces Category Marquee) ───────────────────────────
const NEARZO_SLIDES = [
    {
        icon: MapIcon,
        tag: 'Discover',
        headline: 'Find everything near you',
        sub: 'Shops, houses & jobs — all in one place, pinned to your locality.',
        accent: 'linear-gradient(135deg, #1a3aad 0%, #325fec 100%)',
    },
    {
        icon: SearchIcon,
        tag: 'Search',
        headline: 'Hyper-local search',
        sub: 'Results filtered to your city & area so you never see irrelevant listings.',
        accent: 'linear-gradient(135deg, #0f6e56 0%, #1d9e75 100%)',
    },
    {
        icon: BusinessIcon,
        tag: 'List Free',
        headline: 'List your business today',
        sub: 'Add your shop, rental or job opening for free and reach local customers.',
        accent: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    },
];

const NearZOPromoBanner = ({ onExplore }) => {
    const [active, setActive] = React.useState(0);

    React.useEffect(() => {
        const t = setInterval(() => setActive(prev => (prev + 1) % NEARZO_SLIDES.length), 3800);
        return () => clearInterval(t);
    }, []);

    const slide = NEARZO_SLIDES[active];
    const IconComp = slide.icon;

    return (
        <Box sx={{ px: 2, mb: 3, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.15s' }}>
            {/* Main slide card */}
            <Box
                onClick={onExplore}
                sx={{
                    borderRadius: '22px',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    background: '#325fec',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 10px 30px rgba(50,95,236,0.28)',
                    transition: 'all 0.2s ease',
                    '&:active': {
                        transform: 'scale(0.985)',
                    },
                    '&:hover': {
                        boxShadow: '0 14px 36px rgba(50,95,236,0.38)',
                    },
                    minHeight: 148,
                    p: '18px 20px 16px',
                }}
            >
                {/* Decorative circles */}
                <Box
                    sx={{
                        position: 'absolute',
                        right: -18,
                        top: -18,
                        width: 110,
                        height: 110,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        pointerEvents: 'none',
                    }}
                />

                <Box
                    sx={{
                        position: 'absolute',
                        right: 28,
                        bottom: -28,
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        pointerEvents: 'none',
                    }}
                />

                {/* Tag pill */}
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        background: 'rgba(255,255,255,0.14)',
                        border: '1px solid rgba(255,255,255,0.22)',
                        borderRadius: '20px',
                        px: 1,
                        py: 0.3,
                        mb: 1.1,
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <SparkleIcon sx={{ fontSize: '0.6rem', color: '#ffd700' }} />

                    <Typography
                        sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '0.58rem',
                            fontWeight: 700,
                            color: '#fff',
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                        }}
                    >
                        {slide.tag}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 1,
                    }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            sx={{
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: 800,
                                fontSize: '1.08rem',
                                color: '#fff',
                                lineHeight: 1.25,
                                mb: 0.5,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {slide.headline}
                        </Typography>

                        <Typography
                            sx={{
                                fontFamily: '"Inter", sans-serif',
                                fontSize: '0.72rem',
                                color: 'rgba(255,255,255,0.78)',
                                lineHeight: 1.45,
                                mb: 1.4,
                            }}
                        >
                            {slide.sub}
                        </Typography>

                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                background: 'rgba(255,255,255,0.16)',
                                border: '1px solid rgba(255,255,255,0.24)',
                                borderRadius: '10px',
                                px: 1.3,
                                py: 0.65,
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: '"Inter", sans-serif',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: '#fff',
                                }}
                            >
                                Explore NearZO
                            </Typography>

                            <ArrowForwardIcon
                                sx={{
                                    fontSize: '0.72rem',
                                    color: '#fff',
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Icon box */}
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            flexShrink: 0,
                            borderRadius: '16px',
                            background: 'rgba(255,255,255,0.14)',
                            border: '1px solid rgba(255,255,255,0.22)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mt: 0.5,
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <IconComp
                            sx={{
                                fontSize: '1.4rem',
                                color: '#fff',
                            }}
                        />
                    </Box>
                </Box>
            </Box>
            {/* Dot indicators */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.7, mt: 1.2 }}>
                {NEARZO_SLIDES.map((_, i) => (
                    <Box
                        key={i}
                        onClick={() => setActive(i)}
                        sx={{
                            width: i === active ? 20 : 6,
                            height: 6,
                            borderRadius: '4px',
                            background: i === active ? '#325fec' : 'rgba(50,95,236,0.22)',
                            transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), background 0.25s ease',
                            cursor: 'pointer',
                        }}
                    />
                ))}
            </Box>

            {/* Quick feature pills row */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1.6, flexWrap: 'wrap' }}>
                {[
                    {
                        label: 'Shops',
                        route: '/app/shops',
                        icon: <StorefrontIcon sx={{ fontSize: '1rem' }} />
                    },
                    {
                        label: 'Houses',
                        route: '/app/houses',
                        icon: <HomeWorkIcon sx={{ fontSize: '1rem' }} />
                    },
                    {
                        label: 'Jobs',
                        route: '/app/jobs',
                        icon: <WorkOutlineIcon sx={{ fontSize: '1rem' }} />
                    },
                ].map((item) => (
                    <Box
                        key={item.label}
                        onClick={() => onExplore(item.route)}
                        sx={{
                            flex: 1,
                            minWidth: 80,
                            py: 0.9,
                            px: 1,
                            borderRadius: '14px',
                            border: '1.5px solid rgba(50,95,236,0.18)',
                            background: 'rgba(50,95,236,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.7,
                            cursor: 'pointer',
                            transition: 'background 0.18s ease, border-color 0.18s ease, transform 0.15s ease',
                            '&:active': { transform: 'scale(0.95)' },
                            '&:hover': {
                                background: 'rgba(50,95,236,0.1)',
                                borderColor: 'rgba(50,95,236,0.32)'
                            },
                        }}
                    >
                        {item.icon}

                        <Typography
                            sx={{
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: 600,
                                fontSize: '0.72rem',
                                color: '#325fec',
                                letterSpacing: '-0.01em'
                            }}
                        >
                            {item.label}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

// ── Location Permission Dialog ────────────────────────────────────────────────
const LocationPermissionDialog = ({ open, onClose, onAllow, onManualCity, loading }) => {
    const [manualCity, setManualCity] = useState('');

    const handleManualSubmit = () => {
        if (manualCity.trim()) {
            onManualCity(manualCity.trim());
            setManualCity('');
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    maxWidth: '340px',
                    width: '90%',
                    p: 1
                }
            }}
        >
            <DialogTitle sx={{ 
                fontFamily: '"Inter", sans-serif',
                fontWeight: 700,
                fontSize: '1.2rem',
                color: '#0a1628',
                pb: 1,
                pt: 2.5
            }}>
                Allow Location Access
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ 
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '0.85rem',
                    color: '#64748b',
                    mb: 2
                }}>
                    NearZO needs your location to show shops, houses, and jobs near you. 
                    We don't store your precise location.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<MyLocationIcon />}
                        onClick={onAllow}
                        disabled={loading}
                        sx={{
                            background: '#325fec',
                            borderRadius: '14px',
                            py: 1.2,
                            textTransform: 'none',
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            '&:hover': {
                                background: '#254bc4'
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Allow Location'}
                    </Button>

                    <Typography sx={{ 
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: '0.75rem'
                    }}>
                        OR
                    </Typography>

                    <TextField
                        placeholder="Enter your city name"
                        value={manualCity}
                        onChange={(e) => setManualCity(e.target.value)}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '14px',
                                fontFamily: '"Inter", sans-serif'
                            }
                        }}
                    />
                    
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleManualSubmit}
                        disabled={!manualCity.trim() || loading}
                        sx={{
                            borderRadius: '14px',
                            py: 1,
                            textTransform: 'none',
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            borderColor: '#cbd5e1',
                            color: '#475569',
                            '&:hover': {
                                borderColor: '#325fec',
                                color: '#325fec'
                            }
                        }}
                    >
                        Use this city
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button 
                    onClick={onClose}
                    sx={{
                        color: '#94a3b8',
                        textTransform: 'none',
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '0.8rem'
                    }}
                >
                    Skip for now
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
    <Box sx={{ px: 2, pt: 2 }}>
        <Skeleton variant="rounded" height={220} sx={{ borderRadius: '20px', mb: 3 }} />
        <Skeleton variant="rounded" height={148} sx={{ borderRadius: '22px', mb: 1.5 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={38} sx={{ flex: 1, borderRadius: '14px' }} />)}
        </Box>
        {[1, 2, 3].map(s => (
            <Box key={s} sx={{ mb: 3.5 }}>
                <Skeleton variant="text" width={150} height={28} sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {[1, 2, 3].map((_, i) => (
                        <Skeleton key={i} variant="rounded" width={185} height={175} sx={{ flexShrink: 0, borderRadius: '20px' }} />
                    ))}
                </Box>
            </Box>
        ))}
    </Box>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [homeData, setHomeData] = useState({ ads: [], shops: [], houses: [], jobs: [], city: '' });
    const [locationDialogOpen, setLocationDialogOpen] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [cityDetected, setCityDetected] = useState(false);

    // Function to get city from coordinates using reverse geocoding
    const getCityFromCoordinates = async (latitude, longitude) => {
        try {
            // Using OpenStreetMap Nominatim API (free, no API key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'NearZO-App/1.0'
                    }
                }
            );
            const data = await response.json();
            
            if (data && data.address) {
                // Try to get city in order of specificity
                const city = data.address.city || 
                           data.address.town || 
                           data.address.village || 
                           data.address.municipality ||
                           data.address.county;
                
                if (city) {
                    return city;
                }
            }
            throw new Error('City not found');
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            throw error;
        }
    };

    // Function to get user's current location and city
    const getCurrentLocationCity = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const city = await getCityFromCoordinates(latitude, longitude);
                        resolve(city);
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => {
                    let errorMessage = 'Unable to get your location';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied. Please allow location access.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    // Function to load home data with city
    const loadHomeData = async (city) => {
        setLoading(true);
        setError('');
        try {
            const result = await getHomeData(city);
            setHomeData(result);
            
            // Update user's city in backend if user is logged in and city changed
            if (user?.id && city !== user.city) {
                try {
                    await updateUserCity(city);
                    if (updateUser) {
                        updateUser({ ...user, city });
                    }
                } catch (err) {
                    console.error('Failed to update user city:', err);
                }
            }
        } catch (err) {
            setError(err.message || 'Failed to load home data');
            console.error('Error loading home data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle location permission
    const handleAllowLocation = async () => {
        setLocationLoading(true);
        try {
            const city = await getCurrentLocationCity();
            if (city) {
                setCityDetected(true);
                setLocationDialogOpen(false);
                await loadHomeData(city);
            } else {
                throw new Error('Could not detect your city');
            }
        } catch (err) {
            console.error('Location error:', err);
            setError(err.message);
            // Fallback to user's saved city or default
            const fallbackCity = user?.city || 'Vellore';
            await loadHomeData(fallbackCity);
        } finally {
            setLocationLoading(false);
        }
    };

    // Handle manual city entry
    const handleManualCity = async (city) => {
        setLocationDialogOpen(false);
        await loadHomeData(city);
    };

    // Handle skip location
    const handleSkipLocation = async () => {
        setLocationDialogOpen(false);
        const fallbackCity = user?.city || 'Vellore';
        await loadHomeData(fallbackCity);
    };

    // Initialize component - check for existing city
    useEffect(() => {
        const initializeCity = async () => {
            // Check if user already has a city in profile
            if (user?.city && !cityDetected) {
                await loadHomeData(user.city);
            } else if (!cityDetected && !user?.city) {
                // Try to get user's saved city from backend
                try {
                    const cityResult = await getUserCity();
                    if (cityResult.city) {
                        setCityDetected(true);
                        await loadHomeData(cityResult.city);
                    } else {
                        // No city found, show location dialog
                        setLocationDialogOpen(true);
                    }
                } catch (err) {
                    console.error('Error getting user city:', err);
                    setLocationDialogOpen(true);
                }
            }
        };

        initializeCity();
    }, [user?.city]);

    // Ad slider settings
    const adSliderSettings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4500,
        arrows: false,
        pauseOnHover: true,
        dotsClass: 'slick-dots nearzo-dots',
        adaptiveHeight: false,
    };

    if (loading && !homeData.city) return <LoadingSkeleton />;

    if (error && !locationDialogOpen) return (
        <Box sx={{ p: 2 }}>
            <Alert 
                severity="error" 
                sx={{ borderRadius: '14px', fontFamily: '"Inter", sans-serif' }}
                action={
                    <Button color="inherit" size="small" onClick={() => setLocationDialogOpen(true)}>
                        Retry
                    </Button>
                }
            >
                {error}
            </Alert>
        </Box>
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                * { font-family: 'Inter', sans-serif; }

                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(28px) scale(0.96); }
                    to   { opacity: 1; transform: translateX(0) scale(1); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.6; }
                    50%       { opacity: 1; }
                }

                .nearzo-ad-slider .slick-slide > div { height: 100%; }
                .nearzo-ad-slider .slick-list       { height: 100%; }
                .nearzo-ad-slider .slick-track      { height: 100%; display: flex; }
                .nearzo-ad-slider .slick-slide      { height: inherit; }

                .nearzo-dots { bottom: 10px !important; }
                .nearzo-dots li button:before {
                    color: rgba(255,255,255,0.75) !important;
                    font-size: 6px !important;
                    opacity: 1 !important;
                }
                .nearzo-dots li.slick-active button:before {
                    color: #fff !important;
                    font-size: 8px !important;
                }
            `}</style>

            <LocationPermissionDialog
                open={locationDialogOpen}
                onClose={handleSkipLocation}
                onAllow={handleAllowLocation}
                onManualCity={handleManualCity}
                loading={locationLoading}
            />

            <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh' }}>

                {/* ── City Header ──────────────────────────────────── */}
                <Box sx={{ px: 2, pt: 2.5, pb: 1.5, animation: 'fadeInUp 0.4s ease both' }}>
                    <Typography sx={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600,
                        mb: 0.3, letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                        Exploring
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box 
                            sx={{
                                width: 26, height: 26, borderRadius: '8px',
                                background: 'rgba(50,95,236,0.12)',
                                border: '1px solid rgba(50,95,236,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                animation: 'pulseGlow 2.5s ease infinite',
                                cursor: 'pointer',
                            }}
                            onClick={() => setLocationDialogOpen(true)}
                        >
                            <LocationIcon sx={{ fontSize: '0.85rem', color: '#325fec' }} />
                        </Box>
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 800, fontSize: '1.1rem',
                            color: '#0a1628', letterSpacing: '-0.03em', lineHeight: 1,
                        }}>
                            {homeData.city}
                        </Typography>
                    </Box>
                </Box>

                {/* ── Ad Banner (shops ads) ─────────────────────────── */}
                {homeData.ads?.length > 0 && (
                    <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 1, mb: 3, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.1s' }}>
                        <Box sx={{ borderRadius: '18px', overflow: 'hidden', background: '#fff', p: 1, height: { xs: 225, sm: 275, md: 335 }, position: 'relative' }} className="nearzo-ad-slider">
                            <Slider {...adSliderSettings} style={{ height: '100%' }}>
                                {homeData.ads.map((ad) => (
                                    <Box key={ad.id} onClick={() => navigate(`/app/shops/${ad.shop_id}`)} sx={{ cursor: 'pointer', height: '100%', display: 'block !important', borderRadius: '18px', overflow: 'hidden', position: 'relative' }}>
                                        <Box component="img" src={ad.image_url} alt={ad.title} sx={{ width: '100%', height: { xs: 210, sm: 260, md: 320 }, objectFit: 'cover', objectPosition: 'center', display: 'block', borderRadius: '18px' }} />
                                        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 45%)', pointerEvents: 'none', borderRadius: '18px' }} />
                                    </Box>
                                ))}
                            </Slider>
                        </Box>
                    </Box>
                )}

                {/* ── NearZO Promo Banner ── */}
                <NearZOPromoBanner onExplore={(route) => navigate(typeof route === 'string' ? route : '/app/shops')} />

                {/* ── Shops ── */}
                {homeData.shops?.length > 0 && (
                    <Box sx={{ mb: 3, px: 2, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.2s' }}>
                        <SectionHeader title={`Shops in ${homeData.city}`} onSeeAll={() => navigate('/app/shops')} />
                        <ScrollRail>
                            {homeData.shops.map((shop, i) => (
                                <ShopCard key={shop.id} shop={shop} index={i} onClick={() => navigate(`/app/shops/${shop.id}`)} />
                            ))}
                        </ScrollRail>
                    </Box>
                )}

                {/* ── Houses + Boost Banner ── */}
                {homeData.houses?.length > 0 && (
                    <Box sx={{ mb: 3, px: 2, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.25s' }}>
                        <SectionHeader title={`Houses in ${homeData.city}`} onSeeAll={() => navigate('/app/houses')} />
                        <ScrollRail>
                            {homeData.houses.map((house, i) => (
                                <HouseCard key={house.id} house={house} index={i} onClick={() => navigate(`/app/houses/${house.id}`)} />
                            ))}
                        </ScrollRail>
                        <Box sx={{ mt: 2 }}>
                            <BoostBanner onLearnMore={() => navigate('/app/boost')} />
                        </Box>
                    </Box>
                )}

                {/* ── Jobs ── */}
                {homeData.jobs?.length > 0 && (
                    <Box sx={{ mb: 5, px: 2, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.3s' }}>
                        <SectionHeader title={`Jobs in ${homeData.city}`} onSeeAll={() => navigate('/app/jobs')} />
                        <ScrollRail>
                            {homeData.jobs.map((job, i) => (
                                <JobCard key={job.id} job={job} index={i} onClick={() => navigate(`/app/jobs/${job.id}`)} />
                            ))}
                        </ScrollRail>
                    </Box>
                )}

                {/* ── Empty State ── */}
                {!homeData.shops?.length && !homeData.houses?.length && !homeData.jobs?.length && !loading && (
                    <Box sx={{ textAlign: 'center', py: 10, px: 4 }}>
                        <Box sx={{
                            width: 64, height: 64, borderRadius: '20px',
                            background: 'rgba(50,95,236,0.1)',
                            border: '1px solid rgba(50,95,236,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            mx: 'auto', mb: 2,
                            boxShadow: '0 4px 20px rgba(50,95,236,0.15)',
                        }}>
                            <LocationIcon sx={{ fontSize: '1.8rem', color: '#325fec' }} />
                        </Box>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#334155', mb: 0.5 }}>
                            No listings found
                        </Typography>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.8rem', color: '#94a3b8' }}>
                            No shops, houses, or jobs found in {homeData.city}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setLocationDialogOpen(true)}
                            sx={{
                                mt: 3,
                                background: '#325fec',
                                borderRadius: '14px',
                                textTransform: 'none',
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: 600,
                                px: 3,
                                py: 1,
                                '&:hover': { background: '#254bc4' }
                            }}
                        >
                            Try Different Location
                        </Button>
                    </Box>
                )}

            </Box>
        </>
    );
}