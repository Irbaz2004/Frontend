import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Container, Typography, Grid, Paper, Stack } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import SearchOffIcon from '@mui/icons-material/SearchOff';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const problems = [
    {
        title: 'No nearby job visibility',
        desc: 'People still walk shop to shop asking for work without knowing where vacancies exist.',
        icon: <SearchOffIcon />,
    },
    {
        title: 'Hard to find local services',
        desc: 'Finding a mechanic, nurse, or even an egg sandwich nearby takes unnecessary effort.',
        icon: <StorefrontIcon />,
    },
    {
        title: 'Small shops are invisible',
        desc: 'Local businesses lose customers because they have no digital presence.',
        icon: <BusinessIcon />,
    },
];

const solutions = [
    {
        id: 1,
        title: 'Jobs, Shops & Services',
        subtitle: 'One platform',
        desc: 'Find local jobs, nearby shops, and daily services in one single app.',
        icon: <CheckCircleOutlineIcon />,
        color: '#4CAF50',
        stats: '3-in-1',
        statLabel: 'Unified Platform',
        features: ['Job Search', 'Hire Workers', 'Discover Shops']
    },
    {
        id: 2,
        title: 'Location Based Search',
        subtitle: 'Near you',
        desc: 'Search anything — egg sandwich, pharmacy, mechanic — and see results around you.',
        icon: <MyLocationIcon />,
        color: '#2196F3',
        stats: 'Real-time',
        statLabel: 'GPS Results',
        features: ['Nearby Search', 'Map View', 'Instant Call']
    },
    {
        id: 3,
        title: 'Verified Local Network',
        subtitle: 'Trusted',
        desc: 'Profiles are verified so users can trust who they are hiring or visiting.',
        icon: <VerifiedUserIcon />,
        color: '#FF9800',
        stats: '100%',
        statLabel: 'Local Verified',
        features: ['Verified Shops', 'Reviews', 'Community Trust']
    },
];

const ProblemSolution = () => {
    const sectionRef = useRef(null);
    const triggerRef = useRef(null);
    const cardsContainerRef = useRef(null);
    const titleRef = useRef(null);
    const problemCardsRef = useRef([]);
    const solutionCardsRef = useRef([]);
    const [activeIndex, setActiveIndex] = useState(0);
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

    // Reset refs when component updates
    useEffect(() => {
        problemCardsRef.current = problemCardsRef.current.slice(0, 3);
        solutionCardsRef.current = solutionCardsRef.current.slice(0, 3);
    }, [isMobile]);

    // Main animation effect
    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Title animations
            if (titleRef.current) {
                gsap.from(titleRef.current.children, {
                    opacity: 0,
                    y: 30,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: titleRef.current,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    }
                });
            }

            // Problem cards individual animations
            problemCardsRef.current.forEach((card, index) => {
                if (card) {
                    gsap.from(card, {
                        opacity: 0,
                        scale: 0.5,
                        rotation: !isMobile && index % 2 === 0 ? -15 : 15,
                        y: 100,
                        duration: 1,
                        ease: "back.out(1.2)",
                        scrollTrigger: {
                            trigger: card,
                            start: "top 90%",
                            toggleActions: "play none none none",
                        }
                    });
                }
            });

            // Pulse animation for the center "THE GAP" circle (desktop only)
            if (!isMobile) {
                gsap.to(".gap-circle", {
                    scale: 1.1,
                    opacity: 0.8,
                    duration: 2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });

                // Rotating dashed circles
                gsap.to(".dashed-circle", {
                    rotation: 360,
                    duration: 40,
                    repeat: -1,
                    ease: "none"
                });
            }

            // Horizontal scroll solutions
            if (!isMobile && cardsContainerRef.current && triggerRef.current) {
                const container = cardsContainerRef.current;

                // Helper to get total scrollable width
                const getScrollAmount = () => {
                    return Math.max(0, container.scrollWidth - window.innerWidth);
                };

                const scrollAmount = getScrollAmount();

                // Individual card reveal within horizontal scroll
                solutionCardsRef.current.forEach((card) => {
                    if (card) {
                        gsap.from(card.querySelector('.solution-content'), {
                            opacity: 0,
                            y: 50,
                            duration: 0.8,
                            scrollTrigger: {
                                trigger: card,
                                start: "left 80%",
                                toggleActions: "play none none none",
                            }
                        });
                    }
                });

                // Horizontal scroll animation
                gsap.to(container, {
                    x: () => -getScrollAmount(),
                    ease: "none",
                    scrollTrigger: {
                        trigger: triggerRef.current,
                        start: "top top",
                        end: () => `+=${getScrollAmount()}`,
                        pin: true,
                        scrub: 1,
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            const index = Math.min(Math.floor(self.progress * solutions.length), solutions.length - 1);
                            setActiveIndex(index);
                        }
                    }
                });
            } else if (isMobile) {
                // Mobile: Simple fade-in animations for solutions
                solutionCardsRef.current.forEach((card) => {
                    if (card) {
                        gsap.from(card, {
                            opacity: 0,
                            y: 50,
                            duration: 0.8,
                            scrollTrigger: {
                                trigger: card,
                                start: "top 85%",
                                toggleActions: "play none none none",
                            }
                        });
                    }
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, [isMobile, solutions.length]);

    // Helper functions for refs
    const setProblemRef = useCallback((el, index) => {
        if (el) problemCardsRef.current[index] = el;
    }, []);

    const setSolutionRef = useCallback((el, index) => {
        if (el) solutionCardsRef.current[index] = el;
    }, []);

    return (
        <Box ref={sectionRef} sx={{ bgcolor: '#ffffff', position: 'relative', overflow: 'hidden' }}>
            {/* Background Pattern */}
            <Box sx={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at 10% 20%, rgba(192, 12, 12, 0.02) 0%, transparent 30%), radial-gradient(circle at 90% 80%, rgba(192, 12, 12, 0.02) 0%, transparent 30%)',
                pointerEvents: 'none',
                zIndex: 0,
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 8, sm: 10, md: 14 } }}>
                {/* Title Section */}
                <Box ref={titleRef} sx={{ mb: { xs: 6, sm: 8, md: 10 }, textAlign: 'center' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#C00C0C',
                            fontWeight: 800,
                            letterSpacing: { xs: '1px', sm: '2px' },
                            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' }
                        }}
                    >
                        LOCAL PROBLEM
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 900,
                            color: '#1a1a1a',
                            mt: 1,
                            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                            fontFamily: '"Outfit", sans-serif',
                            px: { xs: 2, sm: 0 }
                        }}
                    >
                        Solving the <span style={{ color: '#C00C0C' }}>Hyperlocal Problem</span>
                    </Typography>
                </Box>

                {/* Problems Section */}
                <Box sx={{
                    position: 'relative',
                    minHeight: { xs: 'auto', md: '750px' },
                    mb: { xs: 8, sm: 12, md: 15 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Background Circles - Hide on mobile */}
                    {!isMobile && (
                        <Box sx={{
                            display: { xs: 'none', md: 'block' },
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            top: 0, left: 0
                        }}>
                            <Box className="dashed-circle" sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-85%, -65%)',
                                width: { md: '450px', lg: '500px' },
                                height: { md: '450px', lg: '500px' },
                                borderRadius: '50%',
                                border: '2px dashed rgba(192, 12, 12, 0.15)',
                                bgcolor: 'rgba(192, 12, 12, 0.01)'
                            }} />
                            <Box className="dashed-circle" sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-15%, -65%)',
                                width: { md: '450px', lg: '500px' },
                                height: { md: '450px', lg: '500px' },
                                borderRadius: '50%',
                                border: '2px dashed rgba(192, 12, 12, 0.15)',
                                bgcolor: 'rgba(192, 12, 12, 0.01)',
                                animationDirection: 'reverse'
                            }} />
                            <Box className="dashed-circle" sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -15%)',
                                width: { md: '450px', lg: '500px' },
                                height: { md: '450px', lg: '500px' },
                                borderRadius: '50%',
                                border: '2px dashed rgba(192, 12, 12, 0.15)',
                                bgcolor: 'rgba(192, 12, 12, 0.01)'
                            }} />
                        </Box>
                    )}

                    {/* Problem Cards Grid */}
                    <Grid
                        container
                        spacing={{ xs: 3, sm: 4 }}
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            width: '100%',
                            minHeight: { md: '750px' },
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {problems.map((prob, index) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                key={index}
                                ref={el => setProblemRef(el, index)}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    zIndex: 2,
                                    ...(isMobile ? {
                                        // Mobile: normal grid layout
                                        mb: 2
                                    } : {
                                        // Desktop: absolute positioning for overlapping circles effect
                                        position: 'absolute',
                                        ...(index === 0 && { top: '5%', left: { md: '0%', lg: '10%' } }),
                                        ...(index === 1 && { top: '5%', right: { md: '0%', lg: '10%' } }),
                                        ...(index === 2 && { bottom: '0%', left: '50%', transform: 'translateX(-50%)' }),
                                    })
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 4, sm: 5 },
                                        borderRadius: { xs: '40px', md: '50%' },
                                        width: { xs: '100%', sm: '320px', md: '300px', lg: '350px' },
                                        height: { xs: 'auto', md: '300px', lg: '350px' },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        bgcolor: 'white',
                                        border: '1px solid rgba(192, 12, 12, 0.12)',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                                        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        cursor: 'default',
                                        position: 'relative',
                                        '&:hover': {
                                            transform: { xs: 'translateY(-10px)', md: 'scale(1.05) translateY(-10px)' },
                                            borderColor: '#C00C0C',
                                            boxShadow: '0 30px 60px rgba(192, 12, 12, 0.15)',
                                            zIndex: 20,
                                            '& .problem-icon': {
                                                transform: 'scale(1.1) rotate(5deg)',
                                                bgcolor: '#C00C0C',
                                                color: 'white'
                                            }
                                        }
                                    }}
                                >
                                    <Box className="problem-icon" sx={{
                                        p: 2,
                                        bgcolor: 'rgba(192, 12, 12, 0.05)',
                                        borderRadius: '50%',
                                        color: '#C00C0C',
                                        mb: 2,
                                        transition: '0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }}>
                                        {React.cloneElement(prob.icon, { sx: { fontSize: { xs: 32, sm: 40, md: 48 } } })}
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight={900}
                                        sx={{
                                            fontFamily: '"Outfit", sans-serif',
                                            mb: 1.5,
                                            fontSize: { xs: '1.2rem', md: '1.3rem', lg: '1.5rem' },
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {prob.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            maxWidth: '240px',
                                            fontSize: { xs: '0.85rem', sm: '0.9rem', lg: '1rem' },
                                            lineHeight: 1.6,
                                            fontWeight: 400
                                        }}
                                    >
                                        {prob.desc}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Center point indicator - Desktop only */}
                    {!isMobile && (
                        <Box className="gap-circle" sx={{
                            display: { xs: 'none', md: 'flex' },
                            position: 'absolute',
                            top: '40%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: { md: '160px', lg: '180px' },
                            height: { md: '160px', lg: '180px' },
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                            color: 'white',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            zIndex: 3,
                            boxShadow: '0 0 60px rgba(0, 0, 0, 0.4)',
                            border: '5px solid #C00C0C'
                        }}>
                            <Box>
                                <Typography variant="h6" fontWeight={900} sx={{
                                    fontSize: { md: '1.1rem', lg: '1.3rem' },
                                    lineHeight: 1,
                                    letterSpacing: '2px',
                                    mb: 0.5
                                }}>
                                    THE<br />GAP
                                </Typography>
                                <Box sx={{ width: '30px', height: '2px', bgcolor: '#C00C0C', mx: 'auto' }} />
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Mission Section */}
                <Box sx={{
                    textAlign: 'center',
                    mb: { xs: 8, sm: 10, md: 12 },
                    p: { xs: 4, sm: 6, md: 10 },
                    bgcolor: '#1a1a1a',
                    borderRadius: { xs: '40px', sm: '50px', md: '80px' },
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
                }}>
                    <Box sx={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(192, 12, 12, 0.15) 0%, transparent 70%)', zIndex: 0 }} />
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography
                            variant="overline"
                            sx={{
                                color: '#C00C0C',
                                fontWeight: 900,
                                letterSpacing: '4px',
                                fontSize: { xs: '0.75rem', sm: '0.9rem' }
                            }}
                        >
                            OUR MISSION
                        </Typography>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 900,
                                mt: 3,
                                mb: 3,
                                fontFamily: '"Outfit", sans-serif',
                                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem' },
                                lineHeight: 1.1
                            }}
                        >
                            Empowering Communities with <span style={{ color: '#C00C0C' }}>NearZO</span>
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                opacity: 0.9,
                                fontWeight: 400,
                                maxWidth: '800px',
                                mx: 'auto',
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' },
                                lineHeight: 1.6
                            }}
                        >
                            NearZO connects job seekers, shop owners, and customers on one platform — making local discovery simple, fast, and reliable.
                        </Typography>
                    </Box>
                </Box>
            </Container>

            {/* Horizontal Scroll Solutions Section */}
            <Box ref={triggerRef} sx={{ overflow: 'hidden', bgcolor: '#ffffff' }}>
                <Container maxWidth="lg">
                    <Box sx={{
                        px: { xs: 2, sm: 4, md: 0 },
                        mb: { xs: 4, md: 6 },
                        textAlign: { xs: 'center', md: 'left' }
                    }}>
                        <Typography sx={{
                            color: '#C00C0C',
                            fontWeight: 900,
                            mb: 2,
                            letterSpacing: '3px',
                            fontSize: { xs: '0.8rem', sm: '0.9rem' }
                        }}>
                            OUR SOLUTIONS
                        </Typography>
                        <Typography sx={{
                            fontSize: { xs: '2.2rem', sm: '3rem', md: '4.5rem' },
                            fontWeight: 900,
                            mb: 2,
                            color: '#1a1a1a',
                            fontFamily: '"Outfit", sans-serif',
                            lineHeight: 1
                        }}>
                            How <span style={{ color: '#C00C0C' }}>NearZO</span> Works
                        </Typography>
                    </Box>

                    <Box
                        ref={cardsContainerRef}
                        sx={{
                            display: 'flex',
                            width: { xs: '100%', md: 'fit-content' },
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: { xs: 3, md: 0 },
                            px: { xs: 2, md: 0 },
                        }}
                    >
                        {/* Spacer for start - reduced for better framing */}
                        <Box sx={{ width: { xs: 0, md: '2vw' }, display: { xs: 'none', md: 'block' } }} />

                        {solutions.map((sol, index) => (
                            <Box
                                key={sol.id}
                                ref={el => setSolutionRef(el, index)}
                                sx={{
                                    width: { xs: '100%', md: '80vw' },
                                    height: { xs: 'auto', md: '80vh' },
                                    minHeight: { xs: '450px', md: 'auto' },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                    bgcolor: '#ffffff',
                                    borderRight: { xs: 'none', md: '1px solid #f0f0f0' },

                                    borderRadius: { xs: '32px', md: 0 },
                                    position: 'relative',
                                    p: { xs: 4, sm: 6, md: 10 },
                                    transition: '0.5s',
                                    border: { xs: '1px solid rgba(192, 12, 12, 0.1)', md: '2px dashed rgba(192, 12, 12, 0.1) ' }
                                }}
                            >
                                {/* Background Number */}
                                <Typography sx={{
                                    fontSize: { xs: '6rem', sm: '10rem', md: '12rem', lg: '15rem' },
                                    fontWeight: 900,
                                    color: `${sol.color}08`,
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    whiteSpace: 'nowrap',
                                    zIndex: 0,
                                    pointerEvents: 'none',
                                    fontFamily: '"Outfit", sans-serif'
                                }}>
                                    0{index + 1}
                                </Typography>

                                {/* Content Wrapper */}
                                <Box className="solution-content" sx={{
                                    zIndex: 1,
                                    textAlign: 'center',
                                    maxWidth: '700px',
                                    width: '100%'
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        mb: 4
                                    }}>
                                        <Box sx={{
                                            width: { xs: '80px', sm: '100px', md: '120px' },
                                            height: { xs: '80px', sm: '100px', md: '120px' },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: `linear-gradient(135deg, ${sol.color}20 0%, ${sol.color}05 100%)`,
                                            borderRadius: '35%',
                                            color: sol.color,
                                            transition: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: `0 20px 40px ${sol.color}15`,
                                            '&:hover': {
                                                transform: 'rotate(10deg) scale(1.1)',
                                                background: sol.color,
                                                color: 'white',
                                                boxShadow: `0 30px 60px ${sol.color}40`,
                                            }
                                        }}>
                                            {React.cloneElement(sol.icon, {
                                                sx: { fontSize: { xs: 40, sm: 50, md: 60 } }
                                            })}
                                        </Box>
                                    </Box>

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: sol.color,
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            letterSpacing: '4px',
                                            mb: 1.5,
                                            display: 'block',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {sol.subtitle}
                                    </Typography>

                                    <Typography sx={{
                                        fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem' },
                                        fontWeight: 900,
                                        color: '#1a1a1a',
                                        mb: 2,
                                        fontFamily: '"Outfit", sans-serif',
                                        lineHeight: 1.1
                                    }}>
                                        {sol.title}
                                    </Typography>

                                    <Typography sx={{
                                        color: '#444',
                                        mb: 5,
                                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                                        lineHeight: 1.7,
                                        fontWeight: 400
                                    }}>
                                        {sol.desc}
                                    </Typography>

                                    {/* Features Display */}
                                    <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mb: 5 }}>
                                        {sol.features.map((feature, idx) => (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    px: 3,
                                                    py: 1.2,
                                                    bgcolor: '#f8f8f8',
                                                    borderRadius: '100px',
                                                    border: '1px solid #eee',
                                                    color: '#666',
                                                    fontWeight: 600,
                                                    fontSize: '0.85rem',
                                                    transition: '0.3s',
                                                    '&:hover': {
                                                        bgcolor: sol.color,
                                                        color: 'white',
                                                        borderColor: sol.color,
                                                        transform: 'translateY(-3px)'
                                                    }
                                                }}
                                            >
                                                {feature}
                                            </Box>
                                        ))}
                                    </Stack>

                                    {/* Stats Summary */}
                                    <Box sx={{
                                        display: 'inline-flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        p: 3,
                                        px: 5,
                                        background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                                        borderRadius: '32px',
                                        color: 'white',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                                    }}>
                                        <Typography
                                            variant="h3"
                                            fontWeight={900}
                                            sx={{
                                                color: sol.color,
                                                fontSize: { xs: '2rem', sm: '2.5rem' },
                                                lineHeight: 1
                                            }}
                                        >
                                            {sol.stats}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                opacity: 0.8,
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                mt: 0.5
                                            }}
                                        >
                                            {sol.statLabel}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ))}

                        {/* Spacer for end */}
                        <Box sx={{ width: { xs: 0, md: '5vw' }, display: { xs: 'none', md: 'block' } }} />
                    </Box>

                    {/* Scroll Hint */}
                    <Box sx={{
                        textAlign: 'center',
                        py: { xs: 3, sm: 4, md: 5 },
                        color: '#999',
                        display: { xs: 'none', md: 'block' }
                    }}>
                        Scroll down to explore solutions →
                    </Box>

                    {/* Mobile Progress Indicator */}
                    <Box sx={{
                        display: { xs: 'flex', md: 'none' },
                        justifyContent: 'center',
                        pb: 4,
                        gap: 1
                    }}>
                        {solutions.map((sol, index) => (
                            <Box
                                key={index}
                                sx={{
                                    width: index === activeIndex ? '30px' : '8px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: index === activeIndex ? sol.color : 'rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default ProblemSolution;