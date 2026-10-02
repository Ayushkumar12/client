import React, { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Printer,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Clock
} from 'lucide-react';
import { DelhiveryTrackerModal } from '../../components/common/DelhiveryTrackerModal.jsx';
import { api } from '../../services/api.js';

export function AdminDelhivery() {
  const [stats, setStats] = useState(null);
  const [manifests, setManifests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Tracking Search
  const [awbQuery, setAwbQuery] = useState('');
  const [trackingModalAwb, setTrackingModalAwb] = useState(null);

  // Pincode Tester
  const [testPin, setTestPin] = useState('110001');
  const [pinResult, setPinResult] = useState(null);
  const [pinLoading, setPinLoading] = useState(false);

  // Rate Calculator
  const [originPin, setOriginPin] = useState('110001');
  const [destPin, setDestPin] = useState('400001');
  const [weight, setWeight] = useState(800);
  const [rateResult, setRateResult] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await api.getLogisticsStats();
      if (res.success) {
        setStats(res.stats);
        setManifests(res.recent_manifests || []);
      }
    } catch (e) {
      console.error('Failed to load logistics overview:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTestPincode = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(testPin.trim())) return;
    setPinLoading(true);
    try {
      const res = await api.checkPincode(testPin.trim());
      setPinResult(res);
    } catch (e) {
      alert('Pincode check error: ' + e.message);
    } finally {
      setPinLoading(false);
    }
  };

  const handleCalcRate = async (e) => {
    e.preventDefault();
    setRateLoading(true);
    try {
      const res = await api.getShippingRate({
        origin_pin: originPin,
        destination_pin: destPin,
        weight_grams: weight
      });
      setRateResult(res);
    } catch (e) {
      alert('Rate calc error: ' + e.message);
    } finally {
      setRateLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              Delhivery One Logistics Hub
            </h1>
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              B2C Express
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Official logistics integration with Delhivery One for real-time serviceability, AWB tracking, manifests & labels.
          </p>
        </div>

        <a
          href="https://one.delhivery.com"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span>Delhivery One Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold uppercase">
            <span>Total Manifested Shipments</span>
            <Truck className="w-4 h-4 text-brand-maroon" />
          </div>
          <p className="font-serif text-2xl font-bold text-neutral-900">{stats?.total_shipments || 0}</p>
          <span className="text-[11px] text-neutral-500">Surface & Air B2C</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold uppercase">
            <span>Currently In Transit</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-amber-700">{stats?.in_transit || 0}</p>
          <span className="text-[11px] text-amber-700 font-semibold">Active Scan Tracking</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold uppercase">
            <span>Delivered Successfully</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-700">{stats?.delivered || 0}</p>
          <span className="text-[11px] text-emerald-700 font-semibold">OTP Verified Doorstep</span>
        </div>
      </div>

      {/* Tool Row: Live AWB Tracker + Pincode Tester + Rate Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Live AWB Tracker */}
        <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-2xs space-y-3">
          <h3 className="font-serif font-bold text-sm text-neutral-900 flex items-center space-x-2">
            <Truck className="w-4 h-4 text-brand-maroon" />
            <span>Live AWB Scan Tracker</span>
          </h3>
          <p className="text-xs text-neutral-500">Test live Delhivery tracking response for any waybill.</p>

          <form onSubmit={(e) => { e.preventDefault(); if (awbQuery) setTrackingModalAwb(awbQuery); }} className="space-y-2">
            <input
              type="text"
              required
              value={awbQuery}
              onChange={(e) => setAwbQuery(e.target.value.toUpperCase())}
              placeholder="e.g. DLV98328471928"
              className="w-full text-xs p-2.5 border rounded-lg uppercase font-mono font-bold"
            />
            <button
              type="submit"
              className="w-full py-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-bold rounded-lg"
            >
              Track Waybill Live
            </button>
          </form>
        </div>

        {/* 2. Pincode Serviceability Tester */}
        <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-2xs space-y-3">
          <h3 className="font-serif font-bold text-sm text-neutral-900 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-brand-maroon" />
            <span>Pincode Serviceability Tester</span>
          </h3>
          <p className="text-xs text-neutral-500">Check TAT and COD availability for customer pincode.</p>

          <form onSubmit={handleTestPincode} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={testPin}
                onChange={(e) => setTestPin(e.target.value)}
                placeholder="110001"
                className="flex-1 text-xs p-2.5 border rounded-lg font-bold"
              />
              <button
                type="submit"
                disabled={pinLoading}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg"
              >
                {pinLoading ? '...' : 'Verify'}
              </button>
            </div>
          </form>

          {pinResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-900 animate-fadeIn">
              <p className="font-bold">✓ {pinResult.city}, {pinResult.state}</p>
              <p className="text-[11px] text-neutral-700">Estimated TAT: <strong>{pinResult.estimated_days || 3} Days</strong></p>
              <p className="text-[11px] text-neutral-700">COD: <strong>{pinResult.cod_available ? 'Supported' : 'No'}</strong></p>
            </div>
          )}
        </div>

        {/* 3. Shipping Rate Estimator */}
        <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-2xs space-y-3">
          <h3 className="font-serif font-bold text-sm text-neutral-900 flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-brand-maroon" />
            <span>Shipping Rate Calculator</span>
          </h3>
          <p className="text-xs text-neutral-500">Calculate freight charge based on parcel weight.</p>

          <form onSubmit={handleCalcRate} className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                maxLength={6}
                value={originPin}
                onChange={(e) => setOriginPin(e.target.value)}
                placeholder="Origin (110001)"
                className="p-2 border rounded-lg"
              />
              <input
                type="text"
                maxLength={6}
                value={destPin}
                onChange={(e) => setDestPin(e.target.value)}
                placeholder="Dest (400001)"
                className="p-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                placeholder="Weight (grams)"
                className="flex-1 p-2 border rounded-lg"
              />
              <button
                type="submit"
                disabled={rateLoading}
                className="px-4 py-2 bg-neutral-900 text-white font-bold rounded-lg"
              >
                {rateLoading ? '...' : 'Estimate'}
              </button>
            </div>
          </form>

          {rateResult && (
            <div className="p-3 bg-brand-cream border border-brand-border rounded-xl text-xs space-y-1 text-neutral-900 animate-fadeIn">
              <div className="flex justify-between font-bold">
                <span>Estimated Freight:</span>
                <span className="text-brand-maroon font-bold text-sm">₹{rateResult.shipping_rate}</span>
              </div>
              <p className="text-[11px] text-neutral-500">Mode: {rateResult.carrier}</p>
            </div>
          )}
        </div>
      </div>

      {/* Manifests & Recent Shipments Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-2xs overflow-hidden space-y-4 p-6">
        <h3 className="font-serif font-bold text-base text-neutral-900">
          Recent Delhivery Manifests & Waybills
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Order #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Delhivery Waybill (AWB)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Manifest Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {manifests.map((m) => (
                <tr key={m.id} className="hover:bg-neutral-50/80">
                  <td className="p-3 font-mono font-bold text-neutral-900">{m.order_number}</td>
                  <td className="p-3 font-medium text-neutral-800">{m.customer_name}</td>
                  <td className="p-3 font-mono font-bold text-brand-maroon">{m.delhivery_waybill}</td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {m.delhivery_status}
                    </span>
                  </td>
                  <td className="p-3 text-neutral-500">{new Date(m.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="p-3 text-right space-x-2">
                    <a
                      href={`/api/delhivery/shipping-label/${m.delhivery_waybill}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg"
                      title="Print Delhivery Label"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setTrackingModalAwb(m.delhivery_waybill)}
                      className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
                      title="Track Live"
                    >
                      <Truck className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Tracker Modal */}
      {trackingModalAwb && (
        <DelhiveryTrackerModal
          waybill={trackingModalAwb}
          isOpen={Boolean(trackingModalAwb)}
          onClose={() => setTrackingModalAwb(null)}
        />
      )}
    </div>
  );
}
