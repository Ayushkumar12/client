const LIVE_SERVER_API = 'https://5nbb03kw-5000.inc1.devtunnels.ms/api';

function getApiBaseUrl() {
  return LIVE_SERVER_API;
}

const API_BASE = getApiBaseUrl();

function getAuthHeader() {
  const token = localStorage.getItem('oct9_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Tunnel-Skip-AntiPhishing-Page': 'true',
    'bypass-tunnel-reminder': 'true',
    ...getAuthHeader(),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => request('/auth/profile'),
  saveAddress: (address) => request('/auth/address', { method: 'POST', body: JSON.stringify(address) }),
  deleteAddress: (id) => request(`/auth/address/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    return request(`/products?${query.toString()}`);
  },
  getProduct: (slugOrId) => request(`/products/${slugOrId}`),
  getCategories: () => request('/products/categories'),
  addReview: (productId, review) => request(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(review) }),
  createProduct: (product) => request('/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id, product) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Orders
  createOrder: (orderData) => request('/orders/create', { method: 'POST', body: JSON.stringify(orderData) }),
  verifyPayment: (paymentData) => request('/orders/verify-payment', { method: 'POST', body: JSON.stringify(paymentData) }),
  getUserOrders: () => request('/orders/my-orders'),
  getOrderDetails: (orderIdentifier) => request(`/orders/track/${orderIdentifier}`),
  adminGetAllOrders: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/orders/admin/all?${query.toString()}`);
  },
  adminUpdateOrderStatus: (id, statusData) => request(`/orders/admin/${id}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
  adminGenerateDelhiveryWaybill: (id) => request(`/orders/admin/${id}/generate-waybill`, { method: 'POST' }),

  // Delhivery Logistics
  checkPincode: (pincode) => request(`/delhivery/pincode/${pincode}`),
  trackWaybill: (waybill) => request(`/delhivery/track/${waybill}`),
  getShippingRate: (params) => {
    const query = new URLSearchParams(params);
    return request(`/delhivery/rate-estimate?${query.toString()}`);
  },
  getLogisticsStats: () => request('/delhivery/admin/overview'),

  // Coupons
  validateCoupon: (code, cartTotal) => request('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, cart_total: cartTotal }),
  }),
  getAllCoupons: () => request('/coupons/admin/all'),
  createCoupon: (coupon) => request('/coupons/admin/create', { method: 'POST', body: JSON.stringify(coupon) }),
  deleteCoupon: (id) => request(`/coupons/admin/${id}`, { method: 'DELETE' }),

  // Admin Analytics
  getDashboardMetrics: () => request('/admin/dashboard'),
  getCustomers: () => request('/admin/customers'),
};
