import React, { useState } from 'react';
import {
  Box, Card, CardContent, Grid, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, FormHelperText
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';

function Register() {
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    gender: '',
    country: '',
    password: '',
    confirmPassword: '',
    accountType: '',
    captcha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const countries = ['United States','United Kingdom','Nigeria','Ghana','South Africa','Kenya','Canada','Australia','Germany','France','Japan','China','Afghanistan'];
  const accountTypes = ['Standard', 'Premium', 'VIP'];

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required';
    if (!form.username.trim()) return 'Username is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Enter a valid email';
    if (!form.phone.trim()) return 'Phone is required';
    if (!form.password) return 'Password is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleChange = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      // Send extended profile fields to backend
      const payload = { ...form };
      const res = await userAPI.register(payload);
      if (res && res.token) {
        localStorage.setItem('authToken', res.token);
        localStorage.setItem('user', JSON.stringify(res.user || {}));
        setSuccess('Registration successful — redirecting...');
        setTimeout(() => navigate('/dashboard'), 1100);
      } else {
        setError(res.error || res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err?.body?.error || err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Card sx={{ maxWidth: 1100, width: '100%', borderRadius: 3, boxShadow: 6, overflow: 'hidden' }}>
        <Grid container>
          <Grid item xs={12} md={5} sx={{ bgcolor: 'background.paper', p: { xs: 3, md: 6 }, display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ textAlign: 'center' }}>
              <img src="/logo.png" alt="Logo" style={{ height: 84, marginBottom: 12 }} />
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>Sign Up for Free</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>It's Free to Sign up and only takes a minute.</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={7} sx={{ p: { xs: 3, md: 6 } }}>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Full Name" value={form.fullName} onChange={handleChange('fullName')} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Username" value={form.username} onChange={handleChange('username')} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email" type="email" value={form.email} onChange={handleChange('email')} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Phone" value={form.phone} onChange={handleChange('phone')} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select value={form.gender} label="Gender" onChange={handleChange('gender')}>
                        <MenuItem value="">Select Gender</MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Country</InputLabel>
                      <Select value={form.country} label="Country" onChange={handleChange('country')}>
                        {countries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Password" type="password" value={form.password} onChange={handleChange('password')} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Confirm Password" type="password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} />
                  </Grid>

                  <Grid item xs={8} sm={6}>
                    <TextField fullWidth label="Enter Captcha" value={form.captcha} onChange={handleChange('captcha')} />
                  </Grid>
                  <Grid item xs={4} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ bgcolor: 'rgba(0,0,0,0.05)', px: 2, py: 1, borderRadius: 1 }}>5F9C3E</Box>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Account Type</InputLabel>
                      <Select value={form.accountType} label="Account Type" onChange={handleChange('accountType')}>
                        {accountTypes.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button variant="contained" color="primary" fullWidth size="large" type="submit" disabled={loading} sx={{ borderRadius: 6 }}>
                      {loading ? 'Registering...' : 'Register'}
                    </Button>
                  </Grid>

                  {error && (
                    <Grid item xs={12}><Typography color="error" sx={{ mt: 1 }}>{error}</Typography></Grid>
                  )}
                  {success && (
                    <Grid item xs={12}><Typography color="primary" sx={{ mt: 1 }}>{success}</Typography></Grid>
                  )}

                  <Grid item xs={12}>
                    <Typography sx={{ mt: 2, textAlign: 'center' }}>Already have an account? <Link to="/login">Login</Link></Typography>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

export default Register;
