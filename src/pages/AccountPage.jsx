import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Plus,
  Trash2,
  Truck,
  ExternalLink,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { DelhiveryTrackerModal } from '../components/common/DelhiveryTrackerModal.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { api } from '../services/api.js';

export function AccountPage() {
  const { user, isAuthenticated, logout, saveAddress, deleteAddress, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'profile';

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedWaybill, setSelectedWaybill] = useState(null);

  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated) {
      loadOrders();
    }
  }, [activeTab, isAuthenticated]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.getUserOrders();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (e) {
      console.error('Failed to load user orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      await saveAddress(addressForm);
      setShowAddressModal(false);
      setAddressForm({
        name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false
      });
    } catch (err) {
      alert(err.message || 'Failed to save address');
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10">
      <SEO title="My Account | OCT9 Luxury Ethnic Wear" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Banner */}
        <div className="bg-[#141414] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-neutral-800">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-brand-maroon border-2 border-brand-gold flex items-center justify-center text-xl font-serif font-bold text-white shadow">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-2xl font-bold text-white">{user.name}</h1>
                {isAdmin && (
                  <span className="bg-brand-gold text-neutral-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">{user.email} • {user.phone || 'No phone set'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow"
              >
                <ShieldCheck className="w-4 h-4 text-brand-gold-light" />
                <span>Admin Panel</span>
              </Link>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-brand-border mt-8">
          <button
            onClick={() => setSearchParams({ tab: 'profile' })}
            className={`pb-3 text-sm font-bold transition-colors flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'text-brand-maroon border-b-2 border-brand-maroon'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Addresses</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'orders' })}
            className={`pb-3 text-sm font-bold transition-colors flex items-center space-x-2 ${
              activeTab === 'orders'
                ? 'text-brand-maroon border-b-2 border-brand-maroon'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders & Live Tracking</span>
          </button>
        </div>

        {/* TAB 1: Profile & Saved Addresses */}
        {activeTab === 'profile' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Account Info */}
            <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-base text-neutral-900">Personal Information</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Full Name</span>
                  <p className="font-bold text-neutral-900 mt-0.5">{user.name}</p>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Email Address</span>
                  <p className="font-bold text-neutral-900 mt-0.5">{user.email}</p>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Contact Phone</span>
                  <p className="font-bold text-neutral-900 mt-0.5">{user.phone || 'Not added'}</p>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Account Type</span>
                  <p className="font-bold text-neutral-900 mt-0.5 capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Right 2 Cols: Saved Addresses */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-neutral-900">
                  Saved Delivery Addresses ({user.addresses?.length || 0})
                </h3>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="px-3 py-1.5 bg-brand-maroon text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses && user.addresses.length > 0 ? (
                  user.addresses.map((addr) => (
                    <div key={addr.id} className="bg-white rounded-xl p-5 border border-brand-border shadow-2xs space-y-2 relative">
                      {addr.is_default ? (
                        <span className="bg-brand-maroon text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          Default Address
                        </span>
                      ) : null}
                      <p className="font-bold text-xs text-neutral-900">{addr.name}</p>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {addr.address_line1} {addr.address_line2} <br />
                        {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                      <p className="text-xs text-neutral-500">Phone: {addr.phone}</p>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="text-neutral-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 bg-white rounded-xl p-8 text-center text-xs text-neutral-500 border border-brand-border">
                    No addresses saved yet. Add your address for faster 1-click checkout.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Orders & Live Tracking */}
        {activeTab === 'orders' && (
          <div className="mt-8 space-y-6">
            {loadingOrders ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 text-brand-maroon animate-spin mx-auto" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-brand-border space-y-3">
                <Package className="w-12 h-12 text-neutral-400 mx-auto" />
                <h3 className="font-serif font-bold text-lg text-neutral-800">No Orders Placed Yet</h3>
                <p className="text-xs text-neutral-500">Browse our latest ethnic collection and place your first order.</p>
                <Link to="/new-arrivals" className="inline-block px-6 py-2.5 bg-brand-maroon text-white text-xs font-bold rounded-xl shadow">
                  Shop New Arrivals
                </Link>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                    <div>
                      <span className="text-xs text-neutral-500">Order Placed: {new Date(o.created_at).toLocaleDateString('en-IN')}</span>
                      <p className="font-mono font-bold text-sm text-neutral-900">{o.order_number}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.payment_status === 'paid' ? 'Paid Online' : 'Cash On Delivery'}
                      </span>

                      <span className="text-sm font-bold text-neutral-900">
                        ₹{o.grand_total}
                      </span>
                    </div>
                  </div>

                  {/* Items in order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(o.items || []).map((it, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-2 bg-neutral-50 rounded-lg">
                        <img src={it.product_image} alt={it.product_title} className="w-12 h-14 object-cover rounded bg-neutral-200" />
                        <div className="text-xs min-w-0 flex-1">
                          <p className="font-semibold text-neutral-900 truncate">{it.product_title}</p>
                          <p className="text-neutral-500 text-[11px]">Size: {it.size} | Qty: {it.quantity}</p>
                          <p className="font-bold text-neutral-800">₹{it.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delhivery Tracking Footer */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-neutral-100 text-xs">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-brand-maroon" />
                      <span>
                        Delhivery AWB: <strong className="font-mono text-neutral-900">{o.delhivery_waybill || 'Assigned soon'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {o.delhivery_waybill && (
                        <button
                          onClick={() => setSelectedWaybill(o.delhivery_waybill)}
                          className="px-3.5 py-1.5 bg-brand-maroon text-white font-bold rounded-lg flex items-center space-x-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Live Package</span>
                        </button>
                      )}
                      <Link
                        to={`/order-success/${o.order_number}`}
                        className="px-3.5 py-1.5 border border-neutral-300 text-neutral-800 font-semibold rounded-lg hover:bg-neutral-50"
                      >
                        Order Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-base text-neutral-900">Add New Shipping Address</h3>
            <form onSubmit={handleSaveAddress} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={addressForm.name}
                onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                className="w-full text-xs p-2.5 border rounded-lg"
              />
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="Phone Number (10 digits)"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                className="w-full text-xs p-2.5 border rounded-lg"
              />
              <input
                type="text"
                required
                placeholder="Address Line 1"
                value={addressForm.address_line1}
                onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                className="w-full text-xs p-2.5 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={addressForm.address_line2}
                onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                className="w-full text-xs p-2.5 border rounded-lg"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Pincode"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  className="text-xs p-2.5 border rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="text-xs p-2.5 border rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  className="text-xs p-2.5 border rounded-lg"
                />
              </div>
              <label className="flex items-center space-x-2 text-xs">
                <input
                  type="checkbox"
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                  className="text-brand-maroon rounded"
                />
                <span>Set as default delivery address</span>
              </label>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAddressModal(false)} className="px-4 py-2 border rounded-lg text-xs">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-maroon text-white text-xs font-bold rounded-lg">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delhivery Live Tracking Modal */}
      {selectedWaybill && (
        <DelhiveryTrackerModal
          waybill={selectedWaybill}
          isOpen={Boolean(selectedWaybill)}
          onClose={() => setSelectedWaybill(null)}
        />
      )}
    </div>
  );
}
