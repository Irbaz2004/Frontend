import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Stack } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import AddTaskIcon from '@mui/icons-material/AddTask';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import RateReviewIcon from '@mui/icons-material/RateReview';

const features = [
    {
        title: 'Local Job Finder',
        desc: 'Find part-time and full-time work in your immediate neighborhood.',
        icon: <PersonSearchIcon sx={{ fontSize: 60 }} />,
        color: '#C00C0C',
        gradient: 'linear-gradient(135deg, #C00C0C 0%, #ff6b6b 100%)',
        highlight: 'Find work near you',
    },
    {
        title: 'Hire Instantly',
        desc: 'Shop owners can find and hire workers in minutes, not days.',
        icon: <AddTaskIcon sx={{ fontSize: 60 }} />,
        color: '#2196F3',
        gradient: 'linear-gradient(135deg, #2196F3 0%, #6ec8ff 100%)',
        highlight: 'Quick hiring process',
    },
    {
        title: 'Shop Discovery',
        desc: 'Discover hidden gems and small shops that aren’t on major platforms.',
        icon: <LocalMallIcon sx={{ fontSize: 60 }} />,
        color: '#FF9800',
        gradient: 'linear-gradient(135deg, #FF9800 0%, #ffc107 100%)',
        highlight: 'Find local stores',
    },
    {
        title: 'Service Search',
        desc: 'Need an egg sandwich or a tailor? Find exactly what you need fast.',
        icon: <RoomServiceIcon sx={{ fontSize: 60 }} />,
        color: '#4CAF50',
        gradient: 'linear-gradient(135deg, #4CAF50 0%, #8bc34a 100%)',
        highlight: 'Services at your doorstep',
    },
    {
        title: 'GPS-based Results',
        desc: 'Every result is hyper-local, sorted by distance from your current location.',
        icon: <GpsFixedIcon sx={{ fontSize: 60 }} />,
        color: '#9C27B0',
        gradient: 'linear-gradient(135deg, #9C27B0 0%, #ba68c8 100%)',
        highlight: 'Location-aware search',
    },
    {
        title: 'Profile & Reviews',
        desc: 'Verified user reviews help you make trusted choices in your community.',
        icon: <RateReviewIcon sx={{ fontSize: 60 }} />,
        color: '#607D8B',
        gradient: 'linear-gradient(135deg, #607D8B 0%, #90a4ae 100%)',
        highlight: 'Trusted community reviews',
    },
];

const CoreFeatures = () => {
    const containerRef = useRef(null);
    const sectionRef = useRef(null);
    const featureTextRef = useRef(null);
    const featureIconRef = useRef(null);
    const featureHighlightRef = useRef(null);
    const titleRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const progressRef = useRef(0);

    useEffect(() => {
        // Check if container ref exists
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Initial animations for the title - FIXED
            gsap.from(titleRef.current.children, {
                opacity: 0,
                y: 50,
                duration: 1,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: 'top 80%',
                    end: 'top 30%',
                    scrub: false,
                    toggleActions: 'play none none none'
                }
            });

            // Ensure the feature section is visible initially
            gsap.set(featureTextRef.current, {
                opacity: 1,
                y: 0
            });

            gsap.set(featureIconRef.current, {
                opacity: 1,
                scale: 1,
                rotation: 0
            });

            gsap.set(featureHighlightRef.current, {
                opacity: 0.7,
                x: 0
            });

            // Create a timeline for the scroll-based animation
            const isTinyScreen = window.innerWidth < 450;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "+=300%",
                    scrub: 1,
                    pin: !isTinyScreen, // Disable pinning on tiny screens
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        const index = Math.floor(progress * features.length);

                        // Only update if index changed
                        if (index !== activeIndex && index < features.length) {
                            setActiveIndex(index);

                            // Fade animation for text change
                            gsap.to(featureTextRef.current, {
                                opacity: 0,
                                y: -20,
                                duration: 0.2,
                                onComplete: () => {
                                    // Update text and fade back in
                                    gsap.to(featureTextRef.current, {
                                        opacity: 1,
                                        y: 0,
                                        duration: 0.3
                                    });
                                }
                            });

                            // Animate icon
                            gsap.to(featureIconRef.current, {
                                scale: 0.8,
                                opacity: 0,
                                rotation: -180,
                                duration: 0.2,
                                onComplete: () => {
                                    gsap.to(featureIconRef.current, {
                                        scale: 1,
                                        opacity: 1,
                                        rotation: 0,
                                        duration: 0.4,
                                        ease: "back.out(1.7)"
                                    });
                                }
                            });

                            // Animate highlight
                            gsap.to(featureHighlightRef.current, {
                                opacity: 0,
                                x: 30,
                                duration: 0.2,
                                onComplete: () => {
                                    gsap.to(featureHighlightRef.current, {
                                        opacity: 0.7,
                                        x: 0,
                                        duration: 0.3
                                    });
                                }
                            });
                        }
                        progressRef.current = progress;
                    }
                }
            });

        }, containerRef);

        return () => ctx.revert();
    }, [activeIndex]);

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                bgcolor: '#ffffff'
            }}
        >
            {/* Background Pattern */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 10% 20%, rgba(192, 12, 12, 0.02) 0%, transparent 30%), radial-gradient(circle at 90% 80%, rgba(192, 12, 12, 0.02) 0%, transparent 30%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Title Section with ref */}
                <Box
                    ref={titleRef}
                    sx={{
                        py: 10,
                        textAlign: 'center'
                    }}
                >
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#C00C0C',
                            fontWeight: 900,
                            letterSpacing: '4px',
                            display: 'inline-block',
                            position: 'relative',
                            opacity: 1,
                            visibility: 'visible',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -8,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '40px',
                                height: '3px',
                                background: '#C00C0C',
                                borderRadius: '2px'
                            }
                        }}
                    >
                        THE FUTURE OF CONNECTIVITY
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 900,
                            mt: 4,
                            mb: 2,
                            fontSize: { xs: '2.5rem', md: '4rem' },
                            opacity: 1,
                            visibility: 'visible'
                        }}
                    >
                        Core Platform Features
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            maxWidth: '700px',
                            mx: 'auto',
                            color: '#4a4a4a',
                            fontSize: '1.25rem',
                            opacity: 1,
                            visibility: 'visible'
                        }}
                    >
                        Redefining local interactions with a structured, hyper-local ecosystem powered by intelligent 3D spatial awareness.
                    </Typography>
                </Box>
            </Container>

            {/* Scroll-based Feature Section */}
            <Box
                ref={sectionRef}
                sx={{
                    height: '100vh',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Progress Bar */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'rgba(192, 12, 12, 0.1)',
                    zIndex: 20
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${(activeIndex + 1) * (100 / features.length)}%`,
                        background: 'linear-gradient(90deg, #C00C0C, #ff6b6b)',
                        transition: 'width 0.3s ease'
                    }} />
                </Box>

                {/* Feature Display */}
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    maxWidth: '1200px',
                    px: 4
                }}>
                    <Grid container spacing={6} alignItems="center">
                        {/* Left side - Feature content */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ pr: { md: 4 } }}>
                                {/* Feature Index */}
                                <Typography
                                    sx={{
                                        color: features[activeIndex].color,
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        letterSpacing: '2px',
                                        mb: 2,
                                        opacity: 0.7
                                    }}
                                >
                                    0{activeIndex + 1} / 0{features.length}
                                </Typography>

                                {/* Feature Title with fade effect */}
                                <Typography
                                    ref={featureTextRef}
                                    variant="h2"
                                    sx={{
                                        fontWeight: 900,
                                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                                        fontFamily: '"Outfit", sans-serif',
                                        mb: 3,
                                        lineHeight: 1.2,
                                        color: '#1a1a1a',
                                        opacity: 1,
                                        visibility: 'visible'
                                    }}
                                >
                                    {features[activeIndex].title}
                                </Typography>

                                {/* Feature Highlight */}
                                <Typography
                                    ref={featureHighlightRef}
                                    sx={{
                                        fontSize: '1.2rem',
                                        color: features[activeIndex].color,
                                        fontWeight: 600,
                                        mb: 3,
                                        opacity: 0.7,
                                        display: 'inline-block',
                                        borderLeft: `4px solid ${features[activeIndex].color}`,
                                        pl: 2,
                                        visibility: 'visible'
                                    }}
                                >
                                    {features[activeIndex].highlight}
                                </Typography>

                                {/* Feature Description */}
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontSize: '1.2rem',
                                        color: '#4a4a4a',
                                        lineHeight: 1.8,
                                        mb: 4,
                                        opacity: 1,
                                        visibility: 'visible'
                                    }}
                                >
                                    {features[activeIndex].desc}
                                </Typography>

                                {/* Progress Dots */}
                                <Stack direction="row" spacing={1}>
                                    {features.map((_, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                width: index === activeIndex ? '30px' : '10px',
                                                height: '10px',
                                                borderRadius: '5px',
                                                background: index === activeIndex
                                                    ? features[activeIndex].gradient
                                                    : 'rgba(0,0,0,0.1)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        </Grid>

                        {/* Right side - Feature Icon */}
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Box
                                    ref={featureIconRef}
                                    sx={{
                                        width: '300px',
                                        height: '300px',
                                        borderRadius: '60px',
                                        background: features[activeIndex].gradient,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        boxShadow: `0 30px 60px ${features[activeIndex].color}40`,
                                        transform: 'rotate(0deg)',
                                        transition: 'box-shadow 0.3s ease',
                                        opacity: 1,
                                        visibility: 'visible'
                                    }}
                                >
                                    {React.cloneElement(features[activeIndex].icon, {
                                        sx: { fontSize: 120 }
                                    })}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Navigation Hint */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 40,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    color: '#C00C0C',
                    animation: 'bounce 2s infinite'
                }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: '1px' }}>
                        SCROLL TO EXPLORE
                    </Typography>
                    <Box sx={{ fontSize: '2rem' }}>
                        ↓
                    </Box>
                </Box>

                {/* Background Numbers */}
                <Typography sx={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '5%',
                    fontSize: '15rem',
                    fontWeight: 900,
                    color: `${features[activeIndex].color}05`,
                    fontFamily: '"Outfit", sans-serif',
                    lineHeight: 1,
                    zIndex: 0,
                    pointerEvents: 'none',
                    transition: 'color 0.3s ease'
                }}>
                    0{activeIndex + 1}
                </Typography>
            </Box>

            <style>
                {`
                    @keyframes bounce {
                        0%, 100% { transform: translateX(-50%) translateY(0); }
                        50% { transform: translateX(-50%) translateY(10px); }
                    }
                `}
            </style>
        </Box>
    );
};

export default CoreFeatures;