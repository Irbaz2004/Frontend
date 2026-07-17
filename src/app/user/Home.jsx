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
    North as NorthIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getHomeData, getUserCity, updateUserCity } from '../../services/homeUser';
import { getCityOptions } from '../../services/location';
import { useAuth } from '../context/AuthContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import shopImagePlaceholder from '../../assets/shop.png';
import houseImagePlaceholder from '../../assets/house.png';
import jobImagePlaceholder from '../../assets/job.png';
import mapImagePlaceholder from '../../assets/map.png';

const GEO_TIMEOUT_MS = 12000;
const GEO_MAX_AGE_MS = 0;
const MAX_ACCEPTED_ACCURACY_METERS = 25000;
let supportedCitiesCache = null;

const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(price);

const normalizeLocationName = (value = '') =>
    String(value).trim().replace(/\s+/g, ' ');

const normalizeCompare = (value = '') =>
    normalizeLocationName(value).toLowerCase();

const getSupportedCityNames = async () => {
    if (supportedCitiesCache) return supportedCitiesCache;

    try {
        const cities = await getCityOptions();
        supportedCitiesCache = (cities || [])
            .map((city) => normalizeLocationName(typeof city === 'string' ? city : city?.city || city?.name))
            .filter(Boolean);
    } catch (error) {
        console.error('Failed to load supported cities for location matching:', error);
        supportedCitiesCache = [];
    }
    return supportedCitiesCache;
};

const pickSupportedCity = (address = {}, displayName = '') => {
    const addressCandidates = [
        address.city,
        address.town,
        address.municipality,
        address.city_district,
        address.state_district,
        address.county,
        address.village,
        address.suburb,
    ].map(normalizeLocationName).filter(Boolean);

    return getSupportedCityNames()
        .then((supportedCities) => {
            if (!supportedCities.length) return addressCandidates[0] || '';

            const exactCandidate = addressCandidates.find((candidate) =>
                supportedCities.some((city) => normalizeCompare(city) === normalizeCompare(candidate))
            );
            if (exactCandidate) {
                return supportedCities.find((city) => normalizeCompare(city) === normalizeCompare(exactCandidate)) || exactCandidate;
            }

            const searchableAddress = normalizeCompare([
                displayName,
                ...Object.values(address).filter((value) => typeof value === 'string'),
            ].join(' '));

            const containedCity = supportedCities.find((city) => {
                const normalizedCity = normalizeCompare(city);
                return searchableAddress.includes(normalizedCity);
            });

            return containedCity || addressCandidates[0] || '';
        });
};

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
    primary: '#2952E8',
    primaryDark: '#1A3BB8',
    primaryLight: '#EEF2FF',
    primaryGlow: 'rgba(41,82,232,0.12)',
    orange: '#F05A00',
    orangeLight: '#FFF0E6',
    green: '#16A34A',
    greenLight: '#DCFCE7',
    purple: '#7C3AED',
    purpleLight: '#EDE9FE',
    surface: '#F7F8FC',
    surfaceAlt: '#F0F2F8',
    card: '#FFFFFF',
    text: '#0F1729',
    textSub: '#4B5568',
    textMuted: '#94A3B8',
    border: '#E8ECF4',
    borderStrong: '#CBD5E1',
    shadow: '0 1px 4px rgba(15,23,41,0.06), 0 4px 12px rgba(15,23,41,0.06)',
    shadowMd: '0 4px 16px rgba(15,23,41,0.1), 0 1px 4px rgba(15,23,41,0.06)',
    shadowLg: '0 8px 32px rgba(15,23,41,0.14)',
    radius: '14px',
    radiusSm: '10px',
    radiusXs: '7px',
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
            mx: { xs: 2, sm: 3, md: 4 }, mt: 2,
            borderRadius: T.radius,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #1A3BB8 0%, #2952E8 60%, #5B7EFF 100%)',
            boxShadow: '0 6px 28px rgba(41,82,232,0.28)',
            px: { xs: 2, sm: 2.5 }, py: '14px',
            display: 'flex', alignItems: 'center', gap: '10px',
            position: 'relative',
        }}>
            <Box sx={{ position: 'absolute', right: -24, top: -24, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', right: 24, bottom: -32, width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

            {FEATURE_HIGHLIGHTS.map((f, i) => {
                const Icon = f.icon;
                return (
                    <Box key={i} sx={{
                        display: i === active ? 'flex' : 'none',
                        alignItems: 'center', gap: '12px',
                        flex: 1, minWidth: 0, position: 'relative', zIndex: 1,
                        animation: 'featureSlideIn 0.4s cubic-bezier(0.22,1,0.36,1)',
                    }}>
                        <Box sx={{
                            width: 36, height: 36, flexShrink: 0,
                            borderRadius: '10px',
                            bgcolor: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Icon sx={{ fontSize: '1.05rem', color: '#fff' }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.84rem' }, color: '#fff', lineHeight: 1.2 }}>
                                {f.label}
                            </Typography>
                            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: { xs: '0.64rem', sm: '0.67rem' }, color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>
                                {f.sub}
                            </Typography>
                        </Box>
                    </Box>
                );
            })}

            <Box sx={{ display: 'flex', gap: '4px', flexShrink: 0, ml: 'auto', position: 'relative', zIndex: 1 }}>
                {FEATURE_HIGHLIGHTS.map((_, i) => (
                    <Box key={i} onClick={() => setActive(i)} sx={{
                        width: i === active ? 18 : 5, height: 5, borderRadius: '4px',
                        bgcolor: i === active ? '#fff' : 'rgba(255,255,255,0.28)',
                        transition: 'width 0.3s ease',
                        cursor: 'pointer',
                    }} />
                ))}
            </Box>
        </Box>
    );
};

// ── City Header ───────────────────────────────────────────────────────────────
const CityHeader = ({ city, onCityClick, onRefresh }) => (
    <Box sx={{
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2.5, sm: 3 }, pb: 1.5,
        bgcolor: '#fff',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
        <Box onClick={onCityClick} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, cursor: 'pointer' }}>
            <Box sx={{
                width: 32, height: 32, borderRadius: '9px',
                background: 'linear-gradient(135deg, #2952E8, #5B7EFF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(41,82,232,0.3)',
            }}>
                <LocationIcon sx={{ fontSize: '0.95rem', color: '#fff' }} />
            </Box>
            <Box>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.58rem', color: T.textMuted, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1 }}>
                    Exploring
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.18rem' }, color: T.text, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                        {city || 'Loading…'}
                    </Typography>
                    <ArrowDownIcon sx={{ fontSize: '1rem', color: T.textMuted, mt: '1px' }} />
                </Box>
            </Box>
        </Box>
        <Button size="small" onClick={onRefresh}
            startIcon={<GpsFixedIcon sx={{ fontSize: '0.8rem !important' }} />}
            sx={{
                textTransform: 'none', fontFamily: '"Inter", sans-serif',
                fontWeight: 700, fontSize: '0.7rem', color: T.primary,
                bgcolor: T.primaryGlow, borderRadius: '20px',
                px: 1.5, py: 0.5, border: `1px solid rgba(41,82,232,0.15)`,
                '&:hover': { bgcolor: T.primaryLight },
                '& .MuiButton-startIcon': { mr: 0.5 },
            }}
        >
            Refresh
        </Button>
    </Box>
);

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, badge, onSeeAll }) => (
    <Box sx={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        px: { xs: 2, sm: 3, md: 4 }, pt: 2.5, pb: 1.2,
    }}>
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.1rem' }, color: T.text, letterSpacing: '-0.025em', lineHeight: 1 }}>
                    {title}
                </Typography>
                {badge && (
                    <Box sx={{
                        bgcolor: badge === 'HOT' ? T.orange : T.primary,
                        borderRadius: '5px', px: 0.7, py: '2px',
                    }}>
                        <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#fff', fontFamily: '"Inter", sans-serif', letterSpacing: '0.08em' }}>
                            {badge}
                        </Typography>
                    </Box>
                )}
            </Box>
            {subtitle && (
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.68rem', color: T.textMuted }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
        <Button onClick={onSeeAll}
            endIcon={<ChevronRightIcon sx={{ fontSize: '0.88rem !important', ml: -0.6 }} />}
            sx={{
                textTransform: 'none', color: T.primary,
                fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '0.72rem',
                px: 1.2, py: 0.45, borderRadius: '8px',
                bgcolor: T.primaryGlow, minWidth: 0,
                border: `1px solid rgba(41,82,232,0.12)`,
                '&:hover': { bgcolor: T.primaryLight },
                '& .MuiButton-endIcon': { ml: 0.2 },
            }}
        >
            See All
        </Button>
    </Box>
);

// ── Section Divider ───────────────────────────────────────────────────────────
const SectionDivider = () => <Box sx={{ height: 10, bgcolor: T.surface }} />;

// ── Scroll Rail ───────────────────────────────────────────────────────────────
const ScrollRail = ({ children }) => (
    <Box sx={{
        display: 'flex', gap: '12px', overflowX: 'auto',
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
        minWidth: { xs: 162, sm: 185, md: 210 },
        maxWidth: { xs: 162, sm: 185, md: 210 },
        flexShrink: 0, borderRadius: T.radius, overflow: 'hidden',
        bgcolor: T.card, cursor: 'pointer',
        boxShadow: T.shadow, border: `1px solid ${T.border}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        animation: 'fadeInCard 0.45s ease both',
        animationDelay: `${index * 0.07}s`,
        '&:active': { transform: 'scale(0.96)' },
        '&:hover': { boxShadow: T.shadowMd, transform: 'translateY(-2px)' },
    }}>
        <Box sx={{ width: '100%', height: { xs: 108, sm: 125 }, bgcolor: T.surfaceAlt, overflow: 'hidden', position: 'relative' }}>
            {shop.shop_image ? (
                <img src={shop.shop_image} alt={shop.business_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.primaryLight }}>
                    <StoreIcon sx={{ fontSize: 34, color: T.primary }} />
                </Box>
            )}
            {shop.is_verified && (
                <Box sx={{
                    position: 'absolute', bottom: 7, left: 7,
                    bgcolor: T.green, borderRadius: '5px',
                    px: 0.7, py: 0.2, display: 'flex', alignItems: 'center', gap: 0.3,
                }}>
                    <VerifiedIcon sx={{ fontSize: '0.55rem', color: '#fff' }} />
                    <Typography sx={{ fontSize: '0.52rem', color: '#fff', fontWeight: 700, fontFamily: '"Inter", sans-serif' }}>
                        Verified
                    </Typography>
                </Box>
            )}
        </Box>
        <Box sx={{ p: '10px 11px 12px' }}>
            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.84rem' }, color: T.text, lineHeight: 1.3, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {shop.business_name}
            </Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: T.primaryGlow, borderRadius: '5px', px: 0.8, py: '2px', mb: 0.7 }}>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.61rem', color: T.primary, fontWeight: 700 }}>
                    {shop.category}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <LocationIcon sx={{ fontSize: '0.62rem', color: T.textMuted }} />
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
        minWidth: { xs: 198, sm: 224, md: 248 },
        maxWidth: { xs: 198, sm: 224, md: 248 },
        flexShrink: 0, borderRadius: T.radius, overflow: 'hidden',
        bgcolor: T.card, cursor: 'pointer',
        boxShadow: T.shadow, border: `1px solid ${T.border}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        animation: 'fadeInCard 0.45s ease both',
        animationDelay: `${index * 0.07}s`,
        '&:active': { transform: 'scale(0.96)' },
        '&:hover': { boxShadow: T.shadowMd, transform: 'translateY(-2px)' },
    }}>
        <Box sx={{ width: '100%', height: { xs: 125, sm: 140 }, bgcolor: T.surfaceAlt, overflow: 'hidden', position: 'relative' }}>
            {house.house_image ? (
                <img src={house.house_image} alt="House"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: T.greenLight }}>
                    <HomeIcon sx={{ fontSize: 38, color: T.green }} />
                </Box>
            )}
            <Box sx={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)',
                pt: 4, pb: '10px', px: '10px',
            }}>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '0.96rem', color: '#fff', lineHeight: 1 }}>
                    {formatPrice(house.rent_per_month)}
                    <span style={{ fontWeight: 400, fontSize: '0.6rem', opacity: 0.82 }}>/mo</span>
                </Typography>
            </Box>
        </Box>
        <Box sx={{ p: '10px 11px 12px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: { xs: '0.82rem', sm: '0.86rem' }, color: T.text }}>
                    {house.rooms} BHK House
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, bgcolor: T.greenLight, px: 0.7, py: '2px', borderRadius: '5px' }}>
                    <ApartmentIcon sx={{ fontSize: '0.6rem', color: T.green }} />
                    <Typography sx={{ fontSize: '0.56rem', color: T.green, fontWeight: 700, fontFamily: '"Inter", sans-serif' }}>Rent</Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <LocationIcon sx={{ fontSize: '0.62rem', color: T.textMuted }} />
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
        minWidth: { xs: 215, sm: 238, md: 260 },
        maxWidth: { xs: 215, sm: 238, md: 260 },
        flexShrink: 0, borderRadius: T.radius, bgcolor: T.card, cursor: 'pointer',
        p: '13px', boxShadow: T.shadow, border: `1px solid ${T.border}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        animation: 'fadeInCard 0.45s ease both',
        animationDelay: `${index * 0.07}s`,
        '&:active': { transform: 'scale(0.96)' },
        '&:hover': { boxShadow: T.shadowMd, transform: 'translateY(-2px)' },
    }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.2 }}>
            <Box sx={{
                width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
                background: 'linear-gradient(135deg, #EEF2FF, #E0E8FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid rgba(41,82,232,0.12)`,
            }}>
                <WorkIcon sx={{ fontSize: '1.05rem', color: T.primary }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: { xs: '0.82rem', sm: '0.86rem' }, color: T.text, lineHeight: 1.25, mb: 0.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {job.job_title}
                </Typography>
                <Typography sx={{ fontSize: '0.64rem', color: T.textMuted, fontFamily: '"Inter", sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {job.shop_name || job.company_name}
                </Typography>
            </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: T.primaryGlow, borderRadius: T.radiusXs, px: 1, py: 0.7, mb: 1 }}>
            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '0.9rem', color: T.primary }}>
                {formatPrice(job.salary)}
                <span style={{ fontWeight: 400, fontSize: '0.6rem', color: T.textMuted }}>
                    /{job.salary_type === 'month' ? 'mo' : 'day'}
                </span>
            </Typography>
            <Chip
                label={job.job_type === 'full_time' ? 'Full Time' : 'Part Time'}
                size="small"
                sx={{
                    height: 18, fontSize: '0.54rem', fontFamily: '"Inter", sans-serif', fontWeight: 700,
                    bgcolor: job.job_type === 'full_time' ? T.greenLight : T.orangeLight,
                    color: job.job_type === 'full_time' ? T.green : T.orange,
                    borderRadius: '5px', border: 'none',
                    '& .MuiChip-label': { px: 0.8 },
                }}
            />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <LocationIcon sx={{ fontSize: '0.62rem', color: T.textMuted }} />
            <Typography sx={{ fontSize: '0.61rem', color: T.textMuted, fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                {job.area}, {job.city}
            </Typography>
        </Box>
    </Box>
);

// ── Feature Grid ──────────────────────────────────────────────────────────────
const GRID_ITEMS = [
    { label: 'Shop Finder',  sub: 'Discover local stores', icon: StorefrontIcon,  route: '/app/shops',   img: shopImagePlaceholder,  accent: '#2952E8', accentEnd: '#5B7EFF' },
    { label: 'Rent a Home',  sub: 'PGs & flats near you',  icon: HomeWorkIcon,    route: '/app/houses',  img: houseImagePlaceholder, accent: '#16A34A', accentEnd: '#4ADE80' },
    { label: 'Get Hired',    sub: 'Browse local openings', icon: WorkOutlineIcon, route: '/app/jobs',    img: jobImagePlaceholder,   accent: '#F05A00', accentEnd: '#FBBF24' },
    { label: 'Map View',     sub: 'Explore on map',        icon: MapIcon,         route: '/map',         img: mapImagePlaceholder,   accent: '#7C3AED', accentEnd: '#A78BFA' },
];

const FeatureGrid = ({ onNavigate }) => (
    <Box sx={{
        px: { xs: 2, sm: 3, md: 4 },
        pt: 1.5, pb: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: { xs: 1.2, sm: 1.5 },
    }}>
        {GRID_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
                <Box
                    key={item.label}
                    onClick={() => item.route && onNavigate(item.route)}
                    sx={{
                        borderRadius: T.radius, overflow: 'hidden',
                        position: 'relative', cursor: 'pointer',
                        height: { xs: 115, sm: 136 },
                        backgroundImage: `url(${item.img})`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        boxShadow: T.shadowMd,
                        transition: 'transform 0.18s, box-shadow 0.18s',
                        '&:active': { transform: 'scale(0.96)' },
                        '&:hover': { boxShadow: T.shadowLg, transform: 'translateY(-1px)' },
                    }}
                >
                    <Box sx={{
                        position: 'absolute', inset: 0,
                        backdropFilter: 'blur(2px) brightness(0.48)',
                        WebkitBackdropFilter: 'blur(2px) brightness(0.48)',
                    }} />
                    <Box sx={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
                        background: `linear-gradient(90deg, ${item.accent}, ${item.accentEnd}, transparent)`,
                    }} />
                    <Box sx={{
                        position: 'relative', zIndex: 1,
                        p: { xs: '13px 12px', sm: '16px 14px' },
                        height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            bgcolor: 'rgba(255,255,255,0.16)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.28)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Icon sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' }, color: '#fff' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: { xs: '0.86rem', sm: '0.93rem' }, color: '#fff', lineHeight: 1.2, mb: 0.15, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
                                {item.label}
                            </Typography>
                            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: { xs: '0.6rem', sm: '0.64rem' }, color: 'rgba(255,255,255,0.78)', lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                                {item.sub}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            );
        })}
    </Box>
);

// ── Boost Banner ──────────────────────────────────────────────────────────────
const BoostBanner = ({ onLearnMore }) => (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Box
            onClick={onLearnMore}
            sx={{
                borderRadius: T.radius, overflow: 'hidden', cursor: 'pointer',
                background: 'linear-gradient(135deg, #1A3BB8 0%, #2952E8 60%, #5B7EFF 100%)',
                boxShadow: '0 8px 32px rgba(41,82,232,0.32)',
                p: { xs: '18px 20px', sm: '22px 28px' },
                position: 'relative',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:active': { transform: 'scale(0.985)' },
                '&:hover': { boxShadow: '0 12px 40px rgba(41,82,232,0.4)', transform: 'translateY(-1px)' },
            }}
        >
            <Box sx={{ position: 'absolute', right: -28, top: -28, width: 130, height: 130, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', right: 24, bottom: -36, width: 88, height: 88, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', left: -18, bottom: -18, width: 72, height: 72, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <Box sx={{ flex: 1, pr: { xs: 1.5, sm: 3 } }}>
                    <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.5,
                        bgcolor: 'rgba(255,255,255,0.16)', borderRadius: '6px',
                        px: 1, py: '3px', mb: { xs: 1, sm: 1.2 },
                        border: '1px solid rgba(255,255,255,0.24)',
                    }}>
                        <SparkleIcon sx={{ fontSize: '0.6rem', color: '#FFD600' }} />
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.52rem', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Coming Soon
                        </Typography>
                    </Box>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: { xs: '1.12rem', sm: '1.25rem' }, color: '#fff', lineHeight: 1.2, mb: 0.5, letterSpacing: '-0.025em' }}>
                        NearZO Boost
                    </Typography>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: { xs: '0.71rem', sm: '0.77rem' }, color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>
                        Get 10× more views with premium placement & real-time analytics
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: { xs: 50, sm: 56 }, height: { xs: 50, sm: 56 }, borderRadius: '15px', bgcolor: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RocketIcon sx={{ fontSize: { xs: '1.4rem', sm: '1.55rem' }, color: '#fff' }} />
                    </Box>
                    <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUpIcon sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }} />
                    </Box>
                </Box>
            </Box>
        </Box>
    </Box>
);

// ── Location Dialog ───────────────────────────────────────────────────────────
const LocationPermissionDialog = ({ open, onClose, onAllow, onManualCity, loading, error }) => {
    const [manualCity, setManualCity] = useState('');
    const handleManualSubmit = () => {
        if (manualCity.trim()) { onManualCity(manualCity.trim()); setManualCity(''); }
    };
    return (
        <Dialog open={open} onClose={onClose}
            PaperProps={{ sx: { borderRadius: '20px', maxWidth: '380px', width: '92%', p: 0, mx: 'auto', overflow: 'hidden' } }}
        >
            <Box sx={{
                background: 'linear-gradient(135deg, #1A3BB8, #2952E8)',
                p: '20px 24px 18px',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LocationIcon sx={{ color: '#FFD600', fontSize: '1.1rem' }} />
                    </Box>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                        Set Your Location
                    </Typography>
                </Box>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.76rem', color: 'rgba(255,255,255,0.76)', mt: 0.7 }}>
                    Get results for shops, houses & jobs near you.
                </Typography>
            </Box>
            <DialogContent sx={{ pt: 2.5, px: 2.5, pb: 0 }}>
                <Button fullWidth variant="contained"
                    startIcon={loading ? null : <MyLocationIcon />}
                    onClick={onAllow} disabled={loading}
                    sx={{
                        background: 'linear-gradient(135deg, #1A3BB8, #2952E8)',
                        borderRadius: '11px', py: 1.25,
                        textTransform: 'none', fontFamily: '"Inter", sans-serif',
                        fontWeight: 700, fontSize: '0.87rem', mb: 2.2,
                        boxShadow: '0 4px 14px rgba(41,82,232,0.4)',
                        '&:hover': { background: 'linear-gradient(135deg, #1430A0, #2040D0)' },
                    }}
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Use My Current Location'}
                </Button>
                {error && (
                    <Alert severity="warning" sx={{ mb: 2, borderRadius: '11px', fontFamily: '"Inter", sans-serif', fontSize: '0.76rem' }}>
                        {error}
                    </Alert>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
                        mb: 1.5,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '11px', fontFamily: '"Inter", sans-serif', fontSize: '0.86rem',
                            '&.Mui-focused fieldset': { borderColor: T.primary },
                        }
                    }}
                />
                <Button fullWidth variant="outlined"
                    onClick={handleManualSubmit}
                    disabled={!manualCity.trim() || loading}
                    sx={{
                        borderRadius: '11px', py: 1.1, textTransform: 'none',
                        fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '0.84rem',
                        borderColor: T.primary, color: T.primary,
                        '&:hover': { bgcolor: T.primaryLight, borderColor: T.primaryDark },
                    }}
                >
                    Search This City
                </Button>
            </DialogContent>
            <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1.2, justifyContent: 'center' }}>
                <Button onClick={onClose} sx={{ color: T.textMuted, textTransform: 'none', fontFamily: '"Inter", sans-serif', fontSize: '0.78rem' }}>
                    Skip for now
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
    <Box sx={{ bgcolor: T.surface, minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1.5, bgcolor: '#fff', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '9px' }} />
                <Box>
                    <Skeleton variant="text" width={50} height={12} />
                    <Skeleton variant="text" width={100} height={22} />
                </Box>
            </Box>
            <Skeleton variant="rounded" width={80} height={30} sx={{ borderRadius: '20px' }} />
        </Box>

        {/* Ad Carousel */}
        <Box sx={{ p: { xs: 2, sm: 3 }, pb: 0 }}>
            <Skeleton variant="rounded" sx={{
                height: { xs: 210, sm: 290, md: 380, lg: 460 },
                borderRadius: T.radius,
            }} />
        </Box>

        {/* Feature Strip */}
        <Box sx={{ px: { xs: 2, sm: 3 }, mt: 2 }}>
            <Skeleton variant="rounded" height={56} sx={{ borderRadius: T.radius }} />
        </Box>

        {/* Feature Grid */}
        <Box sx={{ px: { xs: 2, sm: 3 }, mt: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {[1,2,3,4].map(i => (
                    <Skeleton key={i} variant="rounded" height={115} sx={{ borderRadius: T.radius }} />
                ))}
            </Box>
        </Box>

        <Box sx={{ height: 10, bgcolor: T.surface, mt: 2 }} />

        {/* Section skeletons */}
        {[1,2,3].map(s => (
            <Box key={s} sx={{ bgcolor: '#fff', px: { xs: 2, sm: 3 }, pt: 2.5, pb: 2, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box>
                        <Skeleton variant="text" width={160} height={24} />
                        <Skeleton variant="text" width={110} height={16} />
                    </Box>
                    <Skeleton variant="rounded" width={64} height={28} sx={{ borderRadius: '8px' }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {[1,2,3].map((_, i) => (
                        <Skeleton key={i} variant="rounded"
                            width={s === 3 ? 220 : s === 2 ? 200 : 165}
                            height={s === 3 ? 120 : s === 2 ? 185 : 185}
                            sx={{ borderRadius: T.radius, flexShrink: 0 }}
                        />
                    ))}
                </Box>
            </Box>
        ))}
    </Box>
);

// ── Ad Carousel with responsive heights ───────────────────────────────────────
const AdCarousel = ({ ads, onNavigate }) => {
    const adSliderSettings = {
        dots: true, infinite: true, speed: 600,
        slidesToShow: 1, slidesToScroll: 1, autoplay: true,
        autoplaySpeed: 4500, arrows: false, pauseOnHover: true,
        dotsClass: 'slick-dots nearzo-dots', adaptiveHeight: false,
    };

    return (
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 2 }}>
            <Box sx={{
                borderRadius: T.radius, overflow: 'hidden',
                boxShadow: T.shadowLg,
                // Responsive height: taller on desktop
                height: { xs: 210, sm: 290, md: 380, lg: 460 },
                position: 'relative',
            }} className="nearzo-ad-slider">
                <Slider {...adSliderSettings} style={{ height: '100%' }}>
                    {ads.map((ad) => (
                        <Box key={ad.id}
                            onClick={() => onNavigate(`/app/shops/${ad.shop_id}`)}
                            sx={{ cursor: 'pointer', height: '100%', display: 'block !important', position: 'relative' }}
                        >
                            <Box component="img" src={ad.image_url} alt={ad.title}
                                sx={{
                                    width: '100%',
                                    height: { xs: 210, sm: 290, md: 380, lg: 460 },
                                    objectFit: 'cover', display: 'block',
                                }}
                            />
                            <Box sx={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.22) 0%, transparent 50%)',
                            }} />
                        </Box>
                    ))}
                </Slider>
            </Box>
        </Box>
    );
};

// ── Stats Bar ─────────────────────────────────────────────────────────────────
const StatsBar = ({ shops, houses, jobs, city }) => {
    const items = [
        { count: shops?.length || 0, label: 'Shops', color: T.primary },
        { count: houses?.length || 0, label: 'Houses', color: T.green },
        { count: jobs?.length || 0, label: 'Jobs', color: T.orange },
    ];
    return (
        <Box sx={{
            mx: { xs: 2, sm: 3, md: 4 }, mt: 2,
            borderRadius: T.radius,
            bgcolor: '#fff',
            border: `1px solid ${T.border}`,
            boxShadow: T.shadow,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            overflow: 'hidden',
        }}>
            {items.map((item, i) => (
                <Box key={i} sx={{
                    py: '11px', px: 1,
                    textAlign: 'center',
                    borderRight: i < 2 ? `1px solid ${T.border}` : 'none',
                }}>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.15rem' }, color: item.color, lineHeight: 1, letterSpacing: '-0.02em' }}>
                        {item.count}+
                    </Typography>
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.62rem', color: T.textMuted, fontWeight: 500, mt: 0.15 }}>
                        {item.label}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

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
    const [locationError, setLocationError] = useState('');

    const getCityFromCoordinates = async (latitude, longitude) => {
        const params = new URLSearchParams({
            format: 'json',
            lat: latitude,
            lon: longitude,
            zoom: '14',
            addressdetails: '1',
            'accept-language': 'en',
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
        if (!response.ok) throw new Error('Could not detect city from location');
        const data = await response.json();
        if (data?.address) {
            const city = await pickSupportedCity(data.address, data.display_name);
            if (city) return city;
        }
        throw new Error('City not found');
    };

    const getCurrentLocationCity = () => new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }
        navigator.geolocation.getCurrentPosition(
            async ({ coords: { latitude, longitude, accuracy } }) => {
                try {
                    if (accuracy && accuracy > MAX_ACCEPTED_ACCURACY_METERS) {
                        reject(new Error('Location accuracy is too low. Please enable precise location or choose your city manually.'));
                        return;
                    }
                    resolve(await getCityFromCoordinates(latitude, longitude));
                }
                catch (e) { reject(e); }
            },
            (err) => {
                const msgs = { 1: 'Location permission denied.', 2: 'Location unavailable.', 3: 'Location request timed out.' };
                reject(new Error(msgs[err.code] || 'Unable to get location'));
            },
            { enableHighAccuracy: true, timeout: GEO_TIMEOUT_MS, maximumAge: GEO_MAX_AGE_MS }
        );
    });

    const loadHomeData = async (city, showNotification = false) => {
        setLoading(true); setError('');
        try {
            const resolvedCity = normalizeLocationName(city);
            const result = await getHomeData(resolvedCity);
            const displayCity = result?.city || resolvedCity;
            setHomeData(result); setCurrentCity(displayCity);
            localStorage.setItem('nearzo_user_city', displayCity);
            if (showNotification && displayCity !== currentCity && currentCity !== '') {
                setDetectedCity(displayCity); setShowCitySnackbar(true);
            }
            if (user?.id && displayCity !== user.city) {
                try { await updateUserCity(displayCity); if (updateUser) updateUser({ ...user, city: displayCity }); } catch {}
            }
        } catch (err) {
            setError(err.message || 'Failed to load');
        } finally { setLoading(false); }
    };

    const handleAllowLocation = async () => {
        setLocationLoading(true);
        setLocationError('');
        try {
            const city = await getCurrentLocationCity();
            setLocationDialogOpen(false);
            await loadHomeData(city, true);
        } catch (err) {
            setLocationDialogOpen(true);
            setLocationError(err.message || 'Unable to get your current location');
        } finally { setLocationLoading(false); }
    };

    const handleManualCity = async (city) => { setLocationError(''); setLocationDialogOpen(false); await loadHomeData(city, true); };
    const handleSkipLocation = async () => { setLocationError(''); setLocationDialogOpen(false); await loadHomeData(user?.city || 'Vellore'); };

    useEffect(() => {
        const init = async () => {
            try {
                const city = await getCurrentLocationCity();
                await loadHomeData(city, false);
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

    if (loading && !homeData.city) return <LoadingSkeleton />;

    if (error && !locationDialogOpen) return (
        <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ borderRadius: T.radiusSm, fontFamily: '"Inter", sans-serif' }}
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
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes featureSlideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to   { opacity: 1; transform: translateX(0); }
                }

                .nearzo-ad-slider .slick-slide > div { height: 100%; }
                .nearzo-ad-slider .slick-list       { height: 100%; }
                .nearzo-ad-slider .slick-track      { height: 100%; display: flex; }
                .nearzo-ad-slider .slick-slide      { height: inherit; }
                .nearzo-dots { bottom: 14px !important; }
                .nearzo-dots li button:before {
                    color: rgba(255,255,255,0.7) !important;
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
                error={locationError}
            />

            <Snackbar
                open={showCitySnackbar} autoHideDuration={4000}
                onClose={() => setShowCitySnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="info" icon={<GpsFixedIcon />} sx={{
                    borderRadius: T.radiusSm, fontFamily: '"Inter", sans-serif',
                    background: 'linear-gradient(135deg, #1A3BB8, #2952E8)',
                    color: '#fff', boxShadow: T.shadowLg,
                    '& .MuiAlert-icon': { color: '#FFD600' },
                }}>
                    Now showing results for <strong>{detectedCity}</strong>
                </Alert>
            </Snackbar>

            <Box sx={{ bgcolor: T.surface, minHeight: '100vh', pb: 8 }}>

                {/* 1 ── City Header */}
                <CityHeader
                    city={displayCity}
                    onCityClick={() => setLocationDialogOpen(true)}
                    onRefresh={() => setLocationDialogOpen(true)}
                />

                {/* 2 ── Ad Carousel */}
                {homeData.ads?.length > 0 && (
                    <AdCarousel ads={homeData.ads} onNavigate={navigate} />
                )}

                {/* 3 ── Stats Bar */}
                <StatsBar
                    shops={homeData.shops}
                    houses={homeData.houses}
                    jobs={homeData.jobs}
                    city={displayCity}
                />

                {/* 4 ── Feature Highlights Strip */}
                <FeatureHighlightsStrip />

                {/* 5 ── Feature Grid */}
                <Box sx={{ bgcolor: '#fff', mt: 2, pb: 0.5 }}>
                    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 2.5, pb: 1 }}>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.1rem' }, color: T.text, letterSpacing: '-0.025em' }}>
                            Explore NearZO
                        </Typography>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.68rem', color: T.textMuted, mt: 0.2 }}>
                            Everything local, in one place
                        </Typography>
                    </Box>
                    <FeatureGrid onNavigate={navigate} />
                </Box>

                <SectionDivider />

                {/* 6 ── Shops */}
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
                        <Box sx={{ height: 12 }} />
                    </Box>
                )}

                <SectionDivider />

                {/* 7 ── Houses */}
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
                        <Box sx={{ height: 12 }} />
                    </Box>
                )}

                <SectionDivider />

                {/* 8 ── Boost Banner */}
                <Box sx={{ bgcolor: '#fff', py: 2.5 }}>
                    <BoostBanner onLearnMore={() => navigate('/app/boost')} />
                </Box>

                <SectionDivider />

                {/* 9 ── Jobs */}
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
                        <Box sx={{ height: 12 }} />
                    </Box>
                )}

                {/* 10 ── Empty State */}
                {!homeData.shops?.length && !homeData.houses?.length && !homeData.jobs?.length && !loading && (
                    <Box sx={{ bgcolor: '#fff', textAlign: 'center', py: 10, px: 4 }}>
                        <Box sx={{
                            width: 76, height: 76, borderRadius: '20px',
                            background: 'linear-gradient(135deg, #EEF2FF, #E0E8FF)',
                            border: `2px solid rgba(41,82,232,0.12)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            mx: 'auto', mb: 2.5,
                            boxShadow: '0 4px 20px rgba(41,82,232,0.14)',
                        }}>
                            <LocationIcon sx={{ fontSize: '2.1rem', color: T.primary }} />
                        </Box>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '1.12rem', color: T.text, mb: 0.5, letterSpacing: '-0.02em' }}>
                            No listings found nearby
                        </Typography>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.8rem', color: T.textSub, mb: 3, lineHeight: 1.5 }}>
                            We couldn't find shops, houses, or jobs in {displayCity}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setLocationDialogOpen(true)}
                            startIcon={<GpsFixedIcon />}
                            sx={{
                                background: 'linear-gradient(135deg, #1A3BB8, #2952E8)',
                                borderRadius: '11px', py: 1.15, px: 3,
                                textTransform: 'none', fontFamily: '"Inter", sans-serif',
                                fontWeight: 700, fontSize: '0.87rem',
                                boxShadow: '0 4px 16px rgba(41,82,232,0.4)',
                                '&:hover': { background: 'linear-gradient(135deg, #1430A0, #2040D0)' },
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
