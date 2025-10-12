import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, Grid, useTheme, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.adminLogin({ email, password });
      if (res.token) {
        localStorage.setItem('adminToken', res.token);
        navigate('/admin/dashboard');
      } else {
        setError(res.error || res.message || 'Invalid credentials');
        console.error('Admin login error:', res);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Admin login exception:', err);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Grid container spacing={4} sx={{ width: '100%', maxWidth: 1100 }} alignItems="center" justifyContent="center">
        <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center', px: 4 }}>
            <img src="/logo.png" alt="Logo" style={{ height: 84, marginBottom: 12 }} />
            <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: 1 }}>ADMIN</Typography>
            <Typography variant="h6" sx={{ mt: 1, color: 'text.secondary' }}>Secure admin access</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ maxWidth: 480, mx: 'auto', p: { xs: 3, sm: 4 }, bgcolor: 'background.paper', color: 'text.primary', boxShadow: 6, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h5" color="primary" fontWeight={700} gutterBottom align="center">Admin Login</Typography>
              <form onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ sx: { color: 'text.secondary' } }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
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

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ py: 1.5, fontWeight: 700, borderRadius: 6 }}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
