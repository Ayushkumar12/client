import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { ProductCard } from '../common/ProductCard.jsx';

const FILTER_TABS = [
  { id: 'all', label: 'All New In' },
  { id: 'suits', label: 'Suits & Salwars', categoryMatch: ['suits', 'designer-suits', 'salwar-sets'] },
  { id: 'festive', label: 'Festive Wear', categoryMatch: ['festive-wear', 'party-wear'] },
  { id: 'sarees', label: 'Designer Sarees', categoryMatch: ['sarees', 'saree'] },
  { id: 'accessories', label: 'Zewar & Jutti', categoryMatch: ['accessories', 'jutti', 'juttis'] }
];

export function NewArrivalsSection({ products = [], loading = false }) {
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
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#EFE8DD]">
        <div className="space-y-1.5">
          {/* Golden Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#FAF3EA] border border-[#E5D7C2] px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest text-[#8C6339] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>JUST DROPPED • ATELIER 2026</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            New Arrivals
          </h2>

          <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-xl">
            Freshly tailored royal silhouettes, intricate zardozi embroidery, and rich artisanal drapes.
          </p>
        </div>

        {/* View All link */}
        <Link
          to="/new-arrivals"
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-brand-maroon hover:text-brand-maroon-hover group self-start md:self-auto py-1"
        >
          <span>View All 50+ New Styles</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto pt-6 pb-2 no-scrollbar">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#5A1827] text-white shadow-sm ring-2 ring-[#5A1827]/20 font-bold'
                : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="pt-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl h-80 sm:h-96 animate-pulse border border-neutral-200/80 p-3 space-y-3"
              >
                <div className="w-full h-3/4 bg-neutral-200 rounded-xl" />
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-4 bg-neutral-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 space-y-3">
            <p className="font-serif text-lg font-bold text-neutral-800">
              No new arrivals found in this category
            </p>
            <p className="text-xs text-neutral-500">
              Explore our complete catalogue for all current designs.
            </p>
            <Link
              to="/new-arrivals"
              className="inline-block px-5 py-2 bg-brand-maroon text-white text-xs font-semibold rounded-lg"
            >
              Explore Full Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA Banner Strip */}
      <div className="mt-10 sm:mt-12 rounded-2xl bg-gradient-to-r from-[#5A1827] via-[#43121D] to-[#2B0A12] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-luxury">
        <div className="space-y-1 max-w-lg">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#F6D389]">
            LIMITED EDITION RELEASES
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold">
            Looking for something extraordinary?
          </h3>
          <p className="text-xs text-rose-100/80">
            Browse through our freshest seasonal drops crafted with pure handloom fabrics.
          </p>
        </div>

        <Link
          to="/new-arrivals"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#F6D389] to-[#E5BE6C] hover:from-[#FFF0BE] hover:to-[#F6D389] text-neutral-950 text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-lg transition-transform active:scale-95 group shrink-0"
        >
          <span>EXPLORE ALL NEW ARRIVALS</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
