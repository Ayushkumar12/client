import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  ChevronRight,
  Search,
  Filter,
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { SEO } from '../components/common/SEO.jsx';
import { ShiprocketTrackerModal } from '../components/common/ShiprocketTrackerModal.jsx';
import { CancelOrderModal } from '../components/common/CancelOrderModal.jsx';
import { ReturnOrderModal } from '../components/common/ReturnOrderModal.jsx';
import { downloadOrderInvoicePdf } from '../utils/invoicePdf.js';
import { parseAddress } from '../utils/addressUtils.js';
import { getProductUrl } from '../utils/productUrl.js';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [trackingWaybill, setTrackingWaybill] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [returningOrder, setReturningOrder] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  async function fetchOrders() {
    setLoading(true);
    setError('');
    try {
      if (isAuthenticated) {
        const res = await api.getUserOrders();
        if (res.success) {
          setOrders(res.orders || []);
        } else {
          setOrders([]);
        }
      } else {
        // Mock / Guest orders preview for demonstration if not logged in
        setOrders([]);
      }
    } catch (err) {
      console.warn('Orders fetch note:', err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  // Handle Cancel Success
  const handleCancelSuccess = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? { ...o, order_status: 'cancelled', cancellation_reason: updatedOrder.cancellation_reason } : o))
    );
  };

  // Handle Return Success
  const handleReturnSuccess = () => {
    fetchOrders();
  };

  // Filter orders based on tab and search query
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.order_number.toLowerCase().includes(q) ||
      (o.delhivery_waybill && o.delhivery_waybill.toLowerCase().includes(q)) ||
      (o.items && o.items.some((it) => it.product_title && it.product_title.toLowerCase().includes(q)));

    if (!matchesSearch) return false;

    const status = (o.order_status || '').toLowerCase();
    const returnStatus = (o.return_status || '').toLowerCase();

    if (activeTab === 'active') {
      return ['pending', 'confirmed', 'processing', 'manifested', 'shipped', 'in_transit', 'out_for_delivery'].includes(status);
    }
    if (activeTab === 'delivered') {
      return status === 'delivered';
    }
    if (activeTab === 'cancelled') {
      return status === 'cancelled';
    }
    if (activeTab === 'returns') {
      return returnStatus && returnStatus !== 'none';
    }
    return true;
  });

  const getStatusBadge = (order) => {
    const status = (order.order_status || 'confirmed').toLowerCase();
    const returnStatus = (order.return_status || 'none').toLowerCase();

    if (returnStatus === 'return_requested') {
      return <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider">Return Pending</span>;
    }
    if (returnStatus === 'return_approved') {
      return <span className="text-[10px] bg-blue-100 text-blue-900 font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider">Return Approved</span>;
    }
    if (returnStatus === 'return_rejected') {
      return <span className="text-[10px] bg-red-100 text-red-900 font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider">Return Rejected</span>;
    }

    switch (status) {
      case 'delivered':
        return <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider">Delivered</span>;
      case 'out_for_delivery':
        return <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider">Out for Delivery</span>;
      case 'shipped':
      case 'in_transit':
        return <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider">In Transit</span>;
      case 'processing':
      case 'confirmed':
        return <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider">Confirmed</span>;
      case 'cancelled':
        return <span className="text-[10px] bg-neutral-200 text-neutral-700 font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="text-[10px] bg-neutral-100 text-neutral-800 font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-24 pt-6">
      <SEO title="My Orders & History | OCT9 Luxury Ethnic Wear" />

      {!isAuthenticated ? (
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-white border border-[#EFE8DC] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-[#5A1827]" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold text-neutral-900">Sign In to View Orders</h1>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Your order history, tracking, invoices, and returns are available after signing in to your OCT9 account.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Link
              to="/login?redirect=/orders"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#5A1827] text-white text-xs font-semibold rounded-sm hover:bg-[#43121D] transition-colors text-center"
            >
              Sign In
            </Link>
            <Link
              to="/register?redirect=/orders"
              className="w-full sm:w-auto px-6 py-2.5 border border-neutral-300 bg-white text-neutral-900 text-xs font-semibold rounded-sm hover:bg-neutral-50 transition-colors text-center"
            >
              Create Account
            </Link>
          </div>
          <Link to="/track-order" className="inline-block text-xs text-[#5A1827] font-semibold underline underline-offset-2">
            Track an order with AWB number instead
          </Link>
        </div>
      ) : (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
          <div>
            <nav className="flex items-center space-x-2 text-xs text-neutral-500 mb-1">
              <Link to="/" className="hover:text-neutral-900">Home</Link>
              <span>/</span>
              <span className="text-neutral-900 font-semibold">My Orders</span>
            </nav>
            <h1 className="text-2xl font-serif font-bold text-neutral-900">Order History & Deliveries</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/track-order"
              className="px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-sm text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-brand-maroon" />
              <span>Track with AWB</span>
            </Link>

            <Link
              to="/"
              className="px-4 py-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white rounded-sm text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Explore Collection</span>
            </Link>
          </div>
        </div>

        {/* Search and Filter Tabs */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar text-xs font-bold">
            {[
              { key: 'all', label: 'All Orders', count: orders.length },
              { key: 'active', label: 'Active / In Transit', count: orders.filter((o) => ['pending', 'confirmed', 'processing', 'manifested', 'shipped', 'in_transit', 'out_for_delivery'].includes((o.order_status || '').toLowerCase())).length },
              { key: 'delivered', label: 'Delivered', count: orders.filter((o) => (o.order_status || '').toLowerCase() === 'delivered').length },
              { key: 'returns', label: 'Returns & Exchanges', count: orders.filter((o) => o.return_status && o.return_status !== 'none').length },
              { key: 'cancelled', label: 'Cancelled', count: orders.filter((o) => (o.order_status || '').toLowerCase() === 'cancelled').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 rounded-sm whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                }`}
              >
                {tab.label} {tab.count > 0 && <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'}`}>{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order # or Item..."
              className="w-full text-xs pl-8 pr-3 py-2.5 bg-white border border-neutral-300 rounded-sm focus:outline-none focus:border-brand-maroon shadow-2xs"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-maroon animate-spin mx-auto" />
            <p className="text-xs text-neutral-500 font-medium">Loading your orders & tracking telemetry...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-brand-border rounded-sm p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif font-bold text-neutral-900">No Orders Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery ? `No orders matched your search query "${searchQuery}".` : 'You have not placed any orders yet.'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-bold rounded-sm shadow-md transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const items = order.items || [];
              const addr = parseAddress(order.shipping_address);
              const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });

              const isCancellable = ['pending', 'confirmed', 'processing', 'manifested'].includes((order.order_status || '').toLowerCase()) && (order.order_status || '').toLowerCase() !== 'cancelled';
              const isDelivered = (order.order_status || '').toLowerCase() === 'delivered';
              const returnRequested = order.return_status && order.return_status !== 'none';

              return (
                <div key={order.id} className="bg-white rounded-sm border border-brand-border shadow-xs overflow-hidden transition-all hover:shadow-md">
                  {/* Order Card Header */}
                  <div className="p-4 sm:p-5 bg-neutral-50/70 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Order Placed</span>
                        <span className="font-semibold text-neutral-800">{orderDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Total Amount</span>
                        <span className="font-bold text-neutral-900">₹{Number(order.grand_total).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Payment Mode</span>
                        <span className="font-semibold uppercase text-neutral-700">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Razorpay Prepaid'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Deliver To</span>
                        <span className="font-semibold text-neutral-800">{order.customer_name} ({addr.city || 'Delhi'})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(order)}
                      <span className="font-mono font-bold text-neutral-900">#{order.order_number}</span>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="p-4 sm:p-5 divide-y divide-neutral-100">
                    {items.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-3.5">
                          <img
                            src={item.product_image || '/oct9-logo.jpg'}
                            alt={item.product_title}
                            className="w-14 h-16 sm:w-16 sm:h-20 object-cover rounded-lg bg-neutral-100 shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-1">{item.product_title}</h4>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              Size: <strong>{item.size || 'Free Size'}</strong> • Qty: <strong>{item.quantity || 1}</strong>
                            </p>
                            <p className="font-bold text-neutral-900 text-xs mt-1">
                              ₹{Number(item.total || item.price * (item.quantity || 1)).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        <Link
                          to={getProductUrl(item)}
                          className="px-3 py-1.5 rounded-sm border border-neutral-200 hover:bg-neutral-50 text-[11px] font-semibold text-neutral-700 whitespace-nowrap"
                        >
                          View Item
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Return Details Banner if Return Active */}
                  {returnRequested && (
                    <div className="mx-4 sm:mx-5 mb-4 p-3.5 rounded-sm bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <RotateCcw className="w-4 h-4 text-purple-700" />
                          <span>Return Status: {order.return_status === 'return_approved' ? 'Approved & Pickup Scheduled' : order.return_status === 'return_rejected' ? 'Rejected' : 'Under Review by Admin'}</span>
                        </span>
                        {order.return_awb && <span className="font-mono text-purple-800">Return AWB: {order.return_awb}</span>}
                      </div>
                      <p className="text-[11px] text-purple-700">Reason: {order.return_reason}</p>
                      {order.return_admin_notes && <p className="text-[11px] text-purple-800 italic">Admin Note: {order.return_admin_notes}</p>}
                    </div>
                  )}

                  {/* Cancellation Reason Banner if Cancelled */}
                  {order.cancellation_reason && (
                    <div className="mx-4 sm:mx-5 mb-4 p-3 rounded-sm bg-neutral-100 border border-neutral-200 text-xs text-neutral-700">
                      <strong>Cancellation Reason:</strong> {order.cancellation_reason}
                    </div>
                  )}

                  {/* Order Footer & Action Triggers */}
                  <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-neutral-50/50 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Shiprocket AWB info */}
                    <div className="flex items-center space-x-2">
                      {order.delhivery_waybill ? (
                        <div className="flex items-center space-x-1.5">
                          <Truck className="w-3.5 h-3.5 text-purple-700" />
                          <span className="text-neutral-500 text-[11px]">Shiprocket AWB:</span>
                          <strong className="font-mono text-purple-900 font-bold">{order.delhivery_waybill}</strong>
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-400">Shipment registered via Shiprocket Logistics</span>
                      )}
                    </div>

                    {/* Buttons Toolbar */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Live Tracking */}
                      {order.delhivery_waybill ? (
                        <button
                          type="button"
                          onClick={() => setTrackingWaybill(order.delhivery_waybill)}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-sm flex items-center space-x-1 text-[11px] uppercase tracking-wider shadow-2xs cursor-pointer"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Track Live</span>
                        </button>
                      ) : (
                        <Link
                          to={`/track-order?order=${order.order_number}`}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-sm flex items-center space-x-1 text-[11px] uppercase tracking-wider shadow-2xs"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Track Order</span>
                        </Link>
                      )}

                      {/* Download Invoice */}
                      <button
                        type="button"
                        onClick={async () => {
                          setDownloadingId(order.id);
                          await downloadOrderInvoicePdf(order);
                          setDownloadingId(null);
                        }}
                        disabled={downloadingId === order.id}
                        className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 font-semibold rounded-sm flex items-center space-x-1 text-[11px] uppercase tracking-wider cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>{downloadingId === order.id ? 'Generating...' : 'Invoice (PDF)'}</span>
                      </button>

                      {/* Cancel Order Action */}
                      {isCancellable && (
                        <button
                          type="button"
                          onClick={() => setCancellingOrder(order)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold rounded-sm flex items-center space-x-1 text-[11px] uppercase tracking-wider cursor-pointer"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Cancel Order</span>
                        </button>
                      )}

                      {/* Return Order Action */}
                      {isDelivered && !returnRequested && (
                        <button
                          type="button"
                          onClick={() => setReturningOrder(order)}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 font-semibold rounded-sm flex items-center space-x-1 text-[11px] uppercase tracking-wider cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Return / Exchange</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <CancelOrderModal
          order={cancellingOrder}
          isOpen={Boolean(cancellingOrder)}
          onClose={() => setCancellingOrder(null)}
          onCancelSuccess={handleCancelSuccess}
        />
      )}

      {/* Return Order Modal */}
      {returningOrder && (
        <ReturnOrderModal
          order={returningOrder}
          isOpen={Boolean(returningOrder)}
          onClose={() => setReturningOrder(null)}
          onReturnSuccess={handleReturnSuccess}
        />
      )}
      </div>
      )}
    </div>
  );
}
