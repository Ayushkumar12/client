import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, ShoppingBag, Loader2 } from 'lucide-react';
import { api } from '../../services/api.js';

export function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
          Customer Directory & Insights
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Registered customer accounts, order history and total lifetime spending.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-brand-maroon animate-spin mx-auto" />
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Customer</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50/80">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-brand-cream text-brand-maroon font-bold flex items-center justify-center font-serif text-sm">
                        {c.name ? c.name[0].toUpperCase() : 'C'}
                      </div>
                      <span className="font-bold text-neutral-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-neutral-600">{c.email}</td>
                  <td className="p-4 text-neutral-600">{c.phone || '-'}</td>
                  <td className="p-4 font-bold text-neutral-900">{c.total_orders} Orders</td>
                  <td className="p-4 font-bold text-brand-maroon text-sm">₹{Number(c.total_spent).toLocaleString('en-IN')}</td>
                  <td className="p-4 text-neutral-400">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
