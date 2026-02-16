import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, Grid, Stack, Chip, Paper, Avatar } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Import icons
import WorkIcon from '@mui/icons-material/Work';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import LunchDiningIcon from '@mui/icons-material/LunchDining';

const useCases = [
    {
        title: 'For Job Seekers',
        subtitle: 'Rahul, a college student',
        story: '6:00 PM, Rahul finishes his classes. He needs a part-time job to support his education. Within minutes on FindEasy, he discovers a cafe hiring nearby. By 7:00 PM, he\'s already scheduled for an interview.',
        desc: 'Find part-time work that fits your schedule, right in your neighborhood.',
        chips: ['Part-time', 'Nearby', 'Flexible Hours', 'Student Friendly'],
        icon: <WorkIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />,
        color: '#C00C0C',
        gradient: 'linear-gradient(135deg, #C00C0C 0%, #ff6b6b 100%)',
        imageColor: '#fff5f5',
        timeIcon: <AccessTimeIcon />,
        locationIcon: <LocationOnIcon />,
        character: '🎓',
        scene: 'cafe'
    },
    {
        title: 'For Shop Owners',
        subtitle: 'Mrs. Gupta, Bakery Owner',
        story: '8:00 AM, Mrs. Gupta\'s bakery is bustling. Her delivery boy calls in sick. She posts on FindEasy at 8:15 AM. By 9:30 AM, three local candidates have applied. By 10:00 AM, she\'s hired her new delivery partner.',
        desc: 'Find reliable local talent when you need them most. No more "help wanted" signs.',
        chips: ['Urgent Hiring', 'Local Talent', 'Quick Process', 'Verified'],
        icon: <StorefrontIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />,
        color: '#FF9800',
        gradient: 'linear-gradient(135deg, #FF9800 0%, #ffc107 100%)',
        imageColor: '#fff8e7',
        timeIcon: <AccessTimeIcon />,
        locationIcon: <LocationOnIcon />,
        character: '👩‍🍳',
        scene: 'bakery'
    },
    {
        title: 'For Customers',
        subtitle: 'Anjali, New to the City',
        story: '12:30 PM, Anjali is craving an egg sandwich but doesn\'t know the area. She opens FindEasy, searches "breakfast near me", and finds "Red Velvet Cafe" just 200m away with 4.8 stars. 15 minutes later, she\'s enjoying her sandwich.',
        desc: 'Discover the best local spots, read reviews, and find exactly what you\'re craving.',
        chips: ['Discover', 'Reviews', 'Nearby', 'Food'],
        icon: <PersonIcon sx={{ fontSize: { xs: 30, sm: 40 } }} />,
        color: '#4CAF50',
        gradient: 'linear-gradient(135deg, #4CAF50 0%, #8bc34a 100%)',
        imageColor: '#f1f8e9',
        timeIcon: <AccessTimeIcon />,
        locationIcon: <LocationOnIcon />,
        character: '👩‍💼',
        scene: 'cafe'
    },
];

const UseCases = () => {
    const containerRef = useRef(null);
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const storyRef = useRef(null);
    const visualRef = useRef(null);
    const progressRef = useRef([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Title animation
            gsap.from(titleRef.current.children, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: 'top 80%',
                    end: 'top 30%',
                    scrub: 1
                }
            });

            // Create ScrollTrigger for the storytelling section
            const isTinyScreen = window.innerWidth < 450;

            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: "top top",
                end: "+=200%",
                pin: !isTinyScreen, // Disable pinning on tiny screens to avoid content cutoff
                pinSpacing: !isTinyScreen,
                scrub: 1,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const index = Math.min(
                        Math.floor(progress * useCases.length),
                        useCases.length - 1
                    );

                    if (index !== activeIndex) {
                        setActiveIndex(index);

                        // Animate story content change
                        gsap.fromTo(storyRef.current,
                            { opacity: 0, x: -20 },
                            { opacity: 1, x: 0, duration: 0.4 }
                        );

                        gsap.fromTo(visualRef.current,
                            { opacity: 0, x: 20 },
                            { opacity: 1, x: 0, duration: 0.4, delay: 0.1 }
                        );

                        // Animate progress dots
                        progressRef.current.forEach((dot, i) => {
                            gsap.to(dot, {
                                width: i === index ? '40px' : '12px',
                                background: i === index ? useCases[index].gradient : 'rgba(0,0,0,0.1)',
                                duration: 0.3
                            });
                        });
                    }
                }
            });

        }, containerRef);

        return () => {
            ScrollTrigger.getAll().forEach(st => st.kill());
        };
    }, [activeIndex]);

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                bgcolor: '#ffffff',
                minHeight: '100vh'
            }}
        >
            {/* Background Pattern - Responsive */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 10% 20%, rgba(192, 12, 12, 0.02) 0%, transparent 30%), radial-gradient(circle at 90% 80%, rgba(192, 12, 12, 0.02) 0%, transparent 30%)',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: { xs: 0.5, sm: 1 }
            }} />

            {/* Title Section - Responsive */}
            <Container maxWidth="lg" sx={{
                position: 'relative',
                zIndex: 1,
                pt: { xs: 10, sm: 15, md: 20 },
                pb: { xs: 3, sm: 5 }
            }}>
                <Box ref={titleRef} sx={{ textAlign: 'center' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#C00C0C',
                            fontWeight: 900,
                            letterSpacing: { xs: '2px', sm: '4px' },
                            fontSize: { xs: '0.7rem', sm: '0.9rem' },
                            display: 'inline-block',
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -8,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: { xs: '30px', sm: '40px' },
                                height: '3px',
                                background: '#C00C0C',
                                borderRadius: '2px'
                            }
                        }}
                    >
                        COMMUNITY IMPACT
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 900,
                            mt: { xs: 3, sm: 4 },
                            mb: { xs: 1, sm: 2 },
                            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '4rem' },
                            fontFamily: '"Outfit", sans-serif',
                            lineHeight: 1.2,
                            px: { xs: 2, sm: 0 }
                        }}
                    >
                        Real Stories.<br />Real People.
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            maxWidth: '700px',
                            mx: 'auto',
                            color: '#4a4a4a',
                            fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.2rem' },
                            lineHeight: 1.7,
                            px: { xs: 3, sm: 2 }
                        }}
                    >
                        Every day, thousands of people in your neighborhood connect, work, and grow through FindEasy.
                    </Typography>
                </Box>
            </Container>

            {/* Storytelling Section - Responsive */}
            <Box
                ref={sectionRef}
                sx={{
                    height: { xs: '70vh', sm: '80vh', md: '100vh' },
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    mt: { xs: 1, sm: 2, md: 4 }
                }}
            >
                {/* Progress Indicator - Responsive */}
                <Box sx={{
                    position: 'absolute',
                    top: { xs: 10, sm: 20 },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 20,
                    display: 'flex',
                    gap: { xs: 1, sm: 2 },
                    bgcolor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: '100px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    width: { xs: 'auto', sm: 'auto' }
                }}>
                    {useCases.map((_, index) => (
                        <Box
                            key={index}
                            ref={el => progressRef.current[index] = el}
                            sx={{
                                width: index === activeIndex ? { xs: '30px', sm: '40px' } : { xs: '8px', sm: '12px' },
                                height: { xs: '8px', sm: '12px' },
                                borderRadius: '6px',
                                background: index === activeIndex
                                    ? useCases[activeIndex].gradient
                                    : 'rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                const st = ScrollTrigger.getAll().find(tr => tr.vars.trigger === sectionRef.current);
                                if (st) {
                                    const progress = index / useCases.length;
                                    st.scroll(st.start + (st.end - st.start) * progress);
                                }
                            }}
                        />
                    ))}
                </Box>

                {/* Active Story Display - Responsive */}
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '900px', md: '1200px' },
                    px: { xs: 2, sm: 3, md: 4 }
                }}>
                    <Grid container spacing={{ xs: 2, sm: 4, md: 6 }} alignItems="center">
                        {/* Left side - Story Content */}
                        <Grid item xs={12} md={6}>
                            <Paper
                                ref={storyRef}
                                elevation={0}
                                sx={{
                                    p: { xs: 2, sm: 3, md: 5 },
                                    borderRadius: { xs: '20px', sm: '30px', md: '40px' },
                                    bgcolor: 'white',
                                    border: `1px solid ${useCases[activeIndex].color}20`,
                                    boxShadow: `0 30px 60px ${useCases[activeIndex].color}20`,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Character Icon - Responsive */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: { xs: 10, sm: 20 },
                                    right: { xs: 10, sm: 20 },
                                    fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                                    opacity: 0.1,
                                    transform: 'rotate(10deg)'
                                }}>
                                    {useCases[activeIndex].character}
                                </Box>

                                <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                                    {/* Header - Responsive */}
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                        <Avatar
                                            sx={{
                                                width: { xs: 40, sm: 50, md: 60 },
                                                height: { xs: 40, sm: 50, md: 60 },
                                                bgcolor: useCases[activeIndex].gradient,
                                                color: 'white'
                                            }}
                                        >
                                            {React.cloneElement(useCases[activeIndex].icon, {
                                                sx: { fontSize: { xs: 20, sm: 25, md: 30 } }
                                            })}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h4" fontWeight={900} sx={{
                                                fontFamily: '"Outfit", sans-serif',
                                                fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' }
                                            }}>
                                                {useCases[activeIndex].title}
                                            </Typography>
                                            <Typography variant="h6" sx={{
                                                color: useCases[activeIndex].color,
                                                fontWeight: 600,
                                                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' }
                                            }}>
                                                {useCases[activeIndex].subtitle}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* Story - Responsive */}
                                    <Box sx={{
                                        p: { xs: 2, sm: 3, md: 4 },
                                        bgcolor: '#f8f8f8',
                                        borderRadius: { xs: '16px', sm: '20px', md: '24px' },
                                        borderLeft: `4px solid ${useCases[activeIndex].color}`
                                    }}>
                                        <Typography variant="body1" sx={{
                                            fontSize: { xs: '0.8rem', sm: '0.95rem', md: '1.1rem' },
                                            lineHeight: 1.8,
                                            fontStyle: 'italic'
                                        }}>
                                            "{useCases[activeIndex].story}"
                                        </Typography>
                                    </Box>

                                    {/* Key Stats - Responsive */}
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 3 }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AccessTimeIcon sx={{ color: useCases[activeIndex].color, fontSize: { xs: 16, sm: 18, md: 20 } }} />
                                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' } }}>
                                                Under 2 hours
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <LocationOnIcon sx={{ color: useCases[activeIndex].color, fontSize: { xs: 16, sm: 18, md: 20 } }} />
                                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' } }}>
                                                200m away
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <VerifiedIcon sx={{ color: useCases[activeIndex].color, fontSize: { xs: 16, sm: 18, md: 20 } }} />
                                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' } }}>
                                                Verified
                                            </Typography>
                                        </Stack>
                                    </Stack>

                                    {/* Description - Responsive */}
                                    <Typography variant="body1" sx={{
                                        color: '#4a4a4a',
                                        lineHeight: 1.7,
                                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
                                    }}>
                                        {useCases[activeIndex].desc}
                                    </Typography>

                                    {/* Chips - Responsive */}
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        {useCases[activeIndex].chips.map((chip, i) => (
                                            <Chip
                                                key={i}
                                                label={chip}
                                                sx={{
                                                    bgcolor: `${useCases[activeIndex].color}10`,
                                                    color: useCases[activeIndex].color,
                                                    fontWeight: 600,
                                                    borderRadius: '100px',
                                                    border: `1px solid ${useCases[activeIndex].color}30`,
                                                    fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem' },
                                                    height: { xs: 24, sm: 28, md: 32 },
                                                    '&:hover': {
                                                        bgcolor: useCases[activeIndex].color,
                                                        color: 'white'
                                                    }
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* Right side - Visual Scene - Hidden on mobile */}
                        <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Box ref={visualRef} sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative'
                            }}>
                                {/* Main Visual */}
                                <Box
                                    sx={{
                                        width: '400px',
                                        height: '400px',
                                        borderRadius: '60px',
                                        background: useCases[activeIndex].gradient,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        boxShadow: `0 40px 80px ${useCases[activeIndex].color}40`,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        animation: 'float 6s infinite ease-in-out'
                                    }}
                                >
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)'
                                    }} />

                                    {activeIndex === 0 && (
                                        <>
                                            <LocalCafeIcon sx={{ fontSize: 100, mb: 2, opacity: 0.9 }} />
                                            <Typography variant="h5" fontWeight={800}>Cafe Hiring</Typography>
                                            <Typography variant="body2">"Barista Needed - 2km away"</Typography>
                                        </>
                                    )}
                                    {activeIndex === 1 && (
                                        <>
                                            <BakeryDiningIcon sx={{ fontSize: 100, mb: 2, opacity: 0.9 }} />
                                            <Typography variant="h5" fontWeight={800}>Bakery</Typography>
                                            <Typography variant="body2">"Delivery Partner Urgently Needed"</Typography>
                                        </>
                                    )}
                                    {activeIndex === 2 && (
                                        <>
                                            <LunchDiningIcon sx={{ fontSize: 100, mb: 2, opacity: 0.9 }} />
                                            <Typography variant="h5" fontWeight={800}>Red Velvet Cafe</Typography>
                                            <Typography variant="body2">"Best Egg Sandwich • 200m away"</Typography>
                                        </>
                                    )}

                                    <Box sx={{
                                        position: 'absolute',
                                        top: '20%',
                                        right: '10%',
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        animation: 'pulse 2s infinite'
                                    }} />
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: '20%',
                                        left: '10%',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        animation: 'pulse 3s infinite'
                                    }} />
                                </Box>

                                <Box sx={{
                                    position: 'absolute',
                                    top: -20,
                                    right: -20,
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    background: useCases[activeIndex].gradient,
                                    opacity: 0.1,
                                    filter: 'blur(40px)',
                                    zIndex: -1
                                }} />
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: -30,
                                    left: -30,
                                    width: '200px',
                                    height: '200px',
                                    borderRadius: '50%',
                                    background: useCases[activeIndex].gradient,
                                    opacity: 0.1,
                                    filter: 'blur(50px)',
                                    zIndex: -1
                                }} />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Navigation Hint - Responsive */}
                <Box sx={{
                    position: 'absolute',
                    bottom: { xs: 20, sm: 30, md: 40 },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: { xs: 0.5, sm: 1 },
                    color: '#C00C0C',
                    animation: 'bounce 2s infinite'
                }}>
                    <Typography variant="caption" sx={{
                        fontWeight: 600,
                        letterSpacing: '1px',
                        fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem' }
                    }}>
                        SCROLL TO HEAR MORE STORIES
                    </Typography>
                    <Box sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' } }}>
                        ↓
                    </Box>
                </Box>

                {/* Background Number - Responsive */}
                <Typography sx={{
                    position: 'absolute',
                    bottom: '5%',
                    right: '2%',
                    fontSize: { xs: '4rem', sm: '6rem', md: '8rem', lg: '15rem' },
                    fontWeight: 900,
                    color: `${useCases[activeIndex].color}08`,
                    fontFamily: '"Outfit", sans-serif',
                    lineHeight: 1,
                    zIndex: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    transition: 'color 0.3s ease',
                    display: { xs: 'none', sm: 'block' }
                }}>
                    0{activeIndex + 1}
                </Typography>
            </Box>

            <style>
                {`
                    @keyframes bounce {
                        0%, 100% { transform: translateX(-50%) translateY(0); }
                        50% { transform: translateX(-50%) translateY(10px); }
                    }
                    
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                    
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 0.5; }
                        50% { transform: scale(1.5); opacity: 0.8; }
                    }
                `}
            </style>
        </Box>
    );
};

export default UseCases;