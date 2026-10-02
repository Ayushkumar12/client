import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { DelhiveryPincodeChecker } from '../components/common/DelhiveryPincodeChecker.jsx';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { api } from '../services/api.js';

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

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

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await api.getProduct(slug);
        if (res.success) {
          setProduct(res.product);
          if (res.product.sizes && res.product.sizes.length > 0) {
            setSelectedSize(res.product.sizes[0]);
          }
          if (res.product.colors && res.product.colors.length > 0) {
            setSelectedColor(res.product.colors[0].name);
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
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-maroon animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold">Product Not Found</h2>
        <p className="text-xs text-neutral-500">The product you are looking for might have been moved or is out of stock.</p>
        <Link to="/new-arrivals" className="inline-block px-6 py-2.5 bg-brand-maroon text-white text-xs font-semibold rounded-lg">
          Browse New Arrivals
        </Link>
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85'];

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
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
          // refresh product
          api.getProduct(slug).then(r => r.success && setProduct(r.product));
        }, 1200);
      }
    } catch (e) {
      alert(e.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Google Structured Data for Product
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.title,
    'image': images,
    'description': product.description || product.short_description,
    'sku': product.sku,
    'brand': {
      '@type': 'Brand',
      'name': 'OCT9'
    },
    'offers': {
      '@type': 'Offer',
      'url': typeof window !== 'undefined' ? window.location.href : '',
      'priceCurrency': 'INR',
      'price': product.price,
      'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'Organization',
        'name': 'OCT9 Luxury Ethnic Wear'
      }
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': product.rating || 4.8,
      'reviewCount': product.reviews_count || 12
    }
  };

  return (
    <div className="pb-20 bg-[#FAF7F2]">
      <SEO
        title={`${product.title} | OCT9 Luxury Ethnic Wear`}
        description={product.short_description || product.description}
        image={images[0]}
        schemaData={productSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-neutral-500 mb-6">
          <Link to="/" className="hover:text-brand-maroon">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.category_slug}`} className="hover:text-brand-maroon capitalize">
            {product.category_slug.replace('-', ' ')}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-semibold truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Details Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Big Image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-brand-border shadow-sm group">
              <img
                src={images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-neutral-700 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.is_new_arrival && (
                  <span className="bg-[#0F766E] text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-sm uppercase">
                    NEW ARRIVAL
                  </span>
                )}
                {product.discount_percent > 0 && (
                  <span className="bg-brand-maroon text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-sm">
                    {product.discount_percent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto no-scrollbar py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === idx
                        ? 'border-brand-maroon ring-2 ring-brand-maroon/30 shadow-md scale-102'
                        : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.title} ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-bold text-brand-maroon">
                  {product.sub_category || product.category_slug}
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 text-xs text-neutral-500 hover:text-neutral-900"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                </button>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">
                {product.title}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center space-x-3 mt-2">
                <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold text-amber-900">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-xs text-neutral-500">
                  Based on <strong>{product.reviews_count}</strong> verified customer reviews
                </span>
              </div>
            </div>

            {/* Price section matching screenshots */}
            <div className="p-4 bg-white rounded-xl border border-brand-border flex items-baseline space-x-3">
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
                    className="flex items-center space-x-1 text-brand-maroon hover:underline font-semibold"
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
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
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
              <div className="flex items-center border border-neutral-300 rounded-lg bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-l"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-neutral-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-r"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-emerald-700 font-semibold">
                ✓ In Stock (Ships via Delhivery)
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="py-3.5 px-6 rounded-xl bg-brand-maroon hover:bg-brand-maroon-hover active:scale-98 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-brand-gold" />
                <span>Add to Shopping Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3.5 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg transition-all"
              >
                <Zap className="w-4 h-4 text-brand-gold" />
                <span>Buy Now with Razorpay</span>
              </button>
            </div>

            {/* DELHIVERY ONE LIVE PINCODE CHECKER WIDGET */}
            <DelhiveryPincodeChecker />

            {/* Fabric & Product Details Accordion */}
            <div className="bg-white rounded-xl border border-brand-border p-5 space-y-3 text-xs">
              <h3 className="font-serif font-bold text-sm text-neutral-900">Product Highlights</h3>
              <p className="text-neutral-600 leading-relaxed">{product.description}</p>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                <div><strong className="text-neutral-900">Fabric:</strong> <span className="text-neutral-600">{product.fabric || 'Pure Georgette & Silk'}</span></div>
                <div><strong className="text-neutral-900">Occasion:</strong> <span className="text-neutral-600">{product.occasion || 'Wedding & Festive'}</span></div>
                <div><strong className="text-neutral-900">SKU:</strong> <span className="text-neutral-600">{product.sku}</span></div>
                <div><strong className="text-neutral-900">Care:</strong> <span className="text-neutral-600">Dry Clean Only</span></div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl border border-brand-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-neutral-900">Customer Reviews ({product.reviews?.length || 0})</h3>
                  <div className="flex items-center space-x-1 text-xs text-amber-600 font-bold mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating} out of 5 stars</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Write Review</span>
                </button>
              </div>

              {/* Reviews List */}
              <div className="divide-y divide-neutral-100 max-h-60 overflow-y-auto space-y-3 pt-2">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="pt-3 first:pt-0 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-neutral-900">{rev.user_name}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-600">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400 italic">No reviews yet. Be the first to share your experience!</p>
                )}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {product.related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-neutral-900">Write a Customer Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={reviewForm.user_name}
                  onChange={(e) => setReviewForm({ ...reviewForm, user_name: e.target.value })}
                  placeholder="e.g. Ananya Mehra"
                  className="w-full text-xs p-2.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 border rounded-lg"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Below Average)</option>
                  <option value={1}>⭐ (1 - Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Your Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Describe fabric quality, fitting, packaging..."
                  className="w-full text-xs p-2.5 border rounded-lg"
                />
              </div>

              {reviewSuccess && (
                <div className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Review submitted successfully!</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-4 py-2 bg-brand-maroon text-white text-xs font-bold rounded-lg"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base">Standard Ethnic Wear Size Guide (Inches)</h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-neutral-500">✕</button>
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 text-left">
                  <th className="p-2 border">Size</th>
                  <th className="p-2 border">Bust</th>
                  <th className="p-2 border">Waist</th>
                  <th className="p-2 border">Hip</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-2 border font-bold">XS</td><td className="p-2 border">34"</td><td className="p-2 border">28"</td><td className="p-2 border">38"</td></tr>
                <tr><td className="p-2 border font-bold">S</td><td className="p-2 border">36"</td><td className="p-2 border">30"</td><td className="p-2 border">40"</td></tr>
                <tr><td className="p-2 border font-bold">M</td><td className="p-2 border">38"</td><td className="p-2 border">32"</td><td className="p-2 border">42"</td></tr>
                <tr><td className="p-2 border font-bold">L</td><td className="p-2 border">40"</td><td className="p-2 border">34"</td><td className="p-2 border">44"</td></tr>
                <tr><td className="p-2 border font-bold">XL</td><td className="p-2 border">42"</td><td className="p-2 border">36"</td><td className="p-2 border">46"</td></tr>
                <tr><td className="p-2 border font-bold">XXL</td><td className="p-2 border">44"</td><td className="p-2 border">38"</td><td className="p-2 border">48"</td></tr>
              </tbody>
            </table>
            <button onClick={() => setShowSizeGuide(false)} className="w-full py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg">
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
