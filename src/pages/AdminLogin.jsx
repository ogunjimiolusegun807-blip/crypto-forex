import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
  const res = await adminAPI.login({ email, password });
      if (res.success) {
        localStorage.setItem('adminToken', res.token);
        navigate('/admin/dashboard');
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#232742', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ maxWidth: 400, mx: 'auto', p: 3, bgcolor: '#232742', color: '#fff', boxShadow: 6, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" color="primary" fontWeight={700} gutterBottom align="center">
            Admin Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              sx={{ mb: 2, bgcolor: '#232742', input: { color: '#fff' }, label: { color: 'rgba(255,255,255,0.7)' } }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              sx={{ mb: 2, bgcolor: '#232742', input: { color: '#fff' }, label: { color: 'rgba(255,255,255,0.7)' } }}
              InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ py: 1.5, fontWeight: 600 }}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
