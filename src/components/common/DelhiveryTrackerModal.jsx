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
  Compass,
  Map,
  List
} from 'lucide-react';
import { api } from '../../services/api.js';
import { DelhiveryLiveMap } from './DelhiveryLiveMap.jsx';

export function DelhiveryTrackerModal({ waybill, isOpen, onClose, destinationCity = 'New Delhi', destinationPincode = '110001' }) {
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
      setError('Could not connect to Delhivery tracking service.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#141414] text-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-800 my-8">
        {/* Header with Delhivery Red Banner */}
        <div className="bg-gradient-to-r from-[#1C1412] to-[#121212] p-5 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-base sm:text-lg tracking-wide">Delhivery One Live Logistics</span>
                <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                  ACTIVE GPS
                </span>
              </div>
              <p className="text-xs text-neutral-400">Surface & Air Express Corridor</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex bg-neutral-900 border border-neutral-700 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'map' ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Live Map</span>
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'timeline' ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Scans</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {viewMode === 'map' ? (
            <DelhiveryLiveMap
              waybill={waybill}
              destinationCity={destinationCity}
              destinationPincode={destinationPincode}
              currentStatus={data?.current_status || 'in_transit'}
              expectedDelivery={data?.expected_delivery || 'Within 2-3 Days'}
            />
          ) : (
            <>
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-brand-maroon animate-spin" />
                  <p className="text-xs text-neutral-400">Connecting to Delhivery tracking nodes...</p>
                </div>
              ) : error ? (
                <div className="py-8 text-center text-red-400 text-sm">
                  <p>{error}</p>
                </div>
              ) : data ? (
                <div className="space-y-6">
                  {/* Waybill info box */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Waybill / AWB No.</span>
                      <p className="font-mono text-sm font-bold text-brand-gold">{waybill}</p>
                    </div>
                    <button
                      onClick={copyAwb}
                      className="flex items-center space-x-1 text-xs text-white hover:text-brand-gold font-medium bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-700 shadow-2xs cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy AWB'}</span>
                    </button>
                  </div>

                  {/* Status & Estimated Delivery */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5">
                      <span className="text-[11px] text-neutral-400 block">Current Status</span>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {data.current_status || 'In Transit'}
                      </span>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5">
                      <span className="text-[11px] text-neutral-400 block">Expected Delivery</span>
                      <span className="text-xs font-bold text-emerald-400 mt-1 block">
                        {data.expected_delivery || 'Within 2-3 Days'}
                      </span>
                    </div>
                  </div>

                  {/* Step Timeline */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
                      Detailed Checkpoint Logs
                    </h4>
                    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
                      {(data.timeline || []).map((step, idx) => (
                        <div key={idx} className="relative">
                          <div
                            className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                              step.completed
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'bg-neutral-900 border-neutral-700 text-neutral-500'
                            }`}
                          >
                            {step.completed ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          </div>

                          <div>
                            <p className="text-xs font-bold text-white">{step.title || step.status}</p>
                            <p className="text-[11px] text-neutral-400 flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                              <span>{step.location}</span>
                            </p>
                            <span className="text-[10px] text-neutral-500 mt-0.5 block">{step.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}

          {/* Official Delhivery Link */}
          <div className="pt-2 text-center border-t border-neutral-800">
            <a
              href={`https://www.delhivery.com/track/package/${waybill}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs text-brand-gold hover:underline"
            >
              <span>View on official Delhivery.com portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
