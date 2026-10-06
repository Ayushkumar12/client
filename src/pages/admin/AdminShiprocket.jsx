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

          <button
            onClick={loadOverview}
            className="p-2 bg-white border border-neutral-300 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 shadow-2xs"
            title="Refresh Overview"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Manifested</span>
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-neutral-900">
            {stats?.total_shipments || 0}
          </p>
          <span className="text-[11px] text-purple-700 font-semibold">
            Shiprocket AWB Assigned
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active In-Transit</span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-neutral-900">
            {stats?.in_transit || 0}
          </p>
          <span className="text-[11px] text-amber-700 font-semibold">
            Live Telemetry Synced
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Delivered</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-neutral-900">
            {stats?.delivered || 0}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">
            OTP Verified Deliveries
          </span>
        </div>
      </div>

      {/* Grid: Live AWB Tracking Lookup & Pincode Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live AWB Lookup (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-brand-border p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-neutral-900 flex items-center space-x-2">
              <Search className="w-4 h-4 text-purple-600" />
              <span>Shiprocket Live AWB Lookup</span>
            </h3>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
              Direct API
            </span>
          </div>

          <p className="text-xs text-neutral-600">
            Track any Shiprocket AWB number or Order ID to inspect live scans and carrier milestones.
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
              placeholder="Enter Shiprocket AWB (e.g. SR8492019482)"
              className="flex-1 text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-purple-600 font-mono font-bold"
            />
            <button
              type="submit"
              disabled={!awbQuery.trim()}
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:bg-neutral-400 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Track Live
            </button>
          </form>
        </div>

        {/* Pincode Serviceability Tester (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-brand-border p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-neutral-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Pincode Serviceability Tester</span>
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              Live Network
            </span>
          </div>

          <form onSubmit={handleTestPincode} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={testPin}
              onChange={(e) => setTestPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit PIN"
              className="flex-1 text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-purple-600 font-bold"
            />
            <button
              type="submit"
              disabled={pinLoading || testPin.length < 6}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {pinLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Check PIN'}
            </button>
          </form>

          {pinResult && (
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900">
                  {pinResult.city}, {pinResult.state} ({pinResult.pincode})
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  pinResult.serviceable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {pinResult.serviceable ? 'SERVICEABLE' : 'UNSERVICEABLE'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-600">
                Est. Delivery: <strong>{pinResult.delivery_date} ({pinResult.estimated_days} Days)</strong>
              </p>
              <p className="text-[11px] text-neutral-600">
                Partner: <strong>{pinResult.courier_partner}</strong> • COD: <strong>{pinResult.cod_available ? 'YES' : 'NO'}</strong>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rate Calculator */}
      <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-neutral-900 flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-purple-600" />
            <span>Shiprocket Multi-Carrier Shipping Rate Estimator</span>
          </h3>
          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
            Real-time Tariff
          </span>
        </div>

        <form onSubmit={handleCalcRate} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Origin PIN</label>
            <input
              type="text"
              maxLength={6}
              value={originPin}
              onChange={(e) => setOriginPin(e.target.value)}
              className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Destination PIN</label>
            <input
              type="text"
              maxLength={6}
              value={destPin}
              onChange={(e) => setDestPin(e.target.value)}
              className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Weight (Grams)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={rateLoading}
              className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {rateLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Calculate Rate'}
            </button>
          </div>
        </form>

        {rateResult && (
          <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Freight Charge</span>
              <span className="font-bold text-neutral-900 text-sm">₹{rateResult.gross_amount || rateResult.shipping_rate}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold">GST (18%)</span>
              <span className="font-bold text-neutral-900 text-sm">₹{rateResult.gst_amount || 0}</span>
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
      <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-2xs space-y-4">
        <h3 className="font-serif font-bold text-base text-neutral-900">
          Recent Shiprocket Manifests
        </h3>

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
                  <th className="pb-3 font-bold text-right">Actions</th>
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
                      <a
                        href={api.getPackingSlipUrl(m.delhivery_waybill)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg cursor-pointer"
                        title="Print Packing Slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </a>
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
