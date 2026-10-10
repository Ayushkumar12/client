import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.jsx';
import { api } from '../services/api.js';

export function ContactPage() {
  const { getPageContent, getBrand } = useContent();
  const page = getPageContent('contact');
  const brand = getBrand();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.submitContactForm({
        name: form.name,
        email: form.email,
        phone: form.phone,
        orderNumber: form.orderNumber,
        subject: form.subject,
        message: form.message
      });

      if (data && data.success) {
        setSubmitted(true);
        setForm({
          name: '',
          email: '',
          phone: '',
          orderNumber: '',
          subject: 'General Inquiry',
          message: ''
        });
      } else {
        setError((data && data.message) || 'Error submitting inquiry. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const phone = page.phone || brand.support_phone || '+91 98765 43210';
  const email = page.email || brand.support_email || 'support@oct9.com';
  const whatsapp = page.whatsapp || brand.whatsapp_number || '919876543210';
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>{`${page.title || 'Contact Us'} | ${brand.name || 'OCT9'}`}</title>
        <meta
          name="description"
          content={page.subtitle || 'Get in touch with OCT9 customer support for sizing assistance, order inquiries, and styling help.'}
        />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-8 space-y-3">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
            {page.badge || 'Customer Care'}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            {page.title || 'Contact Us'}
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
            {page.subtitle || 'We are here to assist you with sizing, styling advice, order tracking & inquiries.'}
          </p>
        </div>

        {/* Channels Row (Clean, subtle border-divided design) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-neutral-200">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">WhatsApp Chat</span>
            <p className="text-sm font-semibold text-neutral-900">Instant Help</p>
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=Hello%20OCT9%20Support,%20I%20have%20an%20inquiry.`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-brand-maroon font-semibold hover:underline inline-block mt-2"
            >
              Start Chat →
            </a>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">Telephone</span>
            <p className="text-sm font-semibold text-neutral-900">{phone}</p>
            <a
              href={`tel:${phone}`}
              className="text-xs text-brand-maroon font-semibold hover:underline inline-block mt-2"
            >
              Call Us →
            </a>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">Email Support</span>
            <p className="text-sm font-semibold text-neutral-900 truncate">{email}</p>
            <a
              href={`mailto:${email}`}
              className="text-xs text-brand-maroon font-semibold hover:underline inline-block mt-2"
            >
              Send Email →
            </a>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">Working Hours</span>
            <p className="text-sm font-semibold text-neutral-900">{page.hours || 'Mon – Sat: 10AM – 7:30PM'}</p>
            <p className="text-xs text-neutral-500 mt-2">Response: {page.response_time || 'Within 2 hours'}</p>
          </div>
        </div>

        {/* 2-Column: Form & Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Inquiry Form */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-neutral-900">Send an Inquiry</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Fill in the details below and our team will get back to you promptly.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-lg text-center space-y-3 animate-fadeIn">
                <h3 className="font-serif font-bold text-lg text-neutral-900">Thank You</h3>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                  Your inquiry has been received. Our support team will reply within 2 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-brand-maroon font-bold underline cursor-pointer hover:text-brand-maroon-hover pt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Order ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. OCT9-10892"
                      value={form.orderNumber}
                      onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order Status & Delivery">Order Status & Delivery</option>
                    <option value="Size Consultation & Custom Fit">Size Consultation & Custom Fit</option>
                    <option value="Return or Exchange Request">Return or Exchange Request</option>
                    <option value="Bridal / Bulk Order Consultation">Bridal / Bulk Order Consultation</option>
                    <option value="Payment / Invoice Query">Payment / Invoice Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we help you today?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 resize-y"
                  ></textarea>
                </div>

                {error && (
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>

          {/* Studio Address & Quick Links */}
          <div className="md:col-span-5 space-y-8">
            <div className="space-y-3">
              <h2 className="font-serif text-lg font-bold text-neutral-900">Studio & Head Office</h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {page.address || brand.address || 'OCT9 Flagship Studio, Fashion Hub, Shahpur Jat, New Delhi 110049'}
              </p>
              {page.custom_message && (
                <p className="text-xs text-neutral-500 italic pt-1">
                  "{page.custom_message}"
                </p>
              )}
            </div>

            <div className="space-y-3 border-t border-neutral-200 pt-6">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/track-order" className="text-neutral-600 hover:text-brand-maroon transition-colors">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link to="/shipping-policy" className="text-neutral-600 hover:text-brand-maroon transition-colors">
                    Shipping & Delivery Policy
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-neutral-600 hover:text-brand-maroon transition-colors">
                    7-Day Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link to="/size-guide" className="text-neutral-600 hover:text-brand-maroon transition-colors">
                    Size Guide & Tailoring
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-neutral-600 hover:text-brand-maroon transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
