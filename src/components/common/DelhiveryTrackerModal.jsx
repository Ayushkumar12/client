import React, { useState, useEffect } from 'react';
import { X, Truck, CheckCircle2, Clock, MapPin, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { api } from '../../services/api.js';

export function DelhiveryTrackerModal({ waybill, isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header with Delhivery Red Banner */}
        <div className="bg-[#141414] text-white p-5 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center">
              <Truck className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-base tracking-wide">Delhivery One Live Tracking</span>
              </div>
              <p className="text-xs text-neutral-400">Surface & Air Express Logistics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-maroon animate-spin" />
              <p className="text-xs text-neutral-500">Connecting to Delhivery tracking nodes...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-600 text-sm">
              <p>{error}</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Waybill info box */}
              <div className="bg-brand-cream border border-brand-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Waybill / AWB No.</span>
                  <p className="font-mono text-sm font-bold text-neutral-900">{waybill}</p>
                </div>
                <button
                  onClick={copyAwb}
                  className="flex items-center space-x-1 text-xs text-brand-maroon hover:text-brand-maroon-hover font-medium bg-white px-3 py-1.5 rounded-md border border-neutral-200 shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy AWB'}</span>
                </button>
              </div>

              {/* Status & Estimated Delivery */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-neutral-200 rounded-xl p-3.5">
                  <span className="text-[11px] text-neutral-500 block">Current Status</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {data.current_status || 'In Transit'}
                  </span>
                </div>
                <div className="border border-neutral-200 rounded-xl p-3.5">
                  <span className="text-[11px] text-neutral-500 block">Expected Delivery</span>
                  <span className="text-xs font-bold text-neutral-900 mt-1 block">
                    {data.expected_delivery || 'Within 2-3 Days'}
                  </span>
                </div>
              </div>

              {/* Step Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-4">
                  Shipment Journey
                </h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                  {(data.timeline || []).map((step, idx) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                          step.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-neutral-300 text-neutral-400'
                        }`}
                      >
                        {step.completed ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-neutral-900">{step.title || step.status}</p>
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

              {/* Official Delhivery Link */}
              <div className="pt-2 text-center">
                <a
                  href={`https://www.delhivery.com/track/package/${waybill}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-neutral-500 hover:text-brand-maroon underline"
                >
                  <span>View on official Delhivery.com portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
