const LIVE_SERVER_API = 'https://5nbb03kw-5000.inc1.devtunnels.ms/api';

function getApiBaseUrl() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  return LIVE_SERVER_API.replace(/\/+$/, '');
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

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
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

async function uploadRequest(endpoint, formData) {
  const headers = {
    'X-Tunnel-Skip-AntiPhishing-Page': 'true',
    'bypass-tunnel-reminder': 'true',
    ...getAuthHeader(),
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Upload failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  saveAddress: (address) => request('/auth/address', { method: 'POST', body: JSON.stringify(address) }),
  updateAddress: (id, address) => request(`/auth/address/${id}`, { method: 'PUT', body: JSON.stringify(address) }),
  setDefaultAddress: (id) => request(`/auth/address/${id}/default`, { method: 'PUT' }),
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

  // Orders & Payments (Razorpay + Shiprocket)
  createOrder: async (orderData) => {
    console.log('🛍️ [Frontend API] createOrder request:', orderData);
    const res = await request('/orders/create', { method: 'POST', body: JSON.stringify(orderData) });
    console.log('💳 [Razorpay / Order API Response]:', res);
    return res;
  },
  verifyPayment: async (paymentData) => {
    console.log('💳 [Frontend API] verifyPayment request payload:', paymentData);
    const res = await request('/orders/verify-payment', { method: 'POST', body: JSON.stringify(paymentData) });
    console.log('💳 [Razorpay Signature & Shiprocket Manifest Response]:', res);
    return res;
  },
  getUserOrders: () => request('/orders/my-orders'),
  getOrderDetails: async (orderIdentifier) => {
    const res = await request(`/orders/track/${orderIdentifier}`);
    console.log(`📦 [Order Details & Shiprocket Info for #${orderIdentifier}]:`, res);
    return res;
  },
  adminGetAllOrders: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/orders/admin/all?${query.toString()}`);
  },
  adminUpdateOrderStatus: (id, statusData) => request(`/orders/admin/${id}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
  adminGenerateShiprocketWaybill: async (id) => {
    const res = await request(`/orders/admin/${id}/generate-waybill`, { method: 'POST' });
    console.log(`🚀 [Shiprocket Admin AWB Generation Response for Order ${id}]:`, res);
    return res;
  },
  adminGenerateDelhiveryWaybill: async (id) => {
    const res = await request(`/orders/admin/${id}/generate-waybill`, { method: 'POST' });
    console.log(`🚀 [Shiprocket Admin AWB Generation Response for Order ${id}]:`, res);
    return res;
  },

  // Shiprocket Logistics
  checkPincode: async (pincode, options = {}) => {
    console.log(`🚀 [Shiprocket API] Checking serviceability for PIN: ${pincode}`);
    const query = new URLSearchParams(options);
    const qStr = query.toString() ? `?${query.toString()}` : '';
    const res = await request(`/shiprocket/pincode/${pincode}${qStr}`);
    console.log(`🚀 [Shiprocket Pincode Response for ${pincode}]:`, res);
    return res;
  },
  trackWaybill: async (waybill) => {
    console.log(`🚀 [Shiprocket API] Tracking Waybill / AWB: ${waybill}`);
    const res = await request(`/shiprocket/track/${waybill}`);
    console.log(`🚀 [Shiprocket Live Tracking Response for ${waybill}]:`, res);
    return res;
  },
  getShippingRate: async (params) => {
    const query = new URLSearchParams(params);
    const res = await request(`/shiprocket/rate-estimate?${query.toString()}`);
    console.log('🚀 [Shiprocket Shipping Rate Estimate Response]:', res);
    return res;
  },
  getPackingSlipUrl: (waybill) => `${API_BASE}/shiprocket/packing-slip/${waybill}`,
  getShippingLabelUrl: (waybill) => `${API_BASE}/shiprocket/shipping-label/${waybill}`,
  getLogisticsStats: () => request('/shiprocket/admin/overview'),

  // Coupons
  validateCoupon: (code, cartTotal) => request('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, cart_total: cartTotal }),
  }),
  getAllCoupons: () => request('/coupons/admin/all'),
  createCoupon: (coupon) => request('/coupons/admin/create', { method: 'POST', body: JSON.stringify(coupon) }),
  deleteCoupon: (id) => request(`/coupons/admin/${id}`, { method: 'DELETE' }),

  // Media & Image Upload to SQL Database
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return uploadRequest('/upload/image', formData);
  },
  uploadMultipleImages: async (files) => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('images', f));
    return uploadRequest('/upload/multiple', formData);
  },
  uploadBase64Image: (base64Data, filename = '', originalName = '') => request('/upload/base64', {
    method: 'POST',
    body: JSON.stringify({ base64Data, filename, originalName })
  }),
  getMediaLibrary: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/upload/media?${query.toString()}`);
  },
  deleteMedia: (id) => request(`/upload/media/${id}`, { method: 'DELETE' }),

  // Admin Analytics & Storefront Settings
  getPublicSettings: () => request('/admin/settings/public'),
  getFullAnalytics: () => request('/admin/analytics'),
  togglePublicRatings: (show_public_ratings) => request('/admin/settings/toggle-ratings', {
    method: 'POST',
    body: JSON.stringify({ show_public_ratings }),
  }),
  togglePublicBadges: (show_product_badges) => request('/admin/settings/toggle-badges', {
    method: 'POST',
    body: JSON.stringify({ show_product_badges }),
  }),
  getDashboardMetrics: () => request('/admin/dashboard'),
  getCustomers: () => request('/admin/customers'),
};
