const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Official Shiprocket Tax Invoice Downloader
 * Opens the official printable Tax Invoice document file directly from the Shiprocket engine.
 */
export async function downloadOrderInvoicePdf(order) {
  if (!order) {
    alert('Order details not found for invoice download.');
    return;
  }

  const orderId = order.id || order.shiprocket_order_id || order.order_number;
  if (!orderId) {
    alert('Order identifier is missing.');
    return;
  }

  // Open the printable Tax Invoice file directly in a new tab
  const invoiceEndpoint = `${API_BASE}/shiprocket/orders/invoice/${orderId}`;
  window.open(invoiceEndpoint, '_blank');
}
