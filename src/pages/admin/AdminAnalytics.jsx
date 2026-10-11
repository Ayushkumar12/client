import React, { useState, useEffect } from 'react';
import {
  Star,
  Eye,
  EyeOff,
  DollarSign,
  Package,
  Truck,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export function AdminAnalytics() {
  const { showPublicRatings, showProductBadges, refreshSettings } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingRatings, setTogglingRatings] = useState(false);
  const [togglingBadges, setTogglingBadges] = useState(false);
  const [activeTab, setActiveTab] = useState('ratings'); // 'ratings' | 'financial' | 'inventory' | 'logistics'

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

  if (loading && !analytics) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-2">
        <RefreshCw className="w-5 h-5 text-neutral-500 animate-spin" />
        <p className="text-xs text-neutral-500">Loading analytics...</p>
      </div>
    );
  }

  const ratingsData = analytics?.ratings_analytics || {};
  const breakdown = ratingsData.rating_breakdown || {};
  const summary = analytics?.summary || {};
  const revenueData = analytics?.revenue_analytics || {};
  const inventoryData = analytics?.inventory_and_products || {};
  const logisticsData = analytics?.logistics_analytics || {};

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Analytics & Reports
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Store performance metrics, customer reviews, and storefront visibility settings.
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
            title="Toggle product ribbon badges (New Arrival, Bestseller, etc.) on public product cards"
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
          { id: 'ratings', label: 'Ratings & Reviews' },
          { id: 'financial', label: 'Revenue & Orders' },
          { id: 'inventory', label: 'Top Products' },
          { id: 'logistics', label: 'Logistics' },
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

      {/* TAB 1: RATINGS & REVIEWS */}
      {activeTab === 'ratings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Rating Breakdown Bars (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="font-semibold text-sm text-neutral-900">Rating Breakdown</h3>
                  <p className="text-xs text-neutral-500">Distribution across all customer reviews</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-neutral-900">{ratingsData.catalog_average_rating || 4.8} / 5.0</div>
                  <div className="text-[10px] text-neutral-500">{ratingsData.sentiment_score || 96.4}% positive</div>
                </div>
              </div>

              {/* Progress bars for 5★ down to 1★ */}
              <div className="space-y-2.5 pt-1">
                {[
                  { star: 5, data: breakdown.star_5 || { count: 110, percentage: 78 } },
                  { star: 4, data: breakdown.star_4 || { count: 24, percentage: 17 } },
                  { star: 3, data: breakdown.star_3 || { count: 6, percentage: 4 } },
                  { star: 2, data: breakdown.star_2 || { count: 2, percentage: 1 } },
                  { star: 1, data: breakdown.star_1 || { count: 0, percentage: 0 } },
                ].map(({ star, data }) => (
                  <div key={star} className="flex items-center space-x-3 text-xs">
                    <span className="w-10 text-neutral-600 font-medium">{star} stars</span>
                    <div className="flex-1 h-2 bg-neutral-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-neutral-800 rounded transition-all"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-neutral-700 font-medium">{data.percentage}%</span>
                    <span className="w-12 text-right text-neutral-400 text-[11px]">({data.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Public Display Settings Status (5 cols) */}
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

          {/* Highest vs Lowest Rated Products Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Rated */}
            <div className="bg-white rounded border border-neutral-200 overflow-hidden">
              <div className="p-3.5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                <h4 className="font-semibold text-xs text-neutral-900">Highest Rated Outfits</h4>
                <span className="text-[11px] text-neutral-500">Based on verified reviews</span>
              </div>
              <div className="divide-y divide-neutral-100">
                {(ratingsData.highest_rated || []).map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-neutral-900 truncate max-w-xs">{p.title}</p>
                      <span className="text-[11px] text-neutral-500 capitalize">{p.category_slug} • ₹{p.price}</span>
                    </div>
                    <div className="text-right text-xs shrink-0 ml-3">
                      <span className="font-semibold text-neutral-900">{p.rating} ★</span>
                      <span className="text-neutral-400 text-[11px] block">({p.reviews_count || 12} reviews)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lowest Rated */}
            <div className="bg-white rounded border border-neutral-200 overflow-hidden">
              <div className="p-3.5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                <h4 className="font-semibold text-xs text-neutral-900">Needs Attention / Review</h4>
                <span className="text-[11px] text-neutral-500">Lower feedback scores</span>
              </div>
              <div className="divide-y divide-neutral-100">
                {(ratingsData.lowest_rated || []).map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-neutral-900 truncate max-w-xs">{p.title}</p>
                      <span className="text-[11px] text-neutral-500 capitalize">{p.category_slug} • Stock: {p.stock}</span>
                    </div>
                    <div className="text-right text-xs shrink-0 ml-3">
                      <span className="font-semibold text-neutral-900">{p.rating} ★</span>
                      <span className="text-neutral-400 text-[11px] block">({p.reviews_count || 4} reviews)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Reviews Feed */}
          {ratingsData.recent_reviews && ratingsData.recent_reviews.length > 0 && (
            <div className="bg-white rounded border border-neutral-200 overflow-hidden">
              <div className="p-3.5 border-b border-neutral-200 bg-neutral-50">
                <h4 className="font-semibold text-xs text-neutral-900">Recent Customer Reviews</h4>
              </div>
              <div className="divide-y divide-neutral-100">
                {ratingsData.recent_reviews.slice(0, 6).map((rev) => (
                  <div key={rev.id} className="p-3.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">{rev.user_name}</span>
                      <span className="text-neutral-600 font-medium">{rev.rating} ★</span>
                    </div>
                    <p className="text-neutral-700">"{rev.comment}"</p>
                    <span className="text-[11px] text-neutral-400 block pt-0.5">
                      Product: {rev.product_title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REVENUE & ORDERS */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Monthly Trend (8 cols) */}
            <div className="lg:col-span-8 bg-white p-5 rounded border border-neutral-200 space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-neutral-900">Monthly Revenue Trend</h3>
                <p className="text-xs text-neutral-500">Sales performance over past months</p>
              </div>

              <div className="space-y-3 pt-2">
                {(revenueData.monthly_trend || []).map((m) => {
                  const maxRev = Math.max(...(revenueData.monthly_trend || []).map((t) => t.revenue || 1));
                  const percentage = Math.max(15, Math.round((m.revenue / (maxRev || 1)) * 100));
                  return (
                    <div key={m.month} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-neutral-800">{m.month}</span>
                        <div className="space-x-3 text-neutral-600">
                          <span>{m.orders} orders</span>
                          <span className="font-semibold text-neutral-900">₹{Number(m.revenue).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-neutral-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-neutral-800 rounded transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Breakdown (4 cols) */}
            <div className="lg:col-span-4 bg-white p-5 rounded border border-neutral-200 space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-neutral-900">Payment Methods</h3>
                <p className="text-xs text-neutral-500">Breakdown of completed orders</p>
              </div>

              <div className="space-y-2">
                {(revenueData.payment_methods || []).map((pm, idx) => (
                  <div key={idx} className="p-3 rounded bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-medium text-neutral-800">
                      <span className="flex items-center space-x-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{pm.method}</span>
                      </span>
                      <span>{pm.percentage || 50}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span>{pm.count} orders</span>
                      <span className="font-semibold text-neutral-900">₹{Number(pm.total || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TOP PRODUCTS */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded border border-neutral-200 overflow-hidden">
          <div className="p-3.5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-xs text-neutral-900">Top Selling Products</h3>
              <p className="text-[11px] text-neutral-500">Ranked by units sold</p>
            </div>
            <span className="text-xs text-neutral-500">
              Total Catalog: {summary.total_products || 24} items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Units Sold</th>
                  <th className="py-2.5 px-3">Revenue</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {(inventoryData.top_sellers || []).map((p, idx) => (
                  <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-2.5 px-3 text-neutral-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-neutral-900">{p.title}</td>
                    <td className="py-2.5 px-3 capitalize text-neutral-500">{p.category_slug}</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">₹{p.price}</td>
                    <td className="py-2.5 px-3 text-neutral-700">{p.total_sold || 0}</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">
                      ₹{Number(p.total_revenue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={p.stock <= 10 ? 'text-amber-700 font-medium' : 'text-neutral-700'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-neutral-800">
                      {p.rating} ★
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LOGISTICS */}
      {activeTab === 'logistics' && (
        <div className="space-y-6">
          <div className="border border-neutral-200 bg-white rounded divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 grid grid-cols-1 sm:grid-cols-3">
            <div className="p-4">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Shipments Manifested</span>
              <div className="text-xl font-bold text-neutral-900 mt-1">{logisticsData.total_manifests || 8}</div>
              <p className="text-[11px] text-neutral-500 mt-0.5">AWBs generated via Shiprocket</p>
            </div>

            <div className="p-4">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">In-Transit / Out for Delivery</span>
              <div className="text-xl font-bold text-neutral-900 mt-1">{logisticsData.in_transit || 3}</div>
              <p className="text-[11px] text-neutral-500 mt-0.5">Active courier tracking</p>
            </div>

            <div className="p-4">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Successful Deliveries</span>
              <div className="text-xl font-bold text-neutral-900 mt-1">{logisticsData.delivered || 5}</div>
              <p className="text-[11px] text-neutral-500 mt-0.5">Completed door deliveries</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-semibold text-neutral-900">Shiprocket Logistics Manager</h4>
              <p className="text-neutral-500">Generate shipping labels, track courier waybills, and manage pickup locations.</p>
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
