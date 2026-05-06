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
    Apartment as ApartmentIcon,
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getHomeData, getUserCity } from '../../services/homeUser';
import { useAuth } from '../context/AuthContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// ── Category icon map ─────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
    restaurant: { icon: RestaurantIcon, bg: '#fff4e6', color: '#e67e22' },
    food: { icon: RestaurantIcon, bg: '#fff4e6', color: '#e67e22' },
    grocery: { icon: GroceryIcon, bg: '#e8f8f0', color: '#27ae60' },
    pharmacy: { icon: PharmacyIcon, bg: '#fde8f0', color: '#e91e8c' },
    salon: { icon: SalonIcon, bg: '#f3e8ff', color: '#9b59b6' },
    gym: { icon: GymIcon, bg: '#e8f4ff', color: '#2980b9' },
    electronics: { icon: ElectronicsIcon, bg: '#e8f0fe', color: '#325fec' },
    clothing: { icon: ClothingIcon, bg: '#fef3e8', color: '#e67e22' },
    jewellery: { icon: JewelleryIcon, bg: '#fef9e8', color: '#f39c12' },
    hotel: { icon: HotelIcon, bg: '#e8f8f0', color: '#27ae60' },
    bakery: { icon: BakeryIcon, bg: '#fff4e6', color: '#e67e22' },
    hospital: { icon: HospitalIcon, bg: '#fde8e8', color: '#e74c3c' },
    education: { icon: EducationIcon, bg: '#e8f0fe', color: '#325fec' },
    hardware: { icon: HardwareIcon, bg: '#f0ece8', color: '#7d6608' },
    default: { icon: CategoryIcon, bg: '#f0f4ff', color: '#325fec' },
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

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, onSeeAll }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#0f172a',
            letterSpacing: '-0.02em',
        }}>
            {title}
        </Typography>
        <Button
            onClick={onSeeAll}
            endIcon={<ChevronRightIcon sx={{ fontSize: '0.9rem !important', ml: -0.5 }} />}
            sx={{
                textTransform: 'none',
                color: '#325fec',
                fontFamily: '"Inter", sans-serif',
                fontWeight: 600,
                fontSize: '0.75rem',
                px: 1.2, py: 0.4,
                borderRadius: '20px',
                bgcolor: 'rgba(50,95,236,0.07)',
                minWidth: 0,
                lineHeight: 1,
                '&:hover': { bgcolor: 'rgba(50,95,236,0.13)' },
            }}
        >
            See all
        </Button>
    </Box>
);

// ── Horizontal Scroll Rail ────────────────────────────────────────────────────
const ScrollRail = ({ children }) => (
    <Box
        sx={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            pb: 1,
            mx: -2,
            px: 2,
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
        }}
    >
        {children}
    </Box>
);

// ── Shop Card ─────────────────────────────────────────────────────────────────
const ShopCard = ({ shop, onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            minWidth: 185,
            maxWidth: 185,
            flexShrink: 0,
            borderRadius: '16px',
            overflow: 'hidden',
            bgcolor: '#fff',
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            '&:active': { transform: 'scale(0.965)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
        }}
    >
        {/* Image */}
        <Box sx={{ width: '100%', height: 120, bgcolor: '#f1f5f9', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
            {shop.shop_image ? (
                <Box
                    component="img"
                    src={`data:image/jpeg;base64,${shop.shop_image}`}
                    alt={shop.business_name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                />
            ) : (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StoreIcon sx={{ fontSize: 36, color: '#cbd5e1' }} />
                </Box>
            )}
            {shop.is_verified && (
                <Box sx={{
                    position: 'absolute', top: 7, right: 7,
                    bgcolor: 'rgba(22,163,74,0.9)',
                    borderRadius: '20px', px: 0.7, py: 0.25,
                    display: 'flex', alignItems: 'center', gap: 0.35,
                    backdropFilter: 'blur(6px)',
                }}>
                    <VerifiedIcon sx={{ fontSize: '0.6rem', color: '#fff' }} />
                    <Typography sx={{ fontSize: '0.58rem', color: '#fff', fontWeight: 700, fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                        Verified
                    </Typography>
                </Box>
            )}
        </Box>

        {/* Content */}
        <Box sx={{ p: '9px 11px 11px' }}>
            <Typography sx={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 700, fontSize: '0.82rem', color: '#0f172a',
                lineHeight: 1.3, mb: 0.5,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
                {shop.business_name}
            </Typography>
            <Chip
                label={shop.category}
                size="small"
                sx={{
                    height: 17, fontSize: '0.6rem',
                    fontFamily: '"Inter", sans-serif', fontWeight: 600,
                    bgcolor: '#f0f4ff', color: '#325fec',
                    borderRadius: '5px', mb: 0.7,
                    '& .MuiChip-label': { px: 0.7 },
                }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <LocationIcon sx={{ fontSize: '0.65rem', color: '#94a3b8' }} />
                <Typography sx={{ fontSize: '0.67rem', color: '#94a3b8', fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                    {shop.area}, {shop.city}
                </Typography>
            </Box>
        </Box>
    </Box>
);

// ── House Card ────────────────────────────────────────────────────────────────
const HouseCard = ({ house, onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            minWidth: 185,
            maxWidth: 185,
            flexShrink: 0,
            borderRadius: '16px',
            overflow: 'hidden',
            bgcolor: '#fff',
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            transition: 'transform 0.18s ease',
            '&:active': { transform: 'scale(0.965)' },
        }}
    >
        <Box sx={{ width: '100%', height: 120, bgcolor: '#f1f5f9', overflow: 'hidden', position: 'relative' }}>
            {house.house_image ? (
                <Box
                    component="img"
                    src={`data:image/jpeg;base64,${house.house_image}`}
                    alt="House"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                />
            ) : (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ApartmentIcon sx={{ fontSize: 36, color: '#cbd5e1' }} />
                </Box>
            )}
            {/* Price badge on image */}
            <Box sx={{
                position: 'absolute', bottom: 7, left: 7,
                bgcolor: 'rgba(50,95,236,0.92)',
                borderRadius: '7px', px: 0.9, py: 0.3,
                backdropFilter: 'blur(6px)',
            }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#fff', fontWeight: 700, fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                    {formatPrice(house.rent_per_month)}<span style={{ fontWeight: 400, fontSize: '0.58rem' }}>/mo</span>
                </Typography>
            </Box>
        </Box>

        <Box sx={{ p: '9px 11px 11px' }}>
            <Typography sx={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 700, fontSize: '0.82rem', color: '#0f172a', mb: 0.6,
            }}>
                {house.rooms} BHK House
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <LocationIcon sx={{ fontSize: '0.65rem', color: '#94a3b8' }} />
                <Typography sx={{ fontSize: '0.67rem', color: '#94a3b8', fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                    {house.area}, {house.city}
                </Typography>
            </Box>
        </Box>
    </Box>
);

// ── Job Card ──────────────────────────────────────────────────────────────────
const JobCard = ({ job, onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            minWidth: 205,
            maxWidth: 205,
            flexShrink: 0,
            borderRadius: '16px',
            bgcolor: '#fff',
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            p: '13px',
            transition: 'transform 0.18s ease',
            '&:active': { transform: 'scale(0.965)' },
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
            <Box sx={{
                width: 38, height: 38, borderRadius: '11px',
                bgcolor: '#f0f4ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <WorkIcon sx={{ fontSize: '1.05rem', color: '#325fec' }} />
            </Box>
            <Chip
                label={job.job_type === 'full_time' ? 'Full Time' : 'Part Time'}
                size="small"
                sx={{
                    height: 18, fontSize: '0.6rem',
                    fontFamily: '"Inter", sans-serif', fontWeight: 700,
                    bgcolor: job.job_type === 'full_time' ? '#dcfce7' : '#fef9c3',
                    color: job.job_type === 'full_time' ? '#15803d' : '#92400e',
                    borderRadius: '6px',
                    '& .MuiChip-label': { px: 0.8 },
                }}
            />
        </Box>

        <Typography sx={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 700, fontSize: '0.84rem', color: '#0f172a',
            lineHeight: 1.3, mb: 0.3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
            {job.job_title}
        </Typography>
        <Typography sx={{
            fontSize: '0.7rem', color: '#64748b',
            fontFamily: '"Inter", sans-serif', mb: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
            {job.shop_name || job.company_name}
        </Typography>

        <Box sx={{
            display: 'flex', alignItems: 'baseline', gap: 0.4,
            bgcolor: '#f8faff', borderRadius: '8px', px: 1, py: 0.6, mb: 0.8,
        }}>
            <Typography sx={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 700, fontSize: '0.82rem', color: '#325fec',
            }}>
                {formatPrice(job.salary)}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: '"Inter", sans-serif' }}>
                /{job.salary_type === 'month' ? 'month' : 'day'}
            </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <LocationIcon sx={{ fontSize: '0.65rem', color: '#94a3b8' }} />
            <Typography sx={{ fontSize: '0.67rem', color: '#94a3b8', fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                {job.area}, {job.city}
            </Typography>
        </Box>
    </Box>
);

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
    <Box sx={{ px: 2, pt: 2 }}>
        <Skeleton variant="rounded" height={185} sx={{ borderRadius: '20px', mb: 3 }} />
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            {[1,2,3,4,5].map(i => (
                <Box key={i} sx={{ flexShrink: 0, textAlign: 'center' }}>
                    <Skeleton variant="rounded" width={58} height={58} sx={{ borderRadius: '16px', mb: 0.8 }} />
                    <Skeleton variant="text" width={55} sx={{ mx: 'auto' }} />
                </Box>
            ))}
        </Box>
        {[1,2,3].map(s => (
            <Box key={s} sx={{ mb: 3.5 }}>
                <Skeleton variant="text" width={150} height={28} sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {[1,2,2].map((_, i) => (
                        <Skeleton key={i} variant="rounded" width={185} height={175} sx={{ flexShrink: 0, borderRadius: '16px' }} />
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

    useEffect(() => { loadHomeData(); }, []);

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
    };

    if (loading) return <LoadingSkeleton />;

    if (error) return (
        <Box sx={{ p: 2 }}>
            <Alert severity="error" sx={{ borderRadius: '14px', fontFamily: '"Inter", sans-serif' }}>{error}</Alert>
        </Box>
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
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

            <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>

                {/* ── City Header ────────────────────────────────── */}
                <Box sx={{ px: 2, pt: 2.5, pb: 1.5 }}>
                    <Typography sx={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500,
                        mb: 0.3, letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>
                        Exploring
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon sx={{ fontSize: '1.1rem', color: '#325fec' }} />
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 800, fontSize: '1.4rem',
                            color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1,
                        }}>
                            {homeData.city}
                        </Typography>
                    </Box>
                </Box>

                {/* ── Ad Banner ──────────────────────────────────── */}
                {homeData.ads?.length > 0 && (
                    <Box sx={{ px: 2, mb: 3 }}>
                        <Box sx={{ borderRadius: '20px', overflow: 'hidden',  }}>
                            <Slider {...adSliderSettings}>
                                {homeData.ads.map((ad) => (
                                    <Box
                                        key={ad.id}
                                        onClick={() => navigate(`/app/shops/${ad.shop_id}`)}
                                        sx={{ position: 'relative', cursor: 'pointer', display: 'block' }}
                                    >
                                        <Box
                                            component="img"
                                            src={ad.image_url}
                                            alt={ad.title}
                                            sx={{
                                                width: '100%', height: 200,
                                                objectFit: 'cover', objectPosition: 'center',
                                                display: 'block',
                                            }}
                                        />
                                        <Box sx={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0) 55%)',
                                        }} />
                                        {/* <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: '12px 14px' }}>
                                            <Typography sx={{
                                                fontFamily: '"Inter", sans-serif',
                                                color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                                                lineHeight: 1.25, letterSpacing: '-0.02em',
                                            }}>
                                                {ad.title}
                                            </Typography>
                                            <Typography sx={{
                                                fontFamily: '"Inter", sans-serif',
                                                color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem',
                                            }}>
                                                {ad.shop_name}
                                            </Typography>
                                        </Box> */}
                                    </Box>
                                ))}
                            </Slider>
                        </Box>
                    </Box>
                )}

                {/* ── Categories ─────────────────────────────────── */}
                {homeData.categories?.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ px: 2, mb: 1.5 }}>
                            <Typography sx={{
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: 700, fontSize: '1rem',
                                color: '#0f172a', letterSpacing: '-0.02em',
                            }}>
                                Browse by Category
                            </Typography>
                        </Box>
                        <Box sx={{
                            display: 'flex', gap: '10px',
                            overflowX: 'auto', px: 2, pb: 1,
                            '&::-webkit-scrollbar': { display: 'none' },
                            scrollbarWidth: 'none',
                        }}>
                            {homeData.categories.map((cat) => {
                                const cfg = getCategoryConfig(cat.category);
                                const IconComp = cfg.icon;
                                return (
                                    <Box
                                        key={cat.category}
                                        onClick={() => navigate(`/app/shops?category=${encodeURIComponent(cat.category)}`)}
                                        sx={{
                                            flexShrink: 0,
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', gap: '5px',
                                            cursor: 'pointer',
                                            '&:active': { opacity: 0.7 },
                                        }}
                                    >
                                        <Box sx={{
                                            width: 58, height: 58,
                                            borderRadius: '16px',
                                            bgcolor: cfg.bg,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '1px solid rgba(0,0,0,0.05)',
                                            transition: 'transform 0.15s ease',
                                            '&:hover': { transform: 'scale(1.06)' },
                                        }}>
                                            <IconComp sx={{ fontSize: '1.35rem', color: cfg.color }} />
                                        </Box>
                                        <Typography sx={{
                                            fontFamily: '"Inter", sans-serif',
                                            fontSize: '0.63rem', fontWeight: 600,
                                            color: '#334155', textAlign: 'center',
                                            maxWidth: 58,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {cat.category}
                                        </Typography>
                                        <Typography sx={{
                                            fontFamily: '"Inter", sans-serif',
                                            fontSize: '0.58rem', color: '#94a3b8', mt: -0.5, lineHeight: 1,
                                        }}>
                                            {cat.count}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                )}

                {/* ── Shops ──────────────────────────────────────── */}
                {homeData.shops?.length > 0 && (
                    <Box sx={{ mb: 3, px: 2 }}>
                        <SectionHeader
                            title={`Shops in ${homeData.city}`}
                            onSeeAll={() => navigate('/app/shops')}
                        />
                        <ScrollRail>
                            {homeData.shops.map((shop) => (
                                <ShopCard key={shop.id} shop={shop} onClick={() => navigate(`/app/shops/${shop.id}`)} />
                            ))}
                        </ScrollRail>
                    </Box>
                )}

                {/* ── Houses ─────────────────────────────────────── */}
                {homeData.houses?.length > 0 && (
                    <Box sx={{ mb: 3, px: 2 }}>
                        <SectionHeader
                            title={`Houses in ${homeData.city}`}
                            onSeeAll={() => navigate('/app/houses')}
                        />
                        <ScrollRail>
                            {homeData.houses.map((house) => (
                                <HouseCard key={house.id} house={house} onClick={() => navigate(`/app/houses/${house.id}`)} />
                            ))}
                        </ScrollRail>
                    </Box>
                )}

                {/* ── Jobs ───────────────────────────────────────── */}
                {homeData.jobs?.length > 0 && (
                    <Box sx={{ mb: 5, px: 2 }}>
                        <SectionHeader
                            title={`Jobs in ${homeData.city}`}
                            onSeeAll={() => navigate('/app/jobs')}
                        />
                        <ScrollRail>
                            {homeData.jobs.map((job) => (
                                <JobCard key={job.id} job={job} onClick={() => navigate(`/app/jobs/${job.id}`)} />
                            ))}
                        </ScrollRail>
                    </Box>
                )}

                {/* ── Empty State ─────────────────────────────────── */}
                {!homeData.shops?.length && !homeData.houses?.length && !homeData.jobs?.length && (
                    <Box sx={{ textAlign: 'center', py: 10, px: 4 }}>
                        <Box sx={{
                            width: 64, height: 64, borderRadius: '20px',
                            bgcolor: '#f0f4ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            mx: 'auto', mb: 2,
                        }}>
                            <LocationIcon sx={{ fontSize: '1.8rem', color: '#325fec' }} />
                        </Box>
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 700, fontSize: '1rem', color: '#334155', mb: 0.5,
                        }}>
                            Nothing here yet
                        </Typography>
                        <Typography sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '0.8rem', color: '#94a3b8',
                        }}>
                            Listings for {homeData.city} will appear here
                        </Typography>
                    </Box>
                )}

            </Box>
        </>
    );
}