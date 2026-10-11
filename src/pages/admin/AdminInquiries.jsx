import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Search,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api.js';

export function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadInquiries = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.adminGetInquiries();
      if (res.success) {
        setInquiries(res.inquiries || []);
      } else {
        setErrorMessage(res.message || 'Failed to fetch inquiries.');
      }
    } catch (err) {
      console.error('Error loading inquiries:', err);
      setErrorMessage(err.message || 'Network error fetching inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer inquiry?')) return;
    setDeletingId(id);
    try {
      const res = await api.adminDeleteInquiry(id);
      if (res.success) {
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
        }
      } else {
        alert(res.message || 'Failed to delete inquiry.');
      }
    } catch (err) {
      alert(err.message || 'Error deleting inquiry.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredInquiries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inquiries;
    return inquiries.filter(
      (item) =>
        (item.name || '').toLowerCase().includes(q) ||
        (item.email || '').toLowerCase().includes(q) ||
        (item.subject || '').toLowerCase().includes(q) ||
        (item.message || '').toLowerCase().includes(q) ||
        (item.order_number || '').toLowerCase().includes(q) ||
        (item.phone || '').toLowerCase().includes(q)
    );
  }, [inquiries, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Customer Inquiries</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Incoming customer care inquiries submitted through the Contact Us form.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadInquiries}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-neutral-200 divide-x divide-neutral-200 bg-white">
        <div className="p-3">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Total Inquiries</span>
          <span className="text-lg font-bold text-neutral-900">{inquiries.length}</span>
        </div>
        <div className="p-3">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Email Dispatched</span>
          <span className="text-lg font-bold text-emerald-700">
            {inquiries.filter((i) => i.web3forms_status === 'sent').length}
          </span>
        </div>
        <div className="p-3">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Order Linked</span>
          <span className="text-lg font-bold text-neutral-900">
            {inquiries.filter((i) => Boolean(i.order_number)).length}
          </span>
        </div>
        <div className="p-3">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Today</span>
          <span className="text-lg font-bold text-neutral-900">
            {
              inquiries.filter((i) => {
                if (!i.created_at) return false;
                const d = new Date(i.created_at);
                const today = new Date();
                return d.toDateString() === today.toDateString();
              }).length
            }
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, email, order # or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-900 text-neutral-900"
          />
        </div>
        <div className="text-xs text-neutral-500">
          Showing {filteredInquiries.length} of {inquiries.length} inquiries
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">Subject / Order</th>
              <th className="py-2.5 px-3">Message Preview</th>
              <th className="py-2.5 px-3">Email Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-neutral-500">
                  <div className="inline-block w-4 h-4 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin mr-2 align-middle" />
                  Loading inquiries...
                </td>
              </tr>
            ) : filteredInquiries.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-neutral-500">
                  {search ? 'No inquiries matching your search.' : 'No customer inquiries recorded yet.'}
                </td>
              </tr>
            ) : (
              filteredInquiries.map((inquiry) => {
                const dateStr = inquiry.created_at
                  ? new Date(inquiry.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'N/A';

                const isSent = inquiry.web3forms_status === 'sent';
                const isSkipped = inquiry.web3forms_status === 'skipped_no_key';

                return (
                  <tr key={inquiry.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap text-neutral-500 font-mono text-[11px]">
                      {dateStr}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-neutral-900">{inquiry.name}</div>
                      <div className="text-neutral-500 text-[11px] font-mono">{inquiry.email}</div>
                      {inquiry.phone && (
                        <div className="text-neutral-400 text-[10px] font-mono">{inquiry.phone}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-medium text-neutral-900">{inquiry.subject || 'General Inquiry'}</div>
                      {inquiry.order_number && (
                        <div className="text-neutral-500 text-[11px]">
                          Order #{inquiry.order_number}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-neutral-600">
                      {inquiry.message}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {isSent ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Dispatched
                        </span>
                      ) : isSkipped ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                          Recorded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200" title={inquiry.web3forms_status}>
                          Recorded in DB
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => setSelectedInquiry(inquiry)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded text-[11px] font-medium transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDelete(inquiry.id)}
                        disabled={deletingId === inquiry.id}
                        className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded text-[11px] font-medium transition-colors disabled:opacity-50"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-300 w-full max-w-lg shadow-xl font-sans text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
              <div>
                <h3 className="font-semibold text-neutral-900 text-sm">Customer Inquiry Details</h3>
                <span className="text-[10px] text-neutral-500 font-mono">
                  ID #{selectedInquiry.id} •{' '}
                  {selectedInquiry.created_at
                    ? new Date(selectedInquiry.created_at).toLocaleString('en-IN')
                    : 'N/A'}
                </span>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-neutral-100">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Name</span>
                  <span className="text-neutral-900 font-medium">{selectedInquiry.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Email</span>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="text-neutral-900 font-medium underline hover:text-neutral-700"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Phone</span>
                  <span className="text-neutral-700">{selectedInquiry.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Order Number</span>
                  <span className="text-neutral-700">{selectedInquiry.order_number || 'None'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-0.5">Subject</span>
                <span className="text-neutral-900 font-semibold">{selectedInquiry.subject || 'General Inquiry'}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">Message</span>
                <div className="p-3 bg-neutral-50 border border-neutral-200 text-neutral-800 rounded whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="pt-2 text-[11px] text-neutral-500 space-y-0.5">
                <div>Web3Forms Status: <span className="font-mono">{selectedInquiry.web3forms_status || 'unknown'}</span></div>
                {selectedInquiry.ip_address && (
                  <div>IP Address: <span className="font-mono">{selectedInquiry.ip_address}</span></div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-neutral-50">
              <a
                href={`mailto:${selectedInquiry.email}?subject=Re: [OCT9] ${encodeURIComponent(selectedInquiry.subject || 'Customer Inquiry')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded text-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply by Email</span>
              </a>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-3 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
