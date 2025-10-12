import { createTheme } from '@mui/material/styles';

export function getAppTheme(mode = 'light') {
  const isLight = mode === 'light';
  return createTheme({
    palette: {
      mode: isLight ? 'light' : 'dark',
      primary: {
        // professional teal for primary actions
        main: isLight ? '#0b7a78' : '#14b8a6'
      },
      secondary: {
        main: isLight ? '#145a8a' : '#60a5fa'
      },
      success: { main: '#16a34a' },
      error: { main: '#ef4444' },
      warning: { main: '#f59e0b' },
      background: {
        // subtle, neutral backgrounds for professional look
        default: isLight ? '#f5f7fa' : '#071022',
        paper: isLight ? '#ffffff' : '#0b1220'
      },
      divider: isLight ? 'rgba(11,122,120,0.12)' : 'rgba(255,255,255,0.06)',
      text: {
        primary: isLight ? '#0b1220' : '#e6f7f2',
        secondary: isLight ? 'rgba(11,18,32,0.7)' : 'rgba(230,247,242,0.75)'
      }
    },
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.5px' },
      h5: { fontWeight: 700 }
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', borderRadius: 8 }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            // ensure cards use paper background and have subtle elevation
            backgroundColor: isLight ? '#ffffff' : '#071827',
            color: isLight ? '#0b1220' : '#e6f7f2'
          }
        }
      }
    }
  });
}
