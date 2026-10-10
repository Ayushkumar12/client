import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useContent } from '../../context/ContentContext.jsx';

export function BentoMosaicSection() {
  const { getSection } = useContent();
  const bento = getSection('bento_mosaic') || {};

  const zewar = bento.zewar_card || {
    tag: 'Jewellery & Gifts',
    title: 'ZEWAR',
    subtitle: 'by OCT9',
    description: 'Handcrafted Kundan, Polki & Pearl jewellery for festive occasions.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=85',
    link: '/category/accessories',
    cta_text: 'Shop Jewellery'
  };

  const categories = bento.categories && bento.categories.length > 0
    ? bento.categories
    : [
        {
          title: 'New Arrivals',
          link: '/new-arrivals',
          image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: 'Under ₹2,500',
          link: '/category/all?max_price=2500',
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: '₹2,500 – ₹7,500',
          link: '/category/all?min_price=2500&max_price=7500',
          image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: 'Above ₹7,500',
          link: '/category/all?min_price=7500',
          image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: 'Stitched Suits',
          link: '/category/stitched-suits',
          image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: 'Royal Sarees',
          link: '/category/sarees',
          image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=85'
        }
      ];

  // Safeguard against any residual nonsense string in CMS/database
  const zewarCleanDescription = (zewar.description && !zewar.description.includes('gfhgf'))
    ? zewar.description
    : 'Handcrafted Kundan, Polki & Pearl masterpieces.';

  return (
    <section className="py-14 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-semibold">
            {bento.badge || 'Browse Collections'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            {bento.title || 'Shop by Budget & Category'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
            {bento.subtitle || 'Find the right outfit for your style and budget.'}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* 1. Left Featured Banner Card */}
          <div className="lg:col-span-4">
            <Link
              to={zewar.link || '/category/accessories'}
              className="group relative block w-full h-[380px] sm:h-[460px] lg:h-full min-h-[380px] lg:min-h-[500px] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300"
              aria-label="Shop Featured Jewellery"
            >
              <img
                src={zewar.image}
                alt={zewar.title || 'Jewellery Collection'}
                className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

              {/* Top Tag */}
              <div className="absolute top-5 left-5 z-10">
                <span className="bg-black/60 backdrop-blur-xs text-white text-xs font-medium px-3 py-1 rounded">
                  {zewar.tag || 'Jewellery & Gifts'}
                </span>
              </div>

              {/* Center Typography */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center px-6 space-y-1.5">
                <h3 className="text-3xl sm:text-4xl font-bold tracking-wide text-white">
                  {zewar.title || 'Accessories'}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-200">
                  {zewarCleanDescription}
                </p>
              </div>

              {/* Bottom CTA */}
              <div className="absolute inset-x-0 bottom-5 flex items-center justify-between px-5">
                <span className="bg-white text-neutral-900 text-xs font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 group-hover:bg-neutral-100 transition-colors">
                  <span>{zewar.cta_text || 'Shop Collection'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Right Symmetrical 6-Card Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.link || '/category/all'}
                className="group relative block h-[160px] sm:h-[240px] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300"
                aria-label={`Explore ${cat.title}`}
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-3 sm:bottom-4 px-2.5 sm:px-4 flex items-center justify-between">
                  <span className="bg-black/70 backdrop-blur-xs text-white text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 rounded flex items-center space-x-1 group-hover:bg-black/90 transition-colors truncate max-w-full">
                    <span className="truncate">{cat.title}</span>
                    <ArrowUpRight className="w-3 h-3 shrink-0" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
