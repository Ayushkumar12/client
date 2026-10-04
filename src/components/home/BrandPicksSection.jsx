import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ProductCard } from '../common/ProductCard.jsx';
import { useContent } from '../../context/ContentContext.jsx';

export function BrandPicksSection({ products = [], loading = false }) {
  const { getSection } = useContent();
  const sec = getSection('brand_picks') || {};

  const fallbackPicks = [
    {
      id: 101,
      title: 'Olive Saaz Kurta Set',
      slug: 'olive-saaz-kurta-set',
      price: 1999,
      original_price: 1999,
      discount_percent: 0,
      images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      category_slug: 'stitched-suits',
      sub_category: 'Straight Suits',
      description: 'Handcrafted Olive Green Saaz Kurta Set with intricate detailing and pure silk drape.'
    },
    {
      id: 102,
      title: 'Gul Noor Kurta Set',
      slug: 'gul-noor-kurta-set',
      price: 1999,
      original_price: 1999,
      discount_percent: 0,
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      category_slug: 'stitched-suits',
      sub_category: 'Anarkali Suits',
      description: 'Ethereal Ivory White Gul Noor Kurta Set featuring delicate threadwork and flared silhouette.'
    },
    {
      id: 103,
      title: 'Morpankh Blue Blossom Kurta Set',
      slug: 'morpankh-blue-blossom-kurta-set',
      price: 1999,
      original_price: 2499,
      discount_percent: 20,
      images: ['https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=85'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      category_slug: 'stitched-suits',
      sub_category: 'Palazzo Suits',
      description: 'Radiant turquoise Morpankh Blue Blossom Kurta Set with hand-painted floral motifs and matching chiffon dupatta.'
    },
    {
      id: 104,
      title: 'Blooming Pink Kurta Set',
      slug: 'blooming-pink-kurta-set',
      price: 1999,
      original_price: 2499,
      discount_percent: 20,
      images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      category_slug: 'stitched-suits',
      sub_category: 'Palazzo Suits',
      description: 'Vibrant fuchsia Blooming Pink Kurta Set with zari hemline and organza scalloped border dupatta.'
    }
  ];

  const displayList = (products && products.length > 0) ? products.slice(0, 4) : fallbackPicks;

  return (
    <section className="py-12 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bespoke Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-amber-200/80 mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-800">
              {sec.badge || 'Curated Selection'}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
            {sec.title || 'The OCT9 Edit'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
            {sec.subtitle || 'Handpicked artisanal silhouettes curated for effortless elegance, sublime comfort, and timeless appeal.'}
          </p>
        </div>

        {/* Product Cards Grid using Universal ProductCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayList.map((product, idx) => (
            <ProductCard key={product.id || idx} product={product} />
          ))}
        </div>

        {/* View All Curated Edit */}
        <div className="mt-10 text-center">
          <Link
            to="/category/all?featured=true"
            className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-brand-maroon text-white text-xs font-bold uppercase tracking-[0.16em] px-8 py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 cursor-pointer"
          >
            <span>{sec.cta_text || 'Explore The Curated Edit'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
