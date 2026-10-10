import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { getProductUrl } from '../utils/productUrl.js';

export function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    grandTotal,
  } = useCart();

  const navigate = useNavigate();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-brand-cream/40 py-8 sm:py-12">
      <Helmet>
        <title>{`Shopping Bag (${totalItems}) | OCT9 Luxury Ethnic Wear`}</title>
        <meta name="description" content="Review your selected designer suits, sarees, and ethnic wear in your OCT9 shopping bag." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-neutral-500 mb-6">
          <Link to="/" className="hover:text-brand-maroon transition-colors">Home</Link>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">Shopping Bag</span>
        </nav>

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Shopping Bag
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              {totalItems === 0
                ? 'Your bag is currently empty.'
                : `You have ${totalItems} ${totalItems === 1 ? 'item' : 'items'} in your bag.`}
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-neutral-500 hover:text-red-600 transition-colors self-start sm:self-auto flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Entire Bag</span>
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          /* Empty Bag State */
          <div className="bg-white rounded-sm border border-neutral-200/90 p-8 sm:p-16 text-center my-8 shadow-xs max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] text-brand-maroon flex items-center justify-center mx-auto shadow-2xs">
              <ShoppingBag className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">
                Your Shopping Bag is Empty
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                Explore our handcrafted festive collections, royal Banarasi sarees, and tailored Pakistani suits to fill your bag.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/new-arrivals"
                className="px-6 py-3 rounded-sm bg-[#5A1827] hover:bg-[#43121D] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow-md"
              >
                Discover New Arrivals
              </Link>
              <Link
                to="/category/stitched-suits"
                className="px-6 py-3 rounded-sm bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-semibold uppercase tracking-wider transition-all shadow-2xs"
              >
                Browse Stitched Suits
              </Link>
            </div>
          </div>
        ) : (
          /* Main Cart Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pt-8 items-start">
            {/* Left Column: Cart Items List & Delivery Progress */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Notification Bar */}
              <div className="bg-white rounded-sm border border-neutral-200/90 p-4 shadow-2xs">
                <div className="flex items-center space-x-2.5 text-xs text-neutral-800">
                  <Truck className="w-4 h-4 text-[#5A1827] shrink-0" />
                  <span className="font-medium">
                    <strong className="text-emerald-700">FREE Express Shipping</strong> on all orders across India
                  </span>
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-sm border border-neutral-200/90 divide-y divide-neutral-100 shadow-xs overflow-hidden">
                {cart.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  const itemDiscount = item.original_price && item.original_price > item.price
                    ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
                    : 0;

                  return (
                    <div
                      key={`${item.product_id}-${item.size}-${item.color}`}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-neutral-50/50"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        <Link
                          to={getProductUrl(item)}
                          className="w-20 h-26 sm:w-24 sm:h-30 rounded-sm overflow-hidden bg-neutral-100 border border-neutral-200/80 shrink-0 block"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </Link>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <Link to={getProductUrl(item)}>
                            <h3 className="font-serif text-sm sm:text-base font-bold text-neutral-900 hover:text-brand-maroon transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                          </Link>

                          {/* Variants: Size & Color */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                            <span className="bg-[#FAF7F2] px-2 py-0.5 rounded border border-neutral-200 font-medium">
                              Size: <strong className="text-neutral-900">{item.size}</strong>
                            </span>
                            {item.color && item.color !== 'Standard' && (
                              <span className="bg-[#FAF7F2] px-2 py-0.5 rounded border border-neutral-200 font-medium">
                                Color: <strong className="text-neutral-900">{item.color}</strong>
                              </span>
                            )}
                          </div>

                          {/* Unit Price */}
                          <div className="flex items-center space-x-2 text-xs sm:text-sm">
                            <span className="font-bold text-neutral-900">
                              ₹{Number(item.price).toLocaleString('en-IN')}
                            </span>
                            {item.original_price > item.price && (
                              <>
                                <span className="line-through text-neutral-400 text-xs">
                                  ₹{Number(item.original_price).toLocaleString('en-IN')}
                                </span>
                                <span className="text-[#5A1827] text-[11px] font-bold">
                                  {itemDiscount}% OFF
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controller & Item Subtotal */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-neutral-300 rounded-sm bg-white shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-l-sm transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center text-xs font-bold text-neutral-900 select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-r-sm transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Total per Item */}
                        <div className="text-right min-w-[90px]">
                          <div className="text-sm sm:text-base font-bold text-neutral-900">
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product_id, item.size, item.color)}
                            className="text-[11px] text-neutral-400 hover:text-red-600 transition-colors mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Link */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  to="/new-arrivals"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-neutral-700 hover:text-brand-maroon transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Shopping</span>
                </Link>

                <p className="text-xs text-neutral-500">
                  Secure 256-Bit SSL Encrypted Checkout
                </p>
              </div>

              {/* Luxury Guarantee Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <div className="p-3.5 rounded-sm bg-white border border-neutral-200/80 text-center space-y-1">
                  <ShieldCheck className="w-5 h-5 text-brand-maroon mx-auto" />
                  <p className="font-serif text-xs font-bold text-neutral-900">100% Authentic Fabric</p>
                  <p className="text-[11px] text-neutral-500">Direct from heritage artisans</p>
                </div>
                <div className="p-3.5 rounded-sm bg-white border border-neutral-200/80 text-center space-y-1">
                  <RotateCcw className="w-5 h-5 text-brand-maroon mx-auto" />
                  <p className="font-serif text-xs font-bold text-neutral-900">7-Day Easy Returns</p>
                  <p className="text-[11px] text-neutral-500">Hassle-free doorstep pickup</p>
                </div>
                <div className="p-3.5 rounded-sm bg-white border border-neutral-200/80 text-center space-y-1">
                  <Truck className="w-5 h-5 text-brand-maroon mx-auto" />
                  <p className="font-serif text-xs font-bold text-neutral-900">Express Delivery</p>
                  <p className="text-[11px] text-neutral-500">Real-time GPS tracking</p>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              {/* Price Summary Breakdown */}
              <div className="bg-white rounded-sm border border-neutral-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="font-serif text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-2.5 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Bag Subtotal ({totalItems} items)</span>
                    <span className="font-semibold text-neutral-900">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="text-emerald-700 font-bold uppercase text-[11px]">
                      FREE Express Delivery
                    </span>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline text-sm sm:text-base">
                    <span className="font-bold text-neutral-900">Total Amount</span>
                    <span className="font-bold text-xl text-[#5A1827]">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 text-right">
                    All-inclusive pricing • Free Delivery
                  </p>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full h-12 rounded-sm bg-[#5A1827] hover:bg-[#43121D] active:scale-98 text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
