import React from 'react';
import { Typography, Box } from '@mui/material';
import { useUser } from '../contexts/UserContext';

export default function TradingHistory() {
  const { user, loading, error } = useUser();
  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="primary">Loading user data...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }
  return (
    <Box p={3}>
      <Typography variant="h4">Trading History</Typography>
      <Typography>{user?.username ? `Welcome, ${user.username}` : 'This is the trading history page.'}</Typography>
    </Box>
  );
}