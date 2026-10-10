import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import { ProductCard } from '../common/ProductCard.jsx';
import { useContent } from '../../context/ContentContext.jsx';

const FILTER_TABS = [
  { id: 'all', label: 'All New In' },
  { id: 'suits', label: 'Suits & Salwars', categoryMatch: ['suits', 'designer-suits', 'salwar-sets'] },
  { id: 'festive', label: 'Festive Wear', categoryMatch: ['festive-wear', 'party-wear'] },
  { id: 'sarees', label: 'Designer Sarees', categoryMatch: ['sarees', 'saree'] },
  { id: 'accessories', label: 'Zewar & Jutti', categoryMatch: ['accessories', 'jutti', 'juttis'] }
];

export function NewArrivalsSection({ products = [], loading = false }) {
  const { getSection } = useContent();
  const sec = getSection('new_arrivals') || {};

  const [activeTab, setActiveTab] = useState('all');

  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return products.slice(0, 8);
    const tabObj = FILTER_TABS.find((t) => t.id === activeTab);
    if (!tabObj || !tabObj.categoryMatch) return products.slice(0, 8);

    const matches = products.filter((p) => {
      const cat = (p.category_slug || p.category || '').toLowerCase();
      return tabObj.categoryMatch.some((m) => cat.includes(m));
    });

    return matches.length > 0 ? matches.slice(0, 8) : products.slice(0, 8);
  }, [products, activeTab]);

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10">
      {/* Section Header — compact on mobile */}
      <div className="flex items-end justify-between gap-3 pb-3 sm:pb-6 border-b border-neutral-200">
        <div className="space-y-0.5 sm:space-y-1.5 min-w-0">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-neutral-500 font-semibold">
            {sec.badge || 'Latest Collection'}
          </p>

          <h2 className="text-xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            {sec.title || 'New Arrivals'}
          </h2>

          <p className="hidden sm:block text-sm text-neutral-500 max-w-xl">
            {sec.subtitle || 'Discover the newest additions to our collection.'}
          </p>
        </div>

        {/* View All link */}
        <Link
          to="/new-arrivals"
          className="inline-flex items-center space-x-1 text-xs sm:text-sm font-semibold text-neutral-900 hover:text-neutral-600 group shrink-0"
        >
          <span className="hidden sm:inline">{sec.cta_text || 'View All New Styles'}</span>
          <span className="sm:hidden">View All</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>




      {/* Products Grid */}
      <div className="pt-3 sm:pt-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white h-64 sm:h-96 animate-pulse border border-neutral-200/80 p-3 space-y-3"
              >
                <div className="w-full h-3/4 bg-neutral-200 rounded" />
                <div className="h-3 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-8 sm:p-12 text-center border-b border-neutral-200 space-y-2">
            <p className="font-serif text-base sm:text-lg font-bold text-neutral-800">
              No new arrivals found in this category
            </p>
            <p className="text-xs text-neutral-500">
              Explore our complete catalogue for all current designs.
            </p>
            <Link
              to="/new-arrivals"
              className="inline-block px-5 py-2 bg-brand-maroon text-white text-xs font-semibold rounded-lg mt-1"
            >
              Explore Full Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
