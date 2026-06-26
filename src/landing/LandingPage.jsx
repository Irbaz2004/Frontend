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
    // Refresh ScrollTrigger after all components are mounted
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    // Clean up all scroll triggers on unmount
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  // ── Track every landing-page visit ──────────────────────────────────────
  useEffect(() => {
    trackPageVisit('landing');
  }, []);

  // Check if app is already installed
  useEffect(() => {
    // Check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e) => {
      setIsAppInstalled(e.matches);
    };
    mediaQuery.addEventListener('change', handleDisplayModeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Always show the install dialog when the page loads
      setTimeout(() => {
        setInstallDialogOpen(true);
      }, 1000); // Show after 1 second for better UX
    };
    window.addEventListener('beforeinstallprompt', handler);

    // If the event doesn't fire (e.g., already installed or not supported),
    // show a fallback install option
    const timeout = setTimeout(() => {
      if (!deferredPrompt && !isAppInstalled) {
        // Check if it's a mobile device
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          setInstallDialogOpen(true);
        }
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timeout);
    };
  }, [deferredPrompt, isAppInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt
      alert('To install the app, please select "Add to Home Screen" from your browser menu.');
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
        // Show success message
        setTimeout(() => {
          setShowInstallBanner(true);
        }, 500);
      } else {
        // User declined, show the banner as fallback
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
    // Show the banner as fallback
    setTimeout(() => {
      if (!isAppInstalled) {
        setShowInstallBanner(true);
      }
    }, 500);
  };

  const handleCloseBanner = () => {
    setShowInstallBanner(false);
  };

  // Expose triggers to child components
  useEffect(() => {
    window.__triggerPWAInstall = async () => {
      if (isAppInstalled) {
        alert('App is already installed!');
        return;
      }
      
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

      {/* Install Dialog */}
      <Dialog
        open={installDialogOpen}
        onClose={handleCloseInstallDialog}
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxWidth: 400,
            width: '90%',
            padding: 2,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: '#fff',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '16px 24px',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InstallMobileIcon sx={{ fontSize: 32, color: '#4FC3F7' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}>
              Install NearZO
            </Typography>
          </Box>
          <CloseIcon 
            onClick={handleCloseInstallDialog}
            sx={{ 
              cursor: 'pointer', 
              '&:hover': { color: '#4FC3F7' } 
            }}
          />
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box 
              component="img" 
              src="/logo192.png" 
              alt="NearZO Logo"
              sx={{ 
                width: 80, 
                height: 80, 
                mb: 2,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(79, 195, 247, 0.3)'
              }}
            />
            <Typography variant="body1" sx={{ mb: 2, fontFamily: '"Outfit", sans-serif' }}>
              Get the full NearZO experience with:
            </Typography>
            <Box sx={{ textAlign: 'left', pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ color: '#4FC3F7' }}>✓</span> Offline access to your documents
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ color: '#4FC3F7' }}>✓</span> Push notifications
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ color: '#4FC3F7' }}>✓</span> Faster loading times
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ color: '#4FC3F7' }}>✓</span> Native app-like experience
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ padding: '16px 24px', flexDirection: 'column', gap: 1 }}>
          <Button 
            onClick={handleInstall}
            variant="contained"
            fullWidth
            disabled={isInstalling}
            sx={{
              background: 'linear-gradient(135deg, #4FC3F7 0%, #2196F3 100%)',
              color: '#fff',
              borderRadius: 3,
              py: 1.5,
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #45B5E8 0%, #1976D2 100%)',
                transform: 'scale(1.02)',
                transition: 'all 0.2s'
              }
            }}
          >
            {isInstalling ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} sx={{ color: '#fff' }} />
                <span>Installing NearZO...</span>
              </Box>
            ) : (
              'Install NearZO'
            )}
          </Button>
          <Button 
            onClick={handleCloseInstallDialog}
            variant="text"
            fullWidth
            sx={{
              color: '#888',
              fontFamily: '"Outfit", sans-serif',
              textTransform: 'none',
              '&:hover': { color: '#fff' }
            }}
          >
            Maybe Later
          </Button>
        </DialogActions>
      </Dialog>

      {/* Install Banner - Shows when dialog is closed or user declines */}
      <Snackbar
        open={showInstallBanner && !isAppInstalled}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: '#fff',
            borderRadius: 3,
            fontFamily: '"Outfit", sans-serif',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            border: '1px solid rgba(79, 195, 247, 0.2)',
            padding: '12px 20px',
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%',
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InstallMobileIcon sx={{ color: '#4FC3F7' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Get the full NearZO experience!
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="primary" 
              size="small" 
              variant="contained" 
              onClick={handleInstall}
              disabled={isInstalling}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: '"Outfit", sans-serif',
                background: 'linear-gradient(135deg, #4FC3F7, #2196F3)'
              }}
            >
              {isInstalling ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: '#fff' }} />
                  <span>Installing...</span>
                </Box>
              ) : (
                'Install Now'
              )}
            </Button>
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleCloseBanner}
              sx={{
                color: '#888',
                textTransform: 'none',
                fontFamily: '"Outfit", sans-serif',
                '&:hover': { color: '#fff' }
              }}
            >
              Dismiss
            </Button>
          </Box>
        </Box>
      </Snackbar>

      {/* Already Installed Message */}
      {isAppInstalled && (
        <Snackbar
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              color: '#4FC3F7',
              borderRadius: 3,
              fontFamily: '"Outfit", sans-serif',
              border: '1px solid rgba(79, 195, 247, 0.3)',
            }
          }}
          message="✅ NearZO is installed! Enjoy the full experience."
        />
      )}
    </Box>
  );
}

export default LandingPage;