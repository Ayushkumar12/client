import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SEO } from '../components/common/SEO.jsx';
import { HeroSlideshow } from '../components/home/HeroSlideshow.jsx';
import { JharokhaCategories } from '../components/home/JharokhaCategories.jsx';
import { NewArrivalsSection } from '../components/home/NewArrivalsSection.jsx';
import { api } from '../services/api.js';

export function HomePage() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredSuits, setFeaturedSuits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resNew, resSuits] = await Promise.all([
          api.getProducts({ new_arrival: 'true', limit: 8 }),
          api.getProducts({ category: 'suits', limit: 4 })
        ]);
        if (resNew.success) setNewArrivals(resNew.products);
        if (resSuits.success) setFeaturedSuits(resSuits.products);
      } catch (e) {
        console.error('Failed to load homepage products:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      <SEO
        title="OCT9 | Timeless Ethnic Elegance - Luxury Suits, Sarees & Festive Wear"
        description="Shop exclusive Indian ethnic wear, designer suits, anarkalis, sarees and festive outfits at OCT9. Enjoy Fast Express Delivery via Shiprocket and 100% Secure Razorpay Checkout."
      />

      {/* 1. Dynamic Luxury Slideshow Hero Section */}
      <HeroSlideshow />

      {/* 2. Shop by Silhouette - Royal Mughal Jharokha Arch Category Section */}
      <JharokhaCategories />

      {/* 4. Double Promotional Banners (Festive Collection + Wedding Edit matching Screenshot 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Festive Collection Card (Maroon Theme) */}
          <div className="relative rounded-2xl overflow-hidden bg-brand-maroon text-white p-6 sm:p-8 flex flex-col justify-between min-h-[260px] shadow-lg group">
            <div className="relative z-10 max-w-xs space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold-light">
                EXCLUSIVE ATELIER
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                Festive Collection
              </h3>
              <p className="text-xs text-neutral-200">
                Graceful outfits for your special moments & grand celebrations.
              </p>
              <div className="pt-3">
                <Link
                  to="/category/festive-wear"
                  className="inline-flex items-center space-x-1.5 bg-white text-brand-maroon hover:bg-brand-cream text-xs font-bold px-4 py-2 rounded-full transition-colors"
                >
                  <span>Shop Festive Wear</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=600&q=80"
              alt="Festive Collection"
              className="absolute right-0 top-0 bottom-0 w-1/2 object-cover object-top opacity-90 group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Wedding Edit Card (Cream / Gold Theme) */}
          <div className="relative rounded-2xl overflow-hidden bg-[#EFE5D6] text-neutral-900 p-6 sm:p-8 flex flex-col justify-between min-h-[260px] shadow-lg border border-brand-border group">
            <div className="relative z-10 max-w-xs space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-maroon">
                BRIDAL & TROUSSEAU
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                Wedding Edit
              </h3>
              <p className="text-xs text-neutral-600">
                Timeless regal looks crafted for your big celebratory moments.
              </p>
              <div className="pt-3">
                <Link
                  to="/category/designer-suits"
                  className="inline-flex items-center space-x-1.5 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
                >
                  <span>Explore Here</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
              alt="Wedding Edit"
              className="absolute right-0 top-0 bottom-0 w-1/2 object-cover object-top opacity-90 group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* 5. Dedicated New Arrivals Showcase Section with Category Filters & CTA */}
      <NewArrivalsSection products={newArrivals} loading={loading} />

      {/* 6. Secondary Double Promo Banners ("Designer Sarees" & "Complete Your Look" matching Screenshot 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Designer Sarees */}
          <div className="relative rounded-2xl overflow-hidden bg-[#2D161A] text-white p-6 sm:p-8 flex flex-col justify-between min-h-[240px] shadow-lg group">
            <div className="relative z-10 max-w-xs space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold">
                HANDLOOM & DRAPES
              </span>
              <h3 className="font-serif text-2xl font-bold">
                Designer Sarees
              </h3>
              <p className="text-xs text-neutral-300">
                Tradition with a Modern Touch. Organza, Silk & Georgette.
              </p>
              <div className="pt-2">
                <Link
                  to="/category/sarees"
                  className="inline-flex items-center space-x-1.5 bg-white text-neutral-900 hover:bg-brand-cream text-xs font-bold px-4 py-2 rounded-full transition-colors"
                >
                  <span>Explore Sarees</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1610030469668-9655ecbbdd13?auto=format&fit=crop&w=600&q=80"
              alt="Designer Sarees"
              className="absolute right-0 top-0 bottom-0 w-1/2 object-cover object-top opacity-85 group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Complete Your Look */}
          <div className="relative rounded-2xl overflow-hidden bg-[#EFE5D6] text-neutral-900 p-6 sm:p-8 flex flex-col justify-between min-h-[240px] shadow-lg border border-brand-border group">
            <div className="relative z-10 max-w-xs space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-maroon">
                STYLING ACCENTS
              </span>
              <h3 className="font-serif text-2xl font-bold">
                Complete Your Look
              </h3>
              <p className="text-xs text-neutral-600">
                Handmade Leather Juttis, Embroidered Potlis & Dupattas.
              </p>
              <div className="pt-2">
                <Link
                  to="/category/jutti"
                  className="inline-flex items-center space-x-1.5 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
                >
                  <span>Shop Juttis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
              alt="Complete Your Look"
              className="absolute right-0 top-0 bottom-0 w-1/2 object-cover object-top opacity-90 group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
