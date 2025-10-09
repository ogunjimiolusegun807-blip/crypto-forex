
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
  getProfile: async (token) => {
    const res = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await handleResponse(res);
  },
  // Add getStats, updateProfile, etc. as needed
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
