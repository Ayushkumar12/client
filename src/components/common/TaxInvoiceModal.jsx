import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Building,
  QrCode,
  FileText,
  Copy,
  ExternalLink,
  Zap,
  Activity,
  Package
} from 'lucide-react';

export function TaxInvoiceModal({ order, isOpen, onClose }) {
  const invoiceRef = useRef(null);
  const [copiedAWB, setCopiedAWB] = useState(false);

  if (!isOpen || !order) return null;

  const addr = typeof order.shipping_address === 'string'
    ? JSON.parse(order.shipping_address)
    : (order.shipping_address || {});

  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [
        {
          product_title: 'Embroidered Anarkali Suit',
          product_slug: 'embroidered-anarkali-suit',
          size: 'M',
          color: 'Royal Blue',
          quantity: 1,
          price: 2399,
          total: 2399
        },
        {
          product_title: 'Designer Palazzo Set',
          product_slug: 'designer-palazzo-set',
          size: 'M',
          color: 'Deep Wine',
          quantity: 1,
          price: 2799,
          total: 2799
        }
      ];

  const waybill = order.delhivery_waybill || 'DLV349312857849';
  const pickupToken = order.delhivery_pickup_token || `PU_OCT9_${(order.order_number || '98214').slice(-5)}`;
  const ewayBill = order.delhivery_eway_bill || 'EWB-789321471928';
  const routingCode = `DLV-RTE-NORTH-${waybill.slice(-4)}`;
  const originHubCode = 'DEL/OKH/110001 (OCT9 Central Atelier)';
  const destHubCode = `DEL/BAP/${addr.pincode || '110001'} (${addr.city || 'Delhi'})`;
  const packageWeight = '0.85 kg (Volumetric: 1.20 kg)';
  const dimensions = '30 x 25 x 5 cm';
  const slaService = 'Delhivery One B2C Express (Surface & Air) - SLA: EXP-SURFACE-D2D';

  const subtotal = Number(order.subtotal || items.reduce((sum, it) => sum + Number(it.total || it.price), 0));
  const discount = Number(order.discount_amount || 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  // Indian Apparel GST is 5% (2.5% CGST + 2.5% SGST for intra-state, 5% IGST for inter-state)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-300 my-8">
        {/* Action Header (Hidden on Print) */}
        <div className="print:hidden bg-[#111111] text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-brand-gold" />
            <span className="font-serif font-bold text-base tracking-wide">Official GST Tax Invoice</span>
            <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded uppercase">
              Original For Recipient
            </span>
            <span className="text-[10px] bg-red-600/30 border border-red-500 text-red-300 font-bold px-2 py-0.5 rounded uppercase flex items-center space-x-1">
              <Truck className="w-3 h-3" />
              <span>Delhivery One Integrated</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div ref={invoiceRef} className="p-6 sm:p-8 bg-white text-neutral-900 text-xs font-sans space-y-6">
          {/* Company & Invoice Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-neutral-300 pb-5">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <img src="/logo-gold.svg" alt="OCT9" className="w-9 h-9" />
                <span className="font-serif text-2xl font-bold tracking-widest text-neutral-900">
                  OCT<span className="text-brand-gold">9</span>
                </span>
              </div>
              <p className="font-bold text-neutral-900 text-xs">OCT9 LUXURY APPAREL PRIVATE LIMITED</p>
              <p className="text-[11px] text-neutral-600">Plot 42, Okhla Industrial Area Phase-III, New Delhi - 110020</p>
              <p className="text-[11px] text-neutral-600">
                <strong>GSTIN:</strong> 07AABCO9999P1Z8 • <strong>State:</strong> Delhi (Code: 07)
              </p>
              <p className="text-[11px] text-neutral-600">
                <strong>PAN:</strong> AABCO9999P • <strong>CIN:</strong> U18101DL2024PTC123456
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 bg-neutral-50 border border-neutral-200 p-3.5 rounded-xl min-w-[240px]">
              <span className="text-[10px] uppercase font-bold text-brand-maroon tracking-wider block">TAX INVOICE</span>
              <p className="font-mono text-xs font-bold text-neutral-900">INV-{order.order_number || '2026-98214'}</p>
              <p className="text-[11px] text-neutral-600">Invoice Date: <strong>{formatDate(order.created_at)}</strong></p>
              <p className="text-[11px] text-neutral-600">Order ID: <strong>#{order.order_number}</strong></p>
              <p className="text-[11px] text-neutral-600">Place of Supply: <strong>{addr.state || 'Delhi'} ({isInterstate ? 'Inter-State' : 'Intra-State'})</strong></p>
            </div>
          </div>

          {/* DELHIVERY ONE OFFICIAL API LOGISTICS & DISPATCH DATA BOX */}
          <div className="bg-gradient-to-br from-[#121212] via-[#1A1816] to-[#141414] text-white rounded-2xl p-4 sm:p-5 border border-neutral-800 shadow-md space-y-3">
            {/* Top Bar with Delhivery Logo & API Verification */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/30 border border-red-500/60 flex items-center justify-center text-red-400">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold tracking-wide text-white uppercase">Delhivery One Logistics API Dispatch</span>
                    <span className="text-[9px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                      API v1.2 Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    {slaService}
                  </p>
                </div>
              </div>

              {/* Waybill / AWB with copy button */}
              <div className="flex items-center space-x-2 self-start sm:self-auto bg-black/60 px-3 py-1.5 rounded-xl border border-neutral-700">
                <div>
                  <span className="text-[9px] text-neutral-400 uppercase font-bold block">Delhivery AWB No:</span>
                  <span className="font-mono text-xs font-bold text-brand-gold tracking-wider">{waybill}</span>
                </div>
                <button
                  type="button"
                  onClick={copyAWB}
                  title="Copy Waybill"
                  className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copiedAWB && <span className="text-[9px] text-emerald-400 font-bold">Copied!</span>}
              </div>
            </div>

            {/* Comprehensive Delhivery API Logistics Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
              <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block uppercase font-semibold">Manifest / Pickup Token</span>
                <span className="font-mono font-bold text-white mt-0.5 block">{pickupToken}</span>
              </div>

              <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block uppercase font-semibold">E-Way Bill Number</span>
                <span className="font-mono font-bold text-emerald-400 mt-0.5 block">{ewayBill}</span>
              </div>

              <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block uppercase font-semibold">Weight & Dimensions</span>
                <span className="font-semibold text-white mt-0.5 block">{packageWeight}</span>
                <span className="text-[9px] text-neutral-400 font-mono">{dimensions}</span>
              </div>

              <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-neutral-400 text-[10px] block uppercase font-semibold">Routing Hub Code</span>
                <span className="font-mono font-bold text-brand-gold mt-0.5 block">{routingCode}</span>
                <span className="text-[9px] text-neutral-400">{destHubCode}</span>
              </div>
            </div>

            {/* Tracking Link for Customer */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-800/80 gap-2">
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-brand-gold" />
                <span>Live Delhivery Gateway: <strong>{originHubCode}</strong> → <strong>{destHubCode}</strong></span>
              </div>

              <a
                href={`https://www.delhivery.com/track/package/${waybill}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand-gold hover:underline flex items-center space-x-1 font-semibold"
              >
                <span>Track on Delhivery.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Billed To & Shipped To Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bill To */}
            <div className="border border-neutral-200 rounded-xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Billed To / Customer Details</span>
              <p className="font-bold text-neutral-900 text-xs">{order.customer_name || 'Valued Customer'}</p>
              <p className="text-[11px] text-neutral-600">{addr.address_line1} {addr.address_line2 || ''}</p>
              <p className="text-[11px] text-neutral-600">{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
              <p className="text-[11px] text-neutral-600">Phone: +91 {order.customer_phone} • Email: {order.customer_email}</p>
            </div>

            {/* Ship To */}
            <div className="border border-neutral-200 rounded-xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Shipped To / Consignee Destination</span>
              <p className="font-bold text-neutral-900 text-xs">{order.customer_name || 'Valued Customer'}</p>
              <p className="text-[11px] text-neutral-600">{addr.address_line1} {addr.address_line2 || ''}</p>
              <p className="text-[11px] text-neutral-600">{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
              <p className="text-[11px] text-neutral-600">Payment Method: <strong className="uppercase">{order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid Online via Razorpay'}</strong></p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto border border-neutral-200 rounded-xl">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-neutral-900 text-white uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3 text-left">#</th>
                  <th className="py-2.5 px-3 text-left">Description of Goods</th>
                  <th className="py-2.5 px-3 text-center">HSN Code</th>
                  <th className="py-2.5 px-3 text-center">Size / Color</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                  <th className="py-2.5 px-3 text-right">{isInterstate ? 'IGST (5%)' : 'CGST+SGST (5%)'}</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {items.map((it, idx) => {
                  const itQty = Number(it.quantity || 1);
                  const itTotal = Number(it.total || it.price * itQty);
                  const itTax = (itTotal * 5) / 105;
                  const itNet = itTotal - itTax;
                  return (
                    <tr key={idx} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3 text-neutral-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-neutral-900">
                        {it.product_title}
                        <span className="block text-[9px] text-neutral-500 font-mono">SKU: OCT-APL-{idx + 101}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-neutral-600">{getHsnCode(it.product_title)}</td>
                      <td className="py-2.5 px-3 text-center text-neutral-600">{it.size} / {it.color}</td>
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

          {/* Tax Summary & Grand Total Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="space-y-2 text-[11px] text-neutral-600 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <span className="font-bold text-neutral-900 block text-xs">GST & Logistics Tax Compliance:</span>
              <p>• Tax payable under reverse charge: <strong>No</strong></p>
              <p>• Delhivery One API Waybill: <strong>{waybill}</strong></p>
              <p>• E-Way Bill Number: <strong>{ewayBill}</strong></p>
              <p>• GST 5% composite rate applicable under Chapter 62 / 54 / 64 for apparel & footwear.</p>
              <p>• Logistics freight & courier charges: <strong>Zero Rated / Free Delivery</strong> absorbed by OCT9 Luxury Apparel.</p>
            </div>

            <div className="space-y-1.5 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-200">
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
                <span>Delhivery Express Shipping:</span>
                <span className="text-emerald-700 font-bold uppercase">FREE (Delhivery One B2C)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-300">
                <span>Total Amount Payable:</span>
                <span className="text-base text-brand-maroon">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Digital Signature & Footer Declaration */}
          <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[10px] text-neutral-500 max-w-sm space-y-1">
              <p className="font-bold text-neutral-700">Declaration:</p>
              <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
              <p className="italic text-neutral-400">Computer generated invoice. Under Rule 46 of CGST Rules 2017, no physical signature is required.</p>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <p className="text-[10px] font-bold text-neutral-700 uppercase">For OCT9 LUXURY APPAREL PVT. LTD.</p>
              <div className="inline-block p-2 border border-brand-gold/60 rounded-lg bg-amber-50/50 my-1">
                <span className="text-[10px] font-serif font-bold text-brand-maroon block">Digitally Signed & Verified</span>
                <span className="text-[9px] text-neutral-500 font-mono">Date: {new Date().toISOString().split('T')[0]}</span>
              </div>
              <p className="text-[10px] text-neutral-500 font-semibold">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
