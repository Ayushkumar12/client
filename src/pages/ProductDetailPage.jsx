import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Share2,
  Ruler,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShoppingBag
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ShiprocketPincodeChecker } from '../components/common/ShiprocketPincodeChecker.jsx';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { ProductDetailSkeleton } from '../components/common/Skeleton.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { api } from '../services/api.js';
import { decodeProductSlug, encodeProductSlug } from '../utils/productUrl.js';

export function ProductDetailPage() {
  const { slug: rawParam } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAdmin, showPublicRatings } = useAuth() || {};

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeColorImage, setActiveColorImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
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
          setSelectedImage(0);
          setActiveColorImage(null);
          if (res.product.sizes && res.product.sizes.length > 0) {
            setSelectedSize(res.product.sizes[0]);
          } else {
            setSelectedSize('');
          }
          if (res.product.colors && res.product.colors.length > 0) {
            setSelectedColor(res.product.colors[0].name);
            if (res.product.colors[0].image) {
              setActiveColorImage(res.product.colors[0].image);
            }
          } else {
            setSelectedColor('');
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
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4 bg-[#FAF7F2]">
        <h2 className="font-sans text-2xl font-bold">Product Not Found</h2>
        <p className="text-xs text-neutral-500">The product you are looking for might have been moved or is out of stock.</p>
        <Link to="/new-arrivals" className="inline-block px-6 py-2.5 bg-brand-maroon text-white text-xs font-semibold rounded-lg">
          Browse New Arrivals
        </Link>
      </div>
    );
  }

  // Multi-image gallery curation: strictly use authentic images provided by admin
  const rawImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images.filter(Boolean)
    : (product.image ? [product.image] : []);

  const images = rawImages;

  const isWishlisted = isInWishlist(product.id);

  const availableProductSizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : [];

  // Display the authentic configured sizes for this specific product
  const allDisplaySizes = availableProductSizes;

  // Real-time stock status calculations (no fake 50 defaults)
  const stockCount = Number(product.stock !== undefined && product.stock !== null ? product.stock : 0);
  const isOutOfStock = stockCount <= 0;
  const isLowStock = stockCount > 0 && stockCount <= 10;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/checkout');
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
    ...(Number(product.reviews_count || 0) > 0 && Number(product.rating || 0) > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(product.rating),
        reviewCount: Number(product.reviews_count)
      }
    } : {})
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

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 md:pt-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs text-neutral-500 mb-2 sm:mb-4 font-medium">
          <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.category_slug}`} className="hover:text-neutral-900 capitalize transition-colors">
            {product.category_slug ? product.category_slug.replace('-', ' ') : 'Ethnic Wear'}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-semibold truncate max-w-[140px] sm:max-w-xs">{product.title}</span>
        </nav>

        {/* Product Details Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12 items-start">
          {/* Left Column: Side Mini Thumbnails Strip + Main Image Viewport (Always side-by-side & Screen Fit) */}
          <div className="lg:col-span-7 flex flex-row gap-2 sm:gap-3 md:gap-4 items-stretch w-full h-[50vh] sm:h-[58vh] min-h-[320px] max-h-[430px] sm:max-h-[520px] lg:h-[620px] lg:max-h-[640px] lg:sticky lg:top-24">
            {/* 1. Vertical Side Thumbnail Gallery Strip (Rendered only when product has 2 or more images) */}
            {images.length > 1 && (
              <div
                ref={thumbnailContainerRef}
                className="flex flex-col gap-1.5 sm:gap-2 overflow-y-auto no-scrollbar shrink-0 w-12 sm:w-16 md:w-20 lg:w-24 h-full py-0.5"
              >
                {images.map((img, idx) => {
                  const isActive = activeColorImage ? images[idx] === activeColorImage : selectedImage === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedImage(idx);
                        setActiveColorImage(null);
                      }}
                      onMouseEnter={() => {
                        setSelectedImage(idx);
                        setActiveColorImage(null);
                      }}
                      className={`relative aspect-[3/4] w-full rounded-lg sm:rounded-xl overflow-hidden border transition-all shrink-0 cursor-pointer bg-neutral-100 ${isActive
                          ? 'border-neutral-900 ring-2 ring-neutral-900/30 shadow-sm scale-102'
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
            )}

            {/* 2. Main Big Image Canvas with Magnifier Zoom & Clean Screen Fit */}
            {(() => {
              const currentMainImage = activeColorImage || images[selectedImage] || images[0] || '';
              return (
                <div
                  className={`relative flex-1 w-full h-full rounded-sm overflow-hidden bg-neutral-100 border border-neutral-200 shadow-2xs group select-none flex items-center justify-center ${
                    currentMainImage ? 'cursor-crosshair' : ''
                  }`}
                  onMouseEnter={() => { if (currentMainImage) setIsZoomed(true); }}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMove}
                >
                  {currentMainImage ? (
                    <img
                      src={currentMainImage}
                      alt={product.title}
                      className={`w-full h-full object-cover object-top transition-transform duration-300 ${
                        isZoomed ? 'scale-150 origin-[var(--zoom-x)_var(--zoom-y)]' : 'scale-100'
                      }`}
                      style={{
                        '--zoom-x': `${zoomPos.x}%`,
                        '--zoom-y': `${zoomPos.y}%`
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-8 text-center bg-[#FDFBF7]">
                      <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-2 text-neutral-300" />
                      <span className="text-xs font-semibold text-neutral-700">No Image Uploaded</span>
                      <span className="text-[11px] text-neutral-400 mt-0.5">Product photo has not been added yet</span>
                    </div>
                  )}

              {/* Top-Right Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-neutral-700 transition-colors z-20 cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              {/* Discount Percentage Badge */}
              {discountPercent > 0 && (
                <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 z-20">
                  <span className="bg-[#5A1827] text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-2xs uppercase tracking-wider">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}

                  {/* Image Counter Pill (Only shown when multiple images exist and not viewing a custom color photo) */}
                  {images.length > 1 && !activeColorImage && (
                    <div className="absolute bottom-2.5 sm:bottom-4 right-2.5 sm:right-4 z-20">
                      <span className="bg-black/60 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-mono font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/20 shadow-2xs">
                        {selectedImage + 1} / {images.length}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
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

              {/* Editorial Title (Sans-Serif) */}
              <h1 className="font-sans text-3xl sm:text-4xl text-neutral-900 mt-1 tracking-tight font-normal leading-tight">
                {product.title}
              </h1>

              {/* Rating & Rate Action */}
              {(isAdmin || showPublicRatings) && (
                <div className="flex items-center space-x-3 mt-2.5">
                  {(product.reviews?.length || product.reviews_count || 0) > 0 && Number(product.rating || 0) > 0 ? (
                    <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm text-xs font-bold text-amber-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400 font-medium">No reviews yet</span>
                  )}
                  {isAdmin ? (
                    <span className="text-xs text-neutral-500">
                      Based on <strong>{product.reviews?.length || product.reviews_count || 0}</strong> customer reviews (Admin View)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(true)}
                      className="text-xs text-brand-maroon hover:underline font-semibold cursor-pointer"
                    >
                      Rate &amp; Review
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 2. Price Section (Matching Reference: Rs.1,999 + Inclusive of all taxes) */}
            <div className="space-y-1">
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl sm:text-3xl font-sans font-bold text-neutral-900">
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
              if (isOutOfStock) {
                return (
                  <div className="p-4 bg-red-50/90 border border-red-200 rounded-sm flex items-start space-x-3 text-red-900 shadow-2xs">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs sm:text-sm">Currently Out of Stock</p>
                      <p className="text-[11px] text-red-700 mt-0.5">
                        This item is currently sold out. Save to your wishlist or contact customer support for restocking updates.
                      </p>
                    </div>
                  </div>
                );
              }

              if (isLowStock) {
                return (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-950 flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Low Stock: Only <strong>{stockCount} units</strong> available</span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Fast Selling</span>
                    </div>
                    <div className="w-full h-1 bg-amber-200 rounded-xs overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-xs transition-all duration-500"
                        style={{ width: `${Math.max(15, (stockCount / 10) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-sm border border-emerald-200 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>In Stock: {stockCount} units available for immediate dispatch</span>
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

            {/* 5. Color Selection (Supports dedicated image per color) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-neutral-800">Color:</span>
                  <span className="font-medium text-brand-maroon">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {product.colors.map((c) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setSelectedColor(c.name);
                          if (c.image) {
                            setActiveColorImage(c.image);
                          }
                        }}
                        title={c.name}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-sm border text-xs font-medium transition-all cursor-pointer ${isSelected
                            ? 'border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900 font-semibold'
                            : 'border-neutral-200 bg-white hover:border-neutral-400'
                          }`}
                      >
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.name}
                            className="w-4 h-4 rounded-xs object-cover border border-neutral-300"
                          />
                        ) : (
                          <span
                            className="w-3.5 h-3.5 rounded-xs border border-neutral-300"
                            style={{ backgroundColor: c.hex || '#000000' }}
                          />
                        )}
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Size Selector (All configured sizes are in stock when product has positive stock) */}
            {availableProductSizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-800 tracking-wide uppercase">Select Size</span>
                  {selectedSize && !isOutOfStock && (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                      <span>✓</span>
                      <span>In Stock</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {availableProductSizes.map((sz) => {
                    const isAvailable = !isOutOfStock;
                    const isSelected = selectedSize === sz;

                    if (!isAvailable) {
                      return (
                        <button
                          key={sz}
                          type="button"
                          disabled
                          title="Out of Stock"
                          className="min-w-[44px] h-9 px-3 rounded-sm border border-neutral-200 bg-neutral-100/60 text-neutral-400 text-xs font-medium line-through cursor-not-allowed select-none"
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
                        className={`min-w-[44px] h-9 px-3 rounded-sm text-xs font-semibold transition-all cursor-pointer border ${isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs ring-1 ring-neutral-900'
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
            )}

            {/* 7. Quantity Stepper */}
            <div className="flex items-center space-x-4 pt-1">
              <span className="text-xs font-semibold text-neutral-800 uppercase">Quantity:</span>
              <div className="flex items-center border border-neutral-300 rounded-sm bg-white overflow-hidden">
                <button
                  disabled={isOutOfStock || quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-neutral-900 min-w-[28px] text-center">{isOutOfStock ? 0 : quantity}</span>
                <button
                  disabled={isOutOfStock || quantity >= stockCount}
                  onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              <span className={`text-xs font-medium ${isOutOfStock ? 'text-red-600' : 'text-emerald-700'}`}>
                {isOutOfStock ? 'Item Sold Out' : 'Ready for immediate dispatch'}
              </span>
            </div>

            {/* 8. Action Buttons (Clean editorial luxury buttons) */}
            {isOutOfStock ? (
              <div className="pt-2">
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-6 rounded-sm border border-neutral-300 bg-neutral-200 text-neutral-500 font-bold text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>OUT OF STOCK / SOLD OUT</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-6 rounded-sm border border-neutral-900 bg-white hover:bg-neutral-900 text-neutral-900 hover:text-white font-semibold text-xs uppercase tracking-widest transition-all duration-200 shadow-2xs hover:shadow-sm cursor-pointer flex items-center justify-center"
                >
                  {addedAnimation ? (
                    <span>Added to Bag</span>
                  ) : (
                    <span>ADD TO CART</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-6 rounded-sm bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-white font-semibold text-xs uppercase tracking-widest transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center"
                >
                  <span>BUY NOW</span>
                </button>
              </div>
            )}

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
                  <div className="mt-3 text-xs text-neutral-700 leading-relaxed space-y-2 animate-fadeIn whitespace-pre-line">
                    {product.description ? (
                      <p>{product.description}</p>
                    ) : product.short_description ? (
                      <p>{product.short_description}</p>
                    ) : (
                      <p className="text-neutral-500 italic">No description provided for this product.</p>
                    )}
                    {product.short_description && product.description && product.short_description !== product.description && (
                      <p className="text-neutral-500 pt-1">{product.short_description}</p>
                    )}
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
                    <p>To maintain the quality, weave, and longevity of this piece:</p>
                    <ul className="list-disc list-inside space-y-1 text-neutral-600">
                      <li><strong>Professional Care:</strong> Professional dry clean recommended for best results.</li>
                      <li><strong>Storage:</strong> Store wrapped in a breathable muslin or cotton bag in a dry space.</li>
                      <li><strong>Ironing:</strong> Steam iron on reverse at low temperature.</li>
                      <li><strong>Protection:</strong> Avoid spraying perfumes or deodorants directly onto fabric or trims.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 3: SPECIFICATIONS (Strictly data entered by admin) */}
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
                  <div className="mt-3 animate-fadeIn bg-white p-4 rounded-sm border border-neutral-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-700">
                      {(product.category_title || product.category_slug) && (
                        <div><strong className="text-neutral-900">Category:</strong> {product.category_title || product.category_slug.replace(/-/g, ' ')}</div>
                      )}
                      {product.sub_category && (
                        <div><strong className="text-neutral-900">Sub-Category:</strong> {product.sub_category}</div>
                      )}
                      {product.fabric && (
                        <div><strong className="text-neutral-900">Fabric:</strong> {product.fabric}</div>
                      )}
                      {product.occasion && (
                        <div><strong className="text-neutral-900">Occasion:</strong> {product.occasion}</div>
                      )}
                      {product.sku && (
                        <div><strong className="text-neutral-900">SKU:</strong> {product.sku}</div>
                      )}
                      {availableProductSizes.length > 0 && (
                        <div><strong className="text-neutral-900">Available Sizes:</strong> {availableProductSizes.join(', ')}</div>
                      )}
                      {product.colors && product.colors.length > 0 && (
                        <div><strong className="text-neutral-900">Colors:</strong> {product.colors.map(c => c.name).join(', ')}</div>
                      )}
                      <div>
                        <strong className="text-neutral-900">Availability:</strong>{' '}
                        <span className={!isOutOfStock ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                          {!isOutOfStock ? `In Stock (${stockCount} units)` : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
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

              {/* Accordion 5: REVIEWS / RATINGS SECTION */}
              {isAdmin ? (
                /* Admin View: Full customer reviews breakdown */
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('reviews')}
                    className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <span>CUSTOMER REVIEWS ({product.reviews?.length || product.reviews_count || 0})</span>
                      <span className="text-[10px] bg-neutral-900 text-white font-mono px-1.5 py-0.2 rounded-xs font-normal">
                        Admin Only
                      </span>
                    </div>
                    {openAccordions.reviews ? (
                      <ChevronUp className="w-4 h-4 text-neutral-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-600" />
                    )}
                  </button>
                  {openAccordions.reviews && (
                    <div className="mt-3 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        {product.reviews && product.reviews.length > 0 && Number(product.rating || 0) > 0 ? (
                          <div className="flex items-center space-x-2">
                            <span className="font-sans text-2xl font-bold">{product.rating}</span>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < Math.round(Number(product.rating))
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'fill-neutral-200 text-neutral-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-neutral-500">({product.reviews.length})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-500">No reviews yet. Be the first to review this product.</span>
                        )}
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="text-xs font-bold text-brand-maroon hover:underline cursor-pointer"
                        >
                          Write a Review
                        </button>
                      </div>

                      {product.reviews && product.reviews.length > 0 ? (
                        <div className="divide-y divide-neutral-100">
                          {product.reviews.map((rev) => (
                            <div key={rev.id} className="py-3 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-neutral-900">{rev.user_name}</span>
                                <div className="flex text-amber-400">
                                  {[...Array(rev.rating || 5)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-neutral-600 leading-relaxed">{rev.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-500 italic py-2">No customer reviews recorded yet for this product.</p>
                      )}
                    </div>
                  )}
                </div>
              ) : showPublicRatings ? (
                /* Customer View: Only visible when admin allows public ratings */
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('reviews')}
                    className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-900 cursor-pointer"
                  >
                    <span>RATE &amp; REVIEW PRODUCT</span>
                    {openAccordions.reviews ? (
                      <ChevronUp className="w-4 h-4 text-neutral-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-600" />
                    )}
                  </button>
                  {openAccordions.reviews && (
                    <div className="mt-3 space-y-3 animate-fadeIn">
                      <div className="p-4 bg-[#FAF7F2] border border-neutral-200 rounded-sm space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                              Rate This Outfit &amp; Add Review
                            </h4>
                            <p className="text-xs text-neutral-600 mt-0.5">
                              Have you experienced this outfit? Rate the craftsmanship and submit your feedback.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowReviewModal(true)}
                            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shrink-0 shadow-2xs"
                          >
                            Rate &amp; Write Review
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Trust Features Strip - Clean Human Editorial Layout */}
            <div className="grid grid-cols-3 divide-x divide-neutral-200 py-3.5 border-t border-b border-neutral-200 text-center">
              <div className="px-2 flex flex-col items-center justify-center">
                <Truck className="w-4 h-4 text-neutral-800 mb-1" />
                <span className="text-[11px] font-bold text-neutral-800">Express Delivery</span>
                <span className="text-[9px] text-neutral-500">2-4 Days Pan-India</span>
              </div>
              <div className="px-2 flex flex-col items-center justify-center">
                <RotateCcw className="w-4 h-4 text-neutral-800 mb-1" />
                <span className="text-[11px] font-bold text-neutral-800">7 Days Returns</span>
                <span className="text-[9px] text-neutral-500">Hassle-free pickup</span>
              </div>
              <div className="px-2 flex flex-col items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-neutral-800 mb-1" />
                <span className="text-[11px] font-bold text-neutral-800">100% Authentic</span>
                <span className="text-[9px] text-neutral-500">Pure Artisan Weaves</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {product.related && product.related.length > 0 && (
          <div className="mt-12 sm:mt-20 pt-8 sm:pt-12 border-t border-neutral-200">
            <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
          <div className="bg-white rounded-sm p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <Ruler className="w-5 h-5 text-neutral-900" />
                <h3 className="font-sans font-bold text-base text-neutral-900">Ethnic Wear Size Chart (Inches)</h3>
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
            <button onClick={() => setShowSizeGuide(false)} className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-sm cursor-pointer transition-colors">
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-sm p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h3 className="font-sans font-bold text-base text-neutral-900">Rate &amp; Review This Outfit</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-neutral-400 hover:text-black text-lg cursor-pointer">✕</button>
            </div>
            {reviewSuccess ? (
              <div className="text-center py-8 space-y-2 text-emerald-700">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 animate-bounce" />
                <p className="font-bold text-sm">Thank You for Your Feedback!</p>
                <p className="text-xs text-neutral-500">Your rating and review have been successfully submitted to our customer care team.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Interactive Star Rating Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                    1. Select Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2 bg-neutral-50 p-2.5 rounded-sm border border-neutral-200">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="p-1 hover:scale-115 transition-transform cursor-pointer"
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-6 h-6 ${star <= reviewForm.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-300'
                            }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-neutral-800 ml-2">
                      {reviewForm.rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    2. Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewForm.user_name}
                    onChange={(e) => setReviewForm({ ...reviewForm, user_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-sm focus:outline-hidden focus:border-brand-maroon"
                    placeholder="e.g. Radhika Sharma"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
                    3. Your Experience &amp; Review <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-sm focus:outline-hidden focus:border-brand-maroon"
                    placeholder="Share feedback on fabric quality, sizing accuracy, embroidery, and fit..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Rating & Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
