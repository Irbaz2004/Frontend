import React, { useEffect, useState } from 'react';
import { Box, Snackbar, Button, Dialog, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './Navbar';
import Hero from './Hero';
import ProblemSolution from './ProblemSolution';
import HowItWorks from './HowItWorks';
import CoreFeatures from './CoreFeatures';
import UseCases from './UseCases';
import WhyForEasy from './WhyForEasy';
import DownloadCTA from './DownloadCTA';
import Footer from './Footer';
import { trackPageVisit, trackAppInstall } from '../services/Analytics';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import logo from '../assets/helozologo.png';

gsap.registerPlugin(ScrollTrigger);

// Sparkle SVG component
const Sparkle = ({ style }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={style}>
    <path
      d="M8 0L9.2 6.8L16 8L9.2 9.2L8 16L6.8 9.2L0 8L6.8 6.8L8 0Z"
      fill="#325fec"
      opacity="0.35"
    />
  </svg>
);

function LandingPage() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    setTimeout(() => { ScrollTrigger.refresh(); }, 500);
    return () => { ScrollTrigger.getAll().forEach(st => st.kill()); };
  }, []);

  useEffect(() => { trackPageVisit('landing'); }, []);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e) => setIsAppInstalled(e.matches);
    mediaQuery.addEventListener('change', handleDisplayModeChange);
    return () => mediaQuery.removeEventListener('change', handleDisplayModeChange);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => { setInstallDialogOpen(true); }, 1000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const timeout = setTimeout(() => {
      if (!deferredPrompt && !isAppInstalled) {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) setInstallDialogOpen(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timeout);
    };
  }, [deferredPrompt, isAppInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert('To install the app, tap the browser menu and select "Add to Home Screen".');
      setInstallDialogOpen(false);
      return;
    }
    setIsInstalling(true);
    setInstallDialogOpen(false);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      trackAppInstall(outcome, 'landing_dialog');
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
        setIsAppInstalled(true);
        setTimeout(() => { setShowInstallBanner(true); }, 500);
      } else {
        setShowInstallBanner(true);
      }
    } catch (error) {
      console.error('Installation error:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleCloseInstallDialog = () => {
    setInstallDialogOpen(false);
    setTimeout(() => {
      if (!isAppInstalled) setShowInstallBanner(true);
    }, 500);
  };

  const handleCloseBanner = () => setShowInstallBanner(false);

  useEffect(() => {
    window.__triggerPWAInstall = async () => {
      if (isAppInstalled) { alert('App is already installed!'); return; }
      if (deferredPrompt) {
        setIsInstalling(true);
        try {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          trackAppInstall(outcome, 'navbar_button');
          if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowInstallBanner(false);
            setIsAppInstalled(true);
          }
        } catch (error) {
          console.error('Installation error:', error);
        } finally {
          setIsInstalling(false);
        }
      } else {
        setInstallDialogOpen(true);
      }
    };
    window.__helozoNavigate = () => navigate('/app/login');
    return () => {
      delete window.__triggerPWAInstall;
      delete window.__helozoNavigate;
    };
  }, [deferredPrompt, navigate, isAppInstalled]);

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <Navbar />
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <WhyForEasy />
      <DownloadCTA />
      <Footer />

      <Dialog
        open={installDialogOpen}
        onClose={handleCloseInstallDialog}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            maxWidth: 380,
            width: '92%',
            p: 0,
            overflow: 'hidden',
            background: '#ffffff',
          }
        }}
        BackdropProps={{
          sx: { background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }
        }}
      >
        <Box
          onClick={handleCloseInstallDialog}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#f1f3f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            '&:hover': { background: '#e2e6f5' },
            transition: 'background 0.2s',
          }}
        >
          <Typography sx={{ fontSize: '14px', color: '#666', lineHeight: 1, fontWeight: 500 }}>✕</Typography>
        </Box>

        <Box sx={{ px: 3.5, pt: 4, pb: 3.5, textAlign: 'center' }}>

          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2.5 }}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(50,95,236,0.1) 0%, rgba(50,95,236,0.03) 60%, transparent 100%)',
            }} />
            <Box
              component="img"
              src={logo}
              alt="HeloZO"
              sx={{
                width: 120,
                height: 50,
                display: 'block',
                position: 'relative',
                zIndex: 1,
              }}
            />
          </Box>

          <Typography sx={{
            fontWeight: 800,
            fontSize: '1.6rem',
            color: '#0a0a0a',
            fontFamily: '"Inter", sans-serif',
            lineHeight: 1.2,
            mb: 1,
          }}>
            Install HeloZO App
          </Typography>

          <Typography sx={{
            fontSize: '0.95rem',
            color: '#8a8fa8',
            fontFamily: '"Inter", sans-serif',
            lineHeight: 1.5,
            mb: 3.5,
          }}>
            Get the best local experience.<br />
            Faster, easier and better.
          </Typography>

          <Button
            onClick={handleInstall}
            variant="contained"
            fullWidth
            disabled={isInstalling}
            disableElevation
            startIcon={!isInstalling && <DownloadIcon sx={{ fontSize: '1.1rem' }} />}
            sx={{
              background: '#325fec',
              color: '#fff',
              borderRadius: '14px',
              py: 1.6,
              fontFamily: '"Inter", sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none',
              letterSpacing: '-0.01em',
              mb: 1.5,
              '&:hover': {
                background: '#2a52d4',
                transform: 'translateY(-1px)',
                boxShadow: '0 8px 24px rgba(50,95,236,0.35)',
              },
              '&:active': { transform: 'translateY(0)' },
              '&:disabled': { background: '#a0b4f7', color: '#fff' },
              transition: 'all 0.2s ease',
            }}
          >
            {isInstalling ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={18} sx={{ color: '#fff' }} />
                <span>Installing…</span>
              </Box>
            ) : (
              'Install App'
            )}
          </Button>

          <Button
            onClick={handleCloseInstallDialog}
            fullWidth
            disableElevation
            startIcon={<InfoOutlinedIcon sx={{ fontSize: '1rem', color: '#aaa' }} />}
            sx={{
              color: '#555',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 500,
              fontSize: '0.95rem',
              textTransform: 'none',
              borderRadius: '14px',
              py: 1.4,
              border: '1.5px solid #e8eaf2',
              mb: 2.5,
              '&:hover': { background: '#f7f8fc', border: '1.5px solid #d0d4e8' },
              transition: 'all 0.2s ease',
            }}
          >
            Not Now
          </Button>


        </Box>
      </Dialog>

 
      {/* ── Already Installed ── */}
      {isAppInstalled && (
        <Snackbar
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              background: '#fff',
              color: '#325fec',
              borderRadius: '12px',
              fontFamily: '"Inter", sans-serif',
              border: '1px solid #e0e7ff',
              boxShadow: '0 4px 20px rgba(50,95,236,0.1)',
              fontWeight: 600,
              fontSize: '0.85rem',
            }
          }}
          message="✅ HeloZO is installed!"
        />
      )}
    </Box>
  );
}

export default LandingPage;
