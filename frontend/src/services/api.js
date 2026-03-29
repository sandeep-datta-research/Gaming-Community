import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('ffglory_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Bot Sessions API
export const botSessionsAPI = {
  start: async (clanId, region, botCount) => {
    const response = await axios.post(
      `${API}/sessions/start`,
      { clanId, region, botCount },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  getAll: async () => {
    const response = await axios.get(`${API}/sessions`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  stop: async (sessionId) => {
    const response = await axios.patch(
      `${API}/sessions/${sessionId}/stop`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

// Transactions API
export const transactionsAPI = {
  createPurchase: async (planId, transactionId, upiId = '9366183700@fam') => {
    const response = await axios.post(
      `${API}/transactions/purchase`,
      { planId, transactionId, upiId },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  getAll: async () => {
    const response = await axios.get(`${API}/transactions`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  getUsers: async () => {
    const response = await axios.get(`${API}/admin/users`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  getSessions: async () => {
    const response = await axios.get(`${API}/admin/sessions`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  getTransactions: async () => {
    const response = await axios.get(`${API}/admin/transactions`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  getStats: async () => {
    const response = await axios.get(`${API}/admin/stats`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  grantCredits: async (userId, credits, reason) => {
    const response = await axios.post(
      `${API}/admin/credits/grant`,
      { userId, credits, reason },
      { headers: getAuthHeader() }
    );
    return response.data;
  },
  
  verifyPayment: async (transactionId, status) => {
    const response = await axios.post(
      `${API}/admin/payments/verify`,
      { transactionId, status },
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};
