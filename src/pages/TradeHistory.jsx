import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Button,
  Stack,
  useTheme,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Divider,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Person,
  Email,
  Settings,
  VerifiedUser,
  Search,
  FilterList,
  Download,
  Refresh,
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  SwapHoriz,
  CreditCard,
  AttachMoney
} from '@mui/icons-material';


const getTypeIcon = (type) => {
  switch (type) {
    case 'Deposit': return <TrendingUp color="success" />;
    case 'Withdrawal': return <TrendingDown color="error" />;
    case 'Trade': return <SwapHoriz color="primary" />;
    case 'Bonus': return <AttachMoney color="warning" />;
    default: return <AccountBalanceWallet color="info" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Pending': return 'warning';
    case 'Failed': return 'error';
    default: return 'default';
  }
};

import { userAPI } from '../services/api';

export default function TradeHistory() {
  const theme = useTheme();
  const { user, loading, error } = useUser();
  const navigate = useNavigate();
  const [mailDialogOpen, setMailDialogOpen] = useState(false);
  const handleMailUsClick = () => setMailDialogOpen(true);
  const handleMailDialogClose = () => setMailDialogOpen(false);
  // Dynamic KYC/account status mapping
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeHistory, setTradeHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  // Fetch trade history from backend
  useEffect(() => {
    const fetchTradeHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No auth token found');
        const history = await userAPI.getTradeHistory(token);
        setTradeHistory(Array.isArray(history) ? history : []);
      } catch (err) {
        setHistoryError(err.message || 'Failed to fetch trade history');
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchTradeHistory();
    // Listen for trade-history-updated event to auto-refresh
    const handler = () => fetchTradeHistory();
    window.addEventListener('trade-history-updated', handler);
    return () => window.removeEventListener('trade-history-updated', handler);
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter transactions based on search and filters
  const transactions = tradeHistory;
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === '' || transaction.type === filterType;
    const matchesStatus = filterStatus === '' || transaction.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Get current page transactions
  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading || historyLoading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="primary">Loading trade history...</Typography>
      </Box>
    );
  }
  if (error || historyError) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="error">{error || historyError}</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, minHeight: '100vh' }}>
      {/* Header with site name, username and quick actions - matching Dashboard */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 3, 
        bgcolor: '#232742', 
        p: 2, 
        borderRadius: 3, 
        boxShadow: 3,
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 0 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            <Person fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={900} color={theme.palette.primary.main}>
              Elon Investment Broker
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#fff">
              {user?.username ? `Username: ` : ''}
              <span style={{ color: theme.palette.primary.main }}>{user?.username || ''}</span>
            </Typography>
          </Box>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
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
            startIcon={<Email />}
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
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Settings />}
            size="small"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, height: { xs: 32, sm: 36 }, px: { xs: 1.5, sm: 2, md: 3 }, fontWeight: 600, minWidth: { xs: 'auto', sm: 80 }, whiteSpace: 'nowrap' }}
            onClick={() => navigate('/dashboard/account-settings')}
          >
            Settings
          </Button>
        </Stack>
      </Box>

      {/* Page Title and Actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant={{ xs: 'h5', sm: 'h4' }} gutterBottom fontWeight="bold" color="primary">
            Account History
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View your complete transaction and trading history
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button variant="outlined" startIcon={<Refresh />} size="small" fullWidth={{ xs: true, sm: false }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Download />} size="small" fullWidth={{ xs: true, sm: false }}>
            Export
          </Button>
        </Stack>
      </Box>

      {/* Summary Cards - use real user data if available */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
            borderRadius: 3,
            boxShadow: 6,
            color: '#fff'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    ${user?.totalDeposits?.toLocaleString() || '0.00'}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Total Deposits
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
            borderRadius: 3,
            boxShadow: 6,
            color: '#fff'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingDown color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="error.main">
                    ${user?.totalWithdrawals?.toLocaleString() || '0.00'}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Total Withdrawals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
            borderRadius: 3,
            boxShadow: 6,
            color: '#fff'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SwapHoriz color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {user?.totalTrades?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Total Trades
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
            borderRadius: 3,
            boxShadow: 6,
            color: '#fff'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountBalanceWallet color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#fff">
                    ${user?.balance?.toLocaleString() || '0.00'}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Current Balance
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ 
        background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
        borderRadius: 3,
        boxShadow: 6,
        mb: 3
      }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'rgba(255,255,255,0.7)' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  },
                  '& .MuiOutlinedInput-input': { color: '#fff' },
                  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Filter by Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                    '& .MuiSelect-select': { color: '#fff' },
                    '& .MuiSvgIcon-root': { color: '#fff' }
                  }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Deposit">Deposit</MenuItem>
                  <MenuItem value="Withdrawal">Withdrawal</MenuItem>
                  <MenuItem value="Trade">Trade</MenuItem>
                  <MenuItem value="Bonus">Bonus</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                    '& .MuiSelect-select': { color: '#fff' },
                    '& .MuiSvgIcon-root': { color: '#fff' }
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setFilterType('');
                  setFilterStatus('');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card sx={{ 
        background: 'linear-gradient(135deg, #232742 0%, #1a1d2b 100%)',
        borderRadius: 3,
        boxShadow: 6
      }}>
        <TableContainer sx={{ 
          overflowX: 'auto',
          '&::-webkit-scrollbar': { height: 8 },
          '&::-webkit-scrollbar-track': { bgcolor: 'rgba(255,255,255,0.1)' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'primary.main', borderRadius: 4 }
        }}>
          <Table sx={{ 
            '& .MuiTableCell-root': { 
              color: '#fff', 
              borderColor: 'rgba(255,255,255,0.1)',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              padding: { xs: '8px', sm: '16px' }
            },
            minWidth: 800
          }}>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 700, bgcolor: 'rgba(255,255,255,0.05)' } }}>
                <TableCell>Date & Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Reference</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No activities yet. Your trades and transactions will appear here as you perform actions.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                    <TableCell>
                      <Box>
                        <Typography color="#fff" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {transaction.date}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.6)" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          {transaction.time}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(transaction.type)}
                        <Typography color="#fff" fontWeight={600} sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          display: { xs: 'none', sm: 'block' }
                        }}>
                          {transaction.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography color="#fff" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {transaction.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        color={transaction.amount?.startsWith('+') ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {transaction.amount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={getStatusColor(transaction.status)}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.6rem', sm: '0.75rem' },
                          height: { xs: 20, sm: 24 }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                        {transaction.reference}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography color="#fff" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {transaction.balance}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <TablePagination
          component="div"
          count={filteredTransactions.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '& .MuiTablePagination-toolbar': { 
              color: '#fff',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              padding: { xs: '8px 16px', sm: '16px' }
            },
            '& .MuiTablePagination-selectLabel': { color: '#fff', fontSize: { xs: '0.75rem', sm: '0.875rem' } },
            '& .MuiTablePagination-displayedRows': { color: '#fff', fontSize: { xs: '0.75rem', sm: '0.875rem' } },
            '& .MuiTablePagination-select': { color: '#fff', fontSize: { xs: '0.75rem', sm: '0.875rem' } },
            '& .MuiIconButton-root': { color: '#fff', padding: { xs: '4px', sm: '8px' } }
          }}
        />
      </Card>
    </Box>
  );
}
