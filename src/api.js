// src/api.js
const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  } : {
    'Content-Type': 'application/json'
  };
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Login failed');
  return await response.json();
};

export const requestPasswordReset = async (email) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to send OTP');
  }
  return await response.json();
};

export const confirmPasswordReset = async (email, otp, newPassword) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to reset password');
  }
  return await response.json();
};

export const fetchDrugs = async (page = 1, limit = 20, search = '', sortBy = 'created_at', sortOrder = 'desc') => {
  const headers = getAuthHeaders();
  const url = `${API_URL}/drugs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

  const response = await fetch(url, { headers: { 'Authorization': headers.Authorization } });
  
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    window.location.reload(); 
    return null;
  }
  
  const result = await response.json();
  return result.data;
};

export const createDrug = async (drugData) => {
  const response = await fetch(`${API_URL}/drugs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(drugData),
  });
  return await response.json();
};

export const updateDrug = async (id, drugData) => {
  const response = await fetch(`${API_URL}/drugs/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(drugData),
  });
  return await response.json();
};

export const fetchAllOrders = async () => {
    const response = await fetch(`${API_URL}/orders/all?t=${new Date().getTime()}`, {
        headers: getAuthHeaders(),
    });
    if(!response.ok) throw new Error("Failed to fetch orders");
    const result = await response.json();
    return result.data; 
};

// --- NEW FUNCTION ---
export const updateOrderStatus = async (orderId, status) => {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    return await response.json();
};
