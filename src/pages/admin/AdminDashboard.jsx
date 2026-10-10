import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
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
      <div className="py-20 flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-6 h-6 text-neutral-600 animate-spin" />
        <p className="text-xs text-neutral-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Store performance, revenue overview, and recent customer orders.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2 text-xs">
          <Link
            to="/admin/products"
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-md transition-colors"
          >
            Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-800 font-medium border border-neutral-300 rounded-md transition-colors"
          >
            Manage Orders
          </Link>
          <Link
            to="/admin/inventory"
            className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-800 font-medium border border-neutral-300 rounded-md transition-colors"
          >
            Inventory
          </Link>
        </div>
      </div>

      {/* 5 Standard Clean Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 divide-x divide-neutral-200 border border-neutral-200 bg-white">
        {/* Total Revenue */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Total Revenue</span>
          <p className="text-2xl font-bold font-serif text-neutral-900">
            ₹{Number(metrics?.total_revenue || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-neutral-500">Razorpay & COD confirmed</p>
        </div>

        {/* Total Orders */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Total Orders</span>
          <p className="text-2xl font-bold font-serif text-neutral-900">
            {metrics?.total_orders || 0}
          </p>
          <p className="text-[11px] text-neutral-500">{metrics?.pending_orders || 0} pending fulfillment</p>
        </div>

        {/* Shipments In Transit */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">In Transit</span>
          <p className="text-2xl font-bold font-serif text-neutral-900">
            {metrics?.shipments_in_transit || 0}
          </p>
          <p className="text-[11px] text-neutral-500">Courier dispatches</p>
        </div>

        {/* Total Catalog Products */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Catalog Items</span>
          <p className="text-2xl font-bold font-serif text-neutral-900">
            {metrics?.total_products || 0}
          </p>
          <p className="text-[11px] text-neutral-500">Active SKUs</p>
        </div>

        {/* Registered Customers */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Customers</span>
          <p className="text-2xl font-bold font-serif text-neutral-900">
            {metrics?.total_customers || 0}
          </p>
          <Link to="/admin/customers" className="text-[11px] text-[#5A1827] font-semibold hover:underline">
            View directory →
          </Link>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Low Stock Warning ({lowStock.length} items require replenishment)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {lowStock.map(p => (
              <div key={p.id} className="bg-white p-2 rounded border border-amber-200 flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-800 truncate max-w-[160px]">{p.title}</span>
                <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[11px]">
                  Qty: {p.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-Column: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="font-bold text-sm text-neutral-900">Recent Customer Orders</h2>
            <Link to="/admin/orders" className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center space-x-1">
              <span>View all orders</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Order</th>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Amount</th>
                  <th className="py-2.5 px-4 font-semibold">Payment</th>
                  <th className="py-2.5 px-4 font-semibold">AWB Tracking</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-400">
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4 font-mono font-medium text-neutral-900">{o.order_number}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-neutral-900">{o.customer_name}</p>
                        <span className="text-[10px] text-neutral-400">{o.customer_phone}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-900">₹{o.grand_total}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-700">
                        {o.delhivery_waybill || 'Unmanifested'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded text-[11px] capitalize font-medium">
                          {o.order_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-neutral-200 p-4 space-y-3">
          <h2 className="font-bold text-sm text-neutral-900 pb-2 border-b border-neutral-200">
            Top Performing Styles
          </h2>

          <div className="space-y-2.5">
            {topProducts.length === 0 ? (
              <p className="text-xs text-neutral-400 py-3">No sales activity yet.</p>
            ) : (
              topProducts.map((p) => {
                const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';
                return (
                  <div key={p.id} className="flex items-center space-x-3 p-2 rounded border border-neutral-100 hover:bg-neutral-50 transition-colors">
                    {img ? (
                      <img src={img} alt={p.title} className="w-10 h-12 object-cover rounded bg-neutral-100" />
                    ) : (
                      <div className="w-10 h-12 bg-neutral-100 rounded flex items-center justify-center text-[10px] text-neutral-400">
                        No img
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-medium text-neutral-900 truncate">{p.title}</p>
                      <p className="text-neutral-500">₹{p.price}</p>
                      <span className="text-[10px] text-emerald-700 font-semibold">{p.total_sold || 12} Sold</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
