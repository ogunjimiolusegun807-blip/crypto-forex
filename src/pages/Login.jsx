
import React, { useState } from 'react';
import { Box, Card, Typography, TextField, Button, useTheme, IconButton, InputAdornment, Grid } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading: userLoading } = useUser();

  const theme = useTheme();
  // Remove auto-redirect on login success
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (email.trim() && password.trim()) {
      setLoading(true);
      try {
        await login({ email, password });
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } catch (err) {
        setError(err?.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please fill in all fields');
    }
  };
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Grid container spacing={0} sx={{ width: '100%', maxWidth: 900, minHeight: { xs: '100vh', sm: '80vh', md: '80vh' }, boxShadow: { md: 6 }, borderRadius: { md: 4 }, overflow: 'hidden', bgcolor: 'background.paper' }} alignItems="stretch" justifyContent="center">
        {/* Left: hero / brand (tablet & desktop) */}
        <Grid item xs={12} sm={5} md={5} sx={{ display: { xs: 'none', sm: 'block' }, bgcolor: 'background.paper', p: { sm: 4, md: 6 }, borderRight: { sm: '1px solid #222' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <img src="/logo.png" alt="Logo" style={{ height: 72, marginBottom: 16 }} />
            <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: 1.2, fontSize: { sm: '2rem', md: '2.5rem' } }}>INTERSPACE</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { sm: '1.1rem', md: '1.3rem' } }}>BROKER</Typography>
            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', maxWidth: 320, mx: 'auto', fontSize: { sm: '0.95rem', md: '1rem' } }}>Securely trade crypto, forex and stocks with institutional grade tools and fast execution.</Typography>
          </Box>
        </Grid>

        {/* Right: form */}
        <Grid item xs={12} sm={7} md={7} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 4, md: 6 } }}>
          <Card sx={{ width: '100%', maxWidth: 400, mx: 'auto', p: { xs: 3, sm: 4 }, borderRadius: 3, boxShadow: { xs: 3, sm: 6 }, bgcolor: 'background.paper' }}>
            <form onSubmit={handleLogin}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: 2 }}>
                <img src="/logo.png" alt="Logo" style={{ height: 56, marginBottom: 8 }} />
                <Typography variant="h5" fontWeight={900} color="primary">Sign In</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Sign in to start trading crypto, forex and stocks.</Typography>
              </Box>

              <TextField
                label="Email or Username"
                type="email"
                fullWidth
                value={email}
                onChange={e => setEmail(e.target.value)}
                sx={{ mt: 2, mb: 2 }}
                InputLabelProps={{ sx: { color: 'text.secondary' } }}
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={password}
                onChange={e => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputLabelProps={{ sx: { color: 'text.secondary' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(s => !s)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button variant="contained" color="primary" fullWidth size="large" type="submit" sx={{ fontWeight: 700, mt: 1, borderRadius: 6 }} disabled={loading || userLoading}>
                {(loading || userLoading) ? 'Signing in...' : 'SIGN IN'}
              </Button>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Link to="/forgot-password" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
                </Box>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {/* Language selector placeholder - keep accessible area */}
                  <Button size="small" variant="outlined">EN</Button>
                </Box>
              </Box>

              {error && (
                <Typography color="error" sx={{ mt: 2, textAlign: 'center', fontWeight: 600 }}>{error}</Typography>
              )}
              {success && (
                <Typography color="primary" sx={{ mt: 2, textAlign: 'center', fontWeight: 600 }}>{success}</Typography>
              )}

              <Typography sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 700 }}>
                  Register
                </Link>
              </Typography>
            </form>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
