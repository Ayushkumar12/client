import { API_BASE } from '../services/api.js';

/**
 * Official Shiprocket Tax Invoice Downloader
 * Opens the official printable Tax Invoice document file directly from the Shiprocket engine.
 */
export async function downloadOrderInvoicePdf(order) {
  if (!order) {
    alert('Order details not found for invoice download.');
    return;
  }

  const orderIdentifier = order.order_number || order.id || order.shiprocket_order_id;
  if (!orderIdentifier) {
    alert('Order identifier is missing.');
    return;
  }

  const params = new URLSearchParams();
  if (order.customer_email) {
    params.set('email', order.customer_email);
  } else if (order.customer_phone) {
    params.set('phone', order.customer_phone);
  }
  const token = localStorage.getItem('oct9_token');
  if (token) {
    params.set('token', token);
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const invoiceEndpoint = `${API_BASE}/shiprocket/orders/invoice/${encodeURIComponent(orderIdentifier)}${queryString}`;
  
  // Safe trigger via DOM anchor to bypass aggressive browser popup blockers
  const link = document.createElement('a');
  link.href = invoiceEndpoint;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 100);
}

