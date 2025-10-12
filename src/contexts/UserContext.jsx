import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Check if user is authenticated based on stored token
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('authToken');
    }
    return false;
  });

  useEffect(() => {
    checkBackendStatus();
    if (isAuthenticated) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Listen for explicit auth changes (register/login), reload profile
  useEffect(() => {
    const onAuthChanged = () => {
      setIsAuthenticated(!!localStorage.getItem('authToken'));
      loadUserData();
    };
    window.addEventListener('auth-changed', onAuthChanged);
    return () => window.removeEventListener('auth-changed', onAuthChanged);
  }, []);

  // Listen for external updates (e.g., admin panel dispatching a 'user-updated' event)
  useEffect(() => {
    const handler = (e) => {
      try {
        const updated = e?.detail;
        if (updated && updated.id) {
          setUser(prev => {
            if (!prev || prev.id !== updated.id) return prev;
            // Merge top-level fields (like balance)
            let merged = { ...prev, ...updated };
            // If an activity object is provided, prepend it into transactions array
            if (updated.activity) {
              let activity = { ...updated.activity };
              // Normalize minimal fields for frontend display
              try {
                if (!activity.date) activity.date = new Date().toISOString();
                if (!activity.time) activity.time = new Date(activity.date).toLocaleTimeString();
                if (activity.amount !== undefined) activity.amount = Number(activity.amount);
                if (!activity.status) activity.status = activity.approved ? 'completed' : 'pending';
                if (!activity.description) activity.description = activity.type ? activity.type.replace(/_/g, ' ').toUpperCase() : 'Activity';
              } catch (e) { /* ignore normalization errors */ }

              // Ensure activity has an id (create a temporary one for client-only activities)
              if (!activity.id) {
                activity.id = `tmp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
                activity._isTemp = true;
              }

              // Ensure activity has a balance to display in AccountHistory
              if (activity.balance === undefined) {
                if (updated.balance !== undefined) {
                  activity.balance = updated.balance;
                } else if (prev.balance !== undefined && typeof activity.amount === 'number') {
                  // best-effort estimation: previous balance + activity amount
                  try {
                    activity.balance = Number(prev.balance) + Number(activity.amount);
                  } catch (e) {
                    activity.balance = prev.balance;
                  }
                } else {
                  activity.balance = prev.balance;
                }
              }

              // Normalize existing transactions array on user
              const existing = Array.isArray(prev.transactions)
                ? prev.transactions.slice()
                : Array.isArray(prev.activities)
                  ? prev.activities.slice()
                  : [];

              // Deduplicate: prefer matching ids, otherwise use composite key (amount+date+type)
              const exists = existing.find(a => {
                if (a && a.id && activity.id) return a.id === activity.id;
                return a && a.amount === activity.amount && a.date === activity.date && a.type === activity.type;
              });

              if (!exists) {
                existing.unshift(activity);
              } else {
                // If the existing entry was a temporary client-side placeholder, replace it with server-provided activity
                if (exists._isTemp && !activity._isTemp) {
                  const idx = existing.findIndex(a => a.id === exists.id);
                  if (idx !== -1) existing[idx] = activity;
                }
              }

              merged = { ...merged, transactions: existing };
            }

            // Ensure transactions array exists
            if (!Array.isArray(merged.transactions)) {
              merged.transactions = Array.isArray(merged.activities) ? merged.activities.slice() : [];
            }

            localStorage.setItem('user', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('user-updated', handler);
    return () => window.removeEventListener('user-updated', handler);
  }, []);

  const checkBackendStatus = async () => {
    // No backend health check in frontend-only mode
    setBackendStatus('fallback');
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        setUserStats(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      const profileResponse = await userAPI.getProfile(token);
      if (profileResponse && profileResponse.username) {
        // Ensure transactions array is present for AccountHistory UI
        const userObj = { ...profileResponse };
        if (!Array.isArray(userObj.transactions) && Array.isArray(userObj.activities)) {
          userObj.transactions = userObj.activities.slice().reverse(); // most recent first
        }
        if (!Array.isArray(userObj.transactions)) {
          userObj.transactions = [];
        }
        setUser(userObj);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userObj));
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setError(profileResponse.error || 'Failed to load user profile');
      }
      // Optionally, set userStats if your backend provides stats
    } catch (err) {
      setError(err.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await userAPI.updateProfile(userData);
      const updatedUser = response.success ? response.data.user : response;
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refreshStats = () => {
    return loadUserData();
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await userAPI.login(credentials);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        await loadUserData(); // Load complete user data after login
        return response.data.user;
      } else {
        // Handle fallback response
        setUser(response);
        setIsAuthenticated(true);
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    // Remove token from localStorage in frontend-only mode
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    setUser(null);
    setUserStats(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const value = {
    user,
    userStats,
    loading,
    error,
    isAuthenticated,
    backendStatus,
    updateUser,
    refreshStats,
    login,
    logout,
    checkBackendStatus,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
