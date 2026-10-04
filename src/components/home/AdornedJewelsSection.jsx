import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ProductCard } from '../common/ProductCard.jsx';
import { useContent } from '../../context/ContentContext.jsx';

export function AdornedJewelsSection({ products = [], loading = false }) {
  const { getSection } = useContent();
  const sec = getSection('adorned_jewels') || {};

  const fallbackJewels = [
    {
      id: 201,
      title: 'Zeenat-e-Khaas Chaandbaali (Wine)',
      slug: 'zeenat-e-khaas-chaandbaali-wine',
      price: 1599,
      images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=85'],
      category_slug: 'accessories',
      sub_category: 'Earrings',
      sizes: ['Free Size'],
      description: 'Handcrafted wine red enamelled jhumka chaandbaali with pearl droplet tassels and gold filigree.'
    },
    {
      id: 202,
      title: 'Zeenat-e-Khaas Chaandbaali (Sea Green)',
      slug: 'zeenat-e-khaas-chaandbaali-sea-green',
      price: 1599,
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=85'],
      category_slug: 'accessories',
      sub_category: 'Earrings',
      sizes: ['Free Size'],
      description: 'Pastel Meenakari Chaandbaali earrings accented with Kundan polki stones and baroque pearls.'
    },
    {
      id: 203,
      title: 'Zareen Kaan Chain (Light Multi)',
      slug: 'zareen-kaan-chain-light-multi',
      price: 1599,
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=85'],
      category_slug: 'accessories',
      sub_category: 'Earrings',
      sizes: ['Free Size'],
      description: 'Multicolor statement ear chain with tiered micro-pearl chains, emerald stone stud, and drops.'
    },
    {
      id: 204,
      title: 'Zareen 22K Gold Kaan Chain',
      slug: 'zareen-gold-kaan-chain',
      price: 1599,
      images: ['https://images.unsplash.com/photo-1611591475155-4286fa7c2e7f?auto=format&fit=crop&w=800&q=85'],
      category_slug: 'accessories',
      sub_category: 'Earrings',
      sizes: ['Free Size'],
      description: 'Royal 22K gold finished 5-layer waterfall ear chain with jhumki drops and filigree studs.'
    }
  ];

  const displayList = (products && products.length > 0) ? products.slice(0, 4) : fallbackJewels;

  return (
    <section className="py-12 sm:py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-amber-200/80 mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-800">
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

        {/* 4-Column Product Grid using Universal ProductCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayList.map((item, idx) => (
            <ProductCard key={item.id || idx} product={item} />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-10 text-center">
          <Link
            to="/category/accessories"
            className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-brand-maroon text-white text-xs font-bold uppercase tracking-[0.16em] px-8 py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 cursor-pointer"
          >
            <span>{sec.cta_text || 'Explore Full Jewellery Collection'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
