import React, { useState } from 'react';
import { X, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.js';

const CANCEL_REASONS = [
  'Ordered by mistake / Duplicate order',
  'Found better price or discount elsewhere',
  'Delivery time is too long',
  'Need to change shipping address or phone number',
  'Payment or billing issue',
  'Changed my mind / No longer needed',
  'Other reasons'
];

export function CancelOrderModal({ order, isOpen, onClose, onCancelSuccess }) {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason) {
      setError('Please select a cancellation reason.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.cancelOrder(order.id || order.order_number, {
        reason: selectedReason,
        comment: comment.trim()
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onCancelSuccess) onCancelSuccess(res.order || order);
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(res.message || 'Failed to cancel order.');
      }
    } catch (err) {
      setError(err.message || 'Error cancelling order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-neutral-900">Cancel Order #{order.order_number}</h3>
              <p className="text-[11px] text-neutral-500">Order Total: ₹{Number(order.grand_total).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-neutral-900">Order Cancelled Successfully</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Your order #{order.order_number} has been cancelled. Any prepaid amount will be refunded according to your bank's policy.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {CANCEL_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedReason === r
                        ? 'border-brand-maroon bg-brand-maroon/5 font-semibold text-brand-maroon'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={r}
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="text-brand-maroon focus:ring-brand-maroon mr-2.5"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Additional Comments (Optional)
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more about why you want to cancel..."
                className="w-full text-xs p-3 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
              ⚠️ <strong>Note:</strong> Once cancelled, this order cannot be reactivated and courier dispatch will be halted.
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Keep Order
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-neutral-400 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
