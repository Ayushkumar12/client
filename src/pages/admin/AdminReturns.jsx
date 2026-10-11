import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Image as ImageIcon,
  Eye,
  AlertCircle,
  Loader2,
  X,
  FileText,
  Search,
  ChevronRight,
  ShieldCheck,
  Mail,
  Trash2
} from 'lucide-react';
import { api } from '../../services/api.js';

export function AdminReturns() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'direct'
  const [returns, setReturns] = useState([]);
  const [directRequests, setDirectRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, return_requested, return_approved, return_rejected
  const [search, setSearch] = useState('');

  // Modals / Action state
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeProofImage, setActiveProofImage] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  async function fetchReturns() {
    setLoading(true);
    setError('');
    try {
      const [res, directRes] = await Promise.all([
        api.adminGetReturns().catch(() => ({ success: false, returns: [] })),
        api.adminGetReturnRequests().catch(() => ({ success: false, return_requests: [] }))
      ]);
      if (res.success) {
        setReturns(res.returns || []);
      }
      if (directRes.success) {
        setDirectRequests(directRes.return_requests || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load return requests.');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteDirect = async (id) => {
    if (!window.confirm('Are you sure you want to delete this return inquiry?')) return;
    try {
      const res = await api.adminDeleteReturnRequest(id);
      if (res.success) {
        setDirectRequests((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(res.message || 'Failed to delete return inquiry.');
      }
    } catch (e) {
      alert(e.message || 'Error deleting return inquiry.');
    }
  };

  const handleActionSubmit = async () => {
    if (!selectedReturn || !actionType) return;
    setActionLoading(true);
    try {
      const res = await api.adminReviewReturn(selectedReturn.id, {
        action: actionType,
        admin_notes: adminNotes.trim()
      });

      if (res.success) {
        alert(res.message || `Return request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully.`);
        setSelectedReturn(null);
        setActionType(null);
        setAdminNotes('');
        fetchReturns();
      } else {
        alert(res.message || 'Action failed.');
      }
    } catch (err) {
      alert(err.message || 'Error executing action.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredReturns = returns.filter((r) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      r.order_number.toLowerCase().includes(q) ||
      r.customer_name.toLowerCase().includes(q) ||
      (r.return_reason && r.return_reason.toLowerCase().includes(q));

    if (!matchSearch) return false;
    if (filter === 'pending') return r.return_status === 'return_requested';
    if (filter === 'approved') return r.return_status === 'return_approved';
    if (filter === 'exchanged') return r.return_status === 'exchanged';
    if (filter === 'rejected') return r.return_status === 'return_rejected';
    return true;
  });

  const pendingCount = returns.filter((r) => r.return_status === 'return_requested').length;
  const approvedCount = returns.filter((r) => r.return_status === 'return_approved').length;
  const exchangedCount = returns.filter((r) => r.return_status === 'exchanged').length;
  const rejectedCount = returns.filter((r) => r.return_status === 'return_rejected').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-neutral-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-purple-700" />
            <span>Returns & Exchanges Management</span>
          </h1>
          <p className="text-xs text-neutral-500">
            Review customer defect proof, approve return requests, and generate automated Shiprocket Reverse AWBs.
          </p>
        </div>

        <button
          onClick={fetchReturns}
          disabled={loading}
          className="px-3.5 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 shadow-2xs cursor-pointer"
        >
          {loading ? 'Refreshing...' : '↻ Refresh List'}
        </button>
      </div>

      {/* Top Tabs */}
      <div className="flex border-b border-neutral-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Order Returns ({returns.length})
        </button>
        <button
          onClick={() => setActiveTab('direct')}
          className={`pb-2.5 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'direct'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Direct Policy Form Submissions ({directRequests.length})
        </button>
      </div>

      {activeTab === 'direct' ? (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer name, email, or reason..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-900"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          </div>

          <div className="bg-white border border-neutral-200 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Order Ref</th>
                  <th className="py-2.5 px-3">Claim Reason</th>
                  <th className="py-2.5 px-3">Message</th>
                  <th className="py-2.5 px-3">Email Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {directRequests
                  .filter((req) => {
                    const q = search.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      (req.name || '').toLowerCase().includes(q) ||
                      (req.email || '').toLowerCase().includes(q) ||
                      (req.order_id || '').toLowerCase().includes(q) ||
                      (req.reason || '').toLowerCase().includes(q) ||
                      (req.message || '').toLowerCase().includes(q)
                    );
                  })
                  .length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-neutral-500">
                      {search ? 'No direct return requests matching search.' : 'No direct return policy form submissions yet.'}
                    </td>
                  </tr>
                ) : (
                  directRequests
                    .filter((req) => {
                      const q = search.toLowerCase().trim();
                      if (!q) return true;
                      return (
                        (req.name || '').toLowerCase().includes(q) ||
                        (req.email || '').toLowerCase().includes(q) ||
                        (req.order_id || '').toLowerCase().includes(q) ||
                        (req.reason || '').toLowerCase().includes(q) ||
                        (req.message || '').toLowerCase().includes(q)
                      );
                    })
                    .map((req) => (
                      <tr key={req.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap text-neutral-500 font-mono text-[11px]">
                          {req.created_at
                            ? new Date(req.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-neutral-900">{req.name}</div>
                          <div className="text-neutral-500 text-[11px] font-mono">{req.email}</div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono font-semibold text-neutral-900">
                          #{req.order_id}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-neutral-800 font-medium">
                          {req.reason || 'General'}
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-neutral-600">
                          {req.message || '—'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {req.web3forms_status === 'sent' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Dispatched
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                              Recorded in DB
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-right space-x-2">
                          <a
                            href={`mailto:${req.email}?subject=Re: [OCT9] Return Request for Order #${req.order_id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded text-[11px] font-medium transition-colors"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Reply</span>
                          </a>
                          <button
                            onClick={() => handleDeleteDirect(req.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded text-[11px] font-medium transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setFilter('all')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            filter === 'all' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">All Returns</span>
          <p className="text-xl font-bold mt-1">{returns.length}</p>
        </div>

        <div
          onClick={() => setFilter('pending')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            filter === 'pending' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-neutral-200 hover:border-amber-400'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">Pending Review</span>
          <p className="text-xl font-bold mt-1">{pendingCount}</p>
        </div>

        <div
          onClick={() => setFilter('approved')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            filter === 'approved' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white border-neutral-200 hover:border-purple-400'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">Refund Approved</span>
          <p className="text-xl font-bold mt-1">{approvedCount}</p>
        </div>

        <div
          onClick={() => setFilter('exchanged')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            filter === 'exchanged' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white border-neutral-200 hover:border-emerald-400'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">Exchanged</span>
          <p className="text-xl font-bold mt-1">{exchangedCount}</p>
        </div>

        <div
          onClick={() => setFilter('rejected')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            filter === 'rejected' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-neutral-200 hover:border-red-400'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">Rejected</span>
          <p className="text-xl font-bold mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order #, customer name, or reason..."
          className="w-full text-xs pl-8 pr-3 py-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-purple-700"
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
      </div>

      {/* Returns Table */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <Loader2 className="w-8 h-8 text-purple-700 animate-spin mx-auto" />
          <p className="text-xs text-neutral-500">Loading return requests...</p>
        </div>
      ) : filteredReturns.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-sm p-12 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-neutral-900">No Return Requests Found</h3>
          <p className="text-xs text-neutral-500">All customer return requests have been processed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-neutral-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Order & Date</th>
                  <th className="p-4">Customer & City</th>
                  <th className="p-4">Return Reason & Proof</th>
                  <th className="p-4">Status & Reverse AWB</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredReturns.map((r) => {
                  const proofImgs = Array.isArray(r.return_proof_images) ? r.return_proof_images : [];
                  const isPending = r.return_status === 'return_requested';
                  const isApproved = r.return_status === 'return_approved';
                  const isRejected = r.return_status === 'return_rejected';

                  return (
                    <tr key={r.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-neutral-900 block text-sm">#{r.order_number}</span>
                        <span className="text-[10px] text-neutral-400">
                          {r.return_requested_at ? new Date(r.return_requested_at).toLocaleDateString('en-IN') : 'Recent'}
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-neutral-900">{r.customer_name}</p>
                        <span className="text-neutral-500 text-[11px]">+91 {r.customer_phone}</span>
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="font-semibold text-neutral-900 line-clamp-1">{r.return_reason}</p>
                        {r.return_description && (
                          <p className="text-neutral-500 text-[11px] line-clamp-1 mt-0.5">{r.return_description}</p>
                        )}
                        {/* Photo proof thumbnails */}
                        {proofImgs.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {proofImgs.slice(0, 3).map((img, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setActiveProofImage(img)}
                                className="w-8 h-8 rounded border border-neutral-300 overflow-hidden bg-neutral-100 hover:scale-105 transition-transform"
                              >
                                <img src={img} alt="Proof" className="w-full h-full object-cover" />
                              </button>
                            ))}
                            {proofImgs.length > 3 && (
                              <span className="text-[10px] text-neutral-500 self-center font-bold">
                                +{proofImgs.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        {isPending && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full inline-block">
                            ● Pending Approval
                          </span>
                        )}
                        {isApproved && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full inline-block">
                              ✓ Refund Approved
                            </span>
                            {r.return_awb && (
                              <span className="font-mono text-[11px] font-bold text-purple-800 block">
                                Reverse AWB: {r.return_awb}
                              </span>
                            )}
                            {r.razorpay_payment_id && (
                              <span className="text-[10px] text-emerald-700 font-medium block">
                                Razorpay Refunded
                              </span>
                            )}
                          </div>
                        )}
                        {r.return_status === 'exchanged' && (
                          <div className="space-y-0.5">
                            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full inline-block">
                              ⇄ Exchanged
                            </span>
                            {r.return_awb && (
                              <span className="font-mono text-[11px] font-bold text-emerald-800 block">
                                Reverse AWB: {r.return_awb}
                              </span>
                            )}
                            {r.return_order_id && r.return_order_id.includes('EXCH') && (
                              <span className="font-mono text-[10px] text-neutral-600 block">
                                Exch Order: {r.return_order_id}
                              </span>
                            )}
                          </div>
                        )}
                        {isRejected && (
                          <div>
                            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full inline-block">
                              ✕ Rejected
                            </span>
                            {r.return_admin_notes && (
                              <span className="text-[10px] text-neutral-500 block mt-1 line-clamp-1 italic">
                                {r.return_admin_notes}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReturn(r);
                            setActionType('approve');
                            setAdminNotes('');
                          }}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                        >
                          Review & Action
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      {/* Review Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-sm shadow-2xl border border-neutral-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/80">
              <h3 className="text-base font-serif font-bold text-neutral-900">
                Review Return Request: #{selectedReturn.order_number}
              </h3>
              <button
                onClick={() => setSelectedReturn(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Customer & Item Details */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <div>
                  <span className="text-neutral-400 uppercase text-[10px] font-bold block">Customer Details</span>
                  <p className="font-bold text-neutral-900">{selectedReturn.customer_name}</p>
                  <p className="text-neutral-600">+91 {selectedReturn.customer_phone}</p>
                  <p className="text-neutral-600">{selectedReturn.customer_email}</p>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase text-[10px] font-bold block">Order Value</span>
                  <p className="font-bold text-neutral-900 text-sm">₹{Number(selectedReturn.grand_total).toLocaleString('en-IN')}</p>
                  <p className="text-neutral-500">Original AWB: {selectedReturn.delhivery_waybill || 'N/A'}</p>
                </div>
              </div>

              {/* Shiprocket Reverse Pickup & Order Address */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                <span className="text-neutral-400 uppercase text-[10px] font-bold block">
                  Shiprocket Pickup / Exchange Address (Customer Order Address)
                </span>
                <p className="font-semibold text-neutral-900 leading-relaxed">
                  {(() => {
                    try {
                      const addr = typeof selectedReturn.shipping_address === 'string' ? JSON.parse(selectedReturn.shipping_address || '{}') : (selectedReturn.shipping_address || {});
                      return [addr.address_line1 || addr.street || addr.address, addr.address_line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ') || 'Customer Order Address';
                    } catch {
                      return String(selectedReturn.shipping_address || 'Customer Order Address');
                    }
                  })()}
                </p>
                <p className="text-[11px] text-neutral-500 pt-0.5">
                  Payment Source: <span className="font-semibold uppercase text-neutral-800">{selectedReturn.payment_method || 'Razorpay'}</span>
                  {selectedReturn.razorpay_payment_id ? ` • Payment ID: ${selectedReturn.razorpay_payment_id}` : ''}
                </p>
              </div>

              {/* Return Claim & Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Claimed Reason</span>
                <p className="p-3 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg font-bold">
                  {selectedReturn.return_reason}
                </p>
                {selectedReturn.return_description && (
                  <p className="p-3 bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-lg">
                    {selectedReturn.return_description}
                  </p>
                )}
              </div>

              {/* Photo Proof Gallery */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                  Customer Uploaded Photo Proof ({Array.isArray(selectedReturn.return_proof_images) ? selectedReturn.return_proof_images.length : 0} Images)
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {Array.isArray(selectedReturn.return_proof_images) && selectedReturn.return_proof_images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveProofImage(img)}
                      className="aspect-square rounded-lg border border-neutral-300 overflow-hidden bg-neutral-100 cursor-pointer hover:ring-2 hover:ring-purple-600 transition-all"
                    >
                      <img src={img} alt={`Proof ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Decision Toolbar */}
              <div className="pt-3 border-t border-neutral-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block">
                  Admin Action Decision
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActionType('approve')}
                    className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-center ${
                      actionType === 'approve'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-md'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-purple-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs">Approve Refund</span>
                    <span className="text-[9px] opacity-80 font-normal">Razorpay Refund + Shiprocket Reverse Pickup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('exchange')}
                    className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-center ${
                      actionType === 'exchange'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-emerald-600'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-xs">Approve Exchange</span>
                    <span className="text-[9px] opacity-80 font-normal">Reverse Pickup + Replacement Dispatch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('reject')}
                    className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-center ${
                      actionType === 'reject'
                        ? 'bg-red-600 text-white border-red-600 shadow-md'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-red-600'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs">Reject Request</span>
                    <span className="text-[9px] opacity-80 font-normal">Decline return / policy mismatch</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Internal QA Notes / Rejection Reason
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter reason for approval/rejection..."
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-purple-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setSelectedReturn(null)}
                className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 font-bold rounded-lg text-xs hover:bg-neutral-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleActionSubmit}
                disabled={actionLoading}
                className={`px-5 py-2 text-white font-bold rounded-lg text-xs shadow-md flex items-center gap-1.5 ${
                  actionType === 'approve' ? 'bg-purple-800 hover:bg-purple-900' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Execute Decision</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Proof Image Viewer */}
      {activeProofImage && (
        <div
          onClick={() => setActiveProofImage(null)}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={activeProofImage} alt="Defect Proof Full" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
            <button
              onClick={() => setActiveProofImage(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
