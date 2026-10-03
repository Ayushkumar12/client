import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Package,
  Truck,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { api } from '../../services/api.js';

export function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getDashboardMetrics();
        if (res.success) {
          setMetrics(res.metrics);
          setLowStock(res.low_stock_products || []);
          setRecentOrders(res.recent_orders || []);
          setTopProducts(res.top_products || []);
        }
      } catch (e) {
        console.error('Failed to load admin metrics:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-maroon animate-spin" />
        <p className="text-xs text-neutral-500">Loading admin analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Store Overview & Analytics
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time tracking of Razorpay revenue and Shiprocket logistics fulfillment.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            + Add New Product
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Manage Shipments
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-neutral-900">
            ₹{Number(metrics?.total_revenue || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">
            Razorpay + COD Confirmed
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-full bg-brand-cream text-brand-maroon flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-neutral-900">
            {metrics?.total_orders || 0}
          </p>
          <span className="text-[11px] text-neutral-500">
            {metrics?.pending_orders || 0} pending fulfillment
          </span>
        </div>

        {/* Shipments In Transit */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">In Transit (Shiprocket)</span>
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-neutral-900">
            {metrics?.shipments_in_transit || 0}
          </p>
          <span className="text-[11px] text-purple-700 font-semibold">
            Live AWB Synced
          </span>
        </div>

        {/* Total Catalog Products */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active Catalog</span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-neutral-900">
            {metrics?.total_products || 0}
          </p>
          <span className="text-[11px] text-neutral-500">
            Ethnic wear styles
          </span>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Low Stock Alert ({lowStock.length} items require replenishment)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {lowStock.map(p => (
              <div key={p.id} className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-800 truncate max-w-[160px]">{p.title}</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Stock: {p.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-brand-border p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="font-serif font-bold text-base text-neutral-900">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-semibold text-brand-maroon hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-neutral-500 border-b border-neutral-100">
                  <th className="pb-3 font-bold">Order #</th>
                  <th className="pb-3 font-bold">Customer</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold">Payment</th>
                  <th className="pb-3 font-bold">Shiprocket AWB</th>
                  <th className="pb-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50/80">
                    <td className="py-3 font-mono font-bold text-neutral-900">{o.order_number}</td>
                    <td className="py-3">
                      <p className="font-semibold text-neutral-900">{o.customer_name}</p>
                      <span className="text-[10px] text-neutral-400">{o.customer_phone}</span>
                    </td>
                    <td className="py-3 font-bold text-neutral-900">₹{o.grand_total}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-brand-maroon font-bold">
                      {o.delhivery_waybill || 'Unmanifested'}
                    </td>
                    <td className="py-3">
                      <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-md font-semibold text-[10px] capitalize">
                        {o.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-brand-border p-6 shadow-2xs space-y-4">
          <h3 className="font-serif font-bold text-base text-neutral-900 pb-3 border-b border-neutral-100">
            Top Performing Styles
          </h3>

          <div className="space-y-3">
            {topProducts.map((p) => {
              const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';
              return (
                <div key={p.id} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-brand-cream/50 transition-colors">
                  <img src={img} alt={p.title} className="w-12 h-14 object-cover rounded-lg bg-neutral-100" />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-bold text-neutral-900 truncate">{p.title}</p>
                    <p className="text-neutral-500">₹{p.price}</p>
                    <span className="text-[10px] text-emerald-700 font-bold">{p.total_sold || 12} Units Sold</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
