import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Eye, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAdmin, showPublicRatings } = useAuth() || {};

  const [selectedColor, setSelectedColor] = useState(() => {
    if (product.colors && product.colors.length > 0) {
      return product.colors[0].name;
    }
    return 'Standard';
  });

  const [isAdded, setIsAdded] = useState(false);

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'];

  const mainImage = images[0];
  const hoverImage = images.length > 1 ? images[1] : mainImage;
  const isWishlisted = isInWishlist(product.id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'M';
    addToCart(product, defaultSize, selectedColor, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-brand-border/60 hover:border-brand-gold/50 shadow-sm hover:shadow-luxury-hover transition-all duration-300 flex flex-col">
      {/* Product Image Container */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-neutral-100">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Optional second image cross-fade on hover */}
        {hoverImage !== mainImage && (
          <img
            src={hoverImage}
            alt={product.title}
            className="w-full h-full object-cover object-top absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
            loading="lazy"
          />
        )}

        {/* Discount badge only (NEW & BESTSELLER badges removed) */}
        {product.discount_percent > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-brand-maroon/95 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-xs">
              {product.discount_percent}% OFF
            </span>
          </div>
        )}

        {/* Wishlist Heart Button top right */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-red-500 shadow-md flex items-center justify-center transition-all z-10"
          aria-label="Add to Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-600'
            }`}
          />
        </button>

        {/* Fabric Tag overlay at bottom of image */}
        {product.fabric && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-[#E8D5B5] text-[10px] px-2 py-0.5 rounded tracking-wider">
            {product.fabric}
          </div>
        )}
      </Link>

      {/* Product Content Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Subcategory / Brand Header */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
            <span className="uppercase tracking-wider truncate font-medium">
              {product.sub_category || product.category_slug}
            </span>
            {/* Rating: Hidden from users until admin allows; always visible to admin */}
            {(isAdmin || showPublicRatings) && (
              <div className="flex items-center space-x-1 text-amber-600 font-semibold text-[11px]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-neutral-400 font-normal">({product.reviews_count})</span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-sm sm:text-base font-semibold text-neutral-900 line-clamp-1 hover:text-brand-maroon transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Price Strip matching screenshots */}
          <div className="mt-1.5 flex items-baseline space-x-2 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-neutral-950">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.original_price > product.price && (
              <>
                <span className="text-xs text-neutral-400 line-through">
                  ₹{Number(product.original_price).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-brand-maroon">
                  {product.discount_percent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Color Swatches matching screenshots */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-2.5 flex items-center space-x-1.5">
              {product.colors.slice(0, 4).map((c) => (
                <button
                  key={c.name}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedColor(c.name);
                  }}
                  title={c.name}
                  className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                    selectedColor === c.name
                      ? 'scale-125 border-neutral-900 ring-1 ring-neutral-900'
                      : 'border-neutral-300 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex || '#333' }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] text-neutral-400">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Maroon "Add to Cart" Button */}
        <button
          onClick={handleQuickAdd}
          disabled={isAdded}
          className={`mt-3.5 w-full py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 shadow-sm ${
            isAdded
              ? 'bg-emerald-700 text-white'
              : 'bg-brand-maroon hover:bg-brand-maroon-hover active:scale-98 text-white'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Bag</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-brand-gold-light" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
