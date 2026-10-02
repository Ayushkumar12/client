/**
 * Native Vector Tax Invoice PDF Generator & Downloader
 * Generates official A4 Tax Invoices matching Indian GST & Delhivery E-Commerce Standards
 * Outputs a 100% valid, crisp vector .pdf file that downloads directly without preview modals.
 */

async function ensureJsPdfLoaded() {
  if (window.jspdf && window.jspdf.jsPDF) {
    return window.jspdf;
  }
  if (window.jsPDF) {
    return { jsPDF: window.jsPDF };
  }

  // Load jsPDF from CDN if not already loaded
  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="jspdf.umd.min.js"]');
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  // Load AutoTable plugin
  if (!window.jspdf?.jsPDF?.prototype?.autoTable) {
    await new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="jspdf.plugin.autotable"]');
      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return window.jspdf || { jsPDF: window.jsPDF };
}

export async function downloadOrderInvoicePdf(order) {
  if (!order) {
    alert('Order details not found for invoice download.');
    return;
  }

  try {
    const jspdfModule = await ensureJsPdfLoaded();
    const { jsPDF } = jspdfModule;

    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    });

    const addr = typeof order.shipping_address === 'string'
      ? JSON.parse(order.shipping_address)
      : (order.shipping_address || {});

    const billingAddr = typeof order.billing_address === 'string'
      ? JSON.parse(order.billing_address)
      : (order.billing_address || addr);

    const items = Array.isArray(order.items) && order.items.length > 0
      ? order.items
      : [
          {
            product_title: 'Luxury Designer Ethnic Wear',
            product_id: 'ETH',
            size: 'Free Size',
            color: 'Standard',
            price: Number(order.grand_total || 1999),
            quantity: 1,
            total: Number(order.grand_total || 1999)
          }
        ];

    const invoiceNum = `INV-${(order.order_number || 'OCT9-2026').replace('OCT9-', '')}`;
    const salesNum = `SO-${(order.order_number || 'OCT9-2026').replace('OCT9-', '')}`;
    const rawDate = new Date(order.created_at || Date.now());
    const formattedDate = rawDate.toISOString().replace('T', ' ').substring(0, 19);

    const discountAmount = Number(order.discount_amount || 0);
    const grandTotal = Number(order.grand_total || 0);
    const isCOD = order.payment_method === 'cod';
    const waybill = order.delhivery_waybill || '';

    // ==========================================
    // 1. HEADER (Title, Invoice No, Date)
    // ==========================================
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Tax Invoice', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    doc.text(`Invoice No: `, 14, 25);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(invoiceNum, 34, 25);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Date: ${formattedDate}`, 14, 30);

    // ==========================================
    // 2. BILL FROM
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text('BILL FROM', 14, 38);

    doc.setFontSize(9.5);
    doc.text('OCT9 Luxury Apparel Pvt. Ltd.', 14, 43);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    doc.text('Plot 42, Okhla Industrial Area Phase-III, New Delhi - 110020, Delhi, IN', 14, 48);
    doc.text('Email: care@oct9.in   •   GSTIN: 07AAFCO9999P1Z8', 14, 53);

    // Divider Line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(14, 58, 196, 58);

    // ==========================================
    // 3. 2-COLUMN ADDRESSES
    // ==========================================
    const leftX = 14;
    const rightX = 108;

    // Left: Shipping Address
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text('SHIPPING ADDRESS', leftX, 65);

    doc.setFontSize(9.5);
    doc.text(order.customer_name || 'Valued Customer', leftX, 70);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    const shipAddrLine1 = `${addr.address_line1 || ''} ${addr.address_line2 || ''}`.trim() || 'Address on file';
    const shipAddrLine2 = `${addr.city || 'Delhi'}, ${addr.state || 'Delhi'} - ${addr.pincode || '110001'}`;
    const shipContact = `Email: ${order.customer_email || ''}  •  Phone: +91 ${order.customer_phone || ''}`;

    doc.text(shipAddrLine1, leftX, 75);
    doc.text(shipAddrLine2, leftX, 80);
    doc.text(shipContact, leftX, 85);

    // Right: Billing Address
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text('BILLING ADDRESS', rightX, 65);

    doc.setFontSize(9.5);
    doc.text(order.customer_name || 'Valued Customer', rightX, 70);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    const billAddrLine1 = `${billingAddr.address_line1 || addr.address_line1 || ''} ${billingAddr.address_line2 || ''}`.trim() || shipAddrLine1;
    const billAddrLine2 = `${billingAddr.city || addr.city || 'Delhi'}, ${billingAddr.state || addr.state || 'Delhi'} - ${billingAddr.pincode || addr.pincode || '110001'}`;
    const billContact = shipContact;

    doc.text(billAddrLine1, rightX, 75);
    doc.text(billAddrLine2, rightX, 80);
    doc.text(billContact, rightX, 85);

    // Divider Line
    doc.line(14, 91, 196, 91);

    // ==========================================
    // 4. ORDER DETAILS
    // ==========================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text('ORDER DETAILS', 14, 98);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);

    doc.text(`Sales Number:`, 14, 103);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(salesNum, 38, 103);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`AWB Number:`, 14, 108);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(90, 24, 39); // Brand Maroon
    doc.text(waybill || 'Pending Allocation', 38, 108);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Sale Date:`, 14, 113);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text(formattedDate, 38, 113);

    // ==========================================
    // 5. ITEMIZED TABLE (AutoTable)
    // ==========================================
    const tableHeaders = [
      'Item Description',
      'SKU Code',
      'Qty',
      'Rate',
      'Disc',
      'Taxable',
      'Tax',
      'Total'
    ];

    const tableRows = items.map((it) => {
      const qty = Number(it.quantity || 1);
      const lineTotal = Number(it.total || it.price * qty);
      const tax = (lineTotal * 5) / 105;
      const taxable = lineTotal - tax;
      const rate = Number(it.price);
      const skuCode = `OCT9-${it.product_id || 'ETH'}${it.size ? `-${it.size}` : ''}`;
      const desc = `${it.product_title}\nSize: ${it.size || 'Free Size'}${it.color ? ` | Color: ${it.color}` : ''}`;

      return [
        desc,
        skuCode,
        qty.toString(),
        `INR ${rate.toFixed(0)}`,
        `INR 0`,
        `INR ${taxable.toFixed(1)}`,
        `INR ${tax.toFixed(0)}`,
        `INR ${lineTotal.toFixed(0)}`
      ];
    });

    if (doc.autoTable) {
      doc.autoTable({
        startY: 118,
        head: [tableHeaders],
        body: tableRows,
        margin: { left: 14, right: 14 },
        theme: 'plain',
        headStyles: {
          fillColor: [248, 248, 248],
          textColor: [20, 20, 20],
          fontSize: 8,
          fontStyle: 'bold',
          lineWidth: 0.2,
          lineColor: [220, 220, 220]
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [40, 40, 40],
          lineWidth: 0.1,
          lineColor: [238, 238, 238]
        },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 28, font: 'courier' },
          2: { cellWidth: 12, halign: 'center' },
          3: { cellWidth: 20, halign: 'right' },
          4: { cellWidth: 16, halign: 'right' },
          5: { cellWidth: 22, halign: 'right' },
          6: { cellWidth: 16, halign: 'right' },
          7: { cellWidth: 23, halign: 'right', fontStyle: 'bold' }
        }
      });
    }

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : 170;

    // ==========================================
    // 6. DISCOUNT & TOTALS
    // ==========================================
    doc.setDrawColor(220, 220, 220);
    doc.line(14, finalY, 196, finalY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    doc.text(`Discount:   INR ${discountAmount.toFixed(0)}`, 196, finalY + 6, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(`Payment Type:`, 14, finalY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(isCOD ? 'Cash on Delivery (COD)' : 'Prepaid (Razorpay Online)', 42, finalY + 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(90, 24, 39); // Brand Maroon
    doc.text(`Total:   INR ${grandTotal.toFixed(0)}`, 196, finalY + 12, { align: 'right' });

    // ==========================================
    // 7. FOOTER
    // ==========================================
    const footerY = Math.max(finalY + 24, 270);
    doc.setDrawColor(235, 235, 235);
    doc.line(14, footerY, 196, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Powered by Delhivery', 105, footerY + 6, { align: 'center' });

    // ==========================================
    // 8. DIRECT AND EXPLICIT BROWSER DOWNLOAD
    // ==========================================
    const filename = `Tax_Invoice_${order.order_number || 'OCT9'}.pdf`;
    const pdfBlob = doc.output('blob');

    // Create a typed Blob with explicit application/pdf MIME type
    const fileBlob = new Blob([pdfBlob], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(fileBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = filename;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      if (downloadLink.parentNode) {
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(downloadUrl);
    }, 1500);

  } catch (error) {
    console.error('Vector PDF generation error:', error);
    alert('Failed to generate PDF: ' + (error.message || 'Unknown error'));
  }
}
