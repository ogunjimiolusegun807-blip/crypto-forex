import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Card, 
  Button, 
  Modal, 
  TextField, 
  Divider, 
  Avatar, 
  Stack, 
  Chip,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from '@mui/material/styles';
import { useUser } from '../contexts/UserContext';
import { userAPI } from '../services/api';

const tickerData = [
  { label: 'Nasdaq 100', value: '24,344.8', change: '+98.90 (+0.41%)', color: 'success.main' },
  { label: 'EUR/USD', value: '1.18099', change: '-0.00059 (-0.05%)', color: 'error.main' },
  { label: 'BTC/USD', value: '116,747', change: '+270.00 (+0.23%)', color: 'success.main' },
  { label: 'ETH/USD', value: '4,620.8', change: '+28.50', color: 'success.main' },
];

const depositMethods = [
  {
    name: 'Bitcoin',
    address: 'bc1qeeqx6lvadawv5ltnyyquukgvjnppq2mal7q78p',
    qr: 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=bitcoin:bc1qeeqx6lvadawv5ltnyyquukgvjnppq2mal7q78p',
    currency: 'BTC',
  },
  {
    name: 'Ethereum',
    address: '0xda77aa81Ea9A0736680491739AFf8d29Aa96d9a1',
    qr: 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=ethereum:0xda77aa81Ea9A0736680491739AFf8d29Aa96d9a1',
    currency: 'ETH',
  },
  {
    name: 'Litecoin',
    address: 'ltc1qgx0g38u9jnz8rqerq5feqnf8u3zwjpmyqu2ney',
    qr: 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=litecoin:ltc1qgx0g38u9jnz8rqerq5feqnf8u3zwjpmyqu2ney',
    currency: 'LTC',
  },
];

export default function Deposits() {
  const [depositSuccess, setDepositSuccess] = useState(null);
  const { user, loading, error } = useUser();
  const theme = useTheme();
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [proof, setProof] = useState(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState(null);

  // Remove hardcoded user, use context

  const handleOpenModal = (method) => {
    setSelectedMethod(method);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMethod(null);
    setAmount('');
    setProof(null);
    setDepositError(null);
  };

  // Handle deposit submit
  const handleDepositSubmit = async () => {
    setDepositLoading(true);
    setDepositError(null);
    setDepositSuccess(null);
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('amount', amount);
      if (proof) {
        formData.append('proof', proof);
      }
      await userAPI.deposit(formData, token);
      setDepositSuccess('Deposit submitted successfully!');
      setTimeout(() => {
        setDepositSuccess(null);
        handleCloseModal();
        window.location.reload();
      }, 2000);
    } catch (err) {
      setDepositError(err.message || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
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
    <Container maxWidth="xl">
      {/* Deposit Success Notification */}
      {depositSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setDepositSuccess(null)}>
          {depositSuccess}
        </Alert>
      )}
      <Box sx={{
        p: { xs: 1, sm: 2, md: 3 },
        minHeight: '100vh',
        bgcolor: theme.palette.background.default
      }}>
      {/* Header - Consistent with Dashboard */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 2, 
        bgcolor: '#232742', 
        p: { xs: 1.5, sm: 2, md: 2.5 }, 
        borderRadius: 3, 
        boxShadow: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.5, sm: 2, md: 0 },
        minHeight: { xs: 'auto', sm: 80 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 1.5, md: 2 },
          width: { xs: '100%', sm: 'auto' },
          justifyContent: { xs: 'center', sm: 'flex-start' }
        }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            width: { xs: 36, sm: 42, md: 48 }, 
            height: { xs: 36, sm: 42, md: 48 },
            flexShrink: 0
          }}>
            <PersonIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.8rem' } }} />
          </Avatar>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography 
              variant="h5"
              fontWeight={900} 
              color={theme.palette.primary.main}
              sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                lineHeight: 1.2
              }}
            >
              Elon Investment Broker
            </Typography>
            <Typography 
              variant="h6"
              fontWeight={700} 
              color="#fff"
              sx={{ 
                fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.25rem' },
                lineHeight: 1.2,
                mt: 0.25
              }}
            >
              Username: <span style={{ color: theme.palette.primary.main }}>{user?.username || user?.name || 'N/A'}</span>
            </Typography>
          </Box>
        </Box>
        <Stack 
          direction={{ xs: 'row', sm: 'row' }} 
          spacing={{ xs: 1, sm: 1.5, md: 2 }} 
          alignItems="center"
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'center', sm: 'flex-end' },
            flexWrap: 'wrap',
            gap: { xs: 1, sm: 1.5 }
          }}
        >
          <Chip
            icon={<VerifiedUserIcon />}
            label={getAccountStatus().label}
            color={getAccountStatus().color}
            variant="outlined"
            size="small"
            sx={{ height: { xs: 28, sm: 32 }, fontWeight: 600, ml: 1 }}
          />
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
            startIcon={<SettingsIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />}
            size="small"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, height: { xs: 32, sm: 36 }, px: { xs: 1.5, sm: 2, md: 3 }, fontWeight: 600, minWidth: { xs: 'auto', sm: 80 }, whiteSpace: 'nowrap' }}
            onClick={() => navigate('/dashboard/account-settings')}
          >
            Settings
          </Button>
        </Stack>
      </Box>

      {/* Ticker Bar */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 1.5, sm: 2, md: 3 }, 
        bgcolor: '#181A20', 
        p: { xs: 1, sm: 1.5 }, 
        borderRadius: 2, 
        mb: 3, 
        overflowX: 'auto', 
        boxShadow: 1,
        '&::-webkit-scrollbar': { 
          height: { xs: 4, sm: 6 }
        },
        '&::-webkit-scrollbar-track': { 
          bgcolor: 'rgba(255,255,255,0.05)',
          borderRadius: 2
        },
        '&::-webkit-scrollbar-thumb': { 
          bgcolor: 'primary.main', 
          borderRadius: 2,
          '&:hover': {
            bgcolor: 'primary.dark'
          }
        },
        scrollbarWidth: 'thin',
        scrollbarColor: 'primary.main rgba(255,255,255,0.1)'
      }}>
        {tickerData.map((item, idx) => (
          <Box 
            key={idx} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 0.5, sm: 1 },
              minWidth: { xs: 140, sm: 160, md: 180 },
              flexDirection: { xs: 'column', sm: 'row' },
              textAlign: { xs: 'center', sm: 'left' },
              py: { xs: 0.5, sm: 0 },
              px: { xs: 1, sm: 0 }
            }}
          >
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              fontWeight={600}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8125rem' } }}
            >
              {item.label}
            </Typography>
            <Typography 
              variant="body1" 
              color="#fff" 
              fontWeight={700}
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' } }}
            >
              {item.value}
            </Typography>
            <Typography 
              variant="body2" 
              color={item.color} 
              fontWeight={700}
              sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}
            >
              {item.change}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography 
        variant="h4" 
        fontWeight={700} 
        sx={{ 
          mb: 3, 
          color: theme.palette.primary.main, 
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
        }}
      >
        Deposit Using Bitcoin/Ethereum/Litecoin
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
        {depositMethods.map((method) => (
          <Card key={method.name} sx={{ 
            p: { xs: 2, sm: 2.5, md: 3 }, 
            borderRadius: 3, 
            boxShadow: 3, 
            bgcolor: theme.palette.background.paper,
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: { xs: 'none', sm: 'translateY(-2px)' },
              boxShadow: { xs: 3, sm: 6 }
            }
          }}>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              sx={{ 
                mb: 1,
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
              }}
            >
              {method.name} Deposit Method
            </Typography>
            <Typography sx={{ 
              mb: 1, 
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
              lineHeight: 1.4
            }}>
              Please make sure you upload your payment proof for quick payment verification
            </Typography>
            <Typography sx={{ 
              mb: 2, 
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
              lineHeight: 1.4
            }}>
              On confirmation, our system will automatically convert your {method.name} to live value of Dollars. Ensure that you deposit the actual {method.name} to the address specified on the payment Page.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => handleOpenModal(method)}
              fullWidth
              size="large"
              sx={{ 
                fontWeight: 600,
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Make Deposit
            </Button>
          </Card>
        ))}

        {/* Other Deposit Method */}
        <Card sx={{ 
          p: { xs: 2, sm: 2.5, md: 3 }, 
          borderRadius: 3, 
          boxShadow: 3, 
          bgcolor: theme.palette.background.paper,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: { xs: 'none', sm: 'translateY(-2px)' },
            boxShadow: { xs: 3, sm: 6 }
          }
        }}>
          <Typography 
            variant="h5" 
            fontWeight={700} 
            sx={{ 
              mb: 1,
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
            }}
          >
            Other Deposit Method
          </Typography>
          <Typography sx={{ 
            mb: 1, 
            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
            lineHeight: 1.4
          }}>
            Request other available Deposit Method
          </Typography>
          <Typography sx={{ 
            mb: 1, 
            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
            lineHeight: 1.4
          }}>
            Once payment is made using this method you are to send your payment proof to our support mail <b>interspace@interspacebroker.com</b>
          </Typography>
          <Typography sx={{ 
            mb: 2, 
            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
            lineHeight: 1.4
          }}>
            Once requested, you will receive the payment details via our support mail....
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={() => handleOpenModal('other')}
            fullWidth
            size="large"
            sx={{ 
              fontWeight: 600,
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            Proceed
          </Button>
        </Card>
      </Box>

      {/* Deposit Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          bgcolor: '#232742', 
          p: { xs: 2, sm: 3, md: 4 }, 
          borderRadius: 3, 
          boxShadow: 6, 
          minWidth: { xs: '95vw', sm: 400, md: 450 }, 
          maxWidth: { xs: '98vw', sm: 500, md: 550 },
          maxHeight: { xs: '90vh', sm: 'none' },
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: 6
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 3
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'primary.main',
            borderRadius: 3
          }
        }}>
          {selectedMethod && selectedMethod !== 'other' ? (
            <>
              <Typography 
                variant="h6" 
                fontWeight={700} 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  textAlign: 'center'
                }}
              >
                {selectedMethod.name} Deposit Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography sx={{ 
                mb: 1, 
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: 500
              }}>
                Deposit Address:
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 }
              }}>
                <Typography sx={{ 
                  wordBreak: 'break-all', 
                  color: theme.palette.primary.main, 
                  mr: { xs: 0, sm: 1 },
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  textAlign: { xs: 'center', sm: 'left' },
                  fontFamily: 'monospace',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  p: 1,
                  borderRadius: 1,
                  flex: 1
                }}>
                  {selectedMethod.address}
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => {navigator.clipboard.writeText(selectedMethod.address)}}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 'auto' },
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    fontWeight: 600
                  }}
                >
                  Copy
                </Button>
              </Box>
              <Box sx={{ 
                mb: 2, 
                display: 'flex', 
                justifyContent: 'center',
                p: 1
              }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${selectedMethod.address}`} 
                  alt="Deposit QR" 
                  style={{ 
                    width: 120, 
                    height: 120,
                    borderRadius: 8,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }} 
                />
              </Box>
              <TextField 
                label="Amount" 
                fullWidth 
                sx={{ mb: 2 }} 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                size="medium"
                type="number"
                inputProps={{ min: 0 }}
              />
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ 
                  mb: 1, 
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  fontWeight: 500
                }}>
                  Upload Payment Proof:
                </Typography>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setProof(e.target.files[0])}
                  style={{ 
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #444',
                    borderRadius: 6,
                    background: '#181A20',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: { xs: 1, sm: 2 },
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleCloseModal}
                  fullWidth
                  sx={{ 
                    fontWeight: 600,
                    py: { xs: 1, sm: 1.25 }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleDepositSubmit}
                  fullWidth
                  disabled={depositLoading || !amount}
                  sx={{ 
                    fontWeight: 600,
                    py: { xs: 1, sm: 1.25 }
                  }}
                >
                  {depositLoading ? 'Processing...' : 'Submit'}
                </Button>
                {depositError && (
                  <Alert severity="error" sx={{ mt: 2 }}>{depositError}</Alert>
                )}
              </Box>
            </>
          ) : selectedMethod === 'other' ? (
            <>
              <Typography 
                variant="h6" 
                fontWeight={700} 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  textAlign: 'center'
                }}
              >
                Other Deposit Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography 
                variant="subtitle2" 
                fontWeight={700} 
                sx={{ 
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  mb: 1
                }}
              >
                Full Name: {user.name}
              </Typography>
              <Typography 
                variant="subtitle2" 
                fontWeight={700} 
                sx={{ 
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  mb: 1
                }}
              >
                Email: {user.email}
              </Typography>
              <Typography 
                variant="subtitle2" 
                fontWeight={700} 
                sx={{ 
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  mb: 2
                }}
              >
                Account Type: {user.accountType}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight={700} 
                  sx={{ 
                    mb: 1, 
                    fontSize: { xs: '0.85rem', sm: '0.9rem' }
                  }}
                >
                  Deposit Type:
                </Typography>
                <select style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  borderRadius: 8, 
                  border: '1px solid #444', 
                  background: '#181A20', 
                  color: '#fff', 
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 500
                }}>
                  <option value="">Select Deposit Type</option>
                  <option value="Litecoin">Litecoin</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Bitcoin Cash">Bitcoin Cash</option>
                  <option value="USDT">USDT</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Stellar">Stellar</option>
                  <option value="Western Union">Western Union</option>
                  <option value="Skrill">Skrill</option>
                  <option value="MoneyGram">MoneyGram</option>
                </select>
              </Box>
              <TextField 
                label="Amount" 
                fullWidth 
                sx={{ mb: 2 }} 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                size="medium"
                type="number"
                inputProps={{ min: 0 }}
              />
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: { xs: 1, sm: 2 },
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleCloseModal}
                  fullWidth
                  sx={{ 
                    fontWeight: 600,
                    py: { xs: 1, sm: 1.25 }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={handleCloseModal}
                  fullWidth
                  sx={{ 
                    fontWeight: 600,
                    py: { xs: 1, sm: 1.25 }
                  }}
                >
                  Submit
                </Button>
              </Box>
            </>
          ) : null}
        </Box>
      </Modal>
      </Box>
    </Container>
  );
}
