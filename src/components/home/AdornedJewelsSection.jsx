import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ProductCard } from '../common/ProductCard.jsx';
import { useContent } from '../../context/ContentContext.jsx';

export function AdornedJewelsSection({ products = [], loading = false }) {
  const { getSection } = useContent();
  const sec = getSection('adorned_jewels') || {};

  const displayList = Array.isArray(products) ? products.slice(0, 4) : [];

  if (!loading && displayList.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-amber-200/80 mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            <span className="text-xs font-bold tracking-[0.16em] uppercase text-neutral-800">
              {sec.badge || 'Jewellery Atelier'}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
            {sec.title || 'Adorned to Perfection'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
            {sec.subtitle || 'Complete your royal look with hand-selected Kundan, Meenakari, and pearl statement jewels.'}
          </p>
        </div>

        {/* 4-Column Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 sm:h-96 animate-pulse border border-neutral-200/80 p-3 space-y-3">
                <div className="w-full h-3/4 bg-neutral-200 rounded-xl" />
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-4 bg-neutral-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {displayList.map((item, idx) => (
              <ProductCard key={item.id || idx} product={item} />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-10 text-center">
          <Link
            to="/category/accessories"
            className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-brand-maroon text-white text-xs font-bold uppercase tracking-[0.16em] px-8 py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 cursor-pointer"
          >
            <span>{sec.cta_text || 'Explore Full Jewellery Collection'}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
