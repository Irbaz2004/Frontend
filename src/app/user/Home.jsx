// app/user/Home.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Chip, Button, Alert, Skeleton,
    Dialog, DialogContent, DialogActions,
    TextField, CircularProgress, Snackbar,
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
    MyLocation as MyLocationIcon,
    GpsFixed as GpsFixedIcon,
    Apartment as ApartmentIcon,
    KeyboardArrowDown as ArrowDownIcon,
    Storefront as StorefrontIcon2,
    HomeWork as HomeWorkIcon2,
    WorkOutline as WorkOutlineIcon2,
    Search as SearchIcon,
    FlashOn as FlashIcon,
    CheckCircle as CheckIcon,
    Map as MapIcon,
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

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
    primary: '#325fec',
    primaryDark: '#1a45c8',
    primaryLight: '#EBF3FF',
    orange: '#FF6B00',
    orangeLight: '#FFF3E8',
    green: '#388E3C',
    greenLight: '#E8F5E9',
    surface: '#F1F3F6',
    card: '#FFFFFF',
    text: '#212121',
    textSub: '#666666',
    textMuted: '#9E9E9E',
    border: '#E0E0E0',
    shadow: '0 2px 8px rgba(0,0,0,0.08)',
    shadowMd: '0 4px 16px rgba(0,0,0,0.12)',
};

// ── Feature Highlights Strip ──────────────────────────────────────────────────
const FEATURE_HIGHLIGHTS = [
    { icon: StorefrontIcon2,  label: 'Local Shops',    sub: 'Discover nearby stores'   },
    { icon: HomeWorkIcon2,    label: 'Rent a Home',    sub: 'PGs, flats & rooms'       },
    { icon: WorkOutlineIcon2, label: 'Find Jobs',      sub: 'Full-time & part-time'    },
    { icon: SearchIcon,       label: 'Hyper-Local',    sub: 'Results near your area'   },
    { icon: CheckIcon,        label: 'Free Listings',  sub: 'List your business today' },
    { icon: FlashIcon,        label: 'Instant Alerts', sub: 'New listings in real-time'},
];

const FeatureHighlightsStrip = () => {
    const [active, setActive] = React.useState(0);
    React.useEffect(() => {
        const t = setInterval(() => setActive(p => (p + 1) % FEATURE_HIGHLIGHTS.length), 2800);
        return () => clearInterval(t);
    }, []);

    return (
        <Box sx={{
            bgcolor: '#325fec',
            px: { xs: 2, sm: 3 },
            py: '11px',
            display: 'flex', alignItems: 'center', gap: '10px',
            overflow: 'hidden', position: 'relative',
            mt:1
        }}>
            <Box sx={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                pointerEvents: 'none',
            }} />

            {FEATURE_HIGHLIGHTS.map((f, i) => {
                const Icon = f.icon;
                return (
                    <Box key={i} sx={{
                        display: i === active ? 'flex' : 'none',
                        alignItems: 'center', gap: '10px',
                        flex: 1, minWidth: 0,
                        animation: 'featureSlideIn 0.38s cubic-bezier(0.22,1,0.36,1)',
                    }}>
                        <Box sx={{
                            width: 32, height: 32, flexShrink: 0,
                            borderRadius: '8px',
                            bgcolor: 'rgba(255,255,255,0.16)',
                            border: '1px solid rgba(255,255,255,0.26)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Icon sx={{ fontSize: '1rem', color: '#fff' }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: 700, fontSize: { xs: '0.78rem', sm: '0.82rem' },
                                color: '#fff', lineHeight: 1.2, whiteSpace: 'nowrap',
                            }}>
                                {f.label}
                            </Typography>
                            <Typography sx={{
                                fontFamily: '"Inter", sans-serif',
                                fontSize: { xs: '0.63rem', sm: '0.67rem' },
                                color: 'rgba(255,255,255,0.72)',
                                lineHeight: 1.2, whiteSpace: 'nowrap',
                            }}>
                                {f.sub}
                            </Typography>
                        </Box>
                    </Box>
                );
            })}

            {/* Dot indicators */}
            <Box sx={{ display: 'flex', gap: '4px', flexShrink: 0, ml: 'auto' }}>
                {FEATURE_HIGHLIGHTS.map((_, i) => (
                    <Box key={i} onClick={() => setActive(i)} sx={{
                        width: i === active ? 16 : 5, height: 5, borderRadius: '3px',
                        bgcolor: i === active ? '#fff' : 'rgba(255,255,255,0.32)',
                        transition: 'width 0.3s ease, background 0.2s ease',
                        cursor: 'pointer',
                    }} />
                ))}
            </Box>
        </Box>
    );
};

// ── City Header ───────────────────────────────────────────────────────────────
const CityHeader = ({ city, onCityClick, onRefresh }) => (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 2.5, sm: 3 }, pb: 1.5, bgcolor: '#fff' }}>
        <Typography sx={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.6rem', color: T.textMuted, fontWeight: 600,
            mb: 0.3, letterSpacing: '0.09em', textTransform: 'uppercase',
        }}>
            Exploring
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box onClick={onCityClick} sx={{ display: 'flex', alignItems: 'center', gap: 0.6, cursor: 'pointer' }}>
                <Box sx={{
                    width: 28, height: 28, borderRadius: '8px',
                    bgcolor: 'rgba(50,95,236,0.1)', border: '1px solid rgba(50,95,236,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <LocationIcon sx={{ fontSize: '0.9rem', color: '#325fec' }} />
                </Box>
                <Typography sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.15rem' },
                    color: T.text, letterSpacing: '-0.02em', lineHeight: 1,
                }}>
                    {city || 'Loading…'}
                </Typography>
                <ArrowDownIcon sx={{ fontSize: '0.9rem', color: T.textMuted }} />
            </Box>
            <Button size="small" onClick={onRefresh}
                startIcon={<GpsFixedIcon sx={{ fontSize: '0.8rem' }} />}
                sx={{
                    textTransform: 'none', fontFamily: '"Inter", sans-serif',
                    fontWeight: 600, fontSize: '0.68rem', color: '#325fec',
                    bgcolor: 'rgba(50,95,236,0.08)', borderRadius: '20px',
                    px: 1.4, py: 0.45,
                    '&:hover': { bgcolor: 'rgba(50,95,236,0.15)' },
                }}
            >
                Refresh
            </Button>
        </Box>
    </Box>
);

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, badge, onSeeAll }) => (
    <Box sx={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        px: { xs: 2, sm: 3, md: 4 }, pt: 2, pb: 1.2,
    }}>
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 800, fontSize: { xs: '1rem', sm: '1.05rem' },
                    color: T.text, letterSpacing: '-0.02em', lineHeight: 1,
                }}>
                    {title}
                </Typography>
                {badge && (
                    <Box sx={{ bgcolor: T.orange, borderRadius: '5px', px: 0.7, py: 0.1 }}>
                        <Typography sx={{
                            fontSize: '0.52rem', fontWeight: 800, color: '#fff',
                            fontFamily: '"Inter", sans-serif', letterSpacing: '0.05em',
                        }}>
                            {badge}
                        </Typography>
                    </Box>
                )}
            </Box>
            {subtitle && (
                <Typography sx={{
                    fontFamily: '"Inter", sans-serif', fontSize: '0.68rem',
                    color: T.textMuted, mt: 0.25,
                }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
        <Button onClick={onSeeAll}
            endIcon={<ChevronRightIcon sx={{ fontSize: '0.85rem !important', ml: -0.5 }} />}
            sx={{
                textTransform: 'none', color: '#325fec',
                fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '0.72rem',
                px: 1.2, py: 0.4, borderRadius: '6px',
                bgcolor: T.primaryLight, minWidth: 0,
                '&:hover': { bgcolor: '#d9eaff' },
            }}
        >
            See All
        </Button>
    </Box>
);

// ── Section Divider ───────────────────────────────────────────────────────────
const SectionDivider = () => <Box sx={{ height: 8, bgcolor: '#F1F3F6' }} />;

// ── Scroll Rail ───────────────────────────────────────────────────────────────
const ScrollRail = ({ children }) => (
    <Box sx={{
        display: 'flex', gap: '10px', overflowX: 'auto',
        pb: 1.5, px: { xs: 2, sm: 3, md: 4 },
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
    }}>
        {children}
    </Box>
);

// ── Shop Card ─────────────────────────────────────────────────────────────────
const ShopCard = ({ shop, onClick, index = 0 }) => (
    <Box onClick={onClick} sx={{
        minWidth: { xs: 158, sm: 180, md: 200 },
        maxWidth: { xs: 158, sm: 180, md: 200 },
        flexShrink: 0, borderRadius: '10px', overflow: 'hidden',
        bgcolor: T.card, cursor: 'pointer',
        boxShadow: T.shadow, border: `1px solid ${T.border}`,
        transition: 'transform 0.18s',
        animation: 'fadeInCard 0.4s ease both',
        animationDelay: `${index * 0.06}s`,
        '&:active': { transform: 'scale(0.97)' },
        '&:hover': { boxShadow: T.shadowMd },
    }}>
        <Box sx={{ width: '100%', height: { xs: 105, sm: 120 }, bgcolor: '#F5F5F5', overflow: 'hidden', position: 'relative' }}>
            {shop.shop_image ? (
                <img src={shop.shop_image} alt={shop.business_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.primaryLight }}>
                    <StoreIcon sx={{ fontSize: 32, color: '#325fec' }} />
                </Box>
            )}
            {shop.is_verified && (
                <Box sx={{
                    position: 'absolute', bottom: 6, left: 6,
                    bgcolor: T.green, borderRadius: '4px',
                    px: 0.6, py: 0.15, display: 'flex', alignItems: 'center', gap: 0.3,
                }}>
                    <VerifiedIcon sx={{ fontSize: '0.55rem', color: '#fff' }} />
                    <Typography sx={{ fontSize: '0.52rem', color: '#fff', fontWeight: 700, fontFamily: '"Inter", sans-serif' }}>
                        Verified
                    </Typography>
                </Box>
            )}
        </Box>
        <Box sx={{ p: '8px 10px 10px' }}>
            <Typography sx={{
                fontFamily: '"Inter", sans-serif', fontWeight: 700,
                fontSize: { xs: '0.78rem', sm: '0.82rem' }, color: T.text,
                lineHeight: 1.3, mb: 0.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
                {shop.business_name}
            </Typography>
            <Typography sx={{
                fontFamily: '"Inter", sans-serif', fontSize: '0.63rem',
                color: '#325fec', fontWeight: 600, mb: 0.5,
                bgcolor: T.primaryLight, display: 'inline-block',
                px: 0.7, py: 0.1, borderRadius: '4px',
            }}>
                {shop.category}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.3 }}>
                <LocationIcon sx={{ fontSize: '0.6rem', color: T.textMuted }} />
                <Typography sx={{ fontSize: '0.61rem', color: T.textMuted, fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                    {shop.area}, {shop.city}
                </Typography>
            </Box>
        </Box>
    </Box>
);

// ── House Card ────────────────────────────────────────────────────────────────
const HouseCard = ({ house, onClick, index = 0 }) => (
    <Box onClick={onClick} sx={{
        minWidth: { xs: 195, sm: 220, md: 240 },
        maxWidth: { xs: 195, sm: 220, md: 240 },
        flexShrink: 0, borderRadius: '10px', overflow: 'hidden',
        bgcolor: T.card, cursor: 'pointer',
        boxShadow: T.shadow, border: `1px solid ${T.border}`,
        transition: 'transform 0.18s',
        animation: 'fadeInCard 0.4s ease both',
        animationDelay: `${index * 0.06}s`,
        '&:active': { transform: 'scale(0.97)' },
        '&:hover': { boxShadow: T.shadowMd },
    }}>
        <Box sx={{ width: '100%', height: { xs: 120, sm: 135 }, bgcolor: '#F5F5F5', overflow: 'hidden', position: 'relative' }}>
            {house.house_image ? (
                <img src={house.house_image} alt="House"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.greenLight }}>
                    <HomeIcon sx={{ fontSize: 36, color: T.green }} />
                </Box>
            )}
            <Box sx={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)',
                pt: 3, pb: 1, px: 1,
            }}>
                <Typography sx={{
                    fontFamily: '"Inter", sans-serif', fontWeight: 800,
                    fontSize: '0.92rem', color: '#fff', lineHeight: 1,
                }}>
                    {formatPrice(house.rent_per_month)}
                    <span style={{ fontWeight: 400, fontSize: '0.62rem', opacity: 0.85 }}>/mo</span>
                </Typography>
            </Box>
        </Box>
        <Box sx={{ p: '8px 10px 10px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.4 }}>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.84rem' }, color: T.text }}>
                    {house.rooms} BHK House
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, bgcolor: T.greenLight, px: 0.6, py: 0.15, borderRadius: '4px' }}>
                    <ApartmentIcon sx={{ fontSize: '0.6rem', color: T.green }} />
                    <Typography sx={{ fontSize: '0.56rem', color: T.green, fontWeight: 700, fontFamily: '"Inter", sans-serif' }}>
                        Rent
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <LocationIcon sx={{ fontSize: '0.6rem', color: T.textMuted }} />
                <Typography sx={{ fontSize: '0.61rem', color: T.textMuted, fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                    {house.area}, {house.city}
                </Typography>
            </Box>
        </Box>
    </Box>
);

// ── Job Card ──────────────────────────────────────────────────────────────────
const JobCard = ({ job, onClick, index = 0 }) => (
    <Box onClick={onClick} sx={{
        minWidth: { xs: 210, sm: 230, md: 250 },
        maxWidth: { xs: 210, sm: 230, md: 250 },
        flexShrink: 0, borderRadius: '10px', bgcolor: T.card, cursor: 'pointer',
        p: '12px', boxShadow: T.shadow, border: `1px solid ${T.border}`,
        transition: 'transform 0.18s',
        animation: 'fadeInCard 0.4s ease both',
        animationDelay: `${index * 0.06}s`,
        '&:active': { transform: 'scale(0.97)' },
        '&:hover': { boxShadow: T.shadowMd },
    }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
            <Box sx={{
                width: 36, height: 36, borderRadius: '8px', flexShrink: 0,
                bgcolor: T.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(50,95,236,0.15)',
            }}>
                <WorkIcon sx={{ fontSize: '1rem', color: '#325fec' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{
                    fontFamily: '"Inter", sans-serif', fontWeight: 700,
                    fontSize: { xs: '0.8rem', sm: '0.84rem' }, color: T.text,
                    lineHeight: 1.25, mb: 0.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {job.job_title}
                </Typography>
                <Typography sx={{
                    fontSize: '0.64rem', color: T.textMuted, fontFamily: '"Inter", sans-serif',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {job.shop_name || job.company_name}
                </Typography>
            </Box>
        </Box>
        <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            bgcolor: T.primaryLight, borderRadius: '6px', px: 1, py: 0.6, mb: 0.9,
        }}>
            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '0.86rem', color: '#325fec' }}>
                {formatPrice(job.salary)}
                <span style={{ fontWeight: 400, fontSize: '0.6rem', color: T.textMuted }}>
                    /{job.salary_type === 'month' ? 'mo' : 'day'}
                </span>
            </Typography>
            <Chip
                label={job.job_type === 'full_time' ? 'Full Time' : 'Part Time'}
                size="small"
                sx={{
                    height: 17, fontSize: '0.54rem', fontFamily: '"Inter", sans-serif', fontWeight: 700,
                    bgcolor: job.job_type === 'full_time' ? T.greenLight : T.orangeLight,
                    color: job.job_type === 'full_time' ? T.green : T.orange,
                    borderRadius: '4px', border: 'none',
                    '& .MuiChip-label': { px: 0.7 },
                }}
            />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <LocationIcon sx={{ fontSize: '0.6rem', color: T.textMuted }} />
            <Typography sx={{ fontSize: '0.61rem', color: T.textMuted, fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                {job.area}, {job.city}
            </Typography>
        </Box>
    </Box>
);

// ── Feature Grid ──────────────────────────────────────────────────────────────
const FeatureGrid = ({ onNavigate }) => {
    const items = [
        {
            label: 'Shop Finder', sub: 'Discover local stores', color: '#325fec',
            bg: 'linear-gradient(135deg, #EBF3FF 0%, #D6E8FF 100%)',
            icon: StorefrontIcon, route: '/app/shops',
        },
        {
            label: 'Rent a Home', sub: 'PGs & flats near you', color: T.green,
            bg: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
            icon: HomeWorkIcon, route: '/app/houses',
        },
        {
            label: 'Get Hired', sub: 'Browse local openings', color: '#E65100',
            bg: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
            icon: WorkOutlineIcon, route: '/app/jobs',
        },
        {
            label: 'Map View', sub: 'Explore listings on map', color: '#7B1FA2',
            bg: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
            icon: MapIcon, route: '/map',
        },
    ];
    return (
        <Box sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: 1.5,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: { xs: 1.2, sm: 1.5 },
        }}>
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <Box
                        key={item.label}
                        onClick={() => item.route && onNavigate(item.route)}
                        sx={{
                            borderRadius: '12px',
                            p: { xs: '13px 11px', sm: '16px 14px' },
                            background: item.bg, cursor: 'pointer',
                            border: `1.5px solid ${item.color}22`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                            '&:active': { transform: 'scale(0.96)' },
                            '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.1)' },
                        }}
                    >
                        <Icon sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem' }, color: item.color, mb: 0.8 }} />
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif', fontWeight: 800,
                            fontSize: { xs: '0.84rem', sm: '0.9rem' },
                            color: T.text, lineHeight: 1.2, mb: 0.2,
                        }}>
                            {item.label}
                        </Typography>
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif', fontSize: { xs: '0.62rem', sm: '0.67rem' },
                            color: T.textSub, lineHeight: 1.3,
                        }}>
                            {item.sub}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
};

// ── Boost Banner (#325fec, no Learn More button) ──────────────────────────────
const BoostBanner = ({ onLearnMore }) => (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Box
            onClick={onLearnMore}
            sx={{
                borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
                background: 'linear-gradient(135deg, #1a45c8 0%, #325fec 55%, #4f78f5 100%)',
                boxShadow: '0 6px 24px rgba(50,95,236,0.35)',
                p: { xs: '16px 18px', sm: '20px 24px' },
                position: 'relative',
                transition: 'transform 0.15s',
                '&:active': { transform: 'scale(0.985)' },
                '&:hover': { boxShadow: '0 8px 30px rgba(50,95,236,0.45)' },
            }}
        >
            {/* Decorative circles */}
            <Box sx={{ position: 'absolute', right: -20, top: -20, width: 110, height: 110, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', right: 30, bottom: -28, width: 70, height: 70, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', left: -15, bottom: -15, width: 60, height: 60, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <Box sx={{ flex: 1, pr: { xs: 1, sm: 2 } }}>
                    {/* Tag */}
                    <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.4,
                        bgcolor: 'rgba(255,255,255,0.18)', borderRadius: '5px',
                        px: 0.9, py: 0.2, mb: { xs: 0.9, sm: 1 },
                        border: '1px solid rgba(255,255,255,0.25)',
                    }}>
                        <SparkleIcon sx={{ fontSize: '0.6rem', color: '#FFD600' }} />
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif', fontSize: '0.54rem',
                            fontWeight: 800, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>
                            Coming Soon
                        </Typography>
                    </Box>

                    <Typography sx={{
                        fontFamily: '"Inter", sans-serif', fontWeight: 800,
                        fontSize: { xs: '1.08rem', sm: '1.2rem' },
                        color: '#fff', lineHeight: 1.2, mb: 0.4, letterSpacing: '-0.02em',
                    }}>
                        NearZO Boost
                    </Typography>
                    <Typography sx={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        color: 'rgba(255,255,255,0.82)', lineHeight: 1.45,
                    }}>
                        Get 10× more views with premium placement & real-time analytics
                    </Typography>
                </Box>

                {/* Icons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.9 }}>
                    <Box sx={{
                        width: { xs: 46, sm: 52 }, height: { xs: 46, sm: 52 },
                        borderRadius: '14px',
                        bgcolor: 'rgba(255,255,255,0.18)',
                        border: '1.5px solid rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <RocketIcon sx={{ fontSize: { xs: '1.3rem', sm: '1.45rem' }, color: '#fff' }} />
                    </Box>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: '10px',
                        bgcolor: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <TrendingUpIcon sx={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }} />
                    </Box>
                </Box>
            </Box>
        </Box>
    </Box>
);

// ── Location Dialog ───────────────────────────────────────────────────────────
const LocationPermissionDialog = ({ open, onClose, onAllow, onManualCity, loading }) => {
    const [manualCity, setManualCity] = useState('');
    const handleManualSubmit = () => {
        if (manualCity.trim()) { onManualCity(manualCity.trim()); setManualCity(''); }
    };
    return (
        <Dialog open={open} onClose={onClose}
            PaperProps={{ sx: { borderRadius: '18px', maxWidth: '360px', width: '92%', p: 0.5, mx: 'auto' } }}
        >
            <Box sx={{ bgcolor: '#325fec', p: '18px 22px 15px', borderRadius: '14px 14px 0 0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon sx={{ color: '#FFD600', fontSize: '1.3rem' }} />
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                        Set Your Location
                    </Typography>
                </Box>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.78)', mt: 0.5 }}>
                    Get results for shops, houses & jobs near you.
                </Typography>
            </Box>
            <DialogContent sx={{ pt: 2.5, px: 2.5 }}>
                <Button fullWidth variant="contained"
                    startIcon={loading ? null : <MyLocationIcon />}
                    onClick={onAllow} disabled={loading}
                    sx={{
                        bgcolor: '#325fec', borderRadius: '10px', py: 1.2,
                        textTransform: 'none', fontFamily: '"Inter", sans-serif',
                        fontWeight: 700, fontSize: '0.85rem', mb: 2,
                        '&:hover': { bgcolor: T.primaryDark },
                        boxShadow: '0 3px 12px rgba(50,95,236,0.4)',
                    }}
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Use My Current Location'}
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.8 }}>
                    <Box sx={{ flex: 1, height: 1, bgcolor: T.border }} />
                    <Typography sx={{ fontSize: '0.7rem', color: T.textMuted, fontFamily: '"Inter", sans-serif' }}>or type your city</Typography>
                    <Box sx={{ flex: 1, height: 1, bgcolor: T.border }} />
                </Box>
                <TextField
                    placeholder="e.g. Mumbai, Vellore, Chennai…"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                    size="small" fullWidth
                    sx={{
                        mb: 1.3,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '10px', fontFamily: '"Inter", sans-serif', fontSize: '0.85rem',
                            '&.Mui-focused fieldset': { borderColor: '#325fec' },
                        }
                    }}
                />
                <Button fullWidth variant="outlined"
                    onClick={handleManualSubmit}
                    disabled={!manualCity.trim() || loading}
                    sx={{
                        borderRadius: '10px', py: 1, textTransform: 'none',
                        fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '0.83rem',
                        borderColor: '#325fec', color: '#325fec',
                        '&:hover': { bgcolor: T.primaryLight, borderColor: T.primaryDark },
                    }}
                >
                    Search This City
                </Button>
            </DialogContent>
            <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 0, justifyContent: 'center' }}>
                <Button onClick={onClose} sx={{
                    color: T.textMuted, textTransform: 'none',
                    fontFamily: '"Inter", sans-serif', fontSize: '0.78rem',
                }}>
                    Skip for now
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1.5 }}>
            <Skeleton variant="text" width={70} height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="rounded" height={30} width={170} sx={{ borderRadius: '8px' }} />
        </Box>
        <Box sx={{ px: { xs: 2, sm: 3 } }}>
            <Skeleton variant="rounded" sx={{ height: { xs: 200, sm: 300, md: 400 }, borderRadius: '12px', mb: 0 }} />
        </Box>
        <Skeleton variant="rounded" height={52} sx={{ mx: 0, borderRadius: 0, mt: 0, mb: 1 }} />
        <Box sx={{ px: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2, mb: 2 }}>
                {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: '12px' }} />)}
            </Box>
            {[1,2,3].map(s => (
                <Box key={s} sx={{ mb: 2.5 }}>
                    <Skeleton variant="text" width={160} height={28} sx={{ mb: 1 }} />
                    <Box sx={{ display: 'flex', gap: 1.2 }}>
                        {[1,2,3].map((_, i) => <Skeleton key={i} variant="rounded" width={160} height={170} sx={{ borderRadius: '10px' }} />)}
                    </Box>
                </Box>
            ))}
        </Box>
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
    const [currentCity, setCurrentCity] = useState('');
    const [showCitySnackbar, setShowCitySnackbar] = useState(false);
    const [detectedCity, setDetectedCity] = useState('');

    const getCityFromCoordinates = async (latitude, longitude) => {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            { headers: { 'User-Agent': 'NearZO-App/1.0' } }
        );
        const data = await response.json();
        if (data?.address) {
            const city = data.address.city || data.address.town || data.address.village ||
                         data.address.municipality || data.address.county;
            if (city) return city;
        }
        throw new Error('City not found');
    };

    const getCurrentLocationCity = () => new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }
        navigator.geolocation.getCurrentPosition(
            async ({ coords: { latitude, longitude } }) => {
                try { resolve(await getCityFromCoordinates(latitude, longitude)); }
                catch (e) { reject(e); }
            },
            (err) => {
                const msgs = { 1: 'Location permission denied.', 2: 'Location unavailable.', 3: 'Location request timed out.' };
                reject(new Error(msgs[err.code] || 'Unable to get location'));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });

    const loadHomeData = async (city, showNotification = false) => {
        setLoading(true); setError('');
        try {
            const result = await getHomeData(city);
            setHomeData(result); setCurrentCity(city);
            if (showNotification && city !== currentCity && currentCity !== '') {
                setDetectedCity(city); setShowCitySnackbar(true);
            }
            if (user?.id && city !== user.city) {
                try { await updateUserCity(city); if (updateUser) updateUser({ ...user, city }); } catch {}
            }
        } catch (err) {
            setError(err.message || 'Failed to load');
        } finally { setLoading(false); }
    };

    const handleAllowLocation = async () => {
        setLocationLoading(true);
        try {
            const city = await getCurrentLocationCity();
            setLocationDialogOpen(false);
            await loadHomeData(city, true);
        } catch (err) {
            setError(err.message);
            await loadHomeData(user?.city || 'Vellore');
        } finally { setLocationLoading(false); }
    };

    const handleManualCity = async (city) => { setLocationDialogOpen(false); await loadHomeData(city, true); };
    const handleSkipLocation = async () => { setLocationDialogOpen(false); await loadHomeData(user?.city || 'Vellore'); };

    useEffect(() => {
        const init = async () => {
            try {
                const city = await getCurrentLocationCity();
                await loadHomeData(city, false);
                if (user?.id && city !== user.city) {
                    try { await updateUserCity(city); if (updateUser) updateUser({ ...user, city }); } catch {}
                }
                return;
            } catch {}
            if (user?.city) { await loadHomeData(user.city); return; }
            try {
                const res = await getUserCity();
                if (res.city) await loadHomeData(res.city);
                else setLocationDialogOpen(true);
            } catch { setLocationDialogOpen(true); }
        };
        init();
    }, []);

    const adSliderSettings = {
        dots: true, infinite: true, speed: 600,
        slidesToShow: 1, slidesToScroll: 1, autoplay: true,
        autoplaySpeed: 4500, arrows: false, pauseOnHover: true,
        dotsClass: 'slick-dots nearzo-dots', adaptiveHeight: false,
    };

    if (loading && !homeData.city) return <LoadingSkeleton />;

    if (error && !locationDialogOpen) return (
        <Box sx={{ p: 2 }}>
            <Alert severity="error" sx={{ borderRadius: '10px', fontFamily: '"Inter", sans-serif' }}
                action={<Button color="inherit" size="small" onClick={() => setLocationDialogOpen(true)}>Retry</Button>}
            >{error}</Alert>
        </Box>
    );

    const displayCity = homeData.city || currentCity;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; font-family: 'Inter', sans-serif; }

                @keyframes fadeInCard {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes featureSlideIn {
                    from { opacity: 0; transform: translateX(18px); }
                    to   { opacity: 1; transform: translateX(0); }
                }

                .nearzo-ad-slider .slick-slide > div { height: 100%; }
                .nearzo-ad-slider .slick-list       { height: 100%; }
                .nearzo-ad-slider .slick-track      { height: 100%; display: flex; }
                .nearzo-ad-slider .slick-slide      { height: inherit; }
                .nearzo-dots { bottom: 12px !important; }
                .nearzo-dots li button:before {
                    color: rgba(255,255,255,0.8) !important;
                    font-size: 7px !important; opacity: 1 !important;
                }
                .nearzo-dots li.slick-active button:before {
                    color: #fff !important; font-size: 9px !important;
                }
            `}</style>

            <LocationPermissionDialog
                open={locationDialogOpen} onClose={handleSkipLocation}
                onAllow={handleAllowLocation} onManualCity={handleManualCity}
                loading={locationLoading}
            />

            <Snackbar
                open={showCitySnackbar} autoHideDuration={4000}
                onClose={() => setShowCitySnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="info" icon={<GpsFixedIcon />} sx={{
                    borderRadius: '10px', fontFamily: '"Inter", sans-serif',
                    bgcolor: '#325fec', color: '#fff',
                    '& .MuiAlert-icon': { color: '#FFD600' },
                }}>
                    Now showing results for <strong>{detectedCity}</strong>
                </Alert>
            </Snackbar>

            <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', pb: 6 }}>

                {/* 1 ── City Header */}
                <CityHeader
                    city={displayCity}
                    onCityClick={() => setLocationDialogOpen(true)}
                    onRefresh={() => setLocationDialogOpen(true)}
                />

                {/* 2 ── Ad Slider — tall on desktop, proportional on mobile */}
                {homeData.ads?.length > 0 && (
                    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 0 }}>
                        <Box sx={{
                            borderRadius: '14px', overflow: 'hidden',
                            height: { xs: 200, sm: 300, md: 420, lg: 800 },
                            boxShadow: T.shadowMd,
                        }} className="nearzo-ad-slider">
                            <Slider {...adSliderSettings} style={{ height: '100%' }}>
                                {homeData.ads.map((ad) => (
                                    <Box key={ad.id} onClick={() => navigate(`/app/shops/${ad.shop_id}`)}
                                        sx={{ cursor: 'pointer', height: '100%', display: 'block !important', position: 'relative' }}>
                                        <Box component="img" src={ad.image_url} alt={ad.title}
                                            sx={{
                                                width: '100%',
                                                height: { xs: 200, sm: 300, md: 420, lg: 800 },
                                                objectFit: 'cover', display: 'block',
                                            }} />
                                        <Box sx={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 55%)',
                                        }} />
                                    </Box>
                                ))}
                            </Slider>
                        </Box>
                    </Box>
                )}

                {/* 3 ── Feature Highlights Strip */}
                <FeatureHighlightsStrip />

                {/* 4 ── Feature Grid */}
                <FeatureGrid onNavigate={navigate} />

                <SectionDivider />

                {/* 5 ── Shops */}
                {homeData.shops?.length > 0 && (
                    <Box sx={{ bgcolor: '#fff' }}>
                        <SectionHeader
                            title={`Shops in ${displayCity}`}
                            subtitle="Local businesses near you"
                            badge="NEW"
                            onSeeAll={() => navigate('/app/shops')}
                        />
                        <ScrollRail>
                            {homeData.shops.map((shop, i) => (
                                <ShopCard key={shop.id} shop={shop} index={i} onClick={() => navigate(`/app/shops/${shop.id}`)} />
                            ))}
                        </ScrollRail>
                        <Box sx={{ height: 10 }} />
                    </Box>
                )}

                <SectionDivider />

                {/* 6 ── Houses */}
                {homeData.houses?.length > 0 && (
                    <Box sx={{ bgcolor: '#fff' }}>
                        <SectionHeader
                            title={`Houses in ${displayCity}`}
                            subtitle="PGs, flats & rooms for rent"
                            onSeeAll={() => navigate('/app/houses')}
                        />
                        <ScrollRail>
                            {homeData.houses.map((house, i) => (
                                <HouseCard key={house.id} house={house} index={i} onClick={() => navigate(`/app/houses/${house.id}`)} />
                            ))}
                        </ScrollRail>
                        <Box sx={{ height: 10 }} />
                    </Box>
                )}

                <SectionDivider />

                {/* 7 ── Boost Banner */}
                <Box sx={{ bgcolor: '#fff', py: 2.5 }}>
                    <BoostBanner onLearnMore={() => navigate('/app/boost')} />
                </Box>

                <SectionDivider />

                {/* 8 ── Jobs */}
                {homeData.jobs?.length > 0 && (
                    <Box sx={{ bgcolor: '#fff' }}>
                        <SectionHeader
                            title={`Jobs in ${displayCity}`}
                            subtitle="Full-time & part-time openings"
                            badge="HOT"
                            onSeeAll={() => navigate('/app/jobs')}
                        />
                        <ScrollRail>
                            {homeData.jobs.map((job, i) => (
                                <JobCard key={job.id} job={job} index={i} onClick={() => navigate(`/app/jobs/${job.id}`)} />
                            ))}
                        </ScrollRail>
                        <Box sx={{ height: 10 }} />
                    </Box>
                )}

                {/* 9 ── Empty State */}
                {!homeData.shops?.length && !homeData.houses?.length && !homeData.jobs?.length && !loading && (
                    <Box sx={{ bgcolor: '#fff', textAlign: 'center', py: 10, px: 4 }}>
                        <Box sx={{
                            width: 72, height: 72, borderRadius: '18px',
                            bgcolor: T.primaryLight, border: '2px solid rgba(50,95,236,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            mx: 'auto', mb: 2.5,
                            boxShadow: '0 4px 20px rgba(50,95,236,0.18)',
                        }}>
                            <LocationIcon sx={{ fontSize: '2rem', color: '#325fec' }} />
                        </Box>
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif', fontWeight: 800,
                            fontSize: '1.1rem', color: T.text, mb: 0.5,
                        }}>
                            No listings found nearby
                        </Typography>
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif', fontSize: '0.8rem',
                            color: T.textSub, mb: 3,
                        }}>
                            We couldn't find shops, houses, or jobs in {displayCity}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setLocationDialogOpen(true)}
                            startIcon={<GpsFixedIcon />}
                            sx={{
                                bgcolor: '#325fec', borderRadius: '10px', py: 1.1, px: 3,
                                textTransform: 'none', fontFamily: '"Inter", sans-serif',
                                fontWeight: 700, fontSize: '0.85rem',
                                boxShadow: '0 4px 16px rgba(50,95,236,0.4)',
                                '&:hover': { bgcolor: T.primaryDark },
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