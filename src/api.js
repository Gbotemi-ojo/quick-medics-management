// src/api.js
export const API_URL = 'https://quick-medics-be.vercel.app/api'; 
// export const API_URL = 'http://localhost:5000/api'; 

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  } : {
    'Content-Type': 'application/json'
  };
};

// --- AUTH ---
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

// --- DRUGS ---
export const fetchDrugs = async (page = 1, limit = 20, search = '', sortBy = 'created_at', sortOrder = 'desc') => {
  const headers = getAuthHeaders();
  const url = `${API_URL}/drugs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
  const response = await fetch(url, { headers: { 'Authorization': headers.Authorization } });
  if (response.status === 401) { localStorage.removeItem('token'); window.location.reload(); return null; }
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

// --- SECTIONS & CATEGORIES ---
export const fetchCategories = async () => {
    const response = await fetch(`${API_URL}/drugs/categories`);
    const result = await response.json();
    return result.data || [];
};

export const updateCategory = async (id, data) => {
    const response = await fetch(`${API_URL}/drugs/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return await response.json();
};

export const fetchSections = async () => {
    const response = await fetch(`${API_URL}/drugs/sections`, { headers: getAuthHeaders() });
    const result = await response.json();
    return result.data || [];
};

export const createSection = async (data) => {
    const response = await fetch(`${API_URL}/drugs/sections`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return await response.json();
};

export const deleteSection = async (id) => {
    const response = await fetch(`${API_URL}/drugs/sections/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return await response.json();
};

// NEW: Section Items
export const fetchSectionItems = async (sectionId) => {
    const response = await fetch(`${API_URL}/drugs/sections/${sectionId}/items`, { headers: getAuthHeaders() });
    const result = await response.json();
    return result.data || [];
};

export const updateSectionItems = async (sectionId, drugIds) => {
    const response = await fetch(`${API_URL}/drugs/sections/${sectionId}/items`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ drugIds })
    });
    return await response.json();
};


// --- ORDERS ---
export const fetchAllOrders = async () => {
    const response = await fetch(`${API_URL}/orders/all?t=${new Date().getTime()}`, {
        headers: getAuthHeaders(),
    });
    if(!response.ok) throw new Error("Failed to fetch orders");
    const result = await response.json();
    return result.data; 
};

export const updateOrderStatus = async (orderId, status) => {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    return await response.json();
};
