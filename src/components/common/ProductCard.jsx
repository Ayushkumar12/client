import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Check, Zap, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { getProductUrl } from '../../utils/productUrl.js';

function getProductSilhouetteLabel(product) {
  if (!product) return 'Designer Suit';

  const sub = (product.sub_category || '').trim();
  const title = (product.title || '').toLowerCase();
  const slug = (product.category_slug || '').toLowerCase();
  const fabric = (product.fabric || '').trim();

  // 1. High-priority silhouette matching from title & sub_category
  if (title.includes('farshi') || sub.toLowerCase().includes('farshi')) return 'Farshi Suit';
  if (title.includes('sharara') || sub.toLowerCase().includes('sharara')) return 'Sharara Suit';
  if (title.includes('anarkali') || sub.toLowerCase().includes('anarkali')) return 'Anarkali Suit';
  if (title.includes('palazzo') || sub.toLowerCase().includes('palazzo')) return 'Palazzo Suit';
  if (title.includes('pakistani') || sub.toLowerCase().includes('pakistani')) return 'Pakistani Suit';
  if (title.includes('straight') || title.includes('kurti') || sub.toLowerCase().includes('straight')) return 'Straight Suit';
  if (title.includes('mulberry') || sub.toLowerCase().includes('mulberry')) return 'Mulberry Silk Suit';
  if (title.includes('roman') || sub.toLowerCase().includes('roman')) return 'Roman Silk Suit';
  if (title.includes('cotton') || sub.toLowerCase().includes('cotton')) return 'Cotton Suit';
  if (title.includes('velvet') || sub.toLowerCase().includes('velvet')) return 'Velvet Suit';

  // Saree classifications
  if (title.includes('saree') || slug.includes('saree') || sub.toLowerCase().includes('saree')) {
    if (title.includes('banarasi') || fabric.toLowerCase().includes('banarasi')) return 'Banarasi Saree';
    if (title.includes('kanjivaram') || fabric.toLowerCase().includes('kanjivaram')) return 'Kanjivaram Saree';
    if (title.includes('organza') || fabric.toLowerCase().includes('organza')) return 'Organza Saree';
    if (title.includes('chiffon') || fabric.toLowerCase().includes('chiffon')) return 'Chiffon Saree';
    if (title.includes('silk') || fabric.toLowerCase().includes('silk')) return 'Silk Saree';
    return 'Silk Saree';
  }

  // Accessories classifications
  if (title.includes('ring') || sub.toLowerCase().includes('ring')) return 'Kundan Ring';
  if (title.includes('earring') || title.includes('chaandbaali') || title.includes('jhumka') || title.includes('kaan') || sub.toLowerCase().includes('earring')) return 'Earrings';
  if (title.includes('necklace') || title.includes('choker') || sub.toLowerCase().includes('necklace')) return 'Necklace Set';
  if (title.includes('bangle') || title.includes('kada') || sub.toLowerCase().includes('bangle')) return 'Bangles & Kadas';
  if (title.includes('potli') || title.includes('bag') || sub.toLowerCase().includes('potli')) return 'Potli Bag';
  if (title.includes('jutti') || title.includes('mojari') || slug.includes('jutti')) return 'Embroidered Jutti';

  // 2. Clean up sub_category if valid and not containing festival/wear words
  if (sub && !/holi|diwali|eid|navratri|festival|festive|party|reception|cocktail|casual|daily|wedding|wear/i.test(sub)) {
    return sub;
  }

  // 3. Fallback based on fabric or clean silhouette
  if (fabric) return `${fabric} Suit`;
  return 'Designer Suit';
}

export function ProductCard({ product, showDescription = true, showInstantBuy = true }) {
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Normalize product images
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'];

  const mainImage = images[0];
  const hoverImage = images.length > 1 ? images[1] : mainImage;
  const isWishlisted = isInWishlist(product.id);

  // Available Sizes
  const availableSizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const [selectedSize, setSelectedSize] = useState(() => availableSizes[0] || 'M');
  const [isAdded, setIsAdded] = useState(false);

  // Category Tag - Only show real silhouette/product name, never festival/wear words
  const categoryLabel = getProductSilhouetteLabel(product);

  // Description snippet
  const descriptionText = product.description || (product.fabric ? `Crafted from pure ${product.fabric} with artisan embroidery and tailored drape.` : 'Exquisite luxury ethnic design crafted for celebratory moments.');

  const hasDiscount = product.discount_percent > 0 || (product.original_price && product.original_price > product.price);
  const discountPercent = product.discount_percent || (hasDiscount ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0);

  const handleSizeClick = (sz, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(sz);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedSize, 'Standard', 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleInstantBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedSize, 'Standard', 1);
    openCart();
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white rounded-[26px] sm:rounded-[28px] overflow-hidden border border-neutral-200/90 hover:border-brand-maroon/40 shadow-2xs hover:shadow-xl transition-all duration-500 flex flex-col justify-between p-2.5 sm:p-3">
      {/* Top Image Container with Notched Tab & Inverted Curves */}
      <div className="relative aspect-[3/3.8] sm:aspect-[3/4] w-full rounded-[20px] sm:rounded-[22px] overflow-hidden bg-neutral-100">
        <Link to={getProductUrl(product)} className="block w-full h-full">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-106"
            loading="lazy"
          />

          {/* Hover Image Crossfade */}
          {hoverImage !== mainImage && (
            <img
              src={hoverImage}
              alt={product.title}
              className="w-full h-full object-cover object-top absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
              loading="lazy"
            />
          )}
        </Link>

        {/* Top-Left Inverted-Corner Notched Category Tab */}
        <div className="absolute top-0 left-0 z-20 flex items-start pointer-events-none">
          <div className="bg-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-br-[16px] sm:rounded-br-[18px] border-r border-b border-neutral-200/70 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-800">
              {categoryLabel}
            </span>
          </div>
          {/* Smooth Inverted Top-Right Fillet */}
          <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 C0,7.73 6.27,14 14,14 L0,14 L0,0 Z" />
          </svg>
        </div>

        {/* Top-Right Action Controls (Wishlist & Discount Badge) */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col items-end space-y-2">
          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleWishlistClick}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-red-500 shadow-md flex items-center justify-center transition-all cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-600'
              }`}
            />
          </button>

          {/* Discount Pill */}
          {hasDiscount && (
            <span className="bg-[#5A1827] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Card Body Details */}
      <div className="pt-3 px-1 sm:px-1.5 pb-1 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Title & Price Header Row */}
          <div className="flex items-start justify-between gap-2">
            <Link to={getProductUrl(product)} className="flex-1 min-w-0">
              <h3 className="font-serif text-sm sm:text-base font-bold text-neutral-900 line-clamp-1 hover:text-brand-maroon transition-colors">
                {product.title}
              </h3>
            </Link>

            {/* Price Pill */}
            <div className="shrink-0 bg-[#FF7A59]/15 text-[#D94F30] border border-[#FF7A59]/30 font-bold text-xs sm:text-sm px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-2xs whitespace-nowrap">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Description / Fabric Details */}
          {showDescription && (
            <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-2 leading-relaxed mt-1 font-normal">
              {descriptionText}
            </p>
          )}

          {/* Interactive Size Pill Buttons ("Tag A, Tag B, Tag C" style) */}
          <div className="mt-2.5 flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            {availableSizes.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={(e) => handleSizeClick(sz, e)}
                  className={`px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer border whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#FF7A59] text-white border-[#FF7A59] shadow-xs scale-105'
                      : 'bg-[#FAF7F2] text-neutral-700 border-neutral-300/90 hover:border-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Add to Cart (Primary Solid) + Instant Buy (Secondary Ghost) */}
        <div className="pt-2 space-y-1.5">
          {/* Add to Cart Pill Button (Primary) */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-2 sm:py-2.5 px-4 rounded-full bg-[#5A1827] hover:bg-[#43121D] active:scale-98 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                <span>Add To Cart</span>
              </>
            )}
          </button>

          {/* Instant Buy (Secondary Ghost Button - Clear Hierarchy) */}
          {showInstantBuy && (
            <button
              type="button"
              onClick={handleInstantBuy}
              className="w-full py-1.5 sm:py-2 px-4 rounded-full bg-white hover:bg-neutral-900 text-neutral-900 hover:text-white border border-neutral-300 hover:border-neutral-900 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Instant Buy</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
