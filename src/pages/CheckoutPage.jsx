import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Lock,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { api } from '../services/api.js';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    cart,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart
  } = useCart();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    payment_method: 'razorpay', // 'razorpay' or 'cod'
    notes: ''
  });

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');
  const [shiprocketInfo, setShiprocketInfo] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prefill default user address if available
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const def = user.addresses.find(a => a.is_default) || user.addresses[0];
      setFormData(prev => ({
        ...prev,
        name: user.name || def.name,
        phone: user.phone || def.phone,
        address_line1: def.address_line1,
        address_line2: def.address_line2 || '',
        city: def.city,
        state: def.state,
        pincode: def.pincode,
      }));
    }
  }, [user]);

  // Check Shiprocket Serviceability when pincode changes
  useEffect(() => {
    if (/^\d{6}$/.test(formData.pincode)) {
      verifyShiprocketPincode(formData.pincode);
    }
  }, [formData.pincode]);

  const verifyShiprocketPincode = async (pin) => {
    setPincodeLoading(true);
    try {
      const res = await api.checkPincode(pin);
      if (res.serviceable) {
        setShiprocketInfo(res);
        if (res.city && res.state) {
          setFormData(prev => ({
            ...prev,
            city: res.city,
            state: res.state
          }));
        }
      } else {
        setShiprocketInfo(null);
      }
    } catch (e) {
      // ignore
    } finally {
      setPincodeLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold">Your bag is empty</h2>
        <p className="text-xs text-neutral-500">Add items to your cart before proceeding to checkout.</p>
        <Link to="/new-arrivals" className="inline-block px-6 py-2.5 bg-brand-maroon text-white text-xs font-semibold rounded-lg">
          Explore New Arrivals
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCouponApply = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMsg('');
    const ok = await applyCoupon(couponInput.trim());
    if (ok) {
      setCouponMsg('Coupon applied successfully!');
      setCouponInput('');
    } else {
      setCouponMsg('Invalid promo code.');
    }
    setCouponLoading(false);
  };

  // Main Checkout Submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.phone || !formData.address_line1 || !formData.pincode) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }

    setIsProcessing(true);

    try {
      const orderPayload = {
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        shipping_address: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address_line1: formData.address_line1.trim(),
          address_line2: formData.address_line2.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        items: cart,
        payment_method: formData.payment_method,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        notes: formData.notes
      };

      const res = await api.createOrder(orderPayload);
      if (!res.success) {
        throw new Error(res.message || 'Failed to initialize order.');
      }

      const createdOrder = res.order;

      // Handle Cash on Delivery
      if (formData.payment_method === 'cod') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        clearCart();
        navigate(`/order-success/${createdOrder.order_number}`);
        return;
      }
      // Handle Razorpay Payment Modal
      if (formData.payment_method === 'razorpay') {
        const options = {
          key: createdOrder.razorpay_key_id,
          amount: Math.round(grandTotal * 100),
          currency: 'INR',
          name: 'OCT9 Luxury Ethnic Wear',
          description: `Order #${createdOrder.order_number}`,
          image: window.location.protocol === 'https:' ? `${window.location.origin}/oct9-logo.jpg` : undefined,
          order_id: createdOrder.razorpay_order_id,
          handler: async function (response) {
            try {
              const verifyPayload = {
                order_id: createdOrder.id,
                order_number: createdOrder.order_number,
                razorpay_order_id: response.razorpay_order_id || createdOrder.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              };

              const verifyRes = await api.verifyPayment(verifyPayload);

              if (verifyRes.success) {
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                clearCart();
                navigate(`/order-success/${createdOrder.order_number}`);
              } else {
                setErrorMsg('Payment verification failed: ' + (verifyRes.message || 'Verification rejected'));
                setIsProcessing(false);
              }
            } catch (verErr) {
              setErrorMsg('Error verifying payment: ' + (verErr.message || 'Network error'));
              setIsProcessing(false);
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          theme: { color: '#5A1827' },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            }
          }
        };

        if (typeof window.Razorpay !== 'undefined') {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (resp) {
            setErrorMsg('Payment Failed: ' + (resp.error?.description || 'Transaction cancelled'));
            setIsProcessing(false);
          });
          rzp.open();
        } else {
          setErrorMsg('Payment gateway is loading. Please verify your internet connection and try again.');
          setIsProcessing(false);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-20 pt-6">
      <SEO title="Secure Checkout | OCT9 Luxury Ethnic Wear" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center space-x-1.5 text-xs text-neutral-600 hover:text-brand-maroon font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Boutique</span>
          </Link>
          <div className="flex items-center space-x-2 text-xs text-neutral-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Customer & Shipping Address (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Customer Contact */}
              <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm space-y-4">
                <h2 className="font-serif font-bold text-base text-neutral-900 flex items-center space-x-2">
                  <span>1. Contact Details</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full Name as per ID"
                      className="w-full text-xs sm:text-sm p-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Mobile Phone (for Delivery SMS) *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      className="w-full text-xs sm:text-sm p-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address (for Invoice & Tracking) *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@domain.com"
                      className="w-full text-xs sm:text-sm p-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif font-bold text-base text-neutral-900">
                    2. Delivery Address
                  </h2>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                    Shiprocket Express
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Flat, House No., Building, Street *</label>
                    <input
                      type="text"
                      name="address_line1"
                      required
                      value={formData.address_line1}
                      onChange={handleInputChange}
                      placeholder="House / Flat No., Apartment Name, Street"
                      className="w-full text-xs sm:text-sm p-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Area, Landmark (Optional)</label>
                    <input
                      type="text"
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleInputChange}
                      placeholder="Landmark, Area, Colony"
                      className="w-full text-xs sm:text-sm p-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Pincode *</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="pincode"
                          required
                          maxLength={6}
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="110001"
                          className="w-full text-xs sm:text-sm p-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon font-bold"
                        />
                        {pincodeLoading && (
                          <Loader2 className="w-4 h-4 text-brand-maroon animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full text-xs sm:text-sm p-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">State *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full text-xs sm:text-sm p-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-maroon"
                      />
                    </div>
                  </div>

                  {/* Shiprocket Live Pincode Verification Badge */}
                  {shiprocketInfo && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Shiprocket delivers to <strong>{shiprocketInfo.city}</strong>. Expected delivery by <strong>{shiprocketInfo.delivery_date || '2-3 Days'}</strong>.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm space-y-4">
                <h2 className="font-serif font-bold text-base text-neutral-900">
                  3. Payment Options
                </h2>

                <div className="space-y-3">
                  {/* Online Payment */}
                  <label
                    className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.payment_method === 'razorpay'
                        ? 'border-brand-maroon bg-brand-maroon/5 ring-1 ring-brand-maroon'
                        : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="razorpay"
                      checked={formData.payment_method === 'razorpay'}
                      onChange={handleInputChange}
                      className="mt-1 text-brand-maroon focus:ring-brand-maroon"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-brand-maroon" />
                        <span className="text-xs sm:text-sm font-bold text-neutral-900">
                          Online Payment (UPI, Cards, NetBanking, Wallets)
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Pay securely with UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, or NetBanking.
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.payment_method === 'cod'
                        ? 'border-brand-maroon bg-brand-maroon/5 ring-1 ring-brand-maroon'
                        : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === 'cod'}
                      onChange={handleInputChange}
                      className="mt-1 text-brand-maroon focus:ring-brand-maroon"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <Banknote className="w-4 h-4 text-brand-maroon" />
                        <span className="text-xs sm:text-sm font-bold text-neutral-900">
                          Cash on Delivery (COD)
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Pay in cash to the courier executive upon doorstep delivery.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Placement (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm space-y-4 sticky top-28">
                <h3 className="font-serif font-bold text-base text-neutral-900 pb-3 border-b border-neutral-100">
                  Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
                </h3>

                {/* Items preview list */}
                <div className="max-h-56 overflow-y-auto divide-y divide-neutral-100 pr-1">
                  {cart.map((item, i) => (
                    <div key={i} className="py-2.5 flex items-center space-x-3 text-xs">
                      <img src={item.image} alt={item.title} className="w-12 h-14 object-cover rounded-md bg-neutral-100" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 truncate">{item.title}</p>
                        <p className="text-neutral-500 text-[11px]">Size: {item.size} | Qty: {item.quantity}</p>
                        <p className="font-bold text-neutral-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Box */}
                <div className="pt-2">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                      <div className="flex items-center space-x-1.5 text-emerald-800">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Code <strong>{appliedCoupon.code}</strong> Applied (-₹{discountAmount})</span>
                      </div>
                      <button type="button" onClick={removeCoupon} className="text-red-600 hover:underline font-semibold">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter Coupon Code"
                        className="flex-1 text-xs p-2.5 border rounded-lg uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleCouponApply}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-3 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {couponMsg && <p className="text-[11px] text-neutral-600 mt-1">{couponMsg}</p>}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs text-neutral-600 pt-3 border-t border-neutral-100">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-neutral-900">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Express Shipping</span>
                    <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee}`}</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-neutral-900 pt-3 border-t border-brand-border">
                    <span>Total Amount Payable</span>
                    <span className="text-lg text-brand-maroon">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Place Order CTA Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-brand-maroon hover:bg-brand-maroon-hover active:scale-98 disabled:bg-neutral-400 text-white text-sm font-bold rounded-xl shadow-xl flex items-center justify-center space-x-2 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Secure Order...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-brand-gold-light" />
                      <span>{formData.payment_method === 'razorpay' ? `Pay ₹${grandTotal}` : 'Confirm Cash on Delivery'}</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-neutral-400 text-center flex items-center justify-center space-x-1">
                  <Truck className="w-3 h-3 text-brand-maroon" />
                  <span>Ships via <strong>Express Courier</strong> with real-time tracking</span>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
