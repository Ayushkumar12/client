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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 my-8">
        {/* Header */}
        <div className="bg-[#FAF7F2] p-5 flex items-center justify-between border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-base text-neutral-900">Delhivery Express Tracking</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                  Live
                </span>
              </div>
              <p className="text-xs text-neutral-500">Surface & Air Express</p>
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
              className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-5">
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
                  <Loader2 className="w-7 h-7 text-brand-maroon animate-spin" />
                  <p className="text-xs text-neutral-500">Loading tracking updates...</p>
                </div>
              ) : error ? (
                <div className="py-8 text-center text-red-600 text-xs">
                  <p>{error}</p>
                </div>
              ) : data ? (
                <div className="space-y-5">
                  {/* Waybill info box */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500">Waybill / AWB No.</span>
                      <p className="font-mono text-sm font-bold text-neutral-900">{waybill}</p>
                    </div>
                    <button
                      onClick={copyAwb}
                      className="flex items-center space-x-1 text-xs text-neutral-700 hover:text-neutral-900 font-semibold bg-white px-3 py-1.5 rounded-lg border border-neutral-300 shadow-2xs cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy AWB'}</span>
                    </button>
                  </div>

                  {/* Status & Estimated Delivery */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                      <span className="text-neutral-500 block text-[11px]">Current Status</span>
                      <span className="font-semibold text-neutral-900 mt-0.5 block">{data.current_status || 'In Transit'}</span>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                      <span className="text-neutral-500 block text-[11px]">Expected Delivery</span>
                      <span className="font-semibold text-neutral-900 mt-0.5 block">{data.expected_delivery || 'Within 2-3 Days'}</span>
                    </div>
                  </div>

                  {/* Step Timeline */}
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 mb-3">
                      Checkpoint Updates
                    </h4>
                    <div className="relative pl-6 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                      {(data.timeline || []).map((step, idx) => (
                        <div key={idx} className="relative">
                          <div
                            className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                              step.completed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-neutral-200 text-neutral-400'
                            }`}
                          >
                            {step.completed ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          </div>

                          <div className="pl-1">
                            <p className="text-xs font-semibold text-neutral-900">{step.title || step.status}</p>
                            <p className="text-[11px] text-neutral-500 flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span>{step.location}</span>
                            </p>
                            <span className="text-[10px] text-neutral-400 mt-0.5 block">{step.time}</span>
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
          <div className="pt-2 text-center border-t border-neutral-100">
            <a
              href={`https://www.delhivery.com/track/package/${waybill}`}
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
    </div>
  );
}
