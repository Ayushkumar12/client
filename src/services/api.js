const SERVER_API = import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : `${window.location.protocol}//${window.location.hostname}:5000/api`;

const API_BASE = SERVER_API;

export function formatImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/')) {
    return `${API_BASE.replace(/\/api\/?$/, '')}${trimmed}`;
  }
  if (trimmed.startsWith('uploads/')) {
    return `${API_BASE.replace(/\/api\/?$/, '')}/${trimmed}`;
  }
  return trimmed;
}

function getAuthHeader() {
  const token = localStorage.getItem('oct9_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  const response = await fetch(url, { ...options, headers });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

async function uploadRequest(endpoint, formData) {
  const headers = getAuthHeader();

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
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return request(`/products?${query.toString()}`);
  },
  getProduct: (slugOrId) => request(`/products/${slugOrId}`),
  getCategories: () => request('/products/categories'),
  addReview: (productId, review) => request(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(review) }),
  createProduct: (product) => request('/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id, product) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Orders & Payments
  createOrder: (orderData) => request('/orders/create', { method: 'POST', body: JSON.stringify(orderData) }),
  verifyPayment: (paymentData) => request('/orders/verify-payment', { method: 'POST', body: JSON.stringify(paymentData) }),
  getUserOrders: () => request('/orders/my-orders'),
  getOrderDetails: (orderIdentifier) => request(`/orders/track/${orderIdentifier}`),
  cancelOrder: (id, cancelData) => request(`/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify(cancelData) }),
  requestReturn: (id, returnData) => request(`/orders/${id}/return`, { method: 'POST', body: JSON.stringify(returnData) }),
  adminGetAllOrders: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/orders/admin/all?${query.toString()}`);
  },
  adminGetReturns: () => request('/orders/admin/returns'),
  adminReviewReturn: (id, reviewData) => request(`/orders/admin/${id}/return-action`, { method: 'POST', body: JSON.stringify(reviewData) }),
  adminUpdateOrderStatus: (id, statusData) => request(`/orders/admin/${id}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
  adminGenerateShiprocketWaybill: (id) => request(`/orders/admin/${id}/generate-waybill`, { method: 'POST' }),
  adminGenerateDelhiveryWaybill: (id) => request(`/orders/admin/${id}/generate-waybill`, { method: 'POST' }),

  // Logistics & Shiprocket API
  checkPincode: (pincode, options = {}) => {
    const query = new URLSearchParams(options);
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return request(`/shiprocket/pincode/${pincode}${qStr}`);
  },
  trackWaybill: (waybill) => request(`/shiprocket/track/${waybill}`),
  trackShipment: (shipmentId) => request(`/shiprocket/track/shipment/${shipmentId}`),
  getShippingRate: (params) => {
    const query = new URLSearchParams(params);
    return request(`/shiprocket/rate-estimate?${query.toString()}`);
  },
  getCouriers: () => request('/shiprocket/couriers'),
  getInternationalServiceability: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/shiprocket/international-serviceability?${query.toString()}`);
  },
  getPackingSlipUrl: (waybill) => `${API_BASE}/shiprocket/packing-slip/${waybill}`,
  getShippingLabelUrl: (waybill) => `${API_BASE}/shiprocket/shipping-label/${waybill}`,
  getLogisticsStats: () => request('/shiprocket/admin/overview'),
  getShiprocketPickups: () => request('/shiprocket/pickup-locations'),
  getShiprocketWallet: () => request('/shiprocket/wallet/balance'),
  getShiprocketNDR: () => request('/shiprocket/ndr'),
  submitShiprocketNDRAction: (data) => request('/shiprocket/ndr/action', { method: 'POST', body: JSON.stringify(data) }),
  requestShipmentPickup: (data) => request('/shiprocket/shipments/pickup', { method: 'POST', body: JSON.stringify(data) }),
  generateShippingManifest: (data) => request('/shiprocket/manifests/generate', { method: 'POST', body: JSON.stringify(data) }),
  printShippingManifest: (data) => request('/shiprocket/manifests/print', { method: 'POST', body: JSON.stringify(data) }),

  // Coupons
  validateCoupon: (code, cartTotal) => request('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, cart_total: cartTotal }),
  }),
  getAllCoupons: () => request('/coupons/admin/all'),
  createCoupon: (coupon) => request('/coupons/admin/create', { method: 'POST', body: JSON.stringify(coupon) }),
  deleteCoupon: (id) => request(`/coupons/admin/${id}`, { method: 'DELETE' }),

  // Media & Image Upload
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

  // CMS & Site Content
  getPublicContent: () => request('/content/public'),
  getAdminContent: () => request('/content/admin'),
  updateAdminContent: (contentData) => request('/content/admin', {
    method: 'PUT',
    body: JSON.stringify(contentData)
  }),
  resetAdminContent: (section) => request('/content/admin/reset', {
    method: 'POST',
    body: JSON.stringify({ section })
  }),

  // Multi-Channel Inventory Management (Flipkart, Amazon, Meesho, Storefront)
  getInventoryOverview: () => request('/inventory/overview'),
  getInventoryProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return request(`/inventory/products?${query.toString()}`);
  },
  updateMasterStock: (productId, data) => request(`/inventory/products/${productId}/stock`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  updateChannelListing: (productId, channelKey, data) => request(`/inventory/products/${productId}/channel/${channelKey}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  bulkSyncAllChannels: () => request('/inventory/sync-all', { method: 'POST' }),
  syncSingleProduct: (productId) => request(`/inventory/products/${productId}/sync`, { method: 'POST' }),
  getChannelConfigs: () => request('/inventory/channels'),
  updateChannelConfig: (channelKey, data) => request(`/inventory/channels/${channelKey}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  testChannelConnection: (channelKey) => request(`/inventory/channels/${channelKey}/test-connection`, {
    method: 'POST'
  }),
  getInventoryLogs: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/inventory/logs?${query.toString()}`);
  },
  simulateMarketplaceOrder: (data) => request('/inventory/simulate-order', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Admin & Analytics
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

  formatImageUrl,
};

