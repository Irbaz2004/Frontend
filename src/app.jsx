import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import HowItWorks from './components/HowItWorks';
import CoreFeatures from './components/CoreFeatures';
import UseCases from './components/UseCases';
import WhyForEasy from './components/WhyForEasy';
import DownloadCTA from './components/DownloadCTA';
import Footer from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

function App() {
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

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <Navbar />
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      {/* <CoreFeatures />
      <UseCases /> */}
      {/* <WhyForEasy /> */}
      <DownloadCTA />
      <Footer />
    </Box>
  );
}

export default App;