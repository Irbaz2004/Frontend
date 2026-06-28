import React, { useEffect, useState } from 'react';
import { Box, Snackbar, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Typography } from '@mui/material';
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
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import CloseIcon from '@mui/icons-material/Close';

gsap.registerPlugin(ScrollTrigger);

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
    window.__nearzoNavigate = () => navigate('/app/login');
    return () => {
      delete window.__triggerPWAInstall;
      delete window.__nearzoNavigate;
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

      {/* ── Install Dialog ── */}
      <Dialog
        open={installDialogOpen}
        onClose={handleCloseInstallDialog}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxWidth: 360,
            width: '90%',
            p: 0,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }
        }}
      >
        {/* Top accent bar */}
        <Box sx={{ height: 4, background: '#325fec', width: '100%' }} />

        <DialogTitle sx={{ px: 3, pt: 2.5, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src="/logo192.png"
                alt="NearZO"
                sx={{ width: 44, height: 44, borderRadius: '10px', border: '1px solid #eee' }}
              />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111', fontFamily: '"Inter", sans-serif', lineHeight: 1.2 }}>
                  Install NearZO
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#888', fontFamily: '"Inter", sans-serif' }}>
                  nearzo.in
                </Typography>
              </Box>
            </Box>
            <CloseIcon
              onClick={handleCloseInstallDialog}
              sx={{ fontSize: 20, color: '#aaa', cursor: 'pointer', mt: 0.5, '&:hover': { color: '#333' } }}
            />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
          <Typography sx={{ fontSize: '0.875rem', color: '#444', fontFamily: '"Inter", sans-serif', lineHeight: 1.6 }}>
            Add NearZO to your home screen for quick access — discover nearby shops, jobs, rentals & services instantly.
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {[
              'Works offline, loads faster',
              'Push notifications for updates',
              'Full-screen native experience',
            ].map((point) => (
              <Box key={point} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#eef1fd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#325fec' }} />
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: '#555', fontFamily: '"Inter", sans-serif' }}>
                  {point}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2, flexDirection: 'column', gap: 1, alignItems: 'stretch' }}>
          <Button
            onClick={handleInstall}
            variant="contained"
            fullWidth
            disabled={isInstalling}
            disableElevation
            sx={{
              background: '#325fec',
              color: '#fff',
              borderRadius: '10px',
              py: 1.25,
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'none',
              '&:hover': { background: '#2a52d4' },
              '&:disabled': { background: '#a0b4f7', color: '#fff' },
            }}
          >
            {isInstalling ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={18} sx={{ color: '#fff' }} />
                <span>Installing…</span>
              </Box>
            ) : (
              'Add to Home Screen'
            )}
          </Button>
          <Button
            onClick={handleCloseInstallDialog}
            fullWidth
            disableElevation
            sx={{
              color: '#999',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 500,
              fontSize: '0.82rem',
              textTransform: 'none',
              py: 0.5,
              '&:hover': { color: '#333', background: 'transparent' },
            }}
          >
            Not now
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Install Banner (fallback) ── */}
      <Snackbar
        open={showInstallBanner && !isAppInstalled}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            background: '#fff',
            color: '#111',
            borderRadius: '12px',
            fontFamily: '"Inter", sans-serif',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            border: '1px solid #e8e8e8',
            px: 2,
            py: 1,
            minWidth: 0,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/logo192.png"
              alt="NearZO"
              sx={{ width: 32, height: 32, borderRadius: '8px', border: '1px solid #eee' }}
            />
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#111', fontFamily: '"Inter", sans-serif' }}>
              Install NearZO
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={handleInstall}
              disabled={isInstalling}
              disableElevation
              sx={{
                background: '#325fec',
                color: '#fff',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.8rem',
                px: 2,
                '&:hover': { background: '#2a52d4' },
              }}
            >
              {isInstalling ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Install'}
            </Button>
            <Button
              size="small"
              onClick={handleCloseBanner}
              sx={{
                color: '#999',
                textTransform: 'none',
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.8rem',
                '&:hover': { color: '#333', background: 'transparent' },
              }}
            >
              Dismiss
            </Button>
          </Box>
        </Box>
      </Snackbar>

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
              fontWeight: 500,
              fontSize: '0.85rem',
            }
          }}
          message="✅ NearZO is installed!"
        />
      )}
    </Box>
  );
}

export default LandingPage;