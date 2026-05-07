// app/user/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Chip,
    Button,
    Alert,
    Skeleton,
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    Store as StoreIcon,
    Home as HomeIcon,
    Work as WorkIcon,
    Verified as VerifiedIcon,
    ChevronRight as ChevronRightIcon,
    Restaurant as RestaurantIcon,
    LocalGroceryStore as GroceryIcon,
    LocalPharmacy as PharmacyIcon,
    ContentCut as SalonIcon,
    FitnessCenter as GymIcon,
    Devices as ElectronicsIcon,
    Checkroom as ClothingIcon,
    Diamond as JewelleryIcon,
    Hotel as HotelIcon,
    BakeryDining as BakeryIcon,
    LocalHospital as HospitalIcon,
    School as EducationIcon,
    Hardware as HardwareIcon,
    Category as CategoryIcon,
    Rocket as RocketIcon,
    TrendingUp as TrendingUpIcon,
    ArrowForward as ArrowForwardIcon,
    AutoAwesome as SparkleIcon,
    Pets as PetsIcon,
    CarRental as CarRentalIcon,
    ElectricalServices as ElectricalIcon,
    Plumbing as PlumbingIcon,
    Colorize as PaintIcon,
    CleaningServices as CleaningIcon,
    Security as SecurityIcon,
    EventAvailable as EventIcon,
    PhotoCamera as PhotographyIcon,
    Computer as ComputerIcon,
    PhoneIphone as MobileIcon,
    Book as BookIcon,
    SportsBasketball as SportsIcon,
    Spa as SpaIcon,
    LocalLaundryService as LaundryIcon,
    Print as PrintIcon,
    Moving as MovingIcon,
    Handyman as HandymanIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getHomeData, getUserCity, getAllCategories } from '../../services/homeUser';
import { useAuth } from '../context/AuthContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// ── Category icon map ─────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
    restaurant: { icon: RestaurantIcon, bg: 'rgba(230,126,34,0.12)', color: '#e67e22', glow: 'rgba(230,126,34,0.3)' },
    'restaurants & cafes': { icon: RestaurantIcon, bg: 'rgba(230,126,34,0.12)', color: '#e67e22', glow: 'rgba(230,126,34,0.3)' },
    food: { icon: RestaurantIcon, bg: 'rgba(230,126,34,0.12)', color: '#e67e22', glow: 'rgba(230,126,34,0.3)' },
    grocery: { icon: GroceryIcon, bg: 'rgba(39,174,96,0.12)', color: '#27ae60', glow: 'rgba(39,174,96,0.3)' },
    'grocery store': { icon: GroceryIcon, bg: 'rgba(39,174,96,0.12)', color: '#27ae60', glow: 'rgba(39,174,96,0.3)' },
    pharmacy: { icon: PharmacyIcon, bg: 'rgba(233,30,140,0.12)', color: '#e91e8c', glow: 'rgba(233,30,140,0.3)' },
    'medical store': { icon: PharmacyIcon, bg: 'rgba(233,30,140,0.12)', color: '#e91e8c', glow: 'rgba(233,30,140,0.3)' },
    salon: { icon: SalonIcon, bg: 'rgba(155,89,182,0.12)', color: '#9b59b6', glow: 'rgba(155,89,182,0.3)' },
    'beauty parlour': { icon: SalonIcon, bg: 'rgba(155,89,182,0.12)', color: '#9b59b6', glow: 'rgba(155,89,182,0.3)' },
    gym: { icon: GymIcon, bg: 'rgba(41,128,185,0.12)', color: '#2980b9', glow: 'rgba(41,128,185,0.3)' },
    'fitness center': { icon: GymIcon, bg: 'rgba(41,128,185,0.12)', color: '#2980b9', glow: 'rgba(41,128,185,0.3)' },
    electronics: { icon: ElectronicsIcon, bg: 'rgba(50,95,236,0.12)', color: '#325fec', glow: 'rgba(50,95,236,0.3)' },
    'electronics store': { icon: ElectronicsIcon, bg: 'rgba(50,95,236,0.12)', color: '#325fec', glow: 'rgba(50,95,236,0.3)' },
    clothing: { icon: ClothingIcon, bg: 'rgba(230,126,34,0.12)', color: '#e67e22', glow: 'rgba(230,126,34,0.3)' },
    'clothing store': { icon: ClothingIcon, bg: 'rgba(230,126,34,0.12)', color: '#e67e22', glow: 'rgba(230,126,34,0.3)' },
    jewellery: { icon: JewelleryIcon, bg: 'rgba(243,156,18,0.12)', color: '#f39c12', glow: 'rgba(243,156,18,0.3)' },
    'jewelry store': { icon: JewelleryIcon, bg: 'rgba(243,156,18,0.12)', color: '#f39c12', glow: 'rgba(243,156,18,0.3)' },
    hotel: { icon: HotelIcon, bg: 'rgba(39,174,96,0.12)', color: '#27ae60', glow: 'rgba(39,174,96,0.3)' },
    bakery: { icon: BakeryIcon, bg: 'rgba(230,126,34,0.12)', color: '#e67e22', glow: 'rgba(230,126,34,0.3)' },
    hospital: { icon: HospitalIcon, bg: 'rgba(231,76,60,0.12)', color: '#e74c3c', glow: 'rgba(231,76,60,0.3)' },
    education: { icon: EducationIcon, bg: 'rgba(50,95,236,0.12)', color: '#325fec', glow: 'rgba(50,95,236,0.3)' },
    'educational institute': { icon: EducationIcon, bg: 'rgba(50,95,236,0.12)', color: '#325fec', glow: 'rgba(50,95,236,0.3)' },
    hardware: { icon: HardwareIcon, bg: 'rgba(125,102,8,0.12)', color: '#7d6608', glow: 'rgba(125,102,8,0.3)' },
    'hardware store': { icon: HardwareIcon, bg: 'rgba(125,102,8,0.12)', color: '#7d6608', glow: 'rgba(125,102,8,0.3)' },
    pets: { icon: PetsIcon, bg: 'rgba(243,156,18,0.12)', color: '#f39c12', glow: 'rgba(243,156,18,0.3)' },
    'pet store': { icon: PetsIcon, bg: 'rgba(243,156,18,0.12)', color: '#f39c12', glow: 'rgba(243,156,18,0.3)' },
    'car rental': { icon: CarRentalIcon, bg: 'rgba(41,128,185,0.12)', color: '#2980b9', glow: 'rgba(41,128,185,0.3)' },
    electrical: { icon: ElectricalIcon, bg: 'rgba(230,126,34,0.12)', color: '#e67e22', glow: 'rgba(230,126,34,0.3)' },
    plumbing: { icon: PlumbingIcon, bg: 'rgba(52,152,219,0.12)', color: '#3498db', glow: 'rgba(52,152,219,0.3)' },
    painting: { icon: PaintIcon, bg: 'rgba(155,89,182,0.12)', color: '#9b59b6', glow: 'rgba(155,89,182,0.3)' },
    cleaning: { icon: CleaningIcon, bg: 'rgba(39,174,96,0.12)', color: '#27ae60', glow: 'rgba(39,174,96,0.3)' },
    security: { icon: SecurityIcon, bg: 'rgba(41,128,185,0.12)', color: '#2980b9', glow: 'rgba(41,128,185,0.3)' },
    events: { icon: EventIcon, bg: 'rgba(230,126,34,0.12)', color: '#e67e22', glow: 'rgba(230,126,34,0.3)' },
    photography: { icon: PhotographyIcon, bg: 'rgba(155,89,182,0.12)', color: '#9b59b6', glow: 'rgba(155,89,182,0.3)' },
    computer: { icon: ComputerIcon, bg: 'rgba(50,95,236,0.12)', color: '#325fec', glow: 'rgba(50,95,236,0.3)' },
    mobile: { icon: MobileIcon, bg: 'rgba(233,30,140,0.12)', color: '#e91e8c', glow: 'rgba(233,30,140,0.3)' },
    books: { icon: BookIcon, bg: 'rgba(243,156,18,0.12)', color: '#f39c12', glow: 'rgba(243,156,18,0.3)' },
    sports: { icon: SportsIcon, bg: 'rgba(41,128,185,0.12)', color: '#2980b9', glow: 'rgba(41,128,185,0.3)' },
    spa: { icon: SpaIcon, bg: 'rgba(155,89,182,0.12)', color: '#9b59b6', glow: 'rgba(155,89,182,0.3)' },
    laundry: { icon: LaundryIcon, bg: 'rgba(39,174,96,0.12)', color: '#27ae60', glow: 'rgba(39,174,96,0.3)' },
    printing: { icon: PrintIcon, bg: 'rgba(52,152,219,0.12)', color: '#3498db', glow: 'rgba(52,152,219,0.3)' },
    moving: { icon: MovingIcon, bg: 'rgba(230,126,34,0.12)', color: '#e67e22', glow: 'rgba(230,126,34,0.3)' },
    handyman: { icon: HandymanIcon, bg: 'rgba(155,89,182,0.12)', color: '#9b59b6', glow: 'rgba(155,89,182,0.3)' },
    default: { icon: CategoryIcon, bg: 'rgba(50,95,236,0.12)', color: '#325fec', glow: 'rgba(50,95,236,0.3)' },
};

const getCategoryConfig = (name = '') => {
    const key = name.toLowerCase();
    for (const k of Object.keys(CATEGORY_ICONS)) {
        if (key.includes(k)) return CATEGORY_ICONS[k];
    }
    return CATEGORY_ICONS.default;
};

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

// ── Infinite Marquee Category Strip ──────────────────────────────────────────
// Scrolls left → right infinitely. Each item is clickable.
const CategoryMarquee = ({ categories, onCategoryClick }) => {
    if (!categories || categories.length === 0) return null;

    // Duplicate list so the loop is seamless
    const items = [...categories, ...categories, ...categories];

    return (
        <Box sx={{ mb: 3, overflow: 'hidden', position: 'relative' }}>
            {/* Section label */}
            <Box sx={{ px: 2, mb: 1.5 }}>
                <Typography sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 700, fontSize: '1rem',
                    color: '#0a1628', letterSpacing: '-0.02em',
                }}>
                    Browse by Category
                </Typography>
            </Box>

            {/* Fade edges */}
            <Box sx={{
                position: 'absolute', top: 40, left: 0, width: 32, height: 80, zIndex: 2,
                background: 'linear-gradient(to right, #ffffff, transparent)',
                pointerEvents: 'none',
            }} />
            <Box sx={{
                position: 'absolute', top: 40, right: 0, width: 32, height: 80, zIndex: 2,
                background: 'linear-gradient(to left, #ffffff, transparent)',
                pointerEvents: 'none',
            }} />

            {/* Marquee track */}
            <Box sx={{
                display: 'flex',
                gap: '14px',
                width: 'max-content',
                pb: 1,
                px: 2,
                animation: 'marqueeRTL 28s linear infinite',
                '&:hover': { animationPlayState: 'paused' },
            }}>
                {items.map((cat, i) => {
                    const cfg = getCategoryConfig(cat.category_name || cat.category);
                    const IconComp = cfg.icon;
                    const label = cat.category_name || cat.category;
                    return (
                        <Box
                            key={`${cat.id || label}-${i}`}
                            onClick={() => onCategoryClick(label)}
                            sx={{
                                flexShrink: 0,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '6px',
                                cursor: 'pointer',
                                transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                                '&:active': { opacity: 0.75, transform: 'scale(0.92)' },
                                '&:hover': { transform: 'scale(1.1) translateY(-3px)' },
                            }}
                        >
                            <Box sx={{
                                width: 62, height: 62,
                                borderRadius: '18px',
                                background: cfg.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.6)',
                                boxShadow: `0 2px 12px ${cfg.glow}`,
                                transition: 'box-shadow 0.2s ease',
                                '&:hover': {
                                    boxShadow: `0 6px 20px ${cfg.glow}`,
                                },
                            }}>
                                <IconComp sx={{ fontSize: '1.4rem', color: cfg.color }} />
                            </Box>
                            <Typography sx={{
                                fontFamily: '"Inter", sans-serif',
                                fontSize: '0.63rem', fontWeight: 600,
                                color: '#334155', textAlign: 'center',
                                maxWidth: 62,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {label}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
    <Box sx={{ px: 2, pt: 2 }}>
        <Skeleton variant="rounded" height={220} sx={{ borderRadius: '20px', mb: 3 }} />
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Box key={i} sx={{ flexShrink: 0, textAlign: 'center' }}>
                    <Skeleton variant="rounded" width={62} height={62} sx={{ borderRadius: '18px', mb: 0.8 }} />
                    <Skeleton variant="text" width={55} sx={{ mx: 'auto' }} />
                </Box>
            ))}
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
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [homeData, setHomeData] = useState({ ads: [], categories: [], shops: [], houses: [], jobs: [], city: '' });
    const [allCategories, setAllCategories] = useState([]);

    useEffect(() => {
        loadHomeData();
        loadAllCategories();
    }, []);

    const loadHomeData = async () => {
        setLoading(true);
        try {
            let userCity = 'Vellore';
            if (user?.city) {
                userCity = user.city;
            } else {
                try {
                    const cityResult = await getUserCity();
                    if (cityResult.city) userCity = cityResult.city;
                } catch { /* use default */ }
            }
            const result = await getHomeData(userCity);
            setHomeData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadAllCategories = async () => {
        try {
            const categories = await getAllCategories();
            setAllCategories(categories);
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    };

    const handleCategoryClick = (categoryName) => {
        navigate(`/app/shops?category=${encodeURIComponent(categoryName)}`);
    };

    // Responsive slider: show 1 slide on mobile, partial peek on desktop
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

    if (loading) return <LoadingSkeleton />;

    if (error) return (
        <Box sx={{ p: 2 }}>
            <Alert severity="error" sx={{ borderRadius: '14px', fontFamily: '"Inter", sans-serif' }}>{error}</Alert>
        </Box>
    );

    const displayCategories = allCategories.length > 0
        ? allCategories.map(cat => ({
            id: cat.id,
            category_name: cat.category_name || cat.name,
            count: 0,
        }))
        : homeData.categories;

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

                /* Marquee: moves left-to-right (RTL direction = items enter from left side) */
                /* To scroll left→right visually: start negative, end at 0 — 
                   this makes items appear from left and exit to right             */
                @keyframes marqueeRTL {
                    0%   { transform: translateX(-33.333%); }
                    100% { transform: translateX(0%); }
                }

                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.6; }
                    50%       { opacity: 1; }
                }

                /* Ad slider: full cover image on all screen sizes */
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

            {/* ── Clean white background, no overlays ── */}
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
                        <Box sx={{
                            width: 26, height: 26, borderRadius: '8px',
                            background: 'rgba(50,95,236,0.12)',
                            border: '1px solid rgba(50,95,236,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            animation: 'pulseGlow 2.5s ease infinite',
                        }}>
                            <LocationIcon sx={{ fontSize: '0.85rem', color: '#325fec' }} />
                        </Box>
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 800, fontSize: '1.4rem',
                            color: '#0a1628', letterSpacing: '-0.03em', lineHeight: 1,
                        }}>
                            {homeData.city}
                        </Typography>
                    </Box>
                </Box>

                {/* ── Ad Banner — responsive full-cover ────────────── */}
                {homeData.ads?.length > 0 && (
                    <Box sx={{
                        px: { xs: 0, sm: 2 },
                        mb: 3,
                        animation: 'fadeInUp 0.5s ease both',
                        animationDelay: '0.1s',
                    }}>
                        <Box sx={{
                            borderRadius: { xs: 0, sm: '22px' },
                            overflow: 'hidden',
                            boxShadow: { xs: 'none', sm: '0 6px 28px rgba(50,95,236,0.15)' },
                            // responsive height: taller on desktop, shorter on mobile
                            height: { xs: 210, sm: 260, md: 320 },
                            position: 'relative',
                        }}
                            className="nearzo-ad-slider"
                        >
                            <Slider {...adSliderSettings} style={{ height: '100%' }}>
                                {homeData.ads.map((ad) => (
                                    <Box
                                        key={ad.id}
                                        onClick={() => navigate(`/app/shops/${ad.shop_id}`)}
                                        sx={{ cursor: 'pointer', height: '100%', display: 'block !important' }}
                                    >
                                        <Box
                                            component="img"
                                            src={ad.image_url}
                                            alt={ad.title}
                                            sx={{
                                                width: '100%',
                                                height: { xs: 210, sm: 260, md: 320 },
                                                objectFit: 'cover',
                                                objectPosition: 'center',
                                                display: 'block',
                                            }}
                                        />
                                        {/* subtle bottom gradient for dot visibility */}
                                        <Box sx={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 45%)',
                                            pointerEvents: 'none',
                                        }} />
                                    </Box>
                                ))}
                            </Slider>
                        </Box>
                    </Box>
                )}

                {/* ── Category Marquee Strip ────────────────────────── */}
                {displayCategories?.length > 0 && (
                    <CategoryMarquee
                        categories={displayCategories}
                        onCategoryClick={handleCategoryClick}
                    />
                )}

                {/* ── Shops ─────────────────────────────────────────── */}
                {homeData.shops?.length > 0 && (
                    <Box sx={{ mb: 3, px: 2, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.2s' }}>
                        <SectionHeader
                            title={`Shops in ${homeData.city}`}
                            onSeeAll={() => navigate('/app/shops')}
                        />
                        <ScrollRail>
                            {homeData.shops.map((shop, i) => (
                                <ShopCard key={shop.id} shop={shop} index={i} onClick={() => navigate(`/app/shops/${shop.id}`)} />
                            ))}
                        </ScrollRail>
                    </Box>
                )}

                {/* ── Houses + Boost Banner ─────────────────────────── */}
                {homeData.houses?.length > 0 && (
                    <Box sx={{ mb: 3, px: 2, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.25s' }}>
                        <SectionHeader
                            title={`Houses in ${homeData.city}`}
                            onSeeAll={() => navigate('/app/houses')}
                        />
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

                {/* ── Jobs ──────────────────────────────────────────── */}
                {homeData.jobs?.length > 0 && (
                    <Box sx={{ mb: 5, px: 2, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.3s' }}>
                        <SectionHeader
                            title={`Jobs in ${homeData.city}`}
                            onSeeAll={() => navigate('/app/jobs')}
                        />
                        <ScrollRail>
                            {homeData.jobs.map((job, i) => (
                                <JobCard key={job.id} job={job} index={i} onClick={() => navigate(`/app/jobs/${job.id}`)} />
                            ))}
                        </ScrollRail>
                    </Box>
                )}

                {/* ── Empty State ───────────────────────────────────── */}
                {!homeData.shops?.length && !homeData.houses?.length && !homeData.jobs?.length && (
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
                            Nothing here yet
                        </Typography>
                        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.8rem', color: '#94a3b8' }}>
                            Listings for {homeData.city} will appear here
                        </Typography>
                    </Box>
                )}

            </Box>
        </>
    );
}