/**
 * Utility to directly generate and trigger PDF download for Tax Invoices
 * Matching the exact official Delhivery / Indian E-Commerce standard layout
 * WITHOUT opening any on-screen modal preview.
 */

export async function downloadOrderInvoicePdf(order) {
  if (!order) {
    alert('Order details not found for invoice download.');
    return;
  }

  const addr = typeof order.shipping_address === 'string'
    ? JSON.parse(order.shipping_address)
    : (order.shipping_address || {});

  const billingAddr = typeof order.billing_address === 'string'
    ? JSON.parse(order.billing_address)
    : (order.billing_address || addr);

  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [];

  const invoiceNum = `INV-${order.order_number.replace('OCT9-', '')}`;
  const salesNum = `SO-${order.order_number.replace('OCT9-', '')}`;
  const rawDate = new Date(order.created_at || Date.now());
  const formattedDate = rawDate.toISOString().replace('T', ' ').substring(0, 19);

  const discountAmount = Number(order.discount_amount || 0);
  const grandTotal = Number(order.grand_total || 0);
  const isCOD = order.payment_method === 'cod';
  const waybill = order.delhivery_waybill || '';

  // Create temporary off-screen container for PDF rendering
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '794px'; // Standard A4 width in px at 96 DPI
  container.style.backgroundColor = '#FFFFFF';
  container.style.color = '#222222';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  container.style.fontSize = '12px';
  container.style.lineHeight = '1.45';
  container.style.padding = '32px 36px';

  container.innerHTML = `
    <div style="background: #FFFFFF; padding: 10px;">
      <!-- Title -->
      <h1 style="font-size: 22px; font-weight: 800; color: #111; margin-bottom: 4px;">Tax Invoice</h1>
      <div style="font-size: 13px; color: #333; margin-bottom: 2px;">Invoice No: <strong>${invoiceNum}</strong></div>
      <div style="font-size: 13px; color: #333; margin-bottom: 14px;">Date: ${formattedDate}</div>

      <!-- BILL FROM -->
      <div style="margin-top: 14px; margin-bottom: 14px;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #111; margin-bottom: 3px;">BILL FROM</div>
        <div style="font-size: 13px; font-weight: 700; color: #111;">OCT9 Luxury Apparel Pvt. Ltd.</div>
        <div style="font-size: 12px; color: #333; line-height: 1.4;">
          Plot 42, Okhla Industrial Area Phase-III<br />
          New Delhi - 110020, Delhi, IN<br />
          Email: care@oct9.in • GSTIN: 07AAFCO9999P1Z8
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #E2E2E2; margin: 14px 0;" />

      <!-- 2-Col Address -->
      <div style="display: table; width: 100%; margin-bottom: 14px;">
        <div style="display: table-cell; width: 50%; vertical-align: top; padding-right: 15px;">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #111; margin-bottom: 3px;">SHIPPING ADDRESS</div>
          <div style="font-size: 13px; font-weight: 700; color: #111;">${order.customer_name}</div>
          <div style="font-size: 12px; color: #333; line-height: 1.4;">
            ${addr.address_line1 || ''} ${addr.address_line2 || ''}<br />
            ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}<br />
            Email: ${order.customer_email || ''} • Phone: +91 ${order.customer_phone || ''}
          </div>
        </div>

        <div style="display: table-cell; width: 50%; vertical-align: top; padding-left: 15px;">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #111; margin-bottom: 3px;">BILLING ADDRESS</div>
          <div style="font-size: 13px; font-weight: 700; color: #111;">${order.customer_name}</div>
          <div style="font-size: 12px; color: #333; line-height: 1.4;">
            ${billingAddr.address_line1 || addr.address_line1 || ''} ${billingAddr.address_line2 || ''}<br />
            ${billingAddr.city || addr.city || ''}, ${billingAddr.state || addr.state || ''} - ${billingAddr.pincode || addr.pincode || ''}<br />
            Email: ${order.customer_email || ''} • Phone: +91 ${order.customer_phone || ''}
          </div>
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #E2E2E2; margin: 14px 0;" />

      <!-- ORDER DETAILS -->
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #111; margin-bottom: 4px;">ORDER DETAILS</div>
        <div style="font-size: 12px; color: #333;">Sales Number: <strong>${salesNum}</strong></div>
        <div style="font-size: 12px; color: #333;">AWB Number: <strong style="font-family: monospace;">${waybill || 'Pending Allocation'}</strong></div>
        <div style="font-size: 12px; color: #333;">Sale Date: <strong>${formattedDate}</strong></div>
      </div>

      <!-- Itemized Table -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 12px; font-size: 11px;">
        <thead>
          <tr style="background-color: #F8F8F8; color: #111; text-align: left; border-top: 1px solid #E2E2E2; border-bottom: 1px solid #E2E2E2;">
            <th style="padding: 8px 10px; width: 34%;">Item Description</th>
            <th style="padding: 8px 6px; width: 14%;">SKU Code</th>
            <th style="padding: 8px 6px; text-align: center; width: 8%;">Qty</th>
            <th style="padding: 8px 6px; text-align: right; width: 11%;">Rate</th>
            <th style="padding: 8px 6px; text-align: right; width: 9%;">Disc</th>
            <th style="padding: 8px 6px; text-align: right; width: 12%;">Taxable</th>
            <th style="padding: 8px 6px; text-align: right; width: 10%;">Tax</th>
            <th style="padding: 8px 10px; text-align: right; width: 12%;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(it => {
            const qty = Number(it.quantity || 1);
            const lineTotal = Number(it.total || it.price * qty);
            const tax = (lineTotal * 5) / 105;
            const taxable = lineTotal - tax;
            const rate = Number(it.price);
            const skuCode = `OCT9-${it.product_id || 'ETH'}${it.size ? `-${it.size}` : ''}`;

            return `
              <tr style="border-bottom: 1px solid #EEEEEE;">
                <td style="padding: 9px 10px;">
                  <strong style="color: #111;">${it.product_title}</strong>
                  <div style="font-size: 10px; color: #666;">Size: ${it.size || 'Free Size'}${it.color ? ` | Color: ${it.color}` : ''}</div>
                </td>
                <td style="padding: 9px 6px; font-family: monospace; color: #555;">${skuCode}</td>
                <td style="padding: 9px 6px; text-align: center; font-weight: 700;">${qty}</td>
                <td style="padding: 9px 6px; text-align: right;">INR ${rate.toFixed(0)}</td>
                <td style="padding: 9px 6px; text-align: right;">INR 0</td>
                <td style="padding: 9px 6px; text-align: right;">INR ${taxable.toFixed(1)}</td>
                <td style="padding: 9px 6px; text-align: right;">INR ${tax.toFixed(0)}</td>
                <td style="padding: 9px 10px; text-align: right; font-weight: 700;">INR ${lineTotal.toFixed(0)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Discount & Totals -->
      <div style="border-top: 1px solid #E2E2E2; padding-top: 10px; margin-top: 8px;">
        <div style="text-align: right; font-size: 12px; font-weight: 700; margin-bottom: 10px; padding-right: 10px;">
          Discount &nbsp;&nbsp;&nbsp;&nbsp; INR ${discountAmount.toFixed(0)}
        </div>

        <div style="display: table; width: 100%; font-size: 13px; padding: 0 10px;">
          <div style="display: table-cell; width: 50%; vertical-align: middle;">
            <div style="font-weight: 800; color: #111; margin-bottom: 2px;">Payment Type</div>
            <div style="color: #444;">${isCOD ? 'Cash on Delivery (COD)' : 'Prepaid (Razorpay Online)'}</div>
          </div>
          <div style="display: table-cell; width: 50%; text-align: right; vertical-align: middle; font-weight: 800; font-size: 14px; color: #111;">
            Total &nbsp;&nbsp;&nbsp;&nbsp; <span style="color: #5A1827; font-size: 16px;">INR ${grandTotal.toFixed(0)}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; font-size: 11px; color: #666; margin-top: 32px; padding-top: 12px; border-top: 1px solid #EAEAEA; font-weight: 600;">
        Powered by Delhivery
      </div>
    </div>
  `;

  document.body.appendChild(container);

  const filename = `Tax_Invoice_${order.order_number}.pdf`;

  if (window.html2pdf) {
    const opt = {
      margin: [6, 6, 6, 6],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await window.html2pdf().set(opt).from(container).save();
    } catch (e) {
      console.error('html2pdf download error:', e);
      window.open(`/api/orders/${order.order_number}/invoice`, '_blank');
    } finally {
      document.body.removeChild(container);
    }
  } else {
    document.body.removeChild(container);
    window.open(`/api/orders/${order.order_number}/invoice`, '_blank');
  }
}
