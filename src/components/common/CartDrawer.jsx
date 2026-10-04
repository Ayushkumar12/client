import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  Sparkles,
  Check,
  Tag,
  Loader2
} from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { getProductUrl } from '../../utils/productUrl.js';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    couponError,
    couponLoading,
    freeShippingRemaining,
    FREE_SHIPPING_LIMIT,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      const ok = await applyCoupon(couponInput.trim());
      if (ok) setCouponInput('');
    }
  };

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  const progressPercent = Math.min(100, Math.round(((FREE_SHIPPING_LIMIT - freeShippingRemaining) / FREE_SHIPPING_LIMIT) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slideLeft">
          {/* Drawer Header */}
          <div className="p-4 bg-[#141414] text-white flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-brand-gold" />
              <h2 className="font-serif font-bold text-base tracking-wide">
                Your Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="p-3.5 bg-brand-cream border-b border-brand-border text-xs">
            <div className="flex items-center justify-between mb-1.5 font-medium text-neutral-800">
              <div className="flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-brand-maroon" />
                <span>
                  {freeShippingRemaining > 0 ? (
                    <>Add <strong className="text-brand-maroon">₹{freeShippingRemaining}</strong> more for <strong>Free Shiprocket Shipping</strong></>
                  ) : (
                    <strong className="text-emerald-700 flex items-center">
                      <Check className="w-3.5 h-3.5 mr-1 inline" /> You have unlocked FREE Express Shipping!
                    </strong>
                  )}
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-maroon transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-neutral-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-neutral-400" />
                </div>
                <div>
                  <p className="font-serif text-lg font-bold text-neutral-800">Your bag is empty</p>
                  <p className="text-xs text-neutral-500 mt-1">Explore our latest festive ethnic collection.</p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/new-arrivals');
                  }}
                  className="px-6 py-2.5 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-xs font-semibold rounded-lg shadow"
                >
                  Explore New Arrivals
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={`${item.product_id}-${item.size}-${item.color}-${idx}`} className="py-3.5 flex space-x-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'}
                    alt={item.title}
                    className="w-20 h-24 object-cover object-top rounded-lg bg-neutral-100 shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          to={getProductUrl(item)}
                          onClick={closeCart}
                          className="font-serif text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-1 hover:text-brand-maroon"
                        >
                          {item.title}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.product_id, item.size, item.color)}
                          className="text-neutral-400 hover:text-red-500 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-500 mt-0.5 space-x-2">
                        <span>Size: <strong className="text-neutral-800">{item.size}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-neutral-800">{item.color}</strong></span>
                      </div>

                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-bold text-neutral-900">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        {item.original_price > item.price && (
                          <span className="text-xs text-neutral-400 line-through">
                            ₹{item.original_price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-neutral-200 rounded-md bg-neutral-50">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                          className="p-1 text-neutral-600 hover:bg-neutral-200 rounded-l transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-neutral-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                          className="p-1 text-neutral-600 hover:bg-neutral-200 rounded-r transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-neutral-800">
                        Total: ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-4 bg-brand-cream border-t border-brand-border space-y-3">
              {/* Coupon Code Input */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-800">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> Applied (-₹{discountAmount})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon Code (Try OCT15)"
                    className="flex-1 text-xs px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon uppercase"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
                  >
                    {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-red-600">{couponError}</p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shiprocket Express Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-brand-border">
                  <span>Estimated Total</span>
                  <span className="text-base text-brand-maroon">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3 bg-brand-maroon hover:bg-brand-maroon-hover text-white text-sm font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-transform active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
