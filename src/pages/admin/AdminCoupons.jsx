import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api.js';

export function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 15,
    min_order_amount: 1999,
    max_discount: 1000,
    is_active: 1
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.getAllCoupons();
      if (res.success) {
        setCoupons(res.coupons);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createCoupon(formData);
      setShowModal(false);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: 15,
        min_order_amount: 1999,
        max_discount: 1000,
        is_active: 1
      });
      loadCoupons();
    } catch (err) {
      alert('Error creating coupon: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      await api.deleteCoupon(id);
      loadCoupons();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Coupons & Marketing Offers
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage discount promo codes applied by customers during checkout.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promo Code</span>
        </button>
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
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min. Order Value</th>
                <th className="p-4">Max Cap</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50/80">
                  <td className="p-4 font-mono font-bold text-neutral-900 text-sm">
                    <span className="bg-brand-cream border border-brand-border px-2.5 py-1 rounded-md text-brand-maroon">
                      {c.code}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-neutral-900">
                    {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} Flat`}
                  </td>
                  <td className="p-4 text-neutral-600">₹{c.min_order_amount}</td>
                  <td className="p-4 text-neutral-600">₹{c.max_discount}</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Active
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-base text-neutral-900">Create New Promo Code</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Coupon Code (e.g. OCT15) *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="OCT15"
                  className="w-full p-2.5 border rounded-lg uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full p-2.5 border rounded-lg"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    placeholder="15"
                    className="w-full p-2.5 border rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
                    placeholder="1999"
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })}
                    placeholder="1000"
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-maroon text-white font-bold rounded-lg">
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
