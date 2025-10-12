import { createTheme } from '@mui/material/styles';

export function getAppTheme(mode = 'light') {
  const isLight = mode === 'light';
  return createTheme({
    palette: {
      mode: isLight ? 'light' : 'dark',
      primary: {
        main: isLight ? '#0f6b6b' : '#00bfa5'
      },
      background: {
        default: isLight ? '#f4f7fb' : '#0f1724',
        paper: isLight ? '#ffffff' : '#111827'
      },
      text: {
        primary: isLight ? '#0f1724' : '#e6eef6',
        secondary: isLight ? 'rgba(15,23,36,0.7)' : 'rgba(230,238,246,0.7)'
      }
    },
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', borderRadius: 8 }
        }
      }
    }
  });
}
