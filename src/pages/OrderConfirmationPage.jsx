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
  Loader2,
  FileText,
  Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ShiprocketTrackerModal } from '../components/common/ShiprocketTrackerModal.jsx';
import { ShiprocketLiveMap } from '../components/common/ShiprocketLiveMap.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { downloadOrderInvoicePdf } from '../utils/invoicePdf.js';
import { parseAddress } from '../utils/addressUtils.js';
import { api } from '../services/api.js';

export function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showShiprocketModal, setShowShiprocketModal] = useState(false);

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
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
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

  const addr = parseAddress(order.shipping_address);

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10">
      <SEO title={`Order Confirmed #${order.order_number} | OCT9 Luxury Ethnic Wear`} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Success Card Header */}
        <div className="bg-white rounded-sm p-8 border border-neutral-200/90 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs uppercase tracking-widest font-bold text-brand-maroon block">
            ORDER CONFIRMED
          </span>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">
            Thank You For Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
            Your order <strong>#{order.order_number}</strong> has been placed successfully. A confirmation email and SMS with tracking details have been sent to <strong>{order.customer_email}</strong>.
          </p>

          {/* Quick Summary & Invoice Quick Action */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center space-x-3 bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-sm text-xs text-neutral-800">
              <span>Order ID: <strong className="font-mono text-brand-maroon">{order.order_number}</strong></span>
              <span>•</span>
              <span>Payment: <strong className="uppercase text-neutral-900">{order.payment_method === 'cod' ? 'Cash On Delivery' : 'Paid Online'}</strong></span>
              <span>•</span>
              <span>Amount: <strong className="text-neutral-900">₹{order.grand_total}</strong></span>
            </div>

            <button
              onClick={async () => {
                setDownloading(true);
                await downloadOrderInvoicePdf(order);
                setDownloading(false);
              }}
              disabled={downloading}
              className="inline-flex items-center space-x-1.5 bg-brand-maroon hover:bg-brand-maroon-hover text-white px-5 py-2 rounded-sm text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-75 uppercase tracking-wider"
            >
              <FileText className="w-4 h-4 text-brand-gold-light" />
              <span>{downloading ? 'Downloading PDF...' : 'Download Invoice (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: DELHI LIVE TRACKING & COURIER MAP */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-brand-maroon" />
              <h2 className="font-serif text-xl font-bold text-neutral-900">
                Delivery & Tracking Details
              </h2>
            </div>
            {order.delhivery_waybill && (
              <button
                type="button"
                onClick={() => setShowShiprocketModal(true)}
                className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-sm transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <Truck className="w-3.5 h-3.5 text-brand-gold-light" />
                <span>Live GPS Tracking</span>
              </button>
            )}
          </div>

          <ShiprocketLiveMap
            waybill={order.delhivery_waybill}
            destinationCity={addr.city || 'Delhi'}
            destinationPincode={addr.pincode || '110001'}
            currentStatus={order.delhivery_status || order.shipping_status || 'manifested'}
            expectedDelivery={order.delhivery_expected_date || 'In 2-3 Days'}
          />
        </div>

        {/* SECTION 2: Order Summary & Delivery Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-sm p-6 border border-neutral-200 shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-sm text-neutral-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-brand-maroon" />
              <span>Delivery Address</span>
            </h3>
            <div className="text-xs text-neutral-700 space-y-1 leading-relaxed">
              <p className="font-bold text-neutral-900">{order.customer_name}</p>
              <p>{addr.address_line1} {addr.address_line2 || ''}</p>
              <p>{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
              <p className="pt-1 text-neutral-600">Phone: <strong>+91 {order.customer_phone}</strong></p>
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div className="bg-white rounded-sm p-6 border border-neutral-200 shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-sm text-neutral-900 flex items-center space-x-2">
              <Package className="w-4 h-4 text-brand-maroon" />
              <span>Ordered Items ({order.items?.length || 0})</span>
            </h3>
            <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto pr-1">
              {(order.items || []).map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <img src={it.product_image} alt={it.product_title} className="w-10 h-12 object-cover rounded bg-neutral-100" />
                    <div>
                      <p className="font-semibold text-neutral-900">{it.product_title}</p>
                      <p className="text-neutral-500 text-[10px]">Size: {it.size} | Qty: {it.quantity} | {it.color || 'Standard'}</p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900">₹{it.total || it.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="bg-white rounded-sm p-5 border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Authentic Handcrafted Luxury Apparel • Verified Shiprocket Logistics</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={async () => {
                setDownloading(true);
                await downloadOrderInvoicePdf(order);
                setDownloading(false);
              }}
              disabled={downloading}
              className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-sm transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-75"
            >
              <FileText className="w-4 h-4 text-neutral-600" />
              <span>{downloading ? 'Downloading...' : 'Download Invoice (PDF)'}</span>
            </button>

            <Link
              to="/orders"
              className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-sm transition-colors flex items-center space-x-1.5"
            >
              <Package className="w-4 h-4 text-neutral-600" />
              <span>My Orders</span>
            </Link>

            <Link
              to={`/track-order?order=${order.order_number}`}
              className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-sm transition-colors flex items-center space-x-1.5"
            >
              <Truck className="w-4 h-4 text-neutral-600" />
              <span>Track Order</span>
            </Link>

            <Link
              to="/"
              className="px-5 py-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-semibold rounded-sm shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Live Shiprocket Tracker Modal */}
      {showShiprocketModal && (
        <ShiprocketTrackerModal
          waybill={order.delhivery_waybill}
          isOpen={showShiprocketModal}
          onClose={() => setShowShiprocketModal(false)}
        />
      )}
    </div>
  );
}
