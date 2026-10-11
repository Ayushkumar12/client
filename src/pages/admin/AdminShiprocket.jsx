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
  Package,
  Settings,
  FileCheck2,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Lock,
  Server,
  Check,
  Key
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

  // Shiprocket Credentials & Configuration State
  const [showConfig, setShowConfig] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [configTesting, setConfigTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [configForm, setConfigForm] = useState({
    email: '',
    password: '',
    has_password: false,
    api_token: '',
    pickup_location: 'Primary',
    pickup_pincode: '110091',
    sandbox_mode: false,
    base_url: 'https://apiv2.shiprocket.in/v1/external',
    serviceability_url: 'https://apiv2.shiprocket.in/v1/external',
    webhook_secret: ''
  });

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
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setConfigLoading(true);
    try {
      const res = await api.getShiprocketConfig();
      if (res.success && res.config) {
        setConfigForm({
          email: res.config.email || '',
          password: '',
          has_password: Boolean(res.config.has_password),
          api_token: res.config.api_token || '',
          pickup_location: res.config.pickup_location || 'Primary',
          pickup_pincode: res.config.pickup_pincode || '110091',
          sandbox_mode: Boolean(res.config.sandbox_mode),
          base_url: res.config.base_url || 'https://apiv2.shiprocket.in/v1/external',
          serviceability_url: res.config.serviceability_url || 'https://apiv2.shiprocket.in/v1/external',
          webhook_secret: res.config.webhook_secret || ''
        });
      }
    } catch (e) {
      console.error('Failed to load Shiprocket config:', e);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();
    setConfigSaving(true);
    setSaveMessage(null);
    try {
      const payload = { ...configForm };
      if (!payload.password || payload.password.trim() === '') {
        delete payload.password;
      }
      const res = await api.updateShiprocketConfig(payload);
      if (res.success) {
        setSaveMessage({ type: 'success', text: 'Shiprocket configuration successfully updated and active.' });
        setConfigForm(prev => ({
          ...prev,
          password: '',
          has_password: Boolean(res.config?.has_password)
        }));
        loadOverview();
      } else {
        setSaveMessage({ type: 'error', text: res.message || 'Failed to update configuration.' });
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message || 'Error updating configuration.' });
    } finally {
      setConfigSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setConfigTesting(true);
    setTestResult(null);
    try {
      const res = await api.testShiprocketConnection({
        email: configForm.email,
        password: configForm.password || undefined,
        base_url: configForm.base_url
      });
      setTestResult({
        success: res.success,
        latency_ms: res.latency_ms,
        token_preview: res.token_preview,
        message: res.message || 'Shiprocket authentication successful.'
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Shiprocket authentication test failed. Verify credentials.'
      });
    } finally {
      setConfigTesting(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-sans text-2xl sm:text-3xl font-bold text-neutral-900">
              Shiprocket Logistics Hub
            </h1>
            {configForm.sandbox_mode ? (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                Sandbox Mode
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                Live Production
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Multi-carrier automated logistics engine, live pincode serviceability, instant AWB allocations & thermal labels.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-300" />
            <span>{showConfig ? 'Hide Configuration' : 'API Configuration'}</span>
          </button>
          <a
            href="https://app.shiprocket.in/seller/settings/additional-settings/sandbox"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <span>Shiprocket Console</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
        </div>
      </div>

      {/* Shiprocket Configuration Panel */}
      {showConfig && (
        <div className="bg-white border border-neutral-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-neutral-800" />
                <h2 className="text-base font-bold text-neutral-900">Shiprocket API & Account Settings</h2>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Dynamic logistics settings saved in database. All orders, shipping labels, rate calculations and manifests utilize these live credentials without server restart.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={loadConfig}
                disabled={configLoading}
                className="px-3 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                title="Reload saved values from database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${configLoading ? 'animate-spin' : ''}`} />
                <span>Reload</span>
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className={`p-3 text-xs flex items-center justify-between border ${
              saveMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center space-x-2">
                {saveMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{saveMessage.text}</span>
              </div>
              <button onClick={() => setSaveMessage(null)} className="text-neutral-400 hover:text-neutral-700 text-xs ml-2">✕</button>
            </div>
          )}

          {testResult && (
            <div className={`p-3 text-xs flex items-center justify-between border ${
              testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center space-x-2">
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <div>
                  <div className="font-semibold">{testResult.message}</div>
                  {testResult.latency_ms !== undefined && (
                    <div className="text-[11px] text-neutral-600 mt-0.5">
                      Latency: <span className="font-mono font-medium">{testResult.latency_ms}ms</span>
                      {testResult.token_preview && <> &bull; Active Token: <span className="font-mono">{testResult.token_preview}</span></>}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setTestResult(null)} className="text-neutral-400 hover:text-neutral-700 text-xs ml-2">✕</button>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Shiprocket Account Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={configForm.email}
                  onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                  placeholder="e.g. shipping@brand.com"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                />
                <p className="text-[11px] text-neutral-500 mt-1">Used to authenticate with Shiprocket API to obtain Bearer tokens.</p>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-700">
                    Account Password {configForm.has_password && <span className="text-emerald-700 font-normal">(Configured)</span>}
                  </label>
                  {configForm.has_password && (
                    <span className="text-[11px] text-neutral-500">Leave blank to retain saved password</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={configForm.password}
                    onChange={(e) => setConfigForm({ ...configForm, password: e.target.value })}
                    placeholder={configForm.has_password ? '•••••••• (Enter new password to change)' : 'Enter account password'}
                    className="w-full px-3 py-2 pr-9 text-xs border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Stored securely on server; never exposed to public APIs.</p>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Default Pickup Hub / Warehouse Name
                </label>
                <input
                  type="text"
                  value={configForm.pickup_location}
                  onChange={(e) => setConfigForm({ ...configForm, pickup_location: e.target.value })}
                  placeholder="e.g. Primary or Warehouse-Delhi"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                />
                <p className="text-[11px] text-neutral-500 mt-1">Must match registered pickup location nickname in Shiprocket console.</p>
              </div>

              {/* Pickup Pincode */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Warehouse Origin Pincode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={configForm.pickup_pincode}
                  onChange={(e) => setConfigForm({ ...configForm, pickup_pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 110091"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white font-mono"
                />
                <p className="text-[11px] text-neutral-500 mt-1">Default 6-digit origin pincode for serviceability and freight calculation.</p>
              </div>

              {/* Environment Mode */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Environment Operating Mode
                </label>
                <div className="flex items-center space-x-6 mt-2">
                  <label className="flex items-center space-x-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="sandbox_mode"
                      checked={!configForm.sandbox_mode}
                      onChange={() => setConfigForm({ ...configForm, sandbox_mode: false })}
                      className="text-neutral-900"
                    />
                    <span className="font-semibold text-neutral-900">Live Production API</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="sandbox_mode"
                      checked={configForm.sandbox_mode}
                      onChange={() => setConfigForm({ ...configForm, sandbox_mode: true })}
                      className="text-neutral-900"
                    />
                    <span className="font-semibold text-amber-800">Sandbox Mode</span>
                  </label>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  {configForm.sandbox_mode 
                    ? 'Sandbox mode generates simulated tracking numbers and orders without live courier booking fees.' 
                    : 'Live mode dispatches real shipments and books live carrier pickups via Shiprocket API.'}
                </p>
              </div>

              {/* Base API URL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Shiprocket Base API Endpoint
                </label>
                <input
                  type="url"
                  value={configForm.base_url}
                  onChange={(e) => setConfigForm({ ...configForm, base_url: e.target.value })}
                  placeholder="https://apiv2.shiprocket.in/v1/external"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white font-mono"
                />
                <p className="text-[11px] text-neutral-500 mt-1">Default: https://apiv2.shiprocket.in/v1/external</p>
              </div>

              {/* Webhook Secret */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Webhook Secret Token
                </label>
                <input
                  type="text"
                  value={configForm.webhook_secret}
                  onChange={(e) => setConfigForm({ ...configForm, webhook_secret: e.target.value })}
                  placeholder="Optional verification token for Shiprocket webhook push"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white font-mono"
                />
                <p className="text-[11px] text-neutral-500 mt-1">Verifies authenticity of incoming tracking status webhooks.</p>
              </div>

              {/* Direct Bearer Token Override */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Direct Bearer Token (Optional Override)
                </label>
                <input
                  type="text"
                  value={configForm.api_token}
                  onChange={(e) => setConfigForm({ ...configForm, api_token: e.target.value })}
                  placeholder="Leave empty to use automatic email/password auth"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white font-mono"
                />
                <p className="text-[11px] text-neutral-500 mt-1">Manual long-lived Bearer token override if provided by Shiprocket manager.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={configTesting || (!configForm.email && !configForm.api_token)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold border border-neutral-300 flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {configTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />}
                <span>{configTesting ? 'Testing Credentials...' : 'Test Connection & Verify Token'}</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={configSaving}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {configSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{configSaving ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Metrics Row */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 border border-neutral-200 animate-pulse space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-neutral-200/80 rounded w-24 skeleton-shimmer" />
                <div className="w-8 h-8 bg-neutral-200/80 rounded skeleton-shimmer" />
              </div>
              <div className="h-7 bg-neutral-200/80 rounded w-16 skeleton-shimmer" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 border border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Manifested</span>
              <div className="p-2 bg-neutral-100 text-neutral-700">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div className="font-sans text-3xl font-bold text-neutral-900 mt-2">
              {stats?.total_manifested || manifests.length || 0}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-flex items-center">
              ● Active Shiprocket AWBs
            </span>
          </div>

          <div className="bg-white p-5 border border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">In Transit / Out</span>
              <div className="p-2 bg-neutral-100 text-neutral-700">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="font-sans text-3xl font-bold text-neutral-900 mt-2">
              {stats?.in_transit || 0}
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block">Live tracking updates</span>
          </div>

          <div className="bg-white p-5 border border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Delivered</span>
              <div className="p-2 bg-neutral-100 text-neutral-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="font-sans text-3xl font-bold text-neutral-900 mt-2">
              {stats?.delivered || 0}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">100% Success rate</span>
          </div>

          <div className="bg-white p-5 border border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active Couriers</span>
              <div className="p-2 bg-neutral-100 text-neutral-700">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="font-sans text-3xl font-bold text-neutral-900 mt-2">
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
            <h3 className="font-sans font-bold text-base text-neutral-900">
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
            <h3 className="font-sans font-bold text-base text-neutral-900">
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
          <h3 className="font-sans font-bold text-base text-neutral-900">
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
            <h3 className="font-sans font-bold text-base text-neutral-900">
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
