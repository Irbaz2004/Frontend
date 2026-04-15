import React, { useEffect, useRef } from 'react';
import { Box, Container, Typography, Stack, IconButton, Link, Divider, Grid } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import GetAppIcon from '@mui/icons-material/GetApp';
import gsap from 'gsap';
import nearzologo from '../assets/nearzologo.png';

const Footer = () => {
  const radarRef = useRef(null);
  const cornerRadarRef = useRef(null);

  useEffect(() => {
    // Radar sweep animation
    if (radarRef.current) {
      gsap.to(radarRef.current, {
        rotation: 360,
        duration: 4,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center"
      });
    }

    if (cornerRadarRef.current) {
      gsap.to(cornerRadarRef.current, {
        rotation: -360,
        duration: 5,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center"
      });
    }
  }, []);

  const socialLinks = [
    { icon: FacebookIcon, label: 'Facebook' },
    { icon: InstagramIcon, label: 'Instagram' },
    { icon: LinkedInIcon, label: 'LinkedIn' },
    { icon: TwitterIcon, label: 'Twitter' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#ffffff',
        pt: { xs: 6, md: 10 },
        pb: 4,
        borderTop: '1px solid rgba(50, 95, 236, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
   

      {/* Concentric Circles with Radar in Top-Right Corner */}
      <Box sx={{
        position: 'absolute',
        top: '-80px',
        right: '-80px',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        zIndex: 0,
      }}>
  
        
      

     

      </Box>

 

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 8 }} sx={{ mb: 6 }}>
          {/* Logo & About */}
          <Grid item xs={12} md={6}>
            <Stack spacing={{ xs: 2, md: 3 }}>
            <img src={nearzologo} style={{height:'35px',width:'130px'}} alt="NearZO Logo" />
              <Typography sx={{
                color: '#5a6e8a',
                maxWidth: 400,
                fontSize: { xs: '0.85rem', sm: '1rem' },
                lineHeight: 1.6,
                fontFamily: '"Inter", sans-serif',
              }}>
                A hyper-local platform connecting job seekers, shops, and services.
                Building stronger communities through instant local discovery.
              </Typography>
              <Stack direction="row" spacing={1.5}>
                {socialLinks.map((social, i) => (
                  <IconButton
                    key={i}
                    aria-label={social.label}
                    sx={{
                      bgcolor: 'rgba(50, 95, 236, 0.05)',
                      color: '#666',
                      p: { xs: 1, sm: 1.5 },
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#325fec',
                        color: 'white',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 5px 15px rgba(50, 95, 236, 0.3)'
                      }
                    }}
                  >
                    <social.icon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={3}>
            <Typography variant="h6" fontWeight={800} sx={{
              mb: 2,
              fontFamily: '"Alumni Sans", sans-serif',
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              color: '#020402'
            }}>
              Quick Links
            </Typography>
            <Stack spacing={1.5}>
              {['About Us', 'How It Works', 'Contact Support', 'FAQ'].map((link) => (
                <Link key={link} href="#" underline="none" sx={{
                  color: '#5a6e8a',
                  fontSize: { xs: '0.75rem', sm: '0.9rem' },
                  fontFamily: '"Inter", sans-serif',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    color: '#325fec',
                    transform: 'translateX(5px)',
                    display: 'inline-block'
                  }
                }}>
                  {link}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={6} md={3}>
            <Typography variant="h6" fontWeight={800} sx={{
              mb: 2,
              fontFamily: '"Alumni Sans", sans-serif',
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              color: '#020402'
            }}>
              Legal
            </Typography>
            <Stack spacing={1.5}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR Compliance'].map((link) => (
                <Link key={link} href="#" underline="none" sx={{
                  color: '#5a6e8a',
                  fontSize: { xs: '0.75rem', sm: '0.9rem' },
                  fontFamily: '"Inter", sans-serif',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    color: '#325fec',
                    transform: 'translateX(5px)',
                    display: 'inline-block'
                  }
                }}>
                  {link}
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4, opacity: 0.5, borderColor: 'rgba(50, 95, 236, 0.1)' }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          textAlign="center"
        >
          <Typography sx={{ 
            color: '#5a6e8a', 
            fontSize: { xs: '0.7rem', sm: '0.85rem' },
            fontFamily: '"Inter", sans-serif',
          }}>
            © {new Date().getFullYear()} <b style={{ color: '#325fec' }}>NearZO</b>. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ 
            color: '#aaa', 
            fontStyle: 'italic', 
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            fontFamily: '"Inter", sans-serif',
            '& b': {
              color: '#325fec',
              fontWeight: 800
            }
          }}>
            A product by <b>Ruzix</b>
          </Typography>
        </Stack>

        {/* App Download Section */}
        <Box sx={{
          display: { xs: 'block', md: 'none' },
          mt: 4,
          textAlign: 'center'
        }}>
          <Typography variant="body2" sx={{
            color: '#5a6e8a',
            mb: 2,
            fontSize: { xs: '0.7rem', sm: '0.85rem' },
            fontFamily: '"Inter", sans-serif',
          }}>
            Experience NearZO on your mobile.
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              bgcolor: '#ffffff',
              color: '#325fec',
              borderRadius: '100px',
              cursor: 'pointer',
              transition: '0.3s',
              border: '1px solid rgba(50, 95, 236, 0.2)',
              '&:hover': {
                bgcolor: '#325fec',
                transform: 'translateY(-3px)',
                color: 'white',
                boxShadow: '0 10px 20px rgba(50, 95, 236, 0.25)'
              }
            }}
            onClick={() => window.__triggerPWAInstall && window.__triggerPWAInstall()}
          >
            <GetAppIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
            <Typography sx={{
              fontWeight: 700,
              fontSize: { xs: '0.75rem', sm: '0.9rem' },
              whiteSpace: 'nowrap',
              color: 'inherit',
              fontFamily: '"Inter", sans-serif',
            }}>
              Download Now
            </Typography>
          </Box>
        </Box>
      </Container>

      <style>
        {`
          @keyframes rotateFooter {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }
          
          @keyframes radarPulseFooter {
            0% {
              box-shadow: 0 0 0 0 rgba(50, 95, 236, 0.3);
            }
            70% {
              box-shadow: 0 0 0 40px rgba(50, 95, 236, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(50, 95, 236, 0);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default Footer;