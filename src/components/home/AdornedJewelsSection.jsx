import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Check, Sparkles, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';

export function AdornedJewelsSection({ products = [], loading = false }) {
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [addedStates, setAddedStates] = useState({});

  const fallbackJewels = [
    {
      id: 201,
      title: 'Zeenat-e-Khaas Chaandbaali (Wine)',
      slug: 'zeenat-e-khaas-chaandbaali-wine',
      price: 1599,
      images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=85'],
      category_slug: 'accessories',
      sub_category: 'Earrings'
    },
    {
      id: 202,
      title: 'Zeenat-e-Khaas Chaandbaali (Sea Green)',
      slug: 'zeenat-e-khaas-chaandbaali-sea-green',
      price: 1599,
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=85'],
      category_slug: 'accessories',
      sub_category: 'Earrings'
    },
    {
      id: 203,
      title: 'Zareen Kaan Chain (Light Multi)',
      slug: 'zareen-kaan-chain-light-multi',
      price: 1599,
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=85'],
      category_slug: 'accessories',
      sub_category: 'Earrings'
    },
    {
      id: 204,
      title: 'Zareen 22K Gold Kaan Chain',
      slug: 'zareen-gold-kaan-chain',
      price: 1599,
      images: ['https://images.unsplash.com/photo-1611591475155-4286fa7c2e7f?auto=format&fit=crop&w=800&q=85'],
      category_slug: 'accessories',
      sub_category: 'Earrings'
    }
  ];

  const displayList = (products && products.length > 0) ? products.slice(0, 4) : fallbackJewels;

  const handleAddToCart = (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(item, 'Free Size', 'Standard', 1);
    setAddedStates(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedStates(prev => ({ ...prev, [item.id]: false }));
    }, 1800);
  };

  const handleBuyNow = (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(item, 'Free Size', 'Standard', 1);
    openCart();
  };

  return (
    <section className="py-12 sm:py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-amber-200/80 mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-800">
              Jewellery Atelier
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
            Adorned to Perfection
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
            Complete your royal look with hand-selected Kundan, Meenakari, and pearl statement jewels.
          </p>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayList.map((item, idx) => {
            const isAdded = !!addedStates[item.id];
            const isWishlisted = isInWishlist(item.id);
            const imageSrc = Array.isArray(item.images) && item.images.length > 0
              ? item.images[0]
              : item.image || fallbackJewels[idx % fallbackJewels.length].images[0];

            return (
              <div
                key={item.id || idx}
                className="group relative bg-white rounded-2xl overflow-hidden border border-neutral-200/80 hover:border-brand-maroon/50 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                  <Link to={`/product/${item.slug || item.id}`}>
                    <img
                      src={imageSrc}
                      alt={item.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </Link>

                  {/* Top Handcrafted Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="bg-neutral-900/85 backdrop-blur-xs text-amber-200 text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs uppercase tracking-wider">
                      Handcrafted
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(item);
                    }}
                    className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-neutral-700 hover:text-red-500 shadow-md flex items-center justify-center transition-all z-10 cursor-pointer"
                    aria-label="Save to Wishlist"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${
                        isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-600'
                      }`}
                    />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400 mb-1">
                      {item.sub_category || 'Statement Jewellery'}
                    </div>

                    <Link to={`/product/${item.slug || item.id}`}>
                      <h3 className="font-serif text-sm font-bold text-neutral-900 line-clamp-1 hover:text-brand-maroon transition-colors">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="mt-1.5 flex items-baseline space-x-2">
                      <span className="font-bold text-neutral-950 text-base">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>
                      {item.original_price > item.price && (
                        <span className="text-neutral-400 line-through text-xs">
                          ₹{Number(item.original_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(item, e)}
                      className="w-full py-2 px-2 rounded-lg border border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50 text-neutral-800 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1 transition-all cursor-pointer shadow-2xs"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleBuyNow(item, e)}
                      className="w-full py-2 px-2 rounded-lg bg-[#5A1827] hover:bg-[#43121D] text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-2xs flex items-center justify-center"
                    >
                      Instant Buy
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="mt-10 text-center">
          <Link
            to="/category/accessories"
            className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-brand-maroon text-white text-xs font-bold uppercase tracking-[0.16em] px-8 py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 cursor-pointer"
          >
            <span>Explore Full Jewellery Collection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
