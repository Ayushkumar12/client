import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  Tag,
  RotateCcw,
  ShieldCheck,
  Award,
  ChevronRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { HeroSlideshow } from '../components/home/HeroSlideshow.jsx';
import { JharokhaCategories } from '../components/home/JharokhaCategories.jsx';
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

      {/* 1. Dynamic Luxury Slideshow Hero Section matching screenshot */}
      <HeroSlideshow />

      {/* 2. Value Proposition Strip matching Screenshot 1 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-brand-border/80 flex items-center space-x-3 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-brand-maroon" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Free Shipping</h4>
              <p className="text-[11px] text-neutral-500">On Orders Above ₹1,999</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-brand-border/80 flex items-center space-x-3 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5 text-brand-maroon" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">15% Off Prepaid</h4>
              <p className="text-[11px] text-neutral-500">Use Code: <strong>OCT15</strong></p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-brand-border/80 flex items-center space-x-3 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-brand-maroon" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Easy Returns</h4>
              <p className="text-[11px] text-neutral-500">7 Days Return Policy</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-brand-border/80 flex items-center space-x-3 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand-maroon" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Secure Payments</h4>
              <p className="text-[11px] text-neutral-500">100% Safe via Razorpay</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-brand-border/80 col-span-2 md:col-span-1 flex items-center space-x-3 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-brand-maroon" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Premium Quality</h4>
              <p className="text-[11px] text-neutral-500">Crafted with Pure Care</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop by Silhouette - Royal Mughal Jharokha Arch Category Section matching screenshot */}
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

      {/* 5. New Arrivals Product Grid matching Screenshot 1 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              New Arrivals
            </h2>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              Fresh from our atelier, handcrafted for the season
            </p>
          </div>

          <Link
            to="/new-arrivals"
            className="flex items-center space-x-1 text-xs sm:text-sm font-semibold text-brand-maroon hover:text-brand-maroon-hover group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-xl h-80 animate-pulse border border-neutral-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

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
