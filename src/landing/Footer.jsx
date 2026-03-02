import React from 'react';
import { Box, Container, Typography, Stack, IconButton, Link, Divider, Grid } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import GetAppIcon from '@mui/icons-material/GetApp';

const Footer = () => {
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
        borderTop: '1px solid rgba(0, 11, 49, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Decorative Elements */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        right: '-5%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 11, 49, 0.02) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 11, 49, 0.02) 0%, transparent 70%)',
        filter: 'blur(50px)',
        zIndex: 0
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 8 }} sx={{ mb: 6 }}>
          {/* Logo & About */}
          <Grid item xs={12} md={6}>
            <Stack spacing={{ xs: 2, md: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontFamily: '"Outfit", sans-serif',
                  color: '#0003b1',
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  position: 'relative',
                  display: 'inline-block',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: '60px',
                    height: '3px',
                    background: '#0003b1',
                    borderRadius: '2px'
                  }
                }}
              >
                NearZO
              </Typography>
              <Typography sx={{
                color: '#555',
                maxWidth: 400,
                fontSize: { xs: '0.85rem', sm: '1rem' },
                lineHeight: 1.6
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
                      bgcolor: 'rgba(0, 11, 49, 0.03)',
                      color: '#666',
                      p: { xs: 1, sm: 1.5 },
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#0003b1',
                        color: 'white',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 5px 15px rgba(0, 3, 177, 0.3)'
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
              fontFamily: '"Outfit", sans-serif',
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              color: '#1a1a1a'
            }}>
              Quick Links
            </Typography>
            <Stack spacing={1.5}>
              {['About Us', 'How It Works', 'Contact Support', 'FAQ'].map((link) => (
                <Link key={link} href="#" underline="none" sx={{
                  color: '#666',
                  fontSize: { xs: '0.75rem', sm: '0.9rem' },
                  transition: 'color 0.2s ease',
                  '&:hover': { 
                    color: '#0003b1',
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
              fontFamily: '"Outfit", sans-serif',
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              color: '#1a1a1a'
            }}>
              Legal
            </Typography>
            <Stack spacing={1.5}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR Compliance'].map((link) => (
                <Link key={link} href="#" underline="none" sx={{
                  color: '#666',
                  fontSize: { xs: '0.75rem', sm: '0.9rem' },
                  transition: 'color 0.2s ease',
                  '&:hover': { 
                    color: '#0003b1',
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

        <Divider sx={{ mb: 4, opacity: 0.5, borderColor: 'rgba(0, 11, 49, 0.1)' }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          textAlign="center"
        >
          <Typography sx={{ color: '#888', fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>
            © {new Date().getFullYear()} <b style={{ color: '#0003b1' }}>NearZO</b>. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ 
            color: '#aaa', 
            fontStyle: 'italic', 
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            '& b': {
              color: '#0003b1',
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
            color: '#777',
            mb: 2,
            fontSize: { xs: '0.7rem', sm: '0.85rem' }
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
              bgcolor: '#ffffffff',
              color: '#0003b1',
              borderRadius: '100px',
              cursor: 'pointer',
              transition: '0.3s',
              border: '1px solid rgba(0, 11, 49, 0.2)',
              '&:hover': {
                bgcolor: '#0003b1',
                transform: 'translateY(-3px)',
                color: 'white',
                boxShadow: '0 10px 20px rgba(0, 3, 177, 0.25)'
              }
            }}
            onClick={() => window.__triggerPWAInstall && window.__triggerPWAInstall()}
          >
            <GetAppIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
            <Typography sx={{
              fontWeight: 700,
              fontSize: { xs: '0.75rem', sm: '0.9rem' },
              whiteSpace: 'nowrap',
              color: 'inherit'
            }}>
              Download Now
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;