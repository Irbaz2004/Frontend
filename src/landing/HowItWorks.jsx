import React, { useEffect, useRef } from 'react';
import { Box, Container, Typography, Stack, Paper, useTheme, useMediaQuery } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
    {
        title: 'Register as You',
        desc: 'Join as a Job Seeker, Employer, or Shop Owner. It takes less than a minute.',
        color: '#C00C0C',
    },
    {
        title: 'Search & Explore',
        desc: 'Browse local jobs, nearby services, or filter by category to find exactly what you need.',
        color: '#7C2F2F',
    },
    {
        title: 'Connect Instantly',
        desc: 'Call, chat, or get directions to the shop. Direct communication with no middlemen.',
        color: '#C00C0C',
    },
    {
        title: 'Grow Local',
        desc: 'Hire faster, find work easily, or boost your shops visibility in your community.',
        color: '#7C2F2F',
    },
];

const HowItWorks = () => {
    const containerRef = useRef(null);
    const lineRef = useRef(null);
    const stepRefs = useRef([]);
    const theme = useTheme();
    const isTiny = useMediaQuery('(max-width: 350px)');

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Progress Line Animation
            if (lineRef.current) {
                gsap.fromTo(lineRef.current,
                    { scaleY: 0 },
                    {
                        scaleY: 1,
                        ease: "none",
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: "top 60%",
                            end: "bottom 80%",
                            scrub: true
                        }
                    }
                );
            }

            // Steps Activation
            stepRefs.current.forEach((step, index) => {
                if (step) {
                    gsap.from(step, {
                        opacity: 0,
                        x: index % 2 === 0 ? -50 : 50,
                        duration: 1,
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

    return (
        <Box ref={containerRef} sx={{
            py: { xs: 8, md: 15 },
            bgcolor: '#F8F8F8',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: { xs: 6, md: 10 }, textAlign: 'center' }}>
                    <Typography variant="overline" sx={{ color: '#C00C0C', fontWeight: 900, letterSpacing: '2px' }}>
                        THE PROCESS
                    </Typography>
                    <Typography variant="h2" sx={{
                        fontWeight: 900,
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: { xs: '1.8rem', sm: '2.5rem', md: '4rem' },
                        mt: 1
                    }}>
                        How It <span style={{ color: '#C00C0C' }}>Works</span>
                    </Typography>
                </Box>

                <Box sx={{ position: 'relative', maxWidth: '800px', mx: 'auto' }}>
                    {/* Vertical Timeline Line */}
                    <Box sx={{
                        position: 'absolute',
                        left: { xs: '20px', sm: '50%' },
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        bgcolor: 'rgba(192, 12, 12, 0.1)',
                        transform: { xs: 'none', sm: 'translateX(-50%)' },
                        zIndex: 0
                    }}>
                        <Box ref={lineRef} sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: '#C00C0C',
                            transformOrigin: 'top',
                            boxShadow: '0 0 10px rgba(192, 12, 12, 0.5)'
                        }} />
                    </Box>

                    <Stack spacing={6}>
                        {steps.map((step, index) => (
                            <Box
                                key={index}
                                ref={el => stepRefs.current[index] = el}
                                sx={{
                                    display: 'flex',
                                    justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
                                    position: 'relative',
                                    zIndex: 1,
                                    pl: { xs: 6, sm: 0 },
                                    width: { xs: '100%', sm: 'auto' }
                                }}
                            >
                                {/* Center Point Dot */}
                                <Box sx={{
                                    position: 'absolute',
                                    left: { xs: '20px', sm: '50%' },
                                    top: '30px',
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    bgcolor: '#C00C0C',
                                    border: '4px solid white',
                                    transform: { xs: 'translateX(-50%)', sm: 'translateX(-50%)' },
                                    boxShadow: '0 0 0 4px rgba(192, 12, 12, 0.1)'
                                }} />

                                <Paper elevation={0} sx={{
                                    p: { xs: 2.5, sm: 4 },
                                    width: { xs: '100%', sm: '42%' },
                                    borderRadius: '24px',
                                    bgcolor: 'white',
                                    border: '1px solid rgba(192, 12, 12, 0.1)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        borderColor: '#C00C0C',
                                        boxShadow: '0 15px 30px rgba(192, 12, 12, 0.08)'
                                    }
                                }}>
                                    <Typography variant="h4" sx={{
                                        color: '#C00C0C',
                                        fontWeight: 900,
                                        mb: 1,
                                        fontSize: { xs: '1rem', sm: '1.5rem' }
                                    }}>
                                        0{index + 1}
                                    </Typography>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 800,
                                        fontFamily: '"Outfit", sans-serif',
                                        mb: 1.5,
                                        fontSize: { xs: '1rem', sm: '1.25rem' }
                                    }}>
                                        {step.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{
                                        lineHeight: 1.6,
                                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                                    }}>
                                        {step.desc}
                                    </Typography>
                                </Paper>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
};

export default HowItWorks;