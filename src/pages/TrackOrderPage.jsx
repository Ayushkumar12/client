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
  Loader2
} from 'lucide-react';
import { SEO } from '../components/common/SEO.jsx';
import { api } from '../services/api.js';

export function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [queryInput, setQueryInput] = useState(searchParams.get('awb') || searchParams.get('order') || '');
  const [trackingData, setTrackingData] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12">
      <SEO
        title="Live Delhivery Tracking | OCT9 Luxury Ethnic Wear"
        description="Track your OCT9 ethnic wear order in real time with our live Delhivery One logistics integration."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Hero */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 bg-brand-maroon/10 border border-brand-maroon/20 px-3 py-1 rounded-full text-brand-maroon text-xs font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5" />
            <span>Delhivery One Logistics Integration</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
            Track Your Order Live
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            Enter your <strong>OCT9 Order Number</strong> (e.g. OCT-2026-98214) or <strong>Delhivery AWB No.</strong> (e.g. DLV98328471928) for real-time scans.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex gap-2 pt-4">
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
              className="px-6 py-3 bg-brand-maroon hover:bg-brand-maroon-hover disabled:bg-neutral-400 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center space-x-1.5 shrink-0"
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
              className="text-brand-maroon underline font-semibold"
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
              className="text-brand-maroon underline font-semibold"
            >
              DLV98328471928
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2 max-w-lg mx-auto mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tracking Details Display */}
        {trackingData && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Status Card */}
            <div className="bg-[#141414] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
                <div>
                  <span className="text-[10px] text-brand-gold uppercase tracking-widest font-bold block">
                    Delhivery Express Surface & Air
                  </span>
                  <p className="font-mono text-base font-bold text-white mt-0.5">
                    AWB: {trackingData.waybill || orderDetails?.delhivery_waybill}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {trackingData.current_status || 'In Transit'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Origin Facility:</span>
                  <span className="font-semibold text-white mt-0.5 block">{trackingData.origin || 'OCT9 Central Hub, New Delhi'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Expected Delivery Date:</span>
                  <span className="font-semibold text-emerald-400 mt-0.5 block">{trackingData.expected_delivery || 'Within 2-3 Days'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Logistics Partner:</span>
                  <span className="font-semibold text-white mt-0.5 block">Delhivery One Express</span>
                </div>
              </div>
            </div>

            {/* Tracking Journey Timeline */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm space-y-6">
              <h3 className="font-serif font-bold text-base text-neutral-900">
                Detailed Scan Timeline
              </h3>

              <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                {(trackingData.timeline || []).map((step, idx) => (
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
                  href={`https://www.delhivery.com/track/package/${trackingData.waybill || orderDetails?.delhivery_waybill}`}
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
    </div>
  );
}
