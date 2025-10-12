import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { userAPI } from '../services/api';
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
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Person,
  Email,
  Settings,
  VerifiedUser,
  CheckCircle,
  TrendingUp,
  Timeline,
  Speed,
  Security,
  Verified,
  Star,
  Diamond,
  EmojiEvents,
  Rocket,
  AutoGraph,
  Analytics,
  ShowChart,
  AccountBalanceWallet,
  SignalCellularAlt,
  NotificationsActive,
  Support,
  School
} from '@mui/icons-material';

// Signal Plans Data
const signalPlans = [
  {
    id: 1,
    name: "Alpha Signals",
    price: 99,
    description: "Perfect for beginners entering the trading world",
    features: [
      "5-10 signals per day",
      "Basic market analysis",
      "Email notifications",
      "Community access",
      "Mobile app access",
      "Basic support"
    ],
    accuracy: "75%",
    subscribers: "2,847",
    badge: "STARTER",
    badgeColor: "success",
    icon: <SignalCellularAlt />,
    popular: false,
    color: "#4CAF50"
  },
  {
    id: 2,
    name: "Titan Signals",
    price: 149,
    description: "Enhanced signals with detailed market insights",
    features: [
      "10-15 signals per day",
      "Technical analysis reports",
      "SMS & Email alerts",
      "Priority community access",
      "Risk management tips",
      "Live chat support"
    ],
    accuracy: "82%",
    subscribers: "5,234",
    badge: "GROWTH",
    badgeColor: "primary",
    icon: <TrendingUp />,
    popular: false,
    color: "#2196F3"
  },
  {
    id: 3,
    name: "Quantum Edge Signals",
    price: 199,
    description: "Advanced algorithmic signals with AI-powered insights",
    features: [
      "15-20 signals per day",
      "AI-powered analysis",
      "Real-time notifications",
      "VIP community access",
      "Weekly market reports",
      "24/7 priority support"
    ],
    accuracy: "87%",
    subscribers: "8,156",
    badge: "POPULAR",
    badgeColor: "warning",
    icon: <AutoGraph />,
    popular: true,
    color: "#FF9800"
  },
  {
    id: 4,
    name: "Elite Trader Signals",
    price: 249,
    description: "Professional-grade signals for serious traders",
    features: [
      "20-25 signals per day",
      "Advanced market analysis",
      "Multi-asset coverage",
      "Personal account manager",
      "Live trading sessions",
      "Educational webinars"
    ],
    accuracy: "90%",
    subscribers: "3,892",
    badge: "PROFESSIONAL",
    badgeColor: "secondary",
    icon: <Timeline />,
    popular: false,
    color: "#9C27B0"
  },
  {
    id: 5,
    name: "Velocity Pro Signals",
    price: 299,
    description: "High-frequency signals for active traders",
    features: [
      "25-30 signals per day",
      "Scalping opportunities",
      "Instant push notifications",
      "Advanced risk metrics",
      "Portfolio optimization",
      "1-on-1 mentoring sessions"
    ],
    accuracy: "92%",
    subscribers: "2,145",
    badge: "VELOCITY",
    badgeColor: "error",
    icon: <Speed />,
    popular: false,
    color: "#F44336"
  },
  {
    id: 6,
    name: "Apex Master Signals",
    price: 399,
    description: "Master-level signals with institutional-grade analysis",
    features: [
      "30-40 signals per day",
      "Institutional insights",
      "Multi-timeframe analysis",
      "Custom risk parameters",
      "Private Discord channel",
      "Monthly strategy calls"
    ],
    accuracy: "94%",
    subscribers: "1,567",
    badge: "MASTER",
    badgeColor: "info",
    icon: <Diamond />,
    popular: false,
    color: "#00BCD4"
  },
  {
    id: 7,
    name: "Genesis Prime Signals",
    price: 499,
    description: "Prime-tier signals with exclusive market intelligence",
    features: [
      "40-50 signals per day",
      "Exclusive market intelligence",
      "Pre-market analysis",
      "Custom trading strategies",
      "Direct analyst access",
      "Quarterly performance reviews"
    ],
    accuracy: "96%",
    subscribers: "892",
    badge: "PRIME",
    badgeColor: "success",
    icon: <Star />,
    popular: false,
    color: "#4CAF50"
  },
  {
    id: 8,
    name: "Legendary Investor Plan",
    price: 999,
    description: "Ultimate trading signals for professional investors",
    features: [
      "Unlimited signals",
      "Legendary trader insights",
      "Proprietary algorithms",
      "Personal trading coach",
      "Exclusive events access",
      "White-glove service"
    ],
    accuracy: "98%",
    subscribers: "347",
    badge: "LEGENDARY",
    badgeColor: "warning",
    icon: <EmojiEvents />,
    popular: false,
    color: "#FFD700"
  }
];

export default function SubscribeSignals() {
  const { user, loading, error, refreshStats } = useUser();
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscribeDialog, setSubscribeDialog] = useState(false);
  // Use real balance from user context
  const accountBalance = Number(user?.balance || 0);
  const [confirming, setConfirming] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [mailDialogOpen, setMailDialogOpen] = useState(false);
  const [signalsHistory, setSignalsHistory] = useState([]);
  const [notification, setNotification] = useState({ open: false, type: '', message: '' });
  // Fetch user's signal history from backend
  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await userAPI.getSignals(token);
        setSignalsHistory(res.signals || []);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchSignals();
  }, [user]);
  const handleSubscribeSignal = async (plan) => {
    setSelectedPlan(plan);
    setSubscribeDialog(true);
  };

  const handleConfirmSubscribe = async () => {
    try {
      // Check balance before subscribing
      if (accountBalance < selectedPlan.price) {
        setSnackbar({ open: true, message: `Insufficient balance. Please deposit $${(selectedPlan.price - accountBalance).toFixed(2)} and try again.`, severity: 'error' });
        return;
      }
      setConfirming(true);
      const token = localStorage.getItem('authToken');
      const res = await userAPI.subscribeSignal(selectedPlan.id, token);
      if (res && res.success) {
        const updated = { id: user.id, balance: res.balance };
        try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updated })); } catch (e) {}
      }
      setSnackbar({ open: true, message: `Successfully subscribed to ${selectedPlan.name}`, severity: 'success' });
      setSubscribeDialog(false);
      // Refresh signals history
      const signalsRes = await userAPI.getSignals(token);
      setSignalsHistory(signalsRes.signals || []);
      // Deduct price from dashboard balance
      try { await refreshStats(); } catch (e) { if (window.location.pathname.includes('dashboard')) { window.location.reload(); } }
      setConfirming(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Signal subscription failed.', severity: 'error' });
      setConfirming(false);
    }
  };
      {/* Notification Alert */}
      {notification.open && (
        <Alert severity={notification.type} sx={{ mb: 2 }} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      )}
      {/* User's Signal History */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 } }>Your Signal Subscription History</Typography>
        <List>
          {signalsHistory.length === 0 ? (
            <ListItem><ListItemText primary="No signals subscribed yet." /></ListItem>
          ) : (
            signalsHistory.map((signal, idx) => (
              <ListItem key={idx}>
                <ListItemIcon><NotificationsActive /></ListItemIcon>
                <ListItemText primary={`Signal ID: ${signal.signalId}`} secondary={`Date: ${new Date(signal.date).toLocaleString()}`} />
              </ListItem>
            ))
          )}
        </List>
      </Box>
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
    navigate('/account-settings');
  };

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setSubscribeDialog(true);
  };

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
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
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
              Email: Eloninprivateinvestment@outlook.com<br />
              Phone: +14233986204<br />
              Address: Houston, Texas
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              You can expect prompt responses and regular updates from our admin team.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleMailDialogClose} color="primary" variant="contained">Close</Button>
          </DialogActions>
        </Dialog>

        {/* Page Title and Balance */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" gutterBottom fontWeight="bold" color="primary">
            Subscribe to a Signal Plan
          </Typography>
          <Paper sx={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            bgcolor: '#232742',
            color: '#fff',
            borderRadius: 3,
            mb: 2
          }}>
            <AccountBalanceWallet sx={{ color: 'primary.main', fontSize: '2rem' }} />
            <Box>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                Your Balance
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                ${accountBalance.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Signal Plans Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {signalPlans.map((plan) => (
            <Grid item xs={12} sm={6} lg={3} key={plan.id}>
              <Card sx={{ 
                height: '100%',
                bgcolor: '#232742',
                color: '#fff',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: plan.popular ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 40px rgba(0,179,134,0.2)`,
                  border: `2px solid ${theme.palette.primary.main}`
                }
              }}>
                {/* Popular Badge */}
                {plan.popular && (
                  <Box sx={{
                    position: 'absolute',
                    top: -1,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'primary.main',
                    color: '#000',
                    px: 3,
                    py: 0.5,
                    borderRadius: '0 0 12px 12px',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    zIndex: 1
                  }}>
                    MOST POPULAR
                  </Box>
                )}

                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Plan Header */}
                  <Box sx={{ textAlign: 'center', mb: 3, mt: plan.popular ? 2 : 0 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      mb: 2,
                      color: plan.color
                    }}>
                      {React.cloneElement(plan.icon, { sx: { fontSize: '3rem' } })}
                    </Box>
                    
                    <Chip
                      label={plan.badge}
                      color={plan.badgeColor}
                      size="small"
                      sx={{ mb: 2, fontWeight: 'bold' }}
                    />
                    
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {plan.name}
                    </Typography>
                    
                    <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 2 }}>
                      {plan.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        Signal Price
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" color={plan.color}>
                        ${plan.price}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.5)">
                        per month
                      </Typography>
                    </Box>
                  </Box>

                  {/* Plan Stats */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mb: 3,
                    p: 2,
                    bgcolor: 'rgba(0,179,134,0.1)',
                    borderRadius: 2,
                    border: '1px solid rgba(0,179,134,0.3)'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {plan.accuracy}
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.7)">
                        Accuracy
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {plan.subscribers}
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.7)">
                        Subscribers
                      </Typography>
                    </Box>
                  </Box>

                  {/* Features List */}
                  <List sx={{ flex: 1, py: 0 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: 'rgba(255,255,255,0.9)'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Subscribe Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => handleSubscribe(plan)}
                    sx={{
                      mt: 3,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      bgcolor: plan.color,
                      color: '#fff',
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: plan.color,
                        opacity: 0.9,
                        transform: 'scale(1.02)'
                      }
                    }}
                  >
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Additional Information */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              bgcolor: '#232742',
              color: '#fff',
              borderRadius: 3,
              height: '100%'
            }}>
              <Security sx={{ fontSize: '3rem', color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Secure & Reliable
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                Our signals are generated using advanced algorithms and verified by professional traders for maximum reliability.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              bgcolor: '#232742',
              color: '#fff',
              borderRadius: 3,
              height: '100%'
            }}>
              <NotificationsActive sx={{ fontSize: '3rem', color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Real-Time Alerts
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                Get instant notifications via SMS, email, and push notifications. Never miss a trading opportunity again.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              bgcolor: '#232742',
              color: '#fff',
              borderRadius: 3,
              height: '100%'
            }}>
              <Support sx={{ fontSize: '3rem', color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                24/7 Support
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                Our dedicated support team is available around the clock to help you maximize your trading success.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Subscription Confirmation Dialog */}
      <Dialog
        open={subscribeDialog}
        onClose={() => setSubscribeDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: '#232742',
            color: 'white',
            minWidth: { xs: '90vw', sm: 500 }
          }
        }}
      >
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Confirm Subscription
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {selectedPlan.name}
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                ${selectedPlan.price}/month
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedPlan.description}
              </Typography>
              
              {accountBalance < selectedPlan.price ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Insufficient balance. You need ${(selectedPlan.price - accountBalance).toFixed(2)} more to subscribe.
                </Alert>
              ) : (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Your balance is sufficient for this subscription.
                </Alert>
              )}

              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                This subscription will be automatically renewed monthly. You can cancel anytime from your account settings.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSubscribeDialog(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubscribe}
            variant="contained"
            color="primary"
            disabled={accountBalance < (selectedPlan?.price || 0) || confirming}
            autoFocus
          >
            {confirming ? 'Processing...' : 'Confirm Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
