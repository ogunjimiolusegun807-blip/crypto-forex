import React, { useState } from 'react';
import { Box, Card, Typography, TextField, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (username.trim() && email.trim() && password.trim()) {
      setLoading(true);
      try {
        const response = await userAPI.register({ username, email, password });
        if (response.token && response.user) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('isAuth', 'true');
          localStorage.setItem('user', JSON.stringify(response.user));
          navigate('/dashboard');
        } else {
          setError(response.error || 'Registration failed');
        }
      } catch (err) {
        // Prefer server error message when available
        const msg = err?.body?.error || err?.message || 'Registration failed';
        setError(msg);
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
        <form onSubmit={handleRegister}>
          <Typography variant="h5" fontWeight={900} color="primary" sx={{ mb: 1 }}>
            Sign Up for Free
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            It's Free to Sign up and only takes a minute.
          </Typography>
          <TextField
            label="Username"
            fullWidth
            sx={{ mb: 2, bgcolor: '#181A20', borderRadius: 2 }}
            value={username}
            onChange={e => setUsername(e.target.value)}
            InputProps={{
              style: { color: '#fff' },
            }}
          />
          <TextField
            label="Email"
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
          <Button variant="contained" color="primary" fullWidth size="large" type="submit" sx={{ fontWeight: 700, bgcolor: '#0090FF', borderRadius: 2, mt: 1 }} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center', fontWeight: 600 }}>{error}</Typography>
          )}
          <Typography sx={{ mt: 2, textAlign: 'center', color: '#fff' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 700 }}>
              Login
            </Link>
          </Typography>
        </form>
      </Card>
    </Box>
  );
}

export default Register;
