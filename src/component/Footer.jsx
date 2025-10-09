import React from 'react';
import { Box, Typography, Link, Stack } from '@mui/material';

export default function Footer() {
  return (
    <Box sx={{ bgcolor: '#232742', color: '#fff', py: 3, mt: 6, textAlign: 'center', boxShadow: 3 }}>
      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 1 }}>
        <Link href="#" color="inherit" underline="hover">Home</Link>
        <Link href="#" color="inherit" underline="hover">About</Link>
        <Link href="#" color="inherit" underline="hover">Contact</Link>
        <Link href="#" color="inherit" underline="hover">Terms</Link>
      </Stack>
      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        &copy; {new Date().getFullYear()} Elon Investment Broker. All rights reserved.
      </Typography>
    </Box>
  );
}
