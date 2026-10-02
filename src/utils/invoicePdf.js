import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Native Vector Tax Invoice PDF Generator & Direct Downloader
 * Generates official A4 Tax Invoices adhering to Indian GST & Delhivery Logistics Standards.
 * Triggers direct browser download as a valid, non-corrupt .pdf file with 0 preview modals.
 */
export async function downloadOrderInvoicePdf(order) {
  if (!order) {
    alert('Order details not found for invoice download.');
    return;
  }

  try {
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
            product_id: 'ETH-001',
            size: 'Free Size',
            color: 'Standard',
            price: Number(order.grand_total || 1999),
            quantity: 1,
            total: Number(order.grand_total || 1999)
          }
        ];

    const orderNum = order.order_number || 'OCT9-2026';
    const invoiceNum = `INV-${orderNum.replace(/^OCT9-/, '')}`;
    const salesNum = `SO-${orderNum.replace(/^OCT9-/, '')}`;
    const rawDate = new Date(order.created_at || Date.now());
    const formattedDate = !isNaN(rawDate.getTime()) 
      ? rawDate.toISOString().replace('T', ' ').substring(0, 19)
      : new Date().toISOString().replace('T', ' ').substring(0, 19);

    const discountAmount = Number(order.discount_amount || 0);
    const grandTotal = Number(order.grand_total || 0);
    const subtotal = Number(order.subtotal || grandTotal + discountAmount);
    const isCOD = order.payment_method === 'cod';
    const waybill = order.delhivery_waybill || 'Pending Delhivery Dispatch';

    // =========================================================================
    // 1. BRAND HEADER & TAX INVOICE BADGE
    // =========================================================================
    // Top maroon accent bar
    doc.setFillColor(90, 24, 39); // #5A1827 Brand Maroon
    doc.rect(14, 12, 182, 3, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 30, 30);
    doc.text('Tax Invoice', 14, 24);

    // Invoice Metadata (Right Aligned)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('Invoice No:', 135, 20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(invoiceNum, 160, 20);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Date & Time:', 135, 25);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(formattedDate, 160, 25);

    // =========================================================================
    // 2. SELLER INFORMATION (BILL FROM)
    // =========================================================================
    doc.setDrawColor(225, 225, 225);
    doc.setLineWidth(0.3);
    doc.line(14, 29, 196, 29);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 24, 39);
    doc.text('SELLER / BILL FROM', 14, 35);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text('OCT9 Luxury Apparel Pvt. Ltd.', 14, 40);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text('Plot 42, Okhla Industrial Area Phase-III, New Delhi - 110020, Delhi, India', 14, 45);
    doc.text('Email: care@oct9.in   |   GSTIN: 07AAFCO9999P1Z8   |   PAN: AAFCO9999P', 14, 50);

    // =========================================================================
    // 3. SHIPPING & BILLING ADDRESSES (2 COLUMNS)
    // =========================================================================
    doc.line(14, 54, 196, 54);

    const leftCol = 14;
    const rightCol = 108;

    // Shipping Address
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 24, 39);
    doc.text('SHIPPING ADDRESS (CONSIGNEE)', leftCol, 60);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);
    doc.text(order.customer_name || 'Valued Customer', leftCol, 65);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    const shipAddr1 = `${addr.address_line1 || ''} ${addr.address_line2 || ''}`.trim() || 'Address on file';
    const shipAddr2 = `${addr.city || 'Delhi'}, ${addr.state || 'Delhi'} - ${addr.pincode || '110001'}`;
    const shipContact = `Phone: +91 ${order.customer_phone || 'N/A'}   |   Email: ${order.customer_email || 'N/A'}`;

    doc.text(shipAddr1, leftCol, 70);
    doc.text(shipAddr2, leftCol, 75);
    doc.text(shipContact, leftCol, 80);

    // Billing Address
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 24, 39);
    doc.text('BILLING ADDRESS', rightCol, 60);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);
    doc.text(order.customer_name || 'Valued Customer', rightCol, 65);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    const billAddr1 = `${billingAddr.address_line1 || addr.address_line1 || ''} ${billingAddr.address_line2 || ''}`.trim() || shipAddr1;
    const billAddr2 = `${billingAddr.city || addr.city || 'Delhi'}, ${billingAddr.state || addr.state || 'Delhi'} - ${billingAddr.pincode || addr.pincode || '110001'}`;

    doc.text(billAddr1, rightCol, 70);
    doc.text(billAddr2, rightCol, 75);
    doc.text(shipContact, rightCol, 80);

    // =========================================================================
    // 4. ORDER & LOGISTICS DETAILS (DELHIVERY ONE METADATA)
    // =========================================================================
    doc.line(14, 85, 196, 85);

    doc.setFillColor(250, 247, 242); // Warm Cream
    doc.rect(14, 87, 182, 18, 'F');
    doc.rect(14, 87, 182, 18, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('SALES ORDER NO', 18, 93);
    doc.text('DELHIVERY AWB NO', 68, 93);
    doc.text('PAYMENT MODE', 125, 93);
    doc.text('PLACE OF SUPPLY', 165, 93);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(salesNum, 18, 99);

    doc.setTextColor(90, 24, 39); // Maroon for AWB
    doc.text(waybill, 68, 99);

    doc.setTextColor(20, 20, 20);
    doc.text(isCOD ? 'COD (Cash On Delivery)' : 'PREPAID (Razorpay)', 125, 99);
    doc.text(`${addr.state || 'Delhi'} (07)`, 165, 99);

    // =========================================================================
    // 5. ITEM TABLE (jsPDF AutoTable)
    // =========================================================================
    const tableHeaders = [
      'Item Description',
      'HSN/SKU',
      'Qty',
      'Gross Rate',
      'Discount',
      'Taxable Val',
      'GST (5%)',
      'Total (INR)'
    ];

    let computedSubtotal = 0;
    let computedTax = 0;

    const tableRows = items.map((it) => {
      const qty = Number(it.quantity || 1);
      const lineTotal = Number(it.total || it.price * qty);
      const tax = (lineTotal * 5) / 105;
      const taxable = lineTotal - tax;
      const rate = Number(it.price);
      const skuCode = `OCT9-${it.product_id || 'ETH'}${it.size ? `-${it.size}` : ''}`;
      const desc = `${it.product_title || 'Luxury Designer Suit'}\nSize: ${it.size || 'Free Size'}${it.color ? ` | Color: ${it.color}` : ''}`;

      computedSubtotal += taxable;
      computedTax += tax;

      return [
        desc,
        skuCode,
        qty.toString(),
        `Rs. ${rate.toFixed(0)}`,
        `Rs. 0`,
        `Rs. ${taxable.toFixed(2)}`,
        `Rs. ${tax.toFixed(2)}`,
        `Rs. ${lineTotal.toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY: 110,
      head: [tableHeaders],
      body: tableRows,
      margin: { left: 14, right: 14 },
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [90, 24, 39],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        textColor: [40, 40, 40],
        lineColor: [230, 230, 230],
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: [253, 251, 249]
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

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : 180;

    // =========================================================================
    // 6. TOTALS & SUMMARY SECTION
    // =========================================================================
    doc.setDrawColor(220, 220, 220);
    doc.line(14, finalY, 196, finalY);

    // Left summary notes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    doc.text('DECLARATION & TERMS:', 14, finalY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(90, 90, 90);
    doc.text('• We declare that this invoice shows the actual price of the goods described.', 14, finalY + 12);
    doc.text('• Goods once sold can be exchanged/returned within 7 days as per OCT9 return policy.', 14, finalY + 16);
    doc.text('• Logistics fulfillment and delivery handled via Delhivery Surface & Air Express Network.', 14, finalY + 20);

    // Right summary totals
    const rightLabelX = 145;
    const rightValX = 196;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);

    doc.text('Taxable Subtotal:', rightLabelX, finalY + 7);
    doc.text(`Rs. ${computedSubtotal.toFixed(2)}`, rightValX, finalY + 7, { align: 'right' });

    doc.text('Integrated GST (5%):', rightLabelX, finalY + 12);
    doc.text(`Rs. ${computedTax.toFixed(2)}`, rightValX, finalY + 12, { align: 'right' });

    if (discountAmount > 0) {
      doc.setTextColor(22, 101, 52); // Emerald Green
      doc.text('Coupon Discount:', rightLabelX, finalY + 17);
      doc.text(`- Rs. ${discountAmount.toFixed(2)}`, rightValX, finalY + 17, { align: 'right' });
    }

    const grandTotalY = discountAmount > 0 ? finalY + 24 : finalY + 19;
    doc.setFillColor(250, 247, 242);
    doc.rect(138, grandTotalY - 4, 58, 9, 'F');
    doc.rect(138, grandTotalY - 4, 58, 9, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(90, 24, 39); // Brand Maroon
    doc.text('Grand Total:', rightLabelX, grandTotalY + 2);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, rightValX - 2, grandTotalY + 2, { align: 'right' });

    // =========================================================================
    // 7. FOOTER & AUTHORIZED SIGNATURE
    // =========================================================================
    const footerY = Math.max(grandTotalY + 30, 268);

    doc.setDrawColor(230, 230, 230);
    doc.line(14, footerY, 196, footerY);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text('This is a computer-generated tax invoice and requires no physical signature.', 14, footerY + 6);
    doc.text('OCT9 Luxury Without Noise  •  Logistics by Delhivery One', 14, footerY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(90, 24, 39);
    doc.text('OCT9 LUXURY APPAREL PVT LTD', 196, footerY + 6, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text('Authorized Signatory', 196, footerY + 10, { align: 'right' });

    // =========================================================================
    // 8. DIRECT SAVE & DOWNLOAD (CRISP VECTOR PDF)
    // =========================================================================
    const filename = `Tax_Invoice_${orderNum}.pdf`;
    doc.save(filename);

  } catch (error) {
    console.error('Vector PDF generation error:', error);
    alert('Failed to generate Tax Invoice PDF: ' + (error.message || 'Unknown error'));
  }
}
