import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Stack,
  useTheme
} from '@mui/material';
import Alert from '@mui/material/Alert';
import {
  TrendingUp,
  TrendingDown,
  Person,
  ContentCopy,
  Stop,
  Settings,
  Star,
  BarChart,
  Email,
  VerifiedUser
} from '@mui/icons-material';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CopyTrading() {
  const { user, loading, error } = useUser();
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [copyAmount, setCopyAmount] = useState('');
  const [riskLevel, setRiskLevel] = useState('medium');
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
    navigate('/account-settings');
  };

  // Mock data for top traders - More realistic live trader data
  const topTraders = [
    {
      id: 1,
      name: 'Michael Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      roi: 187.6,
      followers: 3547,
      winRate: 84,
      totalTrades: 456,
      riskScore: 5.8,
      verified: true,
      rank: 1,
      monthlyReturn: 15.7,
      copiers: 234,
      description: 'Professional crypto trader & DeFi strategist. 7+ years experience.',
      country: 'United States',
      lastTrade: '2 hours ago',
      status: 'Active',
      totalProfit: '+$125,430'
    },
    {
      id: 2,
      name: 'Emma Thompson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      roi: 156.3,
      followers: 2891,
      winRate: 79,
      totalTrades: 378,
      riskScore: 4.2,
      verified: true,
      rank: 2,
      monthlyReturn: 12.9,
      copiers: 187,
      description: 'Forex & commodities expert. Conservative risk approach.',
      country: 'United Kingdom',
      lastTrade: '1 hour ago',
      status: 'Active',
      totalProfit: '+$89,760'
    },
    {
      id: 3,
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      roi: 142.8,
      followers: 2456,
      winRate: 76,
      totalTrades: 289,
      riskScore: 6.5,
      verified: true,
      rank: 3,
      monthlyReturn: 11.4,
      copiers: 156,
      description: 'Algorithmic trading specialist. Focus on BTC & ETH pairs.',
      country: 'Singapore',
      lastTrade: '3 hours ago',
      status: 'Active',
      totalProfit: '+$67,920'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      roi: 134.7,
      followers: 2198,
      winRate: 73,
      totalTrades: 324,
      riskScore: 5.1,
      verified: true,
      rank: 4,
      monthlyReturn: 10.8,
      copiers: 132,
      description: 'Multi-asset trader. Specializes in swing trading strategies.',
      country: 'Australia',
      lastTrade: '45 minutes ago',
      status: 'Active',
      totalProfit: '+$54,680'
    },
    {
      id: 5,
      name: 'Carlos Mendoza',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      roi: 128.9,
      followers: 1876,
      winRate: 71,
      totalTrades: 267,
      riskScore: 6.8,
      verified: true,
      rank: 5,
      monthlyReturn: 9.7,
      copiers: 98,
      description: 'High-frequency trader. Latin American markets specialist.',
      country: 'Mexico',
      lastTrade: '30 minutes ago',
      status: 'Active',
      totalProfit: '+$43,210'
    },
    {
      id: 6,
      name: 'Yuki Tanaka',
      avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      roi: 119.4,
      followers: 1654,
      winRate: 68,
      totalTrades: 195,
      riskScore: 7.2,
      verified: false,
      rank: 6,
      monthlyReturn: 8.9,
      copiers: 76,
      description: 'Japanese market expert. Focus on technical analysis.',
      country: 'Japan',
      lastTrade: '1 hour ago',
      status: 'Active',
      totalProfit: '+$38,540'
    }
  ];

  // Mock data for copied traders - Updated with real profile pics
  const copiedTraders = [
    {
      id: 1,
      name: 'Michael Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      amountCopied: 8500,
      profit: 1340,
      profitPercentage: 15.8,
      status: 'active',
      startDate: '2024-01-15',
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      name: 'Emma Thompson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      amountCopied: 5000,
      profit: -320,
      profitPercentage: -6.4,
      status: 'active',
      startDate: '2024-02-01',
      lastActivity: '1 hour ago'
    },
    {
      id: 3,
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      amountCopied: 3200,
      profit: 485,
      profitPercentage: 15.2,
      status: 'active',
      startDate: '2024-03-10',
      lastActivity: '3 hours ago'
    }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCopyTrader = (trader) => {
    setSelectedTrader(trader);
    setCopyDialogOpen(true);
  };

  const handleConfirmCopy = () => {
    // Here you would implement the actual copy logic
    console.log('Copying trader:', selectedTrader, 'Amount:', copyAmount, 'Risk:', riskLevel);
    setCopyDialogOpen(false);
    setCopyAmount('');
    setRiskLevel('medium');
  };

  const handleStopCopy = (traderId) => {
    // Here you would implement stop copying logic
    console.log('Stopping copy for trader:', traderId);
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
    <Box sx={{ p: { xs: 1, sm: 3 }, minHeight: '100vh' }}>
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

      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Copy Trading
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Follow and copy successful traders automatically
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="Top Traders" />
          <Tab label="My Copied Traders" />
          <Tab label="Performance" />
        </Tabs>
      </Box>

      {/* Top Traders Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {topTraders.map((trader) => (
            <Grid item xs={12} sm={6} md={6} lg={4} key={trader.id}>
              <Card sx={{ 
                height: '100%', 
                position: 'relative',
                background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
                color: '#fff',
                borderRadius: 3,
                boxShadow: 6,
                transition: 'transform 0.2s, boxShadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 12
                }
              }}>
                <CardContent>
                  {trader.verified && (
                    <Chip
                      icon={<Star />}
                      label="Verified"
                      size="small"
                      color="primary"
                      sx={{ position: 'absolute', top: 16, right: 16 }}
                    />
                  )}
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar 
                      src={trader.avatar} 
                      sx={{ 
                        mr: 2, 
                        width: 64, 
                        height: 64, 
                        bgcolor: 'primary.main',
                        border: '3px solid',
                        borderColor: trader.status === 'Active' ? 'success.main' : 'grey.500'
                      }}
                    >
                      <Person />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold" color="#fff">
                        {trader.name}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        Rank #{trader.rank} • {trader.country}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <Box 
                          width={8} 
                          height={8} 
                          borderRadius="50%" 
                          bgcolor="success.main" 
                          mr={1}
                        />
                        <Typography variant="caption" color="success.main" fontWeight="bold">
                          {trader.lastTrade}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mb: 2 }}>
                    {trader.description}
                  </Typography>

                  <Box sx={{ mb: 2, p: 1.5, bgcolor: 'rgba(0,179,134,0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" color="success.main" fontWeight="bold" textAlign="center">
                      Total Profit: {trader.totalProfit}
                    </Typography>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                          {trader.roi}%
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">
                          Total ROI
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight="bold" color="#fff">
                          {trader.winRate}%
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">
                          Win Rate
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="body2" fontWeight="bold" color="#fff">
                          {trader.followers}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">
                          Followers
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="body2" fontWeight="bold" color="#fff">
                          {trader.copiers}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">
                          Copiers
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="body2" fontWeight="bold" color="#fff">
                          {trader.totalTrades}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">
                          Trades
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">Risk Score</Typography>
                      <Typography variant="body2" fontWeight="bold" color="#fff">
                        {trader.riskScore}/10
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={trader.riskScore * 10}
                      color={trader.riskScore <= 4 ? 'success' : trader.riskScore <= 7 ? 'warning' : 'error'}
                      sx={{ borderRadius: 1, height: 6 }}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<ContentCopy />}
                    onClick={() => handleCopyTrader(trader)}
                    sx={{ 
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: 3,
                      background: 'linear-gradient(45deg, #00B386 30%, #00E5A0 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #009970 30%, #00CC8F 90%)',
                      }
                    }}
                  >
                    Copy Trader
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* My Copied Traders Tab */}
      <TabPanel value={tabValue} index={1}>
        {copiedTraders.length > 0 ? (
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 3, 
              boxShadow: 6,
              background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
              overflow: 'auto'
            }}
          >
            <Table sx={{ '& .MuiTableCell-root': { color: '#fff', borderColor: 'rgba(255,255,255,0.1)' } }}>
              <TableHead>
                <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 700, bgcolor: 'rgba(255,255,255,0.05)' } }}>
                  <TableCell>Trader</TableCell>
                  <TableCell align="right">Amount Copied</TableCell>
                  <TableCell align="right">Profit/Loss</TableCell>
                  <TableCell align="right">Return %</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Last Activity</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {copiedTraders.map((trader) => (
                  <TableRow key={trader.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          src={trader.avatar} 
                          sx={{ 
                            mr: 2, 
                            width: 40, 
                            height: 40, 
                            bgcolor: 'primary.main',
                            border: '2px solid #00B386'
                          }}
                        >
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography color="#fff" fontWeight={600}>
                            {trader.name}
                          </Typography>
                          <Typography variant="caption" color="rgba(255,255,255,0.6)">
                            Started: {trader.startDate}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="#fff" fontWeight={600}>
                        ${trader.amountCopied.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        color={trader.profit >= 0 ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        ${trader.profit >= 0 ? '+' : ''}{trader.profit.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        {trader.profitPercentage >= 0 ? (
                          <TrendingUp color="success" sx={{ mr: 0.5 }} />
                        ) : (
                          <TrendingDown color="error" sx={{ mr: 0.5 }} />
                        )}
                        <Typography
                          color={trader.profitPercentage >= 0 ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {trader.profitPercentage >= 0 ? '+' : ''}{trader.profitPercentage}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={trader.status}
                        color={trader.status === 'active' ? 'success' : 'default'}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          '& .MuiChip-label': { color: '#fff' }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography color="success.main" fontWeight={600} variant="body2">
                        {trader.lastActivity}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => handleStopCopy(trader.id)}
                        title="Stop Copying"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <Stop />
                      </IconButton>
                      <IconButton color="primary" title="Settings" size="small">
                        <Settings />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Card sx={{ 
            background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
            borderRadius: 3,
            boxShadow: 6
          }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="rgba(255,255,255,0.8)" gutterBottom>
                No Copied Traders Yet
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.6)" sx={{ mb: 3 }}>
                Start copying successful traders to see them here
              </Typography>
              <Button variant="contained" onClick={() => setTabValue(0)} sx={{ borderRadius: 2 }}>
                Browse Top Traders
              </Button>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      {/* Performance Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
              borderRadius: 3,
              boxShadow: 6,
              color: '#fff',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <BarChart color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  +$440
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  Total Profit
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
              borderRadius: 3,
              boxShadow: 6,
              color: '#fff',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="primary">
                  4.2%
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  Average Return
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
              borderRadius: 3,
              boxShadow: 6,
              color: '#fff',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ContentCopy color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="#fff">
                  2
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  Active Copies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
              borderRadius: 3,
              boxShadow: 6,
              color: '#fff',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Person color="primary" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="#fff">
                  $8,000
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  Total Invested
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Copy Trader Dialog */}
      <Dialog 
        open={copyDialogOpen} 
        onClose={() => setCopyDialogOpen(false)} 
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ContentCopy color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Copy {selectedTrader?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Amount to Copy"
              type="number"
              value={copyAmount}
              onChange={(e) => setCopyAmount(e.target.value)}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiOutlinedInput-input': {
                  color: '#fff',
                },
              }}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, color: '#fff' }}>$</Typography>
              }}
            />
            
            <FormControl 
              fullWidth 
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiSelect-select': {
                  color: '#fff',
                },
              }}
            >
              <InputLabel>Risk Level</InputLabel>
              <Select
                value={riskLevel}
                label="Risk Level"
                onChange={(e) => setRiskLevel(e.target.value)}
              >
                <MenuItem value="low">Low Risk</MenuItem>
                <MenuItem value="medium">Medium Risk</MenuItem>
                <MenuItem value="high">High Risk</MenuItem>
              </Select>
            </FormControl>

            {selectedTrader && (
              <Card 
                variant="outlined" 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                  borderRadius: 2
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom color="#fff" fontWeight="bold">
                    Trader Performance
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">Total ROI</Typography>
                      <Typography variant="h6" color="success.main" fontWeight="bold">
                        {selectedTrader.roi}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">Win Rate</Typography>
                      <Typography variant="h6" color="#fff" fontWeight="bold">
                        {selectedTrader.winRate}%
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
          <Button onClick={() => setCopyDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmCopy}
            variant="contained"
            disabled={!copyAmount}
            sx={{ 
              borderRadius: 2,
              fontWeight: 700
            }}
          >
            Start Copying
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
