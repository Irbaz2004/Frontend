import React, { useEffect, useRef } from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import gsap from 'gsap';

const DownloadCTA = () => {
    const sectionRef = useRef(null);

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
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <Box
            ref={sectionRef}
            sx={{ py: 14, bgcolor: '#ffffff' }}
        >
            <Container maxWidth="lg">
                <Box
                    className="cta-box"
                    sx={{
                        borderRadius: '40px',
                        p: { xs: 6, md: 10 },
                        bgcolor: '#C00C0C',
                        textAlign: 'center',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(192, 12, 12, 0.2)',
                    }}
                >
                    {/* Background Decorative Circles */}
                    <Box sx={{
                        position: 'absolute',
                        top: '-10%', right: '-5%',
                        width: '300px', height: '300px',
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.05)',
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        bottom: '-15%', left: '-5%',
                        width: '200px', height: '200px',
                        borderRadius: '50%',
                        bgcolor: 'rgba(0,0,0,0.1)',
                    }} />

                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="h2" mb={3} sx={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif' }}>
                            Ready to discover everything <span style={{ color: '#000000ff' }}>Near You?</span>                        </Typography>
                        <Typography variant="h5" mb={6} sx={{ opacity: 0.9, maxWidth: '700px', mx: 'auto', lineHeight: 1.6 }}>
                            Find local jobs, hire nearby workers, and discover small shops around you — all in one app.
                        </Typography>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => window.__triggerPWAInstall && window.__triggerPWAInstall()}
                            sx={{
                                backgroundColor: "white",
                                color: '#ffffffff',
                                px: 6,
                                py: 2,
                                borderRadius: '100px',
                                fontWeight: 900,
                                fontSize: '1.1rem',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                    transform: 'scale(1.05)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            Download App Now
                        </Button>

                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default DownloadCTA;
