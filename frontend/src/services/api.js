const BASE = '/api';

// Get stored token from localStorage
const getToken = () => {
  try {
    const saved = localStorage.getItem('smartstore_auth');
    return saved ? JSON.parse(saved).token : null;
  } catch (_) {
    return null;
  }
};

// Generic fetch with auth header
const authFetch = (url, options = {}) => {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Request failed');
    return data;
  });
};

export const api = {
  // Auth
  login:    (body)    => authFetch(`${BASE}/auth/login`, { method: 'POST', body: JSON.stringify(body) }),
  me:       ()        => authFetch(`${BASE}/auth/me`),

  // Read
  dashboard: ()       => authFetch(`${BASE}/dashboard`),
  products:  ()       => authFetch(`${BASE}/products`),
  inventory: ()       => authFetch(`${BASE}/inventory`),
  // Customers
  customers:       ()       => authFetch(`${BASE}/customers`),
  addCustomer:     (body)   => authFetch(`${BASE}/customers`, { method: 'POST', body: JSON.stringify(body) }),
  deleteCustomer:  (id)     => authFetch(`${BASE}/customers/${id}`, { method: 'DELETE' }),
  sales:     ()       => authFetch(`${BASE}/sales`),
  transfers: ()       => authFetch(`${BASE}/transfers`),
  expiry:    ()       => authFetch(`${BASE}/expiry`),

  // Stores
  stores:     ()       => authFetch(`${BASE}/stores`),

  // Product CRUD
  addProduct:    (body)    => authFetch(`${BASE}/products`,     { method: 'POST',   body: JSON.stringify(body) }),
  updateProduct: (id, body) => authFetch(`${BASE}/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id)      => authFetch(`${BASE}/products/${id}`, { method: 'DELETE' }),

  // Transfers
  createTransfer: (body)   => authFetch(`${BASE}/transfers`,    { method: 'POST', body: JSON.stringify(body) }),
};
