import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, Button, Grid, Stack } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import StorefrontIcon from '@mui/icons-material/Storefront';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
    const heroRef = useRef(null);
    const mockupRef = useRef(null);
    const mockupContainerRef = useRef(null);
    const [tagsVisible, setTagsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // Force tags to be visible after mount
        setTagsVisible(true);

        const ctx = gsap.context(() => {
            // Entry Animation
            gsap.from('.hero-text', {
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'power3.out',
            });

            gsap.from('.floating-tag', {
                scale: 0,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                delay: 0.3,
                ease: 'back.out(1.7)',
            });

            // Phone mockup entry animation
            gsap.from(mockupRef.current, {
                rotateY: 45,
                rotateX: 10,
                opacity: 0,
                duration: 1.5,
                delay: 0.5,
                ease: 'power3.out',
            });

            // Gentle floating animation for mockup - reduced movement
            gsap.to(mockupRef.current, {
                y: -5,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });

            // Route Animation
            gsap.to('#route-path', {
                strokeDashoffset: 0,
                duration: 2,
                repeat: -1,
                ease: 'power1.inOut',
                repeatDelay: 1,
            });

            // Pulse animation for location marker
            gsap.to('.map-marker-pulse', {
                scale: 1.5,
                opacity: 0,
                duration: 2,
                repeat: -1,
                ease: 'power2.out',
            });

            // Only apply scroll-based rotation on desktop
            if (!isMobile) {
                gsap.to(mockupRef.current, {
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 0.5,
                    },
                    rotateY: -10,
                    rotateX: 3,
                });
            }
        }, heroRef);

        return () => ctx.revert();
    }, [isMobile]);

    const FloatingTag = ({ icon, text, top, left, right, bottom, customSx }) => (
        <Box
            className="floating-tag"
            sx={{
                position: 'absolute',
                minWidth: { xs: '100px', sm: '140px', md: '180px' },
                top: top,
                left: left,
                right: right,
                bottom: bottom,
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, md: 1.5 },
                p: { xs: '4px 12px', sm: '8px 16px', md: '12px 24px' },
                borderRadius: '100px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(192, 12, 12, 0.2)',
                zIndex: 999,
                cursor: 'default',
                transition: 'all 0.3s ease',
                opacity: tagsVisible ? 1 : 0,
                '&:hover': {
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: '0 15px 40px rgba(192, 12, 12, 0.3)',
                    border: '1px solid rgba(192, 12, 12, 0.5)',
                    background: 'rgba(255, 255, 255, 1)',
                },
                '@media (max-width: 768px)': {
                    position: 'absolute',
                    zIndex: 999,
                },
                ...customSx
            }}
        >
            <Box sx={{
                color: '#C00C0C',
                display: 'flex',
                background: 'rgba(192, 12, 12, 0.15)',
                padding: { xs: '4px', md: '8px' },
                borderRadius: '50%',
            }}>
                {React.cloneElement(icon, { sx: { fontSize: { xs: 16, md: 24 } } })}
            </Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: '#1a1a1a', fontSize: { xs: '0.7rem', md: '0.875rem' } }}>{text}</Typography>
        </Box>
    );

    return (
        <Box
            ref={heroRef}
            sx={{
                pt: { xs: 4, md: 12 },
                pb: { xs: 4, md: 12 },
                overflow: 'hidden',
                position: 'relative',
                minHeight: { xs: 'auto', md: '100vh' },
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
            }}
        >
            {/* Massive Background Text - Hidden on mobile */}
            {!isMobile && (
                <Typography
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: { xs: '8rem', md: '23rem' },
                        fontWeight: 900,
                        opacity: 0.03,
                        zIndex: 0,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        fontFamily: '"Outfit", sans-serif',
                        userSelect: 'none',
                    }}
                >
                    NearZO
                </Typography>
            )}

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mt: { xs: 10, md: 0 } }}>
                <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
                    {/* Text Content - Full width on mobile, half on desktop */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography
                                    className="hero-text"
                                    variant="overline"
                                    sx={{
                                        color: '#C00C0C',
                                        fontWeight: 900,
                                        letterSpacing: { xs: '2px', md: '4px' },
                                        mb: 1,
                                        display: 'block',
                                        fontSize: { xs: '0.7rem', md: '0.9rem' },
                                    }}
                                >
                                    HYPER-LOCAL ECOSYSTEM
                                </Typography>
                                <Typography
                                    className="hero-text"
                                    variant="h1"
                                    sx={{
                                        mb: 2,
                                        fontSize: { xs: '2rem', sm: '2.5rem', md: '4rem' },
                                        fontWeight: 800,
                                        lineHeight: 1.2,
                                        position: 'relative',
                                        zIndex: 10,
                                    }}
                                >
                                    Made Simple with,{' '}
                                    <span style={{
                                        color: '#C00C0C',
                                        display: 'inline-block',
                                        position: 'relative',
                                        zIndex: 10,
                                    }}>NearZO</span>
                                </Typography>
                                <Typography
                                    className="hero-text"
                                    variant="body1"
                                    sx={{
                                        maxWidth: '550px',
                                        fontSize: { xs: '0.9rem', md: '1.1rem' },
                                        color: '#4a4a4a',
                                        lineHeight: 1.7,
                                        position: 'relative',
                                        zIndex: 10,
                                        pr: { xs: 2, md: 0 }
                                    }}
                                >
                                    NearZO is your all-in-one hyperlocal platform to find nearby jobs, hire local workers, and discover small shops around you.
                                    Whether you're a job seeker, shop owner, or someone looking for daily needs like food, services, or repairs — NearZO connects you with real people in your neighborhood.
                                </Typography>
                            </Box>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="hero-text">
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        px: { xs: 3, md: 5 },
                                        py: { xs: 1.5, md: 2 },
                                        borderRadius: '100px',
                                        background: '#C00C0C',
                                        fontSize: { xs: '0.9rem', md: '1rem' },
                                        '&:hover': {
                                            background: '#a00a0a',
                                        }
                                    }}
                                >
                                    Download App
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{
                                        px: { xs: 3, md: 5 },
                                        py: { xs: 1.5, md: 2 },
                                        borderRadius: '100px',
                                        borderColor: '#1a1a1a',
                                        color: '#1a1a1a',
                                        borderWidth: '2px',
                                        fontSize: { xs: '0.9rem', md: '1rem' },
                                        '&:hover': {
                                            borderColor: '#C00C0C',
                                            background: 'rgba(192, 12, 12, 0.05)',
                                        }
                                    }}
                                >
                                    Explore Features
                                </Button>
                            </Stack>
                        </Stack>
                    </Grid>

                    {/* Phone Mockup - Always visible but responsive */}
                    <Grid item xs={12} md={6}>
                        <Box
                            ref={mockupContainerRef}
                            sx={{
                                position: 'relative',
                                height: { xs: '400px', sm: '450px', md: '600px' },
                                width: '100%',
                                mt: { xs: 4, md: 0 }
                            }}
                        >
                            {/* Floating Tags - Adjusted positions for mobile */}
                            {!isMobile && (
                                <>
                                    <FloatingTag
                                        icon={<HomeIcon />}
                                        text="Local Jobs"
                                        top="10%"
                                        left="220px"
                                    />

                                    <FloatingTag
                                        icon={<LocalMallIcon />}
                                        text="Nearby Shops"
                                        top="45%"
                                        left="-60px"
                                    />

                                    <FloatingTag
                                        icon={<WorkIcon />}
                                        text="Hire Locally"
                                        bottom="10%"
                                        right="-400px"
                                    />
                                </>
                            )}

                            {/* Phone Mockup Container - Responsive positioning */}
                            <Box
                                ref={mockupRef}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: { xs: '50%', md: '60%' },
                                    transform: 'translate(-50%, -50%)',
                                    width: { xs: '180px', sm: '220px', md: '280px' },
                                    zIndex: 5,
                                    transformStyle: 'preserve-3d',
                                }}
                            >
                                {/* Glow Effect */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '120%',
                                    height: '80%',
                                    background: 'radial-gradient(circle, rgba(192, 12, 12, 0.25) 0%, transparent 70%)',
                                    filter: 'blur(40px)',
                                    zIndex: -1,
                                }} />

                                {/* Phone Frame */}
                                <Box
                                    sx={{
                                        width: '100%',
                                        aspectRatio: '1/2',
                                        backgroundColor: '#1a1a1a',
                                        borderRadius: '40px',
                                        border: '6px solid #2a2a2a',
                                        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        transform: { xs: 'rotateY(0deg) rotateX(0deg)', md: 'rotateY(-20deg) rotateX(3deg)' },
                                        ml: { xs: 23, md: 30 }
                                    }}
                                >
                                    {/* App UI */}
                                    <Box sx={{ height: '100%', background: '#fff', overflow: 'hidden' }}>
                                        <Box sx={{ p: { xs: 2, md: 3 }, pt: { xs: 3, md: 5 }, bgcolor: '#C00C0C', color: 'white' }}>
                                            <Typography variant="h6" fontWeight={900} sx={{ fontSize: { xs: '0.9rem', md: '1.25rem' } }}>NearZO</Typography>
                                            <Typography variant="caption" sx={{ fontSize: { xs: '0.5rem', md: '0.6rem' } }}>Discover what's around you</Typography>
                                        </Box>

                                        <Box sx={{
                                            height: { xs: '260px', md: '360px' },
                                            background: '#f8f8f8',
                                            position: 'relative',
                                            backgroundImage: 'linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)',
                                            backgroundSize: '20px 20px',
                                            overflow: 'hidden'
                                        }}>
                                            {/* Route SVG Path */}
                                            <svg
                                                viewBox="0 0 280 360"
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    zIndex: 1
                                                }}
                                            >
                                                <path
                                                    id="route-path"
                                                    d="M 120 140 Q 150 180, 200 240 T 220 280"
                                                    fill="none"
                                                    stroke="#C00C0C"
                                                    strokeWidth="3"
                                                    strokeDasharray="1000"
                                                    strokeDashoffset="1000"
                                                    opacity="0.6"
                                                />
                                            </svg>

                                            {/* Current Location Marker */}
                                            <Box
                                                className="map-marker"
                                                sx={{
                                                    position: 'absolute',
                                                    top: '140px',
                                                    left: '120px',
                                                    transform: 'translate(-50%, -50%)',
                                                    zIndex: 2,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Box sx={{
                                                    position: 'relative',
                                                    width: { xs: '24px', md: '36px' },
                                                    height: { xs: '24px', md: '36px' },
                                                }}>
                                                    <Box sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        bgcolor: 'rgba(192, 12, 12, 0.2)',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        position: 'relative',
                                                        zIndex: 2
                                                    }}>
                                                        <MyLocationIcon sx={{ color: '#C00C0C', fontSize: { xs: '14px', md: '18px' } }} />
                                                    </Box>
                                                    <Box className="map-marker-pulse" sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        borderRadius: '50%',
                                                        bgcolor: '#C00C0C',
                                                        zIndex: 1
                                                    }} />
                                                </Box>
                                                <Typography variant="caption" sx={{ color: '#1a1a1a', fontWeight: 800, mt: 0.5, bgcolor: 'white', px: 1, borderRadius: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: { xs: '0.5rem', md: '0.7rem' } }}>You</Typography>
                                            </Box>

                                            {/* Shop Marker */}
                                            <Box
                                                className="map-marker"
                                                sx={{
                                                    position: 'absolute',
                                                    top: '280px',
                                                    left: '220px',
                                                    transform: 'translate(-50%, -50%)',
                                                    zIndex: 2,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Box sx={{
                                                    width: { xs: '30px', md: '40px' },
                                                    height: { xs: '30px', md: '40px' },
                                                    bgcolor: '#C00C0C',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 6px 12px rgba(192, 12, 12, 0.3)'
                                                }}>
                                                    <StorefrontIcon sx={{ color: 'white', fontSize: { xs: '16px', md: '22px' } }} />
                                                </Box>
                                                <Typography variant="caption" sx={{ color: '#C00C0C', fontWeight: 800, mt: 0.5, bgcolor: 'white', px: 1, borderRadius: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: { xs: '0.5rem', md: '0.7rem' } }}>Egg Corner</Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Screen Glare */}
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                                        pointerEvents: 'none'
                                    }} />

                                    {/* Notch */}
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0, left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: { xs: '60px', md: '100px' },
                                        height: { xs: '15px', md: '20px' },
                                        bgcolor: '#2a2a2a',
                                        borderBottomLeftRadius: '12px',
                                        borderBottomRightRadius: '12px',
                                    }} />
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* Floating Tags for Mobile - Positioned differently */}
            {isMobile && (
                <Box sx={{ position: 'relative', mt: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', px: 2 }}>
                    <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        p: '6px 16px',
                        borderRadius: '100px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(192, 12, 12, 0.2)',
                    }}>
                        <Box sx={{ color: '#C00C0C', display: 'flex', background: 'rgba(192, 12, 12, 0.15)', padding: '4px', borderRadius: '50%' }}>
                            <HomeIcon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography variant="body2" fontWeight={700}>Local Jobs</Typography>
                    </Box>
                    <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        p: '6px 16px',
                        borderRadius: '100px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(192, 12, 12, 0.2)',
                    }}>
                        <Box sx={{ color: '#C00C0C', display: 'flex', background: 'rgba(192, 12, 12, 0.15)', padding: '4px', borderRadius: '50%' }}>
                            <LocalMallIcon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography variant="body2" fontWeight={700}>Nearby Shops</Typography>
                    </Box>
                    <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        p: '6px 16px',
                        borderRadius: '100px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(192, 12, 12, 0.2)',
                    }}>
                        <Box sx={{ color: '#C00C0C', display: 'flex', background: 'rgba(192, 12, 12, 0.15)', padding: '4px', borderRadius: '50%' }}>
                            <WorkIcon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography variant="body2" fontWeight={700}>Hire Locally</Typography>
                    </Box>
                </Box>
            )}

            <style>
                {`
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 0.5; }
                        50% { transform: scale(1.5); opacity: 0.2; }
                        100% { transform: scale(1); opacity: 0.5; }
                    }
                    
                    .map-marker-pulse {
                        animation: pulse 2s infinite;
                    }
                    
                    @media (max-width: 768px) {
                        .floating-tag {
                            min-width: 100px !important;
                            padding: 4px 12px !important;
                        }
                    }
                `}
            </style>
        </Box>
    );
};

export default Hero;