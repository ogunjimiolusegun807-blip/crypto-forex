
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
      <Card sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, sm: 4, md: 5 }, borderRadius: 5, boxShadow: 8, bgcolor: 'rgba(30,32,40,0.92)', backdropFilter: 'blur(12px)', border: '2px solid rgba(255,255,255,0.12)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', textAlign: 'center', mb: 3 }}>
          <img src="/logo.png" alt="Logo" style={{ height: 72, marginBottom: 18, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }} />
          <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: 1.5, fontSize: { xs: '2rem', sm: '2.2rem', md: '2.7rem' }, textShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>Elon Investment</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.4rem' }, letterSpacing: 1, mb: 1 }}>Company Login</Typography>
          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', maxWidth: 320, mx: 'auto', fontSize: { xs: '0.95rem', sm: '1rem', md: '1.08rem' }, fontWeight: 500, opacity: 0.92 }}>Sign in to securely trade crypto, forex and stocks with institutional grade tools and fast execution.</Typography>
        </Box>
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight={900} color="primary" sx={{ letterSpacing: 1, fontSize: '1.45rem', mb: 0.5 }}>Sign In</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500, opacity: 0.92 }}>Sign in to start trading crypto, forex and stocks.</Typography>
          </Box>
          <TextField
            label="Email or Username"
            type="email"
            fullWidth
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{ mt: 2, mb: 2, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2, input: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: 'text.secondary', fontWeight: 500 } }}
            InputProps={{ sx: { color: '#fff', fontWeight: 500 } }}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={e => setPassword(e.target.value)}
            sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2, input: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: 'text.secondary', fontWeight: 500 } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(s => !s)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { color: '#fff', fontWeight: 500 }
            }}
          />
          <Button variant="contained" color="primary" fullWidth size="large" type="submit" sx={{ fontWeight: 700, mt: 1.5, borderRadius: 8, fontSize: '1.1rem', boxShadow: 3, py: 1.2, letterSpacing: 1 }} disabled={loading || userLoading}>
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
    </Box>
  );
}
