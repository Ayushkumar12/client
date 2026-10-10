import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ProductCard } from '../common/ProductCard.jsx';
import { useContent } from '../../context/ContentContext.jsx';

export function BrandPicksSection({ products = [], loading = false }) {
  const { getSection } = useContent();
  const sec = getSection('brand_picks') || {};

  const displayList = Array.isArray(products) ? products.slice(0, 4) : [];

  if (!loading && displayList.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-semibold">
            {sec.badge || 'Featured Picks'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            {sec.title || 'Popular Collections'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
            {sec.subtitle || 'Explore our most popular and bestselling outfits.'}
          </p>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-sm h-64 sm:h-96 animate-pulse border border-neutral-200/80 p-2 sm:p-3 space-y-2 sm:space-y-3">
                <div className="w-full h-3/4 bg-neutral-200 rounded-sm" />
                <div className="h-4 bg-neutral-200 rounded-xs w-3/4" />
                <div className="h-4 bg-neutral-200 rounded-xs w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayList.map((product, idx) => (
              <ProductCard key={product.id || idx} product={product} />
            ))}
          </div>
        )}

        {/* View All */}
        <div className="mt-10 text-center">
          <Link
            to="/category/all?featured=true"
            className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider px-8 py-3 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
          >
            <span>{sec.cta_text || 'View All Featured Items'}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
