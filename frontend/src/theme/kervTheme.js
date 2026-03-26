import { createTheme } from '@mui/material/styles';

const appBackground = '#ffffff';

export const kervTheme = createTheme({
  palette: {
    primary: {
      main: '#ed005e',
      dark: '#ca046a',
      contrastText: '#ffffff',
      hover: 'rgba(237, 0, 94, 0.08)',
    },
    secondary: {
      main: '#273168',
    },
    text: {
      primary: '#17203d',
      secondary: '#52607c',
    },
    background: {
      default: '#ffffff',
      paper: 'rgba(255, 255, 255, 0.5)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
    },
    glassSection: {
      background: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      border: '2px solid rgba(255, 255, 255, 0.8)',
      boxShadow: '0 20px 44px rgba(39, 49, 104, 0.12)',
    },
  },
  customBackground: {
    gradient: appBackground,
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.05em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    button: {
      fontWeight: 700,
      letterSpacing: '0.06em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          minHeight: '100%',
        },
        body: {
          minHeight: '100%',
          background: appBackground,
          color: '#17203d',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '#root': {
          minHeight: '100vh',
        },
        '*': {
          boxSizing: 'border-box',
        },
        '*::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(39, 49, 104, 0.2)',
          borderRadius: '999px',
          border: '2px solid transparent',
          backgroundClip: 'content-box',
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          textTransform: 'uppercase',
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #ed005e 0%, #ff237c 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #ca046a 0%, #ef146d 100%)',
            boxShadow: 'none',
          },
        },
        textPrimary: {
          '&:hover': {
            background: 'rgba(237, 0, 94, 0.08)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          '&.Mui-focused fieldset': {
            borderColor: '#ed005e',
            borderWidth: 2,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(255, 255, 255, 0.68)',
          backdropFilter: 'blur(20px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.8)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(255, 255, 255, 0.68)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(18px)',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.85)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.68)',
          color: '#273168',
        },
      },
    },
  },
});
