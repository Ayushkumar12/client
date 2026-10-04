import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useContent } from '../../context/ContentContext.jsx';

export function BentoMosaicSection() {
  const { getSection } = useContent();
  const bento = getSection('bento_mosaic') || {};

  const zewar = bento.zewar_card || {
    tag: 'Fine Ornaments',
    title: 'ZEWAR',
    subtitle: 'by OCT9',
    description: 'Handcrafted Kundan, Polki & Pearl masterpieces.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=85',
    link: '/category/accessories',
    cta_text: 'Shop Jewellery Atelier'
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
          title: 'Couture ₹7,500+',
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
          image: 'https://images.unsplash.com/photo-1610030469668-9655ecbbdd13?auto=format&fit=crop&w=600&q=85'
        }
      ];

  return (
    <section className="py-14 sm:py-18 bg-[#FDFBF7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-amber-200/80 mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-800">
              {bento.badge || 'Curated Destinations'}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
            {bento.title || 'Explore by Budget & Silhouette'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
            {bento.subtitle || 'Discover bespoke ethnic wear tailored for every celebratory occasion and budget tier.'}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* 1. Left Tall Hero Card: ZEWAR by OCT9 */}
          <div className="lg:col-span-4">
            <Link
              to={zewar.link || '/category/accessories'}
              className="group relative block w-full h-[380px] sm:h-[460px] lg:h-full min-h-[380px] lg:min-h-[530px] rounded-3xl overflow-hidden bg-neutral-950 border border-amber-200/60 shadow-md hover:shadow-2xl transition-all duration-500"
            >
              <img
                src={zewar.image}
                alt={zewar.title || 'Zewar Royal Jewellery'}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106 opacity-90 group-hover:opacity-100"
                loading="lazy"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

              {/* Top Atelier Badge */}
              <div className="absolute top-6 left-6 z-10">
                <span className="bg-white/15 backdrop-blur-md text-amber-200 border border-amber-300/30 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                  {zewar.tag || 'Fine Ornaments'}
                </span>
              </div>

              {/* Center Typography */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center px-6 space-y-2">
                <h3 className="font-serif text-4xl sm:text-5xl font-bold tracking-[0.18em] text-[#E8CBA3] drop-shadow-lg">
                  {zewar.title || 'ZEWAR'}
                </h3>
                <p className="font-serif italic text-xs sm:text-sm text-neutral-300 tracking-wider">
                  by <span className="text-amber-300 font-bold tracking-widest">OCT9</span>
                </p>
                <p className="text-[11px] text-neutral-300 max-w-xs mx-auto leading-relaxed pt-1">
                  {zewar.description || 'Handcrafted Kundan, Polki & Pearl masterpieces.'}
                </p>
              </div>

              {/* Bottom Interactive CTA Pill */}
              <div className="absolute inset-x-0 bottom-6 flex items-center justify-between px-6">
                <span className="bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/20 shadow-md">
                  {zewar.cta_text || 'Shop Jewellery Atelier'}
                </span>
                <span className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-amber-400 group-hover:text-black transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Right Symmetrical 6-Card Grid (2 Rows x 3 Columns) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.link || '/category/all'}
                className="group relative block h-[220px] sm:h-[245px] rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-4 px-4 flex items-center justify-between">
                  <span className="bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20 shadow-md">
                    {cat.title}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-3.5 h-3.5" />
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
