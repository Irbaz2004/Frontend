import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Slide, useScrollTrigger, Box } from '@mui/material';
import nearzologo from '../assets/nearzologo.png';

function HideOnScrollDown({ children }) {
    const [show, setShow] = useState(true);
    let lastScrollY = 0;

    const handleScroll = () => {
        const scrollY = window.scrollY;
        if (scrollY > 100) {  // Threshold to start hiding
            if (scrollY > lastScrollY) {
                setShow(false);  // Hide on scroll down
            } else {
                setShow(true);   // Show on scroll up
            }
        } else {
            setShow(true);     // Always show near top
        }
        lastScrollY = scrollY;
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Slide appear={false} direction="down" in={show}>
            {children}
        </Slide>
    );
}

const Navbar = () => {
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 50,
    });

    return (
        <HideOnScrollDown>
            <AppBar
                position="fixed"
                color="transparent"
                elevation={0}
                sx={{
                    top: trigger ? '12px' : '0px',
                    left: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    background: 'transparent',
                    zIndex: 1100,
                }}
            >
                <Toolbar
                    className="liquid-glass"
                    sx={{
                        width: trigger ? '90%' : '100%',
                        maxWidth: trigger ? '1200px' : '100%',
                        borderRadius: trigger ? '100px' : '0px',
                        justifyContent: 'space-between',
                        py: 1,
                        px: { xs: 2, md: 4 },
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        margin: '0 auto',
                        boxShadow: trigger ? '0 10px 40px rgba(0,0,0,0.1)' : 'none',
                        border: trigger ? '1px solid rgba(50, 95, 236, 0.15)' : 'none',
                        borderBottom: !trigger ? '1px solid rgba(0,0,0,0.05)' : 'none',
                        background: trigger ? 'rgba(255, 255, 255, 0.85)' : '#ffffff',
                        backdropFilter: trigger ? 'blur(12px)' : 'none',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* Logo Image */}
                        <Box
                            component="img"
                            src={nearzologo} // Replace with your actual logo path
                            alt="Logo"
                            sx={{
                                height: 35,
                                width: 'auto',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                },
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            sx={{
                                borderRadius: '100px',
                                px: 4,
                                fontWeight: 700,
                                fontFamily: '"Inter", sans-serif',
                                backgroundColor: '#325fec',
                                color: 'white',
                                // boxShadow: '0 8px 20px rgba(50, 95, 236, 0.25)',
                                '&:hover': {
                                    backgroundColor: '#325fec',
                                    transform: 'translateY(-2px)',
                                    // boxShadow: '0 12px 28px rgba(50, 95, 236, 0.35)',
                                },
                            }}
                            onClick={() => window.__triggerPWAInstall && window.__triggerPWAInstall()}
                        >
                            Download Now
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
        </HideOnScrollDown>
    );
};

export default Navbar;