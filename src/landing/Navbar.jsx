import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Slide, useScrollTrigger, Box } from '@mui/material';

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
                        border: trigger ? '1px solid rgba(255, 255, 255, 0.4)' : 'none',
                        borderBottom: !trigger ? '1px solid rgba(0,0,0,0.05)' : 'none',
                        background: trigger ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Typography
                            variant="h5"
                            component="div"
                            sx={{
                                fontWeight: 900,
                                fontFamily: '"Outfit", sans-serif',
                                color: '#1a1a1a',
                                letterSpacing: '-1.5px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0,
                                '& span': { color: '#C00C0C' }
                            }}
                        >
                            Near<span>ZO</span>
                        </Typography>


                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>

                        <Button
                            variant="contained"
                            color="primary"
                            sx={{
                                borderRadius: '100px',
                                px: 4,
                                fontWeight: 800,
                            }}
                            onClick={() => window.__triggerPWAInstall && window.__triggerPWAInstall()}
                        >
                            Download Now
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
        </HideOnScrollDown >
    );
};

export default Navbar;
