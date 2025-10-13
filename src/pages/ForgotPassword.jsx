import React, { useState } from 'react';
import { Box, Card, Typography, TextField, Button, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      await userAPI.requestPasswordReset(email);
      setSuccess('A password reset link has been sent to your email.');
    } catch (err) {
      setError(err?.message || 'Failed to send reset link.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, sm: 4, md: 5 }, borderRadius: 5, boxShadow: 8, bgcolor: 'rgba(30,32,40,0.92)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', textAlign: 'center', mb: 3 }}>
          <img src="/LOGO.jpg" alt="Elon Investment Logo" style={{ height: 80, maxWidth: 180, marginBottom: 16, objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 24px rgba(0,0,0,0.18)', background: '#fff' }} />
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: 1.5, mb: 1 }}>Forgot Password</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.92 }}>Enter your email to receive a password reset link.</Typography>
        </Box>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{ mt: 2, mb: 2, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2, input: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: 'text.secondary', fontWeight: 500 } }}
            InputProps={{ sx: { color: '#fff', fontWeight: 500 } }}
          />
          <Button variant="contained" color="primary" fullWidth size="large" type="submit" sx={{ fontWeight: 700, mt: 1.5, borderRadius: 8, fontSize: '1.1rem', boxShadow: 3, py: 1.2, letterSpacing: 1 }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </form>
        <Typography sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
          Remembered your password?{' '}
          <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none', fontWeight: 700 }}>
            Login
          </Link>
        </Typography>
      </Card>
    </Box>
  );
}
