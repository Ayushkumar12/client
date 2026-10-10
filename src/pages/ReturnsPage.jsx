import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.jsx';
import { api } from '../services/api.js';

export function ReturnsPage() {
  const { getPageContent, getBrand } = useContent();
  const page = getPageContent('returns');
  const brand = getBrand();

  const steps = page.steps || [];

  const [returnForm, setReturnForm] = useState({
    name: '',
    email: '',
    orderId: '',
    reason: 'Size Exchange',
    message: ''
  });
  const [returnSubmitted, setReturnSubmitted] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState('');

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setReturnLoading(true);
    setReturnError('');

    try {
      const data = await api.submitReturnRequest({
        name: returnForm.name,
        email: returnForm.email,
        orderId: returnForm.orderId,
        reason: returnForm.reason,
        message: returnForm.message
      });

      if (data.success) {
        setReturnSubmitted(true);
        setReturnForm({ name: '', email: '', orderId: '', reason: 'Size Exchange', message: '' });
      } else {
        setReturnError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setReturnError(err.message || 'Network error. Please check your connection and try again.');
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>{`${page.title || 'Returns & Exchanges Policy'} | ${brand.name || 'OCT9'}`}</title>
        <meta
          name="description"
          content={page.subtitle || 'Learn about OCT9 7-day doorstep returns, size exchanges, reverse pickups, and refund timelines.'}
        />
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-8 space-y-3">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
            {page.badge || 'Customer Care'}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            {page.title || 'Returns & Exchanges Policy'}
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
            {page.subtitle || 'Enjoy peace of mind with our 7-day doorstep return and size exchange guarantee.'}
          </p>
        </div>

        {/* Clean Editorial Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-neutral-200">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
              Return Window
            </span>
            <p className="text-lg font-serif font-bold text-neutral-900">
              {page.return_window || '7 Days'}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">From Date of Delivery</p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
              Reverse Pickup
            </span>
            <p className="text-lg font-serif font-bold text-neutral-900">
              Doorstep Pickup
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">Powered by Shiprocket</p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
              Size Exchanges
            </span>
            <p className="text-lg font-serif font-bold text-neutral-900">
              Free Exchange
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">Fast Replacement</p>
          </div>
        </div>

        {/* Contextual Action Callout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-xs">
          <div>
            <strong className="text-neutral-900 font-semibold block sm:inline mr-2">Need to initiate a return or exchange?</strong>
            <span className="text-neutral-600">You can start from your account or reach out to our team.</span>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <Link to="/account" className="font-semibold text-neutral-900 hover:text-brand-maroon underline">
              My Orders
            </Link>
            <span className="text-neutral-300">•</span>
            <Link to="/contact" className="font-bold text-brand-maroon hover:underline">
              Contact Support →
            </Link>
          </div>
        </div>

        {/* 4-Step Process in Clean Editorial List */}
        <div className="space-y-6">
          <h2 className="font-serif text-xl font-bold text-neutral-900">
            How Returns & Exchanges Work
          </h2>

          <div className="space-y-4">
            {steps.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-4 pb-4 border-b border-neutral-100 last:border-0">
                <span className="shrink-0 w-6 h-6 rounded-full bg-neutral-100 text-neutral-800 font-semibold text-xs flex items-center justify-center border border-neutral-200">
                  {item.step || idx + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-neutral-900">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility Details */}
        <div className="space-y-6 pt-4 border-t border-neutral-200">
          <h2 className="font-serif text-xl font-bold text-neutral-900">
            Item Eligibility & Condition
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="space-y-2">
              <span className="font-bold text-neutral-900 block text-xs uppercase tracking-wider">
                Eligible for Return
              </span>
              <p className="text-neutral-600 leading-relaxed">
                {page.eligible_items || 'Unworn, unwashed garments with original tags, designer security seals, and authentic packaging intact.'}
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-neutral-900 block text-xs uppercase tracking-wider">
                Non-Eligible Items
              </span>
              <p className="text-neutral-600 leading-relaxed">
                {page.non_eligible_items || 'Custom-tailored / altered garments, final clearance sale items, and worn footwear/juttis.'}
              </p>
            </div>
          </div>
        </div>

        {/* Refund Methods */}
        <div className="space-y-4 pt-4 border-t border-neutral-200">
          <h2 className="font-serif text-xl font-bold text-neutral-900">
            Refund Methods & Timelines
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="space-y-1">
              <strong className="font-semibold text-neutral-900 block">Prepaid Orders:</strong>
              <p className="text-neutral-600 leading-relaxed">
                {page.refund_timeline_prepaid || 'Refund credited back to original payment source within 3–5 business days.'}
              </p>
            </div>

            <div className="space-y-1">
              <strong className="font-semibold text-neutral-900 block">Cash on Delivery (COD):</strong>
              <p className="text-neutral-600 leading-relaxed">
                {page.refund_timeline_cod || 'Store credit or direct bank transfer (UPI/NEFT) initiated within 24 hours.'}
              </p>
            </div>
          </div>

          {page.cancellation_policy && (
            <p className="pt-2 text-xs text-neutral-500 leading-relaxed border-t border-neutral-100">
              <strong>Cancellation Policy:</strong> {page.cancellation_policy}
            </p>
          )}
        </div>

        {/* Return Request Form */}
        <div className="space-y-5 pt-6 border-t border-neutral-200">
          <div>
            <h2 className="font-serif text-xl font-bold text-neutral-900">Request a Return or Exchange</h2>
            <p className="text-xs text-neutral-500 mt-1">Fill in the details below and our team will process your request within 24 hours.</p>
          </div>

          {returnSubmitted ? (
            <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-lg text-center space-y-3">
              <h3 className="font-serif font-bold text-lg text-neutral-900">Request Received</h3>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                We have received your return/exchange request. Our team will reach out within 24 hours with pickup details.
              </p>
              <button
                type="button"
                onClick={() => setReturnSubmitted(false)}
                className="text-xs text-brand-maroon font-bold underline cursor-pointer hover:text-brand-maroon-hover pt-2"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={returnForm.name}
                    onChange={(e) => setReturnForm({ ...returnForm, name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={returnForm.email}
                    onChange={(e) => setReturnForm({ ...returnForm, email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Order ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OCT9-10892"
                    value={returnForm.orderId}
                    onChange={(e) => setReturnForm({ ...returnForm, orderId: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Reason
                  </label>
                  <select
                    value={returnForm.reason}
                    onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="Size Exchange">Size Exchange</option>
                    <option value="Product Defect">Product Defect</option>
                    <option value="Wrong Item Received">Wrong Item Received</option>
                    <option value="Quality Issue">Quality Issue</option>
                    <option value="Changed My Mind">Changed My Mind</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Additional Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue or provide any additional details..."
                  value={returnForm.message}
                  onChange={(e) => setReturnForm({ ...returnForm, message: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 resize-y"
                ></textarea>
              </div>

              {returnError && (
                <p className="text-xs text-red-600 font-medium">{returnError}</p>
              )}

              <button
                type="submit"
                disabled={returnLoading}
                className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                {returnLoading ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </form>
          )}
        </div>

        {/* Help Footer */}
        <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
          <span>Need help with an exchange or return?</span>
          <Link to="/contact" className="font-semibold text-brand-maroon hover:underline">
            Contact Customer Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
