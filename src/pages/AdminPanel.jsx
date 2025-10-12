import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, Grid, Button, Alert, Stack, Divider, TextField, Chip, Avatar, Dialog, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';

export default function AdminPanel() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionNotification, setActionNotification] = useState({ open: false, type: '', message: '' });
  // removed global clear tab controls; per-card actions should handle removals
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
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  // Helper to derive activity id from various possible shapes
  const getActivityId = (kyc) => kyc?.activityId || kyc?.id || (kyc?.activity && (kyc.activity.id || kyc.activity.activityId)) || null;
  // helper to normalize status and detect completed states
  const isCompletedKycStatus = (k) => {
    const status = (k?.kycStatus || k?.status || (k.activity && k.activity.status) || '').toString().toLowerCase();
    return ['verified', 'approved', 'rejected', 'completed'].includes(status);
  };
  // Deposit state
  const [depositRequests, setDepositRequests] = useState([]);
  const [depositLoading, setDepositLoading] = useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [creditingDeposit, setCreditingDeposit] = useState(null);
  const [creditAmount, setCreditAmount] = useState('');
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
        // API may return processed items; only keep pending/unhandled KYC items for admin UI
        const pendingKyc = (kycData || []).filter(k => !isCompletedKycStatus(k));
        setKycRequests(pendingKyc);
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

  // refresh pending KYC helper (keeps UI in sync with backend after actions)
  const refreshPendingKYC = async (token) => {
    try {
      const kycData = await userAPI.adminGetAllKYC(token);
      setKycRequests((kycData || []).filter(k => !isCompletedKycStatus(k)));
    } catch (e) {
      // non-fatal; keep UI as-is and notify admin
      setActionNotification({ open: true, type: 'error', message: 'Failed to refresh KYC list.' });
    }
  };

  // Approve/reject KYC
  const handleApproveKYC = async (activityId) => {
    const token = localStorage.getItem('adminToken');
    // If activityId is missing, try to interpret it as a userId fallback
    if (!activityId) {
      setActionNotification({ open: true, type: 'info', message: 'No activity id found — attempting approve by user id.' });
      return;
    }
    setLoading(true);
    try {
  const res = await userAPI.approveKYC(activityId, token);
  // remove the handled KYC request from the admin queue so it doesn't reappear
      setKycRequests(prev => prev.filter(k => getActivityId(k) !== activityId));
      // refresh from server to ensure persistence and multi-admin consistency
      await refreshPendingKYC(token);
      setActionNotification({ open: true, type: 'success', message: 'KYC approved and user account activated.' });
      if (res) {
        const updated = {};
        if (res.balance !== undefined) updated.balance = res.balance;
        if (res.activity) updated.activity = res.activity;
        if (Object.keys(updated).length) {
          updated.id = res.userId || res.user?.id || activityId;
          try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updated })); } catch (e) {}
        }
      }
    } catch (err) {
      setActionNotification({ open: true, type: 'error', message: err.message || 'Failed to approve KYC.' });
    }
    setLoading(false);
  };
  const handleRejectKYC = async (activityId) => {
    const token = localStorage.getItem('adminToken');
    if (!activityId) {
      setActionNotification({ open: true, type: 'info', message: 'No activity id found — attempting reject by user id.' });
      return;
    }
    setLoading(true);
    try {
  const res = await userAPI.rejectKYC(activityId, token);
  // remove rejected request from admin queue
      setKycRequests(prev => prev.filter(k => getActivityId(k) !== activityId));
      // keep UI in sync with backend
      await refreshPendingKYC(token);
      setActionNotification({ open: true, type: 'info', message: 'KYC rejected. User notified.' });
      if (res) {
        const updated = {};
        if (res.balance !== undefined) updated.balance = res.balance;
        if (res.activity) updated.activity = res.activity;
        if (Object.keys(updated).length) {
          updated.id = res.userId || res.user?.id || activityId;
          try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updated })); } catch (e) {}
        }
      }
    } catch (err) {
      setActionNotification({ open: true, type: 'error', message: err.message || 'Failed to reject KYC.' });
    }
    setLoading(false);
  };

  // Settings state
  const [adminCreds, setAdminCreds] = useState({ email: 'Eloninprivateinvestment@outlook.com', password: '' });
  // Manual credit state
  const [manualCreditOpen, setManualCreditOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualNote, setManualNote] = useState('');
  // Plans tab
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planSaving, setPlanSaving] = useState(false);
  // Signals tab
  const [signals, setSignals] = useState([]);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [signalDialogOpen, setSignalDialogOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState(null);
  const [signalSaving, setSignalSaving] = useState(false);
  // Users tab
  const [usersLoading, setUsersLoading] = useState(false);

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
    // fetch users for manual credit when admin opens deposits tab (or you can move this to settings)
    if (tab === 1) {
      const token = localStorage.getItem('adminToken');
      userAPI.adminGetAllUsers(token).then(setAllUsers).catch(() => {});
    }

    // fetch all users when admin opens the Users tab
    if (tab === 5) {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      setUsersLoading(true);
      userAPI.adminGetAllUsers(token)
        .then((data) => setAllUsers(data || []))
        .catch(() => setActionNotification({ open: true, type: 'error', message: 'Failed to fetch users.' }))
        .finally(() => setUsersLoading(false));
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
                    <Button variant="contained" color="primary" size="small" onClick={() => { setEditingPlan(plan); setPlanDialogOpen(true); }}>Edit</Button>
                    <Button variant="contained" color="error" size="small" onClick={async () => {
                      const token = localStorage.getItem('adminToken');
                      try {
                        await userAPI.adminDeletePlan(plan.id, token);
                        setPlans(prev => prev.filter(p => p.id !== plan.id));
                        setActionNotification({ open: true, type: 'success', message: 'Plan deleted.' });
                      } catch (e) {
                        setActionNotification({ open: true, type: 'error', message: e.message || 'Delete failed.' });
                      }
                    }}>Delete</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="success" onClick={() => { setEditingPlan({ name: '', type: 'regular', roi: '', minAmount: 0, maxAmount: 0, duration: '', color: '#ffffff', gradient: '', features: [] }); setPlanDialogOpen(true); }}>Add New Plan</Button>
      </Box>
      {/* Plan edit/create dialog */}
      <Dialog open={planDialogOpen} onClose={() => { setPlanDialogOpen(false); setEditingPlan(null); }} maxWidth="sm" fullWidth>
        <DialogContent>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>{editingPlan && editingPlan.id ? 'Edit Plan' : 'Create Plan'}</Typography>
            {/* Template selector: Bronze / Gold / Platinum */}
            <TextField
              select
              fullWidth
              label="Plan Name (template)"
              sx={{ mb: 2 }}
              value={editingPlan?.name || ''}
              SelectProps={{ native: true }}
              onChange={e => {
                const name = e.target.value;
                // apply template defaults when a template is chosen
                const templates = {
                  'Bronze Plan': { name: 'Bronze Plan', type: 'regular', roi: '500', minAmount: 4000, maxAmount: 10000, duration: '2 weeks', color: '#CD7F32', gradient: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)', features: ['Daily ROI of 500%','24/7 Customer Support','Secure Investment'] },
                  'Gold Plan': { name: 'Gold Plan', type: 'VIP', roi: '750', minAmount: 5200, maxAmount: 20000, duration: '2 weeks', color: '#FFD700', gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', features: ['Daily ROI of 750%','VIP Customer Support','Priority Withdrawal'] },
                  'Platinum Plan': { name: 'Platinum Plan', type: 'VIP', roi: '1200', minAmount: 10000, maxAmount: 50000000, duration: '7 Days', color: '#E5E4E2', gradient: 'linear-gradient(135deg, #E5E4E2 0%, #C0C0C0 100%)', features: ['Daily ROI of 1200%','Premium VIP Support','Instant Withdrawal'] }
                };
                if (templates[name]) setEditingPlan(p => ({ ...p, ...templates[name] }));
                else setEditingPlan(p => ({ ...p, name }));
              }}
            >
              <option value="">Custom / Select template</option>
              <option value="Bronze Plan">Bronze Plan</option>
              <option value="Gold Plan">Gold Plan</option>
              <option value="Platinum Plan">Platinum Plan</option>
            </TextField>
            {/* Type selector: regular / VIP */}
            <TextField fullWidth select label="Type" sx={{ mb: 2 }} value={editingPlan?.type || ''} SelectProps={{ native: true }} onChange={e => setEditingPlan(p => ({ ...p, type: e.target.value }))}>
              <option value="regular">regular</option>
              <option value="VIP">VIP</option>
            </TextField>
          <TextField fullWidth label="ROI (number)" sx={{ mb: 2 }} value={editingPlan?.roi || ''} onChange={e => setEditingPlan(p => ({ ...p, roi: e.target.value }))} />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}><TextField fullWidth label="Min Amount" value={editingPlan?.minAmount || 0} onChange={e => setEditingPlan(p => ({ ...p, minAmount: Number(e.target.value) }))} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Max Amount" value={editingPlan?.maxAmount || 0} onChange={e => setEditingPlan(p => ({ ...p, maxAmount: Number(e.target.value) }))} /></Grid>
          </Grid>
          <TextField fullWidth label="Duration" sx={{ mb: 2 }} value={editingPlan?.duration || ''} onChange={e => setEditingPlan(p => ({ ...p, duration: e.target.value }))} />
          <TextField fullWidth label="Features (one per line)" multiline rows={4} value={(editingPlan?.features || []).join('\n')} onChange={e => setEditingPlan(p => ({ ...p, features: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))} sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPlanDialogOpen(false); setEditingPlan(null); }} color="inherit">Cancel</Button>
          <Button variant="contained" color="primary" onClick={async () => {
            if (!editingPlan) return;
            setPlanSaving(true);
            const token = localStorage.getItem('adminToken');
            try {
              if (editingPlan.id) {
                const updated = await userAPI.adminUpdatePlan(editingPlan.id, editingPlan, token);
                setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
                setActionNotification({ open: true, type: 'success', message: 'Plan updated.' });
              } else {
                const created = await userAPI.adminCreatePlan(editingPlan, token);
                setPlans(prev => [created, ...prev]);
                setActionNotification({ open: true, type: 'success', message: 'Plan created.' });
              }
              setPlanDialogOpen(false);
              setEditingPlan(null);
            } catch (e) {
              setActionNotification({ open: true, type: 'error', message: e.message || 'Save failed.' });
            }
            setPlanSaving(false);
          }} disabled={planSaving}>
            {planSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
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
                    <Button variant="contained" color="primary" size="small" onClick={() => { setEditingSignal(signal); setSignalDialogOpen(true); }}>Edit</Button>
                    <Button variant="contained" color="error" size="small" onClick={async () => {
                      const token = localStorage.getItem('adminToken');
                      try {
                        await userAPI.adminDeleteSignal(signal.id, token);
                        setSignals(prev => prev.filter(s => s.id !== signal.id));
                        setActionNotification({ open: true, type: 'success', message: 'Signal deleted.' });
                      } catch (e) {
                        setActionNotification({ open: true, type: 'error', message: e.message || 'Delete failed.' });
                      }
                    }}>Delete</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="success" onClick={() => { setEditingSignal({ name: '', price: 0, description: '', features: [], accuracy: '', subscribers: '0', badge: '', badgeColor: '', color: '#ffffff' }); setSignalDialogOpen(true); }}>Add New Signal</Button>
      </Box>

      {/* Signal create/edit dialog */}
      <Dialog open={signalDialogOpen} onClose={() => { setSignalDialogOpen(false); setEditingSignal(null); }} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" color="primary" sx={{ mb: 2 }}>{editingSignal && editingSignal.id ? 'Edit Signal' : 'Create Signal'}</Typography>
          {/* Template selector for signals (prefill card content) */}
          <TextField
            select
            fullWidth
            label="Signal Template"
            sx={{ mb: 2 }}
            value={editingSignal?.name || ''}
            SelectProps={{ native: true }}
            onChange={e => {
              const name = e.target.value;
              const templates = {
                'Alpha Signals': { name: 'Alpha Signals', price: 99, description: 'Perfect for beginners entering the trading world', features: ['5-10 signals per day','Basic market analysis','Email notifications','Community access','Mobile app access','Basic support'], accuracy: '75%', subscribers: '2,847', badge: 'STARTER', badgeColor: 'success', color: '#4CAF50' },
                'Titan Signals': { name: 'Titan Signals', price: 149, description: 'Enhanced signals with detailed market insights', features: ['10-15 signals per day','Technical analysis reports','SMS & Email alerts','Priority community access','Risk management tips','Live chat support'], accuracy: '82%', subscribers: '5,234', badge: 'GROWTH', badgeColor: 'primary', color: '#2196F3' },
                'Quantum Edge Signals': { name: 'Quantum Edge Signals', price: 199, description: 'Advanced algorithmic signals with AI-powered insights', features: ['15-20 signals per day','AI-powered analysis','Real-time notifications','VIP community access','Weekly market reports','24/7 priority support'], accuracy: '87%', subscribers: '8,156', badge: 'POPULAR', badgeColor: 'warning', color: '#FF9800' },
                'Elite Trader Signals': { name: 'Elite Trader Signals', price: 249, description: 'Professional-grade signals for serious traders', features: ['20-25 signals per day','Advanced market analysis','Multi-asset coverage','Personal account manager','Live trading sessions','Educational webinars'], accuracy: '90%', subscribers: '3,892', badge: 'PROFESSIONAL', badgeColor: 'secondary', color: '#9C27B0' },
                'Velocity Pro Signals': { name: 'Velocity Pro Signals', price: 299, description: 'High-frequency signals for active traders', features: ['25-30 signals per day','Scalping opportunities','Instant push notifications','Advanced risk metrics','Portfolio optimization','1-on-1 mentoring sessions'], accuracy: '92%', subscribers: '2,145', badge: 'VELOCITY', badgeColor: 'error', color: '#F44336' },
                'Apex Master Signals': { name: 'Apex Master Signals', price: 399, description: 'Master-level signals with institutional-grade analysis', features: ['30-40 signals per day','Institutional insights','Multi-timeframe analysis','Custom risk parameters','Private Discord channel','Monthly strategy calls'], accuracy: '94%', subscribers: '1,567', badge: 'MASTER', badgeColor: 'info', color: '#00BCD4' },
                'Genesis Prime Signals': { name: 'Genesis Prime Signals', price: 499, description: 'Prime-tier signals with exclusive market intelligence', features: ['40-50 signals per day','Exclusive market intelligence','Pre-market analysis','Custom trading strategies','Direct analyst access','Quarterly performance reviews'], accuracy: '96%', subscribers: '892', badge: 'PRIME', badgeColor: 'success', color: '#4CAF50' },
                'Legendary Investor Plan': { name: 'Legendary Investor Plan', price: 999, description: 'Ultimate trading signals for professional investors', features: ['Unlimited signals','Legendary trader insights','Proprietary algorithms','Personal trading coach','Exclusive events access','White-glove service'], accuracy: '98%', subscribers: '347', badge: 'LEGENDARY', badgeColor: 'warning', color: '#FFD700' }
              };
              if (templates[name]) setEditingSignal(s => ({ ...s, ...templates[name] }));
              else setEditingSignal(s => ({ ...s, name }));
            }}
          >
            <option value="">Custom / Select template</option>
            <option value="Alpha Signals">Alpha Signals</option>
            <option value="Titan Signals">Titan Signals</option>
            <option value="Quantum Edge Signals">Quantum Edge Signals</option>
            <option value="Elite Trader Signals">Elite Trader Signals</option>
            <option value="Velocity Pro Signals">Velocity Pro Signals</option>
            <option value="Apex Master Signals">Apex Master Signals</option>
            <option value="Genesis Prime Signals">Genesis Prime Signals</option>
            <option value="Legendary Investor Plan">Legendary Investor Plan</option>
          </TextField>
          <TextField fullWidth label="Name" sx={{ mb: 2 }} value={editingSignal?.name || ''} onChange={e => setEditingSignal(s => ({ ...s, name: e.target.value }))} />
          <TextField fullWidth label="Price" sx={{ mb: 2 }} value={editingSignal?.price || 0} onChange={e => setEditingSignal(s => ({ ...s, price: Number(e.target.value) }))} />
          <TextField fullWidth label="Description" sx={{ mb: 2 }} value={editingSignal?.description || ''} onChange={e => setEditingSignal(s => ({ ...s, description: e.target.value }))} />
          <TextField fullWidth label="Features (one per line)" multiline rows={4} value={(editingSignal?.features || []).join('\n')} onChange={e => setEditingSignal(s => ({ ...s, features: e.target.value.split('\n').map(x => x.trim()).filter(Boolean) }))} sx={{ mb: 2 }} />
          <TextField fullWidth label="Accuracy" sx={{ mb: 2 }} value={editingSignal?.accuracy || ''} onChange={e => setEditingSignal(s => ({ ...s, accuracy: e.target.value }))} />
          <TextField fullWidth label="Subscribers" sx={{ mb: 2 }} value={editingSignal?.subscribers || ''} onChange={e => setEditingSignal(s => ({ ...s, subscribers: e.target.value }))} />
          <TextField fullWidth label="Badge" sx={{ mb: 2 }} value={editingSignal?.badge || ''} onChange={e => setEditingSignal(s => ({ ...s, badge: e.target.value }))} />
          <TextField fullWidth label="Badge Color" sx={{ mb: 2 }} value={editingSignal?.badgeColor || ''} onChange={e => setEditingSignal(s => ({ ...s, badgeColor: e.target.value }))} />
          <TextField fullWidth label="Color" sx={{ mb: 2 }} value={editingSignal?.color || ''} onChange={e => setEditingSignal(s => ({ ...s, color: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSignalDialogOpen(false); setEditingSignal(null); }} color="inherit">Cancel</Button>
          <Button variant="contained" color="primary" onClick={async () => {
            if (!editingSignal) return;
            setSignalSaving(true);
            const token = localStorage.getItem('adminToken');
            try {
              if (editingSignal.id) {
                const updated = await userAPI.adminUpdateSignal(editingSignal.id, editingSignal, token);
                setSignals(prev => prev.map(s => s.id === updated.id ? updated : s));
                setActionNotification({ open: true, type: 'success', message: 'Signal updated.' });
              } else {
                const created = await userAPI.adminCreateSignal(editingSignal, token);
                setSignals(prev => [created, ...prev]);
                setActionNotification({ open: true, type: 'success', message: 'Signal created.' });
              }
              setSignalDialogOpen(false);
              setEditingSignal(null);
            } catch (e) {
              setActionNotification({ open: true, type: 'error', message: e.message || 'Save failed.' });
            }
            setSignalSaving(false);
          }} disabled={signalSaving}>{signalSaving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
  const renderKYC = () => {
    // deduplicate by user (prefer KYC with more fields/images)
    const getKey = (k) => (k.userId || k.user?.id || k.email || k.username || getActivityId(k) || JSON.stringify(k));
    const score = (k) => {
      let s = 0;
      if (k.kycData && Object.keys(k.kycData).length) s += Object.keys(k.kycData).length;
      const data = k.kycData || {};
      if (data.files && Array.isArray(data.files)) s += data.files.length * 2;
      if (data.documents && Array.isArray(data.documents)) s += data.documents.length * 2;
      if (k.kycStatus) s += (k.kycStatus === 'pending' ? 0 : 1);
      return s;
    };
    const map = new Map();
    for (const k of kycRequests) {
      const key = getKey(k);
      if (!map.has(key)) map.set(key, k);
      else {
        const existing = map.get(key);
        if (score(k) > score(existing)) map.set(key, k);
      }
    }
    const deduped = Array.from(map.values());

    return (
      <Box>
        <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>KYC Management</Typography>
        {kycLoading ? (
          <Alert severity="info">Loading KYC requests...</Alert>
        ) : deduped.length === 0 ? (
          <Alert severity="info">No KYC requests yet.</Alert>
        ) : (
          <Grid container spacing={3}>
            {deduped.map(kyc => (
              <Grid item xs={12} md={6} lg={4} key={getKey(kyc)}>
                <Card sx={{ bgcolor: '#232742', color: '#fff', borderRadius: 3, boxShadow: 6 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={700} color="primary">{kyc.kycData?.firstName || kyc.username}</Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.6)">User: {kyc.username} • {kyc.email}</Typography>
                      </Box>
                      <Chip label={kyc.kycStatus || 'pending'} color={kyc.kycStatus === 'verified' ? 'success' : kyc.kycStatus === 'pending' ? 'warning' : 'default'} />
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">{kyc.kycData && Object.keys(kyc.kycData).length ? Object.entries(kyc.kycData).slice(0,3).map(([k, v]) => `${k}: ${v}`).join(' · ') : 'No detailed KYC fields submitted.'}</Typography>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button variant="contained" color="primary" size="small" onClick={() => { setSelectedKyc(kyc); setKycDialogOpen(true); }}>View</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* KYC Detail Dialog */}
        <Dialog open={kycDialogOpen} onClose={() => { setKycDialogOpen(false); setSelectedKyc(null); }} maxWidth="md" fullWidth>
          <DialogContent sx={{ bgcolor: '#232742' }}>
            {selectedKyc ? (
              <Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" color="primary" fontWeight={700}>{selectedKyc.username || selectedKyc.kycData?.firstName}</Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)">User: {selectedKyc.username} • {selectedKyc.email}</Typography>
                  </Box>
                  <Chip label={selectedKyc.kycStatus || 'pending'} color={selectedKyc.kycStatus === 'verified' ? 'success' : 'warning'} />
                </Box>
                <Box>
                  {selectedKyc.kycData && Object.keys(selectedKyc.kycData).length > 0 ? (
                    Object.entries(selectedKyc.kycData).filter(([k, v]) => typeof v !== 'object').map(([key, val]) => (
                      <Typography key={key} variant="body2" color="rgba(255,255,255,0.8)"><strong>{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, s => s.toUpperCase())}:</strong> {val || '-'}</Typography>
                    ))
                  ) : <Typography variant="body2" color="rgba(255,255,255,0.8)">No detailed KYC fields submitted.</Typography>}

                  <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {(() => {
                      const imgUrls = [];
                      const data = selectedKyc.kycData || {};
                      ['identityDocumentUrl','identityDocument','addressDocumentUrl','addressDocument','selfieUrl','selfie','photo','image'].forEach(n => { if (data[n]) imgUrls.push({ url: data[n], label: n }); });
                      if (data.files && Array.isArray(data.files)) data.files.forEach(f => { if (f.url) imgUrls.push({ url: f.url, label: f.name || 'file' }); });
                      if (data.documents && Array.isArray(data.documents)) data.documents.forEach(d => { if (d.url) imgUrls.push({ url: d.url, label: d.type || 'document' }); });
                      const seen = new Set();
                      return imgUrls.filter(i => { if (!i.url) return false; if (seen.has(i.url)) return false; seen.add(i.url); return true; }).map((img, idx) => (
                        <img key={idx} src={img.url} alt={img.label} style={{ width: 140, height: 120, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }} onClick={() => setPreviewImage(img.url)} />
                      ));
                    })()}
                  </Box>
                </Box>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="contained" color="success" onClick={async () => {
              if (!selectedKyc) return;
              const token = localStorage.getItem('adminToken');
              const id = getActivityId(selectedKyc);
              if (id) await handleApproveKYC(id);
              else {
                const userId = selectedKyc.userId || selectedKyc.user?.id || selectedKyc.userId;
                if (userId) {
                  setLoading(true);
                  try { await userAPI.approveKYCByUser(userId, token); await refreshPendingKYC(token); setActionNotification({ open: true, type: 'success', message: 'KYC approved by user id.' }); } catch (e) { setActionNotification({ open: true, type: 'error', message: e.message || 'Failed to approve.' }); }
                  setLoading(false);
                }
              }
              setKycDialogOpen(false); setSelectedKyc(null);
            }}>Approve</Button>
            <Button variant="contained" color="error" onClick={async () => {
              if (!selectedKyc) return;
              const token = localStorage.getItem('adminToken');
              const id = getActivityId(selectedKyc);
              if (id) await handleRejectKYC(id);
              else {
                const userId = selectedKyc.userId || selectedKyc.user?.id || selectedKyc.userId;
                if (userId) {
                  setLoading(true);
                  try { await userAPI.rejectKYCByUser(userId, token); await refreshPendingKYC(token); setActionNotification({ open: true, type: 'info', message: 'KYC rejected by user id.' }); } catch (e) { setActionNotification({ open: true, type: 'error', message: e.message || 'Failed to reject.' }); }
                  setLoading(false);
                }
              }
              setKycDialogOpen(false); setSelectedKyc(null);
            }}>Reject</Button>
            <Button onClick={() => { setKycDialogOpen(false); setSelectedKyc(null); }} variant="outlined">Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // Approve deposit
  const handleApproveDeposit = async (id) => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await userAPI.approveDeposit(id, token);
  // remove approved deposit from admin list
  setDepositRequests(prev => prev.filter(d => d.id !== id && d.activityId !== id));
      setActionNotification({ open: true, type: 'success', message: 'Deposit approved and user balance credited.' });
      if (res) {
        const updated = {};
        if (res.balance !== undefined) updated.balance = res.balance;
        if (res.activity) updated.activity = res.activity;
        if (Object.keys(updated).length) {
          updated.id = res.userId || res.user?.id || id;
          try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updated })); } catch (e) {}
        }
      }
    } catch (err) {
      setActionNotification({ open: true, type: 'error', message: err.message || 'Failed to approve deposit.' });
    }
    setLoading(false);
  };

  // Approve/reject withdrawal
  const handleApproveWithdrawal = async (id) => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await userAPI.approveWithdrawal(id, token);
  // remove approved withdrawal from admin list
  setWithdrawalRequests(prev => prev.filter(w => !(w.id === id || w.activityId === id)));
      setActionNotification({ open: true, type: 'success', message: 'Withdrawal approved and user balance debited.' });
      // If backend returned updated balance/activity, dispatch it; otherwise create a best-effort fallback
      if (res && (res.balance !== undefined || res.activity)) {
        const updated = {};
        if (res.balance !== undefined) updated.balance = res.balance;
        if (res.activity) updated.activity = res.activity;
        updated.id = res.userId || res.user?.id || id;
        try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updated })); } catch (e) {}
      } else {
        // fallback: try to find the withdrawal object to get amount/userId
        const withdrawalObj = withdrawalRequests.find(w => (w.id === id || w.activityId === id));
        const userId = (res && (res.userId || res.user?.id)) || withdrawalObj?.userId || withdrawalObj?.user?.id || id;
        let balanceFromServer;
        try {
          // attempt to fetch user list and derive balance (expensive but reliable fallback)
          const users = await userAPI.adminGetAllUsers(token);
          const u = (users || []).find(x => x.id === userId || x.userId === userId || x._id === userId || x.email === (withdrawalObj && withdrawalObj.email));
          if (u && u.balance !== undefined) balanceFromServer = u.balance;
        } catch (e) {
          // ignore
        }
        const amt = withdrawalObj?.amount !== undefined ? Number(withdrawalObj.amount) : (res && res.amount) || 0;
        const activity = {
          id: `tmp-w-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
          type: 'withdrawal',
          amount: -(Number(amt) || 0),
          status: 'completed',
          description: 'Withdrawal approved by admin',
          date: new Date().toISOString(),
          time: new Date().toLocaleTimeString(),
          balance: balanceFromServer !== undefined ? balanceFromServer : undefined,
          _isTemp: true
        };
        const updated = { id: userId, activity };
        if (balanceFromServer !== undefined) updated.balance = balanceFromServer;
        try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updated })); } catch (e) {}
      }
    } catch (err) {
      setActionNotification({ open: true, type: 'error', message: err.message || 'Failed to approve withdrawal.' });
    }
    setLoading(false);
  };
  const handleRejectWithdrawal = async (id) => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await userAPI.rejectWithdrawal(id, token);
  // remove rejected withdrawal from admin list
  setWithdrawalRequests(prev => prev.filter(w => !(w.id === id || w.activityId === id)));
      setActionNotification({ open: true, type: 'info', message: 'Withdrawal rejected. User notified.' });
      if (res && (res.balance !== undefined || res.activity)) {
        const updated = {};
        if (res.balance !== undefined) updated.balance = res.balance;
        if (res.activity) updated.activity = res.activity;
        updated.id = res.userId || res.user?.id || id;
        try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updated })); } catch (e) {}
      } else {
        // fallback: create a pending/rejected activity for UI
        const withdrawalObj = withdrawalRequests.find(w => (w.id === id || w.activityId === id));
        const userId = (res && (res.userId || res.user?.id)) || withdrawalObj?.userId || withdrawalObj?.user?.id || id;
        let balanceFromServer;
        try {
          const users = await userAPI.adminGetAllUsers(token);
          const u = (users || []).find(x => x.id === userId || x.userId === userId || x._id === userId || x.email === (withdrawalObj && withdrawalObj.email));
          if (u && u.balance !== undefined) balanceFromServer = u.balance;
        } catch (e) {}
        const amt = withdrawalObj?.amount !== undefined ? Number(withdrawalObj.amount) : (res && res.amount) || 0;
        const activity = {
          id: `tmp-w-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
          type: 'withdrawal',
          amount: -(Number(amt) || 0),
          status: 'rejected',
          description: 'Withdrawal rejected by admin',
          date: new Date().toISOString(),
          time: new Date().toLocaleTimeString(),
          balance: balanceFromServer !== undefined ? balanceFromServer : undefined,
          _isTemp: true
        };
        const updated = { id: userId, activity };
        if (balanceFromServer !== undefined) updated.balance = balanceFromServer;
        try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updated })); } catch (e) {}
      }
    } catch (err) {
      setActionNotification({ open: true, type: 'error', message: err.message || 'Failed to reject withdrawal.' });
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
                  {/* Proof image preview */}
                  <Box sx={{ mt: 2 }}>
                    {(() => {
                      const url = deposit.proof || deposit.proofUrl || (deposit.proof && deposit.proof.url) || (deposit.files && deposit.files.proof && (deposit.files.proof.secure_url || deposit.files.proof.url || deposit.files.proof.path));
                      if (url) {
                        return <img src={url} alt="proof" style={{ width: 140, height: 96, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }} onClick={() => setPreviewImage(url)} />;
                      }
                      return null;
                    })()}
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    {(() => {
                      const status = (deposit.status || '').toString().toLowerCase();
                      const actionable = status !== 'approved' && status !== 'rejected';
                      if (!actionable) return null;
                      return (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            disabled={loading}
                            onClick={() => { setCreditingDeposit(deposit); setCreditAmount(deposit.amount || ''); setCreditDialogOpen(true); }}
                          >
                            {loading ? 'Approving...' : 'Credit'}
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            disabled={loading}
                            onClick={async () => {
                              const token = localStorage.getItem('adminToken');
                              setLoading(true);
                                try {
                                const idToUse = deposit.id || deposit.activityId;
                                let res;
                                if (idToUse) {
                                  res = await userAPI.rejectDeposit(idToUse, token);
                                  // remove rejected deposit from admin list
                                  setDepositRequests(prev => prev.filter(d => !(d.id === idToUse || d.activityId === idToUse)));
                                } else {
                                  // fallback: try reject by userId when activity id missing
                                  const userId = deposit.userId || deposit.user?.id || deposit.userId;
                                  if (!userId) throw new Error('No id available to reject deposit');
                                  res = await userAPI.rejectDepositByUser(userId, token);
                                  // remove any deposits for this user from admin list
                                  setDepositRequests(prev => prev.filter(d => d.userId !== userId));
                                }
                                setActionNotification({ open: true, type: 'info', message: 'Deposit rejected.' });
                                if (res) {
                                  const updated = {};
                                  if (res.balance !== undefined) updated.balance = res.balance;
                                  if (res.activity) updated.activity = res.activity;
                                  if (Object.keys(updated).length) {
                                    updated.id = res.userId || res.user?.id || deposit.userId || deposit.user?.id || idToUse;
                                    try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updated })); } catch (e) {}
                                  }
                                }
                              } catch (err) {
                                setActionNotification({ open: true, type: 'error', message: err.message || 'Failed to reject deposit.' });
                              }
                              setLoading(false);
                            }}
                          >
                            {loading ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </>
                      );
                    })()}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  // Credit dialog confirm
  const confirmCredit = async () => {
    if (!creditingDeposit) return;
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const amt = Number(creditAmount);
      if (Number.isNaN(amt) || amt <= 0) throw new Error('Invalid amount');
      // Use activity id if present, otherwise fallback to approve by userId
      const idToUse = creditingDeposit.id || creditingDeposit.activityId;
      let res;
      if (idToUse) {
        res = await userAPI.approveDepositWithAmount(idToUse, amt, token);
      } else {
        const userId = creditingDeposit.userId || creditingDeposit.user?.id;
        if (!userId) throw new Error('No user id available for fallback');
        res = await userAPI.approveDepositByUser(userId, amt, token);
      }
  // remove credited deposit from admin list
  setDepositRequests(prev => prev.filter(d => d.id !== creditingDeposit.id && d.activityId !== creditingDeposit.id && d.userId !== (creditingDeposit.userId || creditingDeposit.user?.id)));
      setActionNotification({ open: true, type: 'success', message: 'Deposit credited and user balance updated.' });
      if (res) {
        const updated = {};
        if (res.balance !== undefined) updated.balance = res.balance;
        if (res.activity) updated.activity = res.activity;
        if (Object.keys(updated).length) {
          updated.id = res.userId || res.user?.id || (creditingDeposit.userId || creditingDeposit.user?.id) || idToUse;
          try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updated })); } catch (e) {}
        }
      }
      setCreditDialogOpen(false);
      setCreditingDeposit(null);
      setCreditAmount('');
    } catch (err) {
      setActionNotification({ open: true, type: 'error', message: err.message || 'Failed to credit deposit.' });
    }
    setLoading(false);
  };

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
                    Method: {withdrawal.method || withdrawal.method || withdrawal.withdrawalType || 'N/A'}<br />
                    Status: <Chip label={withdrawal.status} color={withdrawal.status === 'approved' ? 'success' : withdrawal.status === 'pending' ? 'warning' : 'default'} size="small" />
                  </Typography>
                  {/* Detailed withdrawal fields */}
                  <Box sx={{ mt: 1 }}>
                    {withdrawal.method === 'bank' || withdrawal.withdrawalType === 'bank' ? (
                      <Box>
                        <Typography variant="body2" color="rgba(255,255,255,0.8)"><strong>Bank Name:</strong> {withdrawal.bankName || withdrawal.bank || '-'}</Typography>
                        <Typography variant="body2" color="rgba(255,255,255,0.8)"><strong>Account Name:</strong> {withdrawal.accountName || withdrawal.account_name || '-'}</Typography>
                        <Typography variant="body2" color="rgba(255,255,255,0.8)"><strong>Account Number:</strong> {withdrawal.accountNumber || withdrawal.account_number || '-'}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="rgba(255,255,255,0.8)"><strong>Wallet Address:</strong> {withdrawal.walletAddress || withdrawal.wallet_address || '-'}</Typography>
                    )}
                  </Box>
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
      {usersLoading ? (
        <Alert severity="info">Loading users...</Alert>
      ) : (allUsers && allUsers.length > 0) ? (
        <Grid container spacing={3}>
          {allUsers.map(u => (
            <Grid item xs={12} md={6} lg={4} key={u.id || u._id || u.userId || u.email}>
              <Card sx={{ bgcolor: '#232742', color: '#fff', borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{(u.username && u.username[0]) || (u.email && u.email[0]) || 'U'}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} color="primary">{u.username || u.name || u.email}</Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.6)">ID: {u.id || u._id || u.userId || 'N/A'}</Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">{u.email}</Typography>
                    </Box>
                    <Chip
                      label={`$${(typeof u.balance === 'number' ? Number(u.balance) : 0).toFixed(2)}`}
                      color={typeof u.balance === 'number' && Number(u.balance) > 0 ? 'success' : 'info'}
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={2}>
                      <Button size="small" variant="contained" color="primary" onClick={() => { navigator.clipboard?.writeText(u.email || ''); setActionNotification({ open: true, type: 'info', message: 'Email copied to clipboard.' }); }}>Copy Email</Button>
                      <Button size="small" variant="outlined" color="success" onClick={() => { setManualCreditOpen(true); setSelectedUserId(u.id || u._id || u.userId); }}>Credit</Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">No users found.</Alert>
      )}
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
      {/* Credit dialog */}
      <Dialog open={creditDialogOpen} onClose={() => { setCreditDialogOpen(false); setCreditingDeposit(null); setCreditAmount(''); }} maxWidth="xs" fullWidth>
        <DialogContent>
          <Typography variant="h6" color="primary" sx={{ mb: 2 }}>Credit User Balance</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>User: {creditingDeposit?.username || creditingDeposit?.userName || creditingDeposit?.user?.name}</Typography>
          <TextField label="Amount to credit" fullWidth value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreditDialogOpen(false); setCreditingDeposit(null); setCreditAmount(''); }} color="inherit">Cancel</Button>
          <Button onClick={confirmCredit} variant="contained" color="primary">Confirm Credit</Button>
        </DialogActions>
      </Dialog>
  {tab === 0 && renderKYC()}
  {tab === 1 && renderDeposits()}
  {tab === 2 && renderWithdrawals()}
  {tab === 3 && renderPlans()}
  {tab === 4 && renderSignals()}
  {tab === 5 && renderUsers()}
  {tab === 6 && renderSettings()}
      {/* Manual Credit Dialog */}
      <Dialog open={manualCreditOpen} onClose={() => setManualCreditOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" color="primary" sx={{ mb: 2 }}>Manual Credit User</Typography>
          <TextField select fullWidth label="Select User" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} sx={{ mb: 2 }} SelectProps={{ native: true }}>
            <option value="">Select user</option>
            {allUsers.map(u => <option key={u.id} value={u.id}>{u.username} — {u.email}</option>)}
          </TextField>
          <TextField label="Amount" fullWidth value={manualAmount} onChange={e => setManualAmount(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Note (optional)" fullWidth value={manualNote} onChange={e => setManualNote(e.target.value)} sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualCreditOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={async () => {
            const token = localStorage.getItem('adminToken');
            try {
              const res = await userAPI.adminManualCredit({ userId: selectedUserId, amount: Number(manualAmount), note: manualNote }, token);
              setActionNotification({ open: true, type: 'success', message: 'User credited successfully.' });
              setManualCreditOpen(false);
              setSelectedUserId(''); setManualAmount(''); setManualNote('');
              if (res) {
                const updated = {};
                if (res.balance !== undefined) updated.balance = res.balance;
                if (res.activity) updated.activity = res.activity;
                if (Object.keys(updated).length) {
                  updated.id = res.userId || res.user?.id || selectedUserId;
                  try { window.dispatchEvent(new CustomEvent('user-updated', { detail: updated })); } catch (e) {}
                }
              }
            } catch (err) {
              setActionNotification({ open: true, type: 'error', message: err.message || 'Manual credit failed.' });
            }
          }} variant="contained" color="primary">Credit</Button>
        </DialogActions>
      </Dialog>
      {/* Global clear tab removed — per-card actions handle individual removals */}
    </Box>
  );
}
