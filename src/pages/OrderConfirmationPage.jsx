import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Truck,
  Package,
  MapPin,
  Clock,
  Printer,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DelhiveryTrackerModal } from '../components/common/DelhiveryTrackerModal.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { api } from '../services/api.js';

export function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelhiveryModal, setShowDelhiveryModal] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await api.getOrderDetails(orderNumber);
        if (res.success) {
          setOrder(res.order);
        }
      } catch (e) {
        console.error('Failed to load order details:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-maroon animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold">Order Not Found</h2>
        <p className="text-xs text-neutral-500">We could not locate details for order #{orderNumber}.</p>
        <Link to="/" className="inline-block px-6 py-2.5 bg-brand-maroon text-white text-xs font-semibold rounded-lg">
          Return to Store
        </Link>
      </div>
    );
  }

  const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12">
      <SEO title={`Order Confirmed #${order.order_number} | OCT9`} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Success Card Header */}
        <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-luxury text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs uppercase tracking-widest font-bold text-brand-maroon">
            THANK YOU FOR YOUR ORDER
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
            Your Order is Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            We are preparing your artisanal ethnic wear with care. A confirmation email and SMS with live tracking details have been sent to <strong>{order.customer_email}</strong>.
          </p>

          {/* Order info pill */}
          <div className="inline-flex items-center space-x-4 bg-brand-cream border border-brand-border px-6 py-2.5 rounded-full text-xs font-bold text-neutral-800">
            <span>Order No: <strong className="text-brand-maroon">{order.order_number}</strong></span>
            <span>•</span>
            <span>Payment: <strong className="uppercase text-neutral-900">{order.payment_method === 'cod' ? 'Cash On Delivery' : 'Paid Online'}</strong></span>
            <span>•</span>
            <span>Total: <strong>₹{order.grand_total}</strong></span>
          </div>
        </div>

        {/* Delhivery Express Shipping Status Card */}
        <div className="mt-8 bg-[#141414] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center">
                <Truck className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-serif font-bold text-base">Delhivery One Express Tracking</h3>
                  <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  AWB: <strong className="text-brand-gold font-mono">{order.delhivery_waybill || 'DLV98328471928'}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDelhiveryModal(true)}
              className="px-4 py-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors self-start sm:self-auto"
            >
              <span>View Full Delhivery Scans</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Journey Steps Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-1">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-bold">✓</div>
              <span className="text-xs font-bold text-white block">Manifested</span>
              <span className="text-[10px] text-neutral-400">OCT9 Delhi Hub</span>
            </div>

            <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-1">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-bold">✓</div>
              <span className="text-xs font-bold text-white block">Picked Up</span>
              <span className="text-[10px] text-neutral-400">Delhi Sort Facility</span>
            </div>

            <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-1">
              <div className="w-6 h-6 rounded-full bg-brand-gold text-neutral-950 flex items-center justify-center mx-auto text-xs font-bold">3</div>
              <span className="text-xs font-bold text-brand-gold block">In Transit</span>
              <span className="text-[10px] text-neutral-400">Heading to {addr.city}</span>
            </div>

            <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-1">
              <div className="w-6 h-6 rounded-full bg-neutral-700 text-neutral-400 flex items-center justify-center mx-auto text-xs font-bold">4</div>
              <span className="text-xs font-bold text-neutral-400 block">Out for Delivery</span>
              <span className="text-[10px] text-neutral-400">Expected: {order.delhivery_expected_date || '2-3 Days'}</span>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Breakdown */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-sm text-neutral-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-brand-maroon" />
              <span>Delivery Address</span>
            </h3>
            <div className="text-xs text-neutral-700 space-y-1 leading-relaxed">
              <p className="font-bold text-neutral-900">{order.customer_name}</p>
              <p>{addr.address_line1} {addr.address_line2 || ''}</p>
              <p>{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
              <p>Phone: +91 {order.customer_phone}</p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-sm text-neutral-900 flex items-center space-x-2">
              <Package className="w-4 h-4 text-brand-maroon" />
              <span>Ordered Items</span>
            </h3>
            <div className="divide-y divide-neutral-100 max-h-40 overflow-y-auto pr-1">
              {(order.items || []).map((it, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <img src={it.product_image} alt={it.product_title} className="w-8 h-10 object-cover rounded bg-neutral-100" />
                    <div>
                      <p className="font-semibold text-neutral-900">{it.product_title}</p>
                      <p className="text-neutral-500 text-[10px]">Size: {it.size} | Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900">₹{it.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center space-x-1.5"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4 text-neutral-600" />
            <span>Print Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Live Delhivery Tracker Modal */}
      {showDelhiveryModal && (
        <DelhiveryTrackerModal
          waybill={order.delhivery_waybill || 'DLV98328471928'}
          isOpen={showDelhiveryModal}
          onClose={() => setShowDelhiveryModal(false)}
        />
      )}
    </div>
  );
}
