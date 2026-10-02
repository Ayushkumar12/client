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
  FileText,
  Navigation
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
    <div className="bg-[#FAF7F2] min-h-screen py-12">
      <SEO
        title="Live Delhivery Tracking & Map | OCT9 Luxury Ethnic Wear"
        description="Track your OCT9 order in real time with our live GPS telemetry and Delhivery One logistics integration."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-brand-maroon/10 border border-brand-maroon/20 px-3 py-1 rounded-full text-brand-maroon text-xs font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5" />
            <span>Delhivery One Logistics Integration</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
            Live GPS Order Tracking
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            Enter your <strong>OCT9 Order Number</strong> (e.g. OCT-2026-98214) or <strong>Delhivery AWB No.</strong> (e.g. DLV98328471928) for real-time scans.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex gap-2 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Enter Order # or Delhivery AWB..."
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-brand-maroon shadow-sm uppercase font-mono font-bold"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>

            <button
              type="submit"
              disabled={loading || !queryInput.trim()}
              className="px-6 py-3 bg-brand-maroon hover:bg-brand-maroon-hover disabled:bg-neutral-400 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track Package'}
            </button>
          </form>

          {/* Quick Demo links */}
          <div className="flex items-center justify-center space-x-2 text-[11px] text-neutral-500 pt-1">
            <span>Try sample:</span>
            <button
              type="button"
              onClick={() => {
                setQueryInput('OCT-2026-98214');
                performTrack('OCT-2026-98214');
              }}
              className="text-brand-maroon underline font-semibold cursor-pointer"
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
              className="text-brand-maroon underline font-semibold cursor-pointer"
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
            {/* Live GPS Map Visualizer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-neutral-900 flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-brand-maroon" />
                  <span>Real-Time GPS Location Map</span>
                </h3>
                {orderDetails && (
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold shadow cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-gold" />
                    <span>View GST Tax Invoice</span>
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
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm space-y-6">
              <h3 className="font-serif font-bold text-base text-neutral-900">
                Detailed Scan Timeline
              </h3>

              <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                {(trackingData?.timeline || [
                  { status: 'Manifest Created', location: 'OCT9 Central Atelier Hub, New Delhi', time: 'Oct 02, 2026 • 09:30 AM', completed: true },
                  { status: 'Picked up by Delhivery Courier', location: 'Delhi Sort Facility (NH48)', time: 'Oct 02, 2026 • 01:15 PM', completed: true },
                  { status: 'In Transit Linehaul', location: 'Express Corridor en route to Destination', time: 'Oct 02, 2026 • 03:00 PM', completed: true },
                  { status: 'Out for Delivery', location: 'Destination Regional Center', time: 'Expected Soon', completed: false },
                  { status: 'Delivered', location: 'Doorstep Handover with OTP', time: 'Pending', completed: false }
                ]).map((step, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-8 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                        step.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'bg-white border-neutral-300 text-neutral-400'
                      }`}
                    >
                      {step.completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-neutral-900">{step.title || step.status}</span>
                        {step.completed && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 flex items-center space-x-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{step.location}</span>
                      </p>
                      <span className="text-[11px] text-neutral-400 mt-0.5 block">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Official Delhivery Link */}
              <div className="pt-4 border-t border-neutral-100 text-center">
                <a
                  href={`https://www.delhivery.com/track/package/${currentWaybill}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-brand-maroon hover:underline font-semibold"
                >
                  <span>Open Tracking on Official Delhivery Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
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
