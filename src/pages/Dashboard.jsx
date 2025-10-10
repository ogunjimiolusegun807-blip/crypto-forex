import React from 'react';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Alert } from '@mui/material';
import { Typography, Box, Grid, Card, useTheme, Avatar, Button, Stack, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import HistoryIcon from '@mui/icons-material/History';
import GroupIcon from '@mui/icons-material/Group';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useUser } from '../contexts/UserContext';

export default function Dashboard() {
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
  const theme = useTheme();
  const { user, loading } = useUser();
  // Use real user data if available
  const userStats = {
    totalBalance: user?.totalBalance || 0,
    profit: user?.profit || 0,
    totalBonus: user?.totalBonus || 0,
    accountStatus: user?.accountStatus || 'active',
    totalTrades: user?.totalTrades || 0,
    openTrades: user?.openTrades || 0,
    closedTrades: user?.closedTrades || 0,
    winLossRatio: user?.winLossRatio || 0
  };
  const tickerData = [
    { label: 'BTC/USDT', value: '$38,500', change: '+1.2%', color: '#4caf50' },
    { label: 'ETH/USDT', value: '$2,450', change: '-0.6%', color: '#f44336' },
    { label: 'BNB/USDT', value: '$310', change: '+0.4%', color: '#4caf50' },
    { label: 'SOL/USDT', value: '$105', change: '+2.1%', color: '#4caf50' },
    { label: 'XRP/USDT', value: '$0.62', change: '-0.3%', color: '#f44336' }
  ];
  const cardGradient = 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)';
  const topCards = [
    { label: 'Total Balance', value: `$${userStats.totalBalance.toLocaleString()}`, icon: <AccountBalanceWalletIcon />, gradient: cardGradient },
    { label: 'Profit', value: `$${userStats.profit.toLocaleString()}`, icon: <ShowChartIcon />, gradient: cardGradient },
    { label: 'Total Bonus', value: `$${userStats.totalBonus.toLocaleString()}`, icon: <GroupIcon />, gradient: cardGradient },
    { label: 'Account Status', value: userStats.accountStatus.toUpperCase(), icon: <VerifiedUserIcon />, gradient: cardGradient, chip: true }
  ];
  const bottomCards = [
    { label: 'Total Trades', value: userStats.totalTrades.toString(), icon: <ShowChartIcon />, gradient: cardGradient },
    { label: 'Open Trades', value: userStats.openTrades.toString(), icon: <FolderOpenIcon />, gradient: cardGradient },
    { label: 'Closed Trades', value: userStats.closedTrades.toString(), icon: <HistoryIcon />, gradient: cardGradient },
    { label: 'Win/Loss Ratio', value: `${(userStats.winLossRatio * 100).toFixed(1)}%`, icon: <EmojiEventsIcon />, gradient: cardGradient }
  ];
  if (loading) {
    return <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.background.default }}><Typography variant="h6">Loading dashboard...</Typography></Box>;
  }
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      {/* Header with site name, username and quick actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, bgcolor: '#232742', p: { xs: 1.5, sm: 2, md: 2.5 }, borderRadius: 3, boxShadow: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2, md: 0 }, minHeight: { xs: 'auto', sm: 80 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5, md: 2 }, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 36, sm: 42, md: 48 }, height: { xs: 36, sm: 42, md: 48 }, flexShrink: 0 }}>
            <PersonIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.8rem' } }} />
          </Avatar>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h5" fontWeight={900} color={theme.palette.primary.main} sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }, lineHeight: 1.2 }}>Elon Investment Broker</Typography>
            <Typography variant="h6" fontWeight={700} color="#fff" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.25rem' }, lineHeight: 1.2, mt: 0.25 }}>Username: <span style={{ color: theme.palette.primary.main }}>{user?.username || user?.name || 'User'}</span></Typography>
          </Box>
        </Box>
        <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 1, sm: 1.5, md: 2 }} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'center', sm: 'flex-end' }, flexWrap: 'wrap', gap: { xs: 1, sm: 1.5 } }}>
          <Chip
            icon={<VerifiedUserIcon />}
            label={getAccountStatus().label}
            color={getAccountStatus().color}
            variant="outlined"
            size="small"
            sx={{ height: { xs: 28, sm: 32 }, fontWeight: 600, ml: 1 }}
          />
          <Button variant="contained" color="primary" startIcon={<EmailIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />} size="small" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, height: { xs: 32, sm: 36 }, px: { xs: 1.5, sm: 2, md: 3 }, fontWeight: 600, minWidth: { xs: 'auto', sm: 80 }, whiteSpace: 'nowrap' }}>Mail Us</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EmailIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />}
            size="small"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, height: { xs: 32, sm: 36 }, px: { xs: 1.5, sm: 2, md: 3 }, fontWeight: 600, minWidth: { xs: 'auto', sm: 80 }, whiteSpace: 'nowrap' }}
            onClick={handleMailUsClick}
          >
            Mail Us
          </Button>
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
          <Button variant="contained" color="secondary" startIcon={<SettingsIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />} size="small" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, height: { xs: 32, sm: 36 }, px: { xs: 1.5, sm: 2, md: 3 }, fontWeight: 600, minWidth: { xs: 'auto', sm: 80 }, whiteSpace: 'nowrap' }}>Settings</Button>
        </Stack>
      </Box>
      {/* Ticker Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2, md: 3 }, bgcolor: '#181A20', p: { xs: 1, sm: 1.5 }, borderRadius: 2, mb: 3, overflowX: 'auto', boxShadow: 1 }}>
        {tickerData.map((item, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, minWidth: { xs: 140, sm: 160, md: 180 }, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' }, py: { xs: 0.5, sm: 0 }, px: { xs: 1, sm: 0 } }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8125rem' } }}>{item.label}</Typography>
            <Typography variant="body1" color="#fff" fontWeight={700} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' } }}>{item.value}</Typography>
            <Typography variant="body2" color={item.color} fontWeight={700} sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}>{item.change}</Typography>
          </Box>
        ))}
      </Box>
      {/* Dashboard Cards - Top Row */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 0.5 }}>
        {topCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card sx={{ borderRadius: 3, boxShadow: 6, background: card.gradient, color: '#fff', minHeight: { xs: 110, sm: 120, md: 130 }, display: 'flex', alignItems: 'center', px: { xs: 2, sm: 2.5, md: 3 }, py: { xs: 2, sm: 2.5, md: 3 }, position: 'relative', overflow: 'hidden', transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', '&:hover': { transform: { xs: 'none', sm: 'translateY(-2px)' }, boxShadow: { xs: 6, sm: 8 } } }}>
              <Box sx={{ mr: { xs: 1.5, sm: 2, md: 2.5 }, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' }, lineHeight: 1.2, mb: 0.5 }}>{card.value}</Typography>
                <Typography variant="subtitle2" fontWeight={500} sx={{ color: '#fff', opacity: 0.9, fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' }, lineHeight: 1.2 }}>{card.label}</Typography>
                {card.chip && (<Box sx={{ mt: 1 }}><Chip label="ACTIVE" color="success" size="small" sx={{ bgcolor: '#fff', color: '#4caf50', fontWeight: 700, height: { xs: 22, sm: 24 }, fontSize: { xs: '0.65rem', sm: '0.75rem' }, '& .MuiChip-label': { px: { xs: 1, sm: 1.5 } } }} /></Box>)}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Dashboard Cards - Bottom Row */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        {bottomCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card sx={{ borderRadius: 3, boxShadow: 6, background: card.gradient, color: '#fff', minHeight: { xs: 110, sm: 120, md: 130 }, display: 'flex', alignItems: 'center', px: { xs: 2, sm: 2.5, md: 3 }, py: { xs: 2, sm: 2.5, md: 3 }, position: 'relative', overflow: 'hidden', transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', '&:hover': { transform: { xs: 'none', sm: 'translateY(-2px)' }, boxShadow: { xs: 6, sm: 8 } } }}>
              <Box sx={{ mr: { xs: 1.5, sm: 2, md: 2.5 }, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' }, lineHeight: 1.2, mb: 0.5 }}>{card.value}</Typography>
                <Typography variant="subtitle2" fontWeight={500} sx={{ color: '#fff', opacity: 0.9, fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' }, lineHeight: 1.2 }}>{card.label}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
        {/* Three vertical live charts */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', width: '100%', mt: 4 }}>
          {/* Crypto Trading Chart */}
          <Box sx={{ width: '100%', maxWidth: 900, mb: 2 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2, textAlign: 'center', color: theme.palette.primary.main }}>
              Live Crypto Trading Chart
            </Typography>
            <Box sx={{ borderRadius: 3, boxShadow: 6, overflow: 'hidden', bgcolor: '#232742' }}>
              <iframe
                title="Crypto Trading Chart"
                src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_crypto&symbol=BINANCE:BTCUSDT&interval=1&theme=dark&style=1&locale=en&toolbarbg=232742&studies=[]&hideideas=1"
                width="100%"
                height="400"
                frameBorder="0"
                scrolling="no"
                style={{ borderRadius: 8, minHeight: 320 }}
              />
            </Box>
          </Box>
          {/* Forex Trading Chart */}
          <Box sx={{ width: '100%', maxWidth: 900, mb: 2 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2, textAlign: 'center', color: theme.palette.primary.main }}>
              Live Forex Trading Chart
            </Typography>
            <Box sx={{ borderRadius: 3, boxShadow: 6, overflow: 'hidden', bgcolor: '#232742' }}>
              <iframe
                title="Forex Trading Chart"
                src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_forex&symbol=OANDA:EURUSD&interval=1&theme=dark&style=1&locale=en&toolbarbg=232742&studies=[]&hideideas=1"
                width="100%"
                height="400"
                frameBorder="0"
                scrolling="no"
                style={{ borderRadius: 8, minHeight: 320 }}
              />
            </Box>
          </Box>
          {/* Stock Market Data Chart */}
          <Box sx={{ width: '100%', maxWidth: 900, mb: 2 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2, textAlign: 'center', color: theme.palette.primary.main }}>
              Live Stock Market Data Chart
            </Typography>
            <Box sx={{ borderRadius: 3, boxShadow: 6, overflow: 'hidden', bgcolor: '#232742' }}>
              <iframe
                title="Stock Market Data Chart"
                src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_stock&symbol=NASDAQ:AAPL&interval=1&theme=dark&style=1&locale=en&toolbarbg=232742&studies=[]&hideideas=1"
                width="100%"
                height="400"
                frameBorder="0"
                scrolling="no"
                style={{ borderRadius: 8, minHeight: 320 }}
              />
            </Box>
          </Box>
        </Box>
    </Box>
  );
}
