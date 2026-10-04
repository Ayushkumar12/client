import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Check, Sparkles, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';

export function BrandPicksSection({ products = [], loading = false }) {
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Track user-selected size for each card
  const [selectedSizes, setSelectedSizes] = useState({});
  const [addedStates, setAddedStates] = useState({});

  // Fallback items if API is initialising
  const fallbackPicks = [
    {
      id: 101,
      title: 'Olive Saaz Kurta Set',
      slug: 'olive-saaz-kurta-set',
      price: 1999,
      original_price: 1999,
      discount_percent: 0,
      images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      category_slug: 'stitched-suits',
      sub_category: 'Straight Suits',
      is_new_arrival: true
    },
    {
      id: 102,
      title: 'Gul Noor Kurta Set',
      slug: 'gul-noor-kurta-set',
      price: 1999,
      original_price: 1999,
      discount_percent: 0,
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      category_slug: 'stitched-suits',
      sub_category: 'Anarkali Suits',
      is_new_arrival: true
    },
    {
      id: 103,
      title: 'Morpankh Blue Blossom Kurta Set',
      slug: 'morpankh-blue-blossom-kurta-set',
      price: 1999,
      original_price: 2499,
      discount_percent: 20,
      images: ['https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=85'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      category_slug: 'stitched-suits',
      sub_category: 'Palazzo Suits',
      is_new_arrival: false
    },
    {
      id: 104,
      title: 'Blooming Pink Kurta Set',
      slug: 'blooming-pink-kurta-set',
      price: 1999,
      original_price: 2499,
      discount_percent: 20,
      images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      category_slug: 'stitched-suits',
      sub_category: 'Palazzo Suits',
      is_new_arrival: false
    }
  ];

  const displayList = (products && products.length > 0) ? products.slice(0, 4) : fallbackPicks;

  const handleSizeSelect = (productId, size, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    const availableSizes = Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const size = selectedSizes[product.id] || availableSizes[0] || 'M';
    addToCart(product, size, 'Standard', 1);

    setAddedStates(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedStates(prev => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const handleBuyNow = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    const availableSizes = Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const size = selectedSizes[product.id] || availableSizes[0] || 'M';
    addToCart(product, size, 'Standard', 1);
    openCart();
  };

  return (
    <section className="py-12 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bespoke Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-amber-200/80 mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-800">
              Curated Selection
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
            The OCT9 Edit
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
            Handpicked artisanal silhouettes curated for effortless elegance, sublime comfort, and timeless appeal.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayList.map((product, idx) => {
            const isAdded = !!addedStates[product.id];
            const isWishlisted = isInWishlist(product.id);
            const availableSizes = Array.isArray(product.sizes) && product.sizes.length > 0
              ? product.sizes
              : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
            const activeSize = selectedSizes[product.id] || availableSizes[0] || 'M';

            const imageSrc = Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : product.image || fallbackPicks[idx % fallbackPicks.length].images[0];

            const hasDiscount = product.discount_percent > 0 || (product.original_price && product.original_price > product.price);
            const discountPercent = product.discount_percent || (hasDiscount ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0);

            // Badge text dynamically
            const badgeLabel = product.stock > 10 ? 'Ready To Ship' : 'Dispatch 2-3 Days';

            return (
              <div
                key={product.id || idx}
                className="group relative bg-white rounded-2xl overflow-hidden border border-neutral-200/80 hover:border-brand-maroon/50 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                  <Link to={`/product/${product.slug || product.id}`}>
                    <img
                      src={imageSrc}
                      alt={product.title}
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </Link>

                  {/* Top Floating Status Badges */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
                    {hasDiscount ? (
                      <span className="bg-brand-maroon text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs uppercase tracking-wider">
                        {discountPercent}% OFF
                      </span>
                    ) : (
                      <span className="bg-neutral-900/90 text-amber-200 text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs uppercase tracking-wider">
                        Bespoke
                      </span>
                    )}

                    <span className="bg-black/75 backdrop-blur-xs text-white text-[9px] font-medium px-2.5 py-0.5 rounded-full shadow-2xs">
                      {badgeLabel}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product);
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

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Category / Silhouette */}
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400 mb-1">
                      {product.sub_category || product.category_slug || 'Ethnic Wear'}
                    </div>

                    {/* Title */}
                    <Link to={`/product/${product.slug || product.id}`}>
                      <h3 className="font-serif text-sm font-bold text-neutral-900 line-clamp-1 hover:text-brand-maroon transition-colors">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Pricing */}
                    <div className="mt-1.5 flex items-center space-x-2 flex-wrap">
                      <span className="font-bold text-neutral-950 text-base">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </span>
                      {hasDiscount && (
                        <span className="text-neutral-400 line-through text-xs">
                          ₹{Number(product.original_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Interactive Size Pills */}
                    <div className="mt-3">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Select Size:
                      </div>
                      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                        {availableSizes.map((sz) => {
                          const isSelected = activeSize === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={(e) => handleSizeSelect(product.id, sz, e)}
                              className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-[#5A1827] text-white border-[#5A1827] shadow-2xs scale-105'
                                  : 'bg-[#FAF7F2] text-neutral-700 border-neutral-300 hover:border-neutral-700'
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
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
                      onClick={(e) => handleBuyNow(product, e)}
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

        {/* View All Curated Edit */}
        <div className="mt-10 text-center">
          <Link
            to="/category/all?featured=true"
            className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-brand-maroon text-white text-xs font-bold uppercase tracking-[0.16em] px-8 py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 cursor-pointer"
          >
            <span>Explore The Curated Edit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
