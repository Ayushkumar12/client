import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  Check
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
    grandTotal,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
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

          {/* Complimentary Shipping Banner */}
          <div className="p-3 bg-brand-cream border-b border-brand-border text-xs">
            <div className="flex items-center space-x-2 text-neutral-800">
              <Truck className="w-4 h-4 text-brand-maroon shrink-0" />
              <span className="font-medium">
                <strong className="text-emerald-700">FREE Express Shipping</strong> on all orders across India
              </span>
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

                      {/* Stock availability hint */}
                      {item.stock !== undefined && item.stock <= 0 ? (
                        <span className="text-[10px] font-semibold text-red-600 block mt-0.5">
                          Out of stock - Please remove to checkout
                        </span>
                      ) : item.stock !== undefined && item.stock <= 5 ? (
                        <span className="text-[10px] font-semibold text-amber-700 block mt-0.5">
                          Only {item.stock} left in stock
                        </span>
                      ) : null}

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
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                          onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                          className="p-1 text-neutral-600 hover:bg-neutral-200 rounded-r transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={item.stock !== undefined && item.quantity >= item.stock ? `Max available stock is ${item.stock}` : 'Increase quantity'}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-neutral-900">
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
              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="text-emerald-700 font-bold uppercase text-[11px]">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-brand-border">
                  <span>Estimated Total</span>
                  <span className="text-base text-brand-maroon">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons: Proceed to Checkout & View Full Cart Page */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3 bg-[#5A1827] hover:bg-[#43121D] active:scale-98 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-sm shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    navigate('/cart');
                  }}
                  className="w-full py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 hover:text-neutral-950 border border-neutral-300 text-xs font-semibold uppercase tracking-wider rounded-sm flex items-center justify-center transition-all cursor-pointer"
                >
                  <span>View Shopping Bag</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
