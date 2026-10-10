import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext.jsx';

export function ShippingPolicyPage() {
  const { getPageContent, getBrand } = useContent();
  const page = getPageContent('shipping');
  const brand = getBrand();

  const sections = page.sections || [];

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>{`${page.title || 'Shipping & Delivery Policy'} | ${brand.name || 'OCT9'}`}</title>
        <meta
          name="description"
          content={page.subtitle || 'Learn about OCT9 shipping charges, domestic delivery timelines, real-time Shiprocket tracking, and transit insurance.'}
        />
      </Helmet>

      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-8 space-y-3">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">
            {page.badge || 'Customer Care'}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            {page.title || 'Shipping & Delivery Policy'}
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
            {page.subtitle || 'Insured express shipping across India powered by Shiprocket & premium air courier partners.'}
          </p>
        </div>

        {/* Clean Editorial Summary Strip (Non-AI clean border-divided layout) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-neutral-200">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
              Free Shipping
            </span>
            <p className="text-lg font-serif font-bold text-neutral-900">
              All Orders
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">Prepaid & COD Orders</p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
              Ready to Wear
            </span>
            <p className="text-lg font-serif font-bold text-neutral-900">
              {page.dispatch_ready || '24–48 Hrs'}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">Dispatch Window</p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
              Metro Cities
            </span>
            <p className="text-lg font-serif font-bold text-neutral-900">
              {page.delivery_metro || '2–4 Days'}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">Express Air</p>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
              Rest of India
            </span>
            <p className="text-lg font-serif font-bold text-neutral-900">
              {page.delivery_rest || '4–7 Days'}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">Standard Delivery</p>
          </div>
        </div>

        {/* Clean Contextual Order Tracking Callout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-xs">
          <div>
            <strong className="text-neutral-900 font-semibold block sm:inline mr-2">Looking for an existing shipment?</strong>
            <span className="text-neutral-600">Track real-time status with your Order ID or AWB number.</span>
          </div>
          <Link
            to="/track-order"
            className="inline-flex items-center text-brand-maroon font-bold hover:underline whitespace-nowrap"
          >
            Track Order →
          </Link>
        </div>

        {/* Detailed Policy Content */}
        <div className="space-y-8 text-neutral-800">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-neutral-900">
                {sec.title}
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                {sec.content}
              </p>
            </div>
          ))}

          {page.courier_partners && (
            <div className="pt-4 border-t border-neutral-100 text-xs text-neutral-500 space-y-1">
              <span className="font-semibold text-neutral-700 block uppercase tracking-wider text-[11px]">
                Logistics & Courier Partners
              </span>
              <p>{page.courier_partners}</p>
            </div>
          )}
        </div>

        {/* Help Footer */}
        <div className="pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
          <span>Have questions regarding your delivery or address change?</span>
          <Link to="/contact" className="font-semibold text-brand-maroon hover:underline">
            Contact Customer Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
