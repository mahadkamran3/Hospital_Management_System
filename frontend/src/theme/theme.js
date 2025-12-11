import { createTheme } from '@mui/material/styles';

/**
 * HospitaliaCare Dark Theme
 * Modern dark theme with Pakistani healthcare colors
 */
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00bfa5', // Bright teal
      light: '#5df2d6',
      dark: '#008e76',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff5252', // Bright red
      light: '#ff867f',
      dark: '#c50e29',
      contrastText: '#000000',
    },
    background: {
      default: '#0a0e14', // Deep dark blue-black
      paper: '#131a24', // Slightly lighter
    },
    success: {
      main: '#00e676',
      light: '#66ffa6',
      dark: '#00b248',
    },
    warning: {
      main: '#ffab00',
      light: '#ffdd4b',
      dark: '#c67c00',
    },
    info: {
      main: '#00b0ff',
      light: '#69e2ff',
      dark: '#0081cb',
    },
    error: {
      main: '#ff1744',
      light: '#ff616f',
      dark: '#c4001d',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(0, 191, 165, 0.2)',
    action: {
      active: '#00bfa5',
      hover: 'rgba(0, 191, 165, 0.08)',
      selected: 'rgba(0, 191, 165, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Segoe UI", sans-serif',
    h1: { fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.01em' },
    h3: { fontWeight: 700, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
    body1: { fontSize: '0.95rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#00bfa5 #131a24',
          '&::-webkit-scrollbar': { width: '8px', height: '8px' },
          '&::-webkit-scrollbar-track': { background: '#131a24' },
          '&::-webkit-scrollbar-thumb': { background: '#00bfa5', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#5df2d6' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600,
          boxShadow: 'none', transition: 'all 0.3s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0, 191, 165, 0.4)' },
        },
        contained: {
          background: 'linear-gradient(135deg, #00bfa5 0%, #00897b 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #5df2d6 0%, #00bfa5 100%)' },
        },
        outlined: { borderWidth: 2, borderColor: '#00bfa5', '&:hover': { borderWidth: 2, backgroundColor: 'rgba(0, 191, 165, 0.1)' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, background: 'linear-gradient(145deg, #131a24 0%, #1a2332 100%)',
          border: '1px solid rgba(0, 191, 165, 0.1)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0, 191, 165, 0.2)', border: '1px solid rgba(0, 191, 165, 0.3)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12, backgroundImage: 'none', backgroundColor: '#131a24' },
        elevation1: { boxShadow: '0 2px 12px rgba(0,0,0,0.4)' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10, backgroundColor: 'rgba(0, 191, 165, 0.05)', transition: 'all 0.3s ease',
            '& fieldset': { borderColor: 'rgba(0, 191, 165, 0.3)', borderWidth: 2 },
            '&:hover fieldset': { borderColor: '#00bfa5' },
            '&.Mui-focused fieldset': { borderColor: '#00bfa5', boxShadow: '0 0 0 3px rgba(0, 191, 165, 0.2)' },
          },
          '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, border: '1px solid transparent' },
        colorPrimary: { background: 'linear-gradient(135deg, rgba(0, 191, 165, 0.2) 0%, rgba(0, 191, 165, 0.1) 100%)', border: '1px solid rgba(0, 191, 165, 0.5)', color: '#5df2d6' },
        colorSuccess: { background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.2) 0%, rgba(0, 230, 118, 0.1) 100%)', border: '1px solid rgba(0, 230, 118, 0.5)', color: '#66ffa6' },
        colorError: { background: 'linear-gradient(135deg, rgba(255, 23, 68, 0.2) 0%, rgba(255, 23, 68, 0.1) 100%)', border: '1px solid rgba(255, 23, 68, 0.5)', color: '#ff616f' },
        colorWarning: { background: 'linear-gradient(135deg, rgba(255, 171, 0, 0.2) 0%, rgba(255, 171, 0, 0.1) 100%)', border: '1px solid rgba(255, 171, 0, 0.5)', color: '#ffdd4b' },
      },
    },
    MuiTableContainer: { styleOverrides: { root: { borderRadius: 12, border: '1px solid rgba(0, 191, 165, 0.1)' } } },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: 'linear-gradient(135deg, #00897b 0%, #00695c 100%)', color: '#ffffff',
            fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: 'none',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 191, 165, 0.03)' },
          '&:hover': { backgroundColor: 'rgba(0, 191, 165, 0.1) !important', transform: 'scale(1.005)' },
        },
      },
    },
    MuiTableCell: { styleOverrides: { root: { borderBottom: '1px solid rgba(0, 191, 165, 0.1)', padding: '16px' } } },
    MuiFab: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #00bfa5 0%, #00897b 100%)', boxShadow: '0 6px 20px rgba(0, 191, 165, 0.5)',
          '&:hover': { background: 'linear-gradient(135deg, #5df2d6 0%, #00bfa5 100%)', transform: 'scale(1.1)' },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 20, background: 'linear-gradient(145deg, #131a24 0%, #1a2332 100%)', border: '1px solid rgba(0, 191, 165, 0.2)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { background: 'linear-gradient(135deg, #0d1117 0%, #131a24 100%)', borderBottom: '1px solid rgba(0, 191, 165, 0.2)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' },
      },
    },
    MuiDrawer: { styleOverrides: { paper: { background: 'linear-gradient(180deg, #0d1117 0%, #131a24 100%)', borderRight: '1px solid rgba(0, 191, 165, 0.2)' } } },
    MuiAvatar: { styleOverrides: { root: { background: 'linear-gradient(135deg, #00bfa5 0%, #00897b 100%)', fontWeight: 700 } } },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12, border: '1px solid' },
        standardError: { backgroundColor: 'rgba(255, 23, 68, 0.15)', borderColor: 'rgba(255, 23, 68, 0.5)', color: '#ff616f' },
        standardSuccess: { backgroundColor: 'rgba(0, 230, 118, 0.15)', borderColor: 'rgba(0, 230, 118, 0.5)', color: '#66ffa6' },
        standardWarning: { backgroundColor: 'rgba(255, 171, 0, 0.15)', borderColor: 'rgba(255, 171, 0, 0.5)', color: '#ffdd4b' },
        standardInfo: { backgroundColor: 'rgba(0, 176, 255, 0.15)', borderColor: 'rgba(0, 176, 255, 0.5)', color: '#69e2ff' },
        filledError: { background: 'linear-gradient(135deg, #ff1744 0%, #c4001d 100%)' },
        filledSuccess: { background: 'linear-gradient(135deg, #00e676 0%, #00b248 100%)' },
      },
    },
    MuiSkeleton: { styleOverrides: { root: { borderRadius: 8, backgroundColor: 'rgba(0, 191, 165, 0.1)' } } },
    MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: '3px 3px 0 0', background: 'linear-gradient(90deg, #00bfa5 0%, #5df2d6 100%)' } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', '&.Mui-selected': { color: '#00bfa5' } } } },
    MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: '#1a2332', border: '1px solid rgba(0, 191, 165, 0.3)', borderRadius: 8, fontSize: '0.85rem' } } },
    MuiMenu: { styleOverrides: { paper: { background: 'linear-gradient(145deg, #131a24 0%, #1a2332 100%)', border: '1px solid rgba(0, 191, 165, 0.2)', borderRadius: 12 } } },
    MuiMenuItem: { styleOverrides: { root: { borderRadius: 8, margin: '4px 8px', transition: 'all 0.2s ease', '&:hover': { backgroundColor: 'rgba(0, 191, 165, 0.15)' } } } },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: 'rgba(0, 191, 165, 0.2)' },
        bar: { borderRadius: 4, background: 'linear-gradient(90deg, #00bfa5 0%, #5df2d6 100%)' },
      },
    },
    MuiCircularProgress: { styleOverrides: { root: { color: '#00bfa5' } } },
  },
});

export default theme;
