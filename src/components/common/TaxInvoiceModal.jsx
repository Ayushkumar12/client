import React, { useRef } from 'react';
import {
  X,
  Printer,
  FileText
} from 'lucide-react';

export function TaxInvoiceModal({ order, isOpen, onClose }) {
  const invoiceRef = useRef(null);

  if (!isOpen || !order) return null;

  const addr = typeof order.shipping_address === 'string'
    ? JSON.parse(order.shipping_address)
    : (order.shipping_address || {});

  const billingAddr = typeof order.billing_address === 'string'
    ? JSON.parse(order.billing_address)
    : (order.billing_address || addr);

  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [];

  const waybill = order.delhivery_waybill || '';
  const invoiceNum = `INV-${order.order_number.replace('OCT9-', '')}`;
  const salesNum = `SO-${order.order_number.replace('OCT9-', '')}`;
  
  const rawDate = new Date(order.created_at || Date.now());
  const formattedDate = rawDate.toISOString().replace('T', ' ').substring(0, 19);

  const discountAmount = Number(order.discount_amount || 0);
  const grandTotal = Number(order.grand_total || 0);
  const isCOD = order.payment_method === 'cod';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-neutral-300 my-8">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="print:hidden bg-neutral-900 text-white px-5 py-3 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-brand-gold" />
            <span className="font-bold text-sm">Tax Invoice</span>
            <span className="text-[11px] text-neutral-400 font-mono">({invoiceNum})</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Delhivery E-Commerce Tax Invoice Container */}
        <div ref={invoiceRef} className="p-6 sm:p-8 bg-white text-neutral-900 text-xs font-sans space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1">Tax Invoice</h1>
            <p className="text-xs text-neutral-700">Invoice No: <strong className="text-neutral-900">{invoiceNum}</strong></p>
            <p className="text-xs text-neutral-700">Date: {formattedDate}</p>
          </div>

          {/* BILL FROM */}
          <div className="pt-2">
            <p className="font-bold text-xs uppercase text-neutral-900 mb-1">BILL FROM</p>
            <p className="font-semibold text-neutral-900">OCT9 Luxury Apparel Pvt. Ltd.</p>
            <p className="text-neutral-700">Plot 42, Okhla Industrial Area Phase-III</p>
            <p className="text-neutral-700">New Delhi - 110020, Delhi, IN</p>
            <p className="text-neutral-700">Email: care@oct9.in • GSTIN: 07AAFCO9999P1Z8</p>
          </div>

          <hr className="border-t border-neutral-200" />

          {/* Addresses 2-Col */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="font-bold text-xs uppercase text-neutral-900 mb-1">SHIPPING ADDRESS</p>
              <p className="font-semibold text-neutral-900">{order.customer_name}</p>
              <p className="text-neutral-700">{addr.address_line1} {addr.address_line2 || ''}</p>
              <p className="text-neutral-700">{addr.city}, {addr.state} - {addr.pincode}</p>
              <p className="text-neutral-700">Email: {order.customer_email || 'customer@oct9.in'} • Phone: +91 {order.customer_phone}</p>
            </div>

            <div>
              <p className="font-bold text-xs uppercase text-neutral-900 mb-1">BILLING ADDRESS</p>
              <p className="font-semibold text-neutral-900">{order.customer_name}</p>
              <p className="text-neutral-700">{billingAddr.address_line1 || addr.address_line1} {billingAddr.address_line2 || ''}</p>
              <p className="text-neutral-700">{billingAddr.city || addr.city}, {billingAddr.state || addr.state} - {billingAddr.pincode || addr.pincode}</p>
              <p className="text-neutral-700">Email: {order.customer_email || 'customer@oct9.in'} • Phone: +91 {order.customer_phone}</p>
            </div>
          </div>

          <hr className="border-t border-neutral-200" />

          {/* ORDER DETAILS */}
          <div>
            <p className="font-bold text-xs uppercase text-neutral-900 mb-1">ORDER DETAILS</p>
            <p className="text-neutral-700">Sales Number: <strong className="text-neutral-900">{salesNum}</strong></p>
            <p className="text-neutral-700">AWB Number: <strong className="text-neutral-900 font-mono">{waybill || 'Pending Delhivery Allocation'}</strong></p>
            <p className="text-neutral-700">Sale Date: {formattedDate}</p>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F8F8] text-neutral-800 font-bold border-t border-b border-neutral-200 text-left">
                  <th className="py-2.5 px-3" style={{ width: '32%' }}>Item Description</th>
                  <th className="py-2.5 px-2" style={{ width: '15%' }}>SKU Code</th>
                  <th className="py-2.5 px-2 text-center" style={{ width: '8%' }}>Qty</th>
                  <th className="py-2.5 px-2 text-right" style={{ width: '11%' }}>Rate</th>
                  <th className="py-2.5 px-2 text-right" style={{ width: '9%' }}>Disc</th>
                  <th className="py-2.5 px-2 text-right" style={{ width: '12%' }}>Taxable</th>
                  <th className="py-2.5 px-2 text-right" style={{ width: '10%' }}>Tax</th>
                  <th className="py-2.5 px-3 text-right" style={{ width: '12%' }}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((it, idx) => {
                  const qty = Number(it.quantity || 1);
                  const lineTotal = Number(it.total || it.price * qty);
                  const tax = (lineTotal * 5) / 105;
                  const taxable = lineTotal - tax;
                  const rate = Number(it.price);
                  const skuCode = `OCT9-${it.product_id || 'ETH'}${it.size ? `-${it.size}` : ''}`;

                  return (
                    <tr key={idx}>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-neutral-900">{it.product_title}</p>
                        <p className="text-[10px] text-neutral-500">Size: {it.size || 'Free Size'}{it.color ? ` | Color: ${it.color}` : ''}</p>
                      </td>
                      <td className="py-3 px-2 font-mono text-neutral-600 text-[11px]">{skuCode}</td>
                      <td className="py-3 px-2 text-center font-bold text-neutral-900">{qty}</td>
                      <td className="py-3 px-2 text-right text-neutral-700">INR {rate.toFixed(0)}</td>
                      <td className="py-3 px-2 text-right text-neutral-700">INR 0</td>
                      <td className="py-3 px-2 text-right text-neutral-700">INR {taxable.toFixed(1)}</td>
                      <td className="py-3 px-2 text-right text-neutral-700">INR {tax.toFixed(0)}</td>
                      <td className="py-3 px-3 text-right font-bold text-neutral-900">INR {lineTotal.toFixed(0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <hr className="border-t border-neutral-200" />

          {/* Discount & Totals */}
          <div className="space-y-3 pt-1">
            <div className="text-right text-xs pr-3">
              <span className="font-bold text-neutral-800">Discount</span> &nbsp;&nbsp;&nbsp;&nbsp; 
              <span className="font-semibold text-neutral-900">INR {discountAmount.toFixed(0)}</span>
            </div>

            <div className="flex justify-between items-center px-3 pt-2 text-xs">
              <div>
                <p className="font-bold text-neutral-900">Payment Type</p>
                <p className="text-neutral-700">{isCOD ? 'Cash on Delivery (COD)' : 'Prepaid (Razorpay Online)'}</p>
              </div>

              <div className="text-sm font-bold text-neutral-900">
                <span>Total</span> &nbsp;&nbsp;&nbsp;&nbsp; 
                <span className="text-base text-brand-maroon font-extrabold">INR {grandTotal.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Footer Powered By Delhivery */}
          <div className="text-center pt-8 pb-2 text-xs text-neutral-500 font-semibold border-t border-neutral-100 mt-6">
            Powered by Delhivery
          </div>
        </div>
      </div>
    </div>
  );
}
