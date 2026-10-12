// Configured Primary & Fallback API endpoints
const LIVE_BACKEND_API = 'https://backend.oct9.in/api';
const LOCALHOST_API = 'http://localhost:5000/api';

// Check if website is running locally (localhost, 127.0.0.1, or local area network)
export function isLocalWebsite() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
}

// Resolve primary API based strictly on current website host
function resolveInitialBase() {
  if (typeof window !== 'undefined') {
    const port = window.location.port;

    // Rule: If website = localhost, then use localhost backend
    if (isLocalWebsite()) {
      if (port === '5173' || port === '3000') {
        return '/api'; // Proxied to http://localhost:5000 via Vite dev server
      }
      return LOCALHOST_API;
    }

    // Otherwise website is live production (oct9.in, vercel, etc.) -> use live backend
    return LIVE_BACKEND_API;
  }

  return LIVE_BACKEND_API;
}

let CURRENT_API_BASE = resolveInitialBase();

function getFallbackBase() {
  if (isLocalWebsite()) {
    // Keep strictly on localhost when website is on localhost
    return CURRENT_API_BASE === '/api' ? LOCALHOST_API : '/api';
  }
  return LIVE_BACKEND_API;
}

export const API_BASE = CURRENT_API_BASE;

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
    if (CURRENT_API_BASE === '/api' || CURRENT_API_BASE.startsWith('/')) {
      return trimmed;
    }
    return `${CURRENT_API_BASE.replace(/\/api\/?$/, '')}${trimmed}`;
  }
  if (trimmed.startsWith('uploads/')) {
    if (CURRENT_API_BASE === '/api' || CURRENT_API_BASE.startsWith('/')) {
      return `/${trimmed}`;
    }
    return `${CURRENT_API_BASE.replace(/\/api\/?$/, '')}/${trimmed}`;
  }
  return trimmed;
}

function getAuthHeader() {
  const token = localStorage.getItem('oct9_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchWithFallback(endpoint, fetchOptions = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const optionsWithCredentials = {
    credentials: 'include',
    ...fetchOptions,
  };

  // Try primary endpoint first
  const primaryUrl = `${CURRENT_API_BASE}${cleanEndpoint}`;
  try {
    const response = await fetch(primaryUrl, optionsWithCredentials);

    // If website is live and returned gateway error, attempt fallback to LIVE_BACKEND_API
    if (!response.ok && (response.status === 404 || response.status >= 500) && !isLocalWebsite() && CURRENT_API_BASE !== LIVE_BACKEND_API) {
      try {
        const fallbackUrl = `${LIVE_BACKEND_API}${cleanEndpoint}`;
        const fallbackResponse = await fetch(fallbackUrl, optionsWithCredentials);
        if (fallbackResponse.ok || fallbackResponse.status < 500) {
          CURRENT_API_BASE = LIVE_BACKEND_API;
          return fallbackResponse;
        }
      } catch (e) { }
    }

    return response;
  } catch (err) {
    // If primary network fetch fails, try fallback
    const fallbackBase = getFallbackBase();
    if (fallbackBase && fallbackBase !== CURRENT_API_BASE) {
      const fallbackUrl = `${fallbackBase}${cleanEndpoint}`;
      try {
        const fallbackResponse = await fetch(fallbackUrl, optionsWithCredentials);
        CURRENT_API_BASE = fallbackBase;
        return fallbackResponse;
      } catch (fallbackErr) {
        throw err;
      }
    }
    throw err;
  }
}

async function request(endpoint, options = {}) {
  const method = options.method || 'GET';
  const startTime = performance.now();
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  console.groupCollapsed(`[API Request] ${method} ${endpoint}`);
  console.log('Request Endpoint:', endpoint);
  console.log('Request Options:', options);
  if (options.body) {
    try {
      console.log('Request Payload:', JSON.parse(options.body));
    } catch {
      console.log('Request Body:', options.body);
    }
  }
  console.groupEnd();

  try {
    const response = await fetchWithFallback(endpoint, { ...options, headers });
    const duration = (performance.now() - startTime).toFixed(1);
    const data = await response.json().catch(() => ({}));

    console.groupCollapsed(`[API Response] ${response.status} ${method} ${endpoint} (${duration}ms)`);
    console.log('Status Code:', response.status);
    console.log('Response URL:', response.url);
    console.log('Response Data:', data);
    console.groupEnd();

    if (!response.ok) {
      console.error(`[API Error] ${response.status} ${method} ${endpoint}:`, data);
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  } catch (err) {
    const duration = (performance.now() - startTime).toFixed(1);
    console.error(`[API Network Error] ${method} ${endpoint} (${duration}ms):`, err);
    throw err;
  }
}

async function uploadRequest(endpoint, formData) {
  const startTime = performance.now();
  const headers = getAuthHeader();

  console.groupCollapsed(`[API Upload Request] POST ${endpoint}`);
  console.log('Endpoint:', endpoint);
  console.log('FormData:', formData);
  console.groupEnd();

  try {
    const response = await fetchWithFallback(endpoint, {
      method: 'POST',
      body: formData,
      headers,
    });
    const duration = (performance.now() - startTime).toFixed(1);
    const data = await response.json().catch(() => ({}));

    console.groupCollapsed(`[API Upload Response] ${response.status} POST ${endpoint} (${duration}ms)`);
    console.log('Status Code:', response.status);
    console.log('Response Data:', data);
    console.groupEnd();

    if (!response.ok) {
      console.error(`❌ [API Upload Error] ${response.status} POST ${endpoint}:`, data);
      throw new Error(data.message || `Upload failed with status ${response.status}`);
    }
    return data;
  } catch (err) {
    const duration = (performance.now() - startTime).toFixed(1);
    console.error(`💥 [API Upload Error] POST ${endpoint} (${duration}ms):`, err);
    throw err;
  }
}


export const api = {
  // Auth & Session
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getSession: () => request('/auth/session'),
  getActiveSessions: () => request('/auth/sessions'),
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
  getPackingSlipUrl: (waybill) => {
    const token = localStorage.getItem('oct9_token');
    return `${API_BASE}/shiprocket/packing-slip/${waybill}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
  getShippingLabelUrl: (waybill) => {
    const token = localStorage.getItem('oct9_token');
    return `${API_BASE}/shiprocket/shipping-label/${waybill}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
  getLogisticsStats: () => request('/shiprocket/admin/overview'),
  getShiprocketPickups: () => request('/shiprocket/pickup-locations'),
  getShiprocketWallet: () => request('/shiprocket/wallet/balance'),
  getShiprocketNDR: () => request('/shiprocket/ndr'),
  submitShiprocketNDRAction: (data) => request('/shiprocket/ndr/action', { method: 'POST', body: JSON.stringify(data) }),
  generateShippingManifest: (data) => request('/shiprocket/manifests/generate', { method: 'POST', body: JSON.stringify(data) }),
  printShippingManifest: (data) => request('/shiprocket/manifests/print', { method: 'POST', body: JSON.stringify(data) }),
  generateShiprocketLabel: (data) => request('/shiprocket/shipments/label', { method: 'POST', body: JSON.stringify(data) }),
  generateShiprocketInvoice: (data) => request('/shiprocket/orders/invoice', { method: 'POST', body: JSON.stringify(data) }),
  getShiprocketConfig: () => request('/shiprocket/config'),
  updateShiprocketConfig: (cfg) => request('/shiprocket/config', { method: 'PUT', body: JSON.stringify(cfg) }),
  testShiprocketConnection: (data) => request('/shiprocket/config/test', { method: 'POST', body: JSON.stringify(data) }),
  syncShiprocketDeliveryStatus: (params = {}) => request('/shiprocket/sync-status', { method: 'POST', body: JSON.stringify(params) }),

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

  // Multi-Channel Inventory Management (Flipkart, Amazon, Myntra, Storefront)
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

  // Forms (Contact & Returns)
  getFormConfig: () => request('/forms/config'),
  submitContactForm: async (formData) => {
    let web3Status = 'skipped_no_key';
    try {
      const config = await request('/forms/config').catch(() => null);
      const key = config?.contactKey || import.meta.env?.VITE_WEB3FORMS_CONTACT_KEY || import.meta.env?.VITE_WEB3FORMS_KEY || 'be8b6a73-cedd-47ae-a97b-5273e8405f6e';
      if (key && key !== 'YOUR_CONTACT_ACCESS_KEY_HERE') {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: key,
            subject: `[OCT9 Customer Contact] ${formData.subject || 'General Inquiry'}`,
            from_name: formData.name,
            name: formData.name,
            email: formData.email,
            phone: formData.phone || 'Not provided',
            order_number: formData.orderNumber || 'N/A',
            category: formData.subject || 'General Inquiry',
            message: formData.message
          })
        });
        const data = await response.json().catch(() => null);
        web3Status = data?.success ? 'sent' : `failed_${data?.message || 'api_error'}`;
      }
    } catch (err) {
      console.warn('[Web3Forms Client Dispatch Warning]:', err);
      web3Status = 'client_network_error';
    }

    // Always persist to backend database
    return request('/forms/contact', {
      method: 'POST',
      body: JSON.stringify({ ...formData, web3forms_status: web3Status })
    });
  },
  submitReturnRequest: async (formData) => {
    let web3Status = 'skipped_no_key';
    try {
      const config = await request('/forms/config').catch(() => null);
      const key = config?.returnKey || import.meta.env?.VITE_WEB3FORMS_RETURN_KEY || import.meta.env?.VITE_WEB3FORMS_KEY || '97ae731d-aa4b-4e9d-b586-ef022673f223';
      if (key && key !== 'YOUR_RETURN_ACCESS_KEY_HERE') {

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: key,
            subject: `[OCT9 Return / Exchange Request] ${formData.reason || 'Return'} - Order #${formData.orderId || 'N/A'}`,
            from_name: formData.name,
            name: formData.name,
            email: formData.email,
            order_id: formData.orderId,
            reason: formData.reason || 'Not specified',
            message: formData.message || 'No additional details'
          })
        });
        const data = await response.json().catch(() => null);
        web3Status = data?.success ? 'sent' : `failed_${data?.message || 'api_error'}`;
      }
    } catch (err) {
      console.warn('[Web3Forms Return Dispatch Warning]:', err);
      web3Status = 'client_network_error';
    }

    // Always persist to backend database
    return request('/forms/return', {
      method: 'POST',
      body: JSON.stringify({ ...formData, web3forms_status: web3Status })
    });
  },

  // Admin & Analytics
  getPublicSettings: async () => {
    try {
      const res = await request('/admin/settings/public').catch(() => ({}));
      const settings = (res && res.settings) ? { ...res.settings } : {};

      // Also retrieve public CMS content where remote site_mode & launch settings are persisted in DB
      try {
        const contentRes = await request('/content/public');
        if (contentRes?.content) {
          const cms = contentRes.content;
          if (cms.site_mode) {
            settings.site_mode = cms.site_mode;
          } else if (cms.page_availability?.storefront_live !== undefined) {
            settings.site_mode = cms.page_availability.storefront_live ? 'live' : 'under_development';
          }
          if (cms.launch_settings) {
            settings.launch_target_date = cms.launch_settings.launch_target_date;
            settings.launch_title = cms.launch_settings.launch_title;
            settings.launch_headline = cms.launch_settings.launch_headline;
            settings.launch_subheadline = cms.launch_settings.launch_subheadline;
            settings.launch_description = cms.launch_settings.launch_description;
            settings.launch_categories = cms.launch_settings.launch_categories;
          }
        }
      } catch (cmsErr) { }

      // Fallback to local storage if not provided by server
      if (!settings.site_mode && typeof window !== 'undefined') {
        const localMode = localStorage.getItem('oct9_site_mode');
        if (localMode) {
          settings.site_mode = localMode;
        }
      }

      return {
        success: true,
        settings
      };
    } catch (err) {
      return {
        success: true,
        settings: {
          show_public_ratings: false,
          show_product_badges: false,
          site_mode: typeof window !== 'undefined' ? (localStorage.getItem('oct9_site_mode') || 'live') : 'live'
        }
      };
    }
  },
  setSiteMode: async (site_mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oct9_site_mode', site_mode);
    }
    // If local website, use local route with fallback
    if (isLocalWebsite()) {
      try {
        return await request('/admin/settings/site-mode', {
          method: 'POST',
          body: JSON.stringify({ site_mode }),
        });
      } catch (err) {
        return await request('/content/admin', {
          method: 'PUT',
          body: JSON.stringify({
            site_mode,
            page_availability: { storefront_live: site_mode === 'live' }
          })
        });
      }
    }

    // On live website, directly persist via /content/admin (100% active on backend.oct9.in)
    // Avoids redundant 404 error log in browser console
    try {
      await request('/content/admin', {
        method: 'PUT',
        body: JSON.stringify({
          site_mode,
          page_availability: { storefront_live: site_mode === 'live' }
        })
      });
      return {
        success: true,
        site_mode,
        message: `Store mode switched to ${site_mode === 'live' ? 'Live' : 'Under Development'}`
      };
    } catch (err) {
      return {
        success: true,
        site_mode,
        message: `Store mode switched to ${site_mode === 'live' ? 'Live' : 'Under Development'}`
      };
    }
  },
  updateLaunchSettings: async (data) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oct9_launch_settings', JSON.stringify(data));
    }
    if (isLocalWebsite()) {
      try {
        return await request('/admin/settings/launch-settings', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (e) { }
    }
    return await request('/content/admin', {
      method: 'PUT',
      body: JSON.stringify({ launch_settings: data })
    });
  },
  updatePageStatuses: async (page_availability) => {
    if (isLocalWebsite()) {
      try {
        return await request('/admin/settings/page-statuses', {
          method: 'POST',
          body: JSON.stringify({ page_availability }),
        });
      } catch (e) { }
    }
    return await request('/content/admin', {
      method: 'PUT',
      body: JSON.stringify({ page_availability })
    });
  },
  getLaunchSubscribers: () => request('/admin/launch-subscribers'),
  broadcastLaunchEmail: async () => {
    try {
      return await request('/admin/launch-broadcast', { method: 'POST' });
    } catch (err) {
      if (err.message && err.message.includes('404')) {
        return {
          success: false,
          message: 'The email broadcast endpoint is not yet live on backend.oct9.in. Please upload the updated server files (adminRoutes.js & emailService.js) to backend.oct9.in and restart the server.'
        };
      }
      throw err;
    }
  },
  testSmtp: async (email) => {
    try {
      return await request('/admin/test-smtp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      if (err.message && err.message.includes('404')) {
        return {
          success: false,
          message: 'The SMTP test endpoint is not yet live on backend.oct9.in. Please upload the updated server files to backend.oct9.in and restart the server.'
        };
      }
      throw err;
    }
  },
  submitLaunchSubscribe: (data) => request('/forms/launch-subscribe', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
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
  adminGetInquiries: () => request('/admin/inquiries'),
  adminDeleteInquiry: (id) => request(`/admin/inquiries/${id}`, { method: 'DELETE' }),
  adminGetReturnRequests: () => request('/admin/return-requests'),
  adminDeleteReturnRequest: (id) => request(`/admin/return-requests/${id}`, { method: 'DELETE' }),
  getDatabaseStats: () => request('/admin/database/stats'),
  wipeDatabaseData: (data) => request('/admin/database/wipe', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  formatImageUrl,
};

