import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Truck,
  FileText,
  Copy,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api.js';

export function TaxInvoiceModal({ order, isOpen, onClose }) {
  const invoiceRef = useRef(null);
  const [copiedAWB, setCopiedAWB] = useState(false);

  if (!isOpen || !order) return null;

  const addr = typeof order.shipping_address === 'string'
    ? JSON.parse(order.shipping_address)
    : (order.shipping_address || {});

  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [];

  const waybill = order.delhivery_waybill || '';
  const subtotal = Number(order.subtotal || items.reduce((sum, it) => sum + Number(it.total || it.price), 0));
  const discount = Number(order.discount_amount || 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  // Indian Apparel GST is 5% (2.5% CGST + 2.5% SGST for intra-state Delhi, 5% IGST for inter-state)
  const isInterstate = addr.state && addr.state.toLowerCase() !== 'delhi';
  const gstRate = 5;
  const totalTax = (taxableAmount * gstRate) / (100 + gstRate);
  const netTaxable = taxableAmount - totalTax;
  const cgst = isInterstate ? 0 : totalTax / 2;
  const sgst = isInterstate ? 0 : totalTax / 2;
  const igst = isInterstate ? totalTax : 0;
  const grandTotal = Number(order.grand_total || taxableAmount);

  const getHsnCode = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('saree')) return '5407';
    if (t.includes('jutti')) return '6403';
    if (t.includes('choker') || t.includes('earring') || t.includes('bangle') || t.includes('necklace') || t.includes('potli')) return '7117';
    return '6204'; // Suits & Ensembles
  };

  const handlePrint = () => {
    window.print();
  };

  const copyAWB = () => {
    if (!waybill) return;
    navigator.clipboard.writeText(waybill);
    setCopiedAWB(true);
    setTimeout(() => setCopiedAWB(false), 2000);
  };

  const formatDate = (dateString) => {
    const d = dateString ? new Date(dateString) : new Date();
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-300 my-8">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="print:hidden bg-neutral-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-brand-gold" />
            <span className="font-serif font-bold text-sm tracking-wide">GST Tax Invoice</span>
            <span className="text-[10px] bg-neutral-800 border border-neutral-700 text-neutral-300 font-semibold px-2 py-0.5 rounded">
              Original For Recipient
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {waybill && (
              <a
                href={api.getPackingSlipUrl(waybill)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 bg-neutral-800 hover:bg-neutral-700 text-brand-gold text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-neutral-700 transition-colors"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Delhivery Packing Slip</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Standard White Invoice Container */}
        <div ref={invoiceRef} className="p-6 sm:p-8 bg-white text-neutral-900 text-xs font-sans space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-neutral-300 pb-5">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <img
                  src="/oct9-logo.jpg"
                  alt="OCT9"
                  className="w-12 h-12 rounded-lg object-contain border border-neutral-200 shadow-2xs"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-serif text-2xl font-bold tracking-widest text-neutral-900 leading-none">
                      OCT<span className="text-brand-gold">9</span>
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-500 pl-1 border-l border-neutral-300">
                      Luxury Ethnic Wear
                    </span>
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-neutral-400 mt-0.5">
                    Luxury Without Noise
                  </p>
                </div>
              </div>
              <p className="font-bold text-neutral-900 text-xs pt-1">OCT9 LUXURY APPAREL</p>
              <p className="text-[11px] text-neutral-600">Central Fulfillment Center: Plot 42, Okhla Industrial Area Phase-III, New Delhi - 110020</p>
              <p className="text-[11px] text-neutral-600">
                State: Delhi (Code: 07) • Supply Category: Handcrafted Ethnic Apparel & Luxury Accessories
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 bg-neutral-50 border border-neutral-200 p-3 rounded-xl min-w-[220px]">
              <span className="text-[10px] uppercase font-bold text-brand-maroon tracking-wider block">TAX INVOICE</span>
              <p className="font-mono text-xs font-bold text-neutral-900">INV-{order.order_number}</p>
              <p className="text-[11px] text-neutral-600">Invoice Date: <strong>{formatDate(order.created_at)}</strong></p>
              <p className="text-[11px] text-neutral-600">Order Ref: <strong>#{order.order_number}</strong></p>
              <p className="text-[11px] text-neutral-600">Place of Supply: <strong>{addr.state || 'Delhi'} ({isInterstate ? 'Inter-State' : 'Intra-State'})</strong></p>
            </div>
          </div>

          {/* Logistics & Delivery Details */}
          {waybill && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-brand-maroon" />
                <span className="font-semibold text-neutral-900">Logistics Partner: Delhivery Express Logistics</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                  Delhivery One API
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <span className="text-neutral-500">AWB:</span>
                  <strong className="font-mono text-neutral-900">{waybill}</strong>
                  <button
                    type="button"
                    onClick={copyAWB}
                    className="text-neutral-400 hover:text-neutral-800 print:hidden cursor-pointer"
                    title="Copy Waybill"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copiedAWB && <span className="text-[10px] text-emerald-600 font-semibold">Copied</span>}
                </div>

                <a
                  href={api.getPackingSlipUrl(waybill)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-maroon hover:underline font-semibold text-xs inline-flex items-center space-x-1 print:hidden"
                >
                  <span>Packing Slip</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-neutral-200 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Billed To (Customer Details)</span>
              <p className="font-bold text-neutral-900 text-xs">{order.customer_name || 'Customer'}</p>
              <p className="text-[11px] text-neutral-600">{addr.address_line1} {addr.address_line2 || ''}</p>
              <p className="text-[11px] text-neutral-600">{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
              <p className="text-[11px] text-neutral-600">Phone: +91 {order.customer_phone} • Email: {order.customer_email}</p>
            </div>

            <div className="border border-neutral-200 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Shipped To (Delivery Destination)</span>
              <p className="font-bold text-neutral-900 text-xs">{order.customer_name || 'Customer'}</p>
              <p className="text-[11px] text-neutral-600">{addr.address_line1} {addr.address_line2 || ''}</p>
              <p className="text-[11px] text-neutral-600">{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
              <p className="text-[11px] text-neutral-600">Payment Mode: <strong className="uppercase">{order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid Online (Razorpay)'}</strong></p>
              {order.razorpay_payment_id && (
                <p className="text-[10px] font-mono text-neutral-500">Payment ID: {order.razorpay_payment_id}</p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto border border-neutral-200 rounded-xl">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-neutral-100 text-neutral-800 uppercase tracking-wider font-semibold border-b border-neutral-200">
                  <th className="py-2 px-3 text-left">#</th>
                  <th className="py-2 px-3 text-left">Description of Goods</th>
                  <th className="py-2 px-3 text-center">HSN</th>
                  <th className="py-2 px-3 text-center">Size / Variant</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Unit Price</th>
                  <th className="py-2 px-3 text-right">Taxable (₹)</th>
                  <th className="py-2 px-3 text-right">{isInterstate ? 'IGST (5%)' : 'CGST+SGST (5%)'}</th>
                  <th className="py-2 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((it, idx) => {
                  const itQty = Number(it.quantity || 1);
                  const itTotal = Number(it.total || it.price * itQty);
                  const itTax = (itTotal * 5) / 105;
                  const itNet = itTotal - itTax;
                  return (
                    <tr key={idx} className="hover:bg-neutral-50/60">
                      <td className="py-2.5 px-3 text-neutral-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-neutral-900">
                        {it.product_title}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-neutral-600">{getHsnCode(it.product_title)}</td>
                      <td className="py-2.5 px-3 text-center text-neutral-600">{it.size || 'Free Size'} {it.color ? `/ ${it.color}` : ''}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-neutral-900">{itQty}</td>
                      <td className="py-2.5 px-3 text-right text-neutral-600">₹{Number(it.price).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right text-neutral-700">₹{itNet.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-neutral-700">₹{itTax.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-neutral-900">₹{itTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tax Summary & Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="space-y-1 text-[11px] text-neutral-600 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <span className="font-bold text-neutral-900 block text-xs">Logistics & Compliance Summary:</span>
              <p>• Logistics Partner: <strong>Delhivery Express (Surface & Air)</strong></p>
              {waybill && <p>• Delhivery AWB: <strong className="font-mono text-neutral-900">{waybill}</strong></p>}
              <p>• Dispatch Hub: <strong>OCT9 Central Fulfillment Hub (110020)</strong></p>
              <p>• GST 5% composite rate applicable under Chapter 62 / 54 for apparel.</p>
            </div>

            <div className="space-y-1.5 text-xs bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-neutral-900">₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-brand-maroon">
                  <span>Discount Applied ({order.coupon_code || 'Promo'}):</span>
                  <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Net Taxable Value:</span>
                <span>₹{netTaxable.toFixed(2)}</span>
              </div>
              {!isInterstate ? (
                <>
                  <div className="flex justify-between text-neutral-600">
                    <span>CGST (2.5%):</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>SGST (2.5%):</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-neutral-600">
                  <span>IGST (5%):</span>
                  <span>₹{igst.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Shipping & Handling:</span>
                <span className="text-emerald-700 font-bold uppercase">FREE (Delhivery Express)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-300">
                <span>Total Invoice Amount:</span>
                <span className="text-base text-brand-maroon">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Declaration & Signature */}
          <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[10px] text-neutral-500 max-w-sm space-y-0.5">
              <p className="font-bold text-neutral-700">Declaration:</p>
              <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
              <p className="italic text-neutral-400">Electronic Tax Invoice issued in accordance with GST Rules. Authorized electronically.</p>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <p className="text-[10px] font-bold text-neutral-700 uppercase">OCT9 LUXURY APPAREL</p>
              <div className="inline-block p-2 border border-neutral-300 rounded-lg bg-neutral-50 my-1">
                <span className="text-[10px] font-bold text-brand-maroon block">Digitally Verified</span>
                <span className="text-[9px] text-neutral-500 font-mono">Date: {new Date().toISOString().split('T')[0]}</span>
              </div>
              <p className="text-[10px] text-neutral-500 font-semibold">Authorized Dispatch</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
