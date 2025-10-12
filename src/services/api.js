// Keep a small admin helper for auth-related admin calls (login/change-password live under /api/auth/admin)
export const adminAPI = {
  adminLogin: async ({ email, password }) => {
    const res = await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await handleResponse(res);
  }
};

// Auto-detect backend: use VITE_API_BASE if set, else window.location.origin (for same-origin deploys)
const BASE_URL = import.meta.env.VITE_API_BASE || 'https://crypto-forex-backend.onrender.com';

async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch (e) {
    // If no JSON body, create a fallback
    data = { error: res.statusText || 'Unknown error' };
  }
  if (!res.ok) {
    const message = data.error || data.message || res.statusText || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export const userAPI = {
  register: async ({ username, email, password }) => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return await handleResponse(res);
  },
  login: async ({ email, password }) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await handleResponse(res);
  },
    adminChangePassword: async ({ email, oldPassword, newPassword }, token) => {
      const res = await fetch(`${BASE_URL}/api/auth/admin/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, oldPassword, newPassword })
      });
      return await handleResponse(res);
    },
  getProfile: async (token) => {
    const res = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  deposit: async (formData, token) => {
    const res = await fetch(`${BASE_URL}/api/user/deposit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return await handleResponse(res);
  },
  getDeposits: async (token) => {
    const res = await fetch(`${BASE_URL}/api/user/deposits`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  withdrawal: async (amount, token) => {
    const res = await fetch(`${BASE_URL}/api/user/withdrawal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    });
    return await handleResponse(res);
  },
  getWithdrawals: async (token) => {
    const res = await fetch(`${BASE_URL}/api/user/withdrawals`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  submitKYC: async (kycData, token) => {
    // If caller provided a FormData (with files), send it directly and do NOT set Content-Type
    const url = `${BASE_URL}/api/user/kyc`;
    let options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: kycData
    };
    if (!(kycData instanceof FormData)) {
      // If plain object, send JSON body as { kycData }
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify({ kycData });
    }
    const res = await fetch(url, options);
    return await handleResponse(res);
  },
  getKYC: async (token) => {
    const res = await fetch(`${BASE_URL}/api/user/kyc`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },

  // ADMIN ENDPOINTS
  adminGetAllKYC: async (token) => {
    const res = await fetch(`${BASE_URL}/api/admin/kyc`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  approveKYC: async (activityId, token) => {
    const res = await fetch(`${BASE_URL}/api/admin/kyc/${activityId}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  rejectKYC: async (activityId, token) => {
    const res = await fetch(`${BASE_URL}/api/admin/kyc/${activityId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  adminGetAllPlans: async (token) => {
    const res = await fetch(`${BASE_URL}/api/admin/plans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  adminGetAllSignals: async (token) => {
    const res = await fetch(`${BASE_URL}/api/admin/signals`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  adminGetAllDeposits: async (token) => {
    const res = await fetch(`${BASE_URL}/api/admin/deposits`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  adminGetAllWithdrawals: async (token) => {
    const res = await fetch(`${BASE_URL}/api/admin/withdrawals`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  adminGetAllUsers: async (token) => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  buyPlan: async (planId, amount, token) => {
    const res = await fetch(`${BASE_URL}/api/user/plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ planId, amount })
    });
    return await handleResponse(res);
  },
  getPlans: async (token) => {
    const res = await fetch(`${BASE_URL}/api/user/plans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  subscribeSignal: async (signalId, token) => {
    const res = await fetch(`${BASE_URL}/api/user/signal/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ signalId })
    });
    return await handleResponse(res);
  },
  getSignals: async (token) => {
    const res = await fetch(`${BASE_URL}/api/user/signals`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  getSettings: async (token) => {
    const res = await fetch(`${BASE_URL}/api/user/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  updateSettings: async (settings, token) => {
    const res = await fetch(`${BASE_URL}/api/user/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ settings })
    });
    return await handleResponse(res);
  },
};

export const marketAPI = {
  getTickerData: async () => [
    { label: 'BTC/USDT', value: '$38,500', change: '+1.2%', color: '#4caf50' },
    { label: 'ETH/USDT', value: '$2,450', change: '-0.6%', color: '#f44336' },
    { label: 'BNB/USDT', value: '$310', change: '+0.4%', color: '#4caf50' },
    { label: 'SOL/USDT', value: '$105', change: '+2.1%', color: '#4caf50' },
    { label: 'XRP/USDT', value: '$0.62', change: '-0.3%', color: '#f44336' }
  ],
  getChartData: async () => [
    { time: '09:00', price: 38000 },
    { time: '10:00', price: 38120 },
    { time: '11:00', price: 37950 },
    { time: '12:00', price: 38200 },
    { time: '13:00', price: 38350 },
    { time: '14:00', price: 38420 },
    { time: '15:00', price: 38500 }
  ]
};
