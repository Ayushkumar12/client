import React, { useState, useEffect } from 'react';
import {
  Boxes,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ShoppingBag,
  ExternalLink,
  Settings,
  Activity,
  Plus,
  Minus,
  Edit3,
  Loader2,
  Check,
  TrendingDown,
  TrendingUp,
  Zap,
  ShieldCheck,
  Server,
  ArrowRight,
  Database,
  Globe,
  Sliders,
  Send,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api.js';

export function AdminInventory() {
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingProductId, setSyncingProductId] = useState(null);
  const [testingChannelKey, setTestingChannelKey] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals state
  const [stockEditProduct, setStockEditProduct] = useState(null);
  const [stockInputValue, setStockInputValue] = useState(0);
  const [stockEditNotes, setStockEditNotes] = useState('');
  const [updatingStock, setUpdatingStock] = useState(false);

  // Channel Listing Edit Modal
  const [editingChannelData, setEditingChannelData] = useState(null); // { product, channelKey }
  const [channelForm, setChannelForm] = useState({
    allocated_stock: '',
    channel_price: '',
    channel_sku: '',
    channel_product_id: '',
    listing_status: 'active'
  });
  const [savingChannelListing, setSavingChannelListing] = useState(false);

  // Channel Config Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeConfigTab, setActiveConfigTab] = useState('flipkart');
  const [configForms, setConfigForms] = useState({});
  const [savingConfig, setSavingConfig] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Audit Logs Modal
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Simulate Marketplace Order Modal
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulateProduct, setSimulateProduct] = useState(null);
  const [simulateQty, setSimulateQty] = useState(1);
  const [simulateChannel, setSimulateChannel] = useState('flipkart');
  const [simulating, setSimulating] = useState(false);
  const [simulateResult, setSimulateResult] = useState(null);

  // Toast / Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedStockStatus, selectedCategory]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [overviewRes, channelsRes] = await Promise.all([
        api.getInventoryOverview(),
        api.getChannelConfigs()
      ]);

      if (overviewRes.success) {
        setOverview(overviewRes.metrics);
        setChannels(overviewRes.channels || []);
      }

      if (channelsRes.success) {
        const confMap = {};
        channelsRes.channels.forEach(ch => {
          confMap[ch.channel_key] = {
            is_connected: ch.is_connected,
            auto_sync: ch.auto_sync,
            sync_frequency_mins: ch.sync_frequency_mins || 15,
            ...ch.api_config
          };
        });
        setConfigForms(confMap);
      }

      await fetchProducts();
    } catch (e) {
      console.error('Failed to load inventory data:', e);
      showToast('Error loading inventory data: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.getInventoryProducts({
        search,
        stock_status: selectedStockStatus,
        category: selectedCategory,
        limit: 100
      });
      if (res.success) {
        setProducts(res.products);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    }
  };

  // Sync All Channels
  const handleBulkSync = async () => {
    setSyncingAll(true);
    try {
      const res = await api.bulkSyncAllChannels();
      if (res.success) {
        showToast(`⚡ Multi-Marketplace Sync Complete: ${res.summary.synced_items_count} listings updated across Flipkart, Amazon, Meesho & Storefront!`);
        await fetchInitialData();
      }
    } catch (e) {
      showToast('Bulk sync failed: ' + e.message, 'error');
    } finally {
      setSyncingAll(false);
    }
  };

  // Sync Single Product
  const handleSyncProduct = async (product) => {
    setSyncingProductId(product.id);
    try {
      const res = await api.syncSingleProduct(product.id);
      if (res.success) {
        showToast(`✔ Product "${product.title}" synced to Flipkart, Amazon, Meesho & Storefront.`);
        await fetchProducts();
      }
    } catch (e) {
      showToast('Product sync failed: ' + e.message, 'error');
    } finally {
      setSyncingProductId(null);
    }
  };

  // Quick Stock Step Update (+1 / -1)
  const handleQuickStockStep = async (product, step) => {
    const nextStock = Math.max(0, product.stock + step);
    try {
      const res = await api.updateMasterStock(product.id, {
        stock: nextStock,
        notes: `Quick stock adjustment (${step > 0 ? '+' : ''}${step}) by Admin.`
      });
      if (res.success) {
        setProducts(prev =>
          prev.map(p => (p.id === product.id ? { ...p, stock: nextStock, stock_status: nextStock <= 0 ? 'out_of_stock' : nextStock <= 10 ? 'low_stock' : 'in_stock' } : p))
        );
        showToast(`Updated "${product.title}" stock to ${nextStock} units.`);
      }
    } catch (e) {
      showToast('Stock update failed: ' + e.message, 'error');
    }
  };

  // Open Master Stock Modal
  const openStockEditModal = (product) => {
    setStockEditProduct(product);
    setStockInputValue(product.stock);
    setStockEditNotes('');
  };

  // Submit Master Stock
  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!stockEditProduct) return;
    setUpdatingStock(true);
    try {
      const res = await api.updateMasterStock(stockEditProduct.id, {
        stock: Number(stockInputValue),
        notes: stockEditNotes || `Stock manually updated to ${stockInputValue} units. Auto-synced to all channels.`
      });
      if (res.success) {
        showToast(res.message);
        setStockEditProduct(null);
        await fetchInitialData();
      }
    } catch (e) {
      showToast('Failed to update stock: ' + e.message, 'error');
    } finally {
      setUpdatingStock(false);
    }
  };

  // Open Channel Listing Edit Modal
  const openChannelListingModal = (product, channelKey) => {
    const current = product.channels[channelKey] || {};
    setEditingChannelData({ product, channelKey });
    setChannelForm({
      allocated_stock: current.allocated_stock !== undefined ? current.allocated_stock : product.stock,
      channel_price: current.channel_price !== undefined ? current.channel_price : product.price,
      channel_sku: current.channel_sku || product.sku,
      channel_product_id: current.channel_product_id || '',
      listing_status: current.listing_status || 'active'
    });
  };

  // Save Channel Listing
  const handleSaveChannelListing = async (e) => {
    e.preventDefault();
    if (!editingChannelData) return;
    const { product, channelKey } = editingChannelData;
    setSavingChannelListing(true);
    try {
      const res = await api.updateChannelListing(product.id, channelKey, {
        allocated_stock: Number(channelForm.allocated_stock),
        channel_price: Number(channelForm.channel_price),
        channel_sku: channelForm.channel_sku,
        channel_product_id: channelForm.channel_product_id,
        listing_status: channelForm.listing_status
      });
      if (res.success) {
        showToast(res.message);
        setEditingChannelData(null);
        await fetchProducts();
      }
    } catch (e) {
      showToast('Update failed: ' + e.message, 'error');
    } finally {
      setSavingChannelListing(false);
    }
  };

  // Test Channel API Connection
  const handleTestConnection = async (channelKey) => {
    setTestingChannelKey(channelKey);
    setTestResult(null);
    try {
      const res = await api.testChannelConnection(channelKey);
      if (res.success) {
        setTestResult(res.test_result);
        showToast(res.message);
        const chanRes = await api.getChannelConfigs();
        if (chanRes.success) setChannels(chanRes.channels);
      }
    } catch (e) {
      showToast('Connection test error: ' + e.message, 'error');
    } finally {
      setTestingChannelKey(null);
    }
  };

  // Save Channel Config
  const handleSaveChannelConfig = async (channelKey) => {
    setSavingConfig(true);
    try {
      const currentConfig = configForms[channelKey] || {};
      const res = await api.updateChannelConfig(channelKey, {
        is_connected: currentConfig.is_connected,
        auto_sync: currentConfig.auto_sync,
        sync_frequency_mins: Number(currentConfig.sync_frequency_mins || 15),
        api_config: currentConfig
      });
      if (res.success) {
        showToast(res.message);
        const chanRes = await api.getChannelConfigs();
        if (chanRes.success) setChannels(chanRes.channels);
      }
    } catch (e) {
      showToast('Config save error: ' + e.message, 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  // Load Audit Logs
  const openLogsModal = async () => {
    setShowLogsModal(true);
    setLoadingLogs(true);
    try {
      const res = await api.getInventoryLogs({ limit: 40 });
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (e) {
      showToast('Failed to load logs: ' + e.message, 'error');
    } finally {
      setLoadingLogs(false);
    }
  };

  // Open Simulate Modal
  const openSimulateModal = (product = null) => {
    setSimulateProduct(product || products[0] || null);
    setSimulateQty(1);
    setSimulateChannel('flipkart');
    setSimulateResult(null);
    setShowSimulateModal(true);
  };

  // Execute Simulate Marketplace Order
  const handleSimulateOrder = async (e) => {
    e.preventDefault();
    if (!simulateProduct) return;
    setSimulating(true);
    setSimulateResult(null);
    try {
      const res = await api.simulateMarketplaceOrder({
        productId: simulateProduct.id,
        quantity: Number(simulateQty),
        channelKey: simulateChannel
      });
      if (res.success) {
        setSimulateResult(res);
        showToast(res.message);
        await fetchInitialData();
      }
    } catch (e) {
      showToast('Simulation error: ' + e.message, 'error');
    } finally {
      setSimulating(false);
    }
  };

  // Helper channel badges & styling
  const getChannelMeta = (key) => {
    switch (key) {
      case 'flipkart':
        return {
          title: 'Flipkart',
          tag: 'Seller Hub',
          logoBg: 'bg-[#2874F0] text-white',
          badgeColor: 'border-blue-200 text-blue-800 bg-blue-50',
          dotColor: 'bg-[#2874F0]',
          idLabel: 'FSN'
        };
      case 'amazon':
        return {
          title: 'Amazon',
          tag: 'SP-API (India)',
          logoBg: 'bg-[#FF9900] text-neutral-900',
          badgeColor: 'border-amber-200 text-amber-900 bg-amber-50',
          dotColor: 'bg-[#FF9900]',
          idLabel: 'ASIN'
        };
      case 'meesho':
        return {
          title: 'Meesho',
          tag: 'Supplier Panel',
          logoBg: 'bg-[#580044] text-white',
          badgeColor: 'border-fuchsia-200 text-fuchsia-900 bg-fuchsia-50',
          dotColor: 'bg-[#F43397]',
          idLabel: 'Meesho SKU'
        };
      case 'storefront':
      default:
        return {
          title: 'Live Storefront',
          tag: 'OCT9 Boutique',
          logoBg: 'bg-[#5A1827] text-white',
          badgeColor: 'border-emerald-200 text-emerald-900 bg-emerald-50',
          dotColor: 'bg-emerald-500',
          idLabel: 'Storefront ID'
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-3 text-xs font-bold animate-bounce transition-all ${
            toastMessage.type === 'error'
              ? 'bg-red-900/90 text-white border-red-700'
              : 'bg-neutral-900/95 text-white border-brand-gold/40'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-brand-gold" />
          )}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Header & Global Sync Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-neutral-950 to-brand-maroon text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-neutral-800">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <div className="p-2 bg-brand-gold/15 text-brand-gold rounded-xl border border-brand-gold/30">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
                Multi-Channel Inventory Hub
              </h1>
              <p className="text-xs text-neutral-300">
                Unified stock management connected live to <strong className="text-blue-400">Flipkart</strong>, <strong className="text-amber-400">Amazon</strong>, <strong className="text-fuchsia-400">Meesho</strong>, and <strong className="text-emerald-400">OCT9 Live Frontend</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={openLogsModal}
            className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-xl text-xs font-bold border border-neutral-700 flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-brand-gold" />
            <span>Audit & Sync Logs</span>
          </button>

          <button
            onClick={() => openSimulateModal()}
            className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30 flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
            title="Simulate incoming order from Flipkart/Amazon/Meesho to test real-time stock deduction across all channels"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Order Sync (Simulate)</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-xl text-xs font-bold border border-neutral-700 flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-300" />
            <span>API Settings</span>
          </button>

          <button
            onClick={handleBulkSync}
            disabled={syncingAll}
            className="px-4 py-2.5 bg-brand-gold hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
            <span>{syncingAll ? 'Syncing 4 Marketplaces...' : 'Sync All Channels Now'}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Total Products</span>
            <Layers className="w-4 h-4 text-brand-maroon" />
          </div>
          <p className="text-2xl font-extrabold text-neutral-900 mt-1">{overview?.total_products || 0}</p>
          <span className="text-[10px] text-neutral-400">Master Catalog SKUs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Warehouse Units</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-neutral-900 mt-1">{overview?.total_stock_units || 0}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Total Available Stock</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Healthy Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{overview?.in_stock_count || 0}</p>
          <span className="text-[10px] text-neutral-400">Active & Available</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Low Stock (&lt; 10)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{overview?.low_stock_count || 0}</p>
          <span className="text-[10px] text-amber-600 font-bold">Needs Restocking</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Out of Stock</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{overview?.out_of_stock_count || 0}</p>
          <span className="text-[10px] text-red-500 font-bold">0 Units Available</span>
        </div>
      </div>

      {/* 4 Multi-Channel Connection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Flipkart */}
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-1 bg-[#2874F0] text-white font-extrabold text-xs rounded-lg shadow-xs">
                FK
              </span>
              <div>
                <h3 className="font-bold text-xs text-neutral-900">Flipkart Seller Hub</h3>
                <span className="text-[10px] text-neutral-500">Listings v3 API</span>
              </div>
            </div>
            <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE</span>
            </span>
          </div>

          <div className="text-[11px] space-y-1 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 font-mono">
            <div className="flex justify-between text-neutral-600">
              <span>Seller ID:</span>
              <strong className="text-neutral-900">OCT9_LUX_DELHI</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Auto-Sync:</span>
              <span className="text-emerald-700 font-bold">Enabled (15m)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => handleTestConnection('flipkart')}
              disabled={testingChannelKey === 'flipkart'}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
            >
              {testingChannelKey === 'flipkart' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Activity className="w-3 h-3 text-blue-600" />
              )}
              <span>Test API Ping</span>
            </button>

            <button
              onClick={() => {
                setActiveConfigTab('flipkart');
                setShowConfigModal(true);
              }}
              className="text-[11px] font-bold text-neutral-600 hover:text-neutral-900"
            >
              Configure
            </button>
          </div>
        </div>

        {/* Amazon */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-1 bg-[#FF9900] text-neutral-900 font-extrabold text-xs rounded-lg shadow-xs">
                AMZ
              </span>
              <div>
                <h3 className="font-bold text-xs text-neutral-900">Amazon SP-API</h3>
                <span className="text-[10px] text-neutral-500">Marketplace: India (IN)</span>
              </div>
            </div>
            <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE</span>
            </span>
          </div>

          <div className="text-[11px] space-y-1 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 font-mono">
            <div className="flex justify-between text-neutral-600">
              <span>Marketplace:</span>
              <strong className="text-neutral-900">A21TJRUUN4KGV</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Fulfillment:</span>
              <span className="text-amber-800 font-bold">MFN (Seller Fulfilled)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => handleTestConnection('amazon')}
              disabled={testingChannelKey === 'amazon'}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center space-x-1 cursor-pointer"
            >
              {testingChannelKey === 'amazon' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Activity className="w-3 h-3 text-amber-600" />
              )}
              <span>Test API Ping</span>
            </button>

            <button
              onClick={() => {
                setActiveConfigTab('amazon');
                setShowConfigModal(true);
              }}
              className="text-[11px] font-bold text-neutral-600 hover:text-neutral-900"
            >
              Configure
            </button>
          </div>
        </div>

        {/* Meesho */}
        <div className="bg-white p-4 rounded-2xl border border-fuchsia-100 shadow-2xs flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-1 bg-[#580044] text-white font-extrabold text-xs rounded-lg shadow-xs">
                MEE
              </span>
              <div>
                <h3 className="font-bold text-xs text-neutral-900">Meesho Supplier</h3>
                <span className="text-[10px] text-neutral-500">Supplier Inventory v1</span>
              </div>
            </div>
            <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE</span>
            </span>
          </div>

          <div className="text-[11px] space-y-1 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 font-mono">
            <div className="flex justify-between text-neutral-600">
              <span>Supplier ID:</span>
              <strong className="text-neutral-900">MEE_SUPP_77192</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Pincode:</span>
              <span className="text-fuchsia-900 font-bold">110020 (Okhla Hub)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => handleTestConnection('meesho')}
              disabled={testingChannelKey === 'meesho'}
              className="text-[11px] font-bold text-fuchsia-700 hover:text-fuchsia-900 flex items-center space-x-1 cursor-pointer"
            >
              {testingChannelKey === 'meesho' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Activity className="w-3 h-3 text-fuchsia-600" />
              )}
              <span>Test API Ping</span>
            </button>

            <button
              onClick={() => {
                setActiveConfigTab('meesho');
                setShowConfigModal(true);
              }}
              className="text-[11px] font-bold text-neutral-600 hover:text-neutral-900"
            >
              Configure
            </button>
          </div>
        </div>

        {/* Live Storefront */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-1 bg-[#5A1827] text-white font-extrabold text-xs rounded-lg shadow-xs">
                OCT9
              </span>
              <div>
                <h3 className="font-bold text-xs text-neutral-900">Live Frontend</h3>
                <span className="text-[10px] text-neutral-500">Storefront API & DB</span>
              </div>
            </div>
            <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>DIRECT</span>
            </span>
          </div>

          <div className="text-[11px] space-y-1 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 font-mono">
            <div className="flex justify-between text-neutral-600">
              <span>Sync Speed:</span>
              <strong className="text-emerald-700">0ms Real-Time</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Checkout Sync:</span>
              <span className="text-emerald-700 font-bold">Auto-Deduct ON</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => handleTestConnection('storefront')}
              disabled={testingChannelKey === 'storefront'}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1 cursor-pointer"
            >
              {testingChannelKey === 'storefront' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Activity className="w-3 h-3 text-emerald-600" />
              )}
              <span>Check Latency</span>
            </button>

            <button
              onClick={() => {
                setActiveConfigTab('storefront');
                setShowConfigModal(true);
              }}
              className="text-[11px] font-bold text-neutral-600 hover:text-neutral-900"
            >
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
          {[
            { id: 'all', label: 'All Inventory' },
            { id: 'in_stock', label: 'In Stock' },
            { id: 'low_stock', label: '⚠️ Low Stock (< 10)' },
            { id: 'out_of_stock', label: '❌ Out of Stock' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedStockStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStockStatus === f.id
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-medium px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-maroon capitalize"
          >
            <option value="all">All Categories</option>
            <option value="stitched-suits">Stitched Suits</option>
            <option value="unstitched-suits">Unstitched Suits</option>
            <option value="designer-suits">Designer Suits</option>
            <option value="sarees">Sarees</option>
            <option value="festive-wear">Festive Wear</option>
            <option value="party-wear">Party Wear</option>
            <option value="accessories">Accessories</option>
            <option value="jutti">Jutti</option>
          </select>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchProducts();
            }}
            className="relative w-full sm:w-64"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, Title, FSN, ASIN..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-brand-maroon font-medium"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          </form>
        </div>
      </div>

      {/* Main Multi-Channel Inventory Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-brand-maroon animate-spin mx-auto" />
            <p className="text-xs text-neutral-500 mt-2 font-medium">Loading multi-channel inventory records...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-xs text-neutral-500 space-y-2">
            <Boxes className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="font-bold text-neutral-700 text-sm">No inventory records matching your filter.</p>
            <p>Try clearing filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-900 text-neutral-300 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4 rounded-tl-3xl">Product & Master SKU</th>
                  <th className="p-4 text-center">Master Stock</th>
                  <th className="p-4 bg-blue-950/40 text-blue-300 border-l border-neutral-800">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2874F0]"></span>
                      <span>Flipkart (FSN)</span>
                    </div>
                  </th>
                  <th className="p-4 bg-amber-950/40 text-amber-300 border-l border-neutral-800">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FF9900]"></span>
                      <span>Amazon (ASIN)</span>
                    </div>
                  </th>
                  <th className="p-4 bg-fuchsia-950/40 text-fuchsia-300 border-l border-neutral-800">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#F43397]"></span>
                      <span>Meesho (Supplier)</span>
                    </div>
                  </th>
                  <th className="p-4 bg-emerald-950/40 text-emerald-300 border-l border-neutral-800">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>OCT9 Storefront</span>
                    </div>
                  </th>
                  <th className="p-4 text-right rounded-tr-3xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => {
                  const fk = p.channels?.flipkart || {};
                  const amz = p.channels?.amazon || {};
                  const mee = p.channels?.meesho || {};
                  const store = p.channels?.storefront || {};

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/90 transition-colors">
                      {/* Product Info */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'}
                            alt={p.title}
                            className="w-12 h-14 object-cover rounded-xl bg-neutral-100 border border-neutral-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-neutral-900 text-sm line-clamp-1">{p.title}</p>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-[10px] text-brand-maroon font-mono font-bold bg-brand-cream px-1.5 py-0.5 rounded">
                                SKU: {p.sku}
                              </span>
                              <span className="text-[10px] text-neutral-500 capitalize">{p.sub_category || p.category_slug}</span>
                            </div>
                            <span className="text-[11px] font-extrabold text-neutral-900 mt-1 block">
                              Base Price: ₹{p.price}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Master Warehouse Stock & Stepper */}
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center justify-center space-y-1.5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-extrabold inline-flex items-center space-x-1 ${
                              p.stock <= 0
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : p.stock <= 10
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            <span>{p.stock} Units</span>
                          </span>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleQuickStockStep(p, -1)}
                              disabled={p.stock <= 0}
                              className="p-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 disabled:opacity-30 cursor-pointer"
                              title="Decrease Stock (-1)"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => openStockEditModal(p)}
                              className="px-2 py-0.5 text-[10px] font-bold bg-neutral-900 text-white rounded-lg hover:bg-brand-maroon transition-colors cursor-pointer"
                              title="Edit Exact Stock"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleQuickStockStep(p, +1)}
                              className="p-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
                              title="Increase Stock (+1)"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Flipkart Channel Listing */}
                      <td className="p-4 bg-blue-50/30 border-l border-neutral-100">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-blue-900 font-bold">{fk.channel_product_id || 'FSN-PENDING'}</span>
                            <button
                              onClick={() => openChannelListingModal(p, 'flipkart')}
                              className="text-[9px] text-blue-600 hover:underline font-bold"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-600">Stock: <strong className={fk.allocated_stock <= 0 ? 'text-red-600' : 'text-neutral-900'}>{fk.allocated_stock}</strong></span>
                            <span className="font-bold text-neutral-900">₹{fk.channel_price}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-block ${
                            fk.listing_status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {fk.listing_status === 'active' ? '● Synced' : '○ Out of Stock'}
                          </span>
                        </div>
                      </td>

                      {/* Amazon Channel Listing */}
                      <td className="p-4 bg-amber-50/30 border-l border-neutral-100">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-amber-950 font-bold">{amz.channel_product_id || 'ASIN-PENDING'}</span>
                            <button
                              onClick={() => openChannelListingModal(p, 'amazon')}
                              className="text-[9px] text-amber-700 hover:underline font-bold"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-600">Stock: <strong className={amz.allocated_stock <= 0 ? 'text-red-600' : 'text-neutral-900'}>{amz.allocated_stock}</strong></span>
                            <span className="font-bold text-neutral-900">₹{amz.channel_price}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-block ${
                            amz.listing_status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {amz.listing_status === 'active' ? '● Synced' : '○ Out of Stock'}
                          </span>
                        </div>
                      </td>

                      {/* Meesho Channel Listing */}
                      <td className="p-4 bg-fuchsia-50/30 border-l border-neutral-100">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-fuchsia-950 font-bold">{mee.channel_product_id || 'MEE-PENDING'}</span>
                            <button
                              onClick={() => openChannelListingModal(p, 'meesho')}
                              className="text-[9px] text-fuchsia-700 hover:underline font-bold"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-600">Stock: <strong className={mee.allocated_stock <= 0 ? 'text-red-600' : 'text-neutral-900'}>{mee.allocated_stock}</strong></span>
                            <span className="font-bold text-neutral-900">₹{mee.channel_price}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-block ${
                            mee.listing_status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {mee.listing_status === 'active' ? '● Synced' : '○ Out of Stock'}
                          </span>
                        </div>
                      </td>

                      {/* Storefront Channel Listing */}
                      <td className="p-4 bg-emerald-50/30 border-l border-neutral-100">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-emerald-950 font-bold">{store.channel_product_id || 'OCT9-LIV'}</span>
                            <span className="text-[9px] font-bold text-emerald-700">Live</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-600">Avail: <strong className={p.stock <= 0 ? 'text-red-600' : 'text-emerald-800'}>{p.stock}</strong></span>
                            <span className="font-bold text-neutral-900">₹{p.price}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-block ${
                            p.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {p.stock > 0 ? '● Available for Orders' : '○ Sold Out'}
                          </span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openSimulateModal(p)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold flex items-center space-x-1 border border-amber-200 cursor-pointer"
                            title="Test order simulation for this item"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                            <span className="hidden xl:inline">Simulate</span>
                          </button>

                          <button
                            onClick={() => handleSyncProduct(p)}
                            disabled={syncingProductId === p.id}
                            className="p-1.5 bg-neutral-900 hover:bg-brand-maroon text-white rounded-lg transition-colors cursor-pointer"
                            title="Force Sync this product to Flipkart, Amazon, Meesho, and Storefront"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncingProductId === p.id ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. Master Stock Edit Modal */}
      {stockEditProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Boxes className="w-5 h-5 text-brand-maroon" />
                <h3 className="font-serif font-bold text-lg text-neutral-900">Update Master Stock</h3>
              </div>
              <button onClick={() => setStockEditProduct(null)} className="text-neutral-400 hover:text-neutral-700 font-bold p-1">
                ✕
              </button>
            </div>

            <div className="flex items-center space-x-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <img
                src={stockEditProduct.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'}
                alt={stockEditProduct.title}
                className="w-12 h-14 object-cover rounded-xl"
              />
              <div>
                <p className="font-bold text-xs text-neutral-900 line-clamp-1">{stockEditProduct.title}</p>
                <p className="text-[10px] text-neutral-500 font-mono">SKU: {stockEditProduct.sku}</p>
                <p className="text-[10px] text-neutral-500">Current Warehouse Stock: <strong className="text-neutral-900">{stockEditProduct.stock} units</strong></p>
              </div>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">New Total Available Stock *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stockInputValue}
                  onChange={(e) => setStockInputValue(e.target.value)}
                  className="w-full p-3 border rounded-xl font-bold text-base bg-neutral-50 focus:bg-white focus:outline-none focus:border-brand-maroon"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  💡 This new stock count will instantly propagate to Flipkart, Amazon, Meesho, and Storefront.
                </p>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Audit Log Note / Reason</label>
                <textarea
                  rows={2}
                  value={stockEditNotes}
                  onChange={(e) => setStockEditNotes(e.target.value)}
                  placeholder="e.g. Factory restock shipment received at Okhla warehouse..."
                  className="w-full p-2.5 border rounded-xl text-xs focus:outline-none focus:border-brand-maroon"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setStockEditProduct(null)}
                  className="px-4 py-2 border rounded-xl font-bold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStock}
                  className="px-5 py-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white font-bold rounded-xl shadow flex items-center space-x-1.5"
                >
                  {updatingStock ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{updatingStock ? 'Propagating Stock...' : 'Save & Push to Channels'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Channel Allocation / Listing Override Modal */}
      {editingChannelData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getChannelMeta(editingChannelData.channelKey).logoBg}`}>
                  {editingChannelData.channelKey.toUpperCase().slice(0, 2)}
                </span>
                <h3 className="font-serif font-bold text-base text-neutral-900">
                  Configure {getChannelMeta(editingChannelData.channelKey).title} Listing
                </h3>
              </div>
              <button onClick={() => setEditingChannelData(null)} className="text-neutral-400 hover:text-neutral-700 font-bold p-1">
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Product: <strong className="text-neutral-900">{editingChannelData.product.title}</strong>
            </p>

            <form onSubmit={handleSaveChannelListing} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  {getChannelMeta(editingChannelData.channelKey).idLabel} Identifier
                </label>
                <input
                  type="text"
                  value={channelForm.channel_product_id}
                  onChange={(e) => setChannelForm({ ...channelForm, channel_product_id: e.target.value })}
                  placeholder="e.g. FSN-10928 / ASIN-B0892"
                  className="w-full p-2.5 border rounded-xl font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Channel Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={channelForm.allocated_stock}
                    onChange={(e) => setChannelForm({ ...channelForm, allocated_stock: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Channel Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={channelForm.channel_price}
                    onChange={(e) => setChannelForm({ ...channelForm, channel_price: e.target.value })}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Listing Status</label>
                <select
                  value={channelForm.listing_status}
                  onChange={(e) => setChannelForm({ ...channelForm, listing_status: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-semibold"
                >
                  <option value="active">Active & Listed</option>
                  <option value="inactive">Paused / Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingChannelData(null)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingChannelListing}
                  className="px-5 py-2 bg-neutral-900 hover:bg-brand-maroon text-white font-bold rounded-xl shadow flex items-center space-x-1.5"
                >
                  {savingChannelListing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Channel Listing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Marketplace API Credentials & Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2.5">
                <Settings className="w-5 h-5 text-brand-maroon" />
                <h3 className="font-serif font-bold text-lg text-neutral-900">
                  Marketplace API & Channel Integrations
                </h3>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="text-neutral-400 hover:text-neutral-700 font-bold p-1">
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-200">
              {[
                { id: 'flipkart', name: 'Flipkart Seller API' },
                { id: 'amazon', name: 'Amazon SP-API' },
                { id: 'meesho', name: 'Meesho Supplier' },
                { id: 'storefront', name: 'Live Frontend' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveConfigTab(tab.id);
                    setTestResult(null);
                  }}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeConfigTab === tab.id
                      ? 'border-brand-maroon text-brand-maroon bg-brand-cream/40'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab Form: Flipkart */}
            {activeConfigTab === 'flipkart' && (
              <div className="space-y-3.5 text-xs">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#2874F0]"></span>
                    <span className="font-bold text-blue-900">Flipkart Seller API (Listings & Inventory v3)</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">CONNECTED</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Flipkart App ID</label>
                    <input
                      type="text"
                      value={configForms.flipkart?.app_id || ''}
                      onChange={(e) => setConfigForms({ ...configForms, flipkart: { ...configForms.flipkart, app_id: e.target.value } })}
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Seller ID</label>
                    <input
                      type="text"
                      value={configForms.flipkart?.seller_id || ''}
                      onChange={(e) => setConfigForms({ ...configForms, flipkart: { ...configForms.flipkart, seller_id: e.target.value } })}
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Location ID (Warehouse)</label>
                    <input
                      type="text"
                      value={configForms.flipkart?.location_id || ''}
                      onChange={(e) => setConfigForms({ ...configForms, flipkart: { ...configForms.flipkart, location_id: e.target.value } })}
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Sync Frequency (Minutes)</label>
                    <input
                      type="number"
                      value={configForms.flipkart?.sync_frequency_mins || 15}
                      onChange={(e) => setConfigForms({ ...configForms, flipkart: { ...configForms.flipkart, sync_frequency_mins: e.target.value } })}
                      className="w-full p-2 border rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleTestConnection('flipkart')}
                    disabled={testingChannelKey === 'flipkart'}
                    className="px-3.5 py-2 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded-xl font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    {testingChannelKey === 'flipkart' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-blue-600" />}
                    <span>Test Ping & Auth Token</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveChannelConfig('flipkart')}
                    disabled={savingConfig}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-bold hover:bg-brand-maroon ml-auto"
                  >
                    Save Flipkart Credentials
                  </button>
                </div>
              </div>
            )}

            {/* Tab Form: Amazon */}
            {activeConfigTab === 'amazon' && (
              <div className="space-y-3.5 text-xs">
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF9900]"></span>
                    <span className="font-bold text-amber-950">Amazon Selling Partner API (SP-API)</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">CONNECTED</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Marketplace ID (India)</label>
                    <input
                      type="text"
                      value={configForms.amazon?.marketplace_id || 'A21TJRUUN4KGV'}
                      onChange={(e) => setConfigForms({ ...configForms, amazon: { ...configForms.amazon, marketplace_id: e.target.value } })}
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Merchant / Seller ID</label>
                    <input
                      type="text"
                      value={configForms.amazon?.seller_id || ''}
                      onChange={(e) => setConfigForms({ ...configForms, amazon: { ...configForms.amazon, seller_id: e.target.value } })}
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">LWA Client ID</label>
                  <input
                    type="text"
                    value={configForms.amazon?.lwa_client_id || ''}
                    onChange={(e) => setConfigForms({ ...configForms, amazon: { ...configForms.amazon, lwa_client_id: e.target.value } })}
                    className="w-full p-2 border rounded-lg font-mono"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleTestConnection('amazon')}
                    disabled={testingChannelKey === 'amazon'}
                    className="px-3.5 py-2 bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 rounded-xl font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    {testingChannelKey === 'amazon' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-amber-600" />}
                    <span>Test SP-API Health</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveChannelConfig('amazon')}
                    disabled={savingConfig}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-bold hover:bg-brand-maroon ml-auto"
                  >
                    Save Amazon Credentials
                  </button>
                </div>
              </div>
            )}

            {/* Tab Form: Meesho */}
            {activeConfigTab === 'meesho' && (
              <div className="space-y-3.5 text-xs">
                <div className="bg-fuchsia-50 p-3 rounded-xl border border-fuchsia-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#F43397]"></span>
                    <span className="font-bold text-fuchsia-950">Meesho Supplier Inventory API</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">CONNECTED</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Supplier ID</label>
                    <input
                      type="text"
                      value={configForms.meesho?.supplier_id || ''}
                      onChange={(e) => setConfigForms({ ...configForms, meesho: { ...configForms.meesho, supplier_id: e.target.value } })}
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Warehouse Pincode</label>
                    <input
                      type="text"
                      value={configForms.meesho?.warehouse_pincode || '110020'}
                      onChange={(e) => setConfigForms({ ...configForms, meesho: { ...configForms.meesho, warehouse_pincode: e.target.value } })}
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Meesho API Key</label>
                  <input
                    type="password"
                    value={configForms.meesho?.api_key || ''}
                    onChange={(e) => setConfigForms({ ...configForms, meesho: { ...configForms.meesho, api_key: e.target.value } })}
                    className="w-full p-2 border rounded-lg font-mono"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleTestConnection('meesho')}
                    disabled={testingChannelKey === 'meesho'}
                    className="px-3.5 py-2 bg-fuchsia-50 text-fuchsia-900 hover:bg-fuchsia-100 border border-fuchsia-200 rounded-xl font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    {testingChannelKey === 'meesho' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-fuchsia-600" />}
                    <span>Test Meesho Ping</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveChannelConfig('meesho')}
                    disabled={savingConfig}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-bold hover:bg-brand-maroon ml-auto"
                  >
                    Save Meesho Credentials
                  </button>
                </div>
              </div>
            )}

            {/* Tab Form: Storefront */}
            {activeConfigTab === 'storefront' && (
              <div className="space-y-3.5 text-xs">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-emerald-950">OCT9 Public Boutique Storefront</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">DIRECT DB</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Storefront URL</label>
                    <input
                      type="text"
                      value={configForms.storefront?.store_url || 'https://oct9.in'}
                      onChange={(e) => setConfigForms({ ...configForms, storefront: { ...configForms.storefront, store_url: e.target.value } })}
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      value={configForms.storefront?.buffer_threshold || 2}
                      onChange={(e) => setConfigForms({ ...configForms, storefront: { ...configForms.storefront, buffer_threshold: e.target.value } })}
                      className="w-full p-2 border rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleTestConnection('storefront')}
                    disabled={testingChannelKey === 'storefront'}
                    className="px-3.5 py-2 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    {testingChannelKey === 'storefront' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>Test Latency</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveChannelConfig('storefront')}
                    disabled={savingConfig}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-bold hover:bg-brand-maroon ml-auto"
                  >
                    Save Storefront Settings
                  </button>
                </div>
              </div>
            )}

            {/* Test Result Box */}
            {testResult && (
              <div className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-700 space-y-2 text-xs font-mono animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-gold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>API Ping Successful ({testResult.latency_ms}ms)</span>
                  </span>
                  <span className="text-[10px] text-neutral-400">{testResult.timestamp}</span>
                </div>
                <div className="text-[11px] text-neutral-300">
                  <p>Endpoint: <span className="text-neutral-400">{testResult.endpoint}</span></p>
                  <pre className="bg-neutral-950 p-2 rounded-lg mt-1 text-[10px] text-emerald-400 overflow-x-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Inventory Audit & Sync Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-5 h-5 text-brand-maroon" />
                <h3 className="font-serif font-bold text-lg text-neutral-900">
                  Multi-Channel Inventory Audit Trail
                </h3>
              </div>
              <button onClick={() => setShowLogsModal(false)} className="text-neutral-400 hover:text-neutral-700 font-bold p-1">
                ✕
              </button>
            </div>

            {loadingLogs ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-maroon" />
              </div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                No inventory logs recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-neutral-50 hover:bg-neutral-100/80 rounded-2xl border border-neutral-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-neutral-900">{log.product_title || 'Bulk Catalog Sync'}</span>
                        {log.sku && <span className="text-[10px] font-mono text-neutral-500 font-bold">({log.sku})</span>}
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-neutral-200 text-neutral-800">
                          {log.channel_key}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600">{log.notes}</p>
                    </div>

                    <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      <div className="flex items-center space-x-1 font-bold">
                        <span className="text-neutral-400 line-through">{log.previous_stock}</span>
                        <ArrowRight className="w-3 h-3 text-neutral-400" />
                        <span className={log.quantity_change < 0 ? 'text-red-600 font-extrabold' : 'text-emerald-700 font-extrabold'}>
                          {log.new_stock} units
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Simulate Marketplace Order Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-base text-neutral-900">
                  Simulate Marketplace Order
                </h3>
              </div>
              <button onClick={() => setShowSimulateModal(false)} className="text-neutral-400 hover:text-neutral-700 font-bold p-1">
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Test how an order placed on <strong>Flipkart</strong>, <strong>Amazon</strong>, or <strong>Meesho</strong> immediately deducts master stock and updates all other channels!
            </p>

            <form onSubmit={handleSimulateOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Select Product</label>
                <select
                  value={simulateProduct?.id || ''}
                  onChange={(e) => {
                    const prod = products.find(p => p.id === Number(e.target.value));
                    setSimulateProduct(prod || null);
                  }}
                  className="w-full p-2.5 border rounded-xl font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Order Source</label>
                  <select
                    value={simulateChannel}
                    onChange={(e) => setSimulateChannel(e.target.value)}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  >
                    <option value="flipkart">Flipkart</option>
                    <option value="amazon">Amazon</option>
                    <option value="meesho">Meesho</option>
                    <option value="storefront">Storefront</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Units Ordered</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={simulateQty}
                    onChange={(e) => setSimulateQty(e.target.value)}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>
              </div>

              {simulateResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center space-x-1 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Real-time Multi-Channel Sync Verified!</span>
                  </p>
                  <p>Previous Stock: <strong>{simulateResult.result?.previousStock}</strong> ➔ New Master Stock: <strong className="text-emerald-700 font-extrabold">{simulateResult.result?.newStock} units</strong></p>
                  <p className="text-[10px] text-emerald-700 font-mono">Synced to: Flipkart, Amazon, Meesho, Storefront</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={simulating}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold rounded-xl shadow flex items-center space-x-1.5"
                >
                  {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>{simulating ? 'Simulating...' : 'Place Test Order & Sync'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
