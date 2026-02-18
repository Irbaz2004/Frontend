import React, { useEffect, useRef } from 'react';
import { Box, Container, Typography, Stack, Grid, Paper } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import Material-UI icons
import HomeIcon from '@mui/icons-material/Home';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import StorefrontIcon from '@mui/icons-material/Storefront';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

gsap.registerPlugin(ScrollTrigger);

const highlights = [
    {
        title: 'Unified Local Ecosystem',
        desc: 'NearZO isn\'t just an app; it\'s a digital town square. We combine job hunting, service discovery, and local shopping into a single, high-performance interface, saving you time and battery.',
        icon: <HomeIcon sx={{ fontSize: 28 }} />,
        color: '#C00C0C',
        gradient: 'linear-gradient(135deg, #C00C0C 0%, #ff6b6b 100%)'
    },
    {
        title: 'Precision Hyperlocal Engine',
        desc: 'Our proprietary search algorithm prioritizes listings within a 2-5km radius. Whether it\'s a carpenter or a croissant, we ensure you find the highest-rated options in your immediate vicinity.',
        icon: <MyLocationIcon sx={{ fontSize: 28 }} />,
        color: '#2196F3',
        gradient: 'linear-gradient(135deg, #2196F3 0%, #6ec8ff 100%)'
    },
    {
        title: 'Direct Connection, Zero Friction',
        desc: 'Skip the middleman. Our platform allows you to call or chat directly with shop owners and job posters. No commissions, no booking fees—just pure local connection.',
        icon: <FlashOnIcon sx={{ fontSize: 28 }} />,
        color: '#FF9800',
        gradient: 'linear-gradient(135deg, #FF9800 0%, #ffc107 100%)'
    },
    {
        title: 'Empowering Micro-Vendors',
        desc: 'We offer free digital storefronts for small vendors. We believe in leveling the playing field, giving every local shop the premium online presence they deserve.',
        icon: <StorefrontIcon sx={{ fontSize: 28 }} />,
        color: '#4CAF50',
        gradient: 'linear-gradient(135deg, #4CAF50 0%, #8bc34a 100%)'
    },
    {
        title: 'Verified Trusted Community',
        desc: 'Every user and business profile undergoes basic verification. Our community-driven review system ensures that you are always connecting with reliable neighbors.',
        icon: <VerifiedUserIcon sx={{ fontSize: 28 }} />,
        color: '#9C27B0',
        gradient: 'linear-gradient(135deg, #9C27B0 0%, #ba68c8 100%)'
    },
    {
        title: 'Real-Time Opportunities',
        desc: 'Get instant notifications for flash sales at nearby shops or urgent part-time job openings. Stay synced with the heartbeat of your neighborhood.',
        icon: <NotificationsActiveIcon sx={{ fontSize: 28 }} />,
        color: '#607D8B',
        gradient: 'linear-gradient(135deg, #607D8B 0%, #90a4ae 100%)'
    },
];

const WhyForEasy = () => {
    const containerRef = useRef(null);
    const leftContentRef = useRef(null);
    const itemsRef = useRef([]);

    useEffect(() => {
        // Check if container ref exists
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // First ensure all items are visible
            gsap.set(leftContentRef.current.children, {
                opacity: 1,
                y: 0,
                visibility: 'visible'
            });

            // Set all highlight items to visible
            itemsRef.current.forEach((item) => {
                if (item) {
                    gsap.set(item, {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        visibility: 'visible'
                    });
                }
            });

            // Animate left content - FIXED
            gsap.from(leftContentRef.current.children, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: leftContentRef.current,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    scrub: false,
                    toggleActions: 'play none none none',
                    once: true
                }
            });

            // Animate each highlight item with enhanced effects
            itemsRef.current.forEach((item, index) => {
                if (!item) return;

                // Entry animation - FIXED
                gsap.fromTo(item,
                    {
                        opacity: 0,
                        x: 50,
                        scale: 0.95
                    },
                    {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        duration: 0.8,
                        delay: index * 0.15,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: item,
                            start: 'top 85%',
                            end: 'bottom 20%',
                            toggleActions: 'play none none none',
                            once: true
                        }
                    }
                );

                // Hover animation timeline (these don't affect initial visibility)
                item.addEventListener('mouseenter', () => {
                    gsap.to(item, {
                        scale: 1.02,
                        x: 15,
                        boxShadow: '0 30px 60px rgba(192, 12, 12, 0.15)',
                        duration: 0.4,
                        ease: 'power2.out'
                    });

                    gsap.to(item.querySelector('.highlight-icon'), {
                        rotation: 360,
                        scale: 1.1,
                        duration: 0.6,
                        ease: 'back.out(1.7)'
                    });

                    gsap.to(item.querySelector('.highlight-dot'), {
                        scale: 1.5,
                        opacity: 0.8,
                        duration: 0.4
                    });
                });

                item.addEventListener('mouseleave', () => {
                    gsap.to(item, {
                        scale: 1,
                        x: 0,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                        duration: 0.4,
                        ease: 'power2.out'
                    });

                    gsap.to(item.querySelector('.highlight-icon'), {
                        rotation: 0,
                        scale: 1,
                        duration: 0.4,
                        ease: 'power2.out'
                    });

                    gsap.to(item.querySelector('.highlight-dot'), {
                        scale: 1,
                        opacity: 1,
                        duration: 0.4
                    });
                });
            });

            // Parallax background effect
            gsap.to('.gradient-bg', {
                y: 50,
                opacity: 0.5,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5,
                }
            });

        }, containerRef);

        return () => {
            // Clean up event listeners
            itemsRef.current.forEach((item) => {
                if (item) {
                    item.removeEventListener('mouseenter', () => { });
                    item.removeEventListener('mouseleave', () => { });
                }
            });
            ctx.revert();
        };
    }, []);

    return (
        <Box
            ref={containerRef}
            sx={{
                py: 18,
                bgcolor: '#F8F8F8',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Animated Background Elements */}
            <Box
                className="gradient-bg"
                sx={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(192,12,12,0.05) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    zIndex: 0,
                    animation: 'float 20s infinite alternate'
                }}
            />
            <Box
                className="gradient-bg"
                sx={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-5%',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(192,12,12,0.03) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    zIndex: 0,
                    animation: 'float 25s infinite alternate-reverse'
                }}
            />

            {/* Decorative Grid Pattern */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(rgba(192,12,12,0.02) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                opacity: 0.5,
                zIndex: 0
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={8} alignItems="flex-start">
                    <Grid item xs={12} md={5}>
                        <Stack
                            ref={leftContentRef}
                            spacing={4}
                            sx={{
                                position: { xs: 'relative', md: 'sticky' },
                                top: { md: 100 },
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="overline"
                                    sx={{
                                        color: '#C00C0C',
                                        fontWeight: 900,
                                        letterSpacing: '3px',
                                        fontSize: '0.9rem',
                                        mb: 2,
                                        display: 'inline-block',
                                        position: 'relative',
                                        opacity: 1,
                                        visibility: 'visible',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: -8,
                                            left: 0,
                                            width: '40px',
                                            height: '3px',
                                            background: '#C00C0C',
                                            borderRadius: '2px'
                                        }
                                    }}
                                >
                                    OUR VALUES
                                </Typography>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 900,
                                        color: '#1a1a1a',
                                        mt: 3,
                                        fontFamily: '"Outfit", sans-serif',
                                        fontSize: { xs: '3rem', md: '3.8rem' },
                                        lineHeight: 1.1,
                                        position: 'relative',
                                        opacity: 1,
                                        visibility: 'visible'
                                    }}
                                >
                                    Why{' '}
                                    <Box
                                        component="span"
                                        sx={{
                                            color: '#C00C0C',
                                            position: 'relative',
                                            display: 'inline-block',
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                bottom: 5,
                                                left: 0,
                                                width: '100%',
                                                height: '8px',
                                                background: 'rgba(192,12,12,0.2)',
                                                zIndex: -1
                                            }
                                        }}
                                    >
                                        NearZO
                                    </Box>
                                    <br />
                                    is Unique.
                                </Typography>
                            </Box>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontSize: '1.25rem',
                                    color: '#4a4a4a',
                                    lineHeight: 1.7,
                                    borderLeft: '4px solid #C00C0C',
                                    pl: 3,
                                    py: 1,
                                    opacity: 1,
                                    visibility: 'visible'
                                }}
                            >
                                We aren't just another directory. NearZO is a community engine designed to make local life better, faster, and more rewarding for everyone.
                            </Typography>

                            {/* Stats Counter */}
                            <Stack direction="row" spacing={4} sx={{ mt: 4 }}>
                                <Box>
                                    <Typography variant="h3" fontWeight={900} sx={{ color: '#C00C0C' }}>
                                        10k+
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Active Users
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h3" fontWeight={900} sx={{ color: '#C00C0C' }}>
                                        500+
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Local Shops
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h3" fontWeight={900} sx={{ color: '#C00C0C' }}>
                                        98%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Satisfaction
                                    </Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <Stack spacing={3}>
                            {highlights.map((item, index) => (
                                <Paper
                                    key={index}
                                    ref={el => itemsRef.current[index] = el}
                                    elevation={0}
                                    className="why-item"
                                    sx={{
                                        p: 4,
                                        bgcolor: 'white',
                                        borderRadius: '24px',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        opacity: 1,
                                        visibility: 'visible',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '4px',
                                            height: '100%',
                                            background: item.gradient,
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease'
                                        },
                                        '&:hover': {
                                            '&::before': {
                                                opacity: 1
                                            }
                                        }
                                    }}
                                >
                                    <Stack direction="row" spacing={3}>
                                        {/* Icon Box */}
                                        <Box
                                            className="highlight-icon"
                                            sx={{
                                                width: '60px',
                                                height: '60px',
                                                minWidth: '60px',
                                                borderRadius: '16px',
                                                background: item.gradient,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                                transform: 'rotate(0deg)',
                                                transition: 'all 0.3s ease',
                                                opacity: 1,
                                                visibility: 'visible'
                                            }}
                                        >
                                            {item.icon}
                                        </Box>

                                        {/* Content */}
                                        <Stack spacing={1.5} sx={{ flex: 1 }}>
                                            <Typography
                                                variant="h5"
                                                fontWeight={800}
                                                sx={{
                                                    color: '#1a1a1a',
                                                    fontFamily: '"Outfit", sans-serif',
                                                    position: 'relative',
                                                    display: 'inline-block',
                                                    opacity: 1,
                                                    visibility: 'visible'
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                color="text.secondary"
                                                sx={{
                                                    lineHeight: 1.7,
                                                    fontSize: '1rem',
                                                    opacity: 1,
                                                    visibility: 'visible'
                                                }}
                                            >
                                                {item.desc}
                                            </Typography>
                                        </Stack>

                                        {/* Decorative Dot */}
                                        <Box
                                            className="highlight-dot"
                                            sx={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: item.gradient,
                                                alignSelf: 'center',
                                                opacity: 0.5,
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    </Stack>

                                    {/* Background Glow */}
                                    <Box sx={{
                                        position: 'absolute',
                                        top: '-20%',
                                        right: '-10%',
                                        width: '150px',
                                        height: '150px',
                                        borderRadius: '50%',
                                        background: item.gradient,
                                        opacity: 0.03,
                                        filter: 'blur(40px)',
                                        zIndex: 0,
                                        pointerEvents: 'none'
                                    }} />
                                </Paper>
                            ))}
                        </Stack>
                    </Grid>
                </Grid>
            </Container>

            <style>
                {`
                    @keyframes float {
                        0% { transform: translate(0, 0); }
                        50% { transform: translate(30px, 20px); }
                        100% { transform: translate(-20px, -30px); }
                    }
                    
                    @keyframes pulse {
                        0%, 100% { opacity: 0.5; }
                        50% { opacity: 0.8; }
                    }
                `}
            </style>
        </Box>
    );
};

export default WhyForEasy;