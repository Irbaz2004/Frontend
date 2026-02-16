import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#C00C0C', // Custom Red
      dark: '#7C2F2F',  // Dark Red
      light: '#FF4D4D',
      contrastText: '#fff',
    },
    background: {
      default: '#ffffff',
      paper: '#F8F8F8',
    },
    secondary: {
      main: '#1a1a1a', // Dark Gray/Black for contrast
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      fontSize: '2.75rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
    },
    h4: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h5: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
      color: '#4A4A4A',
    },
    body2: {
      fontSize: '0.95rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: '"Outfit", sans-serif',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '14px 32px',
          fontSize: '1rem',
          textTransform: 'none',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: '0 12px 24px rgba(192, 12, 12, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #C00C0C 0%, #8A0909 100%)',
          boxShadow: '0 8px 20px rgba(192, 12, 12, 0.15)',
          '&:hover': {
            background: 'linear-gradient(135deg, #A00A0A 0%, #700707 100%)',
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(192, 12, 12, 0.03)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': {
            transform: 'translateY(-10px) scale(1.01)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
  },
});

export default theme;
