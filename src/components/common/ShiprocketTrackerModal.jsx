import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Map,
  List
} from 'lucide-react';
import { api } from '../../services/api.js';
import { ShiprocketLiveMap } from './ShiprocketLiveMap.jsx';

export function ShiprocketTrackerModal({ waybill, isOpen, onClose, destinationCity = 'New Delhi', destinationPincode = '110001' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'timeline'

  useEffect(() => {
    if (isOpen && waybill) {
      fetchTracking();
    }
  }, [isOpen, waybill]);

  const fetchTracking = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.trackWaybill(waybill);
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Tracking data unavailable');
      }
    } catch (e) {
      setError('Could not connect to Shiprocket tracking service.');
    } finally {
      setLoading(false);
    }
  };

  const copyAwb = () => {
    navigator.clipboard.writeText(waybill);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 my-8">
        {/* Header */}
        <div className="bg-[#FAF7F2] p-5 flex items-center justify-between border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-base text-neutral-900">Shiprocket Live Tracking</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                  Live
                </span>
              </div>
              <p className="text-xs text-neutral-500">Multi-Carrier Surface & Air Express</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'map' ? 'bg-white text-brand-maroon shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'timeline' ? 'bg-white text-brand-maroon shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Logs</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-maroon animate-spin" />
              <p className="text-xs text-neutral-500">Connecting to Shiprocket telemetry...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-xs text-red-600 space-y-2">
              <p>{error}</p>
              <button
                onClick={fetchTracking}
                className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Top AWB details pill */}
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">AWB Number</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-mono font-bold text-sm text-neutral-900">{waybill}</span>
                    <button
                      onClick={copyAwb}
                      className="p-1 hover:bg-neutral-200 rounded text-neutral-500 hover:text-neutral-800 cursor-pointer"
                      title="Copy AWB"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">Carrier</span>
                  <span className="font-semibold text-neutral-900">{data.courier || 'Shiprocket Express'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">Est. Delivery</span>
                  <span className="font-semibold text-neutral-900">{data.expected_delivery || '2-3 Days'}</span>
                </div>
              </div>

              {/* View Mode: Map vs Logs */}
              {viewMode === 'map' ? (
                <ShiprocketLiveMap
                  waybill={waybill}
                  destinationCity={destinationCity}
                  destinationPincode={destinationPincode}
                  currentStatus={data.current_status || data.status || 'manifested'}
                  expectedDelivery={data.expected_delivery || 'In 2-3 Days'}
                />
              ) : (
                /* Timeline Logs View */
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Shipment Scan Telemetry
                  </h4>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                    {(data.scans && data.scans.length > 0 ? data.scans : (data.timeline || [])).map((st, idx) => (
                      <div key={idx} className="relative text-xs space-y-1">
                        <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          idx === 0
                            ? 'bg-purple-600 border-white ring-2 ring-purple-600 text-white'
                            : 'bg-white border-neutral-300'
                        }`}>
                          {idx === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-neutral-900">{st.activity || st.title || st.status}</span>
                          <span className="text-[10px] text-neutral-400">{st.timestamp || st.time}</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span>{st.location || 'Shiprocket Regional Facility'}</span>
                        </p>
                        {st.status && st.status !== st.activity && (
                          <p className="text-[10px] text-neutral-500">{st.status}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <a
            href={`https://shiprocket.co/tracking/${waybill}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-maroon font-semibold hover:underline inline-flex items-center space-x-1"
          >
            <span>View on official Shiprocket portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Backward compatibility alias
export const DelhiveryTrackerModal = ShiprocketTrackerModal;
