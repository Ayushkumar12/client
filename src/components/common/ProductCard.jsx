import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { getProductUrl } from '../../utils/productUrl.js';
import { trackAddToCart } from '../../utils/conversionTracking.js';
import { formatImageUrl } from '../../services/api.js';

function getProductSilhouetteLabel(product) {
  if (!product) return '';
  return (product.sub_category || '').trim() || (product.category_slug ? product.category_slug.replace(/-/g, ' ') : '');
}

const FALLBACK_PRODUCT_IMAGE = '/oct9-logo.jpg';

export function ProductCard({ product, showDescription = true, showInstantBuy = true, compact = false }) {
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  // Normalize product images
  let images = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    images = product.images;
  } else if (typeof product.images === 'string' && product.images.trim().length > 0) {
    const trimmed = product.images.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) images = parsed;
      } catch (e) {
        images = [trimmed];
      }
    } else {
      images = [trimmed];
    }
  } else if (product.image) {
    images = [product.image];
  }

  if (images.length === 0) {
    images = [FALLBACK_PRODUCT_IMAGE];
  }

  const rawMainImage = images[0] || FALLBACK_PRODUCT_IMAGE;
  const rawHoverImage = images.length > 1 ? images[1] : rawMainImage;
  const mainImage = formatImageUrl(rawMainImage) || FALLBACK_PRODUCT_IMAGE;
  const hoverImage = formatImageUrl(rawHoverImage) || mainImage;
  const isWishlisted = isInWishlist(product.id);

  // Available Sizes
  const availableSizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : [];

  const [selectedSize, setSelectedSize] = useState(() => availableSizes[0] || '');
  const [isAdded, setIsAdded] = useState(false);
  const [stockLimitAlert, setStockLimitAlert] = useState(false);

  // Category Tag - Clean silhouette/product name in Title Case
  const categoryLabel = getProductSilhouetteLabel(product);

  // Description snippet
  const descriptionText = product.description || (product.short_description ? product.short_description : '');

  const hasDiscount = product.discount_percent > 0 || (product.original_price && product.original_price > product.price);
  const discountPercent = product.discount_percent || (hasDiscount ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0);

  // Stock status checks: only mark out of stock when stock is explicitly 0 or negative
  const hasExplicitStock = product.stock !== undefined && product.stock !== null;
  const stockVal = hasExplicitStock ? Number(product.stock) : null;
  const isOutOfStock = stockVal !== null ? stockVal <= 0 : false;
  const isLowStock = stockVal !== null && stockVal > 0 && stockVal <= 10;
  const stockCount = stockVal !== null ? stockVal : 1;

  const primaryColor = (Array.isArray(product.colors) && product.colors.length > 0 && product.colors[0]?.name)
    ? product.colors[0].name
    : '';

  // Check if user already holds the maximum available stock for this variant in their bag
  const inCartItem = cart?.find(
    (item) => item.product_id === product.id && item.size === selectedSize && item.color === primaryColor
  );
  const inCartQty = inCartItem ? inCartItem.quantity : 0;
  const isMaxStockInCart = stockVal !== null && stockVal > 0 && inCartQty >= stockVal;

  const handleSizeClick = (sz, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setSelectedSize(sz);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (isMaxStockInCart) {
      setStockLimitAlert(true);
      setTimeout(() => setStockLimitAlert(false), 2000);
      return;
    }
    const res = addToCart(product, selectedSize, primaryColor, 1);
    if (res && res.success === false) {
      setStockLimitAlert(true);
      setTimeout(() => setStockLimitAlert(false), 2000);
      return;
    }
    trackAddToCart(product, 1, { size: selectedSize, color: primaryColor });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleInstantBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const finalSize = selectedSize || (availableSizes.length > 0 ? availableSizes[0] : 'Free Size');
    const finalColor = primaryColor || 'Standard';

    const buyNowItem = {
      product_id: product.id,
      id: product.id,
      title: product.title,
      slug: product.slug,
      image: mainImage || '/oct9-logo.jpg',
      size: finalSize,
      color: finalColor,
      price: Number(product.price),
      original_price: Number(product.original_price || product.price),
      stock: stockVal !== null ? stockVal : 99,
      quantity: 1,
    };

    try {
      sessionStorage.setItem('oct9_buy_now_item', JSON.stringify(buyNowItem));
    } catch (err) {}

    navigate('/checkout', { state: { buyNowItem } });
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className={`group relative bg-white rounded-sm overflow-hidden border shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between p-2 sm:p-3 ${
      isOutOfStock ? 'border-neutral-300 opacity-90' : 'border-neutral-200/90 hover:border-[#5A1827]/40'
    }`}>
      {/* Top Image Container with Notched Tab */}
      <div className="relative aspect-[3/3.8] w-full rounded-sm overflow-hidden bg-neutral-100">
        <Link to={getProductUrl(product)} className="block w-full h-full" aria-label={product.title}>
          <img
            src={mainImage}
            alt={product.title}
            className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 ${
              isOutOfStock ? 'grayscale-40' : ''
            }`}
            loading="lazy"
            onError={(e) => {
              if (!e.currentTarget.dataset.retried && rawMainImage && typeof rawMainImage === 'string' && rawMainImage.startsWith('/uploads/')) {
                e.currentTarget.dataset.retried = 'true';
                e.currentTarget.src = `https://backend.oct9.in${rawMainImage}`;
                return;
              }
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
            }}
          />

          {/* Hover Image Crossfade */}
          {hoverImage !== mainImage && !isOutOfStock && (
            <img
              src={hoverImage}
              alt={product.title}
              className="w-full h-full object-cover object-top absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
              loading="lazy"
              onError={(e) => {
                if (!e.currentTarget.dataset.retried && rawHoverImage && typeof rawHoverImage === 'string' && rawHoverImage.startsWith('/uploads/')) {
                  e.currentTarget.dataset.retried = 'true';
                  e.currentTarget.src = `https://backend.oct9.in${rawHoverImage}`;
                  return;
                }
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
              }}
            />
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-2 z-20">
              <span className="bg-red-600 text-white font-bold text-[10px] sm:text-xs tracking-wider uppercase px-2.5 py-1 rounded-sm shadow-md border border-red-400">
                Out of Stock
              </span>
            </div>
          )}
        </Link>

        {/* Top-Left Notched Category Tab with legible Title Case */}
        <div className="absolute top-0 left-0 z-20 flex items-start pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-br-sm border-r border-b border-neutral-200/80 shadow-2xs">
            <span className="text-[10px] sm:text-xs font-semibold text-neutral-800 tracking-normal line-clamp-1 max-w-[110px] sm:max-w-none">
              {categoryLabel}
            </span>
          </div>
          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white/95" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M0,0 C0,7.73 6.27,14 14,14 L0,14 L0,0 Z" />
          </svg>
        </div>

        {/* Top-Right Action Controls (Wishlist & Discount / Stock Badge) */}
        <div className="absolute top-2 right-2 z-20 flex flex-col items-end space-y-1">
          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleWishlistClick}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-red-500 shadow-sm flex items-center justify-center transition-all cursor-pointer"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-600'
              }`}
            />
          </button>

          {/* Discount Tag */}
          {hasDiscount && (
            <span className="bg-[#5A1827] text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-sm shadow-2xs tracking-wide">
              {discountPercent}% OFF
            </span>
          )}

          {/* Low Stock Urgency Tag */}
          {isLowStock && (
            <span className="bg-amber-500 text-neutral-950 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-sm shadow-2xs tracking-wide border border-amber-300">
              <span>{stockCount === 1 ? 'Only 1 left in stock' : `Only ${stockCount} left`}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Body Details */}
      <div className="pt-2 px-0.5 pb-0.5 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2">
        <div>
          {/* Title & Price Header Row */}
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <Link to={getProductUrl(product)} className="flex-1 min-w-0">
              <h3 className="font-sans text-xs sm:text-sm md:text-base font-bold text-neutral-900 line-clamp-1 hover:text-[#5A1827] transition-colors leading-tight">
                {product.title}
              </h3>
            </Link>

            {/* Price Tag */}
            <div className="shrink-0 bg-amber-50 text-[#8C6339] border border-amber-200/80 font-bold text-[11px] sm:text-xs md:text-sm px-1.5 sm:px-2 py-0.5 rounded-sm shadow-2xs whitespace-nowrap">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Description Snippet (Shown on sm+ or compact) */}
          {showDescription && !compact && (
            <p className="hidden sm:block text-xs text-neutral-500 line-clamp-1 leading-relaxed mt-1 font-normal">
              {descriptionText}
            </p>
          )}

          {/* Stock Status Indicator */}
          <div className="mt-1 flex items-center justify-between text-[11px] sm:text-xs font-medium">
            {isOutOfStock ? (
              <span className="text-red-600 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" aria-hidden="true"></span>
                <span className="truncate">Out of Stock</span>
              </span>
            ) : isLowStock ? (
              <span className="text-amber-700 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block shrink-0" aria-hidden="true"></span>
                <span className="truncate">Only {stockCount} left</span>
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block shrink-0" aria-hidden="true"></span>
                <span className="truncate">In Stock</span>
              </span>
            )}
          </div>

          {/* Accessible Size Buttons (Clean rectangular boxes) */}
          {!compact && availableSizes.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {availableSizes.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={(e) => handleSizeClick(sz, e)}
                    aria-pressed={isSelected}
                    aria-label={`Size ${sz}`}
                    className={`relative min-w-[26px] sm:min-w-[32px] h-6 sm:h-7 px-1.5 rounded-sm text-[10px] sm:text-xs font-bold transition-all border flex items-center justify-center whitespace-nowrap ${
                      isOutOfStock
                        ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-[#5A1827] text-white border-[#5A1827] shadow-xs cursor-pointer'
                        : 'bg-[#FAF7F2] text-neutral-700 border-neutral-300 hover:border-neutral-600 hover:bg-neutral-100 cursor-pointer'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons: Crisp rectangular design */}
        <div className="pt-1.5 flex items-center gap-1.5">
          {/* Add to Cart Button (Primary) */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            title={isMaxStockInCart ? `Maximum available stock (${stockCount}) is in your bag` : undefined}
            className={`flex-1 h-8 sm:h-9 px-2 sm:px-3 rounded-sm text-[11px] sm:text-xs font-semibold uppercase tracking-wider flex items-center justify-center transition-all shadow-2xs box-border ${
              isOutOfStock
                ? 'w-full bg-neutral-200 text-neutral-500 cursor-not-allowed border border-neutral-300 shadow-none'
                : isMaxStockInCart
                ? 'bg-neutral-800 text-neutral-200 cursor-pointer'
                : 'bg-[#5A1827] hover:bg-[#43121D] active:scale-98 text-white hover:shadow-md cursor-pointer'
            }`}
          >
            {isOutOfStock ? (
              <span className="whitespace-nowrap">Out of Stock</span>
            ) : stockLimitAlert ? (
              <span className="whitespace-nowrap text-amber-300">Max in Bag</span>
            ) : isAdded ? (
              <span className="whitespace-nowrap">Added</span>
            ) : isMaxStockInCart ? (
              <span className="whitespace-nowrap">In Bag ({inCartQty})</span>
            ) : (
              <span className="whitespace-nowrap">Add to Cart</span>
            )}
          </button>

          {/* Instant Buy (Secondary Button) */}
          {showInstantBuy && !isOutOfStock && (
            <button
              type="button"
              onClick={handleInstantBuy}
              className="flex-1 h-8 sm:h-9 px-2 sm:px-3 rounded-sm bg-white hover:bg-neutral-900 text-neutral-900 hover:text-white border border-neutral-300 hover:border-neutral-900 text-[11px] sm:text-xs font-semibold uppercase tracking-wider flex items-center justify-center transition-all shadow-2xs hover:shadow-sm cursor-pointer whitespace-nowrap box-border"
            >
              <span>Buy Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

