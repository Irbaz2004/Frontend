import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#325fec', // Primary blue
      dark: '#2548b0',
      light: '#5a7ef0',
      contrastText: '#ffffff',
    },
    background: {
      default: '#020402', // Dark background
      paper: '#ffffff',   // White for cards/surfaces
    },
    secondary: {
      main: '#020402', // Dark green/black for contrast
    },
    text: {
      primary: '#020402',
      secondary: '#5a6e8a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Alumni Sans", "Outfit", sans-serif',
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontFamily: '"Alumni Sans", "Outfit", sans-serif',
      fontWeight: 700,
      fontSize: '2.75rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Alumni Sans", "Outfit", sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
    },
    h4: {
      fontFamily: '"Alumni Sans", "Outfit", sans-serif',
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h5: {
      fontFamily: '"Alumni Sans", "Outfit", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontFamily: '"Alumni Sans", "Outfit", sans-serif',
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    body1: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1.1rem',
      lineHeight: 1.6,
      color: '#5a6e8a',
    },
    body2: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '0.95rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: '"Inter", sans-serif',
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
            // boxShadow: '0 12px 24px rgba(50, 95, 236, 0.25)',
          },
        },
        containedPrimary: {
          backgroundColor: '#325fec',
          // boxShadow: '0 8px 20px rgba(50, 95, 236, 0.25)',
          '&:hover': {
            backgroundColor: '#325fec',
            // boxShadow: '0 12px 28px rgba(50, 95, 236, 0.35)',
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          borderColor: '#325fec',
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(50, 95, 236, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
          // border: '1px solid rgba(50, 95, 236, 0.1)',
          background: '#ffffff',
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': {
            transform: 'translateY(-10px) scale(1.01)',
            boxShadow: '0 30px 60px rgba(50, 95, 236, 0.12)',
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#020402',
          // boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme;