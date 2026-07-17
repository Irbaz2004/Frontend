// Hero.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Stack } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import LoginIcon from '@mui/icons-material/Login';
import radar from '../assets/Radar.gif';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
    const heroRef = useRef(null);
    const phoneContainerRef = useRef(null);
    const mobilePhoneRef = useRef(null);
    const [tagsVisible, setTagsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const navigate = useNavigate();

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        setTimeout(() => setTagsVisible(true), 100);

        const ctx = gsap.context(() => {
            gsap.from('.hero-text', {
                y: 50, opacity: 0, duration: 1,
                stagger: 0.1, ease: 'power3.out',
            });
            gsap.from('.floating-tag', {
                scale: 0, opacity: 0, duration: 0.8,
                stagger: 0.15, delay: 0.3, ease: 'back.out(1.7)',
            });

            const phoneElement = isMobile ? mobilePhoneRef.current : phoneContainerRef.current;
            if (phoneElement) {
                gsap.from(phoneElement, {
                    opacity: 0,
                    y: isMobile ? 50 : 0,
                    x: isMobile ? 0 : 50,
                    duration: 1.2, delay: 0.5, ease: 'power3.out',
                });
                gsap.to(phoneElement, {
                    y: -8, duration: 3, repeat: -1,
                    yoyo: true, ease: 'sine.inOut',
                });
            }

            if (!isMobile && phoneContainerRef.current) {
                gsap.to(phoneContainerRef.current, {
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 0.5,
                    },
                    y: 20,
                });
            }
        }, heroRef);

        return () => ctx.revert();
    }, [isMobile]);

    // Navigate to login page
    const handleGetStarted = () => {
        navigate('/app/login');
    };

    const handleExploreFeatures = () => {
        const section = document.getElementById('our-solutions');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const FloatingTag = ({ icon, text, top, left, right, bottom, customSx }) => (
        <Box
            className="floating-tag"
            sx={{
                position: 'absolute',
                minWidth: { xs: '120px', sm: '140px', md: '180px' },
                top, left, right, bottom,
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, md: 1.5 },
                p: { xs: '8px 16px', md: '12px 24px' },
                borderRadius: '100px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(50, 95, 236, 0.2)',
                zIndex: 9999,
                cursor: 'default',
                transition: 'all 0.3s ease',
                opacity: tagsVisible ? 1 : 0,
                visibility: tagsVisible ? 'visible' : 'hidden',
                pointerEvents: 'auto',
                '&:hover': {
                    transform: 'translateY(-4px) scale(1.05)',
                    boxShadow: '0 15px 40px rgba(50, 95, 236, 0.15)',
                    border: '1px solid rgba(50, 95, 236, 0.5)',
                    background: 'rgba(255, 255, 255, 1)',
                },
                ...customSx
            }}
        >
            <Box sx={{
                color: '#325fec',
                display: 'flex',
                background: 'rgba(50, 95, 236, 0.15)',
                padding: { xs: '6px', md: '8px' },
                borderRadius: '50%',
            }}>
                {React.cloneElement(icon, { sx: { fontSize: { xs: 18, md: 24 } } })}
            </Box>
            <Typography variant="body2" fontWeight={700} sx={{
                color: '#1a1a1a',
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                fontFamily: '"Inter", sans-serif'
            }}>
                {text}
            </Typography>
        </Box>
    );

    const PhoneFrame = ({ refProp }) => (
        <Box
            ref={refProp}
            sx={{
                position: 'absolute',
                top: '50%',
                left: { xs: '50%', md: '60%' },
                transform: 'translate(-50%, -50%)',
                width: { xs: '240px', sm: '260px', md: '300px' },
                zIndex: 10,
            }}
        >
            <Box sx={{
                width: '100%',
                aspectRatio: '1/2',
                backgroundColor: '#ffffff',
                borderRadius: '40px',
                border: '6px solid #2a2a2a',
                boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                position: 'relative',
            }}>
                <Box sx={{ height: '70%', width: '100%', position: 'relative' }}>
                    <img
                        src={radar}
                        alt="App Demo"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', marginTop: '20%' }}
                    />
                </Box>
                <Box sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }} />
                <Box sx={{
                    position: 'absolute', top: 0, left: '50%',
                    transform: 'translateX(-50%)',
                    width: { xs: '60px', md: '100px' },
                    height: { xs: '15px', md: '20px' },
                    bgcolor: '#2a2a2a',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                }} />
            </Box>
        </Box>
    );

    return (
        <Box
            ref={heroRef}
            sx={{
                pt: { xs: 4, md: 12 },
                pb: { xs: 4, md: 12 },
                overflow: 'visible',
                position: 'relative',
                minHeight: { xs: 'auto', md: '100vh' },
                background: '#ffffff',
            }}
        >
            {!isMobile && (
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px', height: '600px',
                    opacity: 0.03, zIndex: 0, pointerEvents: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <img src="/logo.png" alt="HeloZO Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>
            )}

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mt: { xs: 10, md: 0 } }}>
                <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
                    {/* Text Content */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography className="hero-text" variant="overline" sx={{
                                    color: '#325fec', fontWeight: 900,
                                    letterSpacing: { xs: '2px', md: '4px' },
                                    mb: 1, display: 'block',
                                    fontSize: { xs: '0.7rem', md: '0.9rem' },
                                    fontFamily: '"Inter", sans-serif',
                                }}>
                                    HYPER-LOCAL ECOSYSTEM
                                </Typography>
                                <Typography className="hero-text" variant="h1" sx={{
                                    mb: 2,
                                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                                    fontWeight: 'bold', lineHeight: 1.2,
                                    position: 'relative', zIndex: 10,
                                    color: '#020402', fontFamily: '"Inter", sans-serif',
                                }}>
                                    Made Simple with,{' '}
                                    <span style={{ color: '#325fec', fontFamily: '"Inter", sans-serif', fontWeight: 900, display: 'inline-block' }}>
                                        HeloZO
                                    </span>
                                </Typography>
                                <Typography className="hero-text" variant="body1" sx={{
                                    maxWidth: '550px',
                                    fontSize: { xs: '0.9rem', md: '1.1rem' },
                                    color: '#5a6e8a', lineHeight: 1.7,
                                    position: 'relative', zIndex: 10,
                                    pr: { xs: 2, md: 0 },
                                    fontFamily: '"Inter", sans-serif',
                                }}>
                                    HeloZO is your all-in-one hyperlocal platform to find nearby jobs, hire local workers, and discover small shops around you.
                                    Whether you're a job seeker, shop owner, or someone looking for daily needs like food, jobs, or house — HeloZO connects you with real people in your neighborhood.
                                </Typography>
                            </Box>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="hero-text">
                                {/* ── Get Started → /app/login ── */}
                                <Button
                                    variant="contained"
                                    size="large"
                                    // onClick={handleGetStarted}
                                    startIcon={<LoginIcon />}
                                    sx={{
                                        px: { xs: 3, md: 5 },
                                        py: { xs: 1.5, md: 2 },
                                        borderRadius: '100px',
                                        backgroundColor: '#325fec',
                                        fontSize: { xs: '0.9rem', md: '1rem' },
                                        fontFamily: '"Inter", sans-serif',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        '&:hover': { backgroundColor: '#2548b0' },
                                    }}
                                >
                                    Stay Tuned
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={handleExploreFeatures}
                                    sx={{
                                        px: { xs: 3, md: 5 },
                                        py: { xs: 1.5, md: 2 },
                                        borderRadius: '100px',
                                        borderColor: '#325fec',
                                        color: '#325fec',
                                        borderWidth: '2px',
                                        fontSize: { xs: '0.9rem', md: '1rem' },
                                        backgroundColor: 'transparent',
                                        fontFamily: '"Inter", sans-serif',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        '&:hover': {
                                            borderColor: '#2548b0',
                                            backgroundColor: 'rgba(50, 95, 236, 0.05)',
                                        }
                                    }}
                                >
                                    Explore Features
                                </Button>
                            </Stack>
                        </Stack>
                    </Grid>

                    {/* Phone - Right Side */}
                    <Grid item xs={12} md={6} ml={{ xs: 23, md: 30 }}>
                        {!isMobile ? (
                            <Box ref={phoneContainerRef} sx={{
                                position: 'relative',
                                height: { xs: '400px', sm: '450px', md: '600px' },
                                width: '100%', mt: { xs: 4, md: 0 },
                            }}>
                                <FloatingTag icon={<HomeIcon />} text="Local Jobs" top="10%" left="15%" />
                                <FloatingTag icon={<LocalMallIcon />} text="Nearby Shops" top="45%" right="10%" left="auto" />
                                <FloatingTag icon={<WorkIcon />} text="Hire Locally" bottom="10%" left="20%" />
                                <PhoneFrame />
                            </Box>
                        ) : (
                            <Box sx={{
                                position: 'relative', height: '550px',
                                width: '100%', mt: 2, mb: 2, overflow: 'visible',
                            }}>
                                <FloatingTag icon={<HomeIcon />} text="Local Jobs" top="10%" left="0%" customSx={{ zIndex: 9999, position: 'absolute' }} />
                                <FloatingTag icon={<LocalMallIcon />} text="Nearby Shops" top="35%" right="0%" left="auto" customSx={{ zIndex: 9999, position: 'absolute' }} />
                                <FloatingTag icon={<WorkIcon />} text="Hire Locally" bottom="10%" left="5%" customSx={{ zIndex: 9999, position: 'absolute' }} />
                                <PhoneFrame refProp={mobilePhoneRef} />
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Container>

            <style>{`
                @media (max-width: 768px) {
                    .floating-tag {
                        min-width: 110px !important;
                        padding: 8px 14px !important;
                        z-index: 9999 !important;
                        display: flex !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        position: absolute !important;
                        background: rgba(255, 255, 255, 0.98) !important;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
                    }
                }
                @media (max-width: 480px) {
                    .floating-tag { min-width: 100px !important; padding: 6px 12px !important; }
                    .floating-tag .MuiTypography-root { font-size: 0.7rem !important; }
                }
                .MuiGrid-root { overflow: visible !important; }
                .MuiContainer-root { overflow: visible !important; }
            `}</style>
        </Box>
    );
};

export default Hero;