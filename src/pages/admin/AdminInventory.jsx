import React, { useState, useEffect } from 'react';
import {
  Boxes,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Settings,
  Activity,
  Plus,
  Minus,
  Loader2,
  Check,
  Zap,
  ArrowRight,
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
    }, 4000);
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
      console.error('Failed to load inventory products:', e);
    }
  };

  // Sync All Marketplaces
  const handleBulkSync = async () => {
    setSyncingAll(true);
    try {
      const res = await api.syncAllInventory();
      if (res.success) {
        showToast(res.message);
        await fetchInitialData();
      }
    } catch (e) {
      showToast('Sync error: ' + e.message, 'error');
    } finally {
      setSyncingAll(false);
    }
  };

  // Sync Individual Product
  const handleSyncProduct = async (product) => {
    setSyncingProductId(product.id);
    try {
      const res = await api.syncProductChannels(product.id);
      if (res.success) {
        showToast(`Synced ${product.title} across all channels`);
        await fetchProducts();
      }
    } catch (e) {
      showToast('Sync error: ' + e.message, 'error');
    } finally {
      setSyncingProductId(null);
    }
  };

  // Quick Stock Adjustment (+1 / -1)
  const handleQuickStockStep = async (product, delta) => {
    const newStock = Math.max(0, product.stock + delta);
    try {
      const res = await api.updateProductStock(product.id, {
        new_stock: newStock,
        notes: `Quick step (${delta > 0 ? '+1' : '-1'}) by admin`
      });
      if (res.success) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
        showToast(`Stock updated to ${newStock} units`);
      }
    } catch (e) {
      showToast('Stock update failed: ' + e.message, 'error');
    }
  };

  // Open Full Master Stock Modal
  const openStockEditModal = (product) => {
    setStockEditProduct(product);
    setStockInputValue(product.stock);
    setStockEditNotes('');
  };

  // Save Master Stock from Modal
  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!stockEditProduct) return;
    setUpdatingStock(true);
    try {
      const res = await api.updateProductStock(stockEditProduct.id, {
        new_stock: Number(stockInputValue),
        notes: stockEditNotes || 'Manual warehouse stock edit'
      });
      if (res.success) {
        showToast(`Stock updated to ${stockInputValue} units`);
        setStockEditProduct(null);
        await fetchInitialData();
      }
    } catch (e) {
      showToast('Stock update failed: ' + e.message, 'error');
    } finally {
      setUpdatingStock(false);
    }
  };

  // Open Channel Listing Modal
  const openChannelListingModal = (product, channelKey) => {
    const channelData = product.channels?.[channelKey] || {};
    setEditingChannelData({ product, channelKey });
    setChannelForm({
      allocated_stock: channelData.allocated_stock !== undefined ? channelData.allocated_stock : product.stock,
      channel_price: channelData.channel_price !== undefined ? channelData.channel_price : product.price,
      channel_sku: channelData.channel_sku || product.sku,
      channel_product_id: channelData.channel_product_id || '',
      listing_status: channelData.listing_status || 'active'
    });
  };

  // Save Channel Listing Override
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

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg border flex items-center space-x-2.5 text-xs font-medium transition-all ${
            toastMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-neutral-900 text-white border-neutral-800'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* 1. Header Toolbar (Shopify / Linear Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Multi-Channel Inventory
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Master stock synchronized live across Flipkart, Amazon, Meesho, and Storefront.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openLogsModal}
            className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Audit Logs</span>
          </button>

          <button
            onClick={() => openSimulateModal()}
            className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded shadow-xs flex items-center space-x-1.5 cursor-pointer"
            title="Simulate marketplace order to test real-time stock deduction"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate Order</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-500" />
            <span>Channel Settings</span>
          </button>

          <button
            onClick={handleBulkSync}
            disabled={syncingAll}
            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
            <span>{syncingAll ? 'Syncing...' : 'Sync All Channels'}</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Metrics Strip (High Information Density) */}
      <div className="border border-neutral-200 bg-white rounded divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 grid grid-cols-2 sm:grid-cols-5">
        <div className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Total Catalog</span>
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <p className="text-xl font-bold text-neutral-900 mt-1">{overview?.total_products || 0}</p>
          <span className="text-[11px] text-neutral-500">Master SKUs</span>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Warehouse Units</span>
            <Boxes className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <p className="text-xl font-bold text-neutral-900 mt-1">{overview?.total_stock_units || 0}</p>
          <span className="text-[11px] text-neutral-500">Total available</span>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Healthy Stock</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-700 mt-1">{overview?.in_stock_count || 0}</p>
          <span className="text-[11px] text-neutral-500">Adequate inventory</span>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Low Stock (&lt; 10)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600 mt-1">{overview?.low_stock_count || 0}</p>
          <span className="text-[11px] text-neutral-500">Needs restock</span>
        </div>

        <div className="p-3.5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Out of Stock</span>
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{overview?.out_of_stock_count || 0}</p>
          <span className="text-[11px] text-neutral-500">0 units available</span>
        </div>
      </div>

      {/* 3. Channel Integrations Summary Strip */}
      <div className="border border-neutral-200 bg-white rounded divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Flipkart */}
        <div className="p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-1.5 py-0.5 bg-[#2874F0] text-white font-bold text-[10px] rounded">FK</span>
              <span className="font-semibold text-xs text-neutral-900">Flipkart Seller Hub</span>
            </div>
            <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Connected
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 flex justify-between">
            <span>Seller ID: <strong className="text-neutral-700">OCT9_LUX_DELHI</strong></span>
            <span>Sync: 15m</span>
          </div>
          <div className="flex items-center space-x-2 pt-1 border-t border-neutral-100 text-xs">
            <button
              onClick={() => handleTestConnection('flipkart')}
              disabled={testingChannelKey === 'flipkart'}
              className="text-neutral-600 hover:text-neutral-900 text-[11px] font-medium flex items-center space-x-1 cursor-pointer"
            >
              {testingChannelKey === 'flipkart' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3 text-neutral-500" />}
              <span>Test Ping</span>
            </button>
            <span className="text-neutral-300">|</span>
            <button
              onClick={() => {
                setActiveConfigTab('flipkart');
                setShowConfigModal(true);
              }}
              className="text-neutral-600 hover:text-neutral-900 text-[11px] font-medium cursor-pointer"
            >
              Configure
            </button>
          </div>
        </div>

        {/* Amazon */}
        <div className="p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-1.5 py-0.5 bg-[#FF9900] text-neutral-950 font-bold text-[10px] rounded">AMZ</span>
              <span className="font-semibold text-xs text-neutral-900">Amazon SP-API</span>
            </div>
            <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Connected
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 flex justify-between">
            <span>Marketplace: <strong className="text-neutral-700">India (IN)</strong></span>
            <span>Fulfillment: MFN</span>
          </div>
          <div className="flex items-center space-x-2 pt-1 border-t border-neutral-100 text-xs">
            <button
              onClick={() => handleTestConnection('amazon')}
              disabled={testingChannelKey === 'amazon'}
              className="text-neutral-600 hover:text-neutral-900 text-[11px] font-medium flex items-center space-x-1 cursor-pointer"
            >
              {testingChannelKey === 'amazon' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3 text-neutral-500" />}
              <span>Test Ping</span>
            </button>
            <span className="text-neutral-300">|</span>
            <button
              onClick={() => {
                setActiveConfigTab('amazon');
                setShowConfigModal(true);
              }}
              className="text-neutral-600 hover:text-neutral-900 text-[11px] font-medium cursor-pointer"
            >
              Configure
            </button>
          </div>
        </div>

        {/* Meesho */}
        <div className="p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-1.5 py-0.5 bg-[#580044] text-white font-bold text-[10px] rounded">MEE</span>
              <span className="font-semibold text-xs text-neutral-900">Meesho Supplier</span>
            </div>
            <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Connected
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 flex justify-between">
            <span>ID: <strong className="text-neutral-700">MEE_SUPP_77192</strong></span>
            <span>Hub: Okhla</span>
          </div>
          <div className="flex items-center space-x-2 pt-1 border-t border-neutral-100 text-xs">
            <button
              onClick={() => handleTestConnection('meesho')}
              disabled={testingChannelKey === 'meesho'}
              className="text-neutral-600 hover:text-neutral-900 text-[11px] font-medium flex items-center space-x-1 cursor-pointer"
            >
              {testingChannelKey === 'meesho' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3 text-neutral-500" />}
              <span>Test Ping</span>
            </button>
            <span className="text-neutral-300">|</span>
            <button
              onClick={() => {
                setActiveConfigTab('meesho');
                setShowConfigModal(true);
              }}
              className="text-neutral-600 hover:text-neutral-900 text-[11px] font-medium cursor-pointer"
            >
              Configure
            </button>
          </div>
        </div>

        {/* Storefront */}
        <div className="p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-1.5 py-0.5 bg-[#5A1827] text-white font-bold text-[10px] rounded">OCT9</span>
              <span className="font-semibold text-xs text-neutral-900">Storefront Live</span>
            </div>
            <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Direct DB
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 flex justify-between">
            <span>Sync: <strong className="text-neutral-700">Real-time (0ms)</strong></span>
            <span>Auto-Deduct: ON</span>
          </div>
          <div className="flex items-center space-x-2 pt-1 border-t border-neutral-100 text-xs">
            <button
              onClick={() => handleTestConnection('storefront')}
              disabled={testingChannelKey === 'storefront'}
              className="text-neutral-600 hover:text-neutral-900 text-[11px] font-medium flex items-center space-x-1 cursor-pointer"
            >
              {testingChannelKey === 'storefront' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3 text-neutral-500" />}
              <span>Check Latency</span>
            </button>
            <span className="text-neutral-300">|</span>
            <button
              onClick={() => {
                setActiveConfigTab('storefront');
                setShowConfigModal(true);
              }}
              className="text-neutral-600 hover:text-neutral-900 text-[11px] font-medium cursor-pointer"
            >
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* 4. Filter & Search Bar */}
      <div className="border border-neutral-200 bg-white rounded p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'in_stock', label: 'In Stock' },
            { id: 'low_stock', label: 'Low Stock (< 10)' },
            { id: 'out_of_stock', label: 'Out of Stock' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedStockStatus(f.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedStockStatus === f.id
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-neutral-300 rounded px-2.5 py-1.5 bg-white text-neutral-700 focus:outline-none focus:border-neutral-900"
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
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, Title, FSN..."
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-neutral-300 rounded bg-white text-neutral-900 focus:outline-none focus:border-neutral-900 placeholder-neutral-400"
            />
          </form>
        </div>
      </div>

      {/* 5. Clean Enterprise Inventory Table */}
      <div className="border border-neutral-200 bg-white rounded overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-6 h-6 text-neutral-500 animate-spin mx-auto" />
            <p className="text-xs text-neutral-500 mt-2">Loading multi-channel inventory records...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500 space-y-1">
            <Boxes className="w-8 h-8 text-neutral-300 mx-auto mb-1" />
            <p className="font-semibold text-neutral-700">No inventory records found</p>
            <p>Try adjusting your search criteria or category filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3.5">Product & SKU</th>
                  <th className="py-3 px-3 text-center">Warehouse Stock</th>
                  <th className="py-3 px-3 border-l border-neutral-200">Flipkart</th>
                  <th className="py-3 px-3 border-l border-neutral-200">Amazon</th>
                  <th className="py-3 px-3 border-l border-neutral-200">Meesho</th>
                  <th className="py-3 px-3 border-l border-neutral-200">Storefront</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {products.map((p) => {
                  const fk = p.channels?.flipkart || {};
                  const amz = p.channels?.amazon || {};
                  const mee = p.channels?.meesho || {};
                  const store = p.channels?.storefront || {};

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Product Details */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'}
                            alt={p.title}
                            className="w-10 h-12 object-cover rounded border border-neutral-200 shrink-0 bg-neutral-100"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 truncate max-w-[200px]">{p.title}</p>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-neutral-600 bg-neutral-100 px-1 py-0.5 rounded">
                                {p.sku}
                              </span>
                              <span className="text-[11px] text-neutral-500 capitalize">{p.sub_category || p.category_slug}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-neutral-800">
                              ₹{Number(p.price).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Warehouse Stock Column */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              p.stock <= 0
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : p.stock <= 10
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {p.stock} units
                          </span>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleQuickStockStep(p, -1)}
                              disabled={p.stock <= 0}
                              className="p-1 rounded bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-600 disabled:opacity-30 cursor-pointer"
                              title="Decrease (-1)"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => openStockEditModal(p)}
                              className="px-1.5 py-0.5 text-[10px] font-medium bg-neutral-900 hover:bg-neutral-800 text-white rounded cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleQuickStockStep(p, +1)}
                              className="p-1 rounded bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-600 cursor-pointer"
                              title="Increase (+1)"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Flipkart Channel Column */}
                      <td className="py-3 px-3 border-l border-neutral-200 bg-neutral-50/30">
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-neutral-700 font-semibold">{fk.channel_product_id || 'FSN-PENDING'}</span>
                            <button
                              onClick={() => openChannelListingModal(p, 'flipkart')}
                              className="text-[10px] text-neutral-600 hover:text-neutral-900 font-medium underline cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500">Stock: <strong className={fk.allocated_stock <= 0 ? 'text-red-600' : 'text-neutral-800'}>{fk.allocated_stock}</strong></span>
                            <span className="font-medium text-neutral-800">₹{fk.channel_price}</span>
                          </div>
                          <span className={`text-[10px] px-1 py-0.2 rounded font-medium inline-block ${
                            fk.listing_status === 'active' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                          }`}>
                            {fk.listing_status === 'active' ? '● Synced' : '○ Out of stock'}
                          </span>
                        </div>
                      </td>

                      {/* Amazon Channel Column */}
                      <td className="py-3 px-3 border-l border-neutral-200 bg-neutral-50/30">
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-neutral-700 font-semibold">{amz.channel_product_id || 'ASIN-PENDING'}</span>
                            <button
                              onClick={() => openChannelListingModal(p, 'amazon')}
                              className="text-[10px] text-neutral-600 hover:text-neutral-900 font-medium underline cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500">Stock: <strong className={amz.allocated_stock <= 0 ? 'text-red-600' : 'text-neutral-800'}>{amz.allocated_stock}</strong></span>
                            <span className="font-medium text-neutral-800">₹{amz.channel_price}</span>
                          </div>
                          <span className={`text-[10px] px-1 py-0.2 rounded font-medium inline-block ${
                            amz.listing_status === 'active' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                          }`}>
                            {amz.listing_status === 'active' ? '● Synced' : '○ Out of stock'}
                          </span>
                        </div>
                      </td>

                      {/* Meesho Channel Column */}
                      <td className="py-3 px-3 border-l border-neutral-200 bg-neutral-50/30">
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-neutral-700 font-semibold">{mee.channel_product_id || 'MEE-PENDING'}</span>
                            <button
                              onClick={() => openChannelListingModal(p, 'meesho')}
                              className="text-[10px] text-neutral-600 hover:text-neutral-900 font-medium underline cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500">Stock: <strong className={mee.allocated_stock <= 0 ? 'text-red-600' : 'text-neutral-800'}>{mee.allocated_stock}</strong></span>
                            <span className="font-medium text-neutral-800">₹{mee.channel_price}</span>
                          </div>
                          <span className={`text-[10px] px-1 py-0.2 rounded font-medium inline-block ${
                            mee.listing_status === 'active' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                          }`}>
                            {mee.listing_status === 'active' ? '● Synced' : '○ Out of stock'}
                          </span>
                        </div>
                      </td>

                      {/* Storefront Channel Column */}
                      <td className="py-3 px-3 border-l border-neutral-200 bg-neutral-50/30">
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-neutral-700 font-semibold">{store.channel_product_id || 'OCT9-LIV'}</span>
                            <span className="text-[10px] text-emerald-700 font-medium">Live</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500">Avail: <strong className={p.stock <= 0 ? 'text-red-600' : 'text-neutral-800'}>{p.stock}</strong></span>
                            <span className="font-medium text-neutral-800">₹{p.price}</span>
                          </div>
                          <span className={`text-[10px] px-1 py-0.2 rounded font-medium inline-block ${
                            p.stock > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                          }`}>
                            {p.stock > 0 ? '● Active' : '○ Sold Out'}
                          </span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openSimulateModal(p)}
                            className="px-2 py-1 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded text-[11px] font-medium flex items-center space-x-1 cursor-pointer"
                            title="Simulate marketplace order"
                          >
                            <Zap className="w-3 h-3 text-amber-600" />
                            <span className="hidden xl:inline">Simulate</span>
                          </button>

                          <button
                            onClick={() => handleSyncProduct(p)}
                            disabled={syncingProductId === p.id}
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded cursor-pointer transition-colors"
                            title="Force sync across channels"
                          >
                            <RefreshCw className={`w-3 h-3 ${syncingProductId === p.id ? 'animate-spin' : ''}`} />
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

      {/* 6. Master Stock Edit Modal (Clean Enterprise Modal) */}
      {stockEditProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded border border-neutral-200 p-5 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-sm text-neutral-900">Update Master Stock</h3>
              <button
                onClick={() => setStockEditProduct(null)}
                className="text-neutral-400 hover:text-neutral-700 text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center space-x-3 bg-neutral-50 p-3 rounded border border-neutral-200">
              <img
                src={stockEditProduct.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'}
                alt={stockEditProduct.title}
                className="w-10 h-12 object-cover rounded border border-neutral-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-medium text-xs text-neutral-900 truncate">{stockEditProduct.title}</p>
                <p className="text-[11px] text-neutral-500 font-mono">SKU: {stockEditProduct.sku}</p>
                <p className="text-[11px] text-neutral-600">Current Stock: <strong>{stockEditProduct.stock} units</strong></p>
              </div>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">New Total Available Stock *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stockInputValue}
                  onChange={(e) => setStockInputValue(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded font-semibold text-sm bg-white focus:outline-none focus:border-neutral-900"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Updated stock immediately propagates to Flipkart, Amazon, Meesho, and Storefront.
                </p>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Audit Note</label>
                <textarea
                  rows={2}
                  value={stockEditNotes}
                  onChange={(e) => setStockEditNotes(e.target.value)}
                  placeholder="e.g. Received warehouse replenishment batch..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-xs focus:outline-none focus:border-neutral-900 placeholder-neutral-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setStockEditProduct(null)}
                  className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStock}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {updatingStock ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{updatingStock ? 'Saving...' : 'Save & Sync'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Channel Listing Override Modal */}
      {editingChannelData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded border border-neutral-200 p-5 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-sm text-neutral-900 capitalize">
                Configure {editingChannelData.channelKey} Listing
              </h3>
              <button
                onClick={() => setEditingChannelData(null)}
                className="text-neutral-400 hover:text-neutral-700 text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 truncate">
              Product: <strong className="text-neutral-900">{editingChannelData.product.title}</strong>
            </p>

            <form onSubmit={handleSaveChannelListing} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Marketplace Product ID (FSN / ASIN / SKU)
                </label>
                <input
                  type="text"
                  value={channelForm.channel_product_id}
                  onChange={(e) => setChannelForm({ ...channelForm, channel_product_id: e.target.value })}
                  placeholder="e.g. FSN-10928 / ASIN-B0892"
                  className="w-full px-3 py-2 border border-neutral-300 rounded font-mono text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Allocated Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={channelForm.allocated_stock}
                    onChange={(e) => setChannelForm({ ...channelForm, allocated_stock: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-semibold focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Channel Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={channelForm.channel_price}
                    onChange={(e) => setChannelForm({ ...channelForm, channel_price: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded font-semibold focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Listing Status</label>
                <select
                  value={channelForm.listing_status}
                  onChange={(e) => setChannelForm({ ...channelForm, listing_status: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded bg-white font-medium focus:outline-none focus:border-neutral-900"
                >
                  <option value="active">Active & Listed</option>
                  <option value="inactive">Paused / Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingChannelData(null)}
                  className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingChannelListing}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingChannelListing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Listing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Marketplace Channel Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded border border-neutral-200 p-5 sm:p-6 max-w-2xl w-full shadow-xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-sm text-neutral-900">
                Marketplace API Integrations
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-neutral-200 text-xs">
              {[
                { id: 'flipkart', name: 'Flipkart' },
                { id: 'amazon', name: 'Amazon SP-API' },
                { id: 'meesho', name: 'Meesho' },
                { id: 'storefront', name: 'Storefront' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveConfigTab(tab.id);
                    setTestResult(null);
                  }}
                  className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
                    activeConfigTab === tab.id
                      ? 'border-neutral-900 text-neutral-900'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab Form: Flipkart */}
            {activeConfigTab === 'flipkart' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Flipkart App ID</label>
                    <input
                      type="text"
                      value={configForms.flipkart?.app_id || ''}
                      onChange={(e) => setConfigForms({ ...configForms, flipkart: { ...configForms.flipkart, app_id: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-mono text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Seller ID</label>
                    <input
                      type="text"
                      value={configForms.flipkart?.seller_id || ''}
                      onChange={(e) => setConfigForms({ ...configForms, flipkart: { ...configForms.flipkart, seller_id: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-mono text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Location ID (Warehouse)</label>
                    <input
                      type="text"
                      value={configForms.flipkart?.location_id || ''}
                      onChange={(e) => setConfigForms({ ...configForms, flipkart: { ...configForms.flipkart, location_id: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-mono text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Sync Frequency (Mins)</label>
                    <input
                      type="number"
                      value={configForms.flipkart?.sync_frequency_mins || 15}
                      onChange={(e) => setConfigForms({ ...configForms, flipkart: { ...configForms.flipkart, sync_frequency_mins: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-medium focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => handleTestConnection('flipkart')}
                    disabled={testingChannelKey === 'flipkart'}
                    className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    {testingChannelKey === 'flipkart' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-neutral-500" />}
                    <span>Test Ping</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveChannelConfig('flipkart')}
                    disabled={savingConfig}
                    className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded font-medium ml-auto cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* Tab Form: Amazon */}
            {activeConfigTab === 'amazon' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Marketplace ID</label>
                    <input
                      type="text"
                      value={configForms.amazon?.marketplace_id || 'A21TJRUUN4KGV'}
                      onChange={(e) => setConfigForms({ ...configForms, amazon: { ...configForms.amazon, marketplace_id: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-mono text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Merchant / Seller ID</label>
                    <input
                      type="text"
                      value={configForms.amazon?.seller_id || ''}
                      onChange={(e) => setConfigForms({ ...configForms, amazon: { ...configForms.amazon, seller_id: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-mono text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">LWA Client ID</label>
                  <input
                    type="text"
                    value={configForms.amazon?.lwa_client_id || ''}
                    onChange={(e) => setConfigForms({ ...configForms, amazon: { ...configForms.amazon, lwa_client_id: e.target.value } })}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded font-mono text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => handleTestConnection('amazon')}
                    disabled={testingChannelKey === 'amazon'}
                    className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    {testingChannelKey === 'amazon' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-neutral-500" />}
                    <span>Test Ping</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveChannelConfig('amazon')}
                    disabled={savingConfig}
                    className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded font-medium ml-auto cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* Tab Form: Meesho */}
            {activeConfigTab === 'meesho' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Supplier ID</label>
                    <input
                      type="text"
                      value={configForms.meesho?.supplier_id || ''}
                      onChange={(e) => setConfigForms({ ...configForms, meesho: { ...configForms.meesho, supplier_id: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-mono text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Warehouse Pincode</label>
                    <input
                      type="text"
                      value={configForms.meesho?.warehouse_pincode || '110020'}
                      onChange={(e) => setConfigForms({ ...configForms, meesho: { ...configForms.meesho, warehouse_pincode: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-mono text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">API Key</label>
                  <input
                    type="password"
                    value={configForms.meesho?.api_key || ''}
                    onChange={(e) => setConfigForms({ ...configForms, meesho: { ...configForms.meesho, api_key: e.target.value } })}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded font-mono text-xs focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => handleTestConnection('meesho')}
                    disabled={testingChannelKey === 'meesho'}
                    className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    {testingChannelKey === 'meesho' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-neutral-500" />}
                    <span>Test Ping</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveChannelConfig('meesho')}
                    disabled={savingConfig}
                    className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded font-medium ml-auto cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* Tab Form: Storefront */}
            {activeConfigTab === 'storefront' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Storefront URL</label>
                    <input
                      type="text"
                      value={configForms.storefront?.store_url || 'https://oct9.in'}
                      onChange={(e) => setConfigForms({ ...configForms, storefront: { ...configForms.storefront, store_url: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-mono text-xs focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      value={configForms.storefront?.buffer_threshold || 2}
                      onChange={(e) => setConfigForms({ ...configForms, storefront: { ...configForms.storefront, buffer_threshold: e.target.value } })}
                      className="w-full px-3 py-1.5 border border-neutral-300 rounded font-medium focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => handleTestConnection('storefront')}
                    disabled={testingChannelKey === 'storefront'}
                    className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    {testingChannelKey === 'storefront' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-neutral-500" />}
                    <span>Check Latency</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveChannelConfig('storefront')}
                    disabled={savingConfig}
                    className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded font-medium ml-auto cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* Test Result Display */}
            {testResult && (
              <div className="bg-neutral-50 p-3 rounded border border-neutral-200 text-xs font-mono space-y-1 text-neutral-800">
                <div className="flex items-center justify-between font-sans">
                  <span className="font-semibold text-emerald-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ping Successful ({testResult.latency_ms}ms)</span>
                  </span>
                  <span className="text-[10px] text-neutral-400">{testResult.timestamp}</span>
                </div>
                <p className="text-[11px] text-neutral-600 font-sans">Endpoint: {testResult.endpoint}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. Audit Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded border border-neutral-200 p-5 sm:p-6 max-w-3xl w-full shadow-xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-sm text-neutral-900">
                Inventory Audit Trail
              </h3>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {loadingLogs ? (
              <div className="py-10 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-neutral-500" />
              </div>
            ) : logs.length === 0 ? (
              <div className="py-10 text-center text-xs text-neutral-500">
                No inventory logs recorded yet.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-neutral-50 rounded border border-neutral-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-neutral-900">{log.product_title || 'Catalog Sync'}</span>
                        {log.sku && <span className="text-[10px] font-mono text-neutral-500">({log.sku})</span>}
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium uppercase bg-neutral-200 text-neutral-800">
                          {log.channel_key}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-0.5">{log.notes}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center space-x-1 font-semibold text-xs justify-end">
                        <span className="text-neutral-400 line-through">{log.previous_stock}</span>
                        <ArrowRight className="w-3 h-3 text-neutral-400" />
                        <span className={log.quantity_change < 0 ? 'text-red-600' : 'text-emerald-700'}>
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

      {/* 10. Simulate Order Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded border border-neutral-200 p-5 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-sm text-neutral-900">
                Simulate Marketplace Order
              </h3>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Test real-time stock deduction and cross-channel sync from an incoming order.
            </p>

            <form onSubmit={handleSimulateOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Select Product</label>
                <select
                  value={simulateProduct?.id || ''}
                  onChange={(e) => {
                    const prod = products.find(p => p.id === Number(e.target.value));
                    setSimulateProduct(prod || null);
                  }}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded bg-white font-medium focus:outline-none focus:border-neutral-900"
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
                  <label className="block font-medium text-neutral-700 mb-1">Channel Source</label>
                  <select
                    value={simulateChannel}
                    onChange={(e) => setSimulateChannel(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded bg-white font-medium focus:outline-none focus:border-neutral-900"
                  >
                    <option value="flipkart">Flipkart</option>
                    <option value="amazon">Amazon</option>
                    <option value="meesho">Meesho</option>
                    <option value="storefront">Storefront</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Units Ordered</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={simulateQty}
                    onChange={(e) => setSimulateQty(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded font-semibold focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              {simulateResult && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-900 space-y-0.5">
                  <p className="font-semibold flex items-center space-x-1 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Order Simulated Successfully!</span>
                  </p>
                  <p>Stock: {simulateResult.result?.previousStock} ➔ <strong>{simulateResult.result?.newStock} units</strong></p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 font-medium cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={simulating}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>{simulating ? 'Placing...' : 'Place Test Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
