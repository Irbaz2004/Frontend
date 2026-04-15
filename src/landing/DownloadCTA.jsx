import React, { useEffect, useRef } from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import gsap from 'gsap';

const DownloadCTA = () => {
    const sectionRef = useRef(null);
    const radarRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.cta-box', {
                y: 50,
                opacity: 0,
                scale: 0.95,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 85%',
                },
            });

            // Radar sweep animation
            if (radarRef.current) {
                gsap.to(radarRef.current, {
                    rotation: 360,
                    duration: 4,
                    repeat: -1,
                    ease: "none",
                    transformOrigin: "center center"
                });
            }
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <Box
            ref={sectionRef}
            sx={{ pb:10, bgcolor: '#ffffff',mt:-5 }}
        >
            <Container maxWidth="lg">
                <Box
                    className="cta-box"
                    sx={{
                        borderRadius: '40px',
                        p: { xs: 6, md: 10 },
                        backgroundColor: '#325fec',
                        textAlign: 'center',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(50, 95, 236, 0.25)',
                        height: '300px',
                    }}
                >
                    {/* Concentric Rainbow Circles - White outer, #325fec inner */}
                    
                    {/* Circle 1 - Large White Circle */}
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '2px solid rgba(255, 255, 255, 0.15)',
                        animation: 'rotate 20s linear infinite',
                    }} />
                    
                    {/* Circle 2 - Medium #325fec Circle */}
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '380px',
                        height: '380px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(50, 95, 236, 0.15)',
                        border: '2px solid rgba(50, 95, 236, 0.3)',
                        animation: 'rotate 15s linear infinite reverse',
                    }} />
                    
                    {/* Circle 3 - Smaller White Circle */}
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '280px',
                        height: '280px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        animation: 'rotate 12s linear infinite',
                    }} />
                    
                    {/* Circle 4 - Smaller #325fec Circle */}
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(50, 95, 236, 0.2)',
                        border: '2px solid rgba(50, 95, 236, 0.4)',
                        animation: 'rotate 10s linear infinite reverse',
                    }} />
                    
                    {/* Circle 5 - Inner White Circle */}
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        border: '2px solid rgba(255, 255, 255, 0.25)',
                        animation: 'rotate 8s linear infinite',
                    }} />
                    
                    {/* Circle 6 - Innermost #325fec Circle */}
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(50, 95, 236, 0.25)',
                        border: '2px solid rgba(50, 95, 236, 0.5)',
                        animation: 'rotate 6s linear infinite reverse',
                    }} />

                    {/* Radar Signal Sweep - Center */}
                    <Box
                        ref={radarRef}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '500px',
                            height: '500px',
                            borderRadius: '50%',
                            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255, 255, 255, 0.3) 15deg, transparent 30deg)',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                            zIndex: 1,
                        }}
                    />

                    {/* Radar Pulse Rings - Center */}
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 1,
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.4)',
                            animation: 'radarPulse 2s ease-out infinite',
                        }} />
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.3)',
                            animation: 'radarPulse 2s ease-out infinite 0.6s',
                        }} />
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.2)',
                            animation: 'radarPulse 2s ease-out infinite 1.2s',
                        }} />
                    </Box>

                    {/* Additional decorative circles in corners with same pattern */}
                    <Box sx={{
                        position: 'absolute',
                        top: '-100px',
                        right: '-100px',
                        width: '250px',
                        height: '250px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '180px',
                            height: '180px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(50, 95, 236, 0.1)',
                            border: '2px solid rgba(50, 95, 236, 0.2)',
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '110px',
                                height: '110px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                border: '2px solid rgba(255, 255, 255, 0.15)',
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(50, 95, 236, 0.15)',
                                    border: '2px solid rgba(50, 95, 236, 0.3)',
                                }} />
                            </Box>
                        </Box>
                        {/* Small radar pulse on corner circle */}
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.2)',
                            animation: 'radarPulse 3s ease-out infinite 0.5s',
                            pointerEvents: 'none',
                        }} />
                    </Box>

                    <Box sx={{
                        position: 'absolute',
                        bottom: '-100px',
                        left: '-100px',
                        width: '250px',
                        height: '250px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(50, 95, 236, 0.05)',
                        border: '2px solid rgba(50, 95, 236, 0.1)',
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '180px',
                            height: '180px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            border: '2px solid rgba(255, 255, 255, 0.12)',
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '110px',
                                height: '110px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(50, 95, 236, 0.12)',
                                border: '2px solid rgba(50, 95, 236, 0.2)',
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    border: '2px solid rgba(255, 255, 255, 0.15)',
                                }} />
                            </Box>
                        </Box>
                        {/* Small radar pulse on corner circle */}
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            boxShadow: '0 0 0 0 rgba(50, 95, 236, 0.2)',
                            animation: 'radarPulse 3.5s ease-out infinite 1s',
                            pointerEvents: 'none',
                        }} />
                    </Box>

                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                        <Typography variant="h2" mb={3} sx={{ 
                            fontWeight: 900, 
                            fontFamily: '"Alumni Sans", sans-serif',
                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                            color: '#ffffff'
                        }}>
                            Ready to discover everything <span style={{ color: '#ffffff', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.3)' }}>Near You?</span>
                        </Typography>
                        <Typography variant="h5" mb={6} sx={{ 
                            opacity: 0.9, 
                            maxWidth: '700px', 
                            mx: 'auto', 
                            lineHeight: 1.6,
                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                            fontFamily: '"Inter", sans-serif',
                            color: '#ffffff'
                        }}>
                            Find local jobs, hire nearby workers, and discover small shops around you — all in one app.
                        </Typography>
                    </Box>
                </Box>
            </Container>

            <style>
                {`
                    @keyframes rotate {
                        from {
                            transform: translate(-50%, -50%) rotate(0deg);
                        }
                        to {
                            transform: translate(-50%, -50%) rotate(360deg);
                        }
                    }
                    
                    @keyframes radarPulse {
                        0% {
                            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
                        }
                        70% {
                            box-shadow: 0 0 0 60px rgba(255, 255, 255, 0);
                        }
                        100% {
                            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
                        }
                    }
                `}
            </style>
        </Box>
    );
};

export default DownloadCTA;