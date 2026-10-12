import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import { AgCharts } from 'ag-charts-react';
import {
  ModuleRegistry as GridModuleRegistry,
  AllCommunityModule as GridAllCommunityModule
} from 'ag-grid-community';
import {
  ModuleRegistry as ChartModuleRegistry,
  AllCommunityModule as ChartAllCommunityModule
} from 'ag-charts-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { api } from '../../services/api.js';

// Register AG Grid & AG Charts Community Modules
GridModuleRegistry.registerModules([GridAllCommunityModule]);
ChartModuleRegistry.registerModules([ChartAllCommunityModule]);

export function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
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
          setWeeklyTrend(res.weekly_trend || []);
        }
      } catch (e) {
        console.error('Failed to load admin metrics:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // AG GRID Default Column Definition
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true
  }), []);

  // AG GRID Column Definitions for Recent Orders
  const orderColDefs = useMemo(() => [
    {
      field: 'order_number',
      headerName: 'Order #',
      width: 140,
      pinned: 'left',
      cellClass: 'font-mono font-medium text-neutral-900'
    },
    {
      field: 'customer_name',
      headerName: 'Customer',
      width: 160,
      cellClass: 'font-medium text-neutral-900'
    },
    {
      field: 'grand_total',
      headerName: 'Amount',
      width: 120,
      valueFormatter: (p) => `₹${Number(p.value || 0).toLocaleString('en-IN')}`,
      cellClass: 'font-bold text-neutral-900'
    },
    {
      field: 'payment_status',
      headerName: 'Payment',
      width: 120,
      cellRenderer: (p) => {
        const isPaid = p.value === 'paid';
        return (
          <span className={`inline-flex items-center text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
            isPaid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {p.value || 'Pending'}
          </span>
        );
      }
    },
    {
      field: 'delhivery_waybill',
      headerName: 'AWB Tracking',
      width: 150,
      cellRenderer: (p) => (
        <span className="font-mono text-[11px] text-neutral-700">
          {p.value || 'Unmanifested'}
        </span>
      )
    },
    {
      field: 'order_status',
      headerName: 'Fulfillment Status',
      width: 150,
      cellRenderer: (p) => (
        <span className="capitalize font-medium text-xs text-neutral-700">
          {p.value || 'Received'}
        </span>
      )
    }
  ], []);

  // AG CHART Options for Sales & Orders Quick Trend
  const dashboardChartOptions = useMemo(() => {
    const chartData = weeklyTrend.length > 0 ? weeklyTrend : [
      { day: 'Mon', revenue: 0, orders: 0 },
      { day: 'Tue', revenue: 0, orders: 0 },
      { day: 'Wed', revenue: 0, orders: 0 },
      { day: 'Thu', revenue: 0, orders: 0 },
      { day: 'Fri', revenue: 0, orders: 0 },
      { day: 'Sat', revenue: 0, orders: 0 },
      { day: 'Sun', revenue: 0, orders: 0 }
    ];

    return {
      title: {
        text: 'Weekly Sales Velocity',
        fontSize: 13,
        fontWeight: 'bold',
        color: '#171717'
      },
      subtitle: {
        text: 'Revenue trajectory across current cycle',
        fontSize: 11,
        color: '#737373'
      },
      data: chartData,
      series: [
        {
          type: 'bar',
          direction: 'vertical',
          xKey: 'day',
          yKey: 'revenue',
          yName: 'Revenue (₹)',
          fill: '#171717',
          stroke: '#171717',
          cornerRadius: 3
        }
      ],
      axes: {
        x: {
          type: 'category',
          position: 'bottom',
          label: { fontSize: 10, color: '#525252' }
        },
        y: {
          type: 'number',
          position: 'left',
          label: {
            formatter: (p) => `₹${Number(p.value).toLocaleString('en-IN')}`,
            fontSize: 10,
            color: '#525252'
          }
        }
      }
    };
  }, [weeklyTrend]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div className="space-y-1">
            <div className="h-6 bg-neutral-200/80 rounded w-32 skeleton-shimmer" />
            <div className="h-3 bg-neutral-200/80 rounded w-64 skeleton-shimmer" />
          </div>
        </div>

        {/* 4 Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-neutral-200 p-4 space-y-3">
              <div className="h-3 bg-neutral-200/80 rounded w-24 skeleton-shimmer" />
              <div className="h-7 bg-neutral-200/80 rounded w-20 skeleton-shimmer" />
              <div className="h-2.5 bg-neutral-200/80 rounded w-32 skeleton-shimmer" />
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white border border-neutral-200 p-4 space-y-3">
          <div className="h-4 bg-neutral-200/80 rounded w-36 skeleton-shimmer" />
          <div className="h-[280px] bg-neutral-100 rounded skeleton-shimmer" />
        </div>

        {/* Recent Orders Table Skeleton */}
        <div className="bg-white border border-neutral-200 p-4 space-y-3">
          <div className="h-4 bg-neutral-200/80 rounded w-32 skeleton-shimmer" />
          <div className="h-[200px] bg-neutral-100 rounded skeleton-shimmer" />
        </div>
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
          <Link
            to="/admin/database"
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium border border-red-200 rounded-md transition-colors"
          >
            Database & Reset
          </Link>
          <Link
            to="/admin/analytics"
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-md transition-colors"
          >
            Full Analytics →
          </Link>
        </div>
      </div>

      {/* 5 Standard Clean Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 divide-x divide-neutral-200 border border-neutral-200 bg-white">
        {/* Total Revenue */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Total Revenue</span>
          <p className="text-2xl font-bold font-sans text-neutral-900">
            ₹{Number(metrics?.total_revenue || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-neutral-500">Razorpay & COD confirmed</p>
        </div>

        {/* Total Orders */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Total Orders</span>
          <p className="text-2xl font-bold font-sans text-neutral-900">
            {metrics?.total_orders || 0}
          </p>
          <p className="text-[11px] text-neutral-500">{metrics?.pending_orders || 0} pending fulfillment</p>
        </div>

        {/* Shipments In Transit */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">In Transit</span>
          <p className="text-2xl font-bold font-sans text-neutral-900">
            {metrics?.shipments_in_transit || 0}
          </p>
          <p className="text-[11px] text-neutral-500">Courier dispatches</p>
        </div>

        {/* Total Catalog Products */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Catalog Items</span>
          <p className="text-2xl font-bold font-sans text-neutral-900">
            {metrics?.total_products || 0}
          </p>
          <p className="text-[11px] text-neutral-500">Active SKUs</p>
        </div>

        {/* Registered Customers */}
        <div className="p-4 space-y-1">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Customers</span>
          <p className="text-2xl font-bold font-sans text-neutral-900">
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

      {/* Visual Analytics Row: AG Chart */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-2xs">
        <div className="h-[220px]">
          <AgCharts options={dashboardChartOptions} />
        </div>
      </div>

      {/* 2-Column: Recent Orders (AG Grid) & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Orders AG Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-neutral-200 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h2 className="font-bold text-sm text-neutral-900">Recent Customer Orders (AG Grid)</h2>
            <Link to="/admin/orders" className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center space-x-1">
              <span>View all orders</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="ag-theme-quartz" style={{ height: 350, width: '100%' }}>
            <AgGridReact
              rowData={recentOrders}
              columnDefs={orderColDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={5}
              paginationPageSizeSelector={[5, 10, 20]}
            />
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
                      <span className="text-[10px] text-emerald-700 font-semibold">{p.total_sold || 0} Sold</span>
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
