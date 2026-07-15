// theme.js
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
      default: '#ffffff', // White background
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
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#5a6e8a',
    },
    body2: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: '"Inter", sans-serif',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#ffffff',
          margin: 0,
          padding: 0,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.875rem',
          textTransform: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          backgroundColor: '#325fec',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#2548b0',
            boxShadow: 'none',
          },
        },
        outlinedPrimary: {
          borderWidth: 1.5,
          borderColor: '#325fec',
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: 'rgba(50, 95, 236, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e8ecef',
          background: '#ffffff',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
          border: '1px solid #e8ecef',
          background: '#ffffff',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#020402',
          boxShadow: 'none',
          borderBottom: '1px solid #e8ecef',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e8ecef',
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#e8ecef',
            },
            '&:hover fieldset': {
              borderColor: '#325fec',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#325fec',
              borderWidth: 1.5,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: 'none',
          border: '1px solid #e8ecef',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        standardSuccess: {
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
        },
        standardError: {
          backgroundColor: '#ffebee',
          color: '#c62828',
        },
        standardWarning: {
          backgroundColor: '#fff3e0',
          color: '#ed6c02',
        },
        standardInfo: {
          backgroundColor: '#e8f0fe',
          color: '#325fec',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filledPrimary: {
          backgroundColor: '#e8f0fe',
          color: '#325fec',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#e8ecef',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f8f9fa',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e8ecef',
          padding: '12px 16px',
        },
        head: {
          backgroundColor: '#f8f9fa',
          fontWeight: 600,
          color: '#020402',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#325fec',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            color: '#325fec',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: '#e8f0fe',
            '&:hover': {
              backgroundColor: '#dce8fb',
            },
          },
          '&:hover': {
            backgroundColor: '#f8f9fa',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#5a6e8a',
          minWidth: 40,
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme;