import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useContent } from '../context/ContentContext.jsx';

export function AboutPage() {
  const { getPageContent, getBrand, getPillars } = useContent();
  const page = getPageContent('about');
  const brand = getBrand();
  const pillars = getPillars();

  const values = page.values || [];

  return (
    <div className="bg-white min-h-screen py-14 px-4 sm:px-6 lg:px-8 font-sans">
      <Helmet>
        <title>{`${page.title || 'About OCT9 Atelier'} | ${brand.name || 'OCT9'}`}</title>
        <meta
          name="description"
          content={page.subtitle || 'Learn about OCT9 heritage, master craftsmanship, and pure handloom ethnic collections.'}
        />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-16 sm:space-y-20">
        {/* Editorial Header */}
        <div className="text-center space-y-3 pb-10 border-b border-neutral-200">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-neutral-400">
            {page.badge || 'Heritage & Craft'}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-neutral-900 tracking-tight">
            {page.title || 'About OCT9 Atelier'}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            {page.subtitle || 'Crafting luxury Indian ethnic wear that celebrates hereditary weaves, timeless grace, and everyday elegance.'}
          </p>
        </div>

        {/* Brand Story Section */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-900">
              Our Story &amp; Craftsmanship
            </h2>
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              Generational artisan lineages meet modern silhouettes
            </p>
          </div>

          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-normal">
            {page.story || 'Founded with a passion for authentic Indian textiles, OCT9 blends classical artisanal artistry with modern silhouettes. Each garment is meticulously crafted by generational artisans using pure mulberry silks, hand-loomed chanderi, and intricate zardozi threadwork.'}
          </p>
        </div>

        {/* Core Values - Open Editorial Layout (No Pointy Boxes) */}
        {values.length > 0 && (
          <div className="pt-10 border-t border-neutral-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              {values.map((v, idx) => (
                <div key={idx} className="space-y-2">
                  <span className="text-xs font-mono font-semibold text-neutral-400 block tracking-widest">
                    0{idx + 1}
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-neutral-900">
                    {v.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brand Pillars - Open Row Strip (No Box Borders) */}
        <div className="py-8 border-y border-neutral-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {pillars.map((p, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="font-serif text-sm font-semibold text-neutral-900">
                  {p.title}
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {p.desc || p.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Shop CTA - Clean Generic UI (No Pointy Dark Box) */}
        <div className="text-center space-y-4 pt-4 pb-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-neutral-400">
            Ready-to-Wear &amp; Handloom
          </p>
          <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 tracking-tight">
            Experience Timeless Indian Craft
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            Explore our ready-to-wear Anarkalis, Farshi Salwar sets, handloom sarees, and artisan footwear.
          </p>
          <div className="pt-3">
            <Link
              to="/new-arrivals"
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-white text-xs font-semibold uppercase tracking-widest rounded-full transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <span>Explore New Arrivals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

