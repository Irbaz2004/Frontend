import React, { useEffect, useRef } from 'react';
import { Box, Container, Typography, Stack, Paper, useTheme, useMediaQuery } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
    {
        title: 'Register as You',
        desc: 'Join as a Job Seeker, Employer, or Shop Owner. It takes less than a minute.',
        color: '#325fec',
        icon: '👤',
    },
    {
        title: 'Search & Explore',
        desc: 'Browse local jobs, nearby services, or filter by category to find exactly what you need.',
        color: '#325fec',
        icon: '🔍',
    },
    {
        title: 'Connect Instantly',
        desc: 'Call, chat, or get directions to the shop. Direct communication with no middlemen.',
        color: '#325fec',
        icon: '⚡',
    },
    {
        title: 'Grow Local',
        desc: 'Hire faster, find work easily, or boost your shops visibility in your community.',
        color: '#325fec',
        icon: '📈',
    },
];

const HowItWorks = () => {
    const containerRef = useRef(null);
    const pathRef = useRef(null);
    const stepRefs = useRef([]);
    const theme = useTheme();
    const isMobile = useMediaQuery('(max-width: 768px)');

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Curved Path Drawing Animation
            if (pathRef.current) {
                const pathLength = pathRef.current.getTotalLength();
                
                // Set initial state
                gsap.set(pathRef.current, {
                    strokeDasharray: pathLength,
                    strokeDashoffset: pathLength
                });
                
                // Animate the path drawing
                gsap.to(pathRef.current, {
                    strokeDashoffset: 0,
                    duration: 2,
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 70%",
                        end: "bottom 80%",
                        scrub: 1.5,
                    }
                });
            }

            // Steps Activation with staggered animation
            stepRefs.current.forEach((step, index) => {
                if (step) {
                    gsap.from(step, {
                        opacity: 0,
                        y: 50,
                        scale: 0.9,
                        duration: 0.8,
                        delay: index * 0.2,
                        scrollTrigger: {
                            trigger: step,
                            start: "top 85%",
                            toggleActions: "play none none none"
                        }
                    });
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Curved SVG path for desktop
    const curvedPath = "M 50,50 C 50,150 200,150 200,250 C 200,350 50,350 50,450 C 50,550 200,550 200,650 C 200,700 200,750 200,800";
    
    // S-curve path for more dynamic look
    const sCurvePath = "M 50,50 C 50,150 350,150 350,250 C 350,350 50,350 50,450 C 50,550 350,550 350,650 C 350,700 350,750 350,800";

    return (
        <Box ref={containerRef} sx={{
            py: { xs: 8, md: 15 },
            bgcolor: '#ffffff',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Pattern */}
            <Box sx={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: `radial-gradient(circle at 20% 30%, rgba(50, 95, 236, 0.02) 0%, transparent 50%),
                             radial-gradient(circle at 80% 70%, rgba(50, 95, 236, 0.02) 0%, transparent 50%)`,
                pointerEvents: 'none',
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ mb: { xs: 6, md: 10 }, textAlign: 'center' }}>
                    <Typography variant="overline" sx={{ 
                        color: '#325fec', 
                        fontWeight: 900, 
                        letterSpacing: '2px',
                        fontFamily: '"Inter", sans-serif',
                        fontSize: { xs: '0.7rem', md: '0.9rem' }
                    }}>
                        THE PROCESS
                    </Typography>
                    <Typography variant="h2" sx={{
                        fontWeight: 900,
                        fontFamily: '"Alumni Sans", sans-serif',
                        fontSize: { xs: '1.8rem', sm: '2.5rem', md: '4rem' },
                        mt: 1,
                        color: '#020402'
                    }}>
                        How It <span style={{ color: '#325fec' }}>Works</span>
                    </Typography>
                </Box>

                {/* Desktop Curved Roadmap */}
                {!isMobile && (
                    <Box sx={{ position: 'relative', minHeight: '900px', maxWidth: '900px', mx: 'auto' }}>
                        {/* SVG Curved Path */}
                        <svg
                            viewBox="0 0 400 850"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '100%',
                                height: '100%',
                                zIndex: 0,
                                pointerEvents: 'none'
                            }}
                        >
                            {/* Background path (gray) */}
                            <path
                                d={sCurvePath}
                                fill="none"
                                stroke="rgba(50, 95, 236, 0.1)"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                            {/* Animated path (blue) */}
                            <path
                                ref={pathRef}
                                d={sCurvePath}
                                fill="none"
                                stroke="#325fec"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                            {/* Decorative dots along the path */}
                            <circle cx="50" cy="50" r="6" fill="#325fec" />
                            <circle cx="350" cy="250" r="6" fill="#325fec" />
                            <circle cx="50" cy="450" r="6" fill="#325fec" />
                            <circle cx="350" cy="650" r="6" fill="#325fec" />
                        </svg>

                        {/* Steps positioned along the curve */}
                        {steps.map((step, index) => {
                            const positions = [
                                { left: '15%', top: '5%', direction: 'right' },
                                { left: '55%', top: '28%', direction: 'left' },
                                { left: '15%', top: '52%', direction: 'right' },
                                { left: '55%', top: '76%', direction: 'left' },
                            ];
                            
                            return (
                                <Box
                                    key={index}
                                    ref={el => stepRefs.current[index] = el}
                                    sx={{
                                        position: 'absolute',
                                        left: positions[index].left,
                                        top: positions[index].top,
                                        transform: 'translateY(-50%)',
                                        width: '380px',
                                        zIndex: 2,
                                    }}
                                >
                                    <Paper elevation={0} sx={{
                                        px:4 ,
                                        py: 3,
                                        borderRadius: '24px',
                                        bgcolor: 'white',
                                        border: '2px solid rgba(50, 95, 236, 0.15)',
                                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            transform: 'translateY(-8px) scale(1.02)',
                                            borderColor: '#325fec',
                                            boxShadow: '0 20px 40px rgba(50, 95, 236, 0.15)',
                                            '& .step-icon': {
                                                transform: 'scale(1.1) rotate(5deg)',
                                                backgroundColor: '#325fec',
                                                color: 'white'
                                            }
                                        }
                                    }}>
                                        {/* Decorative line pointing to path */}
                                        <Box sx={{
                                            position: 'absolute',
                                            width: '30px',
                                            height: '2px',
                                            backgroundColor: '#325fec',
                                            top: '50%',
                                            [positions[index].direction === 'right' ? 'right' : 'left']: '-30px',
                                            opacity: 0.5
                                        }} />

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0 }}>
                                            
                                            <Typography variant="h4" sx={{
                                                color: '#325fec',
                                                fontWeight: 900,
                                                fontSize: '2rem',
                                                fontFamily: '"Alumni Sans", sans-serif',
                                            }}>
                                                0{index + 1}
                                            </Typography>
                                        </Box>
                                        
                                        <Typography variant="h6" sx={{
                                            fontWeight: 800,
                                            fontFamily: '"Alumni Sans", sans-serif',
                                            mb: 0,
                                            fontSize: '1.3rem',
                                            color: '#020402'
                                        }}>
                                            {step.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            lineHeight: 1.6,
                                            fontSize: '0.9rem',
                                            color: '#5a6e8a',
                                            fontFamily: '"Inter", sans-serif',
                                        }}>
                                            {step.desc}
                                        </Typography>
                                    </Paper>
                                </Box>
                            );
                        })}
                    </Box>
                )}

                {/* Mobile Vertical Timeline (simplified) */}
                {isMobile && (
                    <Box sx={{ position: 'relative', maxWidth: '100%', mx: 'auto' }}>
                        {/* Vertical Line */}
                        <Box sx={{
                            position: 'absolute',
                            left: '20px',
                            top: 0,
                            bottom: 0,
                            width: '3px',
                            bgcolor: 'rgba(50, 95, 236, 0.15)',
                            zIndex: 0
                        }}>
                            <Box sx={{
                                width: '100%',
                                height: '100%',
                                bgcolor: '#325fec',
                                transformOrigin: 'top',
                                animation: 'growLine 2s ease-out forwards',
                            }} />
                        </Box>

                        <Stack spacing={4}>
                            {steps.map((step, index) => (
                                <Box
                                    key={index}
                                    ref={el => stepRefs.current[index] = el}
                                    sx={{
                                        position: 'relative',
                                        zIndex: 1,
                                        pl: 5,
                                    }}
                                >
                                    {/* Dot */}
                                    <Box sx={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '20px',
                                        width: '14px',
                                        height: '14px',
                                        borderRadius: '50%',
                                        bgcolor: '#325fec',
                                        border: '3px solid white',
                                        boxShadow: '0 0 0 3px rgba(50, 95, 236, 0.2)',
                                        zIndex: 2
                                    }} />

                                    <Paper elevation={0} sx={{
                                        p: 3,
                                        borderRadius: '20px',
                                        bgcolor: 'white',
                                        border: '1px solid rgba(50, 95, 236, 0.15)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            borderColor: '#325fec',
                                            boxShadow: '0 10px 25px rgba(50, 95, 236, 0.1)'
                                        }
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                         
                                            <Typography variant="h4" sx={{
                                                color: '#325fec',
                                                fontWeight: 900,
                                                fontSize: '1.3rem',
                                                fontFamily: '"Alumni Sans", sans-serif',
                                            }}>
                                                0{index + 1}
                                            </Typography>
                                        </Box>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 800,
                                            fontFamily: '"Alumni Sans", sans-serif',
                                            mb: 1,
                                            fontSize: '1.1rem',
                                            color: '#020402'
                                        }}>
                                            {step.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            lineHeight: 1.6,
                                            fontSize: '0.85rem',
                                            color: '#5a6e8a',
                                            fontFamily: '"Inter", sans-serif',
                                        }}>
                                            {step.desc}
                                        </Typography>
                                    </Paper>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}
            </Container>

            <style>
                {`
                    @keyframes growLine {
                        from {
                            transform: scaleY(0);
                        }
                        to {
                            transform: scaleY(1);
                        }
                    }
                `}
            </style>
        </Box>
    );
};

export default HowItWorks;