import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  Search,
  Printer,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  RefreshCw,
  Loader2,
  FileText
} from 'lucide-react';
import { ShiprocketTrackerModal } from '../../components/common/ShiprocketTrackerModal.jsx';
import { downloadOrderInvoicePdf } from '../../utils/invoicePdf.js';
import { api } from '../../services/api.js';

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);
  const [trackingWaybill, setTrackingWaybill] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetAllOrders({ status: statusFilter, search });
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  // 1-Click Generate Shiprocket Waybill
  const handleGenerateShiprocket = async (orderId) => {
    setActionLoading(true);
    setActionMessage('');
    try {
      const res = await api.adminGenerateShiprocketWaybill(orderId);
      if (res.success) {
        setActionMessage(`Shiprocket AWB Generated: ${res.waybill}`);
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({
            ...prev,
            delhivery_waybill: res.waybill,
            delhivery_status: 'manifested'
          }));
        }
      }
    } catch (e) {
      alert('Error generating Shiprocket AWB: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Update Order Status
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await api.adminUpdateOrderStatus(orderId, { order_status: newStatus });
      if (res.success) {
        fetchOrders();
        if (selectedOrder) {
          setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
        }
      }
    } catch (e) {
      alert('Error updating status: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Order Management & Fulfillment
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Fulfill orders with 1-click Shiprocket AWB creation, generate shipping labels & track shipments.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 hover:bg-neutral-50 flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-maroon" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar w-full md:w-auto">
          {['all', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-brand-maroon text-white shadow-2xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order #, Customer, AWB..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-brand-maroon animate-spin mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500 space-y-2">
            <Package className="w-10 h-10 text-neutral-400 mx-auto" />
            <p className="font-bold text-neutral-800">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Order Details</th>
                  <th className="p-4">Customer & City</th>
                  <th className="p-4">Amount & Mode</th>
                  <th className="p-4">Delhivery Status</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((o) => {
                  const addr = typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address;
                  return (
                    <tr key={o.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="p-4">
                        <p className="font-mono font-bold text-neutral-900 text-sm">{o.order_number}</p>
                        <span className="text-[10px] text-neutral-400">{new Date(o.created_at).toLocaleDateString('en-IN')}</span>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-neutral-900">{o.customer_name}</p>
                        <span className="text-neutral-500">{addr?.city || 'India'} ({addr?.pincode})</span>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-neutral-900 text-sm">₹{o.grand_total}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.payment_method === 'cod' ? 'COD' : 'Razorpay'}
                        </span>
                      </td>

                      {/* Shiprocket AWB & Status */}
                      <td className="p-4">
                        {o.delhivery_waybill ? (
                          <div>
                            <span className="font-mono font-bold text-purple-700 block">
                              {o.delhivery_waybill}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold capitalize">
                              ● {o.delhivery_status || 'Manifested'}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateShiprocket(o.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white text-[10px] font-bold rounded flex items-center space-x-1 cursor-pointer"
                          >
                            <Truck className="w-3 h-3" />
                            <span>1-Click Shiprocket AWB</span>
                          </button>
                        )}
                      </td>

                      <td className="p-4">
                        <select
                          value={o.order_status}
                          onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                          className="text-xs bg-neutral-50 border border-neutral-300 rounded px-2 py-1 font-semibold capitalize"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg"
                          title="View Order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={async () => {
                            setDownloadingInvoiceId(o.id);
                            await downloadOrderInvoicePdf(o);
                            setDownloadingInvoiceId(null);
                          }}
                          disabled={downloadingInvoiceId === o.id}
                          className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-brand-maroon rounded-lg cursor-pointer disabled:opacity-50"
                          title="Download Tax Invoice PDF"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {o.delhivery_waybill && (
                          <>
                            <a
                              href={api.getPackingSlipUrl(o.delhivery_waybill)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block p-1.5 bg-brand-cream hover:bg-brand-sand text-brand-maroon rounded-lg cursor-pointer"
                              title="Print Shiprocket Packing Slip"
                            >
                              <Printer className="w-4 h-4" />
                            </a>

                            <button
                              onClick={() => setTrackingWaybill(o.delhivery_waybill)}
                              className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg cursor-pointer"
                              title="Track Live"
                            >
                              <Truck className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs text-neutral-500 font-semibold">Order Management</span>
                <h3 className="font-mono font-bold text-lg text-neutral-900">{selectedOrder.order_number}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-500 font-bold p-1">✕</button>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-brand-cream p-4 rounded-xl border border-brand-border">
              <div>
                <strong className="text-neutral-900 block mb-1">Customer Information</strong>
                <p>{selectedOrder.customer_name}</p>
                <p>{selectedOrder.customer_email}</p>
                <p>Phone: +91 {selectedOrder.customer_phone}</p>
              </div>
              <div>
                <strong className="text-neutral-900 block mb-1">Delivery Address</strong>
                {(() => {
                  const a = typeof selectedOrder.shipping_address === 'string' ? JSON.parse(selectedOrder.shipping_address) : selectedOrder.shipping_address;
                  return (
                    <p>{a.address_line1}, {a.city}, {a.state} - {a.pincode}</p>
                  );
                })()}
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-serif font-bold text-sm text-neutral-900 mb-2">Order Items</h4>
              <div className="divide-y border rounded-xl overflow-hidden">
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center space-x-3">
                      <img src={it.product_image} alt={it.product_title} className="w-10 h-12 object-cover rounded bg-neutral-100" />
                      <div>
                        <p className="font-bold text-neutral-900">{it.product_title}</p>
                        <p className="text-neutral-500 text-[11px]">Size: {it.size} | Color: {it.color} | Qty: {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900">₹{it.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shiprocket Actions inside modal */}
            <div className="p-4 bg-[#141414] text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-brand-gold uppercase tracking-wider font-bold">Shiprocket Logistics Status</span>
                <p className="font-mono text-sm font-bold">
                  {selectedOrder.delhivery_waybill ? `AWB: ${selectedOrder.delhivery_waybill}` : 'Shipment not generated yet'}
                </p>
              </div>

              <div className="flex gap-2">
                {!selectedOrder.delhivery_waybill ? (
                  <button
                    onClick={() => handleGenerateShiprocket(selectedOrder.id)}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Generate AWB
                  </button>
                ) : (
                  <>
                    <button
                      onClick={async () => {
                        setDownloadingInvoiceId(selectedOrder.id);
                        await downloadOrderInvoicePdf(selectedOrder);
                        setDownloadingInvoiceId(null);
                      }}
                      disabled={downloadingInvoiceId === selectedOrder.id}
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{downloadingInvoiceId === selectedOrder.id ? 'Downloading...' : 'Download Invoice (PDF)'}</span>
                    </button>

                    <a
                      href={api.getPackingSlipUrl(selectedOrder.delhivery_waybill)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </a>

                    <button
                      onClick={() => setTrackingWaybill(selectedOrder.delhivery_waybill)}
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg"
                    >
                      Track Live
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Shiprocket Tracking Modal */}
      {trackingWaybill && (
        <ShiprocketTrackerModal
          waybill={trackingWaybill}
          isOpen={Boolean(trackingWaybill)}
          onClose={() => setTrackingWaybill(null)}
        />
      )}
    </div>
  );
}
