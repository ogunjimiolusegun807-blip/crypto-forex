import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, Grid, Button, Alert, Stack, Divider, TextField, Chip, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';

export default function AdminPanel() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionNotification, setActionNotification] = useState({ open: false, type: '', message: '' });
  const navigate = useNavigate();

  // Super admin check
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
    }
  }, [navigate]);


  // KYC state
  const [kycRequests, setKycRequests] = useState([]);
  const [kycLoading, setKycLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  // Deposit state
  const [depositRequests, setDepositRequests] = useState([]);
  const [depositLoading, setDepositLoading] = useState(false);
  // Withdrawal state
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

  // Fetch KYC, deposits, withdrawals
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setKycLoading(true);
    setDepositLoading(true);
    setWithdrawalLoading(true);
    Promise.all([
      userAPI.adminGetAllKYC(token),
      userAPI.adminGetAllDeposits(token),
      userAPI.adminGetAllWithdrawals(token)
    ])
      .then(([kycData, depositData, withdrawalData]) => {
        // API now returns an array of { activityId, userId, username, email, kycStatus, kycData }
        setKycRequests(kycData);
        setDepositRequests(depositData);
        setWithdrawalRequests(withdrawalData);
      })
      .catch(() => setError('Failed to fetch admin data'))
      .finally(() => {
        setKycLoading(false);
        setDepositLoading(false);
        setWithdrawalLoading(false);
      });
  }, []);

  // Approve/reject KYC
  const handleApproveKYC = async (activityId) => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      await userAPI.approveKYC(activityId, token);
      setKycRequests(prev => prev.map(k => k.activityId === activityId ? { ...k, kycStatus: 'verified' } : k));
      setActionNotification({ open: true, type: 'success', message: 'KYC approved and user account activated.' });
    } catch {
      setActionNotification({ open: true, type: 'error', message: 'Failed to approve KYC.' });
    }
    setLoading(false);
  };
  const handleRejectKYC = async (activityId) => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      await userAPI.rejectKYC(activityId, token);
      setKycRequests(prev => prev.map(k => k.activityId === activityId ? { ...k, kycStatus: 'rejected' } : k));
      setActionNotification({ open: true, type: 'info', message: 'KYC rejected. User notified.' });
    } catch {
      setActionNotification({ open: true, type: 'error', message: 'Failed to reject KYC.' });
    }
    setLoading(false);
  };

  // Settings state
  const [adminCreds, setAdminCreds] = useState({ email: 'Eloninprivateinvestment@outlook.com', password: '' });
  // Plans tab
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  // Signals tab
  const [signals, setSignals] = useState([]);
  const [signalsLoading, setSignalsLoading] = useState(false);

  useEffect(() => {
    if (tab === 3) {
      setPlansLoading(true);
      const token = localStorage.getItem('adminToken');
      userAPI.adminGetAllPlans(token)
        .then(setPlans)
        .catch(() => setActionNotification({ open: true, type: 'error', message: 'Failed to fetch plans.' }))
        .finally(() => setPlansLoading(false));
    } else if (tab === 4) {
      setSignalsLoading(true);
      const token = localStorage.getItem('adminToken');
      userAPI.adminGetAllSignals(token)
        .then(setSignals)
        .catch(() => setActionNotification({ open: true, type: 'error', message: 'Failed to fetch signals.' }))
        .finally(() => setSignalsLoading(false));
    }
  }, [tab]);

  // Tab content renderers
  // Plans tab renderer
  const renderPlans = () => (
    <Box>
      <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>Investment Plans Management</Typography>
      {plansLoading ? (
        <Alert severity="info">Loading plans...</Alert>
      ) : plans.length === 0 ? (
        <Alert severity="info">No plans found.</Alert>
      ) : (
        <Grid container spacing={3}>
          {plans.map(plan => (
            <Grid item xs={12} md={6} lg={4} key={plan.id}>
              <Card sx={{ bgcolor: '#232742', color: '#fff', borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" fontWeight={700} gutterBottom>{plan.name}</Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Type: {plan.type}<br />
                    ROI: {plan.roi}%<br />
                    Min: ${plan.minAmount} - Max: ${plan.maxAmount}<br />
                    Duration: {plan.duration}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button variant="contained" color="primary" size="small">Edit</Button>
                    <Button variant="contained" color="error" size="small">Delete</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="success">Add New Plan</Button>
      </Box>
    </Box>
  );

  // Signals tab renderer
  const renderSignals = () => (
    <Box>
      <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>Trading Signals Management</Typography>
      {signalsLoading ? (
        <Alert severity="info">Loading signals...</Alert>
      ) : signals.length === 0 ? (
        <Alert severity="info">No signals found.</Alert>
      ) : (
        <Grid container spacing={3}>
          {signals.map(signal => (
            <Grid item xs={12} md={6} lg={4} key={signal.id}>
              <Card sx={{ bgcolor: '#232742', color: '#fff', borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" fontWeight={700} gutterBottom>{signal.name}</Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Price: ${signal.price}<br />
                    Accuracy: {signal.accuracy}<br />
                    Subscribers: {signal.subscribers}<br />
                    Badge: {signal.badge}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button variant="contained" color="primary" size="small">Edit</Button>
                    <Button variant="contained" color="error" size="small">Delete</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="success">Add New Signal</Button>
      </Box>
    </Box>
  );
  const renderKYC = () => (
    <Box>
      <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>KYC Management</Typography>
      {kycLoading ? (
        <Alert severity="info">Loading KYC requests...</Alert>
      ) : kycRequests.length === 0 ? (
        <Alert severity="info">No KYC requests yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {kycRequests.map(kyc => (
            <Grid item xs={12} md={6} lg={4} key={kyc.activityId}>
              <Card sx={{ bgcolor: '#232742', color: '#fff', borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} color="primary">
                        {kyc.kycData?.firstName || kyc.username}
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.6)">User: {kyc.username} • {kyc.email}</Typography>
                    </Box>
                    <Chip label={kyc.kycStatus} color={kyc.kycStatus === 'verified' ? 'success' : kyc.kycStatus === 'pending' ? 'warning' : 'default'} />
                  </Box>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    <strong>Nationality:</strong> {kyc.kycData?.nationality || '-'}<br />
                    <strong>Phone:</strong> {kyc.kycData?.phoneNumber || '-'}<br />
                    <strong>Address:</strong> {kyc.kycData?.address || '-'}, {kyc.kycData?.city || '-'}, {kyc.kycData?.state || '-'} {kyc.kycData?.zipCode || ''}<br />
                    <strong>Document:</strong> {kyc.kycData?.documentType || '-'} {kyc.kycData?.documentNumber ? `• ${kyc.kycData.documentNumber}` : ''}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    {/* Thumbnails */}
                    {kyc.kycData?.identityDocumentUrl && (
                      <img src={kyc.kycData.identityDocumentUrl} alt="identity" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }} onClick={() => setPreviewImage(kyc.kycData.identityDocumentUrl)} />
                    )}
                    {kyc.kycData?.addressDocumentUrl && (
                      <img src={kyc.kycData.addressDocumentUrl} alt="address" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }} onClick={() => setPreviewImage(kyc.kycData.addressDocumentUrl)} />
                    )}
                    {kyc.kycData?.selfieUrl && (
                      <img src={kyc.kycData.selfieUrl} alt="selfie" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }} onClick={() => setPreviewImage(kyc.kycData.selfieUrl)} />
                    )}
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button variant="contained" color="success" disabled={kyc.kycStatus === 'verified' || loading} onClick={() => handleApproveKYC(kyc.activityId)}>
                      {loading ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button variant="contained" color="error" disabled={kyc.kycStatus === 'rejected' || loading} onClick={() => handleRejectKYC(kyc.activityId)}>
                      {loading ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  // Approve deposit
  const handleApproveDeposit = async (id) => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      await userAPI.approveDeposit(id, token);
      setDepositRequests(prev => prev.map(d => d.id === id ? { ...d, status: 'approved' } : d));
      setActionNotification({ open: true, type: 'success', message: 'Deposit approved and user balance credited.' });
    } catch {
      setActionNotification({ open: true, type: 'error', message: 'Failed to approve deposit.' });
    }
    setLoading(false);
  };

  // Approve/reject withdrawal
  const handleApproveWithdrawal = async (id) => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      await userAPI.approveWithdrawal(id, token);
      setWithdrawalRequests(prev => prev.map(w => w.id === id ? { ...w, status: 'approved' } : w));
      setActionNotification({ open: true, type: 'success', message: 'Withdrawal approved and user balance debited.' });
    } catch {
      setActionNotification({ open: true, type: 'error', message: 'Failed to approve withdrawal.' });
    }
    setLoading(false);
  };
  const handleRejectWithdrawal = async (id) => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      await userAPI.rejectWithdrawal(id, token);
      setWithdrawalRequests(prev => prev.map(w => w.id === id ? { ...w, status: 'rejected' } : w));
      setActionNotification({ open: true, type: 'info', message: 'Withdrawal rejected. User notified.' });
    } catch {
      setActionNotification({ open: true, type: 'error', message: 'Failed to reject withdrawal.' });
    }
    setLoading(false);
  };

  // Deposit tab
  const renderDeposits = () => (
    <Box>
      <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>Deposit Management</Typography>
      {depositLoading ? (
        <Alert severity="info">Loading deposit requests...</Alert>
      ) : depositRequests.length === 0 ? (
        <Alert severity="info">No deposit requests yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {depositRequests.map(deposit => (
            <Grid item xs={12} md={6} lg={4} key={deposit.id}>
              <Card sx={{ bgcolor: '#232742', color: '#fff', borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" fontWeight={700} gutterBottom>
                    {deposit.username || deposit.userName || deposit.user?.name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Amount: ${deposit.amount}<br />
                    Method: {deposit.method}<br />
                    Status: <Chip label={deposit.status} color={deposit.status === 'approved' ? 'success' : deposit.status === 'pending' ? 'warning' : 'default'} size="small" />
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    {deposit.status === 'pending' && (
                      <Button variant="contained" color="success" size="small" disabled={loading} onClick={() => handleApproveDeposit(deposit.id)}>
                        {loading ? 'Approving...' : 'Approve'}
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  // Withdrawal tab
  const renderWithdrawals = () => (
    <Box>
      <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>Withdrawal Management</Typography>
      {withdrawalLoading ? (
        <Alert severity="info">Loading withdrawal requests...</Alert>
      ) : withdrawalRequests.length === 0 ? (
        <Alert severity="info">No withdrawal requests yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {withdrawalRequests.map(withdrawal => (
            <Grid item xs={12} md={6} lg={4} key={withdrawal.id}>
              <Card sx={{ bgcolor: '#232742', color: '#fff', borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" fontWeight={700} gutterBottom>
                    {withdrawal.username || withdrawal.userName || withdrawal.user?.name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Amount: ${withdrawal.amount}<br />
                    Method: {withdrawal.method}<br />
                    Status: <Chip label={withdrawal.status} color={withdrawal.status === 'approved' ? 'success' : withdrawal.status === 'pending' ? 'warning' : 'default'} size="small" />
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    {withdrawal.status === 'pending' && (
                      <>
                        <Button variant="contained" color="success" size="small" disabled={loading} onClick={() => handleApproveWithdrawal(withdrawal.id)}>
                          {loading ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button variant="contained" color="error" size="small" disabled={loading} onClick={() => handleRejectWithdrawal(withdrawal.id)}>
                          {loading ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderUsers = () => (
    <Box>
      <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>User Management</Typography>
      {/* List users here */}
      <Alert severity="info">No users found.</Alert>
    </Box>
  );

  // Settings tab with backend integration
  const [oldPassword, setOldPassword] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const renderSettings = () => (
    <Box>
      <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>Admin Settings</Typography>
      <Card sx={{ bgcolor: '#232742', color: '#fff', borderRadius: 3, boxShadow: 6, maxWidth: 400, mx: 'auto', mt: 2 }}>
        <CardContent>
          <form
            onSubmit={async e => {
              e.preventDefault();
              setSettingsLoading(true);
              setActionNotification({ open: false, type: '', message: '' });
              const token = localStorage.getItem('adminToken');
              try {
                await userAPI.adminChangePassword({
                  email: adminCreds.email,
                  oldPassword,
                  newPassword: adminCreds.password
                }, token);
                setActionNotification({ open: true, type: 'success', message: 'Password updated successfully!' });
                setOldPassword('');
                setAdminCreds(c => ({ ...c, password: '' }));
              } catch (err) {
                setActionNotification({ open: true, type: 'error', message: err.message || 'Password update failed.' });
              }
              setSettingsLoading(false);
            }}
          >
            <Stack spacing={3}>
              <TextField label="Admin Email" variant="outlined" fullWidth value={adminCreds.email} disabled sx={{ bgcolor: '#232742', input: { color: '#fff' }, label: { color: 'primary.main' } }} />
              <TextField label="Old Password" type="password" variant="outlined" fullWidth value={oldPassword} onChange={e => setOldPassword(e.target.value)} sx={{ bgcolor: '#232742', input: { color: '#fff' }, label: { color: 'primary.main' } }} />
              <TextField label="New Password" type="password" variant="outlined" fullWidth value={adminCreds.password} onChange={e => setAdminCreds(c => ({ ...c, password: e.target.value }))} sx={{ bgcolor: '#232742', input: { color: '#fff' }, label: { color: 'primary.main' } }} />
              <Button variant="contained" color="primary" type="submit" sx={{ fontWeight: 700, py: 1.5 }} disabled={settingsLoading}>
                {settingsLoading ? 'Updating...' : 'Change Password'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#232742', p: 4 }}>
      <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>Admin Dashboard</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary" sx={{ mb: 3 }}>
        <Tab label="KYC" />
        <Tab label="Deposits" />
        <Tab label="Withdrawals" />
        <Tab label="Plans" />
        <Tab label="Signals" />
        <Tab label="Users" />
        <Tab label="Settings" />
      </Tabs>
      <Divider sx={{ mb: 3, bgcolor: 'primary.main' }} />
      {actionNotification.open && (
        <Box sx={{ position: 'fixed', top: 24, left: 0, right: 0, zIndex: 1500, display: 'flex', justifyContent: 'center' }}>
          <Alert severity={actionNotification.type} onClose={() => setActionNotification({ ...actionNotification, open: false })} sx={{ minWidth: 320, maxWidth: 480, fontWeight: 600 }}>
            {actionNotification.message}
          </Alert>
        </Box>
      )}
      {/* Image preview modal */}
      <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="md" fullWidth>
        <DialogContent sx={{ bgcolor: '#000' }}>
          {previewImage && <img src={previewImage} alt="preview" style={{ width: '100%', height: 'auto', borderRadius: 6 }} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewImage(null)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
  {tab === 0 && renderKYC()}
  {tab === 1 && renderDeposits()}
  {tab === 2 && renderWithdrawals()}
  {tab === 3 && renderPlans()}
  {tab === 4 && renderSignals()}
  {tab === 5 && renderUsers()}
  {tab === 6 && renderSettings()}
    </Box>
  );
}
