import { createTheme } from '@mui/material/styles';

/**
 * HospitaliaCare Dark Theme v2
 * High-contrast, modern healthcare palette (Indigo + Violet)
 */

const palette = {
  mode: 'dark',
  primary: {
    main: '#2563eb', // Indigo 600
    light: '#60a5fa',
    dark: '#1e40af',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#a855f7', // Violet 500
    light: '#c084fc',
    dark: '#7e22ce',
    contrastText: '#ffffff',
  },
  background: {
    default: '#0b1020', // Deep navy
    paper: '#121a2b', // Slightly lighter panel
  },
  success: {
    main: '#06b6d4', // Cyan
    light: '#22d3ee',
    dark: '#0891b2',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#b45309',
  },
  info: {
    main: '#38bdf8',
    light: '#7dd3fc',
    dark: '#0ea5e9',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#b91c1c',
  },
  text: {
    primary: '#e6edf7',
    secondary: 'rgba(230, 237, 247, 0.72)',
    disabled: 'rgba(230, 237, 247, 0.5)',
  },
  divider: 'rgba(37, 99, 235, 0.18)',
  action: {
    active: '#60a5fa',
    hover: 'rgba(37, 99, 235, 0.10)',
    selected: 'rgba(37, 99, 235, 0.18)',
    disabled: 'rgba(230, 237, 247, 0.3)',
    disabledBackground: 'rgba(230, 237, 247, 0.12)',
  },
};

const theme = createTheme({
  palette,
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
          scrollbarColor: `${palette.primary.main} ${palette.background.paper}`,
          '&::-webkit-scrollbar': { width: '8px', height: '8px' },
          '&::-webkit-scrollbar-track': { background: palette.background.paper },
          '&::-webkit-scrollbar-thumb': { background: palette.primary.main, borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { background: palette.primary.light },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600,
          boxShadow: 'none', transition: 'all 0.3s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)' },
        },
        contained: {
          background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
          color: palette.primary.contrastText,
          '&:hover': { background: `linear-gradient(135deg, ${palette.primary.light} 0%, ${palette.primary.main} 100%)` },
        },
        outlined: {
          borderWidth: 2, borderColor: palette.primary.main,
          '&:hover': { borderWidth: 2, backgroundColor: 'rgba(37, 99, 235, 0.10)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: `linear-gradient(145deg, ${palette.background.paper} 0%, #17223a 100%)`,
          border: '1px solid rgba(37, 99, 235, 0.20)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(37, 99, 235, 0.25)',
            border: '1px solid rgba(37, 99, 235, 0.35)'
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12, backgroundImage: 'none', backgroundColor: palette.background.paper },
        elevation1: { boxShadow: '0 2px 12px rgba(0,0,0,0.4)' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10, backgroundColor: 'rgba(37, 99, 235, 0.06)', transition: 'all 0.3s ease',
            '& fieldset': { borderColor: 'rgba(37, 99, 235, 0.30)', borderWidth: 2 },
            '&:hover fieldset': { borderColor: palette.primary.main },
            '&.Mui-focused fieldset': { borderColor: palette.primary.main, boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.22)' },
          },
          '& .MuiInputLabel-root': { color: 'rgba(230, 237, 247, 0.7)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, border: '1px solid transparent' },
        colorPrimary: {
          background: 'linear-gradient(135deg, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0.12) 100%)',
          border: '1px solid rgba(37,99,235,0.45)', color: palette.primary.light
        },
        colorSuccess: {
          background: 'linear-gradient(135deg, rgba(6,182,212,0.22) 0%, rgba(6,182,212,0.12) 100%)',
          border: '1px solid rgba(6,182,212,0.45)', color: '#67e8f9'
        },
        colorError: {
          background: 'linear-gradient(135deg, rgba(239,68,68,0.22) 0%, rgba(239,68,68,0.12) 100%)',
          border: '1px solid rgba(239,68,68,0.45)', color: '#fca5a5'
        },
        colorWarning: {
          background: 'linear-gradient(135deg, rgba(245,158,11,0.22) 0%, rgba(245,158,11,0.12) 100%)',
          border: '1px solid rgba(245,158,11,0.45)', color: '#fde68a'
        },
      },
    },
    MuiTableContainer: { styleOverrides: { root: { borderRadius: 12, border: '1px solid rgba(37, 99, 235, 0.18)' } } },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: `linear-gradient(135deg, ${palette.primary.dark} 0%, ${palette.primary.main} 100%)`, color: '#ffffff',
            fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: 'none',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:nth-of-type(odd)': { backgroundColor: 'rgba(37, 99, 235, 0.04)' },
          '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.12) !important', transform: 'scale(1.005)' },
        },
      },
    },
    MuiTableCell: { styleOverrides: { root: { borderBottom: '1px solid rgba(37, 99, 235, 0.16)', padding: '16px' } } },
    MuiFab: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
          boxShadow: '0 6px 20px rgba(37, 99, 235, 0.45)',
          '&:hover': { background: `linear-gradient(135deg, ${palette.primary.light} 0%, ${palette.primary.main} 100%)`, transform: 'scale(1.1)' },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          background: `linear-gradient(145deg, ${palette.background.paper} 0%, #17223a 100%)`,
          border: '1px solid rgba(37, 99, 235, 0.22)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, #0c1328 0%, ${palette.background.paper} 100%)`,
          borderBottom: '1px solid rgba(37, 99, 235, 0.22)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        },
      },
    },
    MuiDrawer: { styleOverrides: { paper: { background: `linear-gradient(180deg, #0c1328 0%, ${palette.background.paper} 100%)`, borderRight: '1px solid rgba(37, 99, 235, 0.22)' } } },
    MuiAvatar: { styleOverrides: { root: { background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`, fontWeight: 700 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12, border: '1px solid', fontWeight: 500 },
      standardError: { backgroundColor: '#b91c1c', borderColor: '#b91c1c', color: '#fef2f2' },
      standardSuccess: { backgroundColor: '#166534', borderColor: '#166534', color: '#f0fdf4' },
      standardWarning: { backgroundColor: '#fffbeb', borderColor: '#fde68a', color: '#b45309' },
      standardInfo: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1' },
      filledError: { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#ffffff' },
      filledSuccess: { background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff' },
    },
    // standardSuccess: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' },
    //standardError: { backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' },
  },
    MuiSkeleton: { styleOverrides: { root: { borderRadius: 8, backgroundColor: 'rgba(37, 99, 235, 0.10)' } } },
    MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: '3px 3px 0 0', background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)' } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', '&.Mui-selected': { color: palette.primary.main } } } },
    MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: '#1a2337', border: '1px solid rgba(37, 99, 235, 0.30)', borderRadius: 8, fontSize: '0.85rem' } } },
    MuiMenu: { styleOverrides: { paper: { background: `linear-gradient(145deg, ${palette.background.paper} 0%, #17223a 100%)`, border: '1px solid rgba(37, 99, 235, 0.22)', borderRadius: 12 } } },
    MuiMenuItem: { styleOverrides: { root: { borderRadius: 8, margin: '4px 8px', transition: 'all 0.2s ease', '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.16)' } } } },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: 'rgba(37, 99, 235, 0.20)' },
        bar: { borderRadius: 4, background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)' },
      },
    },
    MuiCircularProgress: { styleOverrides: { root: { color: palette.primary.main } } },
  },
});

export default theme;
