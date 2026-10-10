import React, { useState } from 'react';
import { X, RotateCcw, Upload, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api.js';

const RETURN_REASONS = [
  'Damaged / Defective Garment (Torn, Stained, Broken Zippers)',
  'Wrong Item or Color Delivered',
  'Size / Fitting Issue (Too tight or loose)',
  'Quality / Fabric Not as Expected from Photos',
  'Missing Accessories / Dupatta / Trouser',
  'Arrived Late / Festive Occasion Passed',
  'Other Quality Concern'
];

export function ReturnOrderModal({ order, isOpen, onClose, onReturnSuccess }) {
  const [selectedReason, setSelectedReason] = useState(RETURN_REASONS[0]);
  const [description, setDescription] = useState('');
  const [proofImages, setProofImages] = useState([]);
  const [refundPreference, setRefundPreference] = useState('original');
  const [upiId, setUpiId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !order) return null;

  // Handle local image file upload & base64 conversion
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (proofImages.length + files.length > 4) {
      setError('You can upload up to 4 proof photos.');
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Please upload valid image files (JPG, PNG, WebP).');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setProofImages((prev) => [...prev, reader.result]);
          setError('');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setProofImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason) {
      setError('Please select a return reason.');
      return;
    }

    if (proofImages.length === 0) {
      setError('Please upload at least 1 photo as proof of the defect or product condition.');
      return;
    }

    if (refundPreference === 'upi' && !upiId.trim()) {
      setError('Please enter your valid UPI ID (e.g. mobile@upi).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        reason: selectedReason,
        description: description.trim(),
        proof_images: proofImages,
        refund_preference: refundPreference === 'upi' ? `UPI: ${upiId.trim()}` : 'Original Payment Source',
        customer_email: order.customer_email,
        customer_phone: order.customer_phone
      };

      const res = await api.requestReturn(order.id || order.order_number, payload);

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onReturnSuccess) onReturnSuccess(res);
          onClose();
          setSuccess(false);
        }, 1800);
      } else {
        setError(res.message || 'Failed to submit return request.');
      }
    } catch (err) {
      setError(err.message || 'Error submitting return request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-sm shadow-2xl border border-neutral-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/80">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-sm bg-neutral-100 text-neutral-800 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-neutral-900">Request Return / Exchange</h3>
              <p className="text-[11px] text-neutral-500">Order #{order.order_number} • ₹{Number(order.grand_total).toLocaleString('en-IN')}</p>
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
            <h4 className="text-lg font-bold text-neutral-900">Return Request Submitted</h4>
            <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
              Your return request with {proofImages.length} proof photos has been submitted for review.
              Our Quality Assurance team will approve the request and schedule a Shiprocket reverse courier pickup.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Reason Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-2">
                1. Select Return Reason <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon font-medium"
              >
                {RETURN_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* 2. Photo Proof Upload (Mandatory) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  2. Upload Photo Proof of Item / Defect <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-neutral-500">{proofImages.length}/4 Photos</span>
              </div>
              <p className="text-[11px] text-neutral-500 mb-2">
                Please attach clear photos of the defect, overall garment, and original tags attached.
              </p>

              {/* Upload Drop Area */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {proofImages.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg border border-neutral-300 overflow-hidden bg-neutral-100 group">
                    <img src={img} alt={`Proof ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {proofImages.length < 4 && (
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-brand-maroon rounded-lg cursor-pointer bg-neutral-50 hover:bg-brand-maroon/5 transition-colors text-center p-2">
                    <Upload className="w-5 h-5 text-neutral-400 group-hover:text-brand-maroon mb-1" />
                    <span className="text-[10px] font-bold text-neutral-600">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* 3. Detailed Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                3. Additional Details & Comments
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe any specifics regarding size difference, defect location, or exchange requirements..."
                className="w-full text-xs p-3 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon"
              />
            </div>

            {/* 4. Refund Preference */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                4. Refund Method Preference
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className={`p-2.5 rounded-lg border flex items-center space-x-2 cursor-pointer ${
                  refundPreference === 'original' ? 'border-brand-maroon bg-brand-maroon/5 font-semibold text-brand-maroon' : 'border-neutral-200 text-neutral-700'
                }`}>
                  <input
                    type="radio"
                    name="refund_pref"
                    checked={refundPreference === 'original'}
                    onChange={() => setRefundPreference('original')}
                    className="text-brand-maroon focus:ring-brand-maroon"
                  />
                  <span>Original Payment Method</span>
                </label>

                <label className={`p-2.5 rounded-lg border flex items-center space-x-2 cursor-pointer ${
                  refundPreference === 'upi' ? 'border-brand-maroon bg-brand-maroon/5 font-semibold text-brand-maroon' : 'border-neutral-200 text-neutral-700'
                }`}>
                  <input
                    type="radio"
                    name="refund_pref"
                    checked={refundPreference === 'upi'}
                    onChange={() => setRefundPreference('upi')}
                    className="text-brand-maroon focus:ring-brand-maroon"
                  />
                  <span>UPI Instant Refund</span>
                </label>
              </div>

              {refundPreference === 'upi' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g. yourname@oksbi)"
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon"
                  />
                </div>
              )}
            </div>

            {/* Quality Assurance Policy Banner */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-900 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <span>
                <strong>Admin Approval Workflow:</strong> Your return request will be reviewed by OCT9 QA within 24 hours. Upon acceptance, an automated <strong>Shiprocket Reverse Waybill</strong> will be generated for doorstep pickup.
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-800 hover:bg-purple-900 disabled:bg-neutral-400 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <span>Submit Return Request</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
