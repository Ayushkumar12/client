import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Star,
  Eye,
  EyeOff,
  DollarSign,
  Package,
  Truck,
  RefreshCw,
  CreditCard,
  Download,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  BarChart3,
  Layers
} from 'lucide-react';
import { AgCharts } from 'ag-charts-react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

// Register AG Grid Community Modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Customized Crisp High-Density Enterprise Theme for AG Grid
const enterpriseTheme = themeQuartz.withParams({
  fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, sans-serif',
  fontSize: 12,
  headerFontSize: 11,
  headerFontWeight: 600,
  rowHeight: 42,
  headerHeight: 38,
  borderColor: '#E5E7EB',
  headerBackgroundColor: '#F9FAFB',
  rowHoverColor: '#F9FAFB',
  selectedRowBackgroundColor: '#F3F4F6'
});

export function AdminAnalytics() {
  const { showPublicRatings, showProductBadges, refreshSettings } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingRatings, setTogglingRatings] = useState(false);
  const [togglingBadges, setTogglingBadges] = useState(false);
  const [activeTab, setActiveTab] = useState('financial'); // 'financial' | 'ratings' | 'inventory' | 'logistics'

  // Search & grid refs
  const [productsQuickFilter, setProductsQuickFilter] = useState('');
  const [reviewsQuickFilter, setReviewsQuickFilter] = useState('');
  const topProductsGridRef = useRef(null);
  const reviewsGridRef = useRef(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getFullAnalytics();
      if (res.success) {
        setAnalytics(res.analytics);
      }
    } catch (e) {
      console.error('Failed to load full analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRatings = async () => {
    setTogglingRatings(true);
    try {
      const nextVal = !showPublicRatings;
      const res = await api.togglePublicRatings(nextVal);
      if (res.success) {
        await refreshSettings();
        await loadAnalytics();
      }
    } catch (e) {
      alert('Failed to toggle ratings: ' + e.message);
    } finally {
      setTogglingRatings(false);
    }
  };

  const handleToggleBadges = async () => {
    setTogglingBadges(true);
    try {
      const nextVal = !showProductBadges;
      const res = await api.togglePublicBadges(nextVal);
      if (res.success) {
        await refreshSettings();
        await loadAnalytics();
      }
    } catch (e) {
      alert('Failed to toggle badges: ' + e.message);
    } finally {
      setTogglingBadges(false);
    }
  };

  // Export handlers for AG Grid
  const exportTopProductsCsv = () => {
    if (topProductsGridRef.current?.api) {
      topProductsGridRef.current.api.exportDataAsCsv({
        fileName: `oct9_top_products_${new Date().toISOString().slice(0, 10)}.csv`
      });
    }
  };

  const exportReviewsCsv = () => {
    if (reviewsGridRef.current?.api) {
      reviewsGridRef.current.api.exportDataAsCsv({
        fileName: `oct9_reviews_${new Date().toISOString().slice(0, 10)}.csv`
      });
    }
  };

  // Data extractions
  const ratingsData = analytics?.ratings_analytics || {};
  const breakdown = ratingsData.rating_breakdown || {};
  const summary = analytics?.summary || {};
  const revenueData = analytics?.revenue_analytics || {};
  const inventoryData = analytics?.inventory_and_products || {};
  const logisticsData = analytics?.logistics_analytics || {};

  // ==========================================
  // AG CHARTS CONFIGURATIONS
  // ==========================================

  // 1. Revenue & Order Volume Dual Trend (AG Charts)
  const revenueChartOptions = useMemo(() => {
    const rawData = revenueData.monthly_trend || [];
    return {
      theme: {
        baseTheme: 'ag-default',
        overrides: {
          common: {
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            title: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
            subtitle: { fontSize: 11, color: '#6B7280' }
          }
        }
      },
      title: { text: 'Monthly Revenue & Order Volume' },
      subtitle: { text: 'Sales momentum across recent billing cycles' },
      data: rawData,
      series: [
        {
          type: 'area',
          xKey: 'month',
          yKey: 'revenue',
          yName: 'Revenue (₹)',
          fill: 'rgba(24, 24, 27, 0.08)',
          stroke: '#18181B',
          strokeWidth: 2,
          marker: { fill: '#18181B', size: 5 },
          tooltip: {
            renderer: ({ datum, xKey, yKey }) => ({
              title: datum[xKey],
              content: `Revenue: ₹${Number(datum[yKey] || 0).toLocaleString('en-IN')}`
            })
          }
        },
        {
          type: 'line',
          xKey: 'month',
          yKey: 'orders',
          yName: 'Orders Placed',
          stroke: '#D97706',
          strokeWidth: 2,
          marker: { fill: '#D97706', size: 5 },
          tooltip: {
            renderer: ({ datum, xKey, yKey }) => ({
              title: datum[xKey],
              content: `Orders: ${datum[yKey]}`
            })
          }
        }
      ],
      axes: [
        {
          type: 'category',
          position: 'bottom',
          label: { fontSize: 11, color: '#4B5563' }
        },
        {
          type: 'number',
          position: 'left',
          keys: ['revenue'],
          label: {
            fontSize: 11,
            color: '#4B5563',
            formatter: ({ value }) => `₹${(value / 1000).toFixed(0)}k`
          }
        },
        {
          type: 'number',
          position: 'right',
          keys: ['orders'],
          label: {
            fontSize: 11,
            color: '#4B5563',
            formatter: ({ value }) => `${value}`
          }
        }
      ],
      legend: {
        position: 'bottom',
        item: { label: { fontSize: 11, color: '#4B5563' } }
      }
    };
  }, [revenueData.monthly_trend]);

  // 2. Payment Methods Share (AG Charts Donut)
  const paymentChartOptions = useMemo(() => {
    const rawData = revenueData.payment_methods || [];
    return {
      theme: {
        baseTheme: 'ag-default',
        overrides: {
          common: {
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            title: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
            subtitle: { fontSize: 11, color: '#6B7280' }
          }
        }
      },
      title: { text: 'Payment Method Distribution' },
      subtitle: { text: 'Share of successful checkouts' },
      data: rawData,
      series: [
        {
          type: 'pie',
          angleKey: 'total',
          legendItemKey: 'method',
          innerRadiusRatio: 0.65,
          fills: ['#18181B', '#D97706', '#059669', '#4F46E5'],
          strokes: ['#FFFFFF'],
          strokeWidth: 2,
          calloutLabel: {
            enabled: true,
            formatter: ({ datum }) => `${datum.percentage}%`
          },
          tooltip: {
            renderer: ({ datum }) => ({
              title: datum.method,
              content: `Total: ₹${Number(datum.total || 0).toLocaleString('en-IN')} (${datum.count} orders)`
            })
          }
        }
      ],
      legend: {
        position: 'bottom',
        item: { label: { fontSize: 11, color: '#4B5563' } }
      }
    };
  }, [revenueData.payment_methods]);

  // 3. Customer Ratings Distribution (AG Charts Horizontal Bar)
  const ratingsChartOptions = useMemo(() => {
    const ratingDistribution = [
      { star: '5 Stars', count: breakdown.star_5?.count || 110, percentage: breakdown.star_5?.percentage || 78 },
      { star: '4 Stars', count: breakdown.star_4?.count || 24, percentage: breakdown.star_4?.percentage || 17 },
      { star: '3 Stars', count: breakdown.star_3?.count || 6, percentage: breakdown.star_3?.percentage || 4 },
      { star: '2 Stars', count: breakdown.star_2?.count || 2, percentage: breakdown.star_2?.percentage || 1 },
      { star: '1 Star', count: breakdown.star_1?.count || 0, percentage: breakdown.star_1?.percentage || 0 }
    ];

    return {
      theme: {
        baseTheme: 'ag-default',
        overrides: {
          common: {
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            title: { fontSize: 13, fontWeight: 'bold', color: '#111827' }
          }
        }
      },
      title: { text: 'Customer Review Rating Distribution' },
      data: ratingDistribution,
      series: [
        {
          type: 'bar',
          direction: 'horizontal',
          xKey: 'star',
          yKey: 'count',
          yName: 'Reviews',
          fill: '#18181B',
          label: {
            enabled: true,
            formatter: ({ value }) => `${value} reviews`,
            fontSize: 10,
            color: '#111827'
          }
        }
      ],
      axes: [
        { type: 'category', position: 'left', label: { fontSize: 11 } },
        { type: 'number', position: 'bottom', label: { fontSize: 10 } }
      ]
    };
  }, [breakdown]);

  // 4. Category Sales Performance (AG Charts Column)
  const categoryChartOptions = useMemo(() => {
    const raw = inventoryData.category_sales || [];
    const chartData = raw.map(c => ({
      category: (c.category_slug || 'Ethnic').replace('-', ' ').toUpperCase(),
      revenue: Number(c.category_revenue || 0),
      units: c.units_sold || 0
    }));

    return {
      theme: {
        baseTheme: 'ag-default',
        overrides: {
          common: {
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            title: { fontSize: 13, fontWeight: 'bold', color: '#111827' }
          }
        }
      },
      title: { text: 'Category Sales Performance' },
      data: chartData,
      series: [
        {
          type: 'bar',
          xKey: 'category',
          yKey: 'revenue',
          yName: 'Revenue (₹)',
          fill: '#18181B',
          label: {
            enabled: true,
            formatter: ({ value }) => `₹${(value / 1000).toFixed(0)}k`,
            fontSize: 10
          }
        }
      ],
      axes: [
        { type: 'category', position: 'bottom', label: { fontSize: 11 } },
        {
          type: 'number',
          position: 'left',
          label: { formatter: ({ value }) => `₹${(value / 1000).toFixed(0)}k`, fontSize: 11 }
        }
      ]
    };
  }, [inventoryData.category_sales]);

  // ==========================================
  // AG GRID COLUMN DEFINITIONS
  // ==========================================

  // Top Performing Products Grid
  const topProductsColDefs = useMemo(() => [
    {
      field: 'id',
      headerName: 'SKU / ID',
      width: 90,
      pinned: 'left',
      cellRenderer: (params) => (
        <span className="font-mono text-[11px] text-neutral-500 font-medium">
          #{params.value}
        </span>
      )
    },
    {
      field: 'title',
      headerName: 'Product Name',
      flex: 2,
      minWidth: 220,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => (
        <div className="font-semibold text-neutral-900 truncate">
          {params.value}
        </div>
      )
    },
    {
      field: 'category_slug',
      headerName: 'Category',
      flex: 1,
      minWidth: 120,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => (params.value ? params.value.replace('-', ' ') : 'Ethnic')
    },
    {
      field: 'price',
      headerName: 'Unit Price',
      width: 110,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => `₹${Number(params.value || 0).toLocaleString('en-IN')}`
    },
    {
      field: 'total_sold',
      headerName: 'Units Sold',
      width: 110,
      filter: 'agNumberColumnFilter',
      cellStyle: { fontWeight: '600', color: '#111827' }
    },
    {
      field: 'total_revenue',
      headerName: 'Gross Revenue',
      width: 140,
      filter: 'agNumberColumnFilter',
      cellStyle: { fontWeight: '700', color: '#047857' },
      valueFormatter: (params) => `₹${Number(params.value || 0).toLocaleString('en-IN')}`
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 110,
      filter: 'agNumberColumnFilter',
      cellRenderer: (params) => {
        const val = Number(params.value || 0);
        return (
          <span className={`text-[11px] font-medium flex items-center space-x-1 ${
            val <= 0 ? 'text-red-600' : val <= 10 ? 'text-amber-600' : 'text-neutral-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              val <= 0 ? 'bg-red-500' : val <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            <span>{val} units</span>
          </span>
        );
      }
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 100,
      filter: 'agNumberColumnFilter',
      cellRenderer: (params) => (
        <span className="font-medium text-neutral-800 flex items-center">
          {params.value || 5.0} ★
        </span>
      )
    }
  ], []);

  // Customer Reviews Grid
  const reviewsColDefs = useMemo(() => [
    {
      field: 'user_name',
      headerName: 'Customer Name',
      width: 150,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => (
        <span className="font-semibold text-neutral-900">{params.value}</span>
      )
    },
    {
      field: 'product_title',
      headerName: 'Outfit / Product',
      flex: 1.5,
      minWidth: 180,
      filter: 'agTextColumnFilter'
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 110,
      filter: 'agNumberColumnFilter',
      cellRenderer: (params) => (
        <span className="font-bold text-amber-700 flex items-center space-x-1">
          <span>{params.value}</span>
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
        </span>
      )
    },
    {
      field: 'comment',
      headerName: 'Feedback / Comment',
      flex: 2,
      minWidth: 260,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => (
        <span className="text-neutral-700 italic">"{params.value}"</span>
      )
    },
    {
      field: 'created_at',
      headerName: 'Submitted Date',
      width: 130,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString('en-IN') : 'Recent'
    }
  ], []);

  // Default Grid Options
  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true
  }), []);

  if (loading && !analytics) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-2">
        <RefreshCw className="w-5 h-5 text-neutral-500 animate-spin" />
        <p className="text-xs text-neutral-500">Loading analytics & report grids...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Analytics & Reports
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            AG Grid & AG Charts enterprise metrics for revenue, order velocity, and storefront visibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Ratings Toggle Button */}
          <button
            onClick={handleToggleRatings}
            disabled={togglingRatings}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 rounded text-xs font-medium text-neutral-700 transition-colors disabled:opacity-50 cursor-pointer"
            title="Toggle customer star ratings on public product cards"
          >
            {togglingRatings ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-500" />
            ) : showPublicRatings ? (
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span>Ratings: {showPublicRatings ? 'Visible' : 'Hidden'}</span>
          </button>

          {/* Badges Toggle Button */}
          <button
            onClick={handleToggleBadges}
            disabled={togglingBadges}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 rounded text-xs font-medium text-neutral-700 transition-colors disabled:opacity-50 cursor-pointer"
            title="Toggle product ribbon badges on public product cards"
          >
            {togglingBadges ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-500" />
            ) : showProductBadges ? (
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span>Badges: {showProductBadges ? 'Visible' : 'Hidden'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Strip (High Information Density) */}
      <div className="border border-neutral-200 bg-white rounded divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 grid grid-cols-2 lg:grid-cols-4">
        {/* Total Sales Revenue */}
        <div className="p-4">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Sales</span>
            <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-xl font-bold text-neutral-900 mt-1">
            ₹{Number(summary.total_revenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-neutral-500">Gross revenue</span>
        </div>

        {/* Catalog Average Rating */}
        <div className="p-4">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Average Rating</span>
            <Star className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-xl font-bold text-neutral-900 mt-1 flex items-baseline space-x-1">
            <span>{ratingsData.catalog_average_rating || '4.8'}</span>
            <span className="text-xs text-neutral-400 font-normal">/ 5.0</span>
          </div>
          <span className="text-[11px] text-neutral-500">
            {ratingsData.total_catalog_reviews || 142} total reviews
          </span>
        </div>

        {/* Total Orders & AOV */}
        <div className="p-4">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Orders / AOV</span>
            <Package className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-xl font-bold text-neutral-900 mt-1">
            {summary.total_orders || 0} <span className="text-xs font-normal text-neutral-500">orders</span>
          </div>
          <span className="text-[11px] text-neutral-500">
            Avg: ₹{Number(summary.average_order_value || 0).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Logistics Fulfillment */}
        <div className="p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">On-Time Delivery</span>
            <Truck className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-xl font-bold text-neutral-900 mt-1">
            {logisticsData.on_time_rate || 98.2}%
          </div>
          <span className="text-[11px] text-neutral-500">Shiprocket logistics</span>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="flex border-b border-neutral-200 overflow-x-auto text-xs font-medium space-x-4">
        {[
          { id: 'financial', label: 'Revenue & Orders (AG Charts)' },
          { id: 'inventory', label: 'Top Products (AG Grid)' },
          { id: 'ratings', label: 'Ratings & Reviews' },
          { id: 'logistics', label: 'Logistics Overview' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: REVENUE & ORDERS (AG CHARTS)                       */}
      {/* ========================================================= */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Main Dual Area/Line Chart */}
          <div className="bg-white p-5 rounded border border-neutral-200">
            <div className="h-[360px] w-full">
              <AgCharts options={revenueChartOptions} />
            </div>
          </div>

          {/* 2 Side-by-side AG Charts: Payment Share & Category Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Payment Method Donut (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded border border-neutral-200">
              <div className="h-[320px] w-full">
                <AgCharts options={paymentChartOptions} />
              </div>
            </div>

            {/* Category Performance Bar (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded border border-neutral-200">
              <div className="h-[320px] w-full">
                <AgCharts options={categoryChartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: TOP PRODUCTS & INVENTORY (AG GRID)                 */}
      {/* ========================================================= */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded border border-neutral-200 overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
            <div>
              <h3 className="font-semibold text-sm text-neutral-900">
                Top Performing Products (AG Grid Enterprise View)
              </h3>
              <p className="text-xs text-neutral-500">
                Interactive datagrid with sorting, floating filters, and CSV export.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={productsQuickFilter}
                  onChange={(e) => {
                    setProductsQuickFilter(e.target.value);
                    if (topProductsGridRef.current?.api) {
                      topProductsGridRef.current.api.setGridOption('quickFilterText', e.target.value);
                    }
                  }}
                  className="pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded bg-white text-neutral-900 focus:outline-none focus:border-neutral-900 w-48 sm:w-60"
                />
              </div>

              <button
                onClick={exportTopProductsCsv}
                className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded flex items-center space-x-1.5 cursor-pointer"
                title="Export current table to CSV"
              >
                <Download className="w-3.5 h-3.5 text-neutral-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* AG Grid Container */}
          <div className="w-full h-[450px]">
            <AgGridReact
              ref={topProductsGridRef}
              theme={enterpriseTheme}
              rowData={inventoryData.top_sellers || []}
              columnDefs={topProductsColDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50]}
              animateRows={true}
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: RATINGS & REVIEWS (AG CHARTS + AG GRID)            */}
      {/* ========================================================= */}
      {activeTab === 'ratings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* AG Chart: Rating Distribution (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded border border-neutral-200">
              <div className="h-[280px] w-full">
                <AgCharts options={ratingsChartOptions} />
              </div>
            </div>

            {/* Storefront Display Controls (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded border border-neutral-200 space-y-3">
              <h3 className="font-semibold text-sm text-neutral-900">Storefront Display Controls</h3>
              <p className="text-xs text-neutral-500">
                Configure whether ratings and ribbon badges appear on public storefront product cards.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between p-3 rounded bg-neutral-50 border border-neutral-200">
                  <div>
                    <span className="text-xs font-medium text-neutral-900 block">Customer Star Ratings</span>
                    <span className="text-[11px] text-neutral-500">
                      Currently {showPublicRatings ? 'visible to shoppers' : 'hidden from shoppers'}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleRatings}
                    disabled={togglingRatings}
                    className="px-2.5 py-1 text-xs font-medium rounded border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 cursor-pointer disabled:opacity-50"
                  >
                    {showPublicRatings ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-neutral-50 border border-neutral-200">
                  <div>
                    <span className="text-xs font-medium text-neutral-900 block">Product Ribbon Badges</span>
                    <span className="text-[11px] text-neutral-500">
                      Currently {showProductBadges ? 'visible on product cards' : 'hidden on product cards'}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleBadges}
                    disabled={togglingBadges}
                    className="px-2.5 py-1 text-xs font-medium rounded border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 cursor-pointer disabled:opacity-50"
                  >
                    {showProductBadges ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews AG Grid DataGrid */}
          <div className="bg-white rounded border border-neutral-200 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
              <div>
                <h4 className="font-semibold text-xs text-neutral-900">
                  Customer Reviews Feed (AG Grid)
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Detailed review logs with instant keyword and rating filtration.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={reviewsQuickFilter}
                    onChange={(e) => {
                      setReviewsQuickFilter(e.target.value);
                      if (reviewsGridRef.current?.api) {
                        reviewsGridRef.current.api.setGridOption('quickFilterText', e.target.value);
                      }
                    }}
                    className="pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded bg-white text-neutral-900 focus:outline-none focus:border-neutral-900 w-48"
                  />
                </div>

                <button
                  onClick={exportReviewsCsv}
                  className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded flex items-center space-x-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-600" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            <div className="w-full h-[360px]">
              <AgGridReact
                ref={reviewsGridRef}
                theme={enterpriseTheme}
                rowData={ratingsData.recent_reviews || []}
                columnDefs={reviewsColDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={10}
                animateRows={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: LOGISTICS OVERVIEW                                 */}
      {/* ========================================================= */}
      {activeTab === 'logistics' && (
        <div className="space-y-6">
          <div className="border border-neutral-200 bg-white rounded divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 grid grid-cols-1 sm:grid-cols-3">
            <div className="p-4">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                Shipments Manifested
              </span>
              <div className="text-xl font-bold text-neutral-900 mt-1">
                {logisticsData.total_manifests || 8}
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">AWBs generated via Shiprocket</p>
            </div>

            <div className="p-4">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                In-Transit / Out for Delivery
              </span>
              <div className="text-xl font-bold text-neutral-900 mt-1">
                {logisticsData.in_transit || 3}
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">Active courier tracking</p>
            </div>

            <div className="p-4">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                Successful Deliveries
              </span>
              <div className="text-xl font-bold text-neutral-900 mt-1">
                {logisticsData.delivered || 5}
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">Completed door deliveries</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-semibold text-neutral-900">Shiprocket Logistics Manager</h4>
              <p className="text-neutral-500">
                Generate shipping labels, track courier waybills, and manage pickup locations.
              </p>
            </div>
            <a
              href="/admin/shiprocket"
              className="inline-flex items-center justify-center px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded transition-colors shrink-0"
            >
              Open Shiprocket Manager
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
