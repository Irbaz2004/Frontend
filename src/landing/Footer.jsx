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
        borderTop: '1px solid rgba(0,0,0,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
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
                  color: '#C00C0C',
                  fontSize: { xs: '1.5rem', sm: '2rem' }
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
                      bgcolor: 'rgba(0,0,0,0.03)',
                      color: '#666',
                      p: { xs: 1, sm: 1.5 },
                      '&:hover': {
                        bgcolor: '#C00C0C',
                        color: 'white',
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <social.icon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={6} md={3}>
            <Typography variant="h6" fontWeight={800} sx={{
              mb: 2,
              fontFamily: '"Outfit", sans-serif',
              fontSize: { xs: '0.9rem', sm: '1.1rem' }
            }}>
              Legal
            </Typography>
            <Stack spacing={1.5}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                <Link key={link} href="#" underline="none" sx={{
                  color: '#666',
                  fontSize: { xs: '0.75rem', sm: '0.9rem' },
                  '&:hover': { color: '#C00C0C' }
                }}>
                  {link}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Download Section */}
          <Grid item xs={6} md={3}>
            <Typography variant="h6" fontWeight={800} sx={{
              mb: 2,
              fontFamily: '"Outfit", sans-serif',
              fontSize: { xs: '0.9rem', sm: '1.1rem' }
            }}>
              Download
            </Typography>
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

                color: '#C00C0C',
                borderRadius: '100px',
                cursor: 'pointer',
                transition: '0.3s',
                border: '1px solid rgba(192, 12, 12, 0.26)',
                '&:hover': {
                  bgcolor: '#C00C0C',
                  transform: 'translateY(-3px)',
                  color: 'white',
                  boxShadow: '0 10px 20px rgba(192, 12, 12, 0.2)'
                }
              }}
            >
              <GetAppIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
              <Typography sx={{
                fontWeight: 700,
                fontSize: { xs: '0.75rem', sm: '0.9rem' },
                whiteSpace: 'nowrap',
                color: 'inherit',
                '&:hover': {
                  color: 'white'
                }
              }}>

                Download Now
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4, opacity: 0.5 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          textAlign="center"
        >
          <Typography sx={{ color: '#888', fontSize: { xs: '0.7rem', sm: '0.85rem' } }}>
            © {new Date().getFullYear()} <b>NearZO</b>. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: '#aaa', fontStyle: 'italic', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
            A product by <b>Ruzix</b>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;