import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useContent } from '../../context/ContentContext.jsx';

export function InsideBrandSection() {
  const { getSection } = useContent();
  const insideBrand = getSection('inside_brand') || {};

  const arches = insideBrand.arches && insideBrand.arches.length > 0
    ? insideBrand.arches
    : [
      {
        title: 'Stitched Suits',
        subtitle: 'Anarkali & Farshi Sets',
        badge: 'Ready-to-Wear',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=85',
        link: '/category/stitched-suits'
      },
      {
        title: 'Unstitched Suits',
        subtitle: 'Pure Mulberry & Roman Silks',
        badge: 'Unstitched Fabric',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85',
        link: '/category/unstitched-suits'
      },
      {
        title: 'Heritage Sarees',
        subtitle: 'Organza & Banarasi Weaves',
        badge: 'Festive Sarees',
        image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=700&q=85',
        link: '/category/sarees'
      }
    ];

  return (
    <section className="py-14 bg-neutral-100/70 border-y border-neutral-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Brand Story & Philosophy */}
          <div className="lg:col-span-4 space-y-3 text-center lg:text-left">
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-semibold">
              {insideBrand.badge || 'About Our Brand'}
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-tight">
              {insideBrand.title || (
                <>Welcome to <span className="text-neutral-900">OCT9</span></>
              )}
            </h2>

            <p className="text-sm text-neutral-600 font-medium">
              {insideBrand.italic_tagline || 'Everyday elegance and comfort for every occasion.'}
            </p>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md mx-auto lg:mx-0">
              {insideBrand.description || 'At OCT9, we bring you high-quality ethnic wear and contemporary clothing crafted with premium fabrics. Discover our wide range of stitched suits, unstitched sets, sarees, and accessories.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/category/all"
                className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>{insideBrand.cta_text || 'Shop All Products'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: 3 Clean Cards */}
          <div className="lg:col-span-8 grid grid-cols-3 gap-2 sm:gap-5">
            {arches.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <Link
                  to={item.link || '/category/all'}
                  className="relative w-full aspect-[3/4.2] sm:aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden bg-white border border-neutral-200 shadow-2xs hover:shadow-lg transition-all duration-300"
                  aria-label={`Explore ${item.title}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Badge top */}
                  {item.badge && (
                    <div className="absolute top-1.5 sm:top-3 left-1.5 sm:left-3">
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] sm:text-xs font-medium px-1.5 sm:px-2.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    </div>
                  )}

                  {/* Bottom Details */}
                  <div className="absolute inset-x-0 bottom-2 sm:bottom-4 px-1.5 sm:px-3 text-center space-y-0.5">
                    <h3 className="text-white text-[11px] sm:text-sm md:text-base font-bold leading-tight line-clamp-1">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="hidden sm:block text-xs text-neutral-300 truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </Link>

                <Link
                  to={item.link || '/category/all'}
                  className="mt-1.5 text-[11px] sm:text-xs font-semibold text-neutral-800 hover:text-neutral-600 transition-colors inline-flex items-center space-x-1"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
