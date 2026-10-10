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
  ChevronRight,
  ArrowLeft
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
    grandTotal,
    clearCart
  } = useCart();

  const [formData, setFormData] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : '',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : '',
    email: user?.email || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    payment_method: 'razorpay', // 'razorpay' or 'cod'
    notes: '',
    saveInfo: true
  });

  const [shiprocketInfo, setShiprocketInfo] = useState(null);
  const [pincodeStatus, setPincodeStatus] = useState({
    checked: false,
    serviceable: true,
    cod_available: true,
    message: '',
    info: null
  });
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prefill default user address if available
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const def = user.addresses.find(a => a.is_default) || user.addresses[0];
      const nameParts = (user.name || def.name || '').trim().split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: user.phone || def.phone || '',
        address_line1: def.address_line1 || '',
        address_line2: def.address_line2 || '',
        city: def.city || 'New Delhi',
        state: def.state || 'Delhi',
        pincode: def.pincode || '110001',
      }));
    }
  }, [user]);

  // Check Serviceability when pincode or payment method changes
  useEffect(() => {
    const cleanPin = String(formData.pincode || '').trim();
    if (/^\d{6}$/.test(cleanPin)) {
      verifyShiprocketPincode(cleanPin);
    } else if (cleanPin.length > 0 && cleanPin.length < 6) {
      setPincodeStatus({
        checked: false,
        serviceable: false,
        cod_available: false,
        message: 'PIN code must be 6 digits',
        info: null
      });
      setShiprocketInfo(null);
    }
  }, [formData.pincode, formData.payment_method]);

  const verifyShiprocketPincode = async (pin) => {
    setPincodeLoading(true);
    try {
      const res = await api.checkPincode(pin, {
        cod: formData.payment_method === 'cod' ? '1' : '0'
      });
      if (res && res.serviceable) {
        setShiprocketInfo(res);
        setPincodeStatus({
          checked: true,
          serviceable: true,
          cod_available: Boolean(res.cod_available),
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
          cod_available: false,
          message: msg,
          info: null
        });
      }
    } catch (e) {
      setShiprocketInfo(null);
      setPincodeStatus({
        checked: true,
        serviceable: false,
        cod_available: false,
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


  // Main Checkout Submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    const cleanPin = (formData.pincode || '').trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setErrorMsg('Please enter a valid 6-digit Indian postal PIN code.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Mandatory Pre-Payment Delivery Serviceability Verification
      let pinCheck = shiprocketInfo;
      if (!pinCheck || pinCheck.pincode !== cleanPin) {
        try {
          pinCheck = await api.checkPincode(cleanPin, {
            cod: formData.payment_method === 'cod' ? '1' : '0'
          });
          if (pinCheck && pinCheck.serviceable) {
            setShiprocketInfo(pinCheck);
            setPincodeStatus({
              checked: true,
              serviceable: true,
              cod_available: Boolean(pinCheck.cod_available),
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
          cod_available: false,
          message: failMessage,
          info: null
        });
        setIsProcessing(false);
        return;
      }

      // Block COD if COD is not available for this pincode
      if (formData.payment_method === 'cod' && !pinCheck.cod_available) {
        const codFailMsg = `Cash on Delivery (COD) is not available for PIN code ${cleanPin}. Please choose Online Payment (UPI / Cards / NetBanking) to place your order.`;
        setErrorMsg(codFailMsg);
        setIsProcessing(false);
        return;
      }

      const orderPayload = {
        customer_name: fullName || formData.firstName,
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        shipping_address: {
          name: fullName || formData.firstName,
          phone: formData.phone.trim(),
          address_line1: formData.address_line1.trim(),
          address_line2: (formData.address_line2 || '').trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: cleanPin,
        },
        items: cart,
        payment_method: formData.payment_method,
        notes: formData.notes
      };

      const res = await api.createOrder(orderPayload);
      if (!res.success) {
        throw new Error(res.message || 'Failed to initialize order.');
      }

      const createdOrder = res.order;

      // Handle Cash on Delivery
      if (formData.payment_method === 'cod') {
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
        clearCart();
        navigate(`/order-success/${createdOrder.order_number}`);
        return;
      }

      // Handle Razorpay Payment Gateway
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
                try {
                  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                } catch (e) {}
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
            name: fullName || formData.firstName,
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
            setErrorMsg('Payment Failed: ' + (resp.error?.description || 'Transaction cancelled by user'));
            setIsProcessing(false);
          });
          rzp.open();
        } else {
          setErrorMsg('Payment gateway is loading. Please check your internet connection and try again.');
          setIsProcessing(false);
        }
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
            <h1 className="font-serif text-2xl font-bold text-neutral-900">Sign In to Checkout</h1>
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

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center space-y-4 py-16">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900">Your bag is empty</h1>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            You don't have any items in your bag to checkout. Explore our latest arrivals to continue shopping.
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

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased">
      <SEO title="Checkout | OCT9 Luxury Ethnic Wear" />

      {/* Top Header Bar */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <img src="/oct9-logo.jpg" alt="OCT9" className="h-8 w-auto rounded object-contain border border-neutral-200" />
            <span className="font-bold text-lg tracking-tight text-neutral-900">OCT9</span>
          </Link>

          <div className="flex items-center space-x-2 text-xs text-neutral-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline font-medium">256-Bit SSL Encrypted Checkout</span>
            <span className="sm:hidden font-medium">Secure</span>
          </div>
        </div>
      </header>

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
                  {!isAuthenticated && (
                    <div className="text-xs text-neutral-500">
                      Already have an account?{' '}
                      <Link to="/login" className="text-[#5A1827] font-semibold hover:underline">
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>

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
                  <span className="text-[11px] text-neutral-500">Domestic Express India</span>
                </div>

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
                          Estimated delivery within <strong>{pincodeStatus.info?.delivery_date || '2-4 business days'}</strong> via {pincodeStatus.info?.courier_partner || 'Express Courier'}.
                        </p>
                        {formData.payment_method === 'cod' && !pincodeStatus.cod_available && (
                          <p className="text-[11px] text-amber-800 font-semibold pt-1">
                            ⚠ Cash on Delivery (COD) is not available for this PIN code. Please choose Online Payment.
                          </p>
                        )}
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

              {/* Section 3: Shipping Method */}
              <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <h2 className="text-base font-bold text-neutral-900">3. Shipping Method</h2>
                </div>

                <div className="border border-neutral-300 rounded-md divide-y divide-neutral-200 overflow-hidden bg-white">
                  <div className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full border-4 border-neutral-900 bg-white" />
                      <div>
                        <span className="font-semibold text-neutral-900">Express Air Delivery (Shiprocket Priority)</span>
                        <p className="text-xs text-neutral-500">Fully insured transit with live SMS tracking</p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900">
                      {shippingFee === 0 ? <strong className="text-emerald-700 uppercase">FREE</strong> : `₹${shippingFee}`}
                    </span>
                  </div>
                </div>
              </section>

              {/* Section 4: Payment Method */}
              <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <h2 className="text-base font-bold text-neutral-900">4. Payment Method</h2>
                  <span className="text-[11px] text-neutral-500">Encrypted & Secure</span>
                </div>

                <div className="border border-neutral-300 rounded-md divide-y divide-neutral-200 overflow-hidden bg-white">
                  {/* Option A: Razorpay Online Payment */}
                  <label
                    className={`block p-4 cursor-pointer transition-colors ${
                      formData.payment_method === 'razorpay' ? 'bg-neutral-50/70' : 'hover:bg-neutral-50/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="payment_method"
                          value="razorpay"
                          checked={formData.payment_method === 'razorpay'}
                          onChange={handleInputChange}
                          className="mt-0.5 text-neutral-900 focus:ring-neutral-900"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-neutral-900 block">
                            Online Payment (Razorpay Secure)
                          </span>
                          <span className="text-xs text-neutral-500 block mt-0.5">
                            UPI (Google Pay, PhonePe, Paytm), Credit / Debit Cards, NetBanking
                          </span>
                        </div>
                      </div>
                      <CreditCard className="w-5 h-5 text-neutral-600 shrink-0" />
                    </div>
                  </label>

                  {/* Option B: Cash on Delivery */}
                  <label
                    className={`block p-4 cursor-pointer transition-colors ${
                      formData.payment_method === 'cod' ? 'bg-neutral-50/70' : 'hover:bg-neutral-50/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="payment_method"
                          value="cod"
                          checked={formData.payment_method === 'cod'}
                          onChange={handleInputChange}
                          className="mt-0.5 text-neutral-900 focus:ring-neutral-900"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-neutral-900 block">
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-xs text-neutral-500 block mt-0.5">
                            Pay upon doorstep delivery
                          </span>
                          {pincodeStatus.checked && !pincodeStatus.cod_available && (
                            <span className="text-[11px] font-semibold text-amber-700 block mt-1">
                              ⚠ Not available for PIN {formData.pincode}. Choose Online Payment.
                            </span>
                          )}
                        </div>
                      </div>
                      <Banknote className="w-5 h-5 text-neutral-600 shrink-0" />
                    </div>
                  </label>
                </div>
              </section>

              {/* Error Message Display */}
              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit CTA Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessing || (pincodeStatus.checked && !pincodeStatus.serviceable)}
                  className={`w-full h-12 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-md shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    pincodeStatus.checked && !pincodeStatus.serviceable
                      ? 'bg-neutral-400 cursor-not-allowed'
                      : 'bg-[#5A1827] hover:bg-[#43121D] active:scale-98 disabled:bg-neutral-400'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Processing...</span>
                    </>
                  ) : pincodeStatus.checked && !pincodeStatus.serviceable ? (
                    <span>Delivery Unavailable for PIN {formData.pincode}</span>
                  ) : (
                    <span>
                      {formData.payment_method === 'razorpay'
                        ? `Pay ₹${grandTotal.toLocaleString('en-IN')}`
                        : `Place Order (Cash on Delivery)`}
                    </span>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-neutral-500">
                  <Link to="/cart" className="hover:text-neutral-900 flex items-center gap-1 font-medium">
                    <ArrowLeft className="w-3 h-3" />
                    <span>Return to Bag</span>
                  </Link>
                  <span>•</span>
                  <span>7-Day Doorstep Returns</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Order Summary (5 cols) */}
            <div className="lg:col-span-5 bg-neutral-50 border border-neutral-200 rounded-lg p-5 sm:p-6 space-y-6 lg:sticky lg:top-24">
              <h2 className="text-base font-bold text-neutral-900 pb-3 border-b border-neutral-200">
                Order Summary ({totalItems} {totalItems === 1 ? 'Item' : 'Items'})
              </h2>

              {/* Items List */}
              <div className="divide-y divide-neutral-200 max-h-72 overflow-y-auto pr-1 space-y-3">
                {cart.map((item) => (
                  <div key={`${item.product_id}-${item.size}-${item.color}`} className="pt-3 first:pt-0 flex items-center space-x-3 text-xs">
                    <div className="relative w-14 h-18 rounded-md overflow-hidden bg-neutral-200 shrink-0 border border-neutral-300">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover object-top" />
                      <span className="absolute top-0 right-0 bg-neutral-800 text-white text-[10px] font-bold w-4 h-4 rounded-bl flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="font-semibold text-neutral-900 truncate">{item.title}</p>
                      <p className="text-neutral-500 text-[11px]">Size: {item.size} {item.color && item.color !== 'Standard' ? `| ${item.color}` : ''}</p>
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
                  <span>Shipping</span>
                  <span className="text-emerald-700 font-bold uppercase text-[11px]">FREE Express Delivery</span>
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
