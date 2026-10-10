import React, { useState, useEffect, useMemo } from 'react';
import { Users, Mail, Phone, ShoppingBag, Loader2, Search, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../services/api.js';

export function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('total_spent');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers();
      if (res.success) {
        setCustomers(res.customers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = customers.filter(c =>
      !q ||
      String(c.id).includes(q) ||
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
    list = [...list].sort((a, b) => {
      const av = Number(a[sortKey] || 0);
      const bv = Number(b[sortKey] || 0);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return list;
  }, [customers, search, sortKey, sortDir]);

  // Aggregate stats
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((s, c) => s + Number(c.total_spent || 0), 0);
  const totalOrders = customers.reduce((s, c) => s + Number(c.total_orders || 0), 0);
  const avgSpend = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const repeatBuyers = customers.filter(c => Number(c.total_orders) > 1).length;

  const SortBtn = ({ colKey, children }) => (
    <button
      type="button"
      onClick={() => handleSort(colKey)}
      className="flex items-center space-x-1 group cursor-pointer select-none"
    >
      <span>{children}</span>
      <span className="opacity-40 group-hover:opacity-80">
        {sortKey === colKey ? (
          sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3 opacity-30" />
        )}
      </span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900">Customer Directory</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Registered customer accounts, order history and lifetime spending.
          </p>
        </div>
      </div>

      {/* Aggregated Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-neutral-200 border border-neutral-200 bg-white">
        <div className="p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Total Customers</p>
          <p className="text-2xl font-bold font-serif text-neutral-900">{totalCustomers.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-neutral-500">{repeatBuyers} repeat buyers</p>
        </div>
        <div className="p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Total Revenue</p>
          <p className="text-2xl font-bold font-serif text-brand-maroon">₹{Math.round(totalRevenue).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-neutral-500">from all orders</p>
        </div>
        <div className="p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Total Orders</p>
          <p className="text-2xl font-bold font-serif text-neutral-900">{totalOrders.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-neutral-500">confirmed orders</p>
        </div>
        <div className="p-4 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Avg. Spend / User</p>
          <p className="text-2xl font-bold font-serif text-neutral-900">₹{Math.round(avgSpend).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-neutral-500">lifetime average</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="w-full pl-8 pr-3 py-2 text-xs border border-neutral-200 rounded-sm focus:outline-none focus:border-neutral-600 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-brand-maroon animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-400">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">
                    <SortBtn colKey="id">User ID</SortBtn>
                  </th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5 hidden sm:table-cell">Phone</th>
                  <th className="p-3.5">
                    <SortBtn colKey="total_orders">Orders</SortBtn>
                  </th>
                  <th className="p-3.5">
                    <SortBtn colKey="total_spent">Lifetime Value</SortBtn>
                  </th>
                  <th className="p-3.5 hidden md:table-cell">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="p-3.5 font-mono text-neutral-400 font-semibold text-[11px] whitespace-nowrap">
                      #USR-{c.id}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#FAF7F2] text-[#5A1827] font-bold flex items-center justify-center font-serif text-xs shrink-0 border border-[#EFE8DC]">
                          {c.name ? c.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">{c.name || '—'}</p>
                          {Number(c.total_orders) > 1 && (
                            <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                              Repeat Buyer
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-neutral-600 max-w-[160px] truncate">{c.email}</td>
                    <td className="p-3.5 text-neutral-500 hidden sm:table-cell">{c.phone || '—'}</td>
                    <td className="p-3.5 font-bold text-neutral-900">{c.total_orders || 0}</td>
                    <td className="p-3.5 font-bold text-[#5A1827]">₹{Number(c.total_spent || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-neutral-400 hidden md:table-cell">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
