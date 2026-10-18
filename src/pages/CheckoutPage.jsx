import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  ChevronRight,
  ArrowLeft,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { api, formatImageUrl } from '../services/api.js';
import { trackBeginCheckout } from '../utils/conversionTracking.js';
import { UserMapAddressPicker } from '../components/common/UserMapAddressPicker.jsx';

const ensureRazorpayLoaded = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined') {
      return resolve(true);
    }
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      setTimeout(() => resolve(typeof window.Razorpay !== 'undefined'), 3000);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const {
    cart,
    subtotal: cartSubtotal,
    clearCart,
    removeFromCart
  } = useCart();

  // Buy Now item: only set if user clicked "Buy Now" on a specific product
  const [buyNowItem] = useState(() => {
    if (location.state?.fromCart) {
      try {
        sessionStorage.removeItem('oct9_buy_now_item');
      } catch (e) { }
      return null;
    }
    if (location.state?.buyNowItem) {
      return location.state.buyNowItem;
    }
    try {
      const stored = sessionStorage.getItem('oct9_buy_now_item');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) { }
    return null;
  });

  const [pincodeStatus, setPincodeStatus] = useState({
    checked: false,
    serviceable: true,
    message: '',
    info: null
  });

  const isBuyNow = Boolean(buyNowItem);
  const itemsToCheckout = isBuyNow ? [buyNowItem] : cart;
  const subtotal = isBuyNow ? (Number(buyNowItem.price) * Number(buyNowItem.quantity)) : cartSubtotal;
  const shippingFee = (pincodeStatus.checked && pincodeStatus.serviceable && pincodeStatus.info?.rate)
    ? Number(pincodeStatus.info.rate)
    : 60;
  const grandTotal = Math.max(0, subtotal + shippingFee);
  const totalItems = itemsToCheckout.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (itemsToCheckout && itemsToCheckout.length > 0) {
      trackBeginCheckout(itemsToCheckout, grandTotal);
    }
  }, []);

  const [formData, setFormData] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : '',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : '',
    email: user?.email || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    payment_method: 'razorpay',
    notes: '',
    saveInfo: true
  });

  const [shiprocketInfo, setShiprocketInfo] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [readinessCheck, setReadinessCheck] = useState(null);
  const [readinessLoading, setReadinessLoading] = useState(false);

  // Populate form fields directly from user profile as soon as user is available or updated
  useEffect(() => {
    if (!user) return;

    const def = (user.addresses && user.addresses.length > 0)
      ? (user.addresses.find(a => a.is_default) || user.addresses[0])
      : null;

    const nameParts = (user.name || def?.name || '').trim().split(' ');
    const resolvedPhone = (user.phone || def?.phone || (user.email === 'admin@oct9.com' ? '9667100863' : '')).trim();

    setFormData(prev => ({
      ...prev,
      email: prev.email || user.email || '',
      firstName: prev.firstName || nameParts[0] || '',
      lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
      phone: prev.phone || resolvedPhone || '',
      address_line1: prev.address_line1 || def?.address_line1 || '',
      address_line2: prev.address_line2 || def?.address_line2 || '',
      city: prev.city || def?.city || '',
      state: prev.state || def?.state || '',
      pincode: prev.pincode || def?.pincode || '',
    }));
  }, [user]);

  // Fetch fresh profile directly on checkout mount to guarantee up-to-date user details
  useEffect(() => {
    let active = true;
    if (isAuthenticated) {
      api.getProfile().then(res => {
        if (!active || !res?.success || !res.user) return;
        const u = res.user;
        const def = (u.addresses && u.addresses.length > 0)
          ? (u.addresses.find(a => a.is_default) || u.addresses[0])
          : null;
        const nameParts = (u.name || def?.name || '').trim().split(' ');
        const resolvedPhone = (u.phone || def?.phone || (u.email === 'admin@oct9.com' ? '9667100863' : '')).trim();

        setFormData(prev => ({
          ...prev,
          email: u.email || prev.email,
          firstName: prev.firstName || nameParts[0] || '',
          lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
          phone: prev.phone || resolvedPhone || '',
          address_line1: prev.address_line1 || def?.address_line1 || '',
          address_line2: prev.address_line2 || def?.address_line2 || '',
          city: prev.city || def?.city || '',
          state: prev.state || def?.state || '',
          pincode: prev.pincode || def?.pincode || ''
        }));
      }).catch(() => { });
    }
    return () => { active = false; };
  }, [isAuthenticated]);

  // Live Pre-Order Readiness Check (Stock, Shipping, Payment)
  const verifyOrderReadiness = async (pin, method) => {
    if (!itemsToCheckout || itemsToCheckout.length === 0) return;
    setReadinessLoading(true);
    try {
      const res = await api.validateCheckout({
        items: itemsToCheckout,
        pincode: pin,
        payment_method: method
      });
      if (res) {
        setReadinessCheck(res);
      }
    } catch (e) {
      // Graceful fallback
    } finally {
      setReadinessLoading(false);
    }
  };

  // Check Serviceability & Order Readiness when pincode changes
  useEffect(() => {
    const cleanPin = String(formData.pincode || '').trim();
    if (/^\d{6}$/.test(cleanPin)) {
      verifyShiprocketPincode(cleanPin);
      verifyOrderReadiness(cleanPin, 'razorpay');
    } else if (cleanPin.length > 0 && cleanPin.length < 6) {
      setPincodeStatus({
        checked: false,
        serviceable: false,
        message: 'PIN code must be 6 digits',
        info: null
      });
      setShiprocketInfo(null);
      setReadinessCheck(prev => prev ? {
        ...prev,
        shipping_available: false,
        payment_available: true,
        details: {
          ...prev.details,
          shipping_status: 'Unserviceable',
          shipping_message: 'Please enter a valid 6-digit delivery PIN code.'
        }
      } : null);
    } else {
      verifyOrderReadiness('', 'razorpay');
    }
  }, [formData.pincode]);

  const verifyShiprocketPincode = async (pin) => {
    setPincodeLoading(true);
    try {
      const res = await api.checkPincode(pin, { cod: '0' });
      if (res && res.serviceable) {
        setShiprocketInfo(res);
        setPincodeStatus({
          checked: true,
          serviceable: true,
          message: 'Delivery Available',
          info: res
        });
        if (res.city && res.state) {
          setFormData(prev => ({
            ...prev,
            city: res.city,
            state: res.state
          }));
        }
      } else {
        const msg = res?.message || `Delivery is currently not available to PIN code ${pin}.`;
        setShiprocketInfo(null);
        setPincodeStatus({
          checked: true,
          serviceable: false,
          message: msg,
          info: null
        });
      }
    } catch (e) {
      setShiprocketInfo(null);
      setPincodeStatus({
        checked: true,
        serviceable: false,
        message: `Delivery is currently not available to PIN code ${pin}.`,
        info: null
      });
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Main Checkout Submission with strict 3-point pre-order confirmation (Stock, Shipping, Payment)
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const cleanPin = (formData.pincode || '').trim();
    const rawContact = (formData.phone || user?.phone || user?.addresses?.[0]?.phone || (formData.email === 'admin@oct9.com' || user?.email === 'admin@oct9.com' ? '9667100863' : '')).trim();
    const cleanPhone = rawContact.replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for order delivery.');
      return;
    }

    if (!formData.phone) {
      setFormData(prev => ({ ...prev, phone: cleanPhone }));
    }

    if (!/^\d{6}$/.test(cleanPin)) {
      setErrorMsg('Please enter a valid 6-digit Indian postal PIN code.');
      return;
    }

    if (!formData.address_line1.trim()) {
      setErrorMsg('Please enter your flat, house number, or street address.');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Synchronous Server Pre-Order Readiness Verification (Stock, Shipping, Payment)
      const readiness = await api.validateCheckout({
        items: itemsToCheckout,
        pincode: cleanPin,
        payment_method: 'razorpay'
      });

      if (!readiness || !readiness.success) {
        const failureReason = readiness?.message || 'Unable to confirm order readiness. Please review stock or shipping details.';
        setErrorMsg(failureReason);
        setReadinessCheck(readiness);
        setIsProcessing(false);
        return;
      }

      // Explicit verification check
      if (!readiness.stock_available) {
        setErrorMsg(readiness.message || 'One or more items in your cart are currently out of stock.');
        setIsProcessing(false);
        return;
      }

      if (!readiness.shipping_available) {
        setErrorMsg(readiness.message || `Delivery is currently not available to PIN code ${cleanPin}.`);
        setIsProcessing(false);
        return;
      }

      if (!readiness.payment_available) {
        setErrorMsg(readiness.message || 'Selected payment method is currently unavailable for this order.');
        setIsProcessing(false);
        return;
      }

      // 1. Mandatory Pre-Payment Delivery Serviceability Verification
      let pinCheck = shiprocketInfo;
      if (!pinCheck || pinCheck.pincode !== cleanPin) {
        try {
          pinCheck = await api.checkPincode(cleanPin, { cod: '0' });
          if (pinCheck && pinCheck.serviceable) {
            setShiprocketInfo(pinCheck);
            setPincodeStatus({
              checked: true,
              serviceable: true,
              message: 'Delivery Available',
              info: pinCheck
            });
          }
        } catch (pinErr) {
          setErrorMsg('Unable to verify delivery serviceability. Please check your PIN code and internet connection.');
          setIsProcessing(false);
          return;
        }
      }

      // Block payment and order confirmation if delivery is not available
      if (!pinCheck || !pinCheck.serviceable) {
        const failMessage = pinCheck?.message || `Delivery is currently not available to PIN code ${cleanPin}. Please enter a serviceable delivery address.`;
        setErrorMsg(failMessage);
        setPincodeStatus({
          checked: true,
          serviceable: false,
          message: failMessage,
          info: null
        });
        setIsProcessing(false);
        return;
      }

      const orderPayload = {
        customer_name: fullName || formData.firstName || user?.name || 'OCT9 Customer',
        customer_email: (formData.email || user?.email || '').trim(),
        customer_phone: cleanPhone || formData.phone.trim(),
        shipping_address: {
          name: fullName || formData.firstName || user?.name || 'OCT9 Customer',
          phone: cleanPhone || formData.phone.trim(),
          address_line1: formData.address_line1.trim(),
          address_line2: (formData.address_line2 || '').trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: cleanPin,
        },
        items: itemsToCheckout,
        payment_method: 'razorpay',
        shipping_fee: shippingFee,
        grand_total: grandTotal,
        save_address: Boolean(formData.saveInfo),
        notes: formData.notes
      };

      const res = await api.createOrder(orderPayload);
      if (!res.success) {
        throw new Error(res.message || 'Failed to initialize order.');
      }

      const createdOrder = res.order;

      // Razorpay Payment Gateway Online Checkout
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
              try {
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
              } catch (e) { }

              if (isBuyNow) {
                try {
                  sessionStorage.removeItem('oct9_buy_now_item');
                } catch (e) { }
                if (buyNowItem) {
                  removeFromCart(buyNowItem.product_id, buyNowItem.size, buyNowItem.color);
                }
              } else {
                clearCart();
              }

            } else if (verifyRes.refunded) {
              setErrorMsg(verifyRes.message || 'Shiprocket order confirmation could not be completed. A 100% instant refund has been initiated to your original payment method.');
              setIsProcessing(false);
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
          name: fullName || `${formData.firstName} ${formData.lastName}`.trim() || user?.name || 'OCT9 Customer',
          email: (formData.email || user?.email || (user?.email === 'admin@oct9.com' ? 'admin@oct9.com' : 'support@oct9.in')).trim(),
          contact: cleanPhone || (formData.phone ? formData.phone.replace(/\D/g, '').slice(-10) : '') || (user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : '') || '9667100863'
        },
        theme: { color: '#5A1827' },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const isReady = typeof window.Razorpay !== 'undefined' || (await ensureRazorpayLoaded());

      if (isReady && typeof window.Razorpay !== 'undefined') {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setErrorMsg('Payment Failed: ' + (resp.error?.description || 'Transaction cancelled by user'));
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        setErrorMsg('Payment gateway is loading. Please check your internet connection and try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Require login — no guest checkout allowed
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white px-4">
        <div className="max-w-sm w-full text-center space-y-5 py-16">
          <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#EFE8DC] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-[#5A1827]" />
          </div>
          <div className="space-y-2">
            <h1 className="font-sans text-2xl font-bold text-neutral-900">Sign In to Checkout</h1>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
              Please sign in or create an account to place your order, track deliveries, and access order history.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/login?redirect=/checkout`}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#5A1827] text-white text-xs font-semibold rounded-sm hover:bg-[#43121D] transition-colors text-center"
            >
              Sign In
            </Link>
            <Link
              to={`/register?redirect=/checkout`}
              className="w-full sm:w-auto px-6 py-2.5 border border-neutral-300 bg-white text-neutral-900 text-xs font-semibold rounded-sm hover:bg-neutral-50 transition-colors text-center"
            >
              Create Account
            </Link>
          </div>
          <p className="text-[11px] text-neutral-400">
            Your bag is saved — it will still be here after you sign in.
          </p>
        </div>
      </div>
    );
  }

  if (itemsToCheckout.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center space-y-4 py-16">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="font-sans text-2xl font-bold text-neutral-900">Your bag is empty</h1>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            You don't have any items to checkout. Explore our latest arrivals to continue shopping.
          </p>
          <div className="pt-2">
            <Link
              to="/new-arrivals"
              className="inline-block px-6 py-2.5 bg-[#5A1827] text-white text-xs font-semibold rounded-lg hover:bg-[#43121D] transition-colors"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased">
      <SEO
        title="Checkout | OCT9 Luxury Ethnic Wear"
        description="Complete your order securely at OCT9. Authentic designer suits, sarees, and complimentary pan-India shipping."
        noindex={true}
      />

      {/* Main Checkout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* LEFT COLUMN: Checkout Form (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Breadcrumb Steps */}
              <nav className="flex items-center space-x-2 text-xs text-neutral-400 font-medium">
                <Link to="/cart" className="text-neutral-700 hover:text-neutral-900">Bag</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-neutral-900 font-semibold">Information & Shipping</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Payment</span>
              </nav>

              {/* Section 1: Contact Information */}
              <section className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <h2 className="text-base font-bold text-neutral-900">1. Contact Information</h2>
                  {!isAuthenticated ? (
                    <div className="text-xs text-neutral-500">
                      Already have an account?{' '}
                      <Link to="/login" className="text-[#5A1827] font-semibold hover:underline">
                        Sign In
                      </Link>
                    </div>
                  ) : (
                    <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      Profile Connected
                    </span>
                  )}
                </div>

                {isAuthenticated && user && (
                  <div className="bg-[#FAF7F2] p-2.5 rounded-sm border border-[#E8DCCF] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span className="text-neutral-700">
                        Logged in as <strong className="text-neutral-900">{user.name || 'Account User'}</strong> ({user.email})
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium hidden sm:inline">Prefilled from your profile</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@example.com"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-neutral-300 rounded-md bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">Order receipt and invoice will be sent here.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Mobile Phone (for Delivery SMS) *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        required
                        maxLength={10}
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile number"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-neutral-300 rounded-md bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">Required for Shiprocket courier OTP verification.</p>
                  </div>
                </div>
              </section>

              {/* Section 2: Delivery Address */}
              <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <h2 className="text-base font-bold text-neutral-900">2. Shipping Address</h2>
                  <span className="text-[11px] text-neutral-500">Domestic Standard Delivery</span>
                </div>

                {/* Saved Addresses from User Profile */}
                {user?.addresses && user.addresses.length > 0 && (
                  <div className="p-3 bg-white border border-neutral-200 rounded-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">Saved Addresses from Your Profile</span>
                      <span className="text-[11px] text-neutral-500">{user.addresses.length} saved</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {user.addresses.map((addr) => {
                        const isSelected = formData.address_line1 === addr.address_line1 && formData.pincode === addr.pincode;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              const nameParts = (addr.name || user.name || '').trim().split(' ');
                              setFormData(prev => ({
                                ...prev,
                                firstName: nameParts[0] || prev.firstName,
                                lastName: nameParts.slice(1).join(' ') || prev.lastName,
                                phone: addr.phone || user.phone || prev.phone,
                                address_line1: addr.address_line1 || '',
                                address_line2: addr.address_line2 || '',
                                city: addr.city || '',
                                state: addr.state || '',
                                pincode: addr.pincode || ''
                              }));
                            }}
                            className={`p-2.5 rounded-sm text-left border text-xs transition-colors cursor-pointer ${isSelected
                                ? 'border-[#5A1827] bg-[#5A1827]/5 font-semibold text-neutral-900'
                                : 'border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100 text-neutral-700'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-800">
                                {addr.type || 'Address'} {addr.is_default ? '★ Default' : ''}
                              </span>
                              {isSelected && <span className="text-[10px] text-[#5A1827] font-bold">Selected</span>}
                            </div>
                            <p className="truncate text-xs text-neutral-800 mt-0.5">{addr.address_line1}</p>
                            <p className="text-[11px] text-neutral-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Map-based Address Picker for Customers */}
                <div className="p-3 bg-[#FAF7F2] border border-[#E8DCCF] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#5A1827] shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">Locate Your Address on Map</span>
                      <span className="text-[11px] text-neutral-600">
                        Tap map or use GPS to auto-fill street, area, city & PIN code in text. All text fields remain <strong>changeable</strong>.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(!showMapPicker)}
                    className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-sm cursor-pointer transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#5A1827]" />
                    <span>{showMapPicker ? 'Close Map' : 'Pick Address on Map'}</span>
                  </button>
                </div>

                {/* Inline User Map Picker */}
                {showMapPicker && (
                  <UserMapAddressPicker
                    initialPincode={formData.pincode}
                    initialCity={formData.city}
                    onSelectAddress={(resolved) => {
                      setFormData(prev => ({
                        ...prev,
                        address_line1: resolved.address_line1 || prev.address_line1,
                        address_line2: resolved.address_line2 || prev.address_line2,
                        city: resolved.city || prev.city,
                        state: resolved.state || prev.state,
                        pincode: resolved.pincode || prev.pincode
                      }));
                      setShowMapPicker(false);
                    }}
                    onClose={() => setShowMapPicker(false)}
                  />
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First name"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-neutral-300 rounded-md bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last name"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-neutral-300 rounded-md bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Flat / House No. / Building / Street Address *
                    </label>
                    <input
                      type="text"
                      name="address_line1"
                      required
                      value={formData.address_line1}
                      onChange={handleInputChange}
                      placeholder="e.g. Flat 402, Royal Palms, Main Road"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-neutral-300 rounded-md bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Apartment, Suite, Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleInputChange}
                      placeholder="e.g. Near City Center Mall"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-neutral-300 rounded-md bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Pincode *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="pincode"
                          required
                          maxLength={6}
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="110001"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-neutral-300 rounded-md bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono transition-colors"
                        />
                        {pincodeLoading && (
                          <Loader2 className="w-3.5 h-3.5 text-neutral-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-neutral-300 rounded-md bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-neutral-300 rounded-md bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Pincode Serviceability Live Feedback */}
                  {pincodeLoading && (
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md text-xs flex items-center space-x-2 text-neutral-600">
                      <Loader2 className="w-4 h-4 text-neutral-500 animate-spin shrink-0" />
                      <span>Checking delivery serviceability for PIN code {formData.pincode}...</span>
                    </div>
                  )}

                  {!pincodeLoading && pincodeStatus.checked && pincodeStatus.serviceable && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs flex items-start space-x-2.5 text-emerald-800 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-semibold text-emerald-900">
                          Delivery Available to {pincodeStatus.info?.city || formData.city}, {pincodeStatus.info?.state || formData.state}
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          Estimated delivery within <strong>{pincodeStatus.info?.delivery_date || '3-5 business days'}</strong> via {pincodeStatus.info?.courier_partner || 'Standard Delivery'}.
                        </p>
                      </div>
                    </div>
                  )}

                  {!pincodeLoading && pincodeStatus.checked && !pincodeStatus.serviceable && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs flex items-start space-x-2.5 text-red-800 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900">Delivery Not Available</p>
                        <p className="text-[11px] text-red-700">
                          {pincodeStatus.message || `Delivery is currently not available to PIN code ${formData.pincode}. Please enter a serviceable delivery address to proceed.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Section 3: Payment Method */}
              <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <h2 className="text-base font-bold text-neutral-900">3. Payment Method</h2>
                  <span className="text-[11px] text-neutral-500">Encrypted & Secure</span>
                </div>

                <div className="border border-neutral-300 rounded-md overflow-hidden bg-white">
                  {/* Razorpay Online Payment */}
                  <div className="p-4 bg-neutral-50/70">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="payment_method"
                          value="razorpay"
                          checked={true}
                          readOnly
                          className="mt-0.5 text-neutral-900 focus:ring-neutral-900"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-neutral-900 block">
                            Online Payment (Razorpay Secure)
                          </span>
                          <span className="text-xs text-neutral-500 block mt-0.5">
                            UPI (Google Pay, PhonePe, Paytm), Credit / Debit Cards, NetBanking, Wallets
                          </span>
                        </div>
                      </div>
                      <CreditCard className="w-5 h-5 text-neutral-600 shrink-0" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Error Message Display */}
              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Direct Purchase Notice */}
              {isBuyNow && (
                <div className="p-3 bg-[#FAF7F2] border border-[#EFE8DC] rounded-sm text-xs text-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>
                    Direct Purchase: You are buying <strong>{buyNowItem.title}</strong> directly.
                    {cart.length > 0 ? (
                      <> Other <strong>{cart.length} {cart.length === 1 ? 'item' : 'items'}</strong> in your shopping bag are saved and not included.</>
                    ) : null}
                  </span>
                  {cart.length > 0 && (
                    <Link to="/cart" className="text-brand-maroon font-bold underline whitespace-nowrap text-right sm:text-left">
                      View Shopping Bag
                    </Link>
                  )}
                </div>
              )}

              {/* Stock Warning Notice */}
              {itemsToCheckout.some(item => item.stock !== undefined && item.stock !== null && (Number(item.stock) <= 0 || item.quantity > Number(item.stock))) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 space-y-1">
                  <p className="font-bold">Cannot Place Order — Stock Exceeded</p>
                  <p className="text-[11px] text-red-700">
                    {isBuyNow
                      ? 'The selected item exceeds available warehouse stock.'
                      : 'One or more items in your order exceed available stock. Please return to your shopping bag to adjust quantities before placing this order.'}
                  </p>
                </div>
              )}



              {/* Submit CTA Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing || (pincodeStatus.checked && !pincodeStatus.serviceable) || itemsToCheckout.some(item => item.stock !== undefined && item.stock !== null && (Number(item.stock) <= 0 || item.quantity > Number(item.stock)))}
                  className={`w-full h-12 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-md shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${(pincodeStatus.checked && !pincodeStatus.serviceable) || itemsToCheckout.some(item => item.stock !== undefined && item.stock !== null && (Number(item.stock) <= 0 || item.quantity > Number(item.stock)))
                      ? 'bg-neutral-400 cursor-not-allowed'
                      : 'bg-[#5A1827] hover:bg-[#43121D] active:scale-98 disabled:bg-neutral-400'
                    }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Processing...</span>
                    </>
                  ) : itemsToCheckout.some(item => item.stock !== undefined && item.stock !== null && (Number(item.stock) <= 0 || item.quantity > Number(item.stock))) ? (
                    <span>Adjust Quantity to Match Stock</span>
                  ) : pincodeStatus.checked && !pincodeStatus.serviceable ? (
                    <span>Delivery Unavailable for PIN {formData.pincode}</span>
                  ) : (
                    <span>
                      Pay ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-neutral-500">
                  {isBuyNow ? (
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          sessionStorage.removeItem('oct9_buy_now_item');
                        } catch (e) { }
                        navigate(-1);
                      }}
                      className="hover:text-neutral-900 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back to Product</span>
                    </button>
                  ) : (
                    <Link to="/cart" className="hover:text-neutral-900 flex items-center gap-1 font-medium">
                      <ArrowLeft className="w-3 h-3" />
                      <span>Return to Bag</span>
                    </Link>
                  )}
                  <span>•</span>
                  <span>7-Day Doorstep Returns</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Order Summary (5 cols) */}
            <div className="lg:col-span-5 bg-neutral-50 border border-neutral-200 rounded-lg p-5 sm:p-6 space-y-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <h2 className="text-base font-bold text-neutral-900">
                  {isBuyNow ? `Direct Purchase (${totalItems} ${totalItems === 1 ? 'Item' : 'Items'})` : `Order Summary (${totalItems} ${totalItems === 1 ? 'Item' : 'Items'})`}
                </h2>
                {isBuyNow && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-maroon bg-brand-maroon/10 px-2 py-0.5 rounded-xs">
                    Buy Now
                  </span>
                )}
              </div>

              {/* Items List */}
              <div className="divide-y divide-neutral-200 max-h-72 overflow-y-auto pr-1 space-y-3">
                {itemsToCheckout.map((item) => (
                  <div key={`${item.product_id}-${item.size}-${item.color}`} className="pt-3 first:pt-0 flex items-center space-x-3 text-xs">
                    <div className="relative w-14 h-18 rounded-md overflow-hidden bg-neutral-200 shrink-0 border border-neutral-300">
                      <img
                        src={formatImageUrl(item.image) || '/oct9-logo.jpg'}
                        alt={item.title}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          if (!e.currentTarget.dataset.retried && item.image && item.image.startsWith('/uploads/')) {
                            e.currentTarget.dataset.retried = 'true';
                            e.currentTarget.src = `https://backend.oct9.in${item.image}`;
                            return;
                          }
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/oct9-logo.jpg';
                        }}
                      />
                      <span className="absolute top-0 right-0 bg-neutral-800 text-white text-[10px] font-bold w-4 h-4 rounded-bl flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="font-semibold text-neutral-900 truncate">{item.title}</p>
                      <p className="text-neutral-500 text-[11px]">Size: {item.size} {item.color && item.color !== 'Standard' ? `| ${item.color}` : ''}</p>
                      {item.stock !== undefined && item.stock !== null && (
                        Number(item.stock) <= 0 ? (
                          <span className="text-[10px] text-red-600 font-bold block">Sold out — remove to checkout</span>
                        ) : item.quantity > Number(item.stock) ? (
                          <span className="text-[10px] text-red-600 font-bold block">Only {item.stock} in stock (ordered: {item.quantity})</span>
                        ) : null
                      )}
                    </div>

                    <div className="text-right font-semibold text-neutral-900 shrink-0 text-xs sm:text-sm">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2 pt-4 border-t border-neutral-200 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between">
                  <span>Standard Delivery Shipping</span>
                  <span className="font-semibold text-neutral-900">₹{shippingFee.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-3 border-t border-neutral-300 flex justify-between items-baseline text-sm sm:text-base font-bold text-neutral-900">
                  <span>Total</span>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl text-neutral-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                    <p className="text-[10px] text-neutral-400 font-normal">All-inclusive pricing</p>
                  </div>
                </div>
              </div>

              {/* Trust Strip */}
              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Verified Security</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Insured Transit</span>
                </span>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
