import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const SplashScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const tl = gsap.timeline();

        // Logo Animation
        tl.fromTo('.splash-logo',
            { scale: 0.5, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.2, ease: 'back.out(1.7)' }
        );

        // Text Animation
        tl.fromTo('.splash-text',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
            '-=0.5'
        );

        // Pulse effect for logo
        tl.to('.splash-logo', {
            scale: 1.05,
            duration: 0.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

        // Redirect after 4 seconds
        const timer = setTimeout(() => {
            const token = localStorage.getItem('nearzo_token');
            const role = localStorage.getItem('nearzo_role');

            if (token && role) {
                const roleHome = {
                    user: '/app/user/home',
                    shop: '/app/shop/dashboard',
                    admin: '/app/admin/dashboard'
                };
                navigate(roleHome[role] || '/app/login', { replace: true });
            } else {
                navigate('/app/login', { replace: true });
            }
        }, 4000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                bgcolor: '#C00C0C',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999
            }}
        >
            {/* Logo Container */}
            <Box
                className="splash-logo"
                sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'white',
                    borderRadius: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 4,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}
            >
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 900,
                        color: '#C00C0C',
                        fontFamily: '"Outfit", sans-serif',
                        letterSpacing: '-2px'
                    }}
                >
                    N<span style={{ color: '#000' }}>Z</span>
                </Typography>
            </Box>

            {/* Brand Name */}
            <Typography
                className="splash-text"
                variant="h2"
                sx={{
                    color: 'white',
                    fontWeight: 900,
                    fontFamily: '"Outfit", sans-serif',
                    letterSpacing: '-1.5px'
                }}
            >
                Near<span style={{ color: '#000' }}>ZO</span>
            </Typography>

            {/* Subtext */}
            <Typography
                className="splash-text"
                sx={{
                    color: 'rgba(255,255,255,0.7)',
                    mt: 2,
                    fontWeight: 500,
                    letterSpacing: '2px',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase'
                }}
            >
                Hyperlocal Connection
            </Typography>

            {/* Loading Indicator */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 60,
                    width: '40px',
                    height: '4px',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        bgcolor: 'white',
                        animation: 'loading 2s infinite ease-in-out'
                    }}
                />
            </Box>

            <style>
                {`
                    @keyframes loading {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                `}
            </style>
        </Box>
    );
};

export default SplashScreen;
