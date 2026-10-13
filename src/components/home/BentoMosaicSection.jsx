import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles, Tag, Layers, ArrowRight } from 'lucide-react';
import { useContent } from '../../context/ContentContext.jsx';

export function BentoMosaicSection() {
  const { getSection } = useContent();
  const bento = getSection('bento_mosaic') || {};
  const [activeTab, setActiveTab] = useState('silhouettes'); // 'silhouettes' | 'budget' | 'collections'

  // All 9 Core Silhouettes & Categories
  const allSilhouettes = [
    {
      id: 'stitched-suits',
      title: 'Stitched Suits',
      subtitle: 'Ready-to-Wear Ensembles',
      tag: 'Ready to Wear',
      link: '/category/stitched-suits',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85',
      accent: 'Farshi, Palazzo & Sharara'
    },
    {
      id: 'unstitched-suits',
      title: 'Unstitched Suits',
      subtitle: 'Pure Cotton & Silk 3-Piece',
      tag: 'Custom Fit',
      link: '/category/unstitched-suits',
      image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=85',
      accent: 'Mulberry & Roman Silk'
    },
    {
      id: 'designer-suits',
      title: 'Designer Suits',
      subtitle: 'Artisanal Hand-Embroidered',
      tag: 'Bespoke Pret',
      link: '/category/designer-suits',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
      accent: 'Zardozi & Silk Thread'
    },
    {
      id: 'sarees',
      title: 'Royal Sarees',
      subtitle: 'Heritage Drapes & Weaves',
      tag: 'Timeless Weaves',
      link: '/category/sarees',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=85',
      accent: 'Kanjivaram & Organza'
    },
    {
      id: 'salwar-sets',
      title: 'Salwar Sets',
      subtitle: 'Everyday & Festive Charm',
      tag: 'Classic Ethnic',
      link: '/category/salwar-sets',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
      accent: 'Palazzo & Salwar Kameez'
    },
    {
      id: 'festive-wear',
      title: 'Festive Wear',
      subtitle: 'Celebratory Occasion Pret',
      tag: 'Festive Special',
      link: '/category/festive-wear',
      image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=85',
      accent: 'Diwali, Weddings & Eid'
    },
    {
      id: 'party-wear',
      title: 'Party Wear',
      subtitle: 'Cocktail & Evening Silhouettes',
      tag: 'Evening Glam',
      link: '/category/party-wear',
      image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=85',
      accent: 'Sequins & Velvet Edits'
    },
    {
      id: 'accessories',
      title: 'ZEWAR Jewellery',
      subtitle: 'Handcrafted Kundan & Polki',
      tag: 'Fine Ornaments',
      link: '/category/accessories',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=85',
      accent: 'Necklace Sets, Bangles & Rings'
    },
    {
      id: 'jutti',
      title: 'Punjabi Jutti',
      subtitle: 'Artisanal Handcrafted Mojaris',
      tag: 'Heritage Footwear',
      link: '/category/jutti',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=85',
      accent: 'Embroidered & Leather'
    }
  ];

  // Curated Budget Tiers
  const budgetTiers = [
    {
      id: 'under-2500',
      title: 'Under ₹2,500',
      subtitle: 'Everyday Elegance & Pret',
      tier: 'Affordable Pret',
      description: 'Handpicked daily and light festive wear crafted with pure natural cottons, georgettes, and breezy weaves.',
      link: '/category/all?max_price=2500',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
      ctaText: 'Browse Under ₹2,500'
    },
    {
      id: 'mid-range',
      title: '₹2,500 – ₹7,500',
      subtitle: 'Festive Pret & Occasion Ready',
      tier: 'Celebratory Selection',
      description: 'Intricate zardozi threadwork, chanderi silks, handloom dupattas, and tailored suits for grand celebrations.',
      link: '/category/all?min_price=2500&max_price=7500',
      image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=85',
      ctaText: 'Explore Festive Tier'
    },
    {
      id: 'couture',
      title: 'Couture ₹7,500+',
      subtitle: 'Grand Bridal & Heirloom Luxe',
      tier: 'Masterpiece Tier',
      description: 'Opulent banarasi brocades, hand-embroidered wedding wear, pure mulberry silks, and statement heirlooms.',
      link: '/category/all?min_price=7500',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
      ctaText: 'View Luxury Couture'
    }
  ];

  // Special Curations
  const specialCurations = [
    {
      id: 'new-arrivals',
      title: 'New Arrivals',
      subtitle: 'Autumn & Festive Release',
      tag: 'Fresh In',
      description: 'The latest silhouettes fresh off the artisan looms with trending cuts and rich festive hues.',
      link: '/new-arrivals',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
      ctaText: 'Shop New In'
    },
    {
      id: 'bestsellers',
      title: 'Bestseller Collection',
      subtitle: 'Most Cherished Client Favorites',
      tag: 'Top Rated',
      description: 'Our most-adorned pieces loved for superior comfort, authentic craftsmanship, and lasting grace.',
      link: '/bestsellers',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85',
      ctaText: 'Explore Bestsellers'
    },
    {
      id: 'on-sale',
      title: 'Special Value & Sale',
      subtitle: 'Seasonal Promotional Edits',
      tag: 'Limited Savings',
      description: 'Exclusive seasonal price drops on handcrafted artisanal sets ready for immediate dispatch.',
      link: '/on-sale',
      image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=85',
      ctaText: 'View Sale Outfits'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-white relative border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Editorial Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-2">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#881337] font-semibold">
            {bento.badge || 'Curated Destinations'}
          </p>
          <h2 className="text-2xl sm:text-4xl font-serif text-neutral-900 font-medium tracking-tight">
            {bento.title || 'Explore by Budget & Silhouette'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed max-w-xl mx-auto">
            {bento.subtitle || 'Discover bespoke ethnic wear tailored for every celebratory occasion and budget tier.'}
          </p>

          {/* Minimalist Tab Navigation */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('silhouettes')}
              className={`px-3.5 sm:px-5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'silhouettes'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              All Categories ({allSilhouettes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('budget')}
              className={`px-3.5 sm:px-5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'budget'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Shop by Budget (3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('collections')}
              className={`px-3.5 sm:px-5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'collections'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Special Curations (3)
            </button>
          </div>
        </div>

        {/* Tab Content 1: All 9 Silhouettes */}
        {activeTab === 'silhouettes' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
            {allSilhouettes.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="group relative block h-[220px] sm:h-[320px] lg:h-[360px] rounded-lg overflow-hidden bg-neutral-900 border border-neutral-200 shadow-xs hover:shadow-lg transition-all duration-300"
                aria-label={`Explore ${item.title}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Subtle Luxury Gradient Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-black/90 transition-colors" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] sm:text-xs font-medium px-2.5 py-0.5 rounded">
                    {item.tag}
                  </span>
                </div>

                {/* Bottom Content Card */}
                <div className="absolute inset-x-0 bottom-3 sm:bottom-5 px-3.5 sm:px-5 space-y-1 text-white">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-200/90 block font-medium">
                    {item.accent}
                  </span>
                  <h3 className="text-base sm:text-xl font-serif font-medium tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-300 hidden sm:block line-clamp-1">
                    {item.subtitle}
                  </p>

                  <div className="pt-2 flex items-center space-x-1.5 text-xs text-white font-medium group-hover:text-amber-200 transition-colors">
                    <span>Explore Category</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Tab Content 2: Shop by Budget */}
        {activeTab === 'budget' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            {budgetTiers.map((tier) => (
              <Link
                key={tier.id}
                to={tier.link}
                className="group relative flex flex-col justify-between h-[360px] sm:h-[440px] rounded-lg overflow-hidden bg-neutral-900 border border-neutral-200 shadow-xs hover:shadow-xl transition-all duration-300 p-6 sm:p-8"
                aria-label={`Explore ${tier.title}`}
              >
                <img
                  src={tier.image}
                  alt={tier.title}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/25" />

                {/* Top Tier Tag */}
                <div className="relative z-10">
                  <span className="bg-[#881337] text-white text-[10px] sm:text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded">
                    {tier.tier}
                  </span>
                </div>

                {/* Bottom Details */}
                <div className="relative z-10 space-y-2 text-white">
                  <h3 className="text-2xl sm:text-3xl font-serif font-medium tracking-wide text-white">
                    {tier.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="pt-3">
                    <span className="inline-flex items-center space-x-2 bg-white text-neutral-900 text-xs font-semibold px-4 py-2 rounded-md shadow-sm group-hover:bg-neutral-100 transition-colors">
                      <span>{tier.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Tab Content 3: Special Curations */}
        {activeTab === 'collections' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            {specialCurations.map((cur) => (
              <Link
                key={cur.id}
                to={cur.link}
                className="group relative flex flex-col justify-between h-[360px] sm:h-[440px] rounded-lg overflow-hidden bg-neutral-900 border border-neutral-200 shadow-xs hover:shadow-xl transition-all duration-300 p-6 sm:p-8"
                aria-label={`Explore ${cur.title}`}
              >
                <img
                  src={cur.image}
                  alt={cur.title}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/25" />

                {/* Top Badge */}
                <div className="relative z-10">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] sm:text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded">
                    {cur.tag}
                  </span>
                </div>

                {/* Bottom Details */}
                <div className="relative z-10 space-y-2 text-white">
                  <h3 className="text-2xl sm:text-3xl font-serif font-medium tracking-wide text-white">
                    {cur.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                    {cur.description}
                  </p>

                  <div className="pt-3">
                    <span className="inline-flex items-center space-x-2 bg-white text-neutral-900 text-xs font-semibold px-4 py-2 rounded-md shadow-sm group-hover:bg-neutral-100 transition-colors">
                      <span>{cur.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

