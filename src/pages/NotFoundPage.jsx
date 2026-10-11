import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingBag, Truck, HelpCircle } from 'lucide-react';
import { SEO } from '../components/common/SEO.jsx';

export function NotFoundPage() {
  return (
    <>
      <SEO
        title="404 - Page Not Found | OCT9"
        description="The page you requested could not be found. Explore our collections or reach out to customer care."
      />

      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-brand-cream px-4 py-20">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Header hierarchy */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-medium">
              Error 404
            </span>
            <h1 className="font-sans text-4xl md:text-5xl text-neutral-900 tracking-tight font-normal">
              Page Not Found
            </h1>
            <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              The page you are looking for may have been moved, renamed, or is temporarily unavailable.
            </p>
          </div>

          {/* Editorial divider */}
          <div className="border-b border-neutral-200 w-32 mx-auto" />

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/new-arrivals"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-neutral-900 text-white text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Explore Collections
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 border border-neutral-300 text-neutral-800 text-xs uppercase tracking-widest font-medium hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return Home
            </Link>
          </div>

          {/* Quick Help Links in clean editorial list */}
          <div className="pt-8 border-t border-neutral-200 max-w-lg mx-auto">
            <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-4 font-medium">
              Popular Destinations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <Link
                to="/track-order"
                className="py-2.5 px-3 border border-neutral-200 hover:border-neutral-400 text-neutral-800 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5 text-neutral-500" />
                Track Order
              </Link>
              <Link
                to="/faq"
                className="py-2.5 px-3 border border-neutral-200 hover:border-neutral-400 text-neutral-800 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
                Help & FAQ
              </Link>
              <Link
                to="/contact"
                className="py-2.5 px-3 border border-neutral-200 hover:border-neutral-400 text-neutral-800 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                Customer Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
