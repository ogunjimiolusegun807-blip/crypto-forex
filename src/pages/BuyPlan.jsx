import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Stack,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container
} from '@mui/material';
import Alert from '@mui/material/Alert';
import {
  Person,
  Email,
  Settings,
  VerifiedUser,
  Star,
  TrendingUp,
  Schedule,
  AccountBalanceWallet,
  Security,
  Support,
  Language,
  Copyright
} from '@mui/icons-material';

const investmentPlans = [
  {
    id: 1,
    name: 'Bronze Plan',
    type: 'regular',
    roi: '500',
    minAmount: 4000,
    maxAmount: 10000,
    duration: '2 weeks',
    color: '#CD7F32',
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
    features: [
      'Daily ROI of 500%',
      '24/7 Customer Support',
      'Secure Investment',
      'Quick Withdrawal',
      'Investment Protection'
    ]
  },
  {
    id: 2,
    name: 'Gold Plan',
    type: 'VIP',
    roi: '750',
    minAmount: 5200,
    maxAmount: 20000,
    duration: '2 weeks',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    features: [
      'Daily ROI of 750%',
      'VIP Customer Support',
      'Priority Withdrawal',
      'Advanced Security',
      'Dedicated Account Manager',
      'Investment Insurance'
    ]
  },
  {
    id: 3,
    name: 'Platinum Plan',
    type: 'VIP',
    roi: '1200',
    minAmount: 10000,
    maxAmount: 50000000,
    duration: '7 Days',
    color: '#E5E4E2',
    gradient: 'linear-gradient(135deg, #E5E4E2 0%, #C0C0C0 100%)',
    features: [
      'Daily ROI of 1200%',
      'Premium VIP Support',
      'Instant Withdrawal',
      'Maximum Security',
      'Personal Investment Advisor',
      'Full Investment Protection',
      'Exclusive Trading Signals'
    ]
  }
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

export default function BuyPlan() {
  const theme = useTheme();
  const { user, loading, error } = useUser();
  const navigate = useNavigate();
  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [mailDialogOpen, setMailDialogOpen] = useState(false);
  const handleMailUsClick = () => setMailDialogOpen(true);
  const handleMailDialogClose = () => setMailDialogOpen(false);
  // Helper for KYC/account status mapping
  const getAccountStatus = () => {
    if (!user?.kycStatus || user.kycStatus === 'unverified') {
      return { label: 'Inactive', color: 'default' };
    }
    if (user.kycStatus === 'pending') {
      return { label: 'Pending', color: 'warning' };
    }
    if (user.kycStatus === 'verified') {
      return { label: 'Active', color: 'success' };
    }
    return { label: 'Inactive', color: 'default' };
  };
  const navigateToSettings = () => {
    navigate('/dashboard/account-settings');
  };

  const handleInvestClick = (plan) => {
    setSelectedPlan(plan);
    setInvestDialogOpen(true);
  };

  const handleConfirmInvestment = () => {
    // Here you would implement the actual investment logic
    console.log('Investment:', {
      plan: selectedPlan,
      amount: investAmount,
      paymentMethod: paymentMethod
    });
    setInvestDialogOpen(false);
    setInvestAmount('');
    setPaymentMethod('');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="primary" size={48} />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ p: { xs: 1, sm: 3 } }}>
        {/* Header with site name, username and quick actions - Consistent with Dashboard */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 3, 
          bgcolor: '#232742', 
          p: { xs: 1.5, sm: 2, md: 2.5 }, 
          borderRadius: 3, 
          boxShadow: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 2, md: 0 },
          minHeight: { xs: 'auto', sm: 80 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5, md: 2 }, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 36, sm: 42, md: 48 }, height: { xs: 36, sm: 42, md: 48 }, flexShrink: 0 }}>
              <Person sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.8rem' } }} />
            </Avatar>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h5" fontWeight={900} color={theme.palette.primary.main} sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }, lineHeight: 1.2 }}>
                Elon Investment Broker
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#fff" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.25rem' }, lineHeight: 1.2, mt: 0.25 }}>
                Username: <span style={{ color: theme.palette.primary.main }}>{user?.username || user?.name || 'User'}</span>
              </Typography>
            </Box>
          </Box>
          <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 1, sm: 1.5, md: 2 }} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'center', sm: 'flex-end' }, flexWrap: 'wrap', gap: { xs: 1, sm: 1.5 } }}>
            <Chip
              icon={<VerifiedUser />}
              label={getAccountStatus().label}
              color={getAccountStatus().color}
              variant="outlined"
              size="small"
              sx={{ height: { xs: 28, sm: 32 }, fontWeight: 600, ml: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<Email sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />}
              size="small"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, height: { xs: 32, sm: 36 }, px: { xs: 1.5, sm: 2, md: 3 }, fontWeight: 600, minWidth: { xs: 'auto', sm: 80 }, whiteSpace: 'nowrap' }}
              onClick={handleMailUsClick}
            >
              Mail Us
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Settings />}
              size="small"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, height: { xs: 32, sm: 36 }, px: { xs: 1.5, sm: 2, md: 3 }, fontWeight: 600, minWidth: { xs: 'auto', sm: 80 }, whiteSpace: 'nowrap' }}
              onClick={navigateToSettings}
            >
              Settings
            </Button>
          </Stack>
        </Box>
        {/* Mail Us Dialog (local, not external) */}
        <Dialog open={mailDialogOpen} onClose={handleMailDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Contact Elon Investment</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Welcome to Elon Investment Broker. For professional inquiries, support, or updates, please contact our admin team. We are committed to providing timely updates and support for all our users. Any information sent here will be received by our admin and used to keep you informed about your account and platform updates.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: support@elonbroker.com<br />
              Phone: +234-800-000-0000<br />
              Address: 123 Victoria Island, Lagos, Nigeria
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              You can expect prompt responses and regular updates from our admin team.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleMailDialogClose} color="primary" variant="contained">Close</Button>
          </DialogActions>
        </Dialog>

        {/* Page Title */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" gutterBottom fontWeight="bold" color="primary">
            Investment Plans
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Choose from our premium investment plans designed to maximize your returns with guaranteed profits and secure transactions.
          </Typography>
        </Box>

        {/* Investment Plans */}
        <Grid container spacing={3} sx={{ mb: 8, justifyContent: 'center' }}>
          {investmentPlans.map((plan) => (
            <Grid item xs={12} sm={6} lg={4} key={plan.id}>
              <Card sx={{ 
                height: '100%',
                minHeight: 400,
                maxHeight: 650,
                position: 'relative',
                background: plan.gradient,
                color: plan.name === 'Gold Plan' ? '#000' : '#fff',
                borderRadius: 3,
                boxShadow: 6,
                transition: 'transform 0.3s, boxShadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 12
                },
                border: plan.name === 'Gold Plan' ? '2px solid #FFD700' : 'none'
              }}>
                {plan.type === 'VIP' && (
                  <Chip
                    icon={<Star />}
                    label="VIP"
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: 12, 
                      right: 12,
                      bgcolor: '#FF6B6B',
                      color: '#fff',
                      fontWeight: 'bold',
                      zIndex: 1
                    }}
                  />
                )}
                
                <CardContent sx={{ 
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  {/* Plan Header */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 2, opacity: 0.9 }}>
                      {plan.type.toUpperCase()}
                    </Typography>

                    {/* ROI Display */}
                    <Box sx={{ 
                      mb: 3, 
                      p: 2, 
                      bgcolor: 'rgba(0,0,0,0.15)', 
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}>
                      <Typography variant="h2" fontWeight="bold" color="inherit">
                        {plan.roi}%
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        Daily ROI
                      </Typography>
                    </Box>
                  </Box>

                  {/* Plan Details */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1
                    }}>
                      <Typography variant="body2" fontWeight="600">Minimum:</Typography>
                      <Typography variant="body2">${plan.minAmount.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1
                    }}>
                      <Typography variant="body2" fontWeight="600">Maximum:</Typography>
                      <Typography variant="body2">${plan.maxAmount.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2
                    }}>
                      <Typography variant="body2" fontWeight="600">Duration:</Typography>
                      <Typography variant="body2">{plan.duration}</Typography>
                    </Box>
                    
                    {/* Features */}
                    <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                      Key Features:
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <Typography key={index} variant="body2" sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 0.5,
                          fontSize: '0.85rem'
                        }}>
                          <VerifiedUser sx={{ fontSize: 14, mr: 1 }} />
                          {feature}
                        </Typography>
                      ))}
                    </Box>
                  </Box>

                  {/* Invest Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => handleInvestClick(plan)}
                    sx={{ 
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      bgcolor: plan.name === 'Gold Plan' ? '#000' : '#fff',
                      color: plan.name === 'Gold Plan' ? '#FFD700' : plan.color,
                      borderRadius: 2,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      '&:hover': {
                        bgcolor: plan.name === 'Gold Plan' ? '#333' : '#f5f5f5',
                        transform: 'scale(1.02)'
                      }
                    }}
                  >
                    Invest Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Additional Content Section */}
        <Paper sx={{ 
          p: 4, 
          mb: 6,
          background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
          color: '#fff',
          borderRadius: 4
        }}>
          <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center" color="primary">
            Why Choose Elon Investment Broker?
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Security sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Secure & Safe
                </Typography>
                <Typography color="rgba(255,255,255,0.8)">
                  Your investments are protected with bank-level security and insurance coverage.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  High Returns
                </Typography>
                <Typography color="rgba(255,255,255,0.8)">
                  Guaranteed daily returns with our proven investment strategies and market expertise.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Support sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  24/7 Support
                </Typography>
                <Typography color="rgba(255,255,255,0.8)">
                  Round-the-clock customer support to assist you with all your investment needs.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Investment Dialog */}
        <Dialog 
          open={investDialogOpen} 
          onClose={() => setInvestDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
              color: '#fff',
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h5" fontWeight="bold">
              Invest in {selectedPlan?.name}
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            {selectedPlan && (
              <Box>
                <Paper sx={{ 
                  p: 3, 
                  mb: 3,
                  background: selectedPlan.gradient,
                  color: selectedPlan.name === 'Gold Plan' ? '#000' : '#fff'
                }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Plan Details
                  </Typography>
                  <Typography>ROI: {selectedPlan.roi}% Daily</Typography>
                  <Typography>Duration: {selectedPlan.duration}</Typography>
                  <Typography>
                    Range: ${selectedPlan.minAmount.toLocaleString()} - ${selectedPlan.maxAmount.toLocaleString()}
                  </Typography>
                </Paper>

                <TextField
                  fullWidth
                  label="Investment Amount"
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                      '&:hover fieldset': { borderColor: 'primary.main' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiOutlinedInput-input': { color: '#fff' },
                  }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, color: '#fff' }}>$</Typography>
                  }}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                      '& .MuiSelect-select': { color: '#fff' },
                      '& .MuiSvgIcon-root': { color: '#fff' }
                    }}
                  >
                    <MenuItem value="bitcoin">Bitcoin (BTC)</MenuItem>
                    <MenuItem value="ethereum">Ethereum (ETH)</MenuItem>
                    <MenuItem value="usdt">Tether (USDT)</MenuItem>
                    <MenuItem value="bank">Bank Transfer</MenuItem>
                    <MenuItem value="card">Credit/Debit Card</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
            <Button onClick={() => setInvestDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmInvestment}
              variant="contained"
              disabled={!investAmount || !paymentMethod}
              sx={{ fontWeight: 700 }}
            >
              Confirm Investment
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* Footer */}
      <Box sx={{ 
        bgcolor: '#181A20', 
        py: 4, 
        mt: 6,
        borderTop: '1px solid #23272F'
      }}>
        <Container maxWidth="xl">
          {/* Language Selection */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <Language sx={{ mr: 1, verticalAlign: 'middle' }} />
                Language
              </InputLabel>
              <Select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                  '& .MuiSelect-select': { color: '#fff' },
                  '& .MuiSvgIcon-root': { color: '#fff' }
                }}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }} />

          {/* Copyright */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="rgba(255,255,255,0.6)" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Copyright sx={{ fontSize: 16 }} />
              {new Date().getFullYear()} Elon Investment Broker. All rights reserved.
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.5)" sx={{ mt: 1 }}>
              Licensed & Regulated Financial Services Provider
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
