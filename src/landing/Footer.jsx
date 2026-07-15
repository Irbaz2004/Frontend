// Footer.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
    Box, Container, Typography, Stack, IconButton,
    Link, Divider, Grid, Snackbar, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Accordion, AccordionSummary, AccordionDetails, IconButton as MuiIconButton
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GetAppIcon from '@mui/icons-material/GetApp';
import AppleIcon from '@mui/icons-material/Apple';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import gsap from 'gsap';
import helozologo from '../assets/helozologo.png';
import usePWAInstall from '../hooks/usePWAInstall';

// ───────────────────────── About Us Dialog ─────────────────────────
const AboutDialog = ({ open, onClose }) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: { xs: 1, sm: 2 } } }}
    >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={900} sx={{ fontFamily: '"Inter", sans-serif', color: '#020402' }}>
                About <span style={{ color: '#325fec' }}>HeloZO</span>
            </Typography>
            <MuiIconButton onClick={onClose} size="small">
                <CloseIcon />
            </MuiIconButton>
        </DialogTitle>
        <DialogContent>
            <Typography sx={{
                color: '#5a6e8a', mb: 3, fontSize: '0.95rem', lineHeight: 1.8,
                fontFamily: '"Inter", sans-serif',
            }}>
                HeloZO is a hyperlocal discovery platform designed to help people find everything
                around them in one place. Whether you're looking for nearby shops, local job
                opportunities, or rental homes, HeloZO connects users with what's available around
                them in real time.
            </Typography>
            <Typography sx={{
                color: '#5a6e8a', mb: 3, fontSize: '0.95rem', lineHeight: 1.8,
                fontFamily: '"Inter", sans-serif',
            }}>
                Our mission is to simplify local discovery and empower communities by making everyday
                needs easier to access. With a user-friendly experience and location-based search,
                HeloZO helps individuals, businesses, and property owners connect more efficiently
                and grow together.
            </Typography>

            <Box sx={{ mb: 1 }}>
                <Typography sx={{
                    color: '#325fec', fontWeight: 800, mb: 2, fontSize: '0.8rem',
                    letterSpacing: '2px', fontFamily: '"Inter", sans-serif',
                }}>
                    WHAT WE OFFER
                </Typography>
                <Grid container spacing={2}>
                    {[
                        { icon: <WorkIcon />, label: 'Local Jobs' },
                        { icon: <LocalMallIcon />, label: 'Nearby Shops' },
                        { icon: <ApartmentIcon />, label: 'Rent House' },
                    ].map((item, i) => (
                        <Grid item xs={4} key={i}>
                            <Stack alignItems="center" spacing={1} sx={{
                                p: 1.5, borderRadius: '14px', bgcolor: 'rgba(50,95,236,0.05)', textAlign: 'center',
                            }}>
                                <Box sx={{ color: '#325fec', display: 'flex' }}>{item.icon}</Box>
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: '"Inter", sans-serif', color: '#1a1a1a' }}>
                                    {item.label}
                                </Typography>
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Typography sx={{
                mt: 3, fontStyle: 'italic', color: '#aaa', fontSize: '0.8rem',
                fontFamily: '"Inter", sans-serif', textAlign: 'center',
            }}>
                "Everything Around You, In One Place." — A product by{' '}
                <Link
                    href="https://ruzix.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: '#325fec', fontWeight: 800, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                    Ruzix
                </Link>
            </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
                onClick={onClose}
                fullWidth
                variant="contained"
                sx={{
                    borderRadius: '100px', py: 1.2, bgcolor: '#325fec',
                    fontWeight: 700, textTransform: 'none', fontFamily: '"Inter", sans-serif',
                    '&:hover': { bgcolor: '#1a4ad4' },
                }}
            >
                Got it!
            </Button>
        </DialogActions>
    </Dialog>
);

// ───────────────────────── Contact Support Dialog ─────────────────────────
const ContactDialog = ({ open, onClose }) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: { xs: 1, sm: 2 } } }}
    >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={900} sx={{ fontFamily: '"Inter", sans-serif', color: '#020402' }}>
                Contact <span style={{ color: '#325fec' }}>Support</span>
            </Typography>
            <MuiIconButton onClick={onClose} size="small">
                <CloseIcon />
            </MuiIconButton>
        </DialogTitle>
        <DialogContent>
            <Typography sx={{
                color: '#5a6e8a', mb: 3, fontSize: '0.95rem', lineHeight: 1.7,
                fontFamily: '"Inter", sans-serif',
            }}>
                Have a question, issue, or feedback? Reach out to the HeloZO team — we're happy to help.
            </Typography>

            <Stack spacing={2}>
                {/* <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(50,95,236,0.05)' }}>
                    <EmailIcon sx={{ color: '#325fec' }} />
                    <Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#999', fontFamily: '"Inter", sans-serif' }}>Email</Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: '"Inter", sans-serif', color: '#1a1a1a' }}>
                            support@helozo.in
                        </Typography>
                    </Box>
                </Stack> */}
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(50,95,236,0.05)' }}>
                    <PhoneIcon sx={{ color: '#325fec' }} />
                    <Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#999', fontFamily: '"Inter", sans-serif' }}>Phone</Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: '"Inter", sans-serif', color: '#1a1a1a' }}>
                            +91 93634 66343
                        </Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: '"Inter", sans-serif', color: '#1a1a1a' }}>
                            +91 82170 80680
                        </Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(50,95,236,0.05)' }}>
                    <LocationOnIcon sx={{ color: '#325fec' }} />
                    <Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#999', fontFamily: '"Inter", sans-serif' }}>Address</Typography>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: '"Inter", sans-serif', color: '#1a1a1a' }}>
                            Ambur, Tamil Nadu, India
                        </Typography>
                    </Box>
                </Stack>
            </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
                onClick={onClose}
                fullWidth
                variant="contained"
                sx={{
                    borderRadius: '100px', py: 1.2, bgcolor: '#325fec',
                    fontWeight: 700, textTransform: 'none', fontFamily: '"Inter", sans-serif',
                    '&:hover': { bgcolor: '#1a4ad4' },
                }}
            >
                Close
            </Button>
        </DialogActions>
    </Dialog>
);

// ───────────────────────── Privacy Policy Dialog ─────────────────────────
const PrivacyDialog = ({ open, onClose }) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: { xs: 1, sm: 2 } } }}
    >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={900} sx={{ fontFamily: '"Inter", sans-serif', color: '#020402' }}>
                Privacy <span style={{ color: '#325fec' }}>Policy</span>
            </Typography>
            <MuiIconButton onClick={onClose} size="small">
                <CloseIcon />
            </MuiIconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '60vh' }}>
           
            <Typography sx={{ color: '#5a6e8a', mb: 3, fontSize: '0.92rem', lineHeight: 1.7, fontFamily: '"Inter", sans-serif' }}>
                HeloZO values your privacy and is committed to protecting your personal information.
            </Typography>

            {[
                {
                    title: 'Information We Collect',
                    items: ['Name', 'Email address', 'Phone number', 'Location information', 'Profile information', 'Device and usage information'],
                },
                {
                    title: 'How We Use Your Information',
                    items: ['To provide and improve our services', 'To manage user accounts', 'To display relevant local listings', 'To send notifications and updates', 'To respond to support requests'],
                },
            ].map((section, i) => (
                <Box key={i} sx={{ mb: 3 }}>
                    <Typography sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1, fontSize: '0.95rem', fontFamily: '"Inter", sans-serif' }}>
                        {section.title}
                    </Typography>
                    <Stack component="ul" spacing={0.5} sx={{ pl: 3, m: 0 }}>
                        {section.items.map((item, j) => (
                            <Typography component="li" key={j} sx={{ color: '#5a6e8a', fontSize: '0.9rem', fontFamily: '"Inter", sans-serif' }}>
                                {item}
                            </Typography>
                        ))}
                    </Stack>
                </Box>
            ))}

            {[
                { title: 'Data Sharing', text: 'HeloZO does not sell personal information. Information may be shared with service providers when necessary to operate the platform.' },
                { title: 'Data Security', text: 'We implement reasonable measures to protect your information. However, no method of transmission over the internet is completely secure.' },
                { title: 'Third-Party Services', text: 'HeloZO may use third-party services such as analytics, maps, and notification providers.' },
                { title: 'Your Rights', text: 'Users may request updates or deletion of their account information, subject to applicable laws.' },
            ].map((section, i) => (
                <Box key={i} sx={{ mb: 3 }}>
                    <Typography sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1, fontSize: '0.95rem', fontFamily: '"Inter", sans-serif' }}>
                        {section.title}
                    </Typography>
                    <Typography sx={{ color: '#5a6e8a', fontSize: '0.9rem', lineHeight: 1.7, fontFamily: '"Inter", sans-serif' }}>
                        {section.text}
                    </Typography>
                </Box>
            ))}

            <Box>
                <Typography sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1, fontSize: '0.95rem', fontFamily: '"Inter", sans-serif' }}>
                    Contact Us
                </Typography>
                <Typography sx={{ color: '#5a6e8a', fontSize: '0.9rem', lineHeight: 1.7, fontFamily: '"Inter", sans-serif' }}>
                    For privacy-related questions, please contact us at:{' '}
                    <Link href="mailto:support@helozo.in" sx={{ color: '#325fec', fontWeight: 700 }}>
                        support@helozo.in
                    </Link>
                </Typography>
            </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
                onClick={onClose}
                fullWidth
                variant="contained"
                sx={{
                    borderRadius: '100px', py: 1.2, bgcolor: '#325fec',
                    fontWeight: 700, textTransform: 'none', fontFamily: '"Inter", sans-serif',
                    '&:hover': { bgcolor: '#1a4ad4' },
                }}
            >
                Close
            </Button>
        </DialogActions>
    </Dialog>
);

// ───────────────────────── Terms of Service Dialog ─────────────────────────
const TermsDialog = ({ open, onClose }) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: { xs: 1, sm: 2 } } }}
    >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={900} sx={{ fontFamily: '"Inter", sans-serif', color: '#020402' }}>
                Terms <span style={{ color: '#325fec' }}>and Conditions</span>
            </Typography>
            <MuiIconButton onClick={onClose} size="small">
                <CloseIcon />
            </MuiIconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '60vh' }}>
            
            <Typography sx={{ color: '#5a6e8a', mb: 3, fontSize: '0.92rem', lineHeight: 1.7, fontFamily: '"Inter", sans-serif' }}>
                By using HeloZO, you agree to these Terms and Conditions.
            </Typography>

            {[
                { title: 'Use of Services', text: 'HeloZO provides a platform for discovering shops, jobs, houses, and local services.' },
                { title: 'User Responsibilities', text: 'Users are responsible for providing accurate information and complying with applicable laws.' },
                { title: 'Listings', text: 'Businesses, employers, and property owners are responsible for the content they post.' },
            ].map((section, i) => (
                <Box key={i} sx={{ mb: 3 }}>
                    <Typography sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1, fontSize: '0.95rem', fontFamily: '"Inter", sans-serif' }}>
                        {section.title}
                    </Typography>
                    <Typography sx={{ color: '#5a6e8a', fontSize: '0.9rem', lineHeight: 1.7, fontFamily: '"Inter", sans-serif' }}>
                        {section.text}
                    </Typography>
                </Box>
            ))}

            <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1, fontSize: '0.95rem', fontFamily: '"Inter", sans-serif' }}>
                    Prohibited Activities
                </Typography>
                <Stack component="ul" spacing={0.5} sx={{ pl: 3, m: 0 }}>
                    {['Fake listings', 'Fraudulent activities', 'Spam', 'Illegal content', 'Harassment or abusive behavior'].map((item, j) => (
                        <Typography component="li" key={j} sx={{ color: '#5a6e8a', fontSize: '0.9rem', fontFamily: '"Inter", sans-serif' }}>
                            {item}
                        </Typography>
                    ))}
                </Stack>
            </Box>

            {[
                { title: 'Disclaimer', text: 'HeloZO acts only as a platform connecting users with businesses, employers, and property owners. HeloZO does not guarantee the accuracy, quality, or availability of listings.' },
                { title: 'Limitation of Liability', text: 'HeloZO shall not be liable for losses, damages, disputes, or transactions arising between users and third parties.' },
                { title: 'Account Suspension', text: 'HeloZO reserves the right to remove content or suspend accounts that violate these Terms and Conditions.' },
                { title: 'Changes to Terms', text: 'These Terms may be updated from time to time. Continued use of HeloZO constitutes acceptance of any updated terms.' },
            ].map((section, i) => (
                <Box key={i} sx={{ mb: 3 }}>
                    <Typography sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1, fontSize: '0.95rem', fontFamily: '"Inter", sans-serif' }}>
                        {section.title}
                    </Typography>
                    <Typography sx={{ color: '#5a6e8a', fontSize: '0.9rem', lineHeight: 1.7, fontFamily: '"Inter", sans-serif' }}>
                        {section.text}
                    </Typography>
                </Box>
            ))}

            <Box>
                <Typography sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1, fontSize: '0.95rem', fontFamily: '"Inter", sans-serif' }}>
                    Contact Us
                </Typography>
                <Typography sx={{ color: '#5a6e8a', fontSize: '0.9rem', lineHeight: 1.7, fontFamily: '"Inter", sans-serif' }}>
                    Email:{' '}
                    <Link href="mailto:support@helozo.in" sx={{ color: '#325fec', fontWeight: 700 }}>
                        support@helozo.in
                    </Link>
                    <br />
                    Website:{' '}
                    <Link href="https://www.helozo.in" target="_blank" rel="noopener noreferrer" sx={{ color: '#325fec', fontWeight: 700 }}>
                        www.helozo.in
                    </Link>
                </Typography>
            </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
                onClick={onClose}
                fullWidth
                variant="contained"
                sx={{
                    borderRadius: '100px', py: 1.2, bgcolor: '#325fec',
                    fontWeight: 700, textTransform: 'none', fontFamily: '"Inter", sans-serif',
                    '&:hover': { bgcolor: '#1a4ad4' },
                }}
            >
                Close
            </Button>
        </DialogActions>
    </Dialog>
);

// ───────────────────────── FAQ Dialog ─────────────────────────
const faqData = [
    { q: 'What is HeloZO?', a: 'HeloZO is a hyperlocal platform that helps users discover nearby shops, jobs, and rental homes' },
    { q: 'Is HeloZO free to use?', a: 'Yes, HeloZO is free for users.' },
    { q: 'How do I search for shops, jobs, or houses?', a: 'You can browse categories or use the search feature to find listings near your location.' },
    { q: 'Can I list my business or property on HeloZO?', a: 'Yes. Businesses, employers, and property owners can create listings on HeloZO.' },
    { q: 'How can I contact a shop owner or employer?', a: 'You can view the contact details provided in the listing and connect directly.' },
    { q: 'Does HeloZO verify listings?', a: 'HeloZO may review listings, but users should independently verify information before making decisions.' },
    { q: 'How can I report incorrect or inappropriate content?', a: 'You can contact our support team through the Support page.' },
    { q: 'Is my personal information secure?', a: 'We take reasonable measures to protect user information and privacy.' },
    { q: 'How can I contact HeloZO?', a: 'You can reach us through our Support or Contact Us page.' },
];

const FaqDialog = ({ open, onClose }) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: { xs: 1, sm: 2 } } }}
    >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={900} sx={{ fontFamily: '"Inter", sans-serif', color: '#020402' }}>
                Frequently Asked <span style={{ color: '#325fec' }}>Questions</span>
            </Typography>
            <MuiIconButton onClick={onClose} size="small">
                <CloseIcon />
            </MuiIconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '60vh' }}>
            {faqData.map((item, i) => (
                <Accordion
                    key={i}
                    elevation={0}
                    sx={{
                        bgcolor: 'rgba(50,95,236,0.03)',
                        borderRadius: '14px !important',
                        mb: 1.2,
                        '&:before': { display: 'none' },
                        border: '1px solid rgba(50,95,236,0.08)',
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#325fec' }} />}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', fontFamily: '"Inter", sans-serif' }}>
                            {item.q}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography sx={{ color: '#5a6e8a', fontSize: '0.88rem', lineHeight: 1.6, fontFamily: '"Inter", sans-serif' }}>
                            {item.a}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
                onClick={onClose}
                fullWidth
                variant="contained"
                sx={{
                    borderRadius: '100px', py: 1.2, bgcolor: '#325fec',
                    fontWeight: 700, textTransform: 'none', fontFamily: '"Inter", sans-serif',
                    '&:hover': { bgcolor: '#1a4ad4' },
                }}
            >
                Close
            </Button>
        </DialogActions>
    </Dialog>
);

const Footer = () => {
    const radarRef = useRef(null);
    const cornerRadarRef = useRef(null);
    const { deferredPrompt, isInstalled, isIOS } = usePWAInstall();
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [aboutOpen, setAboutOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    const [privacyOpen, setPrivacyOpen] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);
    const [faqOpen, setFaqOpen] = useState(false);

    useEffect(() => {
        if (radarRef.current) {
            gsap.to(radarRef.current, {
                rotation: 360, duration: 4, repeat: -1,
                ease: "none", transformOrigin: "center center"
            });
        }
        if (cornerRadarRef.current) {
            gsap.to(cornerRadarRef.current, {
                rotation: -360, duration: 5, repeat: -1,
                ease: "none", transformOrigin: "center center"
            });
        }
    }, []);

    const handleInstall = async () => {
        if (isInstalled) {
            setSnackbar({ open: true, message: 'HeloZO is already installed!', severity: 'info' });
            return;
        }
        if (isIOS) {
            setShowIOSGuide(true);
            return;
        }
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            setSnackbar({
                open: true,
                message: outcome === 'accepted' ? '🎉 HeloZO installed!' : 'Installation cancelled.',
                severity: outcome === 'accepted' ? 'success' : 'warning'
            });
        } else {
            setSnackbar({
                open: true,
                message: 'Open in Chrome → tap ⋮ menu → "Add to Home Screen"',
                severity: 'info'
            });
        }
    };

    // Expose globally so other components can trigger install too
    useEffect(() => {
        window.__triggerPWAInstall = handleInstall;
        return () => { delete window.__triggerPWAInstall; };
    }, [deferredPrompt, isInstalled, isIOS]);

    const socialLinks = [
        { icon: InstagramIcon, label: 'Instagram' },
        { icon: LinkedInIcon, label: 'LinkedIn' },
    ];

    const quickLinks = [
        { label: 'About Us', action: () => setAboutOpen(true) },
        { label: 'Contact Support', action: () => setContactOpen(true) },
        { label: 'FAQ', action: () => setFaqOpen(true) },
    ];

    const legalLinks = [
        { label: 'Privacy Policy', action: () => setPrivacyOpen(true) },
        { label: 'Terms of Service', action: () => setTermsOpen(true) },
    ];

    const getDownloadLabel = () => {
        if (isInstalled) return 'Already Installed ✓';
        if (isIOS) return 'Add to Home Screen';
        if (deferredPrompt) return 'Install App';
        return 'Download Now';
    };

    return (
        <>
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
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={{ xs: 4, md: 8 }} sx={{ mb: 6 }}>
                        {/* Logo & About */}
                        <Grid item xs={12} md={6}>
                            <Stack spacing={{ xs: 2, md: 3 }}>
                                <img src={helozologo} style={{ height: '35px', width: '130px' }} alt="HeloZO Logo" />
                                <Typography sx={{
                                    color: '#5a6e8a',
                                    maxWidth: 400,
                                    fontSize: { xs: '0.85rem', sm: '1rem' },
                                    lineHeight: 1.6,
                                    fontFamily: '"Inter", sans-serif',
                                }}>
                                    A hyperlocal platform connecting job seekers, shop owners, and
                                    rent house seekers. Building stronger communities through
                                    instant local discovery.
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
                                fontFamily: '"Inter", sans-serif',
                                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                color: '#020402'
                            }}>
                                Quick Links
                            </Typography>
                            <Stack spacing={1.5}>
                                {quickLinks.map((link) => (
                                    <Link
                                        key={link.label}
                                        component="button"
                                        onClick={link.action}
                                        underline="none"
                                        sx={{
                                            color: '#5a6e8a',
                                            fontSize: { xs: '0.75rem', sm: '0.9rem' },
                                            fontFamily: '"Inter", sans-serif',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'left',
                                            '&:hover': {
                                                color: '#325fec',
                                                transform: 'translateX(5px)',
                                                display: 'inline-block'
                                            }
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </Stack>
                        </Grid>

                        {/* Legal Links */}
                        <Grid item xs={6} md={3}>
                            <Typography variant="h6" fontWeight={800} sx={{
                                mb: 2,
                                fontFamily: '"Inter", sans-serif',
                                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                color: '#020402'
                            }}>
                                Legal
                            </Typography>
                            <Stack spacing={1.5}>
                                {legalLinks.map((link) => (
                                    <Link
                                        key={link.label}
                                        component="button"
                                        onClick={link.action}
                                        underline="none"
                                        sx={{
                                            color: '#5a6e8a',
                                            fontSize: { xs: '0.75rem', sm: '0.9rem' },
                                            fontFamily: '"Inter", sans-serif',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'left',
                                            '&:hover': {
                                                color: '#325fec',
                                                transform: 'translateX(5px)',
                                                display: 'inline-block'
                                            }
                                        }}
                                    >
                                        {link.label}
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
                            © {new Date().getFullYear()} <b style={{ color: '#325fec' }}>HeloZO</b>. All rights reserved.
                        </Typography>
                        <Typography variant="caption" sx={{
                            color: '#aaa',
                            fontStyle: 'italic',
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            fontFamily: '"Inter", sans-serif',
                        }}>
                            A product by{' '}
                            <Link
                                href="https://ruzix.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: '#325fec', fontWeight: 800, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                                Ruzix
                            </Link>
                        </Typography>
                    </Stack>

                    {/* App Download — Mobile Only */}
                    <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 4, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{
                            color: '#5a6e8a', mb: 2,
                            fontSize: { xs: '0.7rem', sm: '0.85rem' },
                            fontFamily: '"Inter", sans-serif',
                        }}>
                            Experience HeloZO on your mobile.
                        </Typography>
                        {/* <Box
                            onClick={handleInstall}
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1.5,
                                px: { xs: 2, sm: 3 },
                                py: { xs: 1, sm: 1.5 },
                                bgcolor: isInstalled ? 'rgba(50,95,236,0.08)' : '#ffffff',
                                color: '#325fec',
                                borderRadius: '100px',
                                cursor: isInstalled ? 'default' : 'pointer',
                                transition: '0.3s',
                                border: '1px solid rgba(50, 95, 236, 0.2)',
                                '&:hover': isInstalled ? {} : {
                                    bgcolor: '#325fec',
                                    transform: 'translateY(-3px)',
                                    color: 'white',
                                    boxShadow: '0 10px 20px rgba(50, 95, 236, 0.25)'
                                }
                            }}
                        >
                            {isIOS
                                ? <AppleIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                                : <GetAppIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                            }
                            <Typography sx={{
                                fontWeight: 700,
                                fontSize: { xs: '0.75rem', sm: '0.9rem' },
                                whiteSpace: 'nowrap',
                                color: 'inherit',
                                fontFamily: '"Inter", sans-serif',
                            }}>
                                {getDownloadLabel()}
                            </Typography>
                        </Box> */}
                    </Box>
                </Container>

                {/* iOS Guide Modal */}
                {showIOSGuide && (
                    <Box
                        onClick={() => setShowIOSGuide(false)}
                        sx={{
                            position: 'fixed', inset: 0,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            pb: 4,
                        }}
                    >
                        <Box
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                                bgcolor: '#fff',
                                borderRadius: '24px',
                                p: 4,
                                maxWidth: '380px',
                                width: '90%',
                                textAlign: 'center',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            }}
                        >
                            <Typography variant="h6" fontWeight={700} mb={1} color="#325fec">
                                Add HeloZO to Home Screen
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={3}>
                                iOS doesn't support automatic install. Follow these steps:
                            </Typography>
                            {[
                                { step: '1', text: 'Tap the Share button (↑) at the bottom of Safari' },
                                { step: '2', text: 'Scroll down and tap "Add to Home Screen"' },
                                { step: '3', text: 'Tap "Add" in the top right corner' },
                            ].map(({ step, text }) => (
                                <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, textAlign: 'left' }}>
                                    <Box sx={{
                                        minWidth: 32, height: 32,
                                        bgcolor: '#325fec',
                                        borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                                    }}>
                                        {step}
                                    </Box>
                                    <Typography variant="body2" color="text.primary">{text}</Typography>
                                </Box>
                            ))}
                            <Box
                                onClick={() => setShowIOSGuide(false)}
                                sx={{
                                    mt: 2,
                                    px: 4, py: 1.5,
                                    bgcolor: '#325fec',
                                    color: '#fff',
                                    borderRadius: '50px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontFamily: '"Inter", sans-serif',
                                    fontSize: '0.95rem',
                                    display: 'inline-block',
                                    '&:hover': { bgcolor: '#1a4ad4' }
                                }}
                            >
                                Got it!
                            </Box>
                        </Box>
                    </Box>
                )}

                <style>{`
                    @keyframes rotateFooter {
                        from { transform: translate(-50%, -50%) rotate(0deg); }
                        to   { transform: translate(-50%, -50%) rotate(360deg); }
                    }
                    @keyframes radarPulseFooter {
                        0%   { box-shadow: 0 0 0 0 rgba(50, 95, 236, 0.3); }
                        70%  { box-shadow: 0 0 0 40px rgba(50, 95, 236, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(50, 95, 236, 0); }
                    }
                `}</style>
            </Box>

            {/* Dialogs */}
            <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
            <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />
            <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
            <TermsDialog open={termsOpen} onClose={() => setTermsOpen(false)} />
            <FaqDialog open={faqOpen} onClose={() => setFaqOpen(false)} />

            {/* Snackbar */}
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

export default Footer;