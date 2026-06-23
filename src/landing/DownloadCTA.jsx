import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, Button, Stack, Snackbar, Alert } from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import GetAppIcon from '@mui/icons-material/GetApp';
import gsap from 'gsap';

const DownloadCTA = () => {
    const sectionRef = useRef(null);
    const radarRef = useRef(null);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    useEffect(() => {
        // Detect iOS
        const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
        setIsIOS(ios);

        // Check if already installed
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
        setIsInstalled(isStandalone);

        // Capture beforeinstallprompt (Android/Desktop Chrome)
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            setSnackbar({ open: true, message: '🎉 NearZO installed successfully!', severity: 'success' });
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

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

    const handleInstall = async () => {
        if (isInstalled) {
            setSnackbar({ open: true, message: 'NearZO is already installed on your device!', severity: 'info' });
            return;
        }

        if (isIOS) {
            // Show iOS manual guide
            setShowIOSGuide(true);
            return;
        }

        if (deferredPrompt) {
            // Android / Chrome Desktop
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setSnackbar({ open: true, message: '🎉 NearZO is being installed!', severity: 'success' });
            } else {
                setSnackbar({ open: true, message: 'Installation cancelled.', severity: 'warning' });
            }
            setDeferredPrompt(null);
        } else {
            // Fallback: browser doesn't support prompt (Firefox, Samsung old, etc.)
            setSnackbar({
                open: true,
                message: 'Open this page in Chrome and use "Add to Home Screen" from the menu.',
                severity: 'info'
            });
        }
    };

    const getButtonLabel = () => {
        if (isInstalled) return 'Already Installed ✓';
        if (isIOS) return 'Add to Home Screen';
        if (deferredPrompt) return 'Install App';
        return 'Get the App';
    };

    const getButtonIcon = () => {
        if (isIOS) return <AppleIcon />;
        return <GetAppIcon />;
    };

    return (
        <>
            <Box ref={sectionRef} sx={{ pb: 10, bgcolor: '#ffffff', mt: -7 }}>
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
                            height: '350px',
                        }}
                    >
                        {/* ── All your existing circles & radar markup unchanged ── */}
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)', animation: 'rotate 20s linear infinite' }} />
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '380px', height: '380px', borderRadius: '50%', backgroundColor: 'rgba(50,95,236,0.15)', border: '2px solid rgba(50,95,236,0.3)', animation: 'rotate 15s linear infinite reverse' }} />
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '280px', height: '280px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)', animation: 'rotate 12s linear infinite' }} />
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(50,95,236,0.2)', border: '2px solid rgba(50,95,236,0.4)', animation: 'rotate 10s linear infinite reverse' }} />
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '140px', height: '140px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)', animation: 'rotate 8s linear infinite' }} />
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(50,95,236,0.25)', border: '2px solid rgba(50,95,236,0.5)', animation: 'rotate 6s linear infinite reverse' }} />
                        <Box ref={radarRef} sx={{ position: 'absolute', top: '50%', left: '50%', width: '500px', height: '500px', borderRadius: '50%', background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.3) 15deg, transparent 30deg)', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 1 }} />

                        {/* Content */}
                        <Box sx={{ position: 'relative', zIndex: 2 }}>
                            <Typography variant="h2" mb={3} sx={{
                                fontWeight: 900,
                                fontFamily: '"Inter", sans-serif',
                                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                                color: '#ffffff'
                            }}>
                                Ready to discover everything{' '}
                                <span style={{ textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.3)' }}>
                                    Near You?
                                </span>
                            </Typography>
                            <Typography variant="h5" mb={4} sx={{
                                opacity: 0.9,
                                maxWidth: '700px',
                                mx: 'auto',
                                lineHeight: 1.6,
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                                fontFamily: '"Inter", sans-serif',
                            }}>
                                Find local jobs, hire nearby workers, and discover small shops around you — all in one app.
                            </Typography>

                            {/* Install Button */}
                        
                        </Box>
                    </Box>
                </Container>


                <style>{`
                    @keyframes rotate {
                        from { transform: translate(-50%, -50%) rotate(0deg); }
                        to   { transform: translate(-50%, -50%) rotate(360deg); }
                    }
                    @keyframes radarPulse {
                        0%   { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
                        70%  { box-shadow: 0 0 0 60px rgba(255,255,255,0); }
                        100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
                    }
                `}</style>
            </Box>

            {/* Snackbar feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                    sx={{ borderRadius: '12px', fontFamily: '"Inter", sans-serif' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default DownloadCTA;