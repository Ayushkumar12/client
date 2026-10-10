import React, { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Printer,
  FileText,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Clock,
  Sparkles,
  Settings,
  FileCheck2
} from 'lucide-react';
import { ShiprocketTrackerModal } from '../../components/common/ShiprocketTrackerModal.jsx';
import { downloadOrderInvoicePdf } from '../../utils/invoicePdf.js';
import { api } from '../../services/api.js';

export function AdminShiprocket() {
  const [stats, setStats] = useState(null);
  const [manifests, setManifests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printingManifest, setPrintingManifest] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);

  // Live Tracking Search
  const [awbQuery, setAwbQuery] = useState('');
  const [trackingModalAwb, setTrackingModalAwb] = useState(null);

  // Pincode Tester
  const [testPin, setTestPin] = useState('110001');
  const [pinResult, setPinResult] = useState(null);
  const [pinLoading, setPinLoading] = useState(false);

  // Rate Calculator
  const [originPin, setOriginPin] = useState('110020');
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

  const handlePrintBatchManifest = async () => {
    if (manifests.length === 0) return;
    setPrintingManifest(true);
    try {
      const orderIds = manifests.map((m) => m.id);
      const res = await api.printShippingManifest({ order_ids: orderIds });
      if (res && res.manifest_url) {
        window.open(res.manifest_url, '_blank');
      } else {
        alert('Manifest generated successfully.');
      }
    } catch (e) {
      alert('Failed to print manifest: ' + e.message);
    } finally {
      setPrintingManifest(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              Shiprocket Logistics Hub
            </h1>
            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Sandbox & Live API
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Multi-carrier automated logistics engine, live pincode serviceability, instant AWB allocations & thermal labels.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="https://app.shiprocket.in/seller/settings/additional-settings/sandbox"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-brand-gold" />
            <span>Shiprocket Sandbox Settings</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-sm border border-brand-border shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Manifested</span>
              <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div className="font-serif text-3xl font-bold text-neutral-900 mt-2">
              {stats?.total_manifested || manifests.length || 0}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-flex items-center">
              ● Active Shiprocket AWBs
            </span>
          </div>

          <div className="bg-white p-5 rounded-sm border border-brand-border shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">In Transit / Out</span>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="font-serif text-3xl font-bold text-neutral-900 mt-2">
              {stats?.in_transit || 0}
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">Live tracking updates</span>
          </div>

          <div className="bg-white p-5 rounded-sm border border-brand-border shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Delivered</span>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="font-serif text-3xl font-bold text-neutral-900 mt-2">
              {stats?.delivered || 0}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">100% Success rate</span>
          </div>

          <div className="bg-white p-5 rounded-sm border border-brand-border shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active Couriers</span>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="font-serif text-3xl font-bold text-neutral-900 mt-2">
              {stats?.active_couriers || 6}+
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">BlueDart, Delhivery, DTDC</span>
          </div>
        </div>
      )}

      {/* AWB Quick Tracker & Pincode Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick AWB Tracker */}
        <div className="bg-white rounded-sm border border-brand-border p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-purple-600" />
            <h3 className="font-serif font-bold text-base text-neutral-900">
              Shiprocket Live Waybill Tracking
            </h3>
          </div>
          <p className="text-xs text-neutral-500">
            Query live multi-carrier status, real-time hub scans, checkpoints, and electronic proof of delivery.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (awbQuery.trim()) setTrackingModalAwb(awbQuery.trim());
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={awbQuery}
              onChange={(e) => setAwbQuery(e.target.value)}
              placeholder="Enter Shiprocket AWB (e.g. SR192837465)"
              className="flex-1 text-xs border border-neutral-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:border-purple-600"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Track Now
            </button>
          </form>
        </div>

        {/* Pincode Serviceability Tester */}
        <div className="bg-white rounded-sm border border-brand-border p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            <h3 className="font-serif font-bold text-base text-neutral-900">
              Courier Serviceability & TAT Tester
            </h3>
          </div>
          <p className="text-xs text-neutral-500">
            Verify 29,000+ Indian pincodes, prepaid/COD serviceability, courier partners, and expected delivery days.
          </p>

          <form onSubmit={handleTestPincode} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              maxLength={6}
              value={testPin}
              onChange={(e) => setTestPin(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit Pincode"
              className="w-full sm:w-36 text-xs border border-neutral-300 rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:border-purple-600"
            />
            <button
              type="submit"
              disabled={pinLoading}
              className="w-full sm:w-auto px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {pinLoading ? 'Checking...' : 'Check Serviceability'}
            </button>
          </form>

          {pinResult && (
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Serviceable ({pinResult.city}, {pinResult.state})</span>
                </span>
                <span className="text-purple-700 font-mono">TAT: {pinResult.estimated_days} Days</span>
              </div>
              <p className="text-[11px] text-neutral-600">
                Courier: <strong>{pinResult.courier_partner}</strong> | Expected: <strong>{pinResult.delivery_date}</strong>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Shipping Rate Calculator */}
      <div className="bg-white rounded-sm border border-brand-border p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-purple-600" />
          <h3 className="font-serif font-bold text-base text-neutral-900">
            Shipping Rate Calculator
          </h3>
        </div>
        <p className="text-xs text-neutral-500">
          Calculate multi-carrier commercial freight charges based on origin, destination pincodes, and volumetric parcel weight.
        </p>

        <form onSubmit={handleCalcRate} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] text-neutral-500 uppercase block font-semibold mb-1">Origin Pincode</label>
            <input
              type="text"
              maxLength={6}
              value={originPin}
              onChange={(e) => setOriginPin(e.target.value.replace(/\D/g, ''))}
              className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2 font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500 uppercase block font-semibold mb-1">Destination Pincode</label>
            <input
              type="text"
              maxLength={6}
              value={destPin}
              onChange={(e) => setDestPin(e.target.value.replace(/\D/g, ''))}
              className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2 font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500 uppercase block font-semibold mb-1">Weight (Grams)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full text-xs border border-neutral-300 rounded-xl px-3 py-2 font-mono"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={rateLoading}
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {rateLoading ? 'Calculating...' : 'Get Rates'}
            </button>
          </div>
        </form>

        {rateResult && (
          <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Freight Charge</span>
              <span className="font-bold text-neutral-900 text-sm">₹{rateResult.freight_charge || rateResult.gross_amount || rateResult.shipping_rate || 65}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Total Cost</span>
              <span className="font-bold text-purple-900 text-sm">₹{rateResult.total_amount || rateResult.shipping_rate}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Carrier Mode</span>
              <span className="font-bold text-neutral-900">{rateResult.carrier || 'Shiprocket Express'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Recent Manifests Table */}
      <div className="bg-white rounded-sm border border-brand-border p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-base text-neutral-900">
              Shiprocket Manifests & Dispatches
            </h3>
            <p className="text-xs text-neutral-500">
              View generated orders, print official packing slips, and export carrier handover manifests.
            </p>
          </div>

          {manifests.length > 0 && (
            <button
              onClick={handlePrintBatchManifest}
              disabled={printingManifest}
              className="px-3.5 py-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Print Courier Handover Manifest Sheet"
            >
              <FileCheck2 className="w-4 h-4 text-brand-gold" />
              <span>{printingManifest ? 'Generating...' : 'Print Handover Manifest'}</span>
            </button>
          )}
        </div>

        {manifests.length === 0 ? (
          <p className="text-xs text-neutral-500 py-6 text-center">No manifested shipments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-neutral-500 border-b border-neutral-100 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Order #</th>
                  <th className="pb-3 font-bold">Customer</th>
                  <th className="pb-3 font-bold">Shiprocket AWB</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold text-right">Actions (Admin Only)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {manifests.map((m) => (
                  <tr key={m.id} className="hover:bg-neutral-50/80">
                    <td className="py-3 font-mono font-bold text-neutral-900">{m.order_number}</td>
                    <td className="py-3 font-medium text-neutral-900">{m.customer_name}</td>
                    <td className="py-3 font-mono font-bold text-purple-700">{m.delhivery_waybill}</td>
                    <td className="py-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                        {m.delhivery_status || 'Manifested'}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-neutral-900">₹{m.grand_total}</td>
                    <td className="py-3 text-right space-x-2">
                      {/* Download Tax Invoice */}
                      <button
                        onClick={async () => {
                          setDownloadingInvoiceId(m.id);
                          await downloadOrderInvoicePdf(m);
                          setDownloadingInvoiceId(null);
                        }}
                        disabled={downloadingInvoiceId === m.id}
                        className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-brand-maroon rounded-lg cursor-pointer disabled:opacity-50"
                        title="Download Tax Invoice (PDF)"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {/* Print Packing Slip */}
                      <a
                        href={api.getPackingSlipUrl(m.delhivery_waybill)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block p-1.5 bg-brand-cream hover:bg-brand-sand text-brand-maroon rounded-lg cursor-pointer"
                        title="Print Packing Slip & Shipping Label"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </a>

                      {/* Track Live */}
                      <button
                        onClick={() => setTrackingModalAwb(m.delhivery_waybill)}
                        className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg cursor-pointer"
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
        )}
      </div>

      {/* Live Tracking Modal */}
      {trackingModalAwb && (
        <ShiprocketTrackerModal
          waybill={trackingModalAwb}
          isOpen={Boolean(trackingModalAwb)}
          onClose={() => setTrackingModalAwb(null)}
        />
      )}
    </div>
  );
}

// Backward compatibility alias
export const AdminDelhivery = AdminShiprocket;
