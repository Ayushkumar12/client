import React, { useState, useEffect } from 'react';
import {
  Trash2,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api.js';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';

export function AdminDatabase() {
  const [stats, setStats] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Total wipe modal state
  const [showWipeAllModal, setShowWipeAllModal] = useState(false);
  const [confirmAllText, setConfirmAllText] = useState('');
  const [preserveAdmin, setPreserveAdmin] = useState(true);
  const [resetChannels, setResetChannels] = useState(true);
  const [wipingAll, setWipingAll] = useState(false);

  // Single table wipe modal state
  const [selectedTable, setSelectedTable] = useState(null);
  const [confirmSingleText, setConfirmSingleText] = useState('');
  const [wipingSingle, setWipingSingle] = useState(false);

  // Status and feedback
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      setRefreshing(true);
      const res = await api.getDatabaseStats();
      if (res.success) {
        setStats(res.tables || []);
        setTotalRecords(res.total_records || 0);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch database telemetry.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleWipeAll = async (e) => {
    e.preventDefault();
    if (confirmAllText !== 'DELETE ALL DATA') {
      setFeedback({ type: 'error', message: 'You must type "DELETE ALL DATA" exactly to proceed.' });
      return;
    }

    try {
      setWipingAll(true);
      const res = await api.wipeDatabaseData({
        scope: 'all',
        confirmation: confirmAllText,
        preserveAdmin,
        resetDefaultChannels: resetChannels
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'All tables have been completely purged and database reset successfully.'
        });
        setShowWipeAllModal(false);
        setConfirmAllText('');
        await loadDatabaseStats();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to wipe database.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error occurred while purging database.' });
    } finally {
      setWipingAll(false);
    }
  };

  const handleWipeSingleTable = async (e) => {
    e.preventDefault();
    if (!selectedTable) return;
    const expected = `DELETE ${selectedTable.name.toUpperCase()}`;

    if (confirmSingleText !== expected) {
      setFeedback({ type: 'error', message: `You must type "${expected}" exactly to proceed.` });
      return;
    }

    try {
      setWipingSingle(true);
      const res = await api.wipeDatabaseData({
        scope: 'single',
        tableName: selectedTable.name,
        confirmation: confirmSingleText,
        preserveAdmin
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Table "${selectedTable.name}" has been cleared to 0 rows.`
        });
        setSelectedTable(null);
        setConfirmSingleText('');
        await loadDatabaseStats();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to clear table.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error occurred while clearing table.' });
    } finally {
      setWipingSingle(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Database Maintenance & Purge
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Complete database management, table row metrics, and system reset utilities.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadDatabaseStats}
            disabled={refreshing}
            className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Counts</span>
          </button>

          <button
            onClick={() => setShowWipeAllModal(true)}
            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded shadow-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All Data</span>
          </button>
        </div>
      </div>

      {/* 2. Notification / Alert Banner */}
      {feedback && (
        <div
          className={`p-3.5 text-xs rounded border flex items-start justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. System Stats Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 p-4">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Total Database Records
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {loading ? '...' : totalRecords.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Aggregated across all registered tables
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-4">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Managed SQL Tables
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {stats.length}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Foreign key cascade-safe schemas
          </div>
        </div>

        <div className="bg-white border border-red-200 bg-red-50/20 p-4">
          <div className="text-[11px] font-semibold text-red-700 uppercase tracking-wider flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Danger Zone Status</span>
          </div>
          <div className="text-sm font-semibold text-red-950 mt-1">
            Nuclear Reset Available
          </div>
          <p className="text-[11px] text-red-800/80 mt-0.5">
            Admin account protected by default
          </p>
        </div>
      </div>

      {/* 4. Total Wipe Warning Card */}
      <div className="border border-red-300 bg-red-50/30 rounded p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-red-900 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-red-700" />
            <span>Delete All Data Completely From All Tables</span>
          </div>
          <p className="text-xs text-red-800/90 max-w-3xl leading-relaxed">
            This operation truncates all database tables including <strong>Products, Orders, Order Items, Channels Listings, Inventory Audit Logs, Customer Reviews, Wishlists, Coupons, and Customer Accounts</strong>. Foreign key checks are safely bypassed during execution.
          </p>
        </div>

        <button
          onClick={() => setShowWipeAllModal(true)}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded shrink-0 shadow-xs cursor-pointer transition-colors"
        >
          Purge All Tables Now
        </button>
      </div>

      {/* 5. Database Tables Breakdown Table */}
      <div className="bg-white border border-neutral-200 rounded overflow-hidden">
        <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Database Tables & Record Counts
          </span>
          <span className="text-[11px] text-neutral-500">
            {stats.length} Tables Registered
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={8} columns={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Table Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Row Count</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {stats.map((t) => (
                  <tr key={t.name} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-neutral-900">
                      {t.name}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[10px] font-medium">
                        {t.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-600">
                      {t.label}
                      {t.extra && (
                        <span className="ml-2 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                          {t.extra}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-neutral-900">
                      {t.count.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedTable(t);
                          setConfirmSingleText('');
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-red-700 hover:text-red-900 hover:bg-red-50 border border-red-200 rounded cursor-pointer transition-colors"
                        title={`Clear all rows from ${t.name}`}
                      >
                        Clear Table
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Purge All Tables Confirmation Modal */}
      {showWipeAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded border border-neutral-300 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start space-x-3 text-red-700 pb-3 border-b border-neutral-200">
              <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Delete All Data from ALL Tables?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  This is a permanent, non-reversible action that will empty all database records.
                </p>
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 p-3 rounded text-xs space-y-2 text-neutral-700">
              <p className="font-semibold text-neutral-900">Summary of Data to be Purged:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-neutral-600">
                <li>All products, sizes, categories, and inventory listings</li>
                <li>All orders, shipments, waybills, and order line items</li>
                <li>All multi-channel sync logs (Flipkart, Amazon, Myntra)</li>
                <li>All customer reviews, wishlists, and promotional coupons</li>
                <li>All customer accounts and saved shipping addresses</li>
                <li>All contact messages and return requests</li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveAdmin}
                  onChange={(e) => setPreserveAdmin(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                />
                <span className="text-neutral-800 font-medium">
                  Preserve Administrator Accounts (Keep <code className="font-mono text-[11px]">admin@oct9.com</code>)
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetChannels}
                  onChange={(e) => setResetChannels(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                />
                <span className="text-neutral-800 font-medium">
                  Re-seed Default Marketplace Channels (Flipkart, Amazon, Myntra, Storefront)
                </span>
              </label>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-neutral-800">
                Type <span className="font-mono text-red-600 bg-red-50 px-1 py-0.5 rounded">DELETE ALL DATA</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmAllText}
                onChange={(e) => setConfirmAllText(e.target.value)}
                placeholder="DELETE ALL DATA"
                className="w-full px-3 py-2 border border-neutral-300 rounded text-xs font-mono focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => {
                  setShowWipeAllModal(false);
                  setConfirmAllText('');
                }}
                disabled={wipingAll}
                className="px-3.5 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleWipeAll}
                disabled={confirmAllText !== 'DELETE ALL DATA' || wipingAll}
                className="px-4 py-1.5 bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white rounded text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{wipingAll ? 'Purging All Tables...' : 'Confirm Delete All Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Single Table Wipe Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded border border-neutral-300 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start space-x-3 text-red-700 pb-3 border-b border-neutral-200">
              <Trash2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Clear Table: <span className="font-mono">{selectedTable.name}</span>?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Currently contains <strong>{selectedTable.count.toLocaleString('en-IN')}</strong> rows.
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600">
              All rows in <code className="font-mono text-neutral-900 font-semibold">{selectedTable.name}</code> will be deleted and its auto-increment ID reset to 1.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-neutral-800">
                Type <span className="font-mono text-red-600 bg-red-50 px-1 py-0.5 rounded">DELETE {selectedTable.name.toUpperCase()}</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmSingleText}
                onChange={(e) => setConfirmSingleText(e.target.value)}
                placeholder={`DELETE ${selectedTable.name.toUpperCase()}`}
                className="w-full px-3 py-2 border border-neutral-300 rounded text-xs font-mono focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => {
                  setSelectedTable(null);
                  setConfirmSingleText('');
                }}
                disabled={wipingSingle}
                className="px-3.5 py-1.5 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleWipeSingleTable}
                disabled={confirmSingleText !== `DELETE ${selectedTable.name.toUpperCase()}` || wipingSingle}
                className="px-4 py-1.5 bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white rounded text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{wipingSingle ? 'Clearing Table...' : 'Clear Table'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
