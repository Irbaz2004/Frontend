import React, { useEffect, useState } from 'react';
import { Box, Snackbar, Button } from '@mui/material';
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

gsap.registerPlugin(ScrollTrigger);

function LandingPage() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

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

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  // Expose navigate to DownloadCTA via window (simple approach for landing isolation)
  useEffect(() => {
    window.__nearzoNavigate = () => navigate('/app/user/home');
    return () => { delete window.__nearzoNavigate; };
  }, [navigate]);

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <Navbar />
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <WhyForEasy />
      <DownloadCTA />
      <Footer />

      {/* PWA Install Banner */}
      <Snackbar
        open={showInstallBanner}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="Install NearZO for the full app experience!"
        action={
          <>
            <Button color="primary" size="small" variant="contained" onClick={handleInstall} sx={{ mr: 1 }}>
              Install
            </Button>
            <Button color="inherit" size="small" onClick={() => setShowInstallBanner(false)}>
              Later
            </Button>
          </>
        }
        sx={{
          '& .MuiSnackbarContent-root': {
            background: '#1a1a1a',
            color: '#fff',
            borderRadius: 3,
            fontFamily: '"Outfit", sans-serif',
          }
        }}
      />
    </Box>
  );
}

export default LandingPage;
