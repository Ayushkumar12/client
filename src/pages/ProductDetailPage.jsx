import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Share2,
  Ruler,
  AlertCircle,
  MessageSquarePlus,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Scissors,
  CheckCircle2,
  PackageCheck,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ShiprocketPincodeChecker } from '../components/common/ShiprocketPincodeChecker.jsx';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { api } from '../services/api.js';
import { decodeProductSlug, getProductUrl, encodeProductSlug } from '../utils/productUrl.js';

export function ProductDetailPage() {
  const { slug: rawParam } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAdmin, showPublicRatings } = useAuth() || {};

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Standard');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ user_name: '', rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Collapsible accordion state (matching reference image)
  const [openAccordions, setOpenAccordions] = useState({
    description: true,
    care: false,
    specifications: false,
    shipping: false,
    reviews: false
  });

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const thumbnailContainerRef = useRef(null);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const targetIdentifier = decodeProductSlug(rawParam) || rawParam;
        const res = await api.getProduct(targetIdentifier);
        if (res.success && res.product) {
          setProduct(res.product);
          if (res.product.sizes && res.product.sizes.length > 0) {
            setSelectedSize(res.product.sizes[0]);
          }
          if (res.product.colors && res.product.colors.length > 0) {
            setSelectedColor(res.product.colors[0].name);
          }

          // Obfuscate URL in address bar if not already encoded
          const encodedSlug = encodeProductSlug(res.product);
          if (rawParam !== encodedSlug && typeof window !== 'undefined') {
            window.history.replaceState(null, '', `/product/${encodedSlug}`);
          }
        }
      } catch (e) {
        console.error('Failed to load product details:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [rawParam]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF7F2]">
        <Loader2 className="w-10 h-10 text-brand-maroon animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4 bg-[#FAF7F2]">
        <h2 className="font-serif text-2xl font-bold">Product Not Found</h2>
        <p className="text-xs text-neutral-500">The product you are looking for might have been moved or is out of stock.</p>
        <Link to="/new-arrivals" className="inline-block px-6 py-2.5 bg-brand-maroon text-white text-xs font-semibold rounded-lg">
          Browse New Arrivals
        </Link>
      </div>
    );
  }

  // Multi-image gallery curation (ensuring 5-7 multi-angle views)
  const baseImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85'];

  const defaultComplementary = [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1610030469668-9655ecbbdd13?auto=format&fit=crop&w=1200&q=85'
  ];

  const images = baseImages.length >= 4
    ? baseImages
    : [...baseImages, ...defaultComplementary.slice(0, 6 - baseImages.length)];

  const isWishlisted = isInWishlist(product.id);

  const availableProductSizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Full extended sizes list to demonstrate available & out-of-stock disabled state like screenshot
  const standardSizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '5XL'];
  const allDisplaySizes = Array.from(new Set([...availableProductSizes, ...standardSizeOptions]));

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    openCart();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.user_name || !reviewForm.comment) return;

    setReviewSubmitting(true);
    try {
      const res = await api.addReview(product.id, reviewForm);
      if (res.success) {
        setReviewSuccess(true);
        setTimeout(() => {
          setShowReviewModal(false);
          setReviewSuccess(false);
          setReviewForm({ user_name: '', rating: 5, comment: '' });
          api.getProduct(product.id).then((r) => r.success && setProduct(r.product));
        }, 1200);
      }
    } catch (e) {
      alert(e.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: images,
    description: product.description || product.short_description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'OCT9'
    },
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : '',
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'OCT9 Luxury Ethnic Wear'
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 4.8,
      reviewCount: product.reviews_count || 12
    }
  };

  const hasDiscount = product.discount_percent > 0 || (product.original_price && product.original_price > product.price);
  const discountPercent = product.discount_percent || (hasDiscount ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0);

  return (
    <div className="pb-24 bg-[#FAF7F2] min-h-screen">
      <SEO
        title={`${product.title} | OCT9 Luxury Ethnic Wear`}
        description={product.short_description || product.description}
        image={images[0]}
        schemaData={productSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-neutral-500 mb-6 font-medium">
          <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.category_slug}`} className="hover:text-neutral-900 capitalize transition-colors">
            {product.category_slug ? product.category_slug.replace('-', ' ') : 'Ethnic Wear'}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-semibold truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Details Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Vertical Thumbnails Strip + Main Image Viewport (7 cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-3 sm:gap-4 items-start sticky top-24">
            {/* 1. Vertical Left Thumbnail Gallery Strip */}
            <div
              ref={thumbnailContainerRef}
              className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[660px] no-scrollbar shrink-0 w-full md:w-20 lg:w-24 py-1"
            >
              {images.map((img, idx) => {
                const isActive = selectedImage === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    onMouseEnter={() => setSelectedImage(idx)}
                    className={`relative aspect-[3/4] w-16 sm:w-18 md:w-full rounded-xl sm:rounded-2xl overflow-hidden border transition-all shrink-0 cursor-pointer bg-neutral-100 ${
                      isActive
                        ? 'border-neutral-900 ring-2 ring-neutral-900/30 shadow-md scale-102'
                        : 'border-neutral-200/90 opacity-70 hover:opacity-100 hover:border-neutral-500'
                    }`}
                    aria-label={`Product thumbnail view ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                    {isActive && (
                      <span className="absolute inset-0 bg-neutral-900/10 pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* 2. Main Big Image Canvas with Magnifier Zoom */}
            <div
              className="relative flex-1 w-full aspect-[3/3.9] sm:aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-neutral-200 shadow-sm group select-none cursor-crosshair"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={images[selectedImage]}
                alt={product.title}
                className={`w-full h-full object-cover object-top transition-transform duration-300 ${
                  isZoomed ? 'scale-150 origin-[var(--zoom-x)_var(--zoom-y)]' : 'scale-100'
                }`}
                style={{
                  '--zoom-x': `${zoomPos.x}%`,
                  '--zoom-y': `${zoomPos.y}%`
                }}
              />

              {/* Top-Right Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-neutral-700 transition-colors z-20 cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              {/* Discount Percentage Badge */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-[#5A1827] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}

              {/* Image Counter Pill */}
              <div className="absolute bottom-4 right-4 z-20">
                <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
                  {selectedImage + 1} / {images.length}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Specs, Size Selector, CTAs, Accordions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Header & Title Section */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-bold text-brand-maroon">
                  {product.sub_category || product.category_slug}
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer font-medium"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                </button>
              </div>

              {/* Large Editorial Serif Title (Matching Reference Image) */}
              <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 mt-1 tracking-tight font-normal leading-tight">
                {product.title}
              </h1>

              {/* Rating & Reviews pill if enabled */}
              {(isAdmin || showPublicRatings) && (
                <div className="flex items-center space-x-3 mt-2.5">
                  <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold text-amber-900">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-xs text-neutral-500">
                    Based on <strong>{product.reviews_count || 115}</strong> verified customer reviews
                  </span>
                </div>
              )}
            </div>

            {/* 2. Price Section (Matching Reference: Rs.1,999 + Inclusive of all taxes) */}
            <div className="space-y-1">
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900">
                  Rs.{Number(product.price).toLocaleString('en-IN')}
                </span>
                {product.original_price > product.price && (
                  <>
                    <span className="text-sm text-neutral-400 line-through">
                      Rs.{Number(product.original_price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-[#5A1827] bg-[#5A1827]/10 px-2 py-0.5 rounded-full">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-[#1F7A5E] text-xs font-medium tracking-wide">
                Inclusive of all taxes
              </p>
            </div>

            {/* 3. Real-Time Stock Availability Indicator */}
            {(() => {
              const stockCount = Number(product.stock !== undefined ? product.stock : 50);
              const isOutOfStock = stockCount <= 0;
              const isLowStock = stockCount > 0 && stockCount <= 10;

              if (isOutOfStock) {
                return (
                  <div className="p-4 bg-red-50/90 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-900 shadow-2xs">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs sm:text-sm">Currently Out of Stock</p>
                      <p className="text-[11px] text-red-700 mt-0.5">
                        This luxury piece is currently sold out. Save to your wishlist or contact customer care for bespoke restocking requests.
                      </p>
                    </div>
                  </div>
                );
              }

              if (isLowStock) {
                return (
                  <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950 flex items-center space-x-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
                        <span>⚡ Low Stock: Only <strong>{stockCount} units</strong> available!</span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">High Demand</span>
                    </div>
                    <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(15, (stockCount / 10) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200 w-fit shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>In Stock — {stockCount} units available for instant dispatch</span>
                </div>
              );
            })()}

            {/* 4. Dispatch Timeline, Color Accuracy & Ready to Ship Banner (Matching Reference) */}
            <div className="space-y-2 text-xs text-neutral-600 leading-relaxed border-t border-b border-neutral-200/80 py-3.5">
              <p>
                <strong className="text-neutral-800">Dispatch Timeline:</strong> This article is expected to be shipped in 2-4 working days.
              </p>
              <p className="text-neutral-500 text-[11px]">
                <strong className="text-neutral-700">Color Accuracy:</strong> Please note that slight color variations may occur due to photography lighting and screen calibration.
              </p>
              <div className="flex items-center space-x-2 text-neutral-900 font-bold text-sm tracking-tight pt-1">
                <Truck className="w-5 h-5 text-neutral-900 shrink-0" />
                <span>Ready to Ship</span>
              </div>
            </div>

            {/* 5. Color Selection (Our Feature Integration) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-neutral-800">Color:</span>
                  <span className="font-medium text-brand-maroon">{selectedColor}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                        selectedColor === c.name
                          ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900 font-bold'
                          : 'border-neutral-200 bg-white hover:border-neutral-400'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-neutral-300" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Size Selector (Matching Reference: Oval pills, S M L XXL active, XL 3XL 5XL disabled) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-800 tracking-wide">Size</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {allDisplaySizes.map((sz) => {
                  const stockNum = Number(product.stock !== undefined ? product.stock : 50);
                  const isAvailable = availableProductSizes.includes(sz) && stockNum > 0;
                  const isSelected = selectedSize === sz;

                  if (!isAvailable) {
                    return (
                      <button
                        key={sz}
                        type="button"
                        disabled
                        title="Out of Stock in this size"
                        className="min-w-[50px] px-4 py-2 rounded-full border border-neutral-200 bg-neutral-50/60 text-neutral-300 text-xs font-medium line-through cursor-not-allowed select-none"
                      >
                        {sz}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[50px] px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                          : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-800'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {/* Tape measure Size Chart Link */}
              <button
                type="button"
                onClick={() => setShowSizeGuide(true)}
                className="flex items-center space-x-1.5 text-xs text-neutral-800 hover:text-black font-medium underline underline-offset-4 cursor-pointer pt-1"
              >
                <Ruler className="w-4 h-4" />
                <span>Size Chart</span>
              </button>
            </div>

            {/* 7. Quantity Stepper */}
            {(() => {
              const stockNum = Number(product.stock !== undefined ? product.stock : 50);
              const isOut = stockNum <= 0;

              return (
                <div className="flex items-center space-x-4 pt-1">
                  <span className="text-xs font-bold text-neutral-800">Quantity:</span>
                  <div className="flex items-center border border-neutral-300 rounded-full bg-white overflow-hidden shadow-2xs">
                    <button
                      disabled={isOut || quantity <= 1}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="px-4 text-xs font-bold text-neutral-900 min-w-[28px] text-center">{isOut ? 0 : quantity}</span>
                    <button
                      disabled={isOut || quantity >= stockNum}
                      onClick={() => setQuantity(Math.min(stockNum, quantity + 1))}
                      className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <span className={`text-xs font-medium ${isOut ? 'text-red-600' : 'text-emerald-700'}`}>
                    {isOut ? '❌ Item Sold Out' : '✓ Ready for immediate dispatch'}
                  </span>
                </div>
              );
            })()}

            {/* 8. Action Buttons (Matching Reference: White ADD TO CART + Black BUY NOW pills) */}
            {(() => {
              const stockNum = Number(product.stock !== undefined ? product.stock : 50);
              const isOut = stockNum <= 0;

              if (isOut) {
                return (
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled
                      className="w-full py-3.5 px-6 rounded-full border border-neutral-300 bg-neutral-200 text-neutral-500 font-bold text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>OUT OF STOCK / SOLD OUT</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-3.5 px-6 rounded-full border border-neutral-900 bg-white hover:bg-neutral-900 text-neutral-900 hover:text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-2xs hover:shadow-md cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>ADD TO CART</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full py-3.5 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>BUY NOW</span>
                  </button>
                </div>
              );
            })()}

            {/* 8. Accordion Sections (Matching Reference: DESCRIPTION, PRODUCT CARE, SPECIFICATIONS, SHIPPING & RETURNS) */}
            <div className="border-t border-neutral-300/80 divide-y divide-neutral-200/90 pt-1">
              {/* Accordion 1: DESCRIPTION */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('description')}
                  className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
                >
                  <span>DESCRIPTION</span>
                  {openAccordions.description ? (
                    <ChevronUp className="w-4 h-4 text-neutral-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-600" />
                  )}
                </button>
                {openAccordions.description && (
                  <div className="mt-3 text-xs text-neutral-600 leading-relaxed space-y-2.5 animate-fadeIn">
                    <p>{product.description}</p>
                    {product.short_description && product.short_description !== product.description && (
                      <p className="text-neutral-500">{product.short_description}</p>
                    )}
                    <ul className="list-disc list-inside space-y-1 text-neutral-600 pt-1">
                      <li>Artisan handcrafted silhouette with heritage embroidery techniques.</li>
                      <li>Includes matching luxury dupatta and tailored bottom trousers/sharara.</li>
                      <li>Breathable inner mulmul lining for supreme festive comfort.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 2: PRODUCT CARE */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('care')}
                  className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
                >
                  <span>PRODUCT CARE</span>
                  {openAccordions.care ? (
                    <ChevronUp className="w-4 h-4 text-neutral-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-600" />
                  )}
                </button>
                {openAccordions.care && (
                  <div className="mt-3 text-xs text-neutral-600 leading-relaxed space-y-2 animate-fadeIn">
                    <p>To maintain the sheen, intricate zari work, and delicate weaves of this luxury garment:</p>
                    <ul className="list-disc list-inside space-y-1 text-neutral-600">
                      <li><strong>Dry Clean Only:</strong> We recommend professional dry clean for best longevity.</li>
                      <li><strong>Storage:</strong> Store wrapped in pure breathable muslin or cotton cloth.</li>
                      <li><strong>Ironing:</strong> Steam iron on reverse at low-to-medium heat; avoid direct contact on zari.</li>
                      <li><strong>Perfumes:</strong> Avoid spraying perfumes or deodorants directly onto embroidery or fabric.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 3: SPECIFICATIONS */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('specifications')}
                  className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
                >
                  <span>SPECIFICATIONS</span>
                  {openAccordions.specifications ? (
                    <ChevronUp className="w-4 h-4 text-neutral-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-600" />
                  )}
                </button>
                {openAccordions.specifications && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-700 animate-fadeIn bg-white p-4 rounded-xl border border-neutral-200/70">
                    <div><strong className="text-neutral-900">Fabric:</strong> {product.fabric || 'Pure Georgette & Silk'}</div>
                    <div><strong className="text-neutral-900">Occasion:</strong> {product.occasion || 'Wedding, Festive, Reception'}</div>
                    <div><strong className="text-neutral-900">SKU:</strong> {product.sku || 'OCT9-LUX-2026'}</div>
                    <div><strong className="text-neutral-900">Work Type:</strong> Hand Zardozi, Tilla & Sequins</div>
                    <div><strong className="text-neutral-900">Neckline:</strong> Sweetheart / V-Notch Neck</div>
                    <div><strong className="text-neutral-900">Sleeve Length:</strong> Elbow / Full Sleeves</div>
                  </div>
                )}
              </div>

              {/* Accordion 4: SHIPPING, PINCODE CHECKER & RETURNS */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
                >
                  <span>SHIPPING & DELIVERY</span>
                  {openAccordions.shipping ? (
                    <ChevronUp className="w-4 h-4 text-neutral-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-600" />
                  )}
                </button>
                {openAccordions.shipping && (
                  <div className="mt-3 space-y-3 animate-fadeIn">
                    <ShiprocketPincodeChecker />
                    <div className="text-xs text-neutral-600 space-y-1.5 pt-1">
                      <p>• <strong>Free Air Shipping:</strong> Complimentary across India on orders above ₹1,999.</p>
                      <p>• <strong>7-Day Easy Returns:</strong> Hassle-free exchanges or doorstep pickup.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 5: VERIFIED CUSTOMER REVIEWS */}
              {(isAdmin || showPublicRatings) && (
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('reviews')}
                    className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
                  >
                    <span>CUSTOMER REVIEWS ({product.reviews_count || 12})</span>
                    {openAccordions.reviews ? (
                      <ChevronUp className="w-4 h-4 text-neutral-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-600" />
                    )}
                  </button>
                  {openAccordions.reviews && (
                    <div className="mt-3 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif text-2xl font-bold">{product.rating}</span>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="text-xs font-bold text-brand-maroon hover:underline cursor-pointer"
                        >
                          Write a Review
                        </button>
                      </div>

                      {product.reviews && product.reviews.length > 0 ? (
                        <div className="space-y-2.5">
                          {product.reviews.map((rev) => (
                            <div key={rev.id} className="p-3 bg-white rounded-xl border border-neutral-200/80 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-neutral-900">{rev.user_name}</span>
                                <div className="flex text-amber-400">
                                  {[...Array(rev.rating || 5)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-neutral-600">{rev.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-500 italic">No reviews yet. Be the first to review this outfit!</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Trust Features Badge Strip */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-200/70 text-center">
              <div className="p-2.5 bg-white rounded-xl border border-neutral-200/70 flex flex-col items-center">
                <Truck className="w-4 h-4 text-neutral-800 mb-1" />
                <span className="text-[10px] font-bold text-neutral-800">Express Delivery</span>
                <span className="text-[9px] text-neutral-500">2-4 Days Pan-India</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-neutral-200/70 flex flex-col items-center">
                <RotateCcw className="w-4 h-4 text-neutral-800 mb-1" />
                <span className="text-[10px] font-bold text-neutral-800">7 Days Returns</span>
                <span className="text-[9px] text-neutral-500">Hassle-free pickup</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-neutral-200/70 flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-neutral-800 mb-1" />
                <span className="text-[10px] font-bold text-neutral-800">100% Authentic</span>
                <span className="text-[9px] text-neutral-500">Pure Artisan Weaves</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {product.related && product.related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-neutral-200">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {product.related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <Ruler className="w-5 h-5 text-neutral-900" />
                <h3 className="font-serif font-bold text-base text-neutral-900">Ethnic Wear Size Chart (Inches)</h3>
              </div>
              <button onClick={() => setShowSizeGuide(false)} className="text-neutral-500 hover:text-black text-lg cursor-pointer">✕</button>
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 text-left font-bold text-neutral-800">
                  <th className="p-2.5 border">Size</th>
                  <th className="p-2.5 border">Bust (in)</th>
                  <th className="p-2.5 border">Waist (in)</th>
                  <th className="p-2.5 border">Hip (in)</th>
                  <th className="p-2.5 border">Length (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr><td className="p-2 border font-bold bg-neutral-50">XS</td><td className="p-2 border">34"</td><td className="p-2 border">28"</td><td className="p-2 border">38"</td><td className="p-2 border">48"</td></tr>
                <tr><td className="p-2 border font-bold bg-neutral-50">S</td><td className="p-2 border">36"</td><td className="p-2 border">30"</td><td className="p-2 border">40"</td><td className="p-2 border">48"</td></tr>
                <tr><td className="p-2 border font-bold bg-neutral-50">M</td><td className="p-2 border">38"</td><td className="p-2 border">32"</td><td className="p-2 border">42"</td><td className="p-2 border">49"</td></tr>
                <tr><td className="p-2 border font-bold bg-neutral-50">L</td><td className="p-2 border">40"</td><td className="p-2 border">34"</td><td className="p-2 border">44"</td><td className="p-2 border">49"</td></tr>
                <tr><td className="p-2 border font-bold bg-neutral-50">XL</td><td className="p-2 border">42"</td><td className="p-2 border">36"</td><td className="p-2 border">46"</td><td className="p-2 border">50"</td></tr>
                <tr><td className="p-2 border font-bold bg-neutral-50">XXL</td><td className="p-2 border">44"</td><td className="p-2 border">38"</td><td className="p-2 border">48"</td><td className="p-2 border">50"</td></tr>
                <tr><td className="p-2 border font-bold bg-neutral-50">3XL</td><td className="p-2 border">46"</td><td className="p-2 border">40"</td><td className="p-2 border">50"</td><td className="p-2 border">50"</td></tr>
                <tr><td className="p-2 border font-bold bg-neutral-50">5XL</td><td className="p-2 border">50"</td><td className="p-2 border">44"</td><td className="p-2 border">54"</td><td className="p-2 border">50"</td></tr>
              </tbody>
            </table>
            <p className="text-[11px] text-neutral-500 italic">
              * Measurements are in inches. If you are between sizes, we recommend sizing up for ethnic sets with trousers/sharara.
            </p>
            <button onClick={() => setShowSizeGuide(false)} className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-full cursor-pointer transition-colors">
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base text-neutral-900">Write a Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-neutral-500 hover:text-black text-lg cursor-pointer">✕</button>
            </div>
            {reviewSuccess ? (
              <div className="text-center py-6 space-y-2 text-emerald-600">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <p className="font-bold text-sm">Thank you! Your review was submitted.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.user_name}
                    onChange={(e) => setReviewForm({ ...reviewForm, user_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    placeholder="e.g. Radhika Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Rating</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value={5}>5 Stars - Outstanding</option>
                    <option value={4}>4 Stars - Great Quality</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Below Expectations</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Review</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    placeholder="Share details about the fabric, fit, and finishing..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
