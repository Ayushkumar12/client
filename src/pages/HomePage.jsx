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

  const categories = [
    { name: 'Suits', slug: 'suits', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Salwar Sets', slug: 'salwar-sets', image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=400&q=80' },
    { name: 'Festive Wear', slug: 'festive-wear', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Party Wear', slug: 'party-wear', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=400&q=80' },
    { name: 'Sarees', slug: 'sarees', image: 'https://images.unsplash.com/photo-1610030469668-9655ecbbdd13?auto=format&fit=crop&w=400&q=80' },
    { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80' },
    { name: 'Jutti', slug: 'jutti', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80' }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      <SEO
        title="OCT9 | Timeless Ethnic Elegance - Luxury Suits, Sarees & Festive Wear"
        description="Shop exclusive Indian ethnic wear, designer suits, anarkalis, sarees and festive outfits at OCT9. Enjoy Fast Express Delivery via Delhivery and 100% Secure Razorpay Checkout."
      />

      {/* 1. Hero Banner matching Screenshot 1 */}
      <section className="relative bg-[#FAF7F2] overflow-hidden border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#F7EFE5] via-[#EFE5D6] to-[#E5D7C2] border border-brand-border shadow-luxury">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-h-[480px]">
              {/* Hero Left Content */}
              <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 space-y-5">
                <div className="inline-flex items-center space-x-2 bg-brand-maroon/10 border border-brand-maroon/20 px-3 py-1 rounded-full text-brand-maroon text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>TRADITION MEETS TODAY</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-[1.15] tracking-tight">
                  Timeless <br />
                  <span className="gold-gradient-text italic font-normal">Ethnic Elegance</span>
                </h1>

                <p className="text-neutral-600 text-sm sm:text-base max-w-md leading-relaxed font-light">
                  Premium Suits, Sarees & Festive Styles for Every Occasion. Tailored with royal fabrics, intricate zardozi, and modern silhouettes.
                </p>

                <div className="pt-2 flex items-center space-x-4">
                  <Link
                    to="/new-arrivals"
                    className="inline-flex items-center space-x-2 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full shadow-lg transition-transform active:scale-95 group"
                  >
                    <span>SHOP NEW ARRIVALS</span>
                    <ArrowRight className="w-4 h-4 text-brand-gold-light group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/category/suits"
                    className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-neutral-800 hover:text-brand-maroon transition-colors py-3 px-4 border border-neutral-400/40 rounded-full bg-white/60 hover:bg-white"
                  >
                    <span>View Collection</span>
                  </Link>
                </div>
              </div>

              {/* Hero Right Image matching screenshot */}
              <div className="lg:col-span-6 relative h-full min-h-[380px] lg:min-h-[500px]">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90"
                  alt="OCT9 Luxury Indian Ethnic Elegance"
                  className="w-full h-full object-cover object-center lg:rounded-r-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white p-3 rounded-xl border border-brand-gold/40 hidden sm:flex items-center space-x-3">
                  <img src="/logo-gold.svg" alt="OCT9" className="w-8 h-8" />
                  <div>
                    <p className="text-[10px] text-brand-gold uppercase tracking-widest">Atelier Exclusive</p>
                    <p className="text-xs font-serif font-bold">Royal Zari Collection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* 3. Shop by Category (Circular Icons matching Screenshot 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
            Explore our artisanal ethnic collection
          </p>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto mt-2.5"></div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 sm:gap-6 text-center">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center space-y-2.5"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-brand-border group-hover:border-brand-maroon shadow-sm group-hover:shadow-md transition-all duration-300">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-115"
                />
              </div>
              <span className="font-medium text-xs sm:text-sm text-neutral-800 group-hover:text-brand-maroon transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

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
