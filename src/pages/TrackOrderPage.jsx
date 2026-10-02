import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { SEO } from '../components/common/SEO.jsx';
import { DelhiveryLiveMap } from '../components/common/DelhiveryLiveMap.jsx';
import { TaxInvoiceModal } from '../components/common/TaxInvoiceModal.jsx';
import { api } from '../services/api.js';

export function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [queryInput, setQueryInput] = useState(searchParams.get('awb') || searchParams.get('order') || '');
  const [trackingData, setTrackingData] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    const q = searchParams.get('awb') || searchParams.get('order');
    if (q) {
      setQueryInput(q);
      performTrack(q);
    }
  }, [searchParams]);

  const performTrack = async (query) => {
    const clean = query.trim();
    if (!clean) return;

    setLoading(true);
    setError('');
    setTrackingData(null);
    setOrderDetails(null);

    try {
      if (clean.toUpperCase().startsWith('DLV') || /^\d{10,14}$/.test(clean)) {
        // Direct Delhivery AWB Track
        const res = await api.trackWaybill(clean);
        if (res.success) {
          setTrackingData(res);
        } else {
          setError(res.message || 'Tracking details not found for this Waybill.');
        }
      } else {
        // Order Number lookup
        const res = await api.getOrderDetails(clean);
        if (res.success) {
          setOrderDetails(res.order);
          if (res.order.delhivery_tracking) {
            setTrackingData(res.order.delhivery_tracking);
          } else if (res.order.delhivery_waybill) {
            const trackRes = await api.trackWaybill(res.order.delhivery_waybill);
            if (trackRes.success) setTrackingData(trackRes);
          }
        } else {
          setError(res.message || 'Order not found.');
        }
      }
    } catch (e) {
      setError('Could not connect to tracking service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performTrack(queryInput);
  };

  const currentWaybill = trackingData?.waybill || orderDetails?.delhivery_waybill || 'DLV98328471928';
  const shippingAddr = orderDetails?.shipping_address
    ? (typeof orderDetails.shipping_address === 'string' ? JSON.parse(orderDetails.shipping_address) : orderDetails.shipping_address)
    : null;

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10">
      <SEO
        title="Track Order | OCT9 Luxury Ethnic Wear"
        description="Track your OCT9 order with live Delhivery express shipping updates."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header Hero */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-xs text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-medium">
            <Truck className="w-3.5 h-3.5 text-brand-maroon" />
            <span>Delhivery Express Logistics</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Track Your Shipment
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            Enter your <strong>Order ID</strong> (e.g. OCT-2026-98214) or <strong>Delhivery AWB</strong> (e.g. DLV98328471928).
          </p>

          {/* Search Box */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Enter Order # or AWB..."
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon uppercase font-mono font-semibold text-neutral-900"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>

            <button
              type="submit"
              disabled={loading || !queryInput.trim()}
              className="px-5 py-2.5 bg-brand-maroon hover:bg-brand-maroon-hover disabled:bg-neutral-400 text-white text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track'}
            </button>
          </form>

          {/* Quick Demo links */}
          <div className="flex items-center justify-center space-x-2 text-[11px] text-neutral-500 pt-1">
            <span>Sample:</span>
            <button
              type="button"
              onClick={() => {
                setQueryInput('OCT-2026-98214');
                performTrack('OCT-2026-98214');
              }}
              className="text-brand-maroon underline font-medium cursor-pointer"
            >
              OCT-2026-98214
            </button>
            <span>or</span>
            <button
              type="button"
              onClick={() => {
                setQueryInput('DLV98328471928');
                performTrack('DLV98328471928');
              }}
              className="text-brand-maroon underline font-medium cursor-pointer"
            >
              DLV98328471928
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2 max-w-lg mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tracking Details Display */}
        {(trackingData || orderDetails) && (
          <div className="space-y-6 animate-fadeIn">
            {/* Delivery Map & Stepper */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-neutral-900">
                  Shipment Progress
                </h3>
                {orderDetails && (
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Download Invoice</span>
                  </button>
                )}
              </div>

              <DelhiveryLiveMap
                waybill={currentWaybill}
                destinationCity={shippingAddr?.city || 'New Delhi'}
                destinationPincode={shippingAddr?.pincode || '110001'}
                currentStatus={trackingData?.current_status || orderDetails?.shipping_status || 'in_transit'}
                expectedDelivery={trackingData?.expected_delivery || orderDetails?.delhivery_expected_date || 'Within 2-3 Days'}
              />
            </div>

            {/* Tracking Journey Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-5">
              <h3 className="font-serif font-bold text-base text-neutral-900">
                Tracking History
              </h3>

              <div className="relative pl-7 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                {(trackingData?.timeline || [
                  { status: 'Order Manifested', location: 'OCT9 Central Atelier Hub, New Delhi', time: 'Oct 02, 2026 • 09:30 AM', completed: true },
                  { status: 'Picked Up by Courier', location: 'Delhi Sort Facility (NH48)', time: 'Oct 02, 2026 • 01:15 PM', completed: true },
                  { status: 'In Transit', location: 'Express Corridor to Destination', time: 'Oct 02, 2026 • 03:00 PM', completed: true },
                  { status: 'Out for Delivery', location: 'Destination Regional Center', time: 'Expected Soon', completed: false },
                  { status: 'Delivered', location: 'Doorstep Handover', time: 'Pending Delivery', completed: false }
                ]).map((step, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-7 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-200 text-neutral-400'
                      }`}
                    >
                      {step.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3 h-3" />}
                    </div>

                    <div className="pl-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-neutral-900">{step.title || step.status}</span>
                        {step.completed && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.2 rounded border border-emerald-200">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span>{step.location}</span>
                      </p>
                      <span className="text-[10px] text-neutral-400 mt-0.5 block">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Official Delhivery Link */}
              <div className="pt-3 border-t border-neutral-100 text-center">
                <a
                  href={`https://www.delhivery.com/track/package/${currentWaybill}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-brand-maroon hover:underline font-semibold"
                >
                  <span>View on official Delhivery website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tax Invoice Modal */}
      {showInvoiceModal && orderDetails && (
        <TaxInvoiceModal
          order={orderDetails}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
}
