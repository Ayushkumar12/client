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

                    )}
                  </button>
                );
              })}
            </div>

            {/* 2. Main Big Image Canvas with Magnifier Zoom */}
            <div
              className="relative flex-1 w-full aspect-[3/3.9] sm:aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-brand-border shadow-sm group select-none cursor-crosshair"
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
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-neutral-700 transition-colors z-20 cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              {/* Discount Percentage Badge */}
              {product.discount_percent > 0 && (
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-[#5A1827] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
                    {product.discount_percent}% OFF
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

          {/* Right Column: Information & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-bold text-brand-maroon">
                  {product.sub_category || product.category_slug}
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                </button>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
                {product.title}
              </h1>

              {/* Rating & Reviews */}
              {(isAdmin || showPublicRatings) && (
                <div className="flex items-center space-x-3 mt-2">
                  <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold text-amber-900">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-xs text-neutral-500">
                    Based on <strong>{product.reviews_count}</strong> verified customer reviews
                  </span>
                </div>
              )}
            </div>

            {/* Price section */}
            <div className="p-4 bg-white rounded-2xl border border-brand-border flex items-baseline space-x-3 shadow-2xs">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-900">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              {product.original_price > product.price && (
                <>
                  <span className="text-sm text-neutral-400 line-through">
                    ₹{Number(product.original_price).toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-bold text-brand-maroon">
                    {product.discount_percent}% OFF
                  </span>
                </>
              )}
              <span className="text-[11px] text-neutral-400 ml-auto font-medium">
                Inclusive of all taxes
              </span>
            </div>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-neutral-800">Color:</span>
                  <span className="font-medium text-brand-maroon">{selectedColor}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        selectedColor === c.name
                          ? 'border-brand-maroon bg-brand-maroon/5 ring-1 ring-brand-maroon'
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

            {/* Size Selector + Size Guide */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-neutral-800">Select Size:</span>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="flex items-center space-x-1 text-brand-maroon hover:underline font-semibold cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-neutral-800">Quantity:</span>
              <div className="flex items-center border border-neutral-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 font-bold"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-neutral-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 font-bold"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-emerald-700 font-semibold">
                ✓ In Stock (Express Air Shipping)
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="py-3.5 px-6 rounded-full bg-[#FF7A59] hover:bg-[#EE6847] active:scale-98 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3.5 px-6 rounded-full bg-neutral-900 hover:bg-[#5A1827] active:scale-98 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Instant Buy</span>
              </button>
            </div>

            {/* SHIPROCKET LIVE PINCODE CHECKER WIDGET */}
            <ShiprocketPincodeChecker />

            {/* Fabric & Product Details */}
            <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-3 text-xs shadow-2xs">
              <h3 className="font-serif font-bold text-sm text-neutral-900">Product Highlights</h3>
              <p className="text-neutral-600 leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                <div><strong className="text-neutral-900">Fabric:</strong> <span className="text-neutral-600">{product.fabric || 'Pure Georgette & Silk'}</span></div>
                <div><strong className="text-neutral-900">Occasion:</strong> <span className="text-neutral-600">{product.occasion || 'Wedding & Festive'}</span></div>
                <div><strong className="text-neutral-900">SKU:</strong> <span className="text-neutral-600">{product.sku}</span></div>
                <div><strong className="text-neutral-900">Care:</strong> <span className="text-neutral-600">Dry Clean Only</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {product.related && product.related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-brand-border">
            <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-6">
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
              <h3 className="font-serif font-bold text-base">Standard Ethnic Wear Size Guide (Inches)</h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-neutral-500 text-lg cursor-pointer">✕</button>
            </div>
            <table className="w-full text-xs border-collapse">
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
                          <button
                            onClick={() => setShowReviewModal(true)}
                            className="inline-block text-xs font-bold text-brand-maroon hover:underline cursor-pointer"
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
              )}
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
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
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
              <h3 className="font-serif font-bold text-base text-neutral-900">Rate &amp; Review This Outfit</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-neutral-400 hover:text-black text-lg cursor-pointer">✕</button>
            </div>
            {reviewSuccess ? (
              <div className="text-center py-8 space-y-2 text-emerald-700">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600 animate-bounce" />
                <p className="font-bold text-sm">Thank You for Your Feedback!</p>
                <p className="text-xs text-neutral-500">Your rating and review have been successfully submitted to our quality atelier.</p>
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
                          className={`w-6 h-6 ${
                            star <= reviewForm.rating
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
