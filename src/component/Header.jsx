import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

export default function Header() {
  return (
    <AppBar position="static" sx={{ bgcolor: '#232742', boxShadow: 3 }}>
      <Toolbar>
        <Typography variant="h6" fontWeight={900} sx={{ flexGrow: 1, color: 'primary.main', letterSpacing: 1 }}>
          Elon Investment Broker
        </Typography>
        {/* Add navigation or user info here if needed */}
      </Toolbar>
    </AppBar>
  );
}
