
import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, TextField, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading: userLoading } = useUser();

  // Remove auto-redirect on login success

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
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#181A20">
      <Box sx={{ position: 'absolute', top: 32, left: 0, right: 0, textAlign: 'center' }}>
        <img src="/logo.png" alt="Logo" style={{ height: 60, marginBottom: 8 }} />
        <Typography variant="h4" fontWeight={900} color="primary" sx={{ letterSpacing: 1, mb: 1 }}>
          INTERSPACE <span style={{ color: '#fff', fontWeight: 700 }}>BROKER</span>
        </Typography>
      </Box>
      <Card sx={{ p: 4, borderRadius: 4, boxShadow: 6, minWidth: 340, maxWidth: 420, width: '100%', bgcolor: '#10131A' }}>
        <form onSubmit={handleLogin}>
          <Typography variant="h5" fontWeight={900} color="primary" sx={{ mb: 1 }}>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to start trading crypto, forex and stocks.
          </Typography>
          <TextField
            label="Email or Username"
            type="email"
            fullWidth
            sx={{ mb: 2, bgcolor: '#181A20', borderRadius: 2 }}
            value={email}
            onChange={e => setEmail(e.target.value)}
            InputProps={{
              style: { color: '#fff' },
            }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            sx={{ mb: 2, bgcolor: '#181A20', borderRadius: 2 }}
            value={password}
            onChange={e => setPassword(e.target.value)}
            InputProps={{
              style: { color: '#fff' },
            }}
          />
          <Button variant="contained" color="primary" fullWidth size="large" type="submit" sx={{ fontWeight: 700, bgcolor: '#0090FF', borderRadius: 2, mt: 1 }} disabled={loading || userLoading}>
            {(loading || userLoading) ? 'Signing in...' : 'Sign In'}
          </Button>
          <Box sx={{ mt: 2, textAlign: 'left' }}>
            <Link to="/forgot-password" style={{ color: '#0090FF', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
          </Box>
          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center', fontWeight: 600 }}>{error}</Typography>
          )}
          {success && (
            <Typography color="primary" sx={{ mt: 2, textAlign: 'center', fontWeight: 600 }}>{success}</Typography>
          )}
          <Typography sx={{ mt: 2, textAlign: 'center', color: '#fff' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 700 }}>
              Register
            </Link>
          </Typography>
        </form>
      </Card>
    </Box>
  );
}
