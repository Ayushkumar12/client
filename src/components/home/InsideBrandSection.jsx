import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export function InsideBrandSection() {
  const silhouettes = [
    {
      title: 'Stitched Elegance',
      subtitle: 'Anarkali & Farshi Salwar Sets',
      badge: 'Ready-to-Wear',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=85',
      link: '/category/stitched-suits'
    },
    {
      title: 'Unstitched Couture',
      subtitle: 'Pure Mulberry & Roman Silks',
      badge: 'Custom Drape',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85',
      link: '/category/unstitched-suits'
    },
    {
      title: 'Heritage Drapes',
      subtitle: 'Organza & Banarasi Weaves',
      badge: 'Festive Luxe',
      image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=700&q=85',
      link: '/category/sarees'
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-[#FDFBF7] via-[#FAF7F2] to-[#FDFBF7] border-y border-neutral-200/70 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 h-80 bg-rose-100/30 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Brand Story & Philosophy */}
          <div className="lg:col-span-4 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-amber-300/70 shadow-2xs">
              <Sparkles className="w-3 h-3 text-brand-maroon" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-800">
                The Royal Atelier
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight leading-tight">
              Inside <span className="text-brand-maroon">OCT9</span>
            </h2>

            <p className="font-serif italic text-sm text-neutral-600 font-medium">
              Everyday elegance, redefined through master artistry.
            </p>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md mx-auto lg:mx-0">
              At OCT9, each creation honours the rich legacy of Indian handlooms. From intricate zardozi threadwork to hand-selected pure silks, we craft timeless heirlooms meant to be cherished across generations.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/category/all"
                className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-brand-maroon text-white text-xs font-bold uppercase tracking-[0.14em] px-6 py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>Explore Atelier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: 3 Architectural Jharokha Arch Silhouettes */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {silhouettes.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                {/* Arch Card Container with Mughal Pointed Radius */}
                <Link
                  to={item.link}
                  className="relative w-full aspect-[3/4.4] rounded-t-[100px] rounded-b-2xl overflow-hidden bg-white border-2 border-amber-300/60 p-1.5 shadow-sm hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1.5"
                >
                  <div className="relative w-full h-full rounded-t-[94px] rounded-b-xl overflow-hidden bg-neutral-950">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10" />

                    {/* Badge top */}
                    <div className="absolute top-4 inset-x-0 flex justify-center">
                      <span className="bg-black/50 backdrop-blur-md text-amber-200 border border-amber-300/30 text-[9px] font-bold uppercase tracking-[0.16em] px-2.5 py-0.5 rounded-full shadow-xs">
                        {item.badge}
                      </span>
                    </div>

                    {/* Bottom Details Overlay inside the Arch */}
                    <div className="absolute inset-x-0 bottom-4 text-center px-3 space-y-1">
                      <h3 className="font-serif text-white text-sm sm:text-base font-bold tracking-wide drop-shadow-md">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-neutral-300 font-light truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Refined CTA Link below each arch */}
                <Link
                  to={item.link}
                  className="mt-3.5 inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-[0.14em] text-neutral-900 group-hover:text-brand-maroon transition-colors border-b-2 border-neutral-900 group-hover:border-brand-maroon pb-0.5"
                >
                  <span>Discover Now</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
